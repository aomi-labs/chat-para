import type { NextConfig } from "next";
import { createRequire } from "module";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const emptyModulePath = resolve(__dirname, "empty-module.js");
const nobleHashesAssertCompatPath = resolve(__dirname, "noble-hashes-assert-compat.js");
const widgetRoot = process.env.AOMI_WIDGET_ROOT;
const localWidgetPath =
  process.env.AOMI_WIDGET_PATH ||
  (widgetRoot ? resolve(widgetRoot, "apps/registry/src/index.ts") : undefined);
const localReactPath =
  process.env.AOMI_REACT_PATH ||
  (widgetRoot ? resolve(widgetRoot, "packages/react/src/index.ts") : undefined);
const localWidgetSrcPath = widgetRoot
  ? resolve(widgetRoot, "apps/registry/src")
  : undefined;
const shouldUseLocalWidget = Boolean(localWidgetPath || localReactPath);

// Extract chain IDs from providers.toml so the frontend stays in sync with the backend
const getProviderChainIds = (): string | undefined => {
  try {
    const toml = readFileSync(resolve(__dirname, "../providers.toml"), "utf-8");
    const ids = [...toml.matchAll(/chain_id\s*=\s*(\d+)/g)].map((m) => m[1]);
    return ids.length > 0 ? ids.join(",") : undefined;
  } catch {
    return undefined;
  }
};

// Resolve @aomi-labs/react - only needed for local widget development
// When using npm packages, let webpack resolve normally
const aomiReactPath = localReactPath || undefined;

// Find the widget src path - either local or from node_modules
const getWidgetSrcPath = (): string | undefined => {
  if (localWidgetSrcPath) return localWidgetSrcPath;
  try {
    const widgetMain = require.resolve("@aomi-labs/widget-lib");
    return dirname(widgetMain);
  } catch {
    return undefined;
  }
};
const widgetSrcPath = getWidgetSrcPath();

// Shared dependencies that must be deduplicated when using local widget.
// Without these aliases, the local widget source resolves imports from its own
// node_modules, creating duplicate React contexts / module instances.
const sharedDeps: Record<string, string> = shouldUseLocalWidget
  ? {
      // NOTE: Do NOT alias react/react-dom here — Next.js patches React
      // internally (e.g. React.cache for server components) and a raw alias
      // would override that patched version, breaking SSR.
      "@assistant-ui/react": resolve(
        __dirname,
        "node_modules/@assistant-ui/react",
      ),
      wagmi: resolve(__dirname, "node_modules/wagmi"),
      viem: resolve(__dirname, "node_modules/viem"),
      "@tanstack/react-query": resolve(
        __dirname,
        "node_modules/@tanstack/react-query",
      ),
      zustand: resolve(__dirname, "node_modules/zustand"),
    }
  : {};

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND_URL:
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.BACKEND_URL ||
      "http://localhost:8080",
    NEXT_PUBLIC_AOMI_BACKEND_API_KEY:
      process.env.NEXT_PUBLIC_AOMI_BACKEND_API_KEY || "",
    NEXT_PUBLIC_ANVIL_URL:
      process.env.NEXT_PUBLIC_ANVIL_URL ||
      process.env.ANVIL_URL ||
      "http://127.0.0.1:8545",
    NEXT_PUBLIC_SUPPORTED_CHAIN_IDS:
      process.env.NEXT_PUBLIC_SUPPORTED_CHAIN_IDS ||
      getProviderChainIds() ||
      "",
  },

  output: "standalone",

  images: {
    unoptimized: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  transpilePackages: [
    "@getpara/react-sdk",
    // widget-lib exports raw TypeScript, needs transpilation
    "@aomi-labs/widget-lib",
    // react is pre-compiled, only transpile if using local source
    ...(localReactPath ? ["@aomi-labs/react"] : []),
  ],

  turbopack: {
    resolveAlias: {
      // Turbopack treats bare strings as module specifiers; use relative
      // paths from the project root so it resolves them as files.
      "@noble/hashes/_assert": "./noble-hashes-assert-compat.js",
      "pino-pretty": "./empty-module.js",
      "@farcaster/miniapp-sdk": "./empty-module.js",
      "@farcaster/mini-app-solana": "./empty-module.js",
      "@farcaster/miniapp-wagmi-connector": "./empty-module.js",
      ...(localWidgetPath ? { "@aomi-labs/widget-lib": localWidgetPath } : {}),
      ...(aomiReactPath ? { "@aomi-labs/react": aomiReactPath } : {}),
      ...sharedDeps,
    },
  },

  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@noble/hashes/_assert": nobleHashesAssertCompatPath,
      "pino-pretty": false,
      "@farcaster/miniapp-sdk": false,
      "@farcaster/mini-app-solana": false,
      "@farcaster/miniapp-wagmi-connector": false,
      ...(localWidgetPath ? { "@aomi-labs/widget-lib": localWidgetPath } : {}),
      ...(aomiReactPath ? { "@aomi-labs/react": aomiReactPath } : {}),
      ...sharedDeps,
    };

    // Resolve @/ path aliases in @aomi-labs packages
    if (widgetSrcPath) {
      config.resolve.plugins = config.resolve.plugins ?? [];
      config.resolve.plugins.push({
        apply(resolver: {
          getHook: (name: string) => {
            tapAsync: (
              name: string,
              callback: (
                request: { request?: string; path?: string },
                resolveContext: unknown,
                callback: (err?: Error | null, result?: unknown) => void,
              ) => void,
            ) => void;
          };
          doResolve: (
            hook: unknown,
            request: unknown,
            message: string,
            resolveContext: unknown,
            callback: (err?: Error | null, result?: unknown) => void,
          ) => void;
        }) {
          const target = resolver.getHook("resolve");
          resolver
            .getHook("described-resolve")
            .tapAsync(
              "WidgetAliasPlugin",
              (
                request: { request?: string; path?: string },
                resolveContext: unknown,
                callback: (err?: Error | null, result?: unknown) => void,
              ) => {
                const innerRequest = request.request;
                if (!innerRequest?.startsWith("@/")) {
                  return callback();
                }

                const issuer = request.path ?? "";
                const isFromWidget =
                  issuer.includes("@aomi-labs/widget-lib") ||
                  issuer.includes("@aomi-labs+widget-lib") ||
                  (localWidgetSrcPath && issuer.includes(localWidgetSrcPath));

                if (!isFromWidget) {
                  return callback();
                }

                const newRequest = innerRequest.replace(
                  /^@\//,
                  `${widgetSrcPath}/`,
                );
                resolver.doResolve(
                  target,
                  { ...request, request: newRequest },
                  `Aliased @/ to widget src`,
                  resolveContext,
                  callback,
                );
              },
            );
        },
      });
    }

    return config;
  },
};

export default nextConfig;

import { createRequire } from "module";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const nobleHashesAssertCompatPath = resolve(
  __dirname,
  "noble-hashes-assert-compat.js",
);
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
const defaultAllowedDevOrigins = [
  "*.ngrok-free.dev",
  "*.ngrok.app",
  "*.ngrok.io",
];
const envAllowedDevOrigins = (process.env.ALLOWED_DEV_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const backendProxyTarget = (
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://api.aomi.dev"
).replace(/\/+$/, "");

const getProviderChainIds = () => {
  try {
    const toml = readFileSync(resolve(__dirname, "../providers.toml"), "utf-8");
    const ids = [...toml.matchAll(/chain_id\s*=\s*(\d+)/g)].map((m) => m[1]);
    return ids.length > 0 ? ids.join(",") : undefined;
  } catch {
    return undefined;
  }
};

const aomiReactPath = localReactPath || undefined;

const getWidgetSrcPath = () => {
  if (localWidgetSrcPath) return localWidgetSrcPath;
  try {
    const widgetMain = require.resolve("@aomi-labs/widget-lib");
    return dirname(widgetMain);
  } catch {
    return undefined;
  }
};
const widgetSrcPath = getWidgetSrcPath();

const sharedDeps = shouldUseLocalWidget
  ? {
      // Do not alias react/react-dom here; Next patches React internally.
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

/** @type {import("next").NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    ...new Set([...defaultAllowedDevOrigins, ...envAllowedDevOrigins]),
  ],

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendProxyTarget}/api/:path*`,
      },
    ];
  },

  env: {
    NEXT_PUBLIC_BACKEND_URL:
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.BACKEND_URL ||
      "http://localhost:8080",
    NEXT_PUBLIC_AOMI_PARA_DEV_API_KEY:
      process.env.NEXT_PUBLIC_AOMI_PARA_DEV_API_KEY || "",
    NEXT_PUBLIC_AOMI_PARA_MAIN_API_KEY:
      process.env.NEXT_PUBLIC_AOMI_PARA_MAIN_API_KEY || "",
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

  typescript: {
    ignoreBuildErrors: true,
  },

  transpilePackages: [
    "@getpara/react-sdk",
    "@aomi-labs/widget-lib",
    ...(localReactPath ? ["@aomi-labs/react"] : []),
  ],

  turbopack: {
    resolveAlias: {
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

    if (widgetSrcPath) {
      config.resolve.plugins = config.resolve.plugins ?? [];
      config.resolve.plugins.push({
        apply(resolver) {
          const target = resolver.getHook("resolve");
          resolver.getHook("described-resolve").tapAsync(
            "WidgetAliasPlugin",
            (request, resolveContext, callback) => {
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
                "Aliased @/ to widget src",
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

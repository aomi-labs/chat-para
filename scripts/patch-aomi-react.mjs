import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, "..");

const targets = [
  resolve(root, "node_modules/@aomi-labs/react/dist/index.js"),
  resolve(root, "node_modules/@aomi-labs/react/dist/index.cjs"),
];

const replacements = [
  {
    from: `      const existing = manager.get(threadId);
      if (existing) return existing;
      const session = manager.getOrCreate(threadId, {
        app: options.getApp(),
        publicKey: (_a = options.getPublicKey) == null ? void 0 : _a.call(options),
        apiKey: (_c = (_b = options.getApiKey) == null ? void 0 : _b.call(options)) != null ? _c : void 0,
        clientId: (_d = options.getClientId) == null ? void 0 : _d.call(options),
        userState: (_e = options.getUserState) == null ? void 0 : _e.call(options)
      });`,
    to: `      const nextApp = options.getApp();
      const nextPublicKey = (_a = options.getPublicKey) == null ? void 0 : _a.call(options);
      const nextApiKey = (_c = (_b = options.getApiKey) == null ? void 0 : _b.call(options)) != null ? _c : void 0;
      const nextClientId = (_d = options.getClientId) == null ? void 0 : _d.call(options);
      const nextUserState = (_e = options.getUserState) == null ? void 0 : _e.call(options);
      const existing = manager.get(threadId);
      if (existing) {
        existing.app = nextApp;
        existing.publicKey = nextPublicKey;
        existing.apiKey = nextApiKey;
        existing.clientId = nextClientId != null ? nextClientId : existing.clientId;
        if (nextUserState) existing.resolveUserState(nextUserState);
        return existing;
      }
      const session = manager.getOrCreate(threadId, {
        app: nextApp,
        publicKey: nextPublicKey,
        apiKey: nextApiKey,
        clientId: nextClientId,
        userState: nextUserState
      });`,
    required: true,
  },
];

for (const target of targets) {
  if (!existsSync(target)) {
    continue;
  }

  let content = readFileSync(target, "utf8");
  let changed = false;

  for (const { from, to, required } of replacements) {
    if (content.includes(to)) {
      continue;
    }
    if (!content.includes(from)) {
      if (required) {
        throw new Error(`Expected snippet not found in ${target}`);
      }
      continue;
    }
    content = content.replace(from, to);
    changed = true;
  }

  if (changed) {
    writeFileSync(target, content);
  }
}

import { readFileSync, writeFileSync } from "node:fs";
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
    from: ['new URL("/api/control/namespaces", this.backendUrl);'],
    to: 'new URL("/api/control/applications", this.backendUrl);',
  },
  {
    from: ['console.log("[BackendApi.getNamespaces]", {'],
    to: 'console.log("[BackendApi.getApplications]", {',
  },
  {
    from: ["throw new Error(`Failed to get namespaces: HTTP ${response.status}`);"],
    to: "throw new Error(`Failed to get applications: HTTP ${response.status}`);",
  },
  {
    from: [
      'var SESSION_ID_HEADER = "X-Session-Id";\nvar API_KEY_HEADER = "X-API-Key";',
      'var SESSION_ID_HEADER = "X-Session-Id";\nvar API_KEY_HEADER = "X-API-Key";\nvar PARA_API_KEY_HEADER = "X-Para-Api-Key";\nvar HARDCODED_AOMI_API_KEY = "aomi-367d09b8074a58b2cf2f1690ea2e68df";\nfunction readRuntimeString(name) {\n  var _a;\n  const value = (_a = globalThis == null ? void 0 : globalThis[name]) != null ? _a : null;\n  return typeof value === "string" && value.trim() ? value.trim() : null;\n}\nfunction getRequestApiKey() {\n  return readRuntimeString("__AOMI_REQUEST_API_KEY__") || HARDCODED_AOMI_API_KEY;\n}\nfunction getParaApiKey() {\n  return readRuntimeString("__AOMI_PARA_API_KEY__");\n}',
      'var SESSION_ID_HEADER = "X-Session-Id";\nvar API_KEY_HEADER = "X-API-Key";\nvar HARDCODED_AOMI_API_KEY = "aomi-367d09b8074a58b2cf2f1690ea2e68df";\nfunction readRuntimeString(name) {\n  var _a;\n  const value = (_a = globalThis == null ? void 0 : globalThis[name]) != null ? _a : null;\n  return typeof value === "string" && value.trim() ? value.trim() : null;\n}\nfunction getRequestApiKey() {\n  return readRuntimeString("__AOMI_REQUEST_API_KEY__") || HARDCODED_AOMI_API_KEY;\n}',
    ],
    to: 'var SESSION_ID_HEADER = "X-Session-Id";\nvar API_KEY_HEADER = "X-API-Key";\nfunction readRuntimeString(name) {\n  var _a;\n  const value = (_a = globalThis == null ? void 0 : globalThis[name]) != null ? _a : null;\n  return typeof value === "string" && value.trim() ? value.trim() : null;\n}\nfunction getRequestApiKey() {\n  return readRuntimeString("__AOMI_REQUEST_API_KEY__");\n}',
  },
  {
    from: [
      "async function postState(backendUrl, path, payload, sessionId, apiKey) {\n  const query = toQueryString(payload);\n  const url = `${backendUrl}${path}${query}`;\n  const headers = new Headers(withSessionHeader(sessionId));\n  if (apiKey) {\n    headers.set(API_KEY_HEADER, apiKey);\n  }\n  const response = await fetch(url, {\n    method: \"POST\",\n    headers\n  });",
      "async function postState(backendUrl, path, payload, sessionId, _apiKey, extraHeaders) {\n  const query = toQueryString(payload);\n  const url = `${backendUrl}${path}${query}`;\n  const headers = new Headers(withSessionHeader(sessionId));\n  const requestApiKey = getRequestApiKey();\n  if (requestApiKey) {\n    headers.set(API_KEY_HEADER, requestApiKey);\n  }\n  if (extraHeaders) {\n    for (const [key, value] of extraHeaders.entries()) {\n      headers.set(key, value);\n    }\n  }\n  const response = await fetch(url, {\n    method: \"POST\",\n    headers\n  });",
    ],
    to: "async function postState(backendUrl, path, payload, sessionId, _apiKey) {\n  const query = toQueryString(payload);\n  const url = `${backendUrl}${path}${query}`;\n  const headers = new Headers(withSessionHeader(sessionId));\n  const requestApiKey = getRequestApiKey();\n  if (requestApiKey) {\n    headers.set(API_KEY_HEADER, requestApiKey);\n  }\n  const response = await fetch(url, {\n    method: \"POST\",\n    headers\n  });",
  },
  {
    from: [
      "  async postChatMessage(sessionId, message, namespace, publicKey, apiKey, userState) {\n    const payload = { message, namespace };\n    if (publicKey) {\n      payload.public_key = publicKey;\n    }\n    if (userState) {\n      payload.user_state = JSON.stringify(userState);\n    }\n    const extraHeaders = new Headers();\n    const paraApiKey = getParaApiKey();\n    if (paraApiKey) {\n      extraHeaders.set(PARA_API_KEY_HEADER, paraApiKey);\n    }\n    return postState(\n      this.backendUrl,\n      \"/api/chat\",\n      payload,\n      sessionId,\n      apiKey,\n      extraHeaders\n    );\n  }",
    ],
    to: "  async postChatMessage(sessionId, message, namespace, publicKey, apiKey, userState) {\n    const payload = { message, namespace };\n    if (publicKey) {\n      payload.public_key = publicKey;\n    }\n    if (userState) {\n      payload.user_state = JSON.stringify(userState);\n    }\n    return postState(\n      this.backendUrl,\n      \"/api/chat\",\n      payload,\n      sessionId,\n      apiKey\n    );\n  }",
  },
  {
    from: [
      "    const headers = new Headers(withSessionHeader(sessionId));\n    if (apiKey) {\n      headers.set(API_KEY_HEADER, apiKey);\n    }\n    const response = await fetch(url.toString(), { headers });",
    ],
    to: "    const headers = new Headers(withSessionHeader(sessionId));\n    const requestApiKey = getRequestApiKey();\n    if (requestApiKey) {\n      headers.set(API_KEY_HEADER, requestApiKey);\n    }\n    const response = await fetch(url.toString(), { headers });",
  },
];

const legacyParaHeaderBlock =
  /var PARA_API_KEY_HEADER = "X-Para-Api-Key";\nvar HARDCODED_AOMI_API_KEY = "aomi-367d09b8074a58b2cf2f1690ea2e68df";\nfunction readRuntimeString\(name\) {\n  var _a;\n  const value = \(_a = globalThis == null \? void 0 : globalThis\[name\]\) != null \? _a : null;\n  return typeof value === "string" && value.trim\(\) \? value.trim\(\) : null;\n}\nfunction getRequestApiKey\(\) {\n  return readRuntimeString\("__AOMI_REQUEST_API_KEY__"\) \|\| HARDCODED_AOMI_API_KEY;\n}\nfunction getParaApiKey\(\) {\n  return readRuntimeString\("__AOMI_PARA_API_KEY__"\);\n}\n/g;
const legacyHardcodedBlock =
  'var HARDCODED_AOMI_API_KEY = "aomi-367d09b8074a58b2cf2f1690ea2e68df";\nfunction readRuntimeString(name) {\n  var _a;\n  const value = (_a = globalThis == null ? void 0 : globalThis[name]) != null ? _a : null;\n  return typeof value === "string" && value.trim() ? value.trim() : null;\n}\nfunction getRequestApiKey() {\n  return readRuntimeString("__AOMI_REQUEST_API_KEY__") || HARDCODED_AOMI_API_KEY;\n}\n';

for (const target of targets) {
  let content = readFileSync(target, "utf8");
  let changed = false;

  for (const { from, to } of replacements) {
    if (content.includes(to)) {
      continue;
    }

    const source = from.find((candidate) => content.includes(candidate));
    if (!source) {
      throw new Error(`Expected snippet not found in ${target}: ${to}`);
    }

    content = content.replace(source, to);
    changed = true;
  }

  const normalizedContent = content.replace(legacyParaHeaderBlock, "");
  let fullyNormalizedContent = normalizedContent;
  while (fullyNormalizedContent.includes(legacyHardcodedBlock)) {
    fullyNormalizedContent = fullyNormalizedContent.replace(legacyHardcodedBlock, "");
  }
  if (fullyNormalizedContent !== content) {
    content = fullyNormalizedContent;
    changed = true;
  }

  if (changed) {
    writeFileSync(target, content);
  }
}

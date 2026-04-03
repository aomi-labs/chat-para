import test from "node:test";
import assert from "node:assert/strict";

test("hasParaAuthorization matches para case-insensitively", () => {
  const moduleUrl = new URL("./para-auth.ts", import.meta.url);
  return import(moduleUrl.href).then(({ hasParaAuthorization }) => {
    assert.equal(hasParaAuthorization(["default", "PARA"]), true);
    assert.equal(hasParaAuthorization(["default", "consumer"]), false);
  });
});

import assert from "node:assert/strict";
import {
  createUniversalDialectRegistry,
  frontierLangDialects
} from "../dist/index.js";

const dialectRegistry = createUniversalDialectRegistry({
  language: "typescript",
  dialects: [{ dialect: "node.runtime", constructKind: "runtime", name: "process.env" }]
});
assert.equal(dialectRegistry.summary.dialects, 1);
assert.equal(frontierLangDialects.createUniversalDialectRegistry, createUniversalDialectRegistry);

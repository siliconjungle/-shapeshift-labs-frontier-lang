import assert from "node:assert/strict";
import {
  applySemanticPatch,
  checkDocument,
  classifyMerge,
  createPatch,
  emitTypeScript,
  hashDocumentBase,
  parseFrontierSource
} from "../dist/index.js";

const source = `
module TodoApp @id("mod_todo")

entity Todo @id("ent_todo") {
  title @id("field_title"): Text {
    merge conflict
  }
  tags @id("field_tags"): Set<Text> {
    merge union law semilattice
  }
}

state TodoDb @id("state_todo") {
  todos @id("collection_todos"): Map<TodoId, Todo> {
    merge byKey law commutative
  }
}

effect Clock @id("effect_clock") {
  capability Clock
}

action addTodo @id("action_add_todo") {
  input { title: Text }
  reads field_title
  writes field_tags
  uses Clock
  returns Patch
}
`;

const document = parseFrontierSource(source);
assert.equal(document.id, "mod_todo");
assert.equal(checkDocument(document, { strictEffects: true }).ok, true);

const baseHash = hashDocumentBase(document);
const rename = createPatch({
  id: "patch_rename",
  baseHash,
  operations: [{ op: "renameNode", id: "action_add_todo", name: "createTodo" }]
});
assert.equal(applySemanticPatch(document, rename).nodes.action_add_todo.name, "createTodo");

const left = createPatch({
  id: "patch_left",
  baseHash,
  operations: [
    {
      op: "addEvidence",
      evidence: { id: "left", kind: "test", status: "passed" },
      touches: [{ id: "field_tags", access: "write" }]
    }
  ]
});
const right = createPatch({
  id: "patch_right",
  baseHash,
  operations: [
    {
      op: "addEvidence",
      evidence: { id: "right", kind: "test", status: "passed" },
      touches: [{ id: "field_tags", access: "write" }]
    }
  ]
});
assert.equal(classifyMerge(document, left, right).status, "safe-by-merge-law");

const emitted = emitTypeScript(document);
assert.match(emitted, /export interface Todo/);
assert.match(emitted, /export function addTodo/);

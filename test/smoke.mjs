import assert from "node:assert/strict";
import {
  applySemanticPatch,
  checkDocument,
  classifyMerge,
  compileFrontierSource,
  createPatch,
  emitCHeader,
  emitJavaScript,
  emitPython,
  emitRust,
  emitTypeScript,
  hashDocumentBase,
  importNativeSource,
  parseFrontierSource,
  projectFrontierAst,
  renderTargetAst,
  toTypeScriptAst
} from "../dist/index.js";

const source = `
module TodoApp @id("mod_todo")

type TodoId @id("type_todo_id") {
  = Text
}

type TodoInput @id("type_todo_input") {
  title: Text
}

lattice TagSet @id("lat_tag_set") {
  carrier Set<Text>
  laws semilattice, commutative
  frontierCrdt createCrdtOrSetLattice
}

entity Todo @id("ent_todo") {
  title @id("field_title"): Text {
    merge conflict
  }
  tags @id("field_tags"): Set<Text> {
    merge union lattice lat_tag_set crdt or-set
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
  input TodoInput
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
const tsAst = toTypeScriptAst(document);
assert.equal(tsAst.kind, "typescript.module");
assert.equal(renderTargetAst(projectFrontierAst(document, "typescript"), "typescript"), emitted);
assert.match(emitted, /export interface Todo/);
assert.match(emitted, /export interface TodoInput/);
assert.match(emitted, /export const TagSetLattice/);
assert.match(emitted, /export function addTodo/);
assert.match(emitJavaScript(document), /export const TodoSchema/);
assert.match(emitRust(document), /pub struct Todo/);
assert.match(emitPython(document), /class Todo/);
assert.match(emitCHeader(document), /typedef struct Todo/);
assert.match(compileFrontierSource(source, { target: "javascript" }).output, /export const TodoSchema/);
assert.equal(importNativeSource({ language: "python", sourcePath: "todo.py" }).nativeSource.language, "python");

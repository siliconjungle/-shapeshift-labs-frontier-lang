import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as frontierLang from "../dist/index.js";
import {
  actionNode,
  applySemanticPatch,
  classifyMerge,
  createDocument,
  createPatch,
  emitTypeScript,
  entityNode,
  hashDocumentBase,
  replayDocument,
  stateNode,
  validateDocument
} from "../dist/index.js";

const todo = entityNode({
  id: "ent_todo",
  name: "Todo",
  fields: [
    { id: "field_todo_id", name: "id", type: "TodoId", key: true },
    { id: "field_todo_title", name: "title", type: "Text", merge: { kind: "conflict" } },
    {
      id: "field_todo_tags",
      name: "tags",
      type: "Set<Text>",
      merge: { kind: "union", law: "semilattice" }
    }
  ]
});

const state = stateNode({
  id: "state_todo",
  name: "TodoDb",
  collections: [
    {
      id: "collection_todos",
      name: "todos",
      type: "Map<TodoId, Todo>",
      merge: { kind: "byKey", law: "commutative" }
    }
  ]
});

const addTodo = actionNode({
  id: "action_add_todo",
  name: "addTodo",
  input: "{ title: Text }",
  returns: "Patch",
  reads: ["TodoDb.todos"],
  writes: ["TodoDb.todos"],
  uses: ["Clock"]
});

const document = createDocument({
  id: "mod_todo",
  name: "TodoApp",
  nodes: [todo, state, addTodo]
});

assert.deepEqual(validateDocument(document), []);
assert.ok(validateDocument({ ...document, rootIds: [...document.rootIds, "ent_todo"] }).some((issue) => issue.includes("Duplicate root node")));
assert.ok(
  validateDocument({
    ...document,
    nodes: {
      ...document.nodes,
      ent_todo: { ...todo, parentId: "ent_todo" }
    }
  }).some((issue) => issue.includes("own parent"))
);

const baseHash = hashDocumentBase(document);
const rename = createPatch({
  id: "patch_rename_add_todo",
  baseHash,
  operations: [{ op: "renameNode", id: "action_add_todo", name: "createTodo" }],
  evidence: [{ id: "typecheck", kind: "typecheck", status: "passed" }]
});

const renamed = applySemanticPatch(document, rename);
assert.equal(renamed.nodes.action_add_todo?.name, "createTodo");

const replayed = replayDocument(document, [{ id: "event_rename", patch: rename }]);
assert.equal(replayed.nodes.action_add_todo?.name, "createTodo");
assert.equal(replayed.history?.at(-1)?.id, "event_rename");

const left = createPatch({
  id: "patch_left_tags",
  baseHash,
  operations: [
    {
      op: "addEvidence",
      evidence: { id: "left_tags", kind: "test", status: "passed" },
      touches: [{ id: "field_todo_tags", access: "write" }]
    }
  ]
});

const right = createPatch({
  id: "patch_right_tags",
  baseHash,
  operations: [
    {
      op: "addEvidence",
      evidence: { id: "right_tags", kind: "test", status: "passed" },
      touches: [{ id: "field_todo_tags", access: "write" }]
    }
  ]
});

assert.equal(classifyMerge(document, left, right).status, "safe-by-merge-law");

const titleConflict = createPatch({
  id: "patch_title",
  baseHash,
  operations: [
    {
      op: "updateNode",
      id: "ent_todo",
      set: { metadata: { titleChanged: true } },
      touches: [{ id: "field_todo_title", access: "write" }]
    }
  ]
});

assert.equal(classifyMerge(document, titleConflict, titleConflict).status, "safe-by-same-change");
assert.equal(classifyMerge(document, titleConflict, left).status, "safe-by-disjoint-region");

const stalePatch = createPatch({
  id: "patch_stale",
  baseHash: "fnv1a32:00000000",
  operations: [{ op: "renameNode", id: "action_add_todo", name: "staleCreateTodo" }]
});
assert.equal(classifyMerge(document, stalePatch, stalePatch).status, "unknown-needs-review");

const failedEvidencePatch = createPatch({
  id: "patch_failed_evidence",
  baseHash,
  operations: [{ op: "renameNode", id: "action_add_todo", name: "failedCreateTodo" }],
  evidence: [{ id: "typecheck", kind: "typecheck", status: "failed" }]
});
assert.equal(classifyMerge(document, failedEvidencePatch, left).status, "unknown-needs-review");

const nonCommutingLeft = createPatch({
  id: "patch_non_commuting_left",
  baseHash,
  operations: [
    {
      op: "updateNode",
      id: "ent_todo",
      set: { metadata: { left: true } },
      touches: [{ id: "field_todo_tags", access: "write" }]
    }
  ]
});
const nonCommutingRight = createPatch({
  id: "patch_non_commuting_right",
  baseHash,
  operations: [
    {
      op: "updateNode",
      id: "ent_todo",
      set: { metadata: { right: true } },
      touches: [{ id: "field_todo_tags", access: "write" }]
    }
  ]
});
assert.equal(classifyMerge(document, nonCommutingLeft, nonCommutingRight).status, "unknown-needs-review");

const dynamicPatch = createPatch({
  id: "patch_dynamic",
  baseHash,
  operations: [{ op: "updateNode", id: "action_add_todo", set: { uses: ["eval"] } }]
});
assert.equal(classifyMerge(document, dynamicPatch, left).status, "unknown-by-dynamic-effect");

assert.throws(
  () =>
    applySemanticPatch(
      document,
      createPatch({
        id: "patch_bad_identity",
        baseHash,
        operations: [{ op: "updateNode", id: "ent_todo", set: { id: "ent_other" } }]
      })
    ),
  /cannot update semantic node identity/
);

assert.throws(
  () =>
    applySemanticPatch(
      document,
      createPatch({
        id: "patch_bad_target",
        baseHash,
        targetHash: "fnv1a32:00000000",
        operations: [{ op: "renameNode", id: "action_add_todo", name: "badTarget" }]
      })
    ),
  /target hash/
);

const emitted = emitTypeScript(document);
assert.match(emitted, /export interface Todo/);
assert.match(emitted, /export function addTodo/);

const declarations = readFileSync("dist/index.d.ts", "utf8");
for (const key of Object.keys(frontierLang)) {
  assert.match(declarations, new RegExp(`function ${key}\\b|type ${key}\\b|interface ${key}\\b`), `${key} is missing from declarations`);
}

import {
  actionNode,
  classifyMerge,
  createDocument,
  createPatch,
  emitTypeScript,
  entityNode,
  hashDocumentBase,
  stateNode
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

const baseHash = hashDocumentBase(document);
const left = createPatch({
  id: "patch_left_tags",
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
const right = createPatch({
  id: "patch_right_tags",
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

console.log(classifyMerge(document, left, right));
console.log(emitTypeScript(document));

# `@shapeshift-labs/frontier-lang`

Patch-native semantic source kernel for replayable programs, merge admission, and generated TypeScript projections.

This package is the first small slice of a Frontier-oriented language idea:

> Source is semantic state. Editing is patches. Compilation is projection. Merge is replay plus proof/evidence.

The package does not try to be a full programming language yet. It provides the runtime-neutral source graph and compiler contracts that a concrete `.frontier` parser can target later.

## Install

```sh
npm install @shapeshift-labs/frontier-lang
```

The package is ESM-first and dependency-free at runtime. Local checkout examples import from `dist`, so run `npm run build` before running files under `examples/`.

## Why

Git merges text. Large agent swarms make concurrent semantic changes: APIs, state cells, routes, effects, migrations, tests, generated artifacts, and ownership surfaces.

`frontier-lang` models those as typed graph nodes and semantic patch bundles so tooling can classify a merge before it becomes a pile of conflicting files.

## Example

```ts
import {
  actionNode,
  classifyMerge,
  createDocument,
  createPatch,
  emitTypeScript,
  entityNode,
  hashDocumentBase,
  stateNode
} from "@shapeshift-labs/frontier-lang";

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
  id: "patch_add_tags",
  baseHash,
  operations: [
    {
      op: "updateNode",
      id: "ent_todo",
      set: { metadata: { changedBy: "left" } },
      touches: [{ id: "field_todo_tags", access: "write" }]
    }
  ],
  evidence: [{ id: "test_tags", kind: "test", status: "passed" }]
});

const right = createPatch({
  id: "patch_add_more_tags",
  baseHash,
  operations: [
    {
      op: "updateNode",
      id: "ent_todo",
      set: { metadata: { changedBy: "right" } },
      touches: [{ id: "field_todo_tags", access: "write" }]
    }
  ],
  evidence: [{ id: "test_more_tags", kind: "test", status: "passed" }]
});

console.log(classifyMerge(document, left, right).status);
// safe-by-merge-law

console.log(emitTypeScript(document));
```

## Concrete Language Shape

A later parser could project source that looks like this into the graph above. This is future syntax, not a shipped parser yet:

```frontier
entity Todo @id("ent_todo") {
  id @id("field_todo_id"): TodoId @key

  title @id("field_todo_title"): Text {
    merge conflict
  }

  tags @id("field_todo_tags"): Set<Text> {
    merge union law semilattice
  }
}

state TodoDb @id("state_todo") {
  todos @id("collection_todos"): Map<TodoId, Todo> {
    merge byKey law commutative
  }
}

action addTodo(input: { title: Text })
  reads TodoDb.todos
  writes TodoDb.todos
  uses Clock
  returns Patch
{
  patch {
    TodoDb.todos[TodoId.new()] = Todo {
      title: input.title
      tags: Set.empty()
    }
  }
}
```

## Generated Outputs And Host Capabilities

There are two separate boundaries to keep distinct:

1. **JS/TS as optional projection targets.** Frontier semantic source can do the graph, replay, and merge work first, then project generated targets. This package currently ships `emitTypeScript`; JavaScript can be a later projection target or a build output derived from generated TypeScript. In this mode, JS packages are not part of the canonical source model.
2. **JS packages as host capabilities.** Some real systems still need React, Playwright, SQLite clients, storage SDKs, crypto libraries, or browser APIs. The language can use those through explicit capability adapters such as `Network`, `Storage<T>`, `ReactView`, or `SqlClient`.

The second mode should be opt-in. Importing arbitrary JS directly into semantic source would pull late-bound JavaScript behavior back into the merge problem. A better design is:

Future syntax sketch:

```frontier
capability ReactView from npm("react") {
  effects dom
  boundary generated
}
```

Today, the source-kernel shape for this is an effect/capability contract: actions list capabilities in `uses`, effect nodes name the capability and resources, and target nodes describe generated output. The host adapter resolves `npm:react` or browser APIs outside the canonical semantic graph.

That keeps JS useful without making JavaScript the canonical language semantics.

## API Surface

- `createDocument`
- `entityNode`, `stateNode`, `actionNode`, `viewNode`, `migrationNode`, `effectNode`, `moduleNode`, `targetNode`
- `createPatch`
- `applySemanticPatch`
- `replayDocument`
- `classifyMerge`
- `emitTypeScript`
- `stableStringify`
- `hashSemanticValue`
- `hashDocumentBase`
- `validateDocument`

## Status

Experimental. This is the source-kernel package for proving the core loop:

```txt
semantic source graph -> patch/replay -> merge classification -> generated TypeScript
```

The next layers are a concrete `.frontier` parser, richer compiler targets, verifier hooks, and adapters to the existing Frontier package family.

## License

MIT. See [LICENSE](./LICENSE).

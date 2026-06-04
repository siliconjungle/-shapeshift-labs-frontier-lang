# `@shapeshift-labs/frontier-lang`

Umbrella package for the Frontier Lang package family.

Frontier Lang is a patch-native semantic programming model: source is a replayable semantic graph, edits are structured patches, merge admission is evidence-aware, and generated code is a projection from that semantic state.

## Install

```sh
npm install @shapeshift-labs/frontier-lang
```

The root package re-exports the browser-safe runtime packages:

- `@shapeshift-labs/frontier-lang-kernel`: semantic document graph, patches, replay, hashing, and merge admission.
- `@shapeshift-labs/frontier-lang-parser`: first `.frontier` syntax slice.
- `@shapeshift-labs/frontier-lang-checker`: diagnostics for documents and patch evidence.
- `@shapeshift-labs/frontier-lang-typescript`: TypeScript projection adapter.

The Node CLI is intentionally separate:

```sh
npm install -g @shapeshift-labs/frontier-lang-cli
frontier-lang check examples/todo.frontier
```

## Example

```js
import {
  checkDocument,
  classifyMerge,
  createPatch,
  emitTypeScript,
  hashDocumentBase,
  parseFrontierSource
} from "@shapeshift-labs/frontier-lang";

const document = parseFrontierSource(`
module TodoApp @id("mod_todo")

entity Todo @id("ent_todo") {
  title @id("field_title"): Text {
    merge conflict
  }
  tags @id("field_tags"): Set<Text> {
    merge union law semilattice
  }
}
`);

const baseHash = hashDocumentBase(document);
const left = createPatch({
  id: "left",
  baseHash,
  operations: [
    {
      op: "addEvidence",
      evidence: { id: "left-test", kind: "test", status: "passed" },
      touches: [{ id: "field_tags", access: "write" }]
    }
  ]
});
const right = createPatch({
  id: "right",
  baseHash,
  operations: [
    {
      op: "addEvidence",
      evidence: { id: "right-test", kind: "test", status: "passed" },
      touches: [{ id: "field_tags", access: "write" }]
    }
  ]
});

console.log(checkDocument(document).ok);
console.log(classifyMerge(document, left, right).status);
console.log(emitTypeScript(document));
```

## Package Shape

The split packages keep package boundaries explicit:

- Kernel stays runtime-neutral and dependency-light.
- Parser depends on kernel.
- Checker depends on kernel.
- TypeScript projection depends on kernel.
- CLI depends on all of the above and owns Node filesystem/bin behavior.
- Umbrella depends on the browser-safe packages and re-exports them for convenience.

This keeps JavaScript/TypeScript useful as projection targets without making generated code the canonical source model.

import assert from "node:assert/strict";
import {
  applySemanticPatch,
  checkDocument,
  classifyMerge,
  ClangLanguagePackage,
  compileNativeSource,
  compileFrontierSource,
  createSemanticOperationSet,
  createSemanticImportSidecar,
  CSharpLanguagePackage,
  createUniversalConversionArtifacts,
  createUniversalCapabilityMatrix,
  createUniversalAstFromDocument,
  createPatch,
  emitCHeader,
  emitCss,
  emitHtml,
  emitJavaScript,
  emitPython,
  emitRust,
  emitTypeScript,
  hashDocumentBase,
  importNativeSource,
  GoLanguagePackage,
  JavaLanguagePackage,
  KotlinLanguagePackage,
  parseFrontierSource,
  projectFrontierAst,
  readUniversalAstJson,
  renderTargetAst,
  safeMergeCssSource,
  safeMergeHtmlSource,
  SwiftLanguagePackage,
  toTypeScriptAst,
  writeUniversalAstJson
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
assert.match(emitHtml(document), /data-frontier-kind="entity"/);
assert.match(emitCss(document), /\.frontier-Todo/);
assert.equal(safeMergeHtmlSource({
  baseSourceText: "<h1>Todo</h1>\n<button data-frontier-key=\"save\">Save</button>\n",
  workerSourceText: "<h1>Todos</h1>\n<button data-frontier-key=\"save\">Save</button>\n",
  headSourceText: "<h1>Todo</h1>\n<button data-frontier-key=\"save\" disabled>Save</button>\n"
}).status, "merged");
assert.equal(safeMergeCssSource({
  baseSourceText: ".button {\n  color: red;\n  padding: 1rem;\n}\n",
  workerSourceText: ".button {\n  color: blue;\n  padding: 1rem;\n}\n",
  headSourceText: ".button {\n  color: red;\n  padding: 1rem;\n  background-color: white;\n}\n"
}).status, "merged");
assert.match(compileFrontierSource(source, { target: "javascript" }).output, /export const TodoSchema/);
const universalAst = createUniversalAstFromDocument(document, { id: "uast_todo" });
assert.equal(readUniversalAstJson(writeUniversalAstJson(universalAst)).kind, "frontier.lang.universalAst");
const nativeImport = importNativeSource({ language: "python", sourcePath: "todo.py" });
assert.equal(nativeImport.nativeSource.language, "python");
assert.equal(nativeImport.universalAst.kind, "frontier.lang.universalAst");
const nativeCompile = compileNativeSource({
  language: "javascript",
  sourcePath: "runtime.js",
  sourceText: "export function step(frame) { return frame + 1; }\n"
});
assert.equal(nativeCompile.kind, "frontier.lang.nativeSourceCompileResult");
assert.equal(nativeCompile.outputMode, "preserved-source");
assert.equal(nativeCompile.metadata.projectionReview.status, "preserved-source");
assert.match(nativeCompile.output, /export function step/);
const nativeSidecar = createSemanticImportSidecar(nativeCompile.importResult);
assert.equal(nativeSidecar.semanticImpact.summary.weakMergeSignals >= 1, true);
assert.equal(nativeSidecar.semanticImpact.records.every((record) => record.mergeSignal), true);
const universalCapabilityMatrix = createUniversalCapabilityMatrix({
  imports: [nativeImport],
  targets: ["python", "rust"],
  requiredFeatures: ["syntax", "semantic", "sourcePreservation"]
});
assert.equal(universalCapabilityMatrix.kind, "frontier.lang.universalCapabilityMatrix");
assert.equal(universalCapabilityMatrix.summary.imports, 1);
const operationSet = createSemanticOperationSet({
  operations: [{ id: "op_root_projection", operationKind: "projection", readiness: "needs-review" }]
});
assert.equal(operationSet.summary.byOperationKind.projection, 1);
assert.equal(operationSet.operations[0].autoMergeClaim, false);
const conversionArtifacts = createUniversalConversionArtifacts({ imports: [nativeImport], targets: ["python"] });
assert.equal(conversionArtifacts.kind, "frontier.lang.universalConversionArtifacts");
assert.equal(conversionArtifacts.summary.semanticOperations, conversionArtifacts.summary.routes);
assert.equal(conversionArtifacts.summary.admissionRecords, conversionArtifacts.summary.routes);
assert.equal(conversionArtifacts.admissionRecords[0].kind, "frontier.lang.universalConversionAdmissionRecord");
assert.equal(conversionArtifacts.admissionRecords[0].autoMergeClaim, false);

for (const languagePackage of [
  ClangLanguagePackage,
  CSharpLanguagePackage,
  GoLanguagePackage,
  JavaLanguagePackage,
  KotlinLanguagePackage,
  SwiftLanguagePackage
]) {
  assert.equal(languagePackage.version, "0.1.13");
  assert.equal(languagePackage.compilerVersion, "0.2.71");
}

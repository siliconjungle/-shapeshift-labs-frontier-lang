import assert from "node:assert/strict";
import { compileFrontierSourceBundle, inspectFrontierSourceSyntax, parseFrontierSource } from "../dist/index.js";

const source = `module SyntaxProbe @id("mod_syntax_probe") {
view TodoView @id("view_todo") {
  render Button @id("render_todo_button") {
    text "{"
  }
}
entity Todo @id("ent_todo") {
  title: Text
}
}`;

const syntaxReport = inspectFrontierSourceSyntax(source);
assert.equal(syntaxReport.kind, "frontier.lang.sourceSyntaxReport");
assert.equal(syntaxReport.summary.diagnosticCount, 0);
assert.equal(syntaxReport.summary.failClosed, false);
assert.equal(syntaxReport.metadata.sourceBytes, new TextEncoder().encode(source).length);

const spanDoc = parseFrontierSource(`module SpanProbe @id("mod_span_probe") {
packageManifest AppPackage @id("pkg_manifest_app") {
  dependency react @id("pkg_dep_react") section dependencies range ^19.0.0 sourceSpan package.json:12:3-12:22
}
canvasSurface PreviewCanvas @id("canvas_surface_preview") {
  command fill @id("canvas_command_fill") name fillRect category draw sourceSpan src/draw.js:4:1-4:20
}
appHost WorkbenchHost @id("app_surface_workbench") {
  mount dashboard @id("app_mount_dashboard") kind region path /dashboard sourceSpan app.tsx:10:1-10:30
}
}`, { sourcePath: "umbrella-source-spans.frontier" });
const spanDependency = spanDoc.metadata.packageManifests.manifests[0].records.find((record) => record.id === "pkg_dep_react");
const spanCommand = spanDoc.metadata.canvasSurfaces.surfaces[0].records.find((record) => record.id === "canvas_command_fill");
const spanMount = spanDoc.metadata.applicationSurfaces.surfaces[0].records.find((record) => record.id === "app_mount_dashboard");
assert.equal(spanDependency.sourceSpan.path, "package.json");
assert.equal(spanDependency.authoredSourceSpan.path, "umbrella-source-spans.frontier");
assert.equal(spanCommand.sourceSpan.path, "src/draw.js");
assert.equal(spanCommand.authoredSourceSpan.path, "umbrella-source-spans.frontier");
assert.equal(spanMount.sourceSpan.path, "app.tsx");
assert.equal(spanMount.authoredSourceSpan.path, "umbrella-source-spans.frontier");

const malformedBundle = compileFrontierSourceBundle(`module Broken @id("mod_broken") {
entity Todo @id("ent_todo") {
  title: Text
`, { fileName: "broken.frontier", targetLanguages: ["typescript"] });

assert.equal(malformedBundle.ok, false);
assert.equal(malformedBundle.sourceSyntax.summary.failClosed, true);
assert.equal(malformedBundle.summary.sourceSyntaxMalformedBlocks, 1);
assert.equal(malformedBundle.summary.sourceSyntaxDiagnostics, 2);
assert.equal(malformedBundle.metadata.sourceSyntaxFailClosed, true);

const proofAliasBundle = compileFrontierSourceBundle(`module ProofAliasProbe @id("mod_proof_alias_probe") {
proof MergeProof @id("proof_merge") {
  contract mergeContract @id("contract_merge") kind invariant subject action_merge statement "Merge action keeps proof source map identity." sourceMap source_map_proof sourceMapMapping map_proof_contract evidence evidence_replay
  proofObligation replay @id("obligation_replay") kind runtime status missing subject action_merge contract contract_merge evidence evidence_replay missingEvidence runtime-proof
}
target typescript @id("target_typescript") {
  language typescript
  emitPath src/generated/proof-alias.ts
}
}`, { fileName: "proof-alias.frontier", targetLanguages: ["typescript"] });

assert.equal(proofAliasBundle.ok, true);
assert.equal(proofAliasBundle.summary.sourceSyntaxUnknownChildRows, 0);
assert.equal(proofAliasBundle.summary.sourceSyntaxRowFamilyCountsByBlockFamily.proof.contract, 1);
assert.equal(proofAliasBundle.summary.sourceSyntaxRowFamilyCountsByBlockFamily.proof.obligation, 1);
assert.equal(proofAliasBundle.conversionPlan.metadata.authoredFrontierSource.proofSourceMapIds.includes("source_map_proof"), true);
assert.equal(proofAliasBundle.conversionPlan.metadata.authoredFrontierSource.proofSourceMapMappingIds.includes("map_proof_contract"), true);
assert.equal(proofAliasBundle.document.metadata.proof.obligations[0].id, "obligation_replay");
assert.equal(proofAliasBundle.conversionPlan.metadata.authoredFrontierSource.proofSummary.obligations, 1);

const targetProjectionBundle = compileFrontierSourceBundle(`module TargetProjectionProbe @id("mod_target_projection_probe") {
conversion TsToRust @id("conversion_ts_rust") {
  sourceLanguage typescript
  target rust
  evidence routeReplay @id("evidence_conversion_replay") kind conversion-replay-proof status passed route conversion_ts_rust sourceLanguage typescript target rust
}
target rust @id("target_rust") {
  targetLanguage rust
  source typescript
  packageName example_todo
  targetPath src/generated/todo.rs
  path src/todo.frontier
  sourceHash sha256:frontier
  targetHash sha256:rust
  runtime native
  runtimeHost rust-cli
  moduleFormat crate
  projection rustAdapter @id("target_projection_rust") disposition target-adapter readiness needs-review adapter rust_codegen represented semantic-symbol evidence artifact_projection proof artifact_projection loss loss_borrow_scope missingEvidence translation-borrow-scope
  proofEvidence projectionRun @id("artifact_projection") kind conversion-replay-proof status passed path reports/projection.json sourceHash sha256:frontier targetHash sha256:rust
  sourceMap generatedRust @id("target_sourcemap_rust") sourcePath src/todo.frontier targetPath src/generated/todo.rs sourceHash sha256:frontier targetHash sha256:rust evidence artifact_projection
  loss borrowScope @id("loss_borrow") kind ownership severity warning evidence artifact_projection
  gap runtimeProbe @id("target_gap_runtime_probe") code runtime-proof-missing status missing missingEvidence browser-runtime-proof
}
}`, {
  fileName: "target-projection.frontier",
  targetLanguages: ["rust"],
  conversion: { targets: ["rust"], generatedAt: 1702 }
});

assert.equal(targetProjectionBundle.ok, true);
assert.equal(targetProjectionBundle.document.nodes.target_rust.target.sourceLanguage, "typescript");
assert.equal(targetProjectionBundle.document.nodes.target_rust.target.sourceHash, "sha256:frontier");
assert.equal(targetProjectionBundle.document.nodes.target_rust.target.targetHash, "sha256:rust");
assert.equal(targetProjectionBundle.sourceSyntax.summary.sourceSyntaxRowFamilyCountsByBlockFamily.target.sourceLanguage, 1);
assert.equal(targetProjectionBundle.conversionPlan.metadata.authoredFrontierSource.conversionEvidenceIds.includes("evidence_conversion_replay"), true);
assert.equal(targetProjectionBundle.conversionPlan.metadata.authoredFrontierSource.targetProjectionTargets.includes("rust"), true);
assert.equal(targetProjectionBundle.conversionPlan.metadata.authoredFrontierSource.targetProjectionTargetIds.includes("target_rust"), true);
assert.equal(targetProjectionBundle.conversionPlan.metadata.authoredFrontierSource.targetProjectionEmitPaths.includes("src/generated/todo.rs"), true);
assert.equal(targetProjectionBundle.conversionPlan.metadata.authoredFrontierSource.targetProjectionEvidenceIds.includes("artifact_projection"), true);
assert.equal(targetProjectionBundle.conversionPlan.metadata.authoredFrontierSource.targetProjectionTargetEvidenceIds.includes("artifact_projection"), true);
assert.equal(targetProjectionBundle.conversionPlan.metadata.authoredFrontierSource.targetProjectionSourceMapIds.includes("target_sourcemap_rust"), true);
assert.equal(targetProjectionBundle.conversionPlan.metadata.authoredFrontierSource.targetProjectionLossIds.includes("loss_borrow"), true);
assert.equal(targetProjectionBundle.conversionPlan.metadata.authoredFrontierSource.targetProjectionTargetLossIds.includes("loss_borrow"), true);
assert.equal(targetProjectionBundle.conversionPlan.metadata.authoredFrontierSource.targetProjectionMissingEvidence.includes("browser-runtime-proof"), true);
assert.equal(targetProjectionBundle.conversionPlan.metadata.authoredFrontierSource.targetProjectionReadinesses.includes("needs-review"), true);

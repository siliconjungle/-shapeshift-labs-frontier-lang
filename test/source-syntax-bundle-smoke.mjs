import assert from "node:assert/strict";
import { compileFrontierSourceBundle, inspectFrontierSourceSyntax } from "../dist/index.js";

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

const malformedBundle = compileFrontierSourceBundle(`module Broken @id("mod_broken") {
entity Todo @id("ent_todo") {
  title: Text
`, { fileName: "broken.frontier", targetLanguages: ["typescript"] });

assert.equal(malformedBundle.ok, false);
assert.equal(malformedBundle.sourceSyntax.summary.failClosed, true);
assert.equal(malformedBundle.summary.sourceSyntaxMalformedBlocks, 1);
assert.equal(malformedBundle.summary.sourceSyntaxDiagnostics, 2);
assert.equal(malformedBundle.metadata.sourceSyntaxFailClosed, true);

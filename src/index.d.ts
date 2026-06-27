export * from "@shapeshift-labs/frontier-lang-kernel";
export * from "@shapeshift-labs/frontier-lang-parser";
export * from "@shapeshift-labs/frontier-lang-checker";
export * from "@shapeshift-labs/frontier-lang-typescript";
export * from "@shapeshift-labs/frontier-lang-compiler";
export * from "@shapeshift-labs/frontier-lang-html";
export * from "@shapeshift-labs/frontier-lang-css";
export * from "@shapeshift-labs/frontier-lang-swift";
export * from "@shapeshift-labs/frontier-lang-kotlin";
export * from "@shapeshift-labs/frontier-lang-java";
export * from "@shapeshift-labs/frontier-lang-go";
export * from "@shapeshift-labs/frontier-lang-csharp";
export * from "@shapeshift-labs/frontier-lang-clang";

export {
  type HtmlProjectionOptions,
  type HtmlBrowserRuntimeProof,
  type HtmlBrowserRuntimeProofRecord,
  type HtmlSemanticMergeEvidence,
  type HtmlSafeMergeResult,
  createHtmlSemanticMergeEvidence,
  emitHtml,
  emitHtmlWithSourceMap,
  safeMergeHtmlSource
} from "@shapeshift-labs/frontier-lang-html";
export {
  type CssProjectionOptions,
  type CssSemanticMergeEvidence,
  type CssSafeMergeResult,
  createCssSemanticMergeEvidence,
  emitCss,
  emitCssWithSourceMap,
  safeMergeCssSource
} from "@shapeshift-labs/frontier-lang-css";
export {
  type EmitJavaScriptOptions,
  type JavaScriptSourceMapResult,
  type EmitJavaScriptWithSourceMapResult,
  type JavaScriptSourceRef,
  type JavaScriptAstDeclaration,
  type JavaScriptAstModule,
  type FrontierProjectionTarget as JavaScriptProjectionTarget,
  type FrontierProjectionSourceSpan as JavaScriptProjectionSourceSpan,
  type FrontierProjectionGeneratedSpan as JavaScriptProjectionGeneratedSpan,
  type FrontierProjectionEvidenceRecord as JavaScriptProjectionEvidenceRecord,
  type FrontierProjectionSourceMapMapping as JavaScriptProjectionSourceMapMapping,
  type FrontierProjectionSourceMap as JavaScriptProjectionSourceMap,
  toJavaScriptAst,
  renderJavaScriptAst,
  renderJavaScriptAstWithSourceMap,
  emitJavaScript,
  emitJavaScriptWithSourceMap
} from "@shapeshift-labs/frontier-lang-javascript";
export {
  type EmitRustOptions,
  type RustSourceMapResult,
  type EmitRustWithSourceMapResult,
  type RustSourceRef,
  type RustAstItem,
  type RustAstModule,
  type FrontierProjectionTarget as RustProjectionTarget,
  type FrontierProjectionSourceSpan as RustProjectionSourceSpan,
  type FrontierProjectionGeneratedSpan as RustProjectionGeneratedSpan,
  type FrontierProjectionEvidenceRecord as RustProjectionEvidenceRecord,
  type FrontierProjectionSourceMapMapping as RustProjectionSourceMapMapping,
  type FrontierProjectionSourceMap as RustProjectionSourceMap,
  toRustAst,
  renderRustAst,
  renderRustAstWithSourceMap,
  emitRust,
  emitRustWithSourceMap
} from "@shapeshift-labs/frontier-lang-rust";
export {
  type EmitPythonOptions,
  type PythonSourceMapResult,
  type EmitPythonWithSourceMapResult,
  type PythonSourceRef,
  type PythonAstDeclaration,
  type PythonAstModule,
  type FrontierProjectionTarget as PythonProjectionTarget,
  type FrontierProjectionSourceSpan as PythonProjectionSourceSpan,
  type FrontierProjectionGeneratedSpan as PythonProjectionGeneratedSpan,
  type FrontierProjectionEvidenceRecord as PythonProjectionEvidenceRecord,
  type FrontierProjectionSourceMapMapping as PythonProjectionSourceMapMapping,
  type FrontierProjectionSourceMap as PythonProjectionSourceMap,
  toPythonAst,
  renderPythonAst,
  renderPythonAstWithSourceMap,
  emitPython,
  emitPythonWithSourceMap
} from "@shapeshift-labs/frontier-lang-python";
export {
  type EmitCHeaderOptions,
  type CSourceMapResult,
  type EmitCHeaderWithSourceMapResult,
  type CSourceRef,
  type CAstDeclaration,
  type CAstHeader,
  type FrontierProjectionTarget as CProjectionTarget,
  type FrontierProjectionSourceSpan as CProjectionSourceSpan,
  type FrontierProjectionGeneratedSpan as CProjectionGeneratedSpan,
  type FrontierProjectionEvidenceRecord as CProjectionEvidenceRecord,
  type FrontierProjectionSourceMapMapping as CProjectionSourceMapMapping,
  type FrontierProjectionSourceMap as CProjectionSourceMap,
  toCAst,
  renderCAst,
  renderCAstWithSourceMap,
  emitCHeader,
  emitCHeaderWithSourceMap
} from "@shapeshift-labs/frontier-lang-c";

export * as frontierLangJavaScript from "@shapeshift-labs/frontier-lang-javascript";
export * as frontierLangHtml from "@shapeshift-labs/frontier-lang-html";
export * as frontierLangCss from "@shapeshift-labs/frontier-lang-css";
export * as frontierLangRust from "@shapeshift-labs/frontier-lang-rust";
export * as frontierLangPython from "@shapeshift-labs/frontier-lang-python";
export * as frontierLangC from "@shapeshift-labs/frontier-lang-c";

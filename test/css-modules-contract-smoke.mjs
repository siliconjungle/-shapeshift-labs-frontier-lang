import assert from "node:assert/strict";
import { hashSemanticValue } from "@shapeshift-labs/frontier-lang-kernel";
import { parseCssSemanticSheet } from "@shapeshift-labs/frontier-lang-css";
import { safeMergeCssSource } from "../dist/index.js";

const cssModuleBaseSource = ".root {\n  color: red;\n}\n";
const cssModuleWorkerSource = ".root {\n  color: red;\n}\n.label {\n  font-weight: 600;\n}\n";
const cssModuleHeadSource = ".root {\n  color: blue;\n}\n";
const cssModuleOutputSource = ".root {\n  color: blue;\n}\n\n.label {\n  font-weight: 600;\n}\n";
const cssModuleGeneratedClassNameMap = { root: "Button_root__hash", label: "Button_label__hash" };
const cssModuleUseSiteGraphHash = "hash_css_module_use_sites";
const cssModuleContractMerge = safeMergeCssSource({
  sourcePath: "Button.module.css",
  baseSourceText: cssModuleBaseSource,
  workerSourceText: cssModuleWorkerSource,
  headSourceText: cssModuleHeadSource,
  generatedClassNameMap: cssModuleGeneratedClassNameMap,
  jsTsUseSiteGraphHash: cssModuleUseSiteGraphHash,
  cssModuleContractProofs: [{
    id: "proof_css_module_label_export",
    kind: "css-source-bound-module-contract-proof",
    status: "passed",
    sourcePath: "Button.module.css",
    side: "worker",
    changeKind: "add",
    contractKey: "export:label",
    contractKind: "css-module-export",
    baseSourceHash: hashSemanticValue(cssModuleBaseSource),
    workerSourceHash: hashSemanticValue(cssModuleWorkerSource),
    headSourceHash: hashSemanticValue(cssModuleHeadSource),
    outputSourceHash: hashSemanticValue(cssModuleOutputSource),
    moduleHash: parseCssSemanticSheet(cssModuleWorkerSource, { sourcePath: "Button.module.css", generatedClassNameMap: cssModuleGeneratedClassNameMap, jsTsUseSiteGraphHash: cssModuleUseSiteGraphHash }).cssModules.moduleHash,
    generatedClassNameMapHash: hashSemanticValue({ kind: "frontier.lang.css.modules.generatedClassNameMap.v1", generatedClassNameMap: cssModuleGeneratedClassNameMap }),
    jsTsUseSiteGraphHash: cssModuleUseSiteGraphHash
  }]
});

assert.equal(cssModuleContractMerge.status, "merged");
assert.equal(cssModuleContractMerge.workerChangedCssModuleContracts, 1);
assert.equal(cssModuleContractMerge.cssModuleContractProofs.length, 1);

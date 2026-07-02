import assert from "node:assert/strict";
import {
  createAssemblySemanticMergeEvidence,
  createJsxSemanticMergeEvidence,
  createPackageManifestSemanticMergeEvidence,
  createSvgSemanticMergeEvidence,
  createUniversalConversionArtifactsFromFrontierSource,
  createUniversalConversionPlanFromFrontierSource,
  parseFrontierSource
} from "../dist/index.js";

const authoredConstraintSource = `
module TodoApp @id("mod_todo")

type TodoInput @id("type_todo_input") {
  title: Text
}

action addTodo @id("action_add_todo") {
  input TodoInput
  returns Patch
}

possibilitySpace TodoProjectionSpace @id("space_todo_projection") {
  subject symbol:addTodo
  scope mod_todo
  target typescript
  target rust
  variable surface @id("space_variable_surface") kind projection domain typescript|rust|cli default typescript preserve identity|type-shape evidence evidence_todo_projection
  hard identity @id("space_constraint_identity") kind semantic-identity family identity subject symbol:addTodo variable space_variable_surface requires type|binding failClosed evidence evidence_todo_projection
  preference nativeShape @id("space_preference_native_shape") kind target-idiom target rust weight 0.6 variable space_variable_surface prefer rust-function reason "prefer idiomatic target action surface"
  collapse rustProjection @id("space_collapse_rust_projection") strategy evidence-first target rust variable space_variable_surface requires identity|type-gate produces symbol:addTodoRust evidence evidence_todo_projection admission space_admission_translation
  admission translation @id("space_admission_translation") kind translation status open target rust requires hardConstraints|typeGate decision review failClosed evidence evidence_todo_projection
}
`;

const authoredDocument = parseFrontierSource(authoredConstraintSource);
assert.equal(authoredDocument.metadata.constraintSpaces.id, "space_todo_projection");
const authoredPlan = createUniversalConversionPlanFromFrontierSource(authoredConstraintSource, {
  fileName: "todo.frontier",
  targets: ["rust"]
});
assert.equal(authoredPlan.metadata.authoredFrontierSource.constraintSpaceId, "space_todo_projection");
assert.equal(authoredPlan.metadata.authoredFrontierSource.constraintSpaceVariableIds[0], "space_variable_surface");
assert.equal(authoredPlan.metadata.authoredFrontierSource.constraintSpaceConstraintIds[0], "space_constraint_identity");
assert.equal(authoredPlan.metadata.authoredFrontierSource.constraintSpacePreferenceIds[0], "space_preference_native_shape");
assert.equal(authoredPlan.metadata.authoredFrontierSource.constraintSpaceCollapseStrategyIds[0], "space_collapse_rust_projection");
assert.equal(authoredPlan.metadata.authoredFrontierSource.constraintSpaceAdmissionIds[0], "space_admission_translation");
const authoredArtifacts = createUniversalConversionArtifactsFromFrontierSource(authoredConstraintSource, {
  fileName: "todo.frontier",
  targets: ["rust"]
});
assert.equal(authoredArtifacts.metadata.authoredFrontierSource.constraintSpaceSummary.admissionCount, 1);
assert.equal(createJsxSemanticMergeEvidence("export const View = () => <button key=\"save\">Save</button>;\n").summary.keyedElements, 1);
assert.equal(createSvgSemanticMergeEvidence("<svg><defs><linearGradient id=\"brand\" /></defs><rect fill=\"url(#brand)\" /></svg>").summary.missingReferences, 0);
assert.equal(createPackageManifestSemanticMergeEvidence("{\"name\":\"demo\",\"dependencies\":{\"left-pad\":\"1.3.0\"}}\n").summary.dependencies, 1);
assert.equal(createAssemblySemanticMergeEvidence("start:\n  lda #$01\n  rts\n", { dialect: "snes-asm" }).summary.instructions, 2);

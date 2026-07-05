import assert from "node:assert/strict";
import {
  createAssemblySemanticMergeEvidence,
  createJsxSemanticMergeEvidence,
  createPackageManifestSemanticMergeEvidence,
  createSvgSemanticMergeEvidence,
  createUniversalConversionArtifactsFromFrontierSource,
  createAuthoredFrontierSourceParityMatrix,
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

const decisionGraphSource = `module DecisionGraphProbe @id("mod_decision_graph_probe") {
decisionGraph MergeReview @id("decision_graph_merge_review") {
  node patchNode @id("decision_node_patch") record patch_event_user label "Patch"
  node decisionNode @id("decision_node_decision") record merge_decision_user label "Decision"
  edge patchToDecision @id("decision_edge_patch_to_decision") from decision_node_patch to decision_node_decision kind causal
  panelProjection review @id("panel_projection_review") panel merge-review projectionKind readiness field status|evidence
  feedback routeCost @id("feedback_route_cost") loop route_tuning kind cost-regression subject model:gpt5 severity warning action downroute feedback "Cost exceeded lane target."
}
conversion FrontierToRust @id("conversion_frontier_rust") {
  sourceLanguage frontier
  target rust
}
}`;
const decisionGraphPlan = createUniversalConversionPlanFromFrontierSource(decisionGraphSource, {
  fileName: "decision-graph.frontier",
  targets: ["rust"]
});
const decisionGraphParity = createAuthoredFrontierSourceParityMatrix({
  plan: decisionGraphPlan,
  includeEmptyRows: false
});
assert.equal(decisionGraphParity.summary.failClosed, false);
assert.equal(rowFor(decisionGraphParity, "decisionGraph.nodes").status, "pass");
assert.equal(rowFor(decisionGraphParity, "decisionGraph.edges").status, "pass");
assert.equal(decisionGraphPlan.metadata.authoredFrontierSource.decisionGraphPanelProjectionIds.includes("panel_projection_review"), true);
assert.equal(decisionGraphPlan.metadata.authoredFrontierSource.decisionGraphFeedbackIds.includes("feedback_route_cost"), true);
const decisionGraphArtifacts = createUniversalConversionArtifactsFromFrontierSource(decisionGraphSource, {
  fileName: "decision-graph.frontier",
  targets: ["rust"]
});
assert.equal(decisionGraphArtifacts.index.decisionGraphPanelProjectionIds.includes("panel_projection_review"), true);
assert.equal(decisionGraphArtifacts.index.decisionGraphFeedbackIds.includes("feedback_route_cost"), true);
assert.equal(decisionGraphArtifacts.summary.compactCounts.decisionGraph.panelProjections.panel_projection_review, decisionGraphArtifacts.routeArtifacts.length);
assert.equal(decisionGraphArtifacts.summary.compactCounts.decisionGraph.feedback.feedback_route_cost, decisionGraphArtifacts.routeArtifacts.length);

const machineGraphSource = `module MachineGraphProbe @id("mod_machine_graph_probe") {
machineGraph CounterLoop @id("machine_graph_counter_loop") {
  sourceLanguage assembly
  sourcePath src/counter.asm
  evidence evidence_counter_trace
  label loop @id("label_loop") address $808000 evidence evidence_counter_trace
  instruction bne @id("instruction_bne") mnemonic BNE opcode D0 proofStatus missing reasonCode machine-branch-instruction-proof-missing evidence evidence_counter_trace
  branch loopBranch @id("branch_loop") from instruction_bne to label_loop kind conditional proofStatus missing reasonCode machine-branch-proof-missing sourceMap source_map_machine sourceMapMapping map_machine_branch proofEvidence evidence_counter_trace evidence evidence_counter_trace
  trap vectorTrap @id("machine_trap_nmi_vector") instruction instruction_bne kind vector-missing trapCode snes-vector-oob proofStatus missing failClosed reasonCode machine-trap-vector-proof-missing proofEvidence evidence_counter_trace missingEvidence machine-trap-trace evidence evidence_counter_trace
  missingEvidence trapTrace @id("missing_machine_trap_trace") reason machine-trap-trace severity error evidence evidence_counter_trace
  evidence trace @id("evidence_counter_trace") kind emulator-trace status passed path reports/counter-trace.json
}
conversion AssemblyToRust @id("conversion_assembly_rust") {
  sourceLanguage assembly
  target rust
}
}`;
const machineGraphPlan = createUniversalConversionPlanFromFrontierSource(machineGraphSource, {
  fileName: "machine-graph.frontier",
  targets: ["rust"]
});
const machineGraphParity = createAuthoredFrontierSourceParityMatrix({
  plan: machineGraphPlan,
  includeEmptyRows: false
});
assert.equal(rowFor(machineGraphParity, "machineGraphs.graphs.query.controlFlowEdgeIds").status, "pass");
assert.equal(rowFor(machineGraphParity, "machineGraphs.trapIds").status, "pass");
assert.equal(rowFor(machineGraphParity, "machineGraphs.missingEvidenceIds").status, "pass");
assert.equal(machineGraphPlan.metadata.authoredFrontierSource.machineGraphControlFlowEdgeIds.includes("branch_loop"), true);
assert.equal(machineGraphPlan.metadata.authoredFrontierSource.machineGraphFailClosedTrapIds.includes("machine_trap_nmi_vector"), true);
assert.equal(machineGraphPlan.metadata.authoredFrontierSource.machineGraphMissingEvidence.includes("machine-trap-trace"), true);

assert.equal(createJsxSemanticMergeEvidence("export const View = () => <button key=\"save\">Save</button>;\n").summary.keyedElements, 1);
assert.equal(createSvgSemanticMergeEvidence("<svg><defs><linearGradient id=\"brand\" /></defs><rect fill=\"url(#brand)\" /></svg>").summary.missingReferences, 0);
assert.equal(createPackageManifestSemanticMergeEvidence("{\"name\":\"demo\",\"dependencies\":{\"left-pad\":\"1.3.0\"}}\n").summary.dependencies, 1);
assert.equal(createAssemblySemanticMergeEvidence("start:\n  lda #$01\n  rts\n", { dialect: "snes-asm" }).summary.instructions, 2);

function rowFor(matrix, parserPath) {
  const row = matrix.rows.find((candidate) => candidate.parserPath === parserPath);
  assert.ok(row, `expected parity row for ${parserPath}`);
  return row;
}

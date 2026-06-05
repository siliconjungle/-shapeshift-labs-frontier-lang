import assert from 'node:assert/strict';
import { compileFrontierSource } from '../dist/index.js';

const targets = ['typescript', 'javascript', 'rust', 'python', 'c'];
for (let index = 0; index < 100; index += 1) {
  const result = compileFrontierSource(`
module Fuzz${index} @id("mod_${index}")
entity Item @id("ent_${index}") {
  value @id("field_value_${index}"): Text
}
action updateItem @id("action_${index}") {
  input Item
  writes field_value_${index}
  returns Patch
}
`, { target: targets[index % targets.length] });
  assert.equal(result.ok, true);
  assert.ok(result.output.length > 0);
}

import { performance } from 'node:perf_hooks';
import { compileFrontierSource } from '../dist/index.js';

const source = `
module Bench @id("mod_bench")
entity Todo @id("ent_todo") {
  title @id("field_title"): Text
}
action updateTodo @id("action_update") {
  input Todo
  writes field_title
  returns Patch
}
`;

const targets = ['typescript', 'javascript', 'rust', 'python', 'c'];
const start = performance.now();
let bytes = 0;
for (let index = 0; index < 250; index += 1) {
  bytes += compileFrontierSource(source, { target: targets[index % targets.length] }).output.length;
}
console.log(JSON.stringify({ compiles: 250, bytes, durationMs: Number((performance.now() - start).toFixed(2)) }));

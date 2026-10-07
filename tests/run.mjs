import { getResults } from './engine.tests.mjs';

const results = getResults();
let failed = 0;
for (const r of results) {
  if (r.ok) console.log(`  ✅ ${r.name}`);
  else { failed++; console.error(`  ❌ ${r.name}\n${r.error}`); }
}
console.log(`\n${results.length - failed}/${results.length} تست موفق`);
process.exit(failed ? 1 : 0);

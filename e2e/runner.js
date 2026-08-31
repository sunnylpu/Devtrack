const { createDriver } = require('./config/driver');
const fs = require('fs');
const path = require('path');

async function runSpecs() {
  const specsDir = path.join(__dirname, 'specs');
  const specFiles = fs
    .readdirSync(specsDir)
    .filter((f) => f.endsWith('.spec.js'))
    .sort();

  const filterSpec = process.env.SPEC;
  const filesToRun = filterSpec
    ? specFiles.filter((f) => f.includes(filterSpec))
    : specFiles;

  if (filesToRun.length === 0) {
    console.error(`No test specifications matched filter: "${filterSpec}"`);
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('🚀 Starting DevTrack Pro Selenium End-to-End Test Suite');
  console.log(`📁 Found ${filesToRun.length} spec(s) to execute`);
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const file of filesToRun) {
    const specPath = path.join(specsDir, file);
    const spec = require(specPath);
    console.log(`\n▶ [RUNNING] ${file}: ${spec.name}`);

    let driver;
    const startTime = Date.now();

    try {
      driver = await createDriver();
      await spec.run(driver);
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✔ [PASSED] ${spec.name} (${duration}s)`);
      passed++;
      results.push({ file, name: spec.name, status: 'PASSED', duration });
    } catch (err) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.error(`✖ [FAILED] ${spec.name} (${duration}s)`);
      console.error(`   Error: ${err.message}`);
      failed++;
      results.push({ file, name: spec.name, status: 'FAILED', duration, error: err.message });
    } finally {
      if (driver) {
        try {
          await driver.quit();
        } catch {
          // ignore cleanup errors
        }
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary Report:');
  console.log('='.repeat(60));
  results.forEach((r) => {
    const icon = r.status === 'PASSED' ? '✔' : '✖';
    console.log(`${icon} ${r.file} - ${r.name} [${r.status}] (${r.duration}s)`);
    if (r.error) console.log(`   └─ Error: ${r.error}`);
  });
  console.log('='.repeat(60));
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('='.repeat(60));

  if (failed > 0) {
    process.exit(1);
  }
}

runSpecs().catch((err) => {
  console.error('Fatal Runner Error:', err);
  process.exit(1);
});

#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

async function loadScoringModule() {
  const scoringPath = path.resolve(__dirname, '../static/interview/scoring.js');
  const source = await fs.readFile(scoringPath, 'utf8');
  const encoded = Buffer.from(source, 'utf8').toString('base64');
  return import(`data:text/javascript;base64,${encoded}`);
}

function logScenario(name, report) {
  const summary = {
    score: report.score,
    band: report.band.key,
    dimensions: {
      correctness: report.dimensions.correctness.score,
      efficiency: report.dimensions.efficiency.score,
      codeQuality: report.dimensions.codeQuality.score
    },
    strengths: report.highlights.strengths,
    concerns: report.highlights.concerns
  };

  console.log(`\n[${name}]`);
  console.log(JSON.stringify(summary, null, 2));
}

async function main() {
  const {
    computeScore,
    buildInterviewReport,
    getScoreBand
  } = await loadScoringModule();

  const rawRunnerResults = [
    { passed: true, input: { nums: [2, 7], target: 9 }, expected: [0, 1], actual: [0, 1] },
    { passed: true, input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2], actual: [1, 2] },
    { passed: false, input: { nums: [3, 3], target: 6 }, expected: [0, 1], actual: [], error: 'Wrong answer' }
  ];

  const strongPayload = {
    publicTests: [
      { passed: true, runtimeMs: 12 },
      { passed: true, runtimeMs: 15 },
      { passed: true, runtimeMs: 10 }
    ],
    hiddenTests: [
      { passed: true, runtimeMs: 19 },
      { passed: true, runtimeMs: 22 },
      { passed: true, runtimeMs: 16 }
    ],
    performanceTests: [
      { runtimeMs: 40, thresholdMs: 50 },
      { runtimeMs: 55, thresholdMs: 60 }
    ],
    qualityHooks: [
      { name: 'naming', score: 0.9 },
      { name: 'mutability', score: 0.85 }
    ]
  };

  const overfitPayload = {
    publicTests: [
      { passed: true },
      { passed: true },
      { passed: true },
      { passed: true }
    ],
    hiddenTests: [
      { passed: true },
      { passed: false },
      { passed: false, error: 'Timeout' },
      { passed: false }
    ],
    performanceTests: [
      { runtimeMs: 180, thresholdMs: 60 },
      { runtimeMs: 120, thresholdMs: 60 }
    ],
    qualityHooks: {
      naming: { score: 0.4 },
      decomposition: { score: 0.3 }
    }
  };

  const currentScore = computeScore(rawRunnerResults);
  assert.equal(currentScore.dimensions.correctness.available, true);
  assert.equal(currentScore.sections.publicTests.total, 3);
  assert.equal(currentScore.dimensions.efficiency.available, false);
  assert.equal(currentScore.band.key, 'developing');

  const strongReport = buildInterviewReport(strongPayload, {}, { problemId: 'demo-strong' });
  assert.equal(strongReport.score, 95.98);
  assert.equal(strongReport.band.key, 'excellent');
  assert.equal(strongReport.sections.hiddenTests.passed, 3);
  assert.equal(strongReport.aiContext.facts.metadata.problemId, 'demo-strong');

  const overfitReport = buildInterviewReport(overfitPayload);
  assert.equal(overfitReport.band.key, 'developing');
  assert.ok(overfitReport.score < strongReport.score);
  assert.ok(
    overfitReport.highlights.concerns.some((item) => item.includes('overfitting')),
    'Expected overfit concern when hidden tests lag public tests.'
  );
  assert.deepEqual(getScoreBand(76), {
    key: 'strong',
    label: 'Strong',
    minScore: 75
  });

  logScenario('raw-runner-array', buildInterviewReport(rawRunnerResults));
  logScenario('strong-payload', strongReport);
  logScenario('overfit-payload', overfitReport);

  console.log('\nValidation passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

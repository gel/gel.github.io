const DEFAULT_SCORE_BANDS = [
  { key: 'excellent', label: 'Excellent', minScore: 90 },
  { key: 'strong', label: 'Strong', minScore: 75 },
  { key: 'developing', label: 'Developing', minScore: 50 },
  { key: 'needs-work', label: 'Needs Work', minScore: 0 }
];

const DEFAULT_RUBRIC = {
  weights: {
    correctness: 0.65,
    efficiency: 0.2,
    codeQuality: 0.15
  },
  correctness: {
    publicWeight: 0.4,
    hiddenWeight: 0.6
  },
  efficiency: {
    defaultScore: null
  },
  codeQuality: {
    publicWeight: 0.35,
    hiddenWeight: 0.45,
    performanceWeight: 0.2,
    runtimeErrorPenalty: 20,
    hiddenGapPenalty: 15,
    hookBlendWeight: 0.35
  },
  scoreBands: DEFAULT_SCORE_BANDS
};

const SECTION_PATHS = {
  publicTests: [
    'publicTests',
    'public',
    'testResults',
    'results',
    'tests.public',
    'results.public'
  ],
  hiddenTests: [
    'hiddenTests',
    'hidden',
    'tests.hidden',
    'results.hidden'
  ],
  performanceTests: [
    'performanceTests',
    'perfTests',
    'performance',
    'performance.tests',
    'results.performance'
  ],
  qualityHooks: [
    'qualityHooks',
    'hooks',
    'codeQualityHooks',
    'quality.hooks',
    'codeQuality.hooks'
  ]
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function roundTo(value, digits = 2) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function coercePassState(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  if (typeof value !== 'string') return null;

  const normalized = value.trim().toLowerCase();
  if (!normalized) return null;
  if (['pass', 'passed', 'success', 'ok', 'true'].includes(normalized)) return true;
  if (['fail', 'failed', 'error', 'false'].includes(normalized)) return false;
  return null;
}

function getPathValue(source, path) {
  if (!source || typeof source !== 'object') return undefined;
  return path.split('.').reduce((current, key) => {
    if (current == null || typeof current !== 'object') return undefined;
    return current[key];
  }, source);
}

function firstDefined(source, paths) {
  for (const path of paths) {
    const value = getPathValue(source, path);
    if (value !== undefined) return value;
  }
  return undefined;
}

function mergeConfig(base, overrides) {
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) {
    return Array.isArray(overrides) ? overrides.slice() : (overrides ?? base);
  }

  const merged = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (Array.isArray(value)) {
      merged[key] = value.slice();
      continue;
    }

    if (value && typeof value === 'object' && !Array.isArray(value) && base && typeof base[key] === 'object' && !Array.isArray(base[key])) {
      merged[key] = mergeConfig(base[key], value);
      continue;
    }

    merged[key] = value;
  }

  return merged;
}

function normalizeWeight(value, fallback = 1) {
  const numeric = toNumber(value);
  return numeric == null || numeric < 0 ? fallback : numeric;
}

function normalizeCaseResult(item, index, visibility) {
  const passed = coercePassState(
    item?.passed ?? item?.success ?? item?.ok ?? item?.status ?? item?.outcome
  );
  const runtimeMs = toNumber(
    item?.runtimeMs ??
    item?.durationMs ??
    item?.executionTimeMs ??
    item?.elapsedMs ??
    item?.timeMs
  );

  return {
    id: item?.id ?? `${visibility}-${index + 1}`,
    name: item?.name ?? item?.label ?? `Test ${index + 1}`,
    visibility,
    passed: passed ?? false,
    runtimeMs,
    error: item?.error ?? item?.exception ?? null,
    weight: normalizeWeight(item?.weight),
    actual: item?.actual,
    expected: item?.expected,
    input: item?.input,
    metadata: item?.metadata ?? null
  };
}

function normalizePerfResult(item, index) {
  const passed = coercePassState(
    item?.passed ?? item?.success ?? item?.ok ?? item?.status ?? item?.outcome
  );
  const runtimeMs = toNumber(
    item?.runtimeMs ??
    item?.durationMs ??
    item?.executionTimeMs ??
    item?.elapsedMs ??
    item?.actualMs ??
    item?.timeMs
  );
  const thresholdMs = toNumber(
    item?.thresholdMs ??
    item?.budgetMs ??
    item?.maxMs ??
    item?.targetMs ??
    item?.limitMs
  );
  const explicitScore = toNumber(item?.score ?? item?.normalizedScore);

  let scoreRatio = null;
  if (explicitScore != null) {
    scoreRatio = explicitScore > 1 ? explicitScore / 100 : explicitScore;
  } else if (runtimeMs != null && thresholdMs != null && thresholdMs > 0) {
    scoreRatio = clamp(thresholdMs / runtimeMs, 0, 1);
  } else if (passed != null) {
    scoreRatio = passed ? 1 : 0;
  }

  return {
    id: item?.id ?? `perf-${index + 1}`,
    name: item?.name ?? item?.label ?? `Performance ${index + 1}`,
    passed: passed ?? (scoreRatio != null ? scoreRatio >= 1 : false),
    runtimeMs,
    thresholdMs,
    weight: normalizeWeight(item?.weight),
    scoreRatio: scoreRatio == null ? null : clamp(scoreRatio, 0, 1),
    metadata: item?.metadata ?? null
  };
}

function normalizeHookResult(item, index) {
  const rawScore = toNumber(item?.score ?? item?.value ?? item?.normalizedScore);
  const maxScore = toNumber(item?.maxScore);
  const passed = coercePassState(item?.passed ?? item?.status ?? item?.outcome);

  let scoreRatio = null;
  if (rawScore != null && maxScore != null && maxScore > 0) {
    scoreRatio = rawScore / maxScore;
  } else if (rawScore != null) {
    scoreRatio = rawScore > 1 ? rawScore / 100 : rawScore;
  } else if (passed != null) {
    scoreRatio = passed ? 1 : 0;
  }

  return {
    id: item?.id ?? item?.name ?? `hook-${index + 1}`,
    name: item?.name ?? item?.label ?? `Hook ${index + 1}`,
    scoreRatio: scoreRatio == null ? null : clamp(scoreRatio, 0, 1),
    passed: passed ?? (scoreRatio != null ? scoreRatio >= 1 : null),
    weight: normalizeWeight(item?.weight),
    details: item?.details ?? item?.message ?? null,
    metadata: item?.metadata ?? null
  };
}

function objectEntriesToArray(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return [];

  return Object.entries(record).map(([name, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return { name, ...value };
    }

    return { name, score: value };
  });
}

function normalizeCollection(source, visibility) {
  if (!Array.isArray(source)) return [];
  return source.map((item, index) => normalizeCaseResult(item, index, visibility));
}

function normalizePerformanceCollection(source) {
  if (!Array.isArray(source)) return [];
  return source.map((item, index) => normalizePerfResult(item, index));
}

function normalizeHookCollection(source) {
  const collection = Array.isArray(source) ? source : objectEntriesToArray(source);
  return collection.map((item, index) => normalizeHookResult(item, index));
}

function summarizeCaseCollection(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const passedWeight = items.reduce((sum, item) => sum + (item.passed ? item.weight : 0), 0);
  const errorWeight = items.reduce((sum, item) => sum + (item.error ? item.weight : 0), 0);
  const runtimeItems = items.filter((item) => item.runtimeMs != null);
  const averageRuntimeMs = runtimeItems.length
    ? roundTo(runtimeItems.reduce((sum, item) => sum + item.runtimeMs, 0) / runtimeItems.length)
    : null;

  return {
    available: items.length > 0,
    total: items.length,
    passed: items.filter((item) => item.passed).length,
    failed: items.filter((item) => !item.passed).length,
    errors: items.filter((item) => item.error).length,
    weightedPassRate: totalWeight > 0 ? roundTo(passedWeight / totalWeight, 4) : 0,
    errorRate: totalWeight > 0 ? roundTo(errorWeight / totalWeight, 4) : 0,
    averageRuntimeMs,
    items
  };
}

function summarizePerformanceCollection(items) {
  const weightedTotal = items.reduce((sum, item) => sum + item.weight, 0);
  const weightedScore = items.reduce((sum, item) => {
    return sum + ((item.scoreRatio ?? (item.passed ? 1 : 0)) * item.weight);
  }, 0);
  const runtimeItems = items.filter((item) => item.runtimeMs != null);
  const thresholdItems = items.filter((item) => item.thresholdMs != null);

  return {
    available: items.length > 0,
    total: items.length,
    passed: items.filter((item) => item.passed).length,
    failed: items.filter((item) => !item.passed).length,
    weightedScore: weightedTotal > 0 ? roundTo(weightedScore / weightedTotal, 4) : 0,
    averageRuntimeMs: runtimeItems.length
      ? roundTo(runtimeItems.reduce((sum, item) => sum + item.runtimeMs, 0) / runtimeItems.length)
      : null,
    averageThresholdMs: thresholdItems.length
      ? roundTo(thresholdItems.reduce((sum, item) => sum + item.thresholdMs, 0) / thresholdItems.length)
      : null,
    items
  };
}

function summarizeHookCollection(items) {
  const weightedTotal = items.reduce((sum, item) => sum + item.weight, 0);
  const weightedScore = items.reduce((sum, item) => {
    return sum + ((item.scoreRatio ?? 0) * item.weight);
  }, 0);

  return {
    available: items.length > 0,
    total: items.length,
    passingHooks: items.filter((item) => item.passed === true).length,
    weightedScore: weightedTotal > 0 ? roundTo(weightedScore / weightedTotal, 4) : 0,
    items
  };
}

function normalizeResultPayload(resultPayload) {
  const source = Array.isArray(resultPayload) ? { publicTests: resultPayload } : (resultPayload ?? {});

  const publicTests = normalizeCollection(
    firstDefined(source, SECTION_PATHS.publicTests),
    'public'
  );
  const hiddenTests = normalizeCollection(
    firstDefined(source, SECTION_PATHS.hiddenTests),
    'hidden'
  );
  const performanceTests = normalizePerformanceCollection(
    firstDefined(source, SECTION_PATHS.performanceTests)
  );
  const qualityHooks = normalizeHookCollection(
    firstDefined(source, SECTION_PATHS.qualityHooks)
  );

  return {
    explicitScores: {
      correctness: toNumber(firstDefined(source, ['correctnessScore', 'scores.correctness'])),
      efficiency: toNumber(firstDefined(source, ['efficiencyScore', 'performanceScore', 'scores.efficiency'])),
      codeQuality: toNumber(firstDefined(source, ['codeQualityScore', 'qualityScore', 'scores.codeQuality']))
    },
    sections: {
      publicTests: summarizeCaseCollection(publicTests),
      hiddenTests: summarizeCaseCollection(hiddenTests),
      performanceTests: summarizePerformanceCollection(performanceTests),
      qualityHooks: summarizeHookCollection(qualityHooks)
    },
    metadata: source?.metadata ?? null
  };
}

function buildWeightedSectionScores(entries) {
  const availableEntries = entries.filter((entry) => entry.available);
  if (availableEntries.length === 0) {
    return { score: null, weightsUsed: {} };
  }

  const totalWeight = availableEntries.reduce((sum, entry) => sum + normalizeWeight(entry.weight), 0);
  const weightsUsed = {};
  const weightedScore = availableEntries.reduce((sum, entry) => {
    const normalizedWeight = totalWeight > 0 ? normalizeWeight(entry.weight) / totalWeight : 0;
    weightsUsed[entry.key] = roundTo(normalizedWeight, 4);
    return sum + (entry.score * normalizedWeight);
  }, 0);

  return {
    score: roundTo(weightedScore),
    weightsUsed
  };
}

function scoreCorrectness(normalized, rubric) {
  if (normalized.explicitScores.correctness != null) {
    return {
      id: 'correctness',
      label: 'Correctness',
      available: true,
      score: roundTo(clamp(normalized.explicitScores.correctness, 0, 100)),
      details: {
        source: 'explicit-score'
      }
    };
  }

  const publicSummary = normalized.sections.publicTests;
  const hiddenSummary = normalized.sections.hiddenTests;
  const publicScore = publicSummary.weightedPassRate * 100;
  const hiddenScore = hiddenSummary.weightedPassRate * 100;
  const combined = buildWeightedSectionScores([
    {
      key: 'publicTests',
      available: publicSummary.available,
      score: publicScore,
      weight: rubric.correctness.publicWeight
    },
    {
      key: 'hiddenTests',
      available: hiddenSummary.available,
      score: hiddenScore,
      weight: rubric.correctness.hiddenWeight
    }
  ]);

  return {
    id: 'correctness',
    label: 'Correctness',
    available: combined.score != null,
    score: combined.score,
    details: {
      publicTests: {
        score: roundTo(publicScore),
        passRate: publicSummary.weightedPassRate,
        passed: publicSummary.passed,
        total: publicSummary.total
      },
      hiddenTests: {
        score: roundTo(hiddenScore),
        passRate: hiddenSummary.weightedPassRate,
        passed: hiddenSummary.passed,
        total: hiddenSummary.total
      },
      weightsUsed: combined.weightsUsed
    }
  };
}

function scoreEfficiency(normalized, rubric) {
  if (normalized.explicitScores.efficiency != null) {
    return {
      id: 'efficiency',
      label: 'Efficiency',
      available: true,
      score: roundTo(clamp(normalized.explicitScores.efficiency, 0, 100)),
      details: {
        source: 'explicit-score'
      }
    };
  }

  const performanceSummary = normalized.sections.performanceTests;
  if (!performanceSummary.available) {
    if (rubric.efficiency.defaultScore == null) {
      return {
        id: 'efficiency',
        label: 'Efficiency',
        available: false,
        score: null,
        details: {
          source: 'missing'
        }
      };
    }

    return {
      id: 'efficiency',
      label: 'Efficiency',
      available: true,
      score: roundTo(clamp(rubric.efficiency.defaultScore, 0, 100)),
      details: {
        source: 'rubric-default'
      }
    };
  }

  return {
    id: 'efficiency',
    label: 'Efficiency',
    available: true,
    score: roundTo(performanceSummary.weightedScore * 100),
    details: {
      performanceTests: {
        score: roundTo(performanceSummary.weightedScore * 100),
        passed: performanceSummary.passed,
        total: performanceSummary.total,
        averageRuntimeMs: performanceSummary.averageRuntimeMs,
        averageThresholdMs: performanceSummary.averageThresholdMs
      }
    }
  };
}

function buildCodeQualityBase(normalized, rubric) {
  const publicSummary = normalized.sections.publicTests;
  const hiddenSummary = normalized.sections.hiddenTests;
  const performanceSummary = normalized.sections.performanceTests;

  const weighted = buildWeightedSectionScores([
    {
      key: 'publicTests',
      available: publicSummary.available,
      score: publicSummary.weightedPassRate * 100,
      weight: rubric.codeQuality.publicWeight
    },
    {
      key: 'hiddenTests',
      available: hiddenSummary.available,
      score: hiddenSummary.weightedPassRate * 100,
      weight: rubric.codeQuality.hiddenWeight
    },
    {
      key: 'performanceTests',
      available: performanceSummary.available,
      score: performanceSummary.weightedScore * 100,
      weight: rubric.codeQuality.performanceWeight
    }
  ]);

  if (weighted.score == null) {
    return {
      score: null,
      weightsUsed: {},
      penalties: {
        runtimeErrors: 0,
        hiddenGap: 0
      }
    };
  }

  const runtimeErrorRate = Math.max(publicSummary.errorRate, hiddenSummary.errorRate);
  const runtimePenalty = runtimeErrorRate * rubric.codeQuality.runtimeErrorPenalty;
  const hiddenGapPenalty = Math.max(
    0,
    (publicSummary.weightedPassRate || 0) - (hiddenSummary.available ? hiddenSummary.weightedPassRate : (publicSummary.weightedPassRate || 0))
  ) * rubric.codeQuality.hiddenGapPenalty;

  return {
    score: roundTo(clamp(weighted.score - runtimePenalty - hiddenGapPenalty, 0, 100)),
    weightsUsed: weighted.weightsUsed,
    penalties: {
      runtimeErrors: roundTo(runtimePenalty),
      hiddenGap: roundTo(hiddenGapPenalty)
    }
  };
}

function scoreCodeQuality(normalized, rubric) {
  if (normalized.explicitScores.codeQuality != null) {
    return {
      id: 'codeQuality',
      label: 'Code Quality Proxy',
      available: true,
      score: roundTo(clamp(normalized.explicitScores.codeQuality, 0, 100)),
      details: {
        source: 'explicit-score'
      }
    };
  }

  const hookSummary = normalized.sections.qualityHooks;
  const base = buildCodeQualityBase(normalized, rubric);

  if (base.score == null && !hookSummary.available) {
    return {
      id: 'codeQuality',
      label: 'Code Quality Proxy',
      available: false,
      score: null,
      details: {
        source: 'missing'
      }
    };
  }

  let score = base.score;
  let hookBlendWeight = 0;

  if (hookSummary.available) {
    hookBlendWeight = base.score == null
      ? 1
      : clamp(rubric.codeQuality.hookBlendWeight, 0, 1);

    const hookScore = hookSummary.weightedScore * 100;
    score = base.score == null
      ? hookScore
      : ((base.score * (1 - hookBlendWeight)) + (hookScore * hookBlendWeight));
  }

  return {
    id: 'codeQuality',
    label: 'Code Quality Proxy',
    available: true,
    score: roundTo(clamp(score, 0, 100)),
    details: {
      baseScore: base.score,
      hookScore: hookSummary.available ? roundTo(hookSummary.weightedScore * 100) : null,
      hookBlendWeight: roundTo(hookBlendWeight, 4),
      penalties: base.penalties,
      weightsUsed: base.weightsUsed,
      hooks: {
        total: hookSummary.total,
        passingHooks: hookSummary.passingHooks
      }
    }
  };
}

function computeOverallScore(dimensions, rubricWeights) {
  const entries = Object.values(dimensions).filter((dimension) => dimension.available && dimension.score != null);
  if (entries.length === 0) {
    return {
      score: 0,
      weightsUsed: {}
    };
  }

  const totalWeight = entries.reduce((sum, dimension) => {
    return sum + normalizeWeight(rubricWeights[dimension.id]);
  }, 0);
  const weightsUsed = {};
  const score = entries.reduce((sum, dimension) => {
    const normalizedWeight = totalWeight > 0 ? normalizeWeight(rubricWeights[dimension.id]) / totalWeight : 0;
    weightsUsed[dimension.id] = roundTo(normalizedWeight, 4);
    dimension.weight = roundTo(normalizedWeight, 4);
    dimension.weightedScore = roundTo(dimension.score * normalizedWeight);
    return sum + (dimension.score * normalizedWeight);
  }, 0);

  return {
    score: roundTo(score),
    weightsUsed
  };
}

export function getScoreBand(score, scoreBands = DEFAULT_SCORE_BANDS) {
  const bands = Array.isArray(scoreBands) && scoreBands.length > 0
    ? scoreBands.slice().sort((left, right) => right.minScore - left.minScore)
    : DEFAULT_SCORE_BANDS;
  const normalizedScore = clamp(toNumber(score) ?? 0, 0, 100);
  const band = bands.find((candidate) => normalizedScore >= candidate.minScore) ?? bands[bands.length - 1];

  return {
    key: band.key,
    label: band.label,
    minScore: band.minScore
  };
}

function buildHighlights(normalized, dimensions, overallScore, band) {
  const strengths = [];
  const concerns = [];

  const publicSummary = normalized.sections.publicTests;
  const hiddenSummary = normalized.sections.hiddenTests;
  const performanceSummary = normalized.sections.performanceTests;
  const hookSummary = normalized.sections.qualityHooks;

  if (dimensions.correctness.score >= 90) {
    strengths.push('Correctness is consistently strong across available tests.');
  }
  if (publicSummary.available && publicSummary.failed === 0) {
    strengths.push('All visible test cases passed.');
  }
  if (hiddenSummary.available && hiddenSummary.failed === 0) {
    strengths.push('Hidden coverage indicates the solution generalizes well.');
  }
  if (performanceSummary.available && dimensions.efficiency.score >= 85) {
    strengths.push('Performance tests stayed within the expected budget.');
  }
  if (hookSummary.available && dimensions.codeQuality.score >= 80) {
    strengths.push('Quality hooks reinforced the pass/fail signal.');
  }

  if (publicSummary.available && hiddenSummary.available) {
    const hiddenGap = roundTo((publicSummary.weightedPassRate - hiddenSummary.weightedPassRate) * 100);
    if (hiddenGap >= 20) {
      concerns.push('Hidden test pass rate trails the public pass rate, which suggests overfitting to visible cases.');
    }
  }
  if (performanceSummary.available && dimensions.efficiency.score < 70) {
    concerns.push('Performance results are below the target budget.');
  }
  if ((publicSummary.errors + hiddenSummary.errors) > 0) {
    concerns.push('Runtime errors were observed during execution.');
  }
  if (dimensions.codeQuality.score < 60) {
    concerns.push('The pass/fail pattern suggests maintainability or robustness issues.');
  }
  if (overallScore < 50 || band.key === 'needs-work') {
    concerns.push('The overall submission is not yet interview-ready.');
  }

  return { strengths, concerns };
}

export function computeScore(resultPayload, rubricConfig = {}) {
  const rubric = mergeConfig(DEFAULT_RUBRIC, rubricConfig);
  const normalized = normalizeResultPayload(resultPayload);

  const dimensions = {
    correctness: scoreCorrectness(normalized, rubric),
    efficiency: scoreEfficiency(normalized, rubric),
    codeQuality: scoreCodeQuality(normalized, rubric)
  };

  const overall = computeOverallScore(dimensions, rubric.weights);
  const band = getScoreBand(overall.score, rubric.scoreBands);
  const highlights = buildHighlights(normalized, dimensions, overall.score, band);

  return {
    score: overall.score,
    band,
    weightsUsed: overall.weightsUsed,
    dimensions,
    sections: normalized.sections,
    highlights
  };
}

function buildPromptContext(scorecard, metadata) {
  const publicSummary = scorecard.sections.publicTests;
  const hiddenSummary = scorecard.sections.hiddenTests;
  const performanceSummary = scorecard.sections.performanceTests;

  const summary = [
    `Overall score ${scorecard.score}/100 (${scorecard.band.label}).`,
    `Correctness ${scorecard.dimensions.correctness.score ?? 'n/a'}, efficiency ${scorecard.dimensions.efficiency.score ?? 'n/a'}, code quality proxy ${scorecard.dimensions.codeQuality.score ?? 'n/a'}.`,
    publicSummary.available
      ? `Public tests: ${publicSummary.passed}/${publicSummary.total} passed.`
      : 'Public tests: n/a.',
    hiddenSummary.available
      ? `Hidden tests: ${hiddenSummary.passed}/${hiddenSummary.total} passed.`
      : 'Hidden tests: n/a.',
    performanceSummary.available
      ? `Performance tests: ${performanceSummary.passed}/${performanceSummary.total} passed.`
      : 'Performance tests: n/a.'
  ].join(' ');

  return {
    summary,
    facts: {
      overallScore: scorecard.score,
      scoreBand: scorecard.band.key,
      dimensions: {
        correctness: scorecard.dimensions.correctness.score,
        efficiency: scorecard.dimensions.efficiency.score,
        codeQuality: scorecard.dimensions.codeQuality.score
      },
      tests: {
        publicPassed: publicSummary.passed,
        publicTotal: publicSummary.total,
        hiddenPassed: hiddenSummary.passed,
        hiddenTotal: hiddenSummary.total,
        performancePassed: performanceSummary.passed,
        performanceTotal: performanceSummary.total
      },
      strengths: scorecard.highlights.strengths,
      concerns: scorecard.highlights.concerns,
      metadata
    }
  };
}

export function buildInterviewReport(resultPayload, rubricConfig = {}, metadata = {}) {
  const scorecard = computeScore(resultPayload, rubricConfig);

  return {
    type: 'interview-report',
    version: 1,
    metadata: { ...metadata },
    ...scorecard,
    aiContext: buildPromptContext(scorecard, metadata)
  };
}

export default {
  computeScore,
  getScoreBand,
  buildInterviewReport
};

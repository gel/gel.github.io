#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const LIVE_DIR = path.join(ROOT, "content", "interviews", "live");
const PROBLEMS_DIR = path.join(ROOT, "static", "interview", "problems");
const CODING_CHAPTER_FILES = [
  path.join(ROOT, "content", "interviews", "3-coding-problems", "1_logical_and_maintainable.md"),
  path.join(ROOT, "content", "interviews", "3-coding-problems", "2_problem_solving.md")
];

const CHAPTER_SLUG_ALIASES = {
  "best-time-to-buy-and-sell-stock": "best-time-to-buy-sell-stock",
  "evaluate-reverse-polish-notation": "reverse-polish-notation",
  "longest-palindromic-substring": "longest-palindrome"
};

function listSlugs(dir, extension) {
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(extension))
    .map((file) => file.slice(0, -extension.length))
    .filter((slug) => slug !== "_index")
    .sort();
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function setDiff(a, b) {
  return [...a].filter((value) => !b.has(value)).sort();
}

function readCodingChapterSlugs() {
  const slugs = new Set();
  const itemRegex = /^- \[(.+?)\]\(#.+\)$/gm;

  for (const filePath of CODING_CHAPTER_FILES) {
    const content = fs.readFileSync(filePath, "utf8");
    let match;
    while ((match = itemRegex.exec(content)) !== null) {
      const fullTitle = match[1].trim();
      const problemTitle = fullTitle.split(" - ")[0].trim();
      const rawSlug = slugify(problemTitle);
      slugs.add(CHAPTER_SLUG_ALIASES[rawSlug] || rawSlug);
    }
  }

  return [...slugs].sort();
}

function loadProblemConfig(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(code, context, { filename: filePath });
  return context.window.problemConfig;
}

function validateProblemConfig(slug, config) {
  const issues = [];

  if (!config || typeof config !== "object") {
    issues.push("missing window.problemConfig object");
    return { issues, counts: null };
  }

  const publicTests = config.publicTests;
  const hiddenTests = config.hiddenTests;
  const performanceTests = config.performanceTests;
  const weights = config.rubric && config.rubric.weights;

  if (!Array.isArray(publicTests) || publicTests.length === 0) {
    issues.push("publicTests missing or empty");
  }
  if (!Array.isArray(hiddenTests) || hiddenTests.length === 0) {
    issues.push("hiddenTests missing or empty");
  }
  if (!Array.isArray(performanceTests) || performanceTests.length === 0) {
    issues.push("performanceTests missing or empty");
  }

  if (!weights || typeof weights !== "object") {
    issues.push("rubric.weights missing");
  } else {
    const values = Object.values(weights);
    const allNumeric = values.every((v) => typeof v === "number" && Number.isFinite(v) && v >= 0);
    if (!allNumeric || values.length === 0) {
      issues.push("rubric.weights must be numeric and non-negative");
    } else {
      const sum = values.reduce((acc, value) => acc + value, 0);
      if (Math.abs(sum - 1) > 1e-9) {
        issues.push(`rubric.weights must sum to 1 (actual: ${sum.toFixed(6)})`);
      }
    }
  }

  if (!Array.isArray(config.testCases)) {
    issues.push("testCases missing (UI compatibility)");
  }

  return {
    issues,
    counts: {
      public: Array.isArray(publicTests) ? publicTests.length : 0,
      hidden: Array.isArray(hiddenTests) ? hiddenTests.length : 0,
      performance: Array.isArray(performanceTests) ? performanceTests.length : 0
    }
  };
}

function printList(label, values) {
  console.log(`${label} (${values.length})`);
  if (values.length === 0) {
    console.log("  - none");
    return;
  }
  for (const value of values) {
    console.log(`  - ${value}`);
  }
}

function main() {
  const liveSlugs = listSlugs(LIVE_DIR, ".md");
  const problemSlugs = listSlugs(PROBLEMS_DIR, ".js");
  const codingChapterSlugs = readCodingChapterSlugs();

  const liveSet = new Set(liveSlugs);
  const problemSet = new Set(problemSlugs);
  const codingSet = new Set(codingChapterSlugs);

  const missingProblemForLive = setDiff(liveSet, problemSet);
  const missingLiveForProblem = setDiff(problemSet, liveSet);
  const missingLiveForCodingChapters = setDiff(codingSet, liveSet);

  console.log("=== Live Interview Sync Report ===");
  console.log("");

  printList("Live markdown slugs", liveSlugs);
  console.log("");
  printList("Problem config slugs", problemSlugs);
  console.log("");

  console.log("Slug pair validation");
  printList("Missing problem config for live markdown", missingProblemForLive);
  printList("Missing live markdown for problem config", missingLiveForProblem);
  console.log("");

  printList("Coding chapter problem slugs", codingChapterSlugs);
  printList("Coding chapter problems missing from live set", missingLiveForCodingChapters);
  console.log("");

  console.log("Problem config schema validation");
  const schemaErrors = [];

  for (const slug of problemSlugs) {
    const filePath = path.join(PROBLEMS_DIR, `${slug}.js`);
    let config;
    try {
      config = loadProblemConfig(filePath);
    } catch (error) {
      schemaErrors.push(`${slug}: failed to evaluate config (${error.message})`);
      continue;
    }

    const { issues, counts } = validateProblemConfig(slug, config);
    if (issues.length > 0) {
      schemaErrors.push(`${slug}: ${issues.join("; ")}`);
      continue;
    }

    console.log(`  - ${slug}: public=${counts.public}, hidden=${counts.hidden}, performance=${counts.performance}`);
  }

  if (schemaErrors.length > 0) {
    console.log("Schema issues");
    for (const error of schemaErrors) {
      console.log(`  - ${error}`);
    }
  }

  const hasErrors =
    missingProblemForLive.length > 0 ||
    missingLiveForProblem.length > 0 ||
    missingLiveForCodingChapters.length > 0 ||
    schemaErrors.length > 0;

  console.log("");
  if (hasErrors) {
    console.log("Sync status: FAIL");
    process.exitCode = 1;
    return;
  }

  console.log("Sync status: PASS");
}

main();

#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const repoRoot = path.resolve(__dirname, "..");
const liveDir = path.join(repoRoot, "content", "interviews", "live");
const problemsDir = path.join(repoRoot, "static", "interview", "problems");
const chapterDir = path.join(repoRoot, "content", "interviews", "3-coding-problems");
const chapterTitleAliases = {
  [normalizeTitle("Partitioning Into Minimum Number Of Deci-Binary Numbers")]:
    "partitioning-into-minimum-number-of-deci-binary-numbers",
  [normalizeTitle("Insert Greatest Common Divisors in Linked List")]:
    "insert-greatest-common-divisors-in-linked-list"
};

function listFiles(dir, extension) {
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(extension) && !file.startsWith("_"))
    .sort();
}

function slugFromFile(file) {
  return path.basename(file, path.extname(file));
}

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function uniqueTokens(title) {
  return [...new Set(normalizeTitle(title).split(" ").filter(Boolean))];
}

function isSubset(left, right) {
  return left.every((token) => right.includes(token));
}

function readFrontmatterTitle(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  let frontmatter = "";

  if (source.startsWith("+++\n")) {
    const end = source.indexOf("\n+++\n", 4);
    frontmatter = end === -1 ? "" : source.slice(4, end);
  } else if (source.startsWith("---\n")) {
    const end = source.indexOf("\n---\n", 4);
    frontmatter = end === -1 ? "" : source.slice(4, end);
  }

  const titleMatch = frontmatter.match(/^title\s*[:=]\s*["'](.+?)["']\s*$/m);
  return titleMatch ? titleMatch[1] : null;
}

function extractChapterTitles(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const matches = source.match(/^###\s+.+$/gm) || [];

  return matches.map((line) => {
    let title = line.replace(/^###\s+/, "").trim();
    title = title.replace(/\s+-\s+(Easy|Medium|Hard)\b.*$/i, "");
    title = title.replace(/\s+-\s+OO Design$/i, "");
    return title.trim();
  });
}

function loadProblemConfig(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: filePath });
  return sandbox.window.problemConfig;
}

function matchLiveTitle(chapterTitle, liveEntries) {
  const aliasedSlug = chapterTitleAliases[normalizeTitle(chapterTitle)];
  if (aliasedSlug) {
    return liveEntries.find((entry) => entry.slug === aliasedSlug) || null;
  }

  const normalizedChapterTitle = normalizeTitle(chapterTitle);
  const exactMatch = liveEntries.find((entry) => normalizeTitle(entry.title) === normalizedChapterTitle);
  if (exactMatch) {
    return exactMatch;
  }

  const chapterTokens = uniqueTokens(chapterTitle);
  const rankedMatches = liveEntries
    .map((entry) => {
      const liveTokens = uniqueTokens(entry.title);
      const subsetMatch =
        chapterTokens.length >= 2 &&
        liveTokens.length >= 2 &&
        (isSubset(chapterTokens, liveTokens) || isSubset(liveTokens, chapterTokens));

      return {
        entry,
        subsetMatch,
        distance: Math.abs(chapterTokens.length - liveTokens.length)
      };
    })
    .filter((candidate) => candidate.subsetMatch)
    .sort((left, right) => left.distance - right.distance);

  return rankedMatches.length === 1 ? rankedMatches[0].entry : null;
}

function sumWeights(weights) {
  return Object.values(weights).reduce((sum, value) => sum + value, 0);
}

const liveFiles = listFiles(liveDir, ".md");
const problemFiles = listFiles(problemsDir, ".js");

const liveSlugs = new Set(liveFiles.map(slugFromFile));
const problemSlugs = new Set(problemFiles.map(slugFromFile));

const missingProblemForLive = [...liveSlugs].filter((slug) => !problemSlugs.has(slug)).sort();
const missingLiveForProblem = [...problemSlugs].filter((slug) => !liveSlugs.has(slug)).sort();

const liveEntries = liveFiles.map((file) => {
  const slug = slugFromFile(file);
  return {
    slug,
    title: readFrontmatterTitle(path.join(liveDir, file)) || slug
  };
}).sort((left, right) => left.slug.localeCompare(right.slug));

const chapterFiles = listFiles(chapterDir, ".md");
const chapterQuestions = chapterFiles.flatMap((file) => {
  const fullPath = path.join(chapterDir, file);
  return extractChapterTitles(fullPath).map((title) => ({
    file,
    title
  }));
});

const chapterCoverage = chapterQuestions.map((question) => ({
  ...question,
  match: matchLiveTitle(question.title, liveEntries)
}));

const missingChapterCoverage = chapterCoverage.filter((entry) => !entry.match);

const schemaResults = problemFiles.map((file) => {
  const slug = slugFromFile(file);
  const fullPath = path.join(problemsDir, file);

  try {
    const config = loadProblemConfig(fullPath);
    const publicTests = Array.isArray(config.publicTests) ? config.publicTests : null;
    const hiddenTests = Array.isArray(config.hiddenTests) ? config.hiddenTests : null;
    const performanceTests = Array.isArray(config.performanceTests) ? config.performanceTests : null;
    const rubricWeights = config.rubric && config.rubric.weights && typeof config.rubric.weights === "object"
      ? config.rubric.weights
      : null;
    const weightsSum = rubricWeights ? sumWeights(rubricWeights) : null;

    const errors = [];
    if (!config || typeof config !== "object") {
      errors.push("window.problemConfig missing");
    }
    if (!config.methodName || typeof config.methodName !== "string") {
      errors.push("methodName missing");
    }
    if (!config.starterCode || typeof config.starterCode !== "string") {
      errors.push("starterCode missing");
    }
    if (!publicTests || publicTests.length === 0) {
      errors.push("publicTests missing");
    }
    if (!hiddenTests || hiddenTests.length === 0) {
      errors.push("hiddenTests missing");
    }
    if (!performanceTests || performanceTests.length === 0) {
      errors.push("performanceTests missing");
    }
    if (!Array.isArray(config.testCases)) {
      errors.push("testCases missing");
    } else if (publicTests && config.testCases.length !== publicTests.length) {
      errors.push("testCases should remain aligned with publicTests for the live runner");
    }
    if (!rubricWeights) {
      errors.push("rubric.weights missing");
    } else {
      const invalidWeight = Object.values(rubricWeights).some((value) => typeof value !== "number" || value <= 0);
      if (invalidWeight) {
        errors.push("rubric weights must be positive numbers");
      }
      if (Math.abs(weightsSum - 1) > 1e-9) {
        errors.push(`rubric weights must sum to 1.0 (found ${weightsSum})`);
      }
    }

    return {
      slug,
      publicCount: publicTests ? publicTests.length : 0,
      hiddenCount: hiddenTests ? hiddenTests.length : 0,
      performanceCount: performanceTests ? performanceTests.length : 0,
      weightsSum,
      errors
    };
  } catch (error) {
    return {
      slug,
      publicCount: 0,
      hiddenCount: 0,
      performanceCount: 0,
      weightsSum: null,
      errors: [error.message]
    };
  }
});

const schemaFailures = schemaResults.filter((result) => result.errors.length > 0);
const hasFailures =
  missingProblemForLive.length > 0 ||
  missingLiveForProblem.length > 0 ||
  missingChapterCoverage.length > 0 ||
  schemaFailures.length > 0;

console.log("=== Live Interview Sync Report ===");
console.log("");
console.log(`Live markdown files: ${liveFiles.length}`);
console.log(`Problem config files: ${problemFiles.length}`);
console.log("");

console.log("Slug sync:");
if (missingProblemForLive.length === 0 && missingLiveForProblem.length === 0) {
  console.log(`  OK: ${liveFiles.length} live slugs match ${problemFiles.length} problem slugs.`);
} else {
  if (missingProblemForLive.length > 0) {
    console.log(`  Missing problem config for live slug(s): ${missingProblemForLive.join(", ")}`);
  }
  if (missingLiveForProblem.length > 0) {
    console.log(`  Missing live markdown for problem slug(s): ${missingLiveForProblem.join(", ")}`);
  }
}
console.log("");

console.log("Coding problems chapter coverage:");
chapterCoverage.forEach((entry) => {
  if (entry.match) {
    console.log(`  OK: ${entry.title} -> ${entry.match.slug}`);
  } else {
    console.log(`  MISSING: ${entry.title} (${entry.file})`);
  }
});
console.log("");

console.log("Problem config schema:");
schemaResults.forEach((result) => {
  const counts = `public=${result.publicCount} hidden=${result.hiddenCount} performance=${result.performanceCount}`;
  const weights = result.weightsSum === null ? "weights=n/a" : `weights=${result.weightsSum.toFixed(2)}`;
  if (result.errors.length === 0) {
    console.log(`  OK: ${result.slug} (${counts}, ${weights})`);
  } else {
    console.log(`  FAIL: ${result.slug} (${counts}, ${weights})`);
    result.errors.forEach((error) => console.log(`    - ${error}`));
  }
});
console.log("");

if (hasFailures) {
  console.log("Result: FAIL");
  process.exit(1);
}

console.log("Result: PASS");

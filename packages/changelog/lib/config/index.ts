import { ChangelogOption } from "../types";
import { getVersionFromPkgJson } from "../version";
import {
  getGitHubRepo,
  getLastGitTag,
  getCurrentGitBranch,
  getFirstGitCommit,
  getTotalGitTags,
  getTagDateMap,
  isPrerelease,
} from "../git";

function createDefaultOptions() {
  const cwd = process.cwd();
  const options: ChangelogOption = {
    cwd,
    types: {
      feat: "🚀 Features",
      fix: "🐞 Bug Fixes",
      perf: "🔥 Performance",
      refactor: "💅 Refactors",
      docs: "📖 Documentation",
      build: "📦 Build",
      types: "🌊 Types",
      chore: "🏡 Chore",
      examples: "🏀 Examples",
      test: "✅ Tests",
      style: "🎨 Styles",
      ci: "🤖 CI",
    },
    github: {
      repo: "",
      token: process.env.GITHUB_TOKEN || "",
    },
    from: "",
    to: "",
    tags: [],
    tagDateMap: new Map(),
    capitalize: false,
    emoji: true,
    titles: {
      breakingChanges: "🚨 Breaking Changes",
    },
    output: "CHANGELOG.md",
    regenerate: false,
    newVersion: "",
  };

  return options;
}

export async function createOptions(options?: Partial<ChangelogOption>) {
  const opts = createDefaultOptions();
  Object.assign(opts, options);

  const { newVersion } = await getVersionFromPkgJson(opts.cwd);
  opts.github.repo ||= await getGitHubRepo();

  opts.newVersion ||= `v${newVersion}`;
  opts.from ||= await getLastGitTag();
  opts.to ||= await getCurrentGitBranch();

  if (opts.to === opts.from) {
    const lastTag = await getLastGitTag(-1);
    const firstCommit = await getFirstGitCommit();
    opts.from = lastTag || firstCommit;
  }
  opts.tags = await getTotalGitTags();
  opts.tagDateMap = await getTagDateMap();
  opts.prerelease = opts.prerelease ?? isPrerelease(opts.to);
  return opts;
}

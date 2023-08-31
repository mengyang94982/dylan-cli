import {ChangelogOption} from "../types";

import {readFile} from 'fs/promises'

import {
  getCurrentGitBranch,
  getGithubRepo,
  getLastGitTag,
  getFirstGitCommit,
  getTotalGitTags,
  getTagDateMap,
  isPrerelease
} from './git'

/**
 * 默认配置
 */
function createDefaultOptions() {
  const cwd = process.cwd()
  const options: ChangelogOption = {
    cwd,
    types: {
      init: "🎉 Initial Release",
      feat: "🚀 Features",
      fix: "🐞 Bug Fixes",
      docs: "📖 Documentation",
      style: "🎨 Styles",
      refactor: "💅 Refactors",
      perf: "🔥 Performance",
      test: "✅ Tests",
      ci: "🤖 CI",
      chore: "🏡 Chore",
      revert: "🔄 Revert",
      build: "📦 Build",
      types: "🌊 Types",
      examples: "🏀 Examples",
    },
    github: {
      repo: "",
      token: process.env.GITHUB_TOKEN || ''
    },
    from: '',
    to: '',
    tags: [],
    tagDateMap: new Map(),
    capitalize: false,
    emoji: true,
    titles: {
      breakingChanges: "🚨 Breaking Changes"
    },
    output: "CHANGELOG.md",
    regenerate: false,
    newVersion: ""
  }
  return options
}

/**
 * 获取当前项目的package.json中的version属性
 * @param cwd 当前项目所在的目录
 */
async function getVersionFromPkgJson(cwd: string) {
  let newVersion = ''
  try {
    const pkgJson = await readFile(`${cwd}/package.json`, 'utf-8')
    const pkg = JSON.parse(pkgJson)
    newVersion = pkg?.version || ''
  } catch {
  }
  return {
    newVersion
  }

}

/**
 * 创建配置项
 * @param options
 */
export async function createOptions(options?: Partial<ChangelogOption>) {
  const opts = createDefaultOptions()

  Object.assign(opts, options)
  const {newVersion} = await getVersionFromPkgJson(opts.cwd)

  // mengyang94982/dylan-cli
  opts.github.repo ||= await getGithubRepo()
  opts.newVersion ||= `v${newVersion}`
  opts.from ||= await getLastGitTag()
  opts.to ||= await getCurrentGitBranch()

  // 两个tag相同
  if (opts.to === opts.from) {
    //获取倒数第二个tag
    const lastTag = await getLastGitTag(-1)
    const firstCommit = await getFirstGitCommit()
    // to的tag上一个tag 或者是第一次提交的信息
    opts.from = lastTag || firstCommit
  }

  opts.tags = await getTotalGitTags()
  opts.tagDateMap = await getTagDateMap()
  opts.prerelease = opts.prerelease ?? isPrerelease(opts.to)
  return opts
}
#!/usr/bin/env node

import cac from 'cac'
import {version} from '../package.json'

import {
  gitCommit,
  gitCommitVerify,
  cleanup,
  initSimpleGitHooks,
  ncu,
  prettierWrite,
  execLintStaged,
  genChangelog,
  release
} from "./command"
import {loadCliOptions} from './config'

import type {CliOption} from "./types"


type Command =
  | 'git-commit'
  | 'git-commit-verify'
  | 'cleanup'
  | 'init-simple-git-hooks'
  | 'ncu'
  | 'prettier-write'
  | 'lint-staged'
  | 'changelog'
  | 'release'


type CommandAction<A extends object> = (args?: A) => Promise<void> | void

type CommandWithAction<A extends object = object> = Record<Command, { desc: string; action: CommandAction<A> }>

interface CommandArg {
  total?: boolean
}


export async function setupCli() {
  const cliOptions = await loadCliOptions()

  const cli = cac('dylan')
  cli
    .version(version)
    .option('--total', 'Generate changelog by total tags')
    .help()

  const commands: CommandWithAction<CommandArg> = {
    'git-commit': {
      desc: '生成符合 Conventional Commits 规范的提交信息',
      action: async () => {
        await gitCommit(cliOptions.gitCommitTypes, cliOptions.gitCommitScopes)
      }
    },
    'git-commit-verify': {
      desc: "校验 git 提交信息是否符合 Conventional Commits 规范",
      action: async () => {
        await gitCommitVerify()
      }
    },
    cleanup: {
      desc: '清空依赖项和构建文件',
      action: async () => {
        await cleanup(cliOptions.cleanupDirs)
      }
    },
    'init-simple-git-hooks': {
      desc: '初始化 simple-git-hooks 钩子',
      action: async () => {
        await initSimpleGitHooks(cliOptions.cwd)
      }
    },
    ncu: {
      desc: '命令 npm-check-updates，升级依赖',
      action: async () => {
        await ncu(cliOptions.ncuCommandArgs)
      }
    },
    'prettier-write': {
      desc: "执行 prettier --write 格式化",
      action: async () => {
        await prettierWrite(cliOptions.prettierWriteGlob)
      }
    },
    "lint-staged": {
      desc: '执行lint-staged',
      action: async () => {
        const passed = await execLintStaged(cliOptions.lintStagedConfig).catch(() => {
          process.exitCode = 1
        })
        process.exitCode = passed ? 0 : 1
      }
    },
    'changelog': {
      desc: "生成changelog",
      action: async (args) => {

        await genChangelog(cliOptions.changelogOptions, args?.total)
      }
    },
    release:{
      desc:'发布：更新版本号、生成changelog、提交代码',
      action:release
    }
  }

  for await (const [command, {desc, action}] of Object.entries(commands)) {
    cli.command(command, desc).action(action)
  }

  cli.parse()
}

export function defineConfig (config?:Partial<CliOption>) {
  return config
}

export type {CliOption}
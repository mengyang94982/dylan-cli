#!/usr/bin/env node

import cac from 'cac'
import {version} from '../package.json'

import {loadCliOptions} from './config'

import {gitCommit,initSimpleGitHooks, gitCommitVerify,execLintStaged,cleanup} from "./command"

type Command =
  | 'git-commit'
  | 'init-simple-git-hooks'
  | 'git-commit-verify'
  | 'lint-staged'
  | 'cleanup'

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
      desc: "生成符合 Conventional Commits 规范的提交信息",
      action: async () => {
        await gitCommit(cliOptions.gitCommitTypes, cliOptions.gitCommitScopes)
      }
    },
    'init-simple-git-hooks':{
      desc: '初始化 simple-git-hooks 钩子',
      action:async ()=>{
        await initSimpleGitHooks(cliOptions.cwd)
      }
    },
    'git-commit-verify': {
      desc: '校验 git 提交信息是否符合 Conventional Commits 规范',
      action: async () => {
        await gitCommitVerify()
      }
    },
    'lint-staged':{
      desc:'执行lint-staged',
      action:async ()=>{
        const passed = await execLintStaged(cliOptions.lintStagedConfig).catch(() => {
          process.exitCode = 1
        })
        process.exitCode = passed ? 0 : 1
      }
    },
    cleanup:{
      desc:'清空依赖项和构建文件',
      action:async ()=>{
        await cleanup(cliOptions.cleanupDirs)
      }
    }
  }

  for await (const [command, {desc, action}] of Object.entries(commands)) {
    cli.command(command, desc).action(action)
  }

  cli.parse()
}
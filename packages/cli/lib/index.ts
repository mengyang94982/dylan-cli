#!/usr/bin/env node

import cac from 'cac'
import {version} from '../package.json'

import {loadCliOptions} from './config'

import {
  gitCommit,
} from "./command"

type Command =
  | 'git-commit'

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
    }
  }

  for await (const [command,{desc,action}] of Object.entries(commands)){
    cli.command(command,desc).action(action)
  }

  cli.parse()
}
#!/usr/bin/env node

import cac from 'cac'
import {version} from '../package.json'

import {loadCliOptions} from './config'

import {cleanup,create, execLintStaged,genChangelog,gitCommit,gitCommitVerify,initSimpleGitHooks,prettierWrite,release,taze} from "./command"

type Command =
  | 'git-commit'
  | 'init-simple-git-hooks'
  | 'git-commit-verify'
  | 'lint-staged'
  | 'cleanup'
  | 'prettier-write'
  | 'taze'
  | 'changelog'
  | 'release'
  | 'create'

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
    .option('--total', '把所有的tags生成changelog，通常第一次使用')
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
        await initSimpleGitHooks()
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
    },
    'prettier-write':{
      desc:"执行 prettier --write 格式化",
      action:async ()=>{
        await prettierWrite(cliOptions.prettierWriteGlob)
      }
    },
    taze:{
      desc:"taze命令, 用来升级依赖",
      action:async () => {
        return await taze()
      }
    },
    changelog:{
      desc:"生成changelog",
      action:async args=>{
        await genChangelog(cliOptions.changelogOptions, args?.total)
      }
    },
    release: {
      desc: '发布：更新版本号、生成changelog、提交代码',
      action: async () => {
        await release();
      }
    },
    create:{
      desc:'通过my create命令创建不同的项目模板',
      action:async ()=>{
        await create(cliOptions.cwd)
      }
    }
  }

  for await (const [command, {desc, action}] of Object.entries(commands)) {
    cli.command(command, desc).action(action).allowUnknownOptions()
  }

  cli.parse()
}
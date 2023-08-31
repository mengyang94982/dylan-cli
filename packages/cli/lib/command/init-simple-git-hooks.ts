import path from 'path'
import {existsSync} from 'fs'
import {execCommand} from "../shared";
import {rimraf} from "rimraf";
import * as process from "process";


export async function initSimpleGitHooks(cwd = process.cwd()) {
  // 获取.husky文件夹路径
  const huskyDir = path.join(cwd, '.husky')
  // 判断目录存在不存在
  const existHusky = existsSync(huskyDir)
  // 获取git/hooks目录路径
  const gitHooksDir = path.join(cwd, 'git', 'hooks')
  // 如果.husky目录存在的话,就把这个目录设置为git的hooks目录
  if (existHusky) {
    await rimraf(huskyDir)
    await execCommand('git', ['config', 'core.hooksPath', gitHooksDir], {stdio: 'inherit'})
  }

  // 先清空目录
  await rimraf(gitHooksDir)
  await execCommand('npx', ['simple-git-hooks'], {stdio: 'inherit'})
}

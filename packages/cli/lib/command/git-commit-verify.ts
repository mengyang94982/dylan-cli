import path from 'path'
import {readFileSync} from 'fs'
import {bgRed, green, red} from "kolorist";
import {execCommand} from "../shared";

export async function gitCommitVerify() {
  // 获取目录 C:/Users/my466/Desktop/git-demo
  const gitPath = await execCommand('git', ['rev-parse', '--show-toplevel'])

  // 获取当前目录下的.git文件夹下面的COMMIT_EDITMSG文件
  const gitMsgPath = path.join(gitPath, '.git', 'COMMIT_EDITMSG')

  // feat(projects)：kkk  获取的是最后一次的提交信息
  const commitMsg = readFileSync(gitMsgPath, 'utf-8').trim()

  const REG_EXP = /(?<type>[a-z]+)(\((?<scope>.+)\))?(?<breaking>!)?: (?<description>.+)/i;

  if (!REG_EXP.test(commitMsg)) {
    throw new Error(`${bgRed(' ERROR ')} ${red('Git提交信息不符合 Angular 规范!\n\n')}${green(
      '推荐使用命令 pnpm commit 生成符合规范的Git提交信息'
    )}`)
  }

}

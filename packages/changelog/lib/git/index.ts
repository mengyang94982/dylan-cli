import { execCommand } from "../shared";
import dayjs from "dayjs";
import { VERSION_REG } from "../constant";
import type { RawGitCommit } from "../types";

/**
 * 获取仓库url地址
 * @returns 去掉http 和后面.git 之后的字符串
 */
export async function getGitHubRepo() {
  const url = await execCommand("git", [
    "config",
    "--get",
    "remote.origin.url",
  ]);
  const match = url.match(
    /github\.com[/:]([\w\d._-]+?)\/([\w\d._-]+?)(\.git)?$/i
  );
  if (!match) {
    // 没找到仓库地址抛出错误
    throw new Error(`Can not parse GitHub repo from url ${url}`);
  }
  // mengyang94982/dylan-cli
  return `${match[1]}/${match[2]}`;
}

/**
 * 获取tags数组的最后一个
 * @param delta 获取的位数
 * @returns 默认获取最后一个tag
 */
export async function getLastGitTag(delta = 0) {
  const tags = await getTotalGitTags();

  return tags[tags.length + delta - 1];
}

/**
 * 获取到仓库所有的tags
 * @returns 所有的tags
 */
export async function getTotalGitTags() {
  // 获取到字符串形式的所有的tags
  const tagStr = await execCommand("git", [
    "--no-pager",
    "tag",
    "-l",
    "--sort=creatordate",
  ]);
  const tags = tagStr.split("\n");
  return tags;
}

/**
 * 有tag返回tag 没有返回当前分支名
 * @returns 当前分支或最后tag
 */
export async function getCurrentGitBranch() {
  const tag = await execCommand("git", ["tag", "--points-at", "HEAD"]);
  const main = getGitMainBranchName();
  return tag || main;
}

/**
 * 获取当前分支的名称
 * @returns 当前分支的名称
 */
async function getGitMainBranchName() {
  const main = await execCommand("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
  return main;
}

/**
 * 获取第一次提交的git commit的id
 * @returns 第一次提交的commitId
 */
export function getFirstGitCommit() {
  return execCommand("git", ["rev-list", "--max-parents=0", "HEAD"]);
}

/**
 * 是否有beta|alpha版本的tag
 * @returns
 */
export async function getTagDateMap() {
  // 自定义格式显示git日志
  const tagDateStr = await execCommand("git", [
    "--no-pager",
    "log",
    "--tags",
    "--simplify-by-decoration",
    "--pretty=format:%ci %d",
  ]);
  const TAG_MARK = "tag: ";
  const map = new Map<string, string>();
  const dates = tagDateStr
    .split("\n")
    .filter((item) => item.includes(TAG_MARK));
  dates.forEach((item) => {
    const [dateStr, tagStr] = item.split(TAG_MARK);
    const date = dayjs(dateStr).format("YYYY-MM-DD");

    const tag = tagStr.match(VERSION_REG)?.[0];
    if (tag && date) {
      map.set(tag.trim(), date);
    }
  });
  return map;
}

/**
 * 是否是预发布版本
 * @param version 版本号
 * @returns 是否是预发布版本
 */
export function isPrerelease(version: string) {
  const REG = /^[^.]*[\d.]+$/;

  return !REG.test(version);
}

/**
 * 将所有的tag格式化成
 * { from: '0.0.1', to: '0.0.2' },
  { from: '0.0.2', to: '0.0.3' },
  { from: '0.0.3', to: '0.0.4' },
  { from: '0.0.4', to: '0.0.5' }
 * @param tags 所有的tag
 * @returns { from: '0.0.1', to: '0.0.2' }...
 */
export function getFromToTags(tags: string[]) {
  const result: { from: string; to: string }[] = [];
  tags.forEach((tag, index) => {
    if (index < tags.length - 1) {
      result.push({ from: tag, to: tags[index + 1] });
    }
  });
  return result;
}

export async function getGitCommits(from?: string, to = "HEAD") {
  const rwaGitCommits = await getGitDiff(from, to);
}

/**
 * 
 * @param from 
 * @param to 
 * @returns 
 */
async function getGitDiff(from?: string, to = "HEAD"): Promise<RawGitCommit[]> {
  // https://git-scm.com/docs/pretty-formats
  // 获取最后一次commit详细的信息
  const rawGit = await execCommand("git", [
    "--no-pager",
    "log",
    `${from ? `${from}...` : ""}${to}`,
    '--pretty="----%n%s|%h|%an|%ae%n%b"',
    "--name-status",
  ]);
  const rawGitLines = rawGit.split("----\n").splice(1);
  const gitCommits = rawGitLines.map((line) => {
    const [firstLine, ...body] = line.split("\n");
    const [message, shortHash, authorName, authorEmail] = firstLine.split("|");
    const gitCommit: RawGitCommit = {
      message,
      shortHash,
      author: { name: authorName, email: authorEmail },
      body: body.join("\n"),
    };
    return gitCommit;
  });
  console.log("🚀 ~ file: index.ts:171 ~ gitCommits ~ gitCommits:", gitCommits)
  return gitCommits;
}

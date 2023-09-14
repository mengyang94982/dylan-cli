import dayjs from "dayjs";
import {notNullish} from "@dylanjs/utils";
import {ofetch} from 'ofetch';
import {execCommand} from "../shared";
import {CoAuthoredByRegex, ConventionalCommitRegex, IssueRE, PullRequestRE, VERSION_REG} from "../constant";
import type {GitCommit, GitCommitAuthor, GithubConfig, RawGitCommit, Reference, ResolvedAuthor} from "../types";



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
      result.push({from: tag, to: tags[index + 1]});
    }
  });
  return result;
}

export async function getGitCommits(from?: string, to = "HEAD") {
  const rawGitCommits = await getGitDiff(from, to);
  const commits = rawGitCommits.map(commit => parseGitCommit(commit)).filter(notNullish)
  return commits
}

/**
 * 获取最新的提交日志
 * @param from 日志开始的范围
 * @param to 日志结束的范围
 * @returns 最新的提交日志
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
  return rawGitLines.map((line) => {
    const [firstLine, ...body] = line.split("\n");
    const [message, shortHash, authorName, authorEmail] = firstLine.split("|");
    const gitCommit: RawGitCommit = {
      message,
      shortHash,
      author: {name: authorName, email: authorEmail},
      body: body.join("\n"),
    };
    return gitCommit;
  });
}

function parseGitCommit(commit: RawGitCommit): GitCommit | null {
  // https://www.conventionalcommits.org/en/v1.0.0/
  // https://regex101.com/r/FSfNvA/1


  const match = commit.message.match(ConventionalCommitRegex)
  if (!match?.groups) {
    return null
  }
  const type = match.groups.type;
  const scope = match.groups.scope || '';
  const isBreaking = Boolean(match.groups.breaking);
  let description = match.groups.description;

  const references: Reference[] = [];
  for (const m of description.matchAll(PullRequestRE)) {
    references.push({type: 'pull-request', value: m[1]});
  }
  for (const m of description.matchAll(IssueRE)) {
    if (!references.some(i => i.value === m[1])) {
      references.push({type: 'issue', value: m[1]});
    }
  }
  references.push({value: commit.shortHash, type: 'hash'});
  // Remove references and normalize
  description = description.replace(PullRequestRE, '').trim();
  // Find all authors
  const authors: GitCommitAuthor[] = [commit.author];
  const matches = commit.body.matchAll(CoAuthoredByRegex);

  for (const $match of matches) {
    const {name = '', email = ''} = $match.groups || {};

    const author: GitCommitAuthor = {
      name: name.trim(),
      email: email.trim()
    };

    authors.push(author);
  }

  return {
    ...commit,
    authors,
    resolvedAuthors: [],
    description,
    type,
    scope,
    references,
    isBreaking
  };
}

export async function getGitCommitsAndResolvedAuthors(
  commits: GitCommit[],
  github: GithubConfig,
  resolvedLogins?: Map<string, string>
) {
  const resultCommits: GitCommit[] = [];
  const map = new Map<string, ResolvedAuthor>();
  for await (const commit of commits) {
    const resolvedAuthors: ResolvedAuthor[] = [];

    for await (const [index, author] of commit.authors.entries()) {
      const {email, name} = author;

      if (email && name) {
        const commitHashes: string[] = [];

        if (index === 0) {
          commitHashes.push(commit.shortHash);
        }

        const resolvedAuthor: ResolvedAuthor = {
          name,
          email,
          commits: commitHashes,
          login: ''
        };

        if (!resolvedLogins?.has(email)) {
          const login = await getResolvedAuthorLogin(github, commitHashes, email);
          resolvedAuthor.login = login;

          resolvedLogins?.set(email, login);
        } else {
          const login = resolvedLogins?.get(email) || '';
          resolvedAuthor.login = login;
        }

        resolvedAuthors.push(resolvedAuthor);

        if (!map.has(email)) {
          map.set(email, resolvedAuthor);
        }
      }
    }

    const resultCommit = {...commit, resolvedAuthors};

    resultCommits.push(resultCommit);
  }
  return {
    commits: resultCommits,
    contributors: Array.from(map.values())
  };
}

async function getResolvedAuthorLogin(github: GithubConfig, commitHashes: string[], email: string) {
  let login = '';

  // try {
    const data = await ofetch(`https://ungh.cc/users/find/${email}`);
    login = data?.user?.username || '';
  // } catch () {
    
  // }

  if (login) {
    return login;
  }

  const {repo, token} = github;

  // token not provided, skip github resolving
  if (!token) {
    return login;
  }

  if (commitHashes.length) {
    // try {
      const data = await ofetch(`https://api.github.com/repos/${repo}/commits/${commitHashes[0]}`, {
        headers: getHeaders(token)
      });
      login = data?.author?.login || '';
    // } catch () {
      
    // }
  }

  if (login) {
    return login;
  }

  // try {
    const emailData = await ofetch(`https://api.github.com/search/users?q=${encodeURIComponent(email)}`, {
      headers: getHeaders(token)
    });
    login = emailData.items[0].login;
  // } catch () {
    
  // }

  return login;
}

function getHeaders(githubToken: string) {
  return {
    accept: 'application/vnd.github.v3+json',
    authorization: `token ${githubToken}`
  };
}

export function getUserGithub(userName: string) {
  return `https://github.com/${userName}`;
}

export function getGitUserAvatar(userName: string) {
  const githubUrl = getUserGithub(userName);

  return `${githubUrl}.png?size=48`;
}

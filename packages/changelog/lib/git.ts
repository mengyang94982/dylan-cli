import {execCommand, notNullish} from "./shared";
import dayjs from 'dayjs'
import {VERSION_REG} from "./constant";
import type {RawGitCommit, GitCommit, Reference, GitCommitAuthor, GithubConfig, ResolvedAuthor} from "../types";

import {ofetch} from 'ofetch';

/**
 * 获取到所有的tags
 * return [tag1,tag2,...]
 */
export async function getTotalGitTags() {
  const tagStr = await execCommand('git', ['--no-pager', 'tag', '-l', '--sort=creatordate'])

  const tags = tagStr.split('\n')

  return tags
}

/**
 *
 */
export async function getGithubRepo() {
  //获取git地址
  const url = await execCommand('git', ['config', '--get', 'remote.origin.url'])
  //判断是否是github的地址 如果是gitee的地址就报错
  const match = url.match(/github\.com[/:]([\w\d._-]+?)\/([\w\d._-]+?)(\.git)?$/i)
  if (!match) {
    throw new Error(`Can not parse GitHub repo from url ${url}`);
  }
  return `${match[1]}/${match[2]}`
}

/**
 * 获取到最后一个tag
 * @param delta 以最后一个为基准 传入几就获取最后一个前面的第几个
 */
export async function getLastGitTag(delta = 0) {
  const tags = await getTotalGitTags()

  return tags[tags.length + delta - 1]
}

/**
 * 返回当前的tag或者当前的分支名
 */
export async function getCurrentGitBranch() {
  // 查看当前tag
  const tag = await execCommand('git', ['tag', '--points-at', 'HEAD'])
  const master = getGitMasterBranchName()
  return tag || master
}

/**
 * 获取到当前分支名
 */
export async function getGitMasterBranchName() {
  const master = await execCommand('git', ['rev-parse', '--abbrev-ref', 'HEAD'])
  return master
}

/**
 * 获取第一次的提交信息
 */
export function getFirstGitCommit() {
  return execCommand('git', ['rev-list', '--max-parents=0', 'HEAD'])
}

/**
 * 将tag和时间组合成一个map 返回出去
 * return  Map(2) { 'v0.0.3' => '2023-07-14', 'v0.0.2' => '2023-07-06' }
 */
export async function getTagDateMap() {
  /**
   * 获取到所有标签的创建时间
   * 2023-07-14 10:02:49 +0800  (tag: v0.0.3)
   * 2023-07-06 15:32:28 +0800  (tag: v0.0.2)
   * 2023-07-05 16:58:12 +0800
   */
  const tagDateStr = await execCommand('git', ['--no-pager',
    'log',
    '--tags',
    '--simplify-by-decoration',
    '--pretty=format:%ci %d'])

  const TAG_MARK = 'tag: '
  const map = new Map<string, string>()
  const dates = tagDateStr.split('\n').filter(item => item.includes(TAG_MARK))
  dates.forEach(item => {
    const [dateStr, tagStr] = item.split(TAG_MARK)
    const date = dayjs(dateStr).format('YYYY-MM-DD')
    const tag = tagStr.match(VERSION_REG)?.[0]
    if (tag && date) {
      map.set(tag.trim(), date)
    }
  })
  return map
}

/**
 * 是否是预发布的版本
 * @param version
 */
export function isPrerelease(version: string) {
  const REG = /^[^.]*[\d.]+$/
  return !REG.test(version)
}

export function getFromToTags(tags: string[]) {
  const result: { from: string; to: string }[] = []
  tags.forEach((tag, index) => {
    if (index < tags.length - 1) {
      result.push({
        from: tag,
        to: tags[index + 1]
      })
    }
  })
  return result
}

/**
 *
 * @param from
 * @param to
 */
export async function getGitCommits(from?: string, to = 'HEAD') {
  const rwaGitCommits = await getGitDiff(from, to)
  const commits = rwaGitCommits.map(commit => parseGitCommit(commit)).filter(notNullish)

  return commits
}

/**
 *
 * @param from
 * @param to
 */
async function getGitDiff(from?: string, to = 'HEAD'): Promise<RawGitCommit[]> {
  // https://git-scm.com/docs/pretty-formats
  //获取提交信息
  const rawGit = await execCommand('git', [
    '--no-pager',
    'log',
    `${from ? `${from}...` : ''}${to}`,
    '--pretty="----%n%s|%h|%an|%ae%n%b"',
    '--name-status'
  ])

  // 获取提交信息的第一条
  // change|9f881bb|孟洋|466879168@qq.com
  const rwaGitLines = rawGit.split('----\n').splice(1)
  console.log("=>(git.ts:154) rwaGitLines", rwaGitLines);


  const gitCommits = rwaGitLines.map(line => {
    const [firstLine, ...body] = line.split('\n')
    const [message, shortHash, authorName, authorEmail] = firstLine.split('|')
    const gitCommit: RawGitCommit = {
      message,
      shortHash,
      author: {
        name: authorName,
        email: authorEmail
      },
      body: body.join('\n')
    }
    return gitCommit
  })
  return gitCommits

}

function parseGitCommit(commit: RawGitCommit): GitCommit | null {
  // https://www.conventionalcommits.org/en/v1.0.0/
  // https://regex101.com/r/FSfNvA/1
  const ConventionalCommitRegex = /(?<type>[a-z]+)(\((?<scope>.+)\))?(?<breaking>!)?: (?<description>.+)/i;
  const CoAuthoredByRegex = /co-authored-by:\s*(?<name>.+)(<(?<email>.+)>)/gim;
  const PullRequestRE = /\([a-z]*(#\d+)\s*\)/gm;
  const IssueRE = /(#\d+)/gm;
  const match = commit.message.match(ConventionalCommitRegex)
  if (!match?.groups) {
    return null
  }
  const type = match.groups.type
  const scope = match.groups.scope || ''

  const isBreaking = Boolean(match.groups.breaking)
  let description = match.groups.description

  // Extract references from message
  const references: Reference[] = []
  for (const m of description.matchAll(PullRequestRE)) {
    references.push({
      type: 'pull-request',
      value: m[1]
    })
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
  const resultCommits: GitCommit[] = []
  const map = new Map<string, ResolvedAuthor>()
  for await (const commit of commits) {
    const resolvedAuthors: ResolvedAuthor[] = []
    for await (const [index, author] of commit.authors.entries()) {
      const {email, name} = author
      if (email && name) {
        const commitHashes: string[] = []
        if (index === 0) {
          commitHashes.push(commit.shortHash)
        }
        const resolvedAuthor: ResolvedAuthor = {
          name,
          email,
          commits: commitHashes,
          login: ''
        }
        if (!resolvedLogins?.has(email)) {
          const login = await getResolvedAuthorLogin(github, commitHashes, email)
          resolvedAuthor.login = login;
          resolvedLogins?.set(email, login)
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
  }
}

async function getResolvedAuthorLogin(github: GithubConfig, commitHashes: string[], email: string) {
  let login = ''
  try {
    const data = await ofetch(`https://ungh.cc/users/find/${email}`)
    login = data?.user?.username || '';
  } catch (e) {
  }
  if (login) {
    return login
  }
  const {repo, token} = github

  // token not provided, skip github resolving
  if (!token) {
    return login
  }
  if (commitHashes.length) {
    try {
      const data = await ofetch(`https://api.github.com/repos/${repo}/commits/${commitHashes[0]}`, {
        headers: getHeaders(token)
      })
      login = data?.author?.login || ''
    } catch (e) {

    }
  }
  if (login) {
    return login
  }
  try {
    const data = await ofetch(`https://api.github.com/search/users?q=${encodeURIComponent(email)}`, {
      headers: getHeaders(token)
    })
    login = data.items[0].login;
  } catch (e) {

  }
  return login
}

function getHeaders(githubToken: string) {
  return {
    accept: 'application/vnd.github.v3+json',
    authorization: `token ${githubToken}`
  }
}
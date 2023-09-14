import type { ChangelogOption } from "../lib/types"

import { createOptions } from "../lib/config"

import {
  getChangelogMarkdown,
  getTotalChangelogMarkdown,
  isVersionInMarkdown,
  writeMarkdown,
} from "../lib/markdown"

export async function generateChangelog(options?: Partial<ChangelogOption>) {
  // 获取默认的配置信息
  const opts = await createOptions(options)
  const existContent = await isVersionInMarkdown(opts.to, opts.output)

  if (!opts.regenerate && existContent) 
return

  const { markdown } = await getChangelogMarkdown(opts)
  await writeMarkdown(markdown, opts.output, opts.regenerate)
}

export async function generateTotalChangelog(
  options?: Partial<ChangelogOption>,
  showProgress = true
) {
  const opts = await createOptions(options)
  const markdown = await getTotalChangelogMarkdown(opts, showProgress)
  await writeMarkdown(markdown, opts.output, true)
}

export type { ChangelogOption }

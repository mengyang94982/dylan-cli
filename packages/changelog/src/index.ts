import { ChangelogOption } from "../lib/types";

import { createOptions } from "../lib/config";

import { isVersionInMarkdown,getChangelogMarkdown } from "../lib/markdown";

export async function generateChangelog(options?: Partial<ChangelogOption>) {
  //获取默认的配置信息
  const opts = await createOptions(options);
  const existContent = await isVersionInMarkdown(opts.to, opts.output);

  if (!opts.regenerate && existContent) return;

  const { markdown } = await getChangelogMarkdown(opts);
}

export async function generateTotalChangelog(
  options?: Partial<ChangelogOption>,
  showProgress = true
) {}

export type { ChangelogOption };

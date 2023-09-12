import { readFile } from "fs/promises";
import { VERSION_REG_OF_MARKDOWN } from "../constant";
import { ChangelogOption } from "../types";
import { createOptions } from "../config";
import { SingleBar, Presets } from "cli-progress";
import {getFromToTags,getGitCommits} from '../git'

export async function isVersionInMarkdown(version: string, mdPath: string) {
  let isIn = false;
  try {
    // 获取CHANGELOG.md里面的内容
    const md = await readFile(mdPath, "utf8");
    if (md) {
      // 有没有预发布的版本
      const matches = md.match(VERSION_REG_OF_MARKDOWN);
      if (matches?.length) {
        const versionInMarkdown = `## [${version}]`;
        isIn = matches.includes(versionInMarkdown);
      }
    }
  } catch (error) {
    console.log("没有找到changelog.md文件，请先创建文件");
  }
  return isIn;
}

export async function getChangelogMarkdown(
  options?: Partial<ChangelogOption>,
  showProgress = true
) {
  const opts = await createOptions(options);
  const gitCommits = await getGitCommits(opts.from, opts.to)
}

export async function getTotalChangelogMarkdown(
  options?: Partial<ChangelogOption>,
  showProgress = true
) {
  const opts = await createOptions(options);
  let bar: SingleBar | null = null;
  if (showProgress) {
    bar = new SingleBar(
      {
        format:
          "generate total changelog: [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}",
      },
      Presets.shades_classic
    );
  }
  const tags = getFromToTags(opts.tags);
  if (tags.length === 0) {
    const {markdown} = await getChangelogMarkdown(opts);

    return markdown;
  }
}


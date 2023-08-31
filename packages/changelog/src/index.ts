import type {ChangelogOption} from "../lib/types"
import {createOptions} from "../lib";
import {SingleBar, Presets} from 'cli-progress';
import {getFromToTags, getGitCommits, getGitCommitsAndResolvedAuthors} from "../lib/git";
import {generateMarkdown, isVersionInMarkdown, writeMarkdown} from "../lib/markdown";


export async function generateTotalChangelog(options?: Partial<ChangelogOption>, showProgress = true) {
  const opts = await createOptions(options)
  const markdown = await getTotalChangelogMarkdown(opts, showProgress)
  await writeMarkdown(markdown, opts.output, true)
}

export async function getTotalChangelogMarkdown(options?: Partial<ChangelogOption>, showProgress = true) {
  const opts = await createOptions(options)
  let bar: SingleBar | null = null;
  if (showProgress) {
    bar = new SingleBar(
      {format: 'generate total changelog: [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}'},
      Presets.shades_classic
    );
  }
  const tags = getFromToTags(opts.tags);

  if (tags.length === 0) {
    const {markdown} = await getChangelogMarkdown(opts);

    return markdown;
  }

  bar?.start(tags.length, 0)

  let markdown = ''
  const resolvedLogins = new Map<string, string>();
  for await (const [index, tag] of tags.entries()) {
    const {from, to} = tag;
    const gitCommits = await getGitCommits(from, to);
    const {commits, contributors} = await getGitCommitsAndResolvedAuthors(gitCommits, opts.github, resolvedLogins);

    const nextMd = generateMarkdown({commits, options: {...opts, from, to}, showTitle: true, contributors});

    markdown = `${nextMd}\n\n${markdown}`;

    bar?.update(index + 1);
  }

  bar?.stop();

  return markdown;
}

export async function getChangelogMarkdown(options?: Partial<ChangelogOption>, showTitle = true) {
  const opts = await createOptions(options)
  const gitCommits = await getGitCommits(opts.from, opts.to)
  const {commits, contributors} = await getGitCommitsAndResolvedAuthors(gitCommits, opts.github)


  const markdown = generateMarkdown({
    commits,
    options: opts,
    showTitle,
    contributors
  })
  return {
    markdown,
    commits,
    options: opts
  }
}


export async function generateChangelog(options?: Partial<ChangelogOption>) {
  const opts = await createOptions(options);

  const existContent = await isVersionInMarkdown(opts.to, opts.output);

  if (!opts.regenerate && existContent) return;

  const { markdown } = await getChangelogMarkdown(opts);

  await writeMarkdown(markdown, opts.output, opts.regenerate);
}

export type {ChangelogOption}
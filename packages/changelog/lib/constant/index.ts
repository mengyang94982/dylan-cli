export const VERSION_REG = /v\d+\.\d+\.\d+(-(beta|alpha)\.\d+)?/;

export const VERSION_REG_OF_MARKDOWN = /## \[v\d+\.\d+\.\d+(-(beta|alpha)\.\d+)?]/g;

export const VERSION_WITH_RELEASE = /release\sv\d+\.\d+\.\d+(-(beta|alpha)\.\d+)?/;

export const ConventionalCommitRegex = /(?<type>[a-z]+)(\((?<scope>.+)\))?(?<breaking>!)?: (?<description>.+)/i;
export const CoAuthoredByRegex = /co-authored-by:\s*(?<name>.+)(<(?<email>.+)>)/gim;
export const PullRequestRE = /\([a-z]*(#\d+)\s*\)/gm;
export const IssueRE = /(#\d+)/gm;
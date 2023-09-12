import { generateChangelog, generateTotalChangelog } from '@dylanjs/changelog';
import type { ChangelogOption } from '@dylanjs/changelog';

export async function genChangelog(options?: Partial<ChangelogOption>, total = false) {
  if (total) {
    await generateTotalChangelog(options);
  } else {
    await generateChangelog(options);
  }
}
import {generateChangelog,generateTotalChangelog} from '@dylanjs/changelog'

import type {ChangelogOption} from '@soybeanjs/changelog'

export async function genChangelog(options?:Partial<ChangelogOption>, total = false) {
  if (total) {
    generateTotalChangelog(options)
  }else{
    generateChangelog(options)
  }
}
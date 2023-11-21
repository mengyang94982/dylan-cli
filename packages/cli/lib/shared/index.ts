import fs from 'node:fs'

import type { Options } from 'execa'

export async function execCommand(cmd: string, args: string[], options?: Options) {
  const { execa } = await import('execa')
  const res = await execa(cmd, args, options)
  return res?.stdout?.trim() || ''
}

export function isPathEmpty($path: string) {
  try {
    const files = fs.readdirSync($path)
    return files.length === 0 || (files.length === 1 && files[0] === '.git')
  } catch (error) {
    return null
  }
}

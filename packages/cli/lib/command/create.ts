import process from "node:process";
import path from 'node:path';
import fs from 'node:fs';
import prompts from 'prompts'
import minimist from "minimist";

import type {Answers} from 'prompts';


import {blue, cyan, green, red, reset} from 'kolorist';

import {formatTargetDir, isPathEmpty, isValidPackageName, toValidPackageName} from '@dylanjs/utils';

type TemplateType = 'vue' | 'react' | 'ts-lib'

type ColorFunc = (str: string | number) => string;

interface Template {
  type: TemplateType;
  name: string;
  color: ColorFunc;
}

const templates: Template[] = [
  {
    type: 'vue',
    name: 'Vue 3',
    color: green
  },
  {
    type: 'react',
    name: 'React',
    color: cyan
  },
  {
    type: 'ts-lib',
    name: 'TypeScript library',
    color: blue
  }
]

const TEMPLATES = templates.map(t => t.type)

interface CliArgs {
  t?: string
  template?: string
}

const defaultTargetDir = 'create-dylan-project';


export async function create() {
  // 获取输入的参数
  const argv = minimist<CliArgs>(process.argv.slice(3), {
    string: ['_']
  })
  // 获取create后面跟着的文本 如果有的话就作为项目的名称
  const argTargetDir = formatTargetDir(argv._[0])
  const argTemplate = (argv.template || argv.t) as TemplateType | undefined

  // 项目名称
  let targetDir = argTargetDir || defaultTargetDir;

  function getProjectName() {
    return targetDir === '.' ? path.basename(path.resolve()) : targetDir;
  }

  let result: Answers<'projectName' | 'overwrite' | 'packageName' | 'template'> | null = null;


  try {
    result = await prompts([
      {
        type: argTargetDir ? null : 'text',
        name: 'projectName',
        message: reset('Project name:'),
        initial: defaultTargetDir,
        onState: state => {
          targetDir = formatTargetDir(state.value) || defaultTargetDir
        }
      },
      {
        type: () => (!fs.existsSync(targetDir) || isPathEmpty(targetDir) ? null : 'confirm'),
        name: 'overwrite',
        message: () => `${
          targetDir === '.' ? 'Current directory' : `Target directory "${targetDir}"`
        } is not empty. Remove existing files and continue?`
      },
      {
        type: (_, {overwrite}: { overwrite?: boolean }) => {
          if (!overwrite) {
            throw new Error(`${red('✖')} Operation cancelled`);
          }
          return null
        },
        name: 'overwriteChecker'
      },
      {
        type: () => (isValidPackageName(getProjectName()) ? null : 'text'),
        name: 'packageName',
        message: reset('Package name:'),
        initial: () => toValidPackageName(getProjectName()),
        validate: dir => isValidPackageName(dir) || 'Invalid package.json name'
      },
      {
        type: argTemplate && TEMPLATES.includes(argTemplate) ? null : 'select',
        name: 'template',
        message: typeof argTemplate === 'string' && !TEMPLATES.includes(argTemplate)
          ? reset(`"${argTemplate}" isn't a valid template. Please choose from below: `) : reset('Select a template:'),
        initial: 0,
        choices: templates.map((type, name, color) => ({
          title: color(name),
          value: type
        }))
      }
    ])
    return result
  } catch (e) {

  }


}
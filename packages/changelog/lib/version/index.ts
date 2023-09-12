import { readFile } from "fs/promises"


// 获取当前目录的package.json的version的字段
export async function getVersionFromPkgJson(cwd:string){
  let newVersion=''
  try {
    const pkgJson=await readFile(`${cwd}/package.json`,'utf-8')
    const pkg=JSON.parse(pkgJson)
    newVersion=pkg?.version || ''
  } catch (error) {
  }
  return {
    newVersion
  }
}
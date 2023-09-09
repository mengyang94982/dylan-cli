# @dylanjs/cli 命令行工具

## 分包

- 主要分为以下几个包
  - @dylanjs/cli：命令行工具
  - @dylanjs/changelog：自动生成文档
  - @dylanjs/utils：常用的工具方法

## dylanjs/cli 用法

### 安装

```bash
pnpm i -D @dylanjs/cli
```

### 使用

```bash
pnpm dy -h
```

### 命令介绍

| 命令                  | 作用                                                               |
| --------------------- | ------------------------------------------------------------------ |
| help(-h)              | 查看全部命令用法                                                   |
| git-commit            | 生成符合 Angular 规范的 git 提交信息                               |
| git-commit-verify     | 校验 git 的提交信息是否符合 Angular 规范                           |
| cleanup               | 清空依赖和构建产物                                                 |
| init-simple-git-hooks | 初始化 simple-git-hooks 钩子                                       |
| ncu                   | 命令 npm-check-updates, 升级依赖                                   |
| prettier-write        | 执行 prettier --write 格式化                                       |
| lint-staged           | 执行 lint-staged                                                   |
| changelog             | 根据两次 tag 生成 changelog (--total: 根据所有 tag 生成 changelog) |
| release               | 发布：更新版本号、生成 changelog、提交代码                         |

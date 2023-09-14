module.exports = {
  printWidth: 120, // 一行最多120字符
  tabWidth: 2, // 使用2个空格缩进
  useTabs: false, // 不使用缩进符，而使用空格
  semi: false, // 行尾不需要分号
  singleQuote: true, // 使用单引号
  quoteProps: "as-needed", // 对象的key仅在必要时用引号
  jsxSingleQuote: false, // jsx不使用单引号，而使用双引号
  trailingComma: "none", // 末尾是否需要有逗号
  bracketSpacing: true, // 大括号内的首尾需要空格
  bracketSameLine: false, // JSX标签的反尖括号需要换行
  arrowParens: "avoid", // 箭头函数，只有一个参数的时候，也需要括号
  rangeStart: 0, // 每个文件格式化的范围是文件的全部内容
  rangeEnd: Number.POSITIVE_INFINITY,
  requirePragma: false, // 不需要写文件开头的@prettier
  insertPragma: false, // 不需要自动在文件开头插入@prettier
  proseWrap: "preserve", // 使用默认的折行标准
  htmlWhitespaceSensitivity: "ignore", // 根据显示样式决定 html 要不要折行
  vueIndentScriptAndStyle: false, // Vue文件中的script和style内不用缩进
  endOfLine: "lf", // 换行符使用lf
  embeddedLanguageFormatting: "auto", // 格式化嵌入的内容
  singleAttributePerLine: true, // Html, vue, jsx 中每个属性占一行
};
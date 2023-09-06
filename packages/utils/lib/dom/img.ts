export function getImageUrl(
  image: any,
  isDarkMode: boolean
): string {
  if (typeof image === 'string') {
    // 如果 ThemeableImage 类型为 string，则直接返回字符串
    return image
  }
  if ('src' in image) {
    // 如果 ThemeableImage 类型是一个对象，并且对象有 src 属性，则返回 src 属性对应的字符串
    return image.src
  }
  if ('light' in image && 'dark' in image) {
    // 如果 ThemeableImage 类型是一个对象，并且对象同时有 light 和 dark 属性，则根据 isDarkMode 返回对应的 URL
    return isDarkMode ? image.dark : image.light
  } // 如果 ThemeableImage 类型不是上述情况，则返回空字符串
  return ''
}
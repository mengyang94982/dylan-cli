export function groupBy<T>(items: T[], key: string, groups: Record<string, T[]> = {}) {
  for (const item of items) {
    const v = (item as any)[key] as string;
    groups[v] = groups[v] || [];
    groups[v].push(item);
  }
  return groups;
}

export function join(array?: string[], glue = ', ', finalGlue = ' and '): string {
  if (!array || array.length === 0) 
return '';

  if (array.length === 1) 
return array[0];

  if (array.length === 2) 
return array.join(finalGlue);

  return `${array.slice(0, -1).join(glue)}${finalGlue}${array.slice(-1)}`;
}

export function upperFirst(string?: string) {
  return !string ? '' : string[0].toUpperCase() + string.slice(1);
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
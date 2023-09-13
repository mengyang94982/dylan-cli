type PartitionFilter<T> = (i: T, idx: number, arr: readonly T[]) => any;

/**
 * Divide an array into two parts by a filter function
 * @category Array
 * @example const [odd, even] = partition([1, 2, 3, 4], i => i % 2 != 0)
 */
export function partition<T>(array: readonly T[], f1: PartitionFilter<T>): [T[], T[]];
export function partition<T>(array: readonly T[], f1: PartitionFilter<T>, f2: PartitionFilter<T>): [T[], T[], T[]];
export function partition<T>(
  array: readonly T[],
  f1: PartitionFilter<T>,
  f2: PartitionFilter<T>,
  f3: PartitionFilter<T>
): [T[], T[], T[], T[]];
export function partition<T>(
  array: readonly T[],
  f1: PartitionFilter<T>,
  f2: PartitionFilter<T>,
  f3: PartitionFilter<T>,
  f4: PartitionFilter<T>
): [T[], T[], T[], T[], T[]];
export function partition<T>(
  array: readonly T[],
  f1: PartitionFilter<T>,
  f2: PartitionFilter<T>,
  f3: PartitionFilter<T>,
  f4: PartitionFilter<T>,
  f5: PartitionFilter<T>
): [T[], T[], T[], T[], T[], T[]];
export function partition<T>(
  array: readonly T[],
  f1: PartitionFilter<T>,
  f2: PartitionFilter<T>,
  f3: PartitionFilter<T>,
  f4: PartitionFilter<T>,
  f5: PartitionFilter<T>,
  f6: PartitionFilter<T>
): [T[], T[], T[], T[], T[], T[], T[]];
export function partition<T>(array: readonly T[], ...filters: PartitionFilter<T>[]): any {
  const result: T[][] = new Array(filters.length + 1).fill(null).map(() => []);

  array.forEach((e, idx, arr) => {
    let i = 0;
    for (const filter of filters) {
      if (filter(e, idx, arr)) {
        result[i].push(e);
        return;
      }
      i += 1;
    }
    result[i].push(e);
  });
  return result;
}
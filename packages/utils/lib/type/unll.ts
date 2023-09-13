export function notNullish<T>(v?: T | null): v is NonNullable<T> {
  return v !== null && v !== undefined
}
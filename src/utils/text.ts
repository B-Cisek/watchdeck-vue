export function count(value: number, noun: string): string {
  return `${value} ${noun}${value === 1 ? '' : 's'}`
}

export const lineFromObject = (input: Object) => {
  return `${JSON.stringify(input, undefined, 0)}\n`
}

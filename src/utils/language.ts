/**
 * Joins the list of words into a natural language sentence.
 */
export const sentence = (
  words: Array<string | number>,
  joinWord = 'and',
): string => {
  if (words.length < 3) {
    return words.join(` ${joinWord} `)
  }
  return `${words.slice(0, -1).join(', ')} ${joinWord} ${
    words[words.length - 1]
  }`
}

export const pluralize = (
  n: number,
  singular: string,
  plural = singular + 's',
): string => {
  return n === 1 ? singular : plural
}

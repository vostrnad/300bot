export const partition = <T>(array: T[], chunk: number): T[][] => {
  const res: T[][] = []
  for (let i = 0; i < array.length; i += chunk) {
    res.push(array.slice(i, i + chunk))
  }
  return res
}

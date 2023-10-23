export const consoleLogProgress = (index: number, total: number) => {
  const realIndex = index + 1
  const percent = (realIndex / total) * 100
  console.log('\n', 'PROGRESS', realIndex, '/', total, `(${Math.round(percent)}%)`)
}

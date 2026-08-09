/**
 * Generates evenly-spaced Y-axis labels for the patrimonial evolution line chart.
 *
 * Computes 5 labels from max/5 to max (matching noOfSections={5}),
 * formatted with compact notation (e.g. 20000 → "20K").
 */
function generateYAxisLabelsTotalAssetsChart(data: { total: number }[]) {
  if (data.length === 0) return [];

  const values = data.map((item) => item.total);
  const maxValue = Math.max(...values);

  if (maxValue === 0) return [];

  const numLabels = 5;
  const labels: string[] = [];

  for (let i = 1; i <= numLabels; i++) {
    const value = (maxValue * i) / numLabels;
    labels.push(
      value.toLocaleString('en-US', {
        maximumFractionDigits: 1,
        notation: 'compact',
        compactDisplay: 'short',
      })
    );
  }

  return labels;
}

export default generateYAxisLabelsTotalAssetsChart;

function generateYAxisLabelsTotalAssetsChart(data: any[]) {
  if (data.length === 0) return [];

  const values = data.map((item) => item.total);
  values.sort((a, b) => a - b);

  const labels = [];
  const numLabels = 5;

  for (let i = 0; i < numLabels; i++) {
    const percentile = i / (numLabels - 1);
    const index = Math.floor(percentile * (values.length - 1));
    const value = values[index];
    const formattedValue = value.toLocaleString('en-US', {
      maximumFractionDigits: 2,
      notation: 'compact',
      compactDisplay: 'short',
    });

    labels.push(formattedValue);
  }

  return labels;
}

export default generateYAxisLabelsTotalAssetsChart;

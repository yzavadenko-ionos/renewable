export function computeMonthlyAverageRadiation(hourlyData: { time: string[], shortwave_radiation: number[] }) { 
  const monthlySum = Array(12).fill(0)
  const monthlyCount = Array(12).fill(0)

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Aggregate sums and counts per month
  hourlyData.time.forEach((t, i) => {
    const date = new Date(t)
    const month = date.getMonth() // 0 = Jan
    const radiation = hourlyData.shortwave_radiation[i]

    if (radiation != null) {
      monthlySum[month] += radiation
      monthlyCount[month] += 1
    }
  })

  const monthlyAvgWithLabels = monthlySum.map((sum, i) => ({
    month: monthNames[i],
    averageRadiation: sum / monthlyCount[i] || 0
  }))

  return monthlyAvgWithLabels
}
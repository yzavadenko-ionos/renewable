export function computeMonthlyEnergyOutput(
  monthlyAverageRadiation: { month: string; averageRadiation: number }[],
  systemSize: number,
  panelEfficiency: number,
  orientation: string,
  tiltDiff: number
) {
  const orientationMap: Record<string, number> = {
    "South": 1.0,
    "South-East": 0.95,
    "South-West": 0.95,
    "East": 0.85,
    "West": 0.85
  };

  
  return monthlyAverageRadiation.map((month) => {
    const dailyPSH = (month.averageRadiation / 1000) * 24;
    const pr = (panelEfficiency / 100) * 0.9; 
    const oFactor = orientationMap[orientation] || 1.0;
    const tiltFactor = 1 - (tiltDiff * 0.002);
    const monthlyKwh = systemSize * dailyPSH * oFactor * pr * tiltFactor * 30;

    return {
      month: month.month,
      energy: parseFloat(monthlyKwh.toFixed(2))
    };
  });
}   
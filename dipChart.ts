import { DipChartPoint } from '../types';

/**
 * Interpolates the volume for a given dip reading in CM.
 * Logic:
 * 1. Find the two closest CM points in the chart.
 * 2. Calculate the difference (slope) between them.
 * 3. Use linear interpolation to find the value for the specific CM (including mm precision).
 */
export function interpolateVolume(readingCm: number, points: DipChartPoint[]): number {
  if (points.length === 0) return 0;
  
  // Sort points by CM just in case
  const sortedPoints = [...points].sort((a, b) => a.cm - b.cm);
  
  // Handle out of bounds
  if (readingCm <= sortedPoints[0].cm) return sortedPoints[0].litres;
  if (readingCm >= sortedPoints[sortedPoints.length - 1].cm) return sortedPoints[sortedPoints.length - 1].litres;
  
  // Find the segment
  for (let i = 0; i < sortedPoints.length - 1; i++) {
    const p1 = sortedPoints[i];
    const p2 = sortedPoints[i + 1];
    
    if (readingCm >= p1.cm && readingCm <= p2.cm) {
      const cmDiff = p2.cm - p1.cm;
      const litreDiff = p2.litres - p1.litres;
      
      if (cmDiff === 0) return p1.litres;
      
      const slope = litreDiff / cmDiff;
      const result = p1.litres + (readingCm - p1.cm) * slope;
      
      return Math.round(result * 100) / 100; // Round to 2 decimal places
    }
  }
  
  return 0;
}

/**
 * Generates a full MM-level chart for display purposes
 */
export function generateMmChart(points: DipChartPoint[]): DipChartPoint[] {
  if (points.length < 2) return points;
  
  const sortedPoints = [...points].sort((a, b) => a.cm - b.cm);
  const mmChart: DipChartPoint[] = [];
  
  const minCm = sortedPoints[0].cm;
  const maxCm = sortedPoints[sortedPoints.length - 1].cm;
  
  for (let cm = minCm; cm <= maxCm; cm += 0.1) {
    const roundedCm = Math.round(cm * 10) / 10;
    mmChart.push({
      cm: roundedCm,
      litres: interpolateVolume(roundedCm, sortedPoints)
    });
  }
  
  return mmChart;
}


import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { Point } from '../types';

interface GraphProps {
  points: Point[];
  func: (x: number) => number;
}

export const Graph: React.FC<GraphProps> = ({ points, func }) => {
  const chartData = useMemo(() => {
    if (points.length === 0) return [];

    // Create a set of all x-values to be plotted.
    // This includes original data points and points for a smooth function line.
    const xValues = new Set<number>();
    points.forEach(p => xValues.add(p.x));

    const sortedPoints = [...points].sort((a, b) => a.x - b.x);
    const minX = sortedPoints[0].x;
    const maxX = sortedPoints[sortedPoints.length - 1].x;
    const range = maxX - minX;
    const steps = 100;

    // Add points for the function line
    if (range > 0) {
      for (let i = 0; i <= steps; i++) {
        xValues.add(minX + (range * i) / steps);
      }
    }

    // Create a map for quick lookup of original points
    const originalPointsMap = new Map(points.map(p => [p.x, p.y]));

    // Build the combined dataset
    return Array.from(xValues)
      .sort((a, b) => a - b)
      .map(x => {
        const y = func(x);
        return {
          x,
          originalY: originalPointsMap.get(x), // Will be undefined if no original point at this x
          predictedY: (!isNaN(y) && isFinite(y)) ? y : undefined, // Function result
        };
      });
  }, [points, func]);


  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis 
            dataKey="x" 
            type="number"
            domain={['dataMin', 'dataMax']}
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8' }}
            allowDuplicatedCategory={false}
        />
        <YAxis 
            stroke="#94a3b8" 
            tick={{ fill: '#94a3b8' }}
            domain={['auto', 'auto']}
            allowDataOverflow={true}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            borderColor: '#334155',
            color: '#cbd5e1'
          }}
          labelStyle={{ color: '#f1f5f9', fontWeight: 'bold' }}
        />
        <Legend wrapperStyle={{ color: '#cbd5e1' }}/>
        <Scatter name="Original Data" dataKey="originalY" fill="#8b5cf6" />
        <Line
          name="Predicted Function"
          dataKey="predictedY"
          stroke="#22d3ee"
          strokeWidth={2}
          dot={false}
          type="monotone"
          connectNulls={true}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

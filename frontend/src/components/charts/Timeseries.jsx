// frontend/src/components/charts/Timeseries.jsx
import React, { useMemo } from 'react';

export default function Timeseries({ data = [], width = 400, height = 120, color = '#111', strokeWidth = 2, padding = 8 }) {
  const { path } = useMemo(() => {
    if (!data.length) return { path: '' };
    const xs = data.map(d => d.x);
    const ys = data.map(d => d.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const dx = maxX - minX || 1;
    const dy = maxY - minY || 1;
    const w = width - padding * 2;
    const h = height - padding * 2;

    const points = data.map(d => {
      const x = padding + ((d.x - minX) / dx) * w;
      const y = padding + h - ((d.y - minY) / dy) * h;
      return `${x},${y}`;
    });

    return { path: `M ${points.join(' L ')}` };
  }, [data, width, height, padding]);

  return (
    <svg width={width} height={height} role="img" aria-label="chart">
      <path d={path} fill="none" stroke={color} strokeWidth={strokeWidth} />
    </svg>
  );
}

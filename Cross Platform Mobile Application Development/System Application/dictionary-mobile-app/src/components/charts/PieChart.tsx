import React from "react";
import { View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

import { useChartWidth } from "@/components/charts/useChartWidth";
import { Typography } from "@/components/ui/Typography";
import { useTheme } from "@/contexts/ThemeContext";
import type { ChartDataPoint } from "@/types";

export interface PieChartProps {
  data: ChartDataPoint[];
  height?: number;
  donut?: boolean;
}

function polar(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polar(cx, cy, r, end);
  const e = polar(cx, cy, r, start);
  const largeArc = end - start <= 180 ? "0" : "1";
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 0 ${e.x} ${e.y} Z`;
}

/** Monochromatic pie / donut chart with an interactive-style legend. */
export function PieChart({ data, height = 200, donut = true }: PieChartProps) {
  const { width, onLayout } = useChartWidth();
  const { colors } = useTheme();
  const series = colors.chartSeries;

  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const size = Math.min(width, height);
  const r = size / 2 - 6;
  const cx = size / 2;
  const cy = size / 2;

  let angle = 0;
  const slices = data.map((d, i) => {
    const sweep = (d.value / total) * 360;
    const path = arcPath(cx, cy, r, angle, angle + sweep);
    angle += sweep;
    return { path, color: series[i % series.length], label: d.label, value: d.value };
  });

  return (
    <View onLayout={onLayout} className="flex-row items-center gap-4">
      {width > 0 ? (
        <>
          <Svg width={size} height={size}>
            <G>
              {slices.map((s) => (
                <Path key={s.label} d={s.path} fill={s.color} />
              ))}
              {donut ? <Circle cx={cx} cy={cy} r={r * 0.55} fill={colors.card} /> : null}
            </G>
          </Svg>
          <View className="flex-1 gap-2">
            {slices.map((s) => (
              <View key={s.label} className="flex-row items-center gap-2">
                <View style={{ backgroundColor: s.color }} className="h-3 w-3 rounded-sm" />
                <Typography variant="caption" className="flex-1 capitalize">
                  {s.label}
                </Typography>
                <Typography variant="caption" className="text-gray-900 dark:text-white">
                  {Math.round((s.value / total) * 100)}%
                </Typography>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

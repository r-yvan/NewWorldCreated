import React from "react";
import { View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";

import { useChartWidth } from "@/components/charts/useChartWidth";
import { Typography } from "@/components/ui/Typography";
import { useTheme } from "@/contexts/ThemeContext";
import type { ChartDataPoint } from "@/types";

export interface LineChartProps {
  data: ChartDataPoint[];
  height?: number;
}

/** Simple monochromatic line chart with a baseline grid. */
export function LineChart({ data, height = 180 }: LineChartProps) {
  const { width, onLayout } = useChartWidth();
  const { colors } = useTheme();
  const stroke = colors.chartSeries[0];

  const padding = 12;
  const max = Math.max(1, ...data.map((d) => d.value));
  const innerW = Math.max(0, width - padding * 2);
  const innerH = height - padding * 2 - 18;
  const stepX = data.length > 1 ? innerW / (data.length - 1) : 0;

  const points = data.map((d, i) => ({
    x: padding + i * stepX,
    y: padding + innerH - (d.value / max) * innerH,
  }));
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <View onLayout={onLayout}>
      {width > 0 ? (
        <>
          <Svg width={width} height={height - 18}>
            {[0.25, 0.5, 0.75, 1].map((f) => (
              <Line
                key={f}
                x1={padding}
                x2={padding + innerW}
                y1={padding + innerH * f}
                y2={padding + innerH * f}
                stroke={colors.border}
                strokeWidth={1}
              />
            ))}
            <Path d={line} stroke={stroke} strokeWidth={2.5} fill="none" />
            {points.map((p, i) => (
              <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={stroke} />
            ))}
          </Svg>
          <View className="flex-row justify-between px-1">
            {data.map((d) => (
              <Typography key={d.label} variant="caption" className="text-[10px]">
                {d.label}
              </Typography>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

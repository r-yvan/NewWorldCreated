import React from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";

import { useChartWidth } from "@/components/charts/useChartWidth";
import { Typography } from "@/components/ui/Typography";
import { useTheme } from "@/contexts/ThemeContext";
import type { ChartDataPoint } from "@/types";

export interface AreaChartProps {
  data: ChartDataPoint[];
  height?: number;
}

/** Gradient area chart with a monochromatic fill that follows the theme. */
export function AreaChart({ data, height = 180 }: AreaChartProps) {
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
  const area = `${line} L ${padding + innerW} ${padding + innerH} L ${padding} ${padding + innerH} Z`;

  return (
    <View onLayout={onLayout}>
      {width > 0 ? (
        <>
          <Svg width={width} height={height - 18}>
            <Defs>
              <LinearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={stroke} stopOpacity={0.25} />
                <Stop offset="1" stopColor={stroke} stopOpacity={0.02} />
              </LinearGradient>
            </Defs>
            <Path d={area} fill="url(#areaFill)" />
            <Path d={line} stroke={stroke} strokeWidth={2.5} fill="none" />
            {points.map((p, i) => (
              <Circle key={i} cx={p.x} cy={p.y} r={3} fill={colors.card} stroke={stroke} strokeWidth={2} />
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

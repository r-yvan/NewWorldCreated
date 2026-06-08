import React from "react";
import { View } from "react-native";
import Svg, { Rect } from "react-native-svg";

import { useChartWidth } from "@/components/charts/useChartWidth";
import { Typography } from "@/components/ui/Typography";
import { useTheme } from "@/contexts/ThemeContext";
import type { ChartDataPoint } from "@/types";

export interface BarChartProps {
  data: ChartDataPoint[];
  height?: number;
}

/** Vertical bar chart using the monochromatic series colour. */
export function BarChart({ data, height = 180 }: BarChartProps) {
  const { width, onLayout } = useChartWidth();
  const { colors } = useTheme();
  const fill = colors.chartSeries[0];

  const padding = 12;
  const max = Math.max(1, ...data.map((d) => d.value));
  const innerW = Math.max(0, width - padding * 2);
  const innerH = height - padding * 2 - 18;
  const slot = data.length > 0 ? innerW / data.length : 0;
  const barW = slot * 0.55;

  return (
    <View onLayout={onLayout}>
      {width > 0 ? (
        <>
          <Svg width={width} height={height - 18}>
            {data.map((d, i) => {
              const h = (d.value / max) * innerH;
              const x = padding + i * slot + (slot - barW) / 2;
              const y = padding + innerH - h;
              return <Rect key={d.label} x={x} y={y} width={barW} height={Math.max(2, h)} rx={4} fill={fill} />;
            })}
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

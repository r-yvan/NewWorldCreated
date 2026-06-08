import { useState } from "react";
import type { LayoutChangeEvent } from "react-native";

/** Measures a chart container's width for responsive SVG rendering. */
export function useChartWidth(initial = 0) {
  const [width, setWidth] = useState(initial);
  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w && Math.abs(w - width) > 1) setWidth(w);
  };
  return { width, onLayout };
}

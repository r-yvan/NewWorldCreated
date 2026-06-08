import React from "react";
import { Text as RNText, TextProps } from "react-native";

type Variant =
  | "display"
  | "title"
  | "heading"
  | "subheading"
  | "body"
  | "label"
  | "caption";

// Size + weight only. Colors live in VARIANT_COLORS so callers can override
// them cleanly (NativeWind does not merge conflicting classes by source order).
const VARIANT_CLASSES: Record<Variant, string> = {
  display: "text-3xl font-extrabold tracking-tight",
  title: "text-2xl font-bold tracking-tight",
  heading: "text-lg font-semibold",
  subheading: "text-base font-semibold",
  body: "text-base",
  label: "text-sm font-medium",
  caption: "text-xs",
};

const VARIANT_COLORS: Record<Variant, string> = {
  display: "text-gray-900 dark:text-white",
  title: "text-gray-900 dark:text-white",
  heading: "text-gray-900 dark:text-white",
  subheading: "text-gray-900 dark:text-white",
  body: "text-gray-600 dark:text-gray-300",
  label: "text-gray-900 dark:text-white",
  caption: "text-gray-500 dark:text-gray-500",
};

// Matches text-color utilities (e.g. text-white, text-gray-900) but NOT text
// sizes (text-sm, text-base, text-lg, ...).
const TEXT_COLOR_RE =
  /(?:^|\s)(?:dark:)?text-(?:white|black|transparent|current|inherit|[a-z]+-\d{2,3})(?:\/\d+)?/;

export interface TypographyProps extends TextProps {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}

/** Centralized typography to keep the hierarchy consistent everywhere. */
export function Typography({
  variant = "body",
  className = "",
  children,
  ...rest
}: TypographyProps) {
  // If the caller provides an explicit text color, drop the variant default so
  // it doesn't fight with the override and leave text invisible in either mode.
  const color = TEXT_COLOR_RE.test(className) ? "" : VARIANT_COLORS[variant];
  return (
    <RNText
      className={`${VARIANT_CLASSES[variant]} ${color} ${className}`}
      {...rest}
    >
      {children}
    </RNText>
  );
}

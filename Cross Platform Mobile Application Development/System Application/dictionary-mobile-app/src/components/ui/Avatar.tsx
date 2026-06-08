import React from "react";
import { View } from "react-native";

import { Typography } from "@/components/ui/Typography";

export interface AvatarProps {
  name: string;
  color?: string;
  size?: number;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Monogram avatar used by the profile menu and account screens. */
export function Avatar({ name, color = "#8a2be2", size = 40 }: AvatarProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: size / 2,
      }}
      className="items-center justify-center"
      accessibilityLabel={`Avatar for ${name}`}
    >
      <Typography
        variant="label"
        className="text-white"
        style={{ fontSize: size * 0.36, lineHeight: size }}
      >
        {initials(name)}
      </Typography>
    </View>
  );
}

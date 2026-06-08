import { Stack } from "expo-router";
import React from "react";

/** Public authentication stack (login, register, password recovery). */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />;
}

import { Drawer } from "expo-router/drawer";
import React from "react";

import { DrawerContent } from "@/components/navigation/DrawerContent";

/** Protected application area with a custom drawer navigator. */
export default function AppLayout() {
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: "front",
        swipeEdgeWidth: 60,
      }}
    >
      <Drawer.Screen name="search" />
      <Drawer.Screen name="dashboard" />
      <Drawer.Screen name="history" />
      <Drawer.Screen name="settings" />
      <Drawer.Screen name="profile" />
      <Drawer.Screen name="word-detail" options={{ drawerItemStyle: { display: "none" } }} />
    </Drawer>
  );
}

import { Redirect } from "expo-router";
import React from "react";

import { useAuth } from "@/contexts/AuthContext";

/** Entry point — routes to the app or the auth stack depending on session. */
export default function Index() {
  const { isAuthenticated } = useAuth();
  return <Redirect href={isAuthenticated ? "/search" : "/login"} />;
}

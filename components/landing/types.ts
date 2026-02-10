import type { Route } from "next";

export type DashboardHref = Extract<
  Route,
  "/login" | "/dashboard" | "/terms" | "/privacy"
>;

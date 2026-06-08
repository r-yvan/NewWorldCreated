import {
  IconAlertTriangle,
  IconSearch,
  IconVocabulary,
  IconVolume,
} from "@tabler/icons-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";

import { AreaChart } from "@/components/charts/AreaChart";
import { BarChart } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";
import { PieChart } from "@/components/charts/PieChart";
import { Alert } from "@/components/feedback/Alert";
import { AppCard } from "@/components/ui/AppCard";
import { ChartCard } from "@/components/ui/ChartCard";
import { DataTable } from "@/components/ui/DataTable";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCard } from "@/components/ui/StatCard";
import { Tabs } from "@/components/ui/Tabs";
import { Timeline } from "@/components/ui/Timeline";
import { Typography } from "@/components/ui/Typography";
import { Badge } from "@/components/ui/Badge";
import { ScreenHeader } from "@/components/navigation/ScreenHeader";
import { TopNavBar } from "@/components/navigation/TopNavBar";
import { ExportButton } from "@/features/dashboard/ExportButton";
import { RequirePermission } from "@/features/auth/RequirePermission";
import { useTheme } from "@/contexts/ThemeContext";
import { buildExport, getDashboardData } from "@/services/dashboard.service";
import type { ChartDataPoint, DashboardData } from "@/types";

const TREND_TABS = [
  { key: "frequency", label: "Frequency" },
  { key: "errors", label: "Errors" },
];

function DashboardContent() {
  const { colors } = useTheme();
  const [data, setData] = useState<DashboardData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [trendTab, setTrendTab] = useState("frequency");

  const load = useCallback(async () => {
    const result = await getDashboardData();
    setData(result);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const iconFor = (id: string) => {
    const size = 18;
    if (id === "total") return <IconSearch size={size} color={colors.icon} />;
    if (id === "unique")
      return <IconVocabulary size={size} color={colors.icon} />;
    if (id === "notfound")
      return <IconAlertTriangle size={size} color={colors.icon} />;
    return <IconVolume size={size} color={colors.icon} />;
  };

  if (!data) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950">
        <TopNavBar title="Dashboard" />
        <View className="gap-3 p-4">
          <Skeleton className="h-8 w-40" />
          <View className="flex-row gap-3">
            <Skeleton className="h-24 flex-1" />
            <Skeleton className="h-24 flex-1" />
          </View>
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </View>
      </View>
    );
  }

  const trendData: ChartDataPoint[] =
    trendTab === "frequency" ? data.searchFrequency : data.errorRate;

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <TopNavBar title="Dashboard" />
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.icon}
          />
        }
      >
        <ScreenHeader
          title="Analytics"
          breadcrumbs={["Home", "Dashboard"]}
          subtitle="Usage insights from your dictionary activity."
          right={<ExportButton payload={buildExport(data)} />}
        />

        {data.errorRatePercent > 25 ? (
          <Alert
            variant="warning"
            title="Elevated not-found rate"
            message={`${data.errorRatePercent}% of lookups returned no result.`}
          />
        ) : null}

        {/* KPI grid */}
        <View className="gap-3">
          <View className="flex-row gap-3">
            {data.kpis.slice(0, 2).map((kpi) => (
              <StatCard
                key={kpi.id}
                label={kpi.label}
                value={kpi.value}
                delta={kpi.delta}
                trend={kpi.trend}
                icon={iconFor(kpi.id)}
              />
            ))}
          </View>
          <View className="flex-row gap-3">
            {data.kpis.slice(2, 4).map((kpi) => (
              <StatCard
                key={kpi.id}
                label={kpi.label}
                value={kpi.value}
                delta={kpi.delta}
                trend={kpi.trend}
                icon={iconFor(kpi.id)}
              />
            ))}
          </View>
        </View>

        {/* Trend chart with tab filter (area + line) */}
        <ChartCard
          title="Search trends"
          subtitle="Activity over the past week"
          action={
            <Tabs
              tabs={TREND_TABS}
              activeKey={trendTab}
              onChange={setTrendTab}
            />
          }
        >
          {trendTab === "frequency" ? (
            <AreaChart data={trendData} />
          ) : (
            <LineChart data={trendData} />
          )}
        </ChartCard>

        {/* Part of speech distribution (pie) */}
        <ChartCard
          title="Part-of-speech distribution"
          subtitle="Across searched words"
        >
          <PieChart data={data.partOfSpeechDistribution} />
        </ChartCard>

        {/* Top words (bar) */}
        <ChartCard
          title="Most searched words"
          subtitle="Top lookups by frequency"
        >
          <BarChart data={data.recentSearches} />
        </ChartCard>

        {/* Recent searches table */}
        <AppCard className="gap-3">
          <Typography variant="subheading">Recent searches</Typography>
          <DataTable
            data={data.recentSearches}
            keyExtractor={(row) => row.label}
            columns={[
              {
                key: "word",
                header: "Word",
                width: 160,
                render: (row) => (
                  <Typography
                    variant="body"
                    className="capitalize text-gray-900 dark:text-white"
                  >
                    {row.label}
                  </Typography>
                ),
              },
              {
                key: "count",
                header: "Lookups",
                width: 90,
                render: (row) => (
                  <Badge label={String(row.value)} tone="neutral" />
                ),
              },
            ]}
          />
        </AppCard>

        {/* Activity feed */}
        <AppCard className="gap-4">
          <Typography variant="subheading">Recent activity</Typography>
          <Timeline items={data.activity} />
        </AppCard>
      </ScrollView>
    </View>
  );
}

export default function DashboardScreen() {
  return (
    <RequirePermission permission="dashboard.view">
      <DashboardContent />
    </RequirePermission>
  );
}

import React from "react";
import { ScrollView, View } from "react-native";

import { Typography } from "@/components/ui/Typography";

export interface Column<T> {
  key: string;
  header: string;
  width?: number;
  render?: (row: T) => React.ReactNode;
  accessor?: (row: T) => string | number;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
}

/** Horizontally-scrollable enterprise table with sticky header styling. */
export function DataTable<T>({ columns, data, keyExtractor }: DataTableProps<T>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View className="min-w-full">
        {/* Header */}
        <View className="flex-row border-b border-gray-200 pb-2 dark:border-gray-800">
          {columns.map((col) => (
            <View key={col.key} style={{ width: col.width ?? 120 }} className="px-2">
              <Typography variant="caption" className="uppercase tracking-wide">
                {col.header}
              </Typography>
            </View>
          ))}
        </View>
        {/* Rows */}
        {data.map((row, index) => (
          <View
            key={keyExtractor(row, index)}
            className="flex-row border-b border-gray-100 py-3 dark:border-gray-800/60"
          >
            {columns.map((col) => (
              <View key={col.key} style={{ width: col.width ?? 120 }} className="justify-center px-2">
                {col.render ? (
                  col.render(row)
                ) : (
                  <Typography variant="body" className="text-gray-900 dark:text-white">
                    {col.accessor ? String(col.accessor(row)) : ""}
                  </Typography>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

import React, { useMemo, type CSSProperties } from "react";
import { Box, Flex, Grid, useMediaQuery, type Theme } from "@funext/ui";

import MonthlyRevenue from "./MonthlyRevenue";
import NbNewOrders from "./NbNewOrders";

import type { Order } from "./types";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import { getFakeData } from "~/utils/get-fake-data";
import { ProvinceSales } from "./charts/province-sales";
import { SparkCharts } from "./charts/spark-charts";

interface OrderStats {
  revenue: number;
  nbNewOrders: number;
  pendingOrders: Order[];
}

interface State {
  nbNewOrders?: number;
  pendingOrders?: Order[];
  recentOrders?: Order[];
  revenue?: string;
}

const styles = {
  flex: { display: "flex" },
  flexColumn: { display: "flex", flexDirection: "column" },
  leftCol: { flex: 1, marginRight: "0.5em" },
  rightCol: { flex: 1, marginLeft: "0.5em" },
  singleCol: { marginTop: "1em", marginBottom: "1em" },
};

const Spacer = () => <span style={{ width: "1em" }} />;
const VerticalSpacer = () => <span style={{ height: "1em" }} />;

const Dashboard = () => {

  const [orders, setOrders] = React.useState<Order[]>([]);

  useAsyncEffect(async () => {
    setOrders((await getFakeData()).orders);
  });

  const aggregation = useMemo<State>(() => {
    if (!orders) return {};
    const aggregations = orders
      .filter((order) => order.status !== "cancelled")
      .reduce(
        (stats: OrderStats, order) => {
          if (order.status !== "cancelled") {
            stats.revenue += order.total;
            stats.nbNewOrders++;
          }
          if (order.status === "ordered") {
            stats.pendingOrders.push(order);
          }
          return stats;
        },
        {
          revenue: 0,
          nbNewOrders: 0,
          pendingOrders: [],
        },
      );
    return {
      recentOrders: orders,
      revenue: aggregations.revenue.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
      nbNewOrders: aggregations.nbNewOrders,
      pendingOrders: aggregations.pendingOrders,
    };
  }, [orders]);

  const { nbNewOrders, pendingOrders, revenue, recentOrders } = aggregation;
  return (
    <Flex direction="column" gap={4}>
      <SparkCharts />
      <VerticalSpacer />
      <Grid container columns={{ md: 1, lg: 2 }} gap={4}>
        <Grid>
          <MonthlyRevenue value={revenue} />
        </Grid>
        <Grid>
          <NbNewOrders value={nbNewOrders} />
        </Grid>
      </Grid>
      <VerticalSpacer />
      <ProvinceSales />
      <VerticalSpacer />
    </Flex>
  );
};

export default Dashboard;

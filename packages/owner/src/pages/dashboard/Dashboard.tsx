import React, { useMemo, type CSSProperties } from "react";
import { Box, Flex, Grid, useMediaQuery, type Theme } from "@funext/ui";

import MonthlyRevenue from "./MonthlyRevenue";
import NbNewOrders from "./NbNewOrders";

import type { Order } from "./types";
import { useAsyncEffect } from "~/hooks/use-async-effect";
import { getDashboardData } from "~/utils/dashboard-data";
import { ProvinceSales } from "./charts/province-sales";
import { SparkCharts } from "./charts/spark-charts";
import { Container } from "~/components/shared/container";
import { DateFilterFilter } from "~/scope/views/data/data-view-filter";

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

const Dashboard = (props: any) => {
  const [orders, setOrders] = React.useState<Order[]>([]);

  useAsyncEffect(async () => {
    setOrders((await getDashboardData()).orders);
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
    <Container {...props}>
      <div className="flex justify-end py-2">
        <DateFilterFilter/>
      </div>
      <VerticalSpacer />
      <SparkCharts />
      <VerticalSpacer />
      <Grid container columns={{ xs: 1, lg: 2 }} gap={4} justify="center">
        <Grid size={1} flex="1 0 auto">
          <MonthlyRevenue value={revenue} />
        </Grid>
        <Grid size={1} flex="1 0 auto">
          <NbNewOrders value={nbNewOrders} />
        </Grid>
      </Grid>
      <VerticalSpacer />
      <ProvinceSales />
      <VerticalSpacer />
    </Container>
  );
};

export default Dashboard;

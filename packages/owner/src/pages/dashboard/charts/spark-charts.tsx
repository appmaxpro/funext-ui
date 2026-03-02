import { Card, Grid } from "@funext/ui";
import { createSparks } from "./spark-data";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import React from "react";
import { EMPTY_ARRAY } from "~/utils/constant";
const maxCardHeight = undefined;
const minCardHeight = 160;
const cardSx={minHeight: minCardHeight, px: 0, pb:0, mb: '-3px'};

function SparkCharts() {
  const chart = React.useMemo(createSparks, EMPTY_ARRAY);
  return (
    <Grid columns={{ md: 4, xs: 1 }} gap={4} container justify="center">
      <Grid size={1} maxHeight={maxCardHeight}>
        <Card>
          <Card.Body sx={cardSx}>

            <ReactApexChart options={chart.optionsSpark1 as ApexOptions} series={chart.seriesSpark1} type="area"/>
          </Card.Body>
        </Card>
      </Grid>
      <Grid size={1} maxHeight={maxCardHeight}>
        <Card>
          <Card.Body sx={cardSx}>
            <ReactApexChart options={chart.optionsSpark2 as ApexOptions} series={chart.seriesSpark2} type="area"/>
          </Card.Body>
        </Card>
      </Grid>
      <Grid size={1} maxHeight={maxCardHeight}>
        <Card>
          <Card.Body sx={cardSx}>
            <ReactApexChart options={chart.optionsSpark3 as ApexOptions} series={chart.seriesSpark3} type="area"/>
          </Card.Body>
        </Card>
      </Grid>
    </Grid>
  );
}

export { SparkCharts };

import { Card, Grid } from "@funext/ui";
import { createSparks } from "./spark-data";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import React from "react";

function SparkCharts() {
  const { spark1, spark2, spark3 } = React.useMemo(createSparks, []);
  return (
    <Grid columns={{ lg: 3, md: 1 }} gap={8} container>
      <Grid sx={{ maxHeight: 444 }}>
        <Card>
          <Card.Body>
            <ReactApexChart options={spark1 as ApexOptions} />
          </Card.Body>
          <div id="spark1"></div>
        </Card>
      </Grid>
      <Grid>
        <Card>
          <Card.Body>
            <ReactApexChart options={spark2 as ApexOptions} />
          </Card.Body>
        </Card>
      </Grid>
      <Grid>
        <Card>
          <Card.Body>
            <ReactApexChart options={spark3 as ApexOptions} />
          </Card.Body>
        </Card>
      </Grid>
    </Grid>
  );
}

export { SparkCharts };

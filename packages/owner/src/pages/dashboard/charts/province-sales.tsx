import { Card } from "~/ui";
import type { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

const ProvinceSales = () => {
  const chart = React.useMemo(
    () => ({
      series: [76, 67, 61, 90],
      options: {
        chart: {
          height: 390,
          type: "radialBar",
        },
        plotOptions: {
          radialBar: {
            offsetY: 0,
            startAngle: 0,
            endAngle: 270,
            hollow: {
              margin: 5,
              size: "30%",
              background: "transparent",
              image: undefined,
            },
            dataLabels: {
              name: {
                show: false,
              },
              value: {
                show: false,
              },
            },
            barLabels: {
              enabled: true,
              useSeriesColors: true,
              offsetX: -8,
              fontSize: "16px",
              formatter: function (seriesName: string, opts: any) {
                return (
                  seriesName + ":  " + opts.w.globals.series[opts.seriesIndex]
                );
              },
            },
          },
        },
        colors: ["#1ab7ea", "#0084ff", "#39539E", "#0077B5"],
        labels: ["Vimeo", "Messenger", "Facebook", "LinkedIn"],
        responsive: [
          {
            breakpoint: 480,
            options: {
              legend: {
                show: false,
              },
            },
          },
        ],
      },
    }),
    [],
  );

  return (
    <Card>
      <Card.Body>
        <ReactApexChart
          options={chart.options as ApexOptions}
          series={chart.series}
          type="radialBar"
          height={390}
        />
      </Card.Body>
      <div id="html-dist"></div>
    </Card>
  );
};

export { ProvinceSales };

import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { useMemo } from "react";
import { useEvents } from "@/context/events";
Chart.register(...registerables);

const options = {
  responsive: true,
  maintainAspectRatio: true,
};

export const SpeedGraph = () => {
  const { speeds } = useEvents();

  const speedDatas = useMemo(() => speeds.map((e) => e.value), [speeds]);

  const speedLabels = useMemo(() => speeds.map((e) => e.timestamp), [speeds]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Line
        data={{
          datasets: [
            {
              label: "Live ball speed in km/h",
              fill: false,
              backgroundColor: "#3b82f6",
              borderColor: "#3b82f6",
              borderCapStyle: "butt" as any,
              borderDash: [],
              borderDashOffset: 0.0,
              borderJoinStyle: "miter" as any,
              pointBorderColor: "#3b82f6",
              pointBackgroundColor: "#3b82f6",
              pointBorderWidth: 1,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: "#3b82f6",
              pointHoverBorderColor: "#3b82f6",
              pointHoverBorderWidth: 2,
              pointRadius: 1,
              pointHitRadius: 10,
              data: speedDatas,
            },
          ],
          labels: speedLabels,
        }}
        options={{
          responsive: true,
          plugins: {
            legend: {
              display: true,
            },
          },
          scales: {
            x: {
              display: false,
            },
          },
        }}
      />
    </div>
  );
};

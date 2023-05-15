import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { getFakeLabels, getFakeSpeeds } from "@/mock/speedGraph";
Chart.register(...registerables);

const options = {
  responsive: true,
  maintainAspectRatio: true,
};

const LABEL = "Average speed";

export const SpeedGraph = () => {
  const data = {
    datasets: [
      {
        label: "Speed",
        fill: false,
        lineTension: 0.1,
        backgroundColor: "#40C4B2",
        borderColor: "#40C4B2",
        borderCapStyle: "butt" as any,
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: "miter" as any,
        pointBorderColor: "rgba(75,192,192,1)",
        pointBackgroundColor: "#fff",
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: "rgba(75,192,192,1)",
        pointHoverBorderColor: "rgba(220,220,220,1)",
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: getFakeSpeeds(),
      },
    ],
    labels: getFakeLabels(),
  };

  return (
    <div className="w-full h-full">
      <Line
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
          },
        }}
      />
    </div>
  );
};

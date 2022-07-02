// import { BarTooltipProps, ResponsiveBar } from "@nivo/bar";
import {
  XAxis,
  Bar,
  BarChart
} from "recharts";
import { useGlobalContext, TPrediction } from "../../GlobalContext";
import { Emotions } from "../../utils";

type TBarData = {
  name: string,
  percent: number
};

type TData = TBarData[];

const RealtimeEmotionChart = () => {

  const { prediction } = useGlobalContext();

  const constructData = (prediction: TPrediction): TData => {
    const data: TData = [];
    prediction.forEach((value, index) => {
      data.push({
        name: Emotions[index],
        percent: value*100
      });
    });
    return data;
  };

  // const getTooltip = (tooltipProp: BarTooltipProps<TBarData>): JSX.Element => {
  //   return (
  //     <span className="tooltip">{`${tooltipProp.data.name}: ${Math.round(tooltipProp.data.percent)}%`}</span>
  //   );
  // };

  return (
    <div className="RealtimeEmotionChart">
      <BarChart data={constructData(prediction)}>
        <XAxis dataKey="name" />
        <Bar dataKey="percent" />
      </BarChart>
      {/* <ResponsiveBar
        data={constructData(prediction)}
        keys={["percent"]}
        indexBy="name"
        layout={"vertical"}
        margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
        borderRadius={7}
        padding={0.4}
        valueScale={{ type: "linear" }}
        colors="#FE8F8F"
        animate={true}
        enableLabel={false}
        axisTop={null}
        axisRight={null}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Percentage",
          legendPosition: "middle",
          legendOffset: -40
        }}
        axisBottom={{
          legend: "Expression",
          legendPosition: "middle",
          legendOffset: 40
        }}
        tooltip={(tooltipProp) => getTooltip(tooltipProp)}
      /> */}
    </div>
  );

};

export default RealtimeEmotionChart;
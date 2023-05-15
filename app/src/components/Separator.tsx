type Props = {
  type: "vertical" | "horizontal";
};

export const Separator: React.FunctionComponent<Props> = ({ type }) => {
  return (
    <div
      className={`${
        type === "horizontal" ? "w-full" : "h-full"
      } flex items-center justify-center`}
    >
      <div
        className={`${
          type === "vertical" ? "h-4/5 w-[1px]" : "w-4/5 h-[1px]"
        } bg-gray-400`}
      ></div>
    </div>
  );
};

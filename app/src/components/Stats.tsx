type Props = {
  label: string;
  value: number;
  unit?: string;
};

export const Stats: React.FunctionComponent<Props> = ({
  label,
  value,
  unit,
}) => {
  return (
    <div className="h-full shrink-0 rounded-md w-52 bg-gray-100 flex flex-col items-center">
      <h3 className="py-4 text-lg">{label}</h3>
      <div className="flex-1 w-full flex items-center justify-center">
        <div className="relative">
          <span className="font-black text-5xl ">{value}</span>{" "}
          {unit ? (
            <span className="text-sm font-normal text-gray-600 absolute -right-10 bottom-2 ">
              {unit}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

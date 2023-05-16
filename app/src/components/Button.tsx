import React from "react";
import { ButtonHTMLAttributes } from "react";

type Props = {
  label: string;
  variant: "primary" | "secondary";
};

export const Button = ({
  label,
  variant,
  disabled,
  ...props
}: Props & ButtonHTMLAttributes<HTMLButtonElement>): JSX.Element => {
  return (
    <button
      className={`py-3 px-24  rounded-lg text-white ${
        disabled
          ? "bg-gray-400"
          : variant === "primary"
          ? "bg-blue-500"
          : "bg-red-500"
      } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      {...props}
    >
      {label}
    </button>
  );
};

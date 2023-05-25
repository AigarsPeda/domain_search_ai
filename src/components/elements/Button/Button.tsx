import classNames from "~/utils/classNames";
import Spinner from "~/components/elements/Spinner";
import { type FC } from "react";

interface ButtonProps {
  btnTitle: string;
  isLoading?: boolean;
  handleClick: () => void;
  btnType?: "button" | "submit" | "reset";
}

const Button: FC<ButtonProps> = ({
  btnTitle,
  isLoading,
  handleClick,
  btnType = "button",
}) => {
  return (
    <button
      type={btnType}
      onClick={handleClick}
      className={classNames(
        "flex w-40 items-center justify-center rounded-md border-2 border-pink-500 py-3 font-semibold text-white no-underline transition hover:bg-pink-500"
      )}
    >
      {isLoading ? <Spinner /> : btnTitle}
    </button>
  );
};

export default Button;

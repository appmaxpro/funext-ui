import ListItem, { Link, type ButtonProps, type LinkProps } from "./ListItem";
import React, { useContext } from "react";
import { SearchContext } from "../lib/context";
import IconButton, { type IconButtonProps } from "../../IconButton";
import Icon from "./Icon";

function CloseIcon({ className, ...rest }: IconButtonProps) {
  const { onChangeSearch } = useContext(SearchContext);
  const handleClear = React.useCallback((event: any) => {
    event.preventDefault();
    onChangeSearch("");
  }, []);

  return (
    <IconButton
      {...rest}
      className="text-inherit ms-2"
      color="transparent"
      size="sm"
      onClick={handleClear}
    >
      <Icon icon="close" className="" />
    </IconButton>
  );
}

interface FreeSearchActionProps extends Omit<ButtonProps & LinkProps, "index"> {
  index?: number;
  label?: string;
}

export default function FreeSearchAction({
  label = "Search for",
  ...props
}: FreeSearchActionProps) {
  const { search } = useContext(SearchContext);

  return (
    <Link index={0} showType={false} icon={CloseIcon as React.FC} {...props}>
      <span className="max-w-md truncate dark:text-white">
        {label} <span className="font-semibold">"{search}"</span>
      </span>
    </Link>
  );
}

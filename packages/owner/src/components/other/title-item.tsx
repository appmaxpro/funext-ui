import { cn, Flex, type FlexProps } from "@funext/ui";

export const TitleItem = ({
  title,
  children,
  justify = "between",
  className,
}: {
  title: React.ReactNode;
  children?: React.ReactNode;
} & FlexProps) => {
  return (
    <Flex
      justify={justify}
      items="center"
      className={cn("py-1 text-sm font-medium", className as string)}
    >
      <span>{title}:</span>
      <div className="text-tertiary">{children}</div>
    </Flex>
  );
};

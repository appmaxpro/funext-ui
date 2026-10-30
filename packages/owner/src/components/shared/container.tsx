import { Box, cn, Stack, type BoxProps} from "~/ui";

export function Container({ children, ...props }: BoxProps) {
 //const layout = useLayoutContext()
  return (
      <Stack gap={4} p={4} flexGrow={1} {...props} className={cn("relative w-full", props.className)}>
        {children}
      </Stack>
  );
}

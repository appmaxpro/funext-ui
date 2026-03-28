import { Box, Stack, type BoxProps} from "@funext/ui";

export function Container({ children, ...props }: BoxProps) {
 //const layout = useLayoutContext()
  return (
    <Box width="100%" className="relative">
      <Stack gap={4} p={4} flexGrow={1} {...props}>
        {children}
      </Stack>
    </Box>
  );
}

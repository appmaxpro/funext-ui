import { Box, CircularProgress, type CircularProgressProps } from "~/ui";

type PercentageProgressProps = CircularProgressProps & {
    children?: React.ReactNode
}

export function PercentageProgress({children, ...rest}: PercentageProgressProps) {
    
    if (!children){
      return <CircularProgress {...(rest as any)}/>
    }

    return (
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress {...(rest as any)}/>
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {children}
          </Box>
       </Box>
    )

}
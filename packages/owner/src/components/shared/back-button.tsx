import { Box, IconButton, Tooltip, useRtl, useScreenSize } from "~/ui";
import { Icons } from "~/components/shared/icons";

import { useActivePageRoute, useRouter } from "~/hooks";
import { EMPTY_OBJECT, TIP_HOVER_PROPS } from "~/utils";
import { i18n } from "~/utils/i18n";


export function BackButton(props:{onClick?: (event: any) => void}) {
  const rtl = useRtl();
  const route = useActivePageRoute()!;
  const {mdDown} = useScreenSize()
  const router = useRouter()
  const {onClick = ()=> router.navigate(-1)} = props ?? EMPTY_OBJECT
  if (!!route.parent) {
    return (
      <Box sx={{ mr: 1 }}>
        <Tooltip
          content={i18n.get("Back...")}
          hoverProps={TIP_HOVER_PROPS}
        >
          <IconButton
            aria-label={`back navigation menu`}
            onClick={onClick}
          >
            {rtl ? <Icons.ArrowForward /> : <Icons.ArrowBack />}
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  
}

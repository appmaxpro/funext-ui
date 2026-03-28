import React, { useMemo } from "react";
import {
  Divider,
  Text,
  IconButton,
  useMediaQuery,
  List,
  ListItem,
  Drawer,
  useTheme,
  AutoSelect,
  styled,
  memoTheme,
} from "@funext/ui";

import MapView from "../map/MapView";
import MapCurrentLocation from "../components/map-current-location";
import MapPositions from "../components/map-positions";
import MapScale from "../components/map-scale";
//import MapGeocoder from "../map/geocoder/MapGeocoder";

import { useNavigate } from "react-router";
import { Dimensions } from "~/utils/constant";
import { i18n } from "~/utils/i18n";
import {
  deviceEquals,
  getDeviceKey,
  getDeviceLabel,
  useDeviceStore,
} from "../store/devices";
import { useTrackerSession } from "../store/session";
import { useCatch } from "~/hooks/use-catch";
import { Toolbar } from "~/components/shared/toolbar";
import { BackButton } from "~/components";

const PREFIX = "MapPage";

export const MapPageClasses = {
  root: `${PREFIX}-root`,
  content: `${PREFIX}-content`,
  drawer: `${PREFIX}-drawer`,
  drawerPaper: `${PREFIX}-drawer-panel`,
  mapContainer: `${PREFIX}-map-container`,
  title: `${PREFIX}-title`,
};

const MainRoot = styled("main")(
  memoTheme(({ theme }) => ({
    height: "100%",
    display: "flex",
    flexDirection: "column",
    [`& .${MapPageClasses.content}`]: {
      flexGrow: 1,
      overflow: "hidden",
      display: "flex",
      flexDirection: "row",
      [theme.breakpoints.down("sm")]: {
        flexDirection: "column-reverse",
      },
    },

    [`.${MapPageClasses.drawer}`]: {
      zIndex: 1,
      [`& .${MapPageClasses.drawerPaper}`]: {
        position: "relative",
        [theme.breakpoints.up("sm")]: {
          width: Dimensions.drawerWidthDesktop,
        },
        [theme.breakpoints.down("sm")]: {
          height: Dimensions.drawerHeightPhone,
        },
      },
    },
    [`& .${MapPageClasses.mapContainer}`]: {
      flexGrow: 1,
    },
    [`& .${MapPageClasses.title}`]: {
      flexGrow: 1,
    },
  })),
);

const EmulatorPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const t = i18n.get;

  const isPhone = useMediaQuery(theme.breakpoints.down("sm"));

  const devices = useDeviceStore((state) => state.items);
  const deviceId = useDeviceStore((state) => state.selectedId);
  const positionMap = useTrackerSession((state) => state.positions);

  const sortedDevices = useMemo(
    () => Object.values(devices).sort((a, b) => a.name.localeCompare(b.name)),
    [devices],
  );

  const positions = useMemo(
    () => Object.values(positionMap),
    [positionMap],
  );

  const handleClick = useCatch(async (latitude, longitude) => {
    if (deviceId) {
      let response;
      if (window.location.protocol === "https:") {
        const params = new URLSearchParams();
        params.append("id", devices[deviceId].uniqueId);
        params.append("lat", latitude);
        params.append("lon", longitude);
        response = await fetch(`${window.location.origin}/tracker`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        });
      } else {
        const params = new URLSearchParams();
        params.append("id", devices[deviceId].uniqueId);
        params.append("lat", latitude);
        params.append("lon", longitude);
        response = await fetch(
          `http://${window.location.hostname}:5055?${params.toString()}`,
          {
            method: "POST",
            mode: "no-cors",
          },
        );
      }
      if (!response.ok) {
        throw Error(await response.text());
      }
    }
  });

  return (
    <MainRoot className={MapPageClasses.root}>
      <div className={MapPageClasses.content}>
        <Drawer
          className={MapPageClasses.drawer}
          direction={isPhone ? "top" : "start"}
          variant="permanent"
          classes={{ panel: MapPageClasses.drawerPaper }}
        >
          <Toolbar>
            <BackButton/>
            <Text variant="h6" className={MapPageClasses.title}>
              {t("sharedEmulator")}
            </Text>
          </Toolbar>
          <Divider />
          <AutoSelect
            fullWidth
            open
            options={sortedDevices}
            value={deviceId ? devices[deviceId] : null}
            getOptionLabel={getDeviceLabel}
            getOptionKey={getDeviceKey}
            optionEquals={deviceEquals as any}
          />
        </Drawer>
        <div className={MapPageClasses.mapContainer}>
          <MapView>
            <MapPositions
              positions={positions}
              onMapClick={handleClick}
              showStatus
            />
          </MapView>
          <MapScale />
          <MapCurrentLocation />
          {/*<MapGeocoder />*/}
        </div>
      </div>
    </MainRoot>
  );
};

export default EmulatorPage;

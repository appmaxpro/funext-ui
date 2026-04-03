import React, { useMemo, useState } from "react";
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
  Flex,
  useScreenSize,
} from "@funext/ui";

import MapView from "../map/MapView";
import MapCurrentLocation from "../components/map-current-location";
import MapPositions from "../components/map-positions";
import MapScale from "../components/map-scale";
//import MapGeocoder from "../map/geocoder/MapGeocoder";

import { useNavigate } from "react-router";
import { Dimensions, EMPTY_ARRAY, EMPTY_OBJECT } from "~/utils/constant";
import { i18n } from "~/utils/i18n";
import {
  deviceEquals,
  getDeviceKey,
  getDeviceLabel,
  useDeviceStore,
} from "../store/devices";
import { useTrackerSession } from "../store/session";
import { useCatch, useCatchCallback } from "~/hooks/use-catch";
import { Toolbar } from "~/components/shared/toolbar";
import {
  BackButton,
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  createVirtualItemRef,
  FixedVirtualList,
  Icons,
  Items,
  type VirtualListItemProps,
} from "~/components";
import DeviceItem from "../components/deivice-item";
import { debounce } from "lodash";
import type { TrackerDevice } from "../utils/types";

const VirtualItem = React.memo(({ i, data, model }: VirtualListItemProps) => {
  const { devices, ...rest } = data.items;
  return (
    <DeviceItem
      {...rest}
      devices={devices}
      index={i}
      ref={createVirtualItemRef(model, i)}
    />
  );
});

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
        [theme.breakpoints.down("sm")]: {
          width: "100%",
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

const TrackingPage = () => {
  const {smDown} = useScreenSize();
  const navigate = useNavigate();
  const t = i18n.get;

  const isPhone = smDown;
;

  const devices = useDeviceStore((state) => state.items);
  const deviceId = useDeviceStore((state) => state.selectedId);
  const positionMap = useTrackerSession((state) => state.positions);
  const [search, setSearch] = useState("");

  const doSearch = React.useCallback(
    (term?: string) => {
      debounce(() => setSearch(term ?? ""), 300);
    },
    [setSearch],
  );

  const sortedDevices = useMemo(() => {
    const term = search?.toLowerCase();
    const match = (device: TrackerDevice) => {
      const { payload, ...rest } = device;
      return (
        JSON.stringify(Object.values(rest)).toLowerCase().includes(term) ||
        JSON.stringify(Object.values(payload ?? EMPTY_OBJECT))
          .toLowerCase()
          .includes(term)
      );
    };
    const devs = Object.values(devices);
    const filtered = search ? devs.filter(match) : devs;
    return {
      devices: Object.values(filtered).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    };
  }, [devices, search]);

  const positions = useMemo(() => Object.values(positionMap), [positionMap]);

  const handleClick = useCatchCallback(async (latitude, longitude) => {
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
  }, EMPTY_ARRAY);

  const renderCommand = () => {
    return (
      <Command shouldFilter={false} className="flex flex-col h-full w-full">
        <Toolbar>
          <BackButton />
          <CommandInput
            placeholder={i18n.t("Search...")}
            onValueChange={doSearch}
            suffix={
              <Flex shrink={true}>
                <IconButton
                  className={!search ? "visibility-hidden" : ""}
                  onClick={() => setSearch("")}
                >
                  <Icons.Close />
                </IconButton>
              </Flex>
            }
          />
        </Toolbar>

        <FixedVirtualList
          component={CommandList as any}
          model={{
            overscanCount: 5,
            itemCount: sortedDevices.devices.length,
            estimatedItemSize: 80,
          }}
          itemData={sortedDevices}
          Item={VirtualItem}
        />
      </Command>
    );
  };

  return (
    <MainRoot className={MapPageClasses.root}>
      <div className={MapPageClasses.content}>
        <Drawer
          className={MapPageClasses.drawer}
          direction={isPhone ? "top" : "start"}
          variant="permanent"
          classes={{ panel: MapPageClasses.drawerPaper }}
          keep
        >
          {renderCommand()}
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

export default TrackingPage;

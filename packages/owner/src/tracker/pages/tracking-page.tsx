import {
  Drawer,
  Flex,
  IconButton,
  memoTheme,
  styled,
  useScreenSize,
} from "~/ui";
import React, { useCallback, useMemo, useRef, useState } from "react";

import MapCurrentLocation from "../components/map-current-location";
import MapPositions from "../components/map-positions";

import MapScale from "../components/map-scale";
import MapView from "../map/MapView";

import {
  BackButton,
  Command,
  CommandInput,
  CommandList,
  createVirtualItemRef,
  FixedVirtualList,
  Icons,
  type VirtualListItemProps,
} from "~/components";
import { Toolbar } from "~/components/shared/toolbar";
import { useCatchCallback } from "~/hooks/use-catch";
import { EMPTY_ARRAY, EMPTY_OBJECT } from "~/utils/constant";
import { i18n } from "~/utils/i18n";
import DeviceItem from "../components/deivice-item";
import { useDeviceStore } from "../store/devices";
import { useTrackerSession } from "../store/session";
import type { TrackerDevice } from "../utils/types";
import MapDefaultCamera from "../components/MapDefaultCamera";
import MapSelectedDevice from "../components/map-selected-device";
import MapOverlay from "../overlay/MapOverlay";

const VirtualItem = React.memo(({ i, data, model }: VirtualListItemProps) => {
  const { devices, ids: _ids, ...rest } = data;
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
        height: "100%",
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
  const { smDown } = useScreenSize();
  //const navigate = useNavigate();
  const t = i18n.get;

  const isPhone = smDown;
   
  const devices = useDeviceStore((state) => state.items);
  const setSelectedDeviceId = useDeviceStore((state) => state.selectId);
  const selectedDeviceId = useDeviceStore((state) => state.selectedId);
  const positionMap = useTrackerSession((state) => state.positions);
  const [search, setSearch] = useState("");
  const timeoutRef = useRef<number>(null);
  const doSearch = React.useCallback(
    (term?: string) => {
      //@ts-ignore
      clearTimeout(timeoutRef.current);
      //@ts-ignore
      timeoutRef.current = setTimeout(() => setSearch(term ?? ""), 300);
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
    const devs = Object.values(devices).filter((d) => !d.disabled);
    const filtered = search ? devs.filter(match) : devs;

    return {
      devices: Object.values(filtered).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
      ids: filtered.map((d) => d.id),
    };
  }, [devices, search]);

  const positions = useMemo(
    () =>
      Object.values(positionMap).filter((p) =>
        sortedDevices.ids.includes(p.deviceId),
      ),
    [positionMap, sortedDevices.ids],
  );

  const virtualModel = useMemo(
    () => ({
      overscanCount: 5,
      itemCount: sortedDevices.devices.length,
      estimatedItemSize: 80,
    }),
    [sortedDevices.devices],
  );

  const selectedPosition = positions.find(
    (position) => selectedDeviceId && position.deviceId === selectedDeviceId,
  );

  console.log("TrackingPage: ", positions.length);
  const handleClick = useCatchCallback(async (latitude, longitude) => {
    if (selectedDeviceId) {
      let response;
      if (window.location.protocol === "https:") {
        const params = new URLSearchParams();
        params.append("id", devices[selectedDeviceId].uniqueId);
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
        params.append("id", devices[selectedDeviceId].uniqueId);
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
  
  const onMarkerClick = useCallback(
    (_:any, deviceId:number) => {
      setSelectedDeviceId(deviceId);
    },
    [setSelectedDeviceId],
  );


  const renderCommand = () => {
    return (
      <Command
        shouldFilter={false}
        data-value_x={String(selectedDeviceId)}
        value={String(selectedDeviceId ?? "")}
        disablePointerSelection
        className="flex flex-col h-full w-full"
      >
        <Toolbar className="px-3">
          <BackButton />
          <CommandInput
            placeholder={i18n.t("Search...")}
            onValueChange={doSearch}
            suffix={
              <Flex shrink={true}>
                <IconButton
                  className={!search ? "invisible" : ""}
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
          model={virtualModel}
          itemData={sortedDevices}
          Item={VirtualItem}
          className="flex-1"
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
            <MapOverlay/>
            <MapPositions
              positions={positions}
              onMapClick={handleClick}
              selectedPosition={selectedPosition}
              onMarkerClick={onMarkerClick}
              showStatus
            />
            <MapSelectedDevice/>
            <MapDefaultCamera/>
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

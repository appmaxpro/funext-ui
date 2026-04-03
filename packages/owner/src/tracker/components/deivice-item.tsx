import {
  IconButton,
  Tooltip,
  Avatar,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Text,
  styled,
  cn,
} from "@funext/ui";
import BatteryFullIcon from "@funext/icons/BatteryFull";
import BatteryChargingFullIcon from "@funext/icons/BatteryChargingFull";
import Battery60Icon from "@funext/icons/Battery60";
import BatteryCharging60Icon from "@funext/icons/BatteryCharging60";
import Battery20Icon from "@funext/icons/Battery20";
import BatteryCharging20Icon from "@funext/icons/BatteryCharging20";
import ErrorIcon from "@funext/icons/Error";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  formatAlarm,
  formatBoolean,
  formatPercentage,
  formatStatus,
  getStatusColor,
} from "../utils/formatter";
import { mapIconKey, mapIcons } from "../map/preloadImages";
import { useTrackerSession } from "../store/session";
import { useDeviceStore } from "../store/devices";
import { i18n } from "~/utils";
import { useAttrPref } from "../utils/preferences";
import type { TrackerDevice } from "../utils/types";
import { CommandItem } from "~/components";
//import MotionBar from './components/MotionBar';

dayjs.extend(relativeTime);

const t = i18n.t;

const DeviceItem = ({
  devices,
  index,
  ...res
}: { devices: TrackerDevice[]; index: number } & any) => {
  //const admin = useAdministrator();
  const selectId = useDeviceStore((state) => state.selectId);
  const selectedDeviceId = useDeviceStore((state) => state.selectedId);

  const item = devices[index]!;
  const position = useTrackerSession((state) => state.positions[item.id]);

  const devicePrimary = useAttrPref("devicePrimary", "name");
  const deviceSecondary = useAttrPref("deviceSecondary", "");

  const resolveFieldValue = (field: string) => {
    return item[field];
  };

  const primaryValue = resolveFieldValue(devicePrimary);
  const secondaryValue = resolveFieldValue(deviceSecondary);

  const secondaryText = () => {
    let status;
    if (item.status === "online" || !item.lastUpdate) {
      status = formatStatus(item.status, t);
    } else {
      status = dayjs(item.lastUpdate).fromNow();
    }
    return (
      <>
        {secondaryValue && (
          <>
            {secondaryValue}
            {" • "}
          </>
        )}
        <span className={getStatusColor(item.status)}>{status}</span>
      </>
    );
  };

  return (
    <CommandItem
      onClick={() => selectId(item.id)}
      
      {...res}
      value={String(item.id)}
      disabled={item.disabled}
      //selected={selectedDeviceId === item.id}
      className={cn(selectedDeviceId === item.id ? "bg-soft/20" : null, res.className)}
    >
      <ListItemAvatar>
        <Avatar>
          <img
            className=""
            src={mapIcons[mapIconKey(item.category) as keyof typeof mapIcons]}
            alt=""
          />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={primaryValue}
        secondary={secondaryText()}
        slots={{
          primary: Text,
          secondary: Text,
        }}
        slotProps={{
          primary: { noWrap: true },
          secondary: { noWrap: true },
        }}
      />
      {position && (
        <>
          {position.attributes.hasOwnProperty("alarm") && (
            <Tooltip
              title={`${t("eventAlarm")}: ${formatAlarm(position.attributes.alarm, t)}`}
            >
              <IconButton size="sm">
                <ErrorIcon className="text-error" />
              </IconButton>
            </Tooltip>
          )}

          {position.attributes.hasOwnProperty("batteryLevel") && (
            <Tooltip
              title={`${t("positionBatteryLevel")}: ${formatPercentage(position.attributes.batteryLevel)}`}
            >
              <IconButton size="sm">
                {(position.attributes.batteryLevel > 70 &&
                  (position.attributes.charge ? (
                    <BatteryChargingFullIcon className="text-success" />
                  ) : (
                    <BatteryFullIcon className="text-success" />
                  ))) ||
                  (position.attributes.batteryLevel > 30 &&
                    (position.attributes.charge ? (
                      <BatteryCharging60Icon className="text-warning" />
                    ) : (
                      <Battery60Icon className="text-warning" />
                    ))) ||
                  (position.attributes.charge ? (
                    <BatteryCharging20Icon className="text-error" />
                  ) : (
                    <Battery20Icon className="text-error" />
                  ))}
              </IconButton>
            </Tooltip>
          )}
        </>
      )}
    </CommandItem>
  );
};

export default DeviceItem;

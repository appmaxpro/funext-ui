import dayjs, {
  Dayjs,
  type ManipulateType,
  type OpUnitType,
  type QUnitType,
} from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import utc from "dayjs/plugin/utc";
import { DATE_RANGES } from "./constant";
import { type Moment, l10n, moment } from "~/utils/l10n";

type DateRange = keyof typeof DATE_RANGES;

export type NewQUnitType = ManipulateType | "week" | "weeks" | "w";

export function addDate(
  date: Date | string,
  amount: number,
  unit: NewQUnitType,
) {
  return dayjs(date).add(amount, unit).toDate();
}

export function getStartOf(
  date: Dayjs | Date | string,
  unit: QUnitType | NewQUnitType,
) {
  return dayjs(date).startOf(unit);
}

export function getEndOf(
  date: Dayjs | Date | string,
  unit: QUnitType | NewQUnitType,
) {
  return dayjs(date).endOf(unit);
}

export function getStartOfAsDate(date: Date | string, unit: NewQUnitType) {
  return getStartOf(date, unit).toDate();
}

export function getNextOf(date: Dayjs | Date | string, unit: NewQUnitType) {
  return dayjs(date).add(1, unit).startOf(unit);
}

export function getNextOfAsDate(
  date: Dayjs | Date | string,
  unit: NewQUnitType,
) {
  return getNextOf(date, unit).toDate();
}

function getValue(value: Date | Moment, type: "date" | "datetime" = "date") {
  if (typeof value === "object" && value instanceof moment) {
    if (type === "date") {
      return (value as Moment).startOf("day").format("YYYY-MM-DD");
    }

    return (value as Moment)?.utc().format();
  }
  return value;
}

const periodSuffix = ["this", "last", "next"] as const;

export function getDateDomain(
  value: string | Date | Moment,
  name: string,
  type: "date" | "datetime" = "date",
) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return [[name, "=", getValue(moment(value), type)]];
  }

  if (value instanceof moment) {
    return [[name, "=", getValue(value, type)]];
  }

  const now = moment().locale(l10n.getLocale());

  if (value === "today") {
    return [[name, "=", getValue(now, type)]];
  }

  if (value === "last_day") {
    return [
      [name, "=", getValue(now.clone().subtract(1, "d").startOf("d"), type)],
    ];
  }

  const [period, partType] = (value as string).split("_");

  if (!periodSuffix.includes(period as any)) {
    return [[name, "=", getValue(moment(value), type)]];
  }

  const unitType = partType as QUnitType;

  const qyt = unitType === "quarter" ? 3 : 1;

  const timeUnit = unitType === "quarter" ? "m" : (unitType as ManipulateType);

  if (period === "this") {
    return [
      "&",
      [
        [name, ">=", getValue(getStartOf(now, unitType), type)],
        [name, "<", getValue(getEndOf(now.clone(), unitType), type)],
      ],
    ];
  }

  if (period === "next") {
    return [
      "&",
      [
        [name, ">=", getValue(now.clone().add(qyt, timeUnit).startOf(unitType), type)],
        [
          name,
          "<",
          getValue(now.clone().add(qyt + 1, timeUnit).startOf(unitType), type),
        ],
      ],
    ];
  }

  return [
    "&",
    [
      [
        name,
        ">=",
        getValue(now.clone().subtract(qyt, timeUnit).startOf(unitType), type),
      ],
      [name, "<", getValue(now.clone().add(qyt, timeUnit).startOf(unitType), type)],
    ],
  ];
}

dayjs.extend(quarterOfYear);
dayjs.extend(utc);

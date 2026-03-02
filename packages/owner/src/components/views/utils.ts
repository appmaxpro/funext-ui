import isNumber from "lodash/isNumber";

import type {
  Criteria,
  DataRecord,
  Filter,
  FilterOp,
  Field,
  SavedFilter,
  Widget,
  AdvancedSearchState,
} from "~/utils/data-types";

import { type Moment, l10n, moment } from "~/utils/l10n";
import { session } from "~/utils/session";
import { getNextOf, getStartOf } from "~/utils/date";
import { toKebabCase } from "~/utils/names";

const ADVANCED_SEARCH_VIEWS = new Set(["grid", "cards", "kanban"]);

function fieldNameAppend(fieldName?: string, append?: string) {
  return (fieldName || "").endsWith(`.${append || ""}`)
    ? fieldName
    : `${fieldName}.${append}`;
}

export function isAdvancedSearchView(view?: string) {
  return ADVANCED_SEARCH_VIEWS.has(view ?? "");
}

export function getCriteria(
  criteria: Filter,
  fields?: AdvancedSearchState["fields"],
) {
  let { fieldName, timeUnit = "d", value, value2 } = criteria;
  let operator = criteria.operator as any;
  const field = fields?.[fieldName!];
  const user = session.info!.user;
  const userId = user?.id;
  const userGroup = user?.group;

  function getValue(value: Date | Moment) {
    if (typeof value === "object" && value instanceof moment) {
      if (((field as any)?.type || "").toLowerCase() === "date") {
        return (value as Moment).startOf("day").format("YYYY-MM-DD");
      }
      if (((field as any)?.type || "").toLowerCase() === "datetime") {
        return (value as Moment)?.utc().format();
      }
      return (value as Moment)?.utc().format();
    }
    return value;
  }

  if (operator === "$isCurrentUser") {
    return [fieldNameAppend(fieldName, "id"), "=", userId];
  }

  if (operator === "$inCurrent") {
    const now = moment().locale(l10n.getLocale());
    return [
      "&",
      [
        [fieldName, ">=", getValue(getStartOf(now, timeUnit))],
        [fieldName, "<", getValue(getNextOf(now.clone(), timeUnit))],
      ],
    ];
  }

  if (operator === "$inPast") {
    const now = moment().locale(l10n.getLocale());
    return [
      "&",
      [
        [
          fieldName,
          ">=",
          getValue(now.clone().subtract(value, timeUnit).startOf(timeUnit)),
        ],
        [fieldName, "<", getValue(getNextOf(now.clone(), timeUnit))],
      ],
    ];
  }

  if (operator === "$inNext") {
    const now = moment().locale(l10n.getLocale());
    return [
      "&",
      [
        [fieldName, ">=", getValue(getStartOf(now, "day"))],
        [
          fieldName,
          "<",
          getValue(getNextOf(now.clone().add(value, timeUnit), timeUnit)),
        ],
      ],
    ];
  }

  if (["$isTrue", "$isFalse"].includes(operator)) {
    return [fieldName, "=", operator === "$isTrue"];
  }

  if (["$isEmpty", "$notEmpty"].includes(operator)) {
    const isEmpty = operator === "$isEmpty";
    return [
      isEmpty ? "|" : "&",
      [
        [fieldName, isEmpty ? "=" : "!=", false],
        [fieldName, isEmpty ? "=" : "!=", ""],
      ],
    ];
  }

  if (field) {
    switch (toKebabCase(field.type as string)) {
      case "one-to-one":
      case "many-to-one": {
        if (!["isNull", "notNull"].includes(operator)) {
          if (!value) return null;
          let subField = field.targetName;
          if (["in", "notIn"].includes(operator)) {
            subField = "id";
            value = value && value.map((v: DataRecord) => v.id);
          }
          fieldName = `${field.name}.${subField}`;
        }
        break;
      }
      case "one-to-many":
      case "many-to-many": {
        if (["in", "notIn"].includes(operator)) {
          if (!value) return null;
          fieldName = `${field.name}.id`;
          value = value && value.map((v: DataRecord) => v.id);
        }
        break;
      }
      case "date":
      case "datetime":
        if (value) {
          let v1 = value;
          switch (operator) {
            case "=":
            case "!=":
            case "between":
            case "notBetween": {
              let v2 = ["=", "!="].includes(operator) ? v1 : value2 || v1;

              v1 = getValue(getStartOf(v1, "day"));
              v2 = getValue(getNextOf(v2, "day"));

              const flag = ["=", "between"].includes(operator);

              return [
                flag ? "&" : "|",
                [
                  [fieldName, flag ? ">=" : "<", v1],
                  [fieldName, flag ? "<" : ">=", v2],
                ],
              ];
            }
            case "<":
            case ">=":
              value = getValue(getStartOf(value, "day"));
              break;
            case ">":
              operator = ">=";
              value = getValue(getNextOf(moment(value), "day"));
              break;
            case "<=":
              operator = "<";
              value = getValue(getNextOf(moment(v1), "day"));
              break;
            default:
              break;
          }
        }
        break;
      default:
        break;
    }

    return {
      ...criteria,
      operator,
      fieldName,
      value,
      value2: value2 === null ? undefined : value2,
      timeUnit: !criteria.timeUnit ? undefined : timeUnit,
    };
  }

  return criteria;
}

export function getFreeSearchCriteria(
  text?: string,
  items?: Widget[],
  fields?: AdvancedSearchState["fields"],
) {
  if (text) {
    const filters: Filter[] = [];
    const number = +text;

    items?.forEach((item) => {
      let fieldName = "";
      let operator = "like";
      let value: any = text;

      const field = fields?.[item?.name || ""] || item;
      const { name, targetName } = field as Field;

      if (item.hidden) return;

      const type = toKebabCase((item as Field).pType || field.type);
      switch (type) {
        case "integer":
        case "long":
        case "decimal":
          if (isNaN(number) || !isNumber(number)) return;
          if (
            type === "integer" &&
            (number > 2147483647 || number < -2147483648)
          )
            return;
          fieldName = name;
          operator = "=";
          value = number;
          break;
        case "text":
        case "string":
          fieldName = name;
          break;
        case "one-to-one":
        case "many-to-one":
          if (targetName) {
            fieldName = name + "." + targetName;
          }
          break;
        case "boolean":
          if (/^(t|f|y|n|true|false|yes|no)$/.test(text)) {
            fieldName = name;
            operator = "=";
            value = /^(t|y|true|yes)$/.test(text);
          }
          break;
        default:
          break;
      }

      if (!fieldName) return;

      filters.push({
        fieldName: fieldName,
        operator: operator as FilterOp,
        value: value,
      });
    });

    return filters;
  }
  return [];
}

export function prepareAdvanceSearchQuery(
  state: AdvancedSearchState,
  hasEditorApply?: boolean,
) {
  const { domains, filters, archived: _archived, editor, fields = {} } = state;
  const _domains = domains
    ?.filter((d) => d.checked)
    .map(({ checked, ...d }) => ({
      ...d,
    }));

  const getEditorCriteria = (criteria: Criteria["criteria"]) =>
    (criteria || [])
      .map((c) => getCriteria(c as Filter, fields) as Filter)
      .filter((c) => c);

  const getEditor = (filter: SavedFilter) => {
    const editor: Criteria = JSON.parse(filter.filterCustom);
    if (editor.criteria) {
      editor.criteria = getEditorCriteria(editor.criteria);
      if (!editor.operator) {
        editor.operator = "and";
      }
    }
    return editor;
  };

  const {
    id,
    title,
    operator: editorOperator,
    criteria: editorCriteria,
  } = editor ?? {};
  let operator = editorOperator ?? "and";
  let criteria: Criteria["criteria"] = getEditorCriteria(editorCriteria);

  const $filters = filters?.filter(
    (f) => f.id !== id && f.checked && f.filterCustom,
  );

  if (!hasEditorApply) {
    if ($filters?.length) {
      criteria = [
        ...criteria,
        {
          operator,
          criteria: $filters.map(getEditor),
        },
      ];
    }
  }

  const allfilters = [...(_domains || []), ...($filters || [])];
  const totalFilters = allfilters.length;
  const totalCriteria =
    criteria?.filter((c) => (c as Filter).operator)?.length ?? 0;
  const filterTitle = id ? title : "";
  /*
  const searchTextLabel =
    filterTitle ||
    (totalFilters
      ? totalFilters === 1
        ? allfilters[0]?.title
        : i18n.get("Filters ({0})", totalFilters)
      : "") ||
    (totalCriteria ? i18n.get("Custom ({0})", totalCriteria) : "");
  */
  const searchTextLabel = (filterTitle && 1) || totalFilters || totalCriteria;

  return {
    ...state,
    searchTextLabel: searchTextLabel || "",
    searchText: "",
    query: {
      _archived,
      _domains,
      operator,
      criteria,
    },
  };
}

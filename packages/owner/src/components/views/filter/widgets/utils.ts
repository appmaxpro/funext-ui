import { EMPTY_ARRAY, EMPTY_RECORD, toKebabCase, type PropertyType, type SearchFilterField, type Widget } from "~/utils";
import type { OnFilterChange } from "../types";
import React from "react";

export type SelectType = {
  title: string;
  name: string;
  value?: any;
};

export function getFilterValue(value: any, multiple?: boolean) {
    if (multiple) {
      return Array.isArray(value) ? value : value ? [value] : EMPTY_RECORD;
    }
    return value ? [value] : EMPTY_RECORD;
}

export function toggleFilterValue(value: any, values:any[], multiple?: boolean) {
  if (multiple && !Array.isArray(values)) !!values ? [values] : EMPTY_ARRAY;

  const selected = multiple ? values.includes(value) : value === values;
  let newValues;
  if (multiple) {
    newValues = selected
      ? values.filter((val) => val != value)
      : [...values, value];
    if (!newValues.length) {
      newValues = null;
    }
  } else {
    newValues = selected ? null : value;
  }
  
  return newValues;
}

export function getItemFieldType(field?: SearchFilterField) {
  let type = toKebabCase(field?.pType || field?.type || "");

  return type;
}

export function convertValues(values: any, type?: PropertyType, multiple?: boolean) {
  if(values == null) return null;
  if (multiple && !Array.isArray(values)) values = [values] ;
  
  if (!type || ['string', 'text', 'select'].includes(type)) return values

  const array = Array.isArray(values) ? values : [values] ;
  
  switch(type) {
      
      case "int":{
          array.forEach((value, index) => array[index]=parseInt(value+""));
          break
      }

      case "boolean":{
          array.forEach((value, index) => array[index]=!!value);
          break
      }
      case "float":
      case "decimal":{
          array.forEach((value, index) => array[index]=parseFloat(value+""));
          break
      }

      case "date":
      case "datetime":
        array.forEach((value, index) => {
          if(value instanceof Date) return;
          if(value ==='now') {
            array[index] = Date.now() ;
            return;
          }
          if(typeof value ==='number') {
             array[index] =new Date(value);
             return
          }

        });

  }
  
  if (multiple) return array;

  return array[0]

}

export function isChecked(value: any, values: any, type?: PropertyType, multiple?: boolean) {
  if(!values || value == null) return false;
  if (multiple && !Array.isArray(values)) values = [values] ;
  



}
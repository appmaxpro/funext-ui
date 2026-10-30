
declare type Identifier = number | string;
declare type DataRecord = {
  id?: Identifier | null;
  version?: number | null;
  $version?: number | null;
  selected?: boolean;
  [k: string]: any;
};
export declare type EvalHelpers = {
  readonly user:any;
  readonly group:any;
  readonly userId:any;
  t(key: string, ...args: any[]):string;
  moment(date: any):any;
  number(value: any):number;
  contains(iter: any, item: any):boolean;
  sum(
    items: DataRecord[],
    field: string,
    operation?: string,
    field2?: string,
  ):number;
  lower(value: any):any;
  upper(value: any):any;
  titleCase(value: any):any;
  snakeCase(value: any):any;
  kebabCase(value: any):any;
  camelCase(value: any):any;
}
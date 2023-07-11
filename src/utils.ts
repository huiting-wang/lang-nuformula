type ItemOption = {
  label: string;
  [key: string]: any;
};

export type Item = {
  sn: string;
  type: string;
  options: ItemOption;
  [key: string]: any;
};

export const isEmptyValue = (value: any): boolean => {
  return typeof value === undefined || !value.length;
};

export enum funcName {
  SUM = "SUM",
  AVERAGE = "AVERAGE",
  IF = "IF",
  CONCAT = "CONCAT",
}

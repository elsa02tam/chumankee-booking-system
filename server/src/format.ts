import { TimezoneDate } from "timezone-date.ts";
import { d2 } from "timeslot-ts";

export function strToDate(str: string) {
  let [dateStr, timeStr] = str.split(" ");
  let [y, m, d] = dateStr.split("-");
  let [H, M] = (timeStr || "").split(":");
  let date = new TimezoneDate();
  date.timezone = 8;
  date.setFullYear(+y, +m - 1, +d);
  date.setHours(+H || 0, +M || 0, 0, 0);
  return date;
}

export function strToTime(str: string) {
  let date = strToDate(str);
  return date.getTime();
}

export function formatDateTime(time: number) {
  let date = new TimezoneDate(time);
  date.timezone = 8;
  let y = date.getFullYear();
  let m = d2(date.getMonth() + 1);
  let d = d2(date.getDate());
  let H = d2(date.getHours());
  let M = d2(date.getMinutes());
  return `${y}-${m}-${d} ${H}:${M}`;
}

export function formatDate(time: number) {
  let date = new TimezoneDate(time);
  date.timezone = 8;
  let y = date.getFullYear();
  let m = d2(date.getMonth() + 1);
  let d = d2(date.getDate());
  return `${y}-${m}-${d}`;
}

export function formatTime(time: number) {
  let date = new TimezoneDate(time);
  date.timezone = 8;
  let H = d2(date.getHours());
  let M = d2(date.getMinutes());
  return `${H}:${M}`;
}

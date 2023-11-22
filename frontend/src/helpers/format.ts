import { format_2_digit } from '@beenotung/tslib/format'

export function timeToDateTime(time: number) {
  let date = new Date(time)
  let y = date.getFullYear()
  let m = format_2_digit(date.getMonth() + 1)
  let d = format_2_digit(date.getDate())
  let H = format_2_digit(date.getHours())
  let M = format_2_digit(date.getMinutes())
  return `${y}-${m}-${d}T${H}:${M}`
}

export function dateTimeToTime(value: string) {
  let date = new Date(value)
  return date.getTime()
}

export function strToDate(dateStr: string, timeStr: string) {
  let date = new Date(dateStr)
  let [h, m] = timeStr.split(':')
  date.setHours(+h, +m)
  return date
}

export function getNowDateStr() {
  let date = new Date()
  return toDateStr(date)
}

export function toDateStr(date: Date) {
  let y = date.getFullYear()
  let m = format_2_digit(date.getMonth() + 1)
  let d = format_2_digit(date.getDate())
  return `${y}-${m}-${d}`
}

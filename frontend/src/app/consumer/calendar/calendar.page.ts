import { strToDate, toDateStr } from 'src/helpers/format'
import { Component, OnInit } from '@angular/core'
import {
  getEventsForCalendarByConsumer,
  GetEventsForCalendarByConsumerOutput,
  getToken,
} from '../../../sdk2'
import { ApiService } from '../../api.service'
import { LangService } from 'src/app/lang.service'
import { DAY } from '@beenotung/tslib/time'

interface CalendarDay {
  date: number
  time: number
  events: CalendarEvent[]
}

type CalendarEvent = GetEventsForCalendarByConsumerOutput['events'][number]

type Option = {
  id: number
  label: string
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit {
  dateFormat = 'yyyy-MM-dd HH:mm'
  timeFormat = 'HH:mm'
  public viewMode: 'month-with-all' | 'upcoming-week' = 'month-with-all'
  public currentDate: Date
  public currentViewTitle: string = ''
  public currentDayEvents: CalendarEvent[] = []

  show_finished_only = false

  public days: CalendarDay[] = []

  constructor(private langService: LangService) {
    this.currentDate = new Date()
    this.calcWeeks()
  }

  t = this.langService.translate

  async calcWeeks() {
    console.log('get token...')
    let token = getToken()
    if (!token) return
    let { firstDate, lastDate, title } = this.calcDateRange()
    this.currentViewTitle = title
    console.log('get json...')
    let json = await getEventsForCalendarByConsumer({
      token,
      show_finished_only: this.show_finished_only,
    })
    console.log('json:', json)
    console.log('this:', this)
    this.currentDayEvents = json.events

    let date = new Date(firstDate)

    this.days = []

    // push each week
    while (date.getTime() < lastDate.getTime()) {
      // push each day in week
      for (let i = 0; i < 7; i++) {
        let dayStartTime = date.getTime()
        let dayEndTime = dayStartTime + DAY
        this.days.push({
          date: date.getDate(),
          time: date.getTime(),
          events: json.events.filter(
            (event) =>
              event.t_service_booking_from_time >= dayStartTime &&
              event.t_service_booking_to_time < dayEndTime,
          ),
        })
        date.setDate(date.getDate() + 1)
      }
    }
  }

  calcDateRange() {
    switch (this.viewMode) {
      case 'upcoming-week': {
        let today = new Date(this.currentDate)
        let firstDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + (7 - today.getDay()),
        )

        let lastDate = new Date(firstDate)
        lastDate.setDate(lastDate.getDate() + 6)
        // June 1 - 7
        let title =
          this.getMonthName(firstDate.getMonth()) +
          ' ' +
          firstDate.getDate() +
          ' - ' +
          lastDate.getDate()
        return { firstDate, lastDate, title }
      }
      case 'month-with-all': {
        let firstDate = new Date(this.currentDate)
        // shift to 1st day in the month
        firstDate.setDate(1)
        // shift to sunday
        firstDate.setDate(firstDate.getDate() - firstDate.getDay())

        let lastDate = new Date(firstDate)
        // shift to next month
        lastDate.setMonth(lastDate.getMonth() + 1)

        // June
        let title = this.getMonthName(this.currentDate.getMonth())

        return { firstDate, lastDate, title }
      }
      default:
        throw new Error('Invalid mode: ' + this.viewMode)
    }
  }

  async ngOnInit() {}
  public prevMonth(): void {
    if (this.viewMode == 'upcoming-week') {
      this.prevWeek()
      return
    }
    this.currentDate.setMonth(this.currentDate.getMonth() - 1)
    this.calcWeeks()
  }

  public nextMonth(): void {
    if (this.viewMode == 'upcoming-week') {
      this.nextWeek()
      return
    }
    this.currentDate.setMonth(this.currentDate.getMonth() + 1)
    this.calcWeeks()
  }

  public prevWeek(): void {
    this.currentDate.setDate(this.currentDate.getDate() - 7)
    this.calcWeeks()
  }

  public nextWeek(): void {
    this.currentDate.setDate(this.currentDate.getDate() + 7)
    this.calcWeeks()
  }

  public today(): void {
    this.currentDate = new Date()
    this.calcWeeks()
  }

  private getMonthName(month: number): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    return months[month]
  }

  private getDayName(day: number): string {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]
    return days[day]
  }
}

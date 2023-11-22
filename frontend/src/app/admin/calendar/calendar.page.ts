import { Component, OnInit } from '@angular/core'
import { DAY } from '@beenotung/tslib/time'
import { LangService } from 'src/app/lang.service'
import {
  getEventsForCalendarByAdmin,
  GetEventsForCalendarByAdminOutput,
  getToken,
} from 'src/sdk2'

interface CalendarDay {
  date: number
  time: number
  events: CalendarEvent[]
}

type CalendarEvent = GetEventsForCalendarByAdminOutput['events'][number]

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
  public viewMode: 'month' | 'week' | 'day' = 'month'
  public currentDate: Date
  public currentViewTitle: string = ''
  public currentDayEvents: CalendarEvent[] = []

  public services: Option[] = []
  public serviceProviders: Option[] = []
  public clients: Option[] = []

  public selected_service_id = 0
  public selected_service_provider_id = 0
  public selected_client_id = 0

  public days: CalendarDay[] = []

  constructor(public langService: LangService) {
    this.currentDate = new Date()
    this.calcWeeks()
  }

  async calcWeeks() {
    let token = getToken()
    if (!token) return

    let { firstDate, lastDate, title } = this.calcDateRange()

    this.currentViewTitle = title

    let json = await getEventsForCalendarByAdmin({
      token,
      first_time: firstDate.getTime(),
      last_time: lastDate.getTime(),
    })

    this.services = []
    this.serviceProviders = []
    this.clients = []

    json.events.forEach((event) => {
      push(this.services, {
        id: event.service_id,
        label: event.service_name,
      })
      push(this.serviceProviders, {
        id: event.provider_id,
        label: event.provider_username,
      })
      push(this.clients, {
        id: event.user_id,
        label: event.user_username,
      })
    })

    if (this.viewMode == 'day') {
      this.currentDayEvents = json.events
      return
    }

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
      case 'day': {
        let firstDate = new Date(this.currentDate)

        let lastDate = new Date(firstDate)
        // shift to next day
        lastDate.setDate(lastDate.getDate() + 1)

        // Wed, June 12
        let title =
          this.getDayName(this.currentDate.getDay()) +
          ', ' +
          this.getMonthName(this.currentDate.getMonth()) +
          ' ' +
          this.currentDate.getDate()

        return {
          firstDate,
          lastDate,
          title,
        }
      }
      case 'week': {
        let firstDate = new Date(this.currentDate)
        // shift to sunday
        firstDate.setDate(firstDate.getDate() - firstDate.getDay())

        let lastDate = new Date(firstDate)
        // shift to next sunday
        lastDate.setDate(lastDate.getDate() + 7)

        // June 1 - 7
        let title =
          this.getMonthName(this.currentDate.getMonth()) +
          ' ' +
          firstDate.getDate() +
          ' - ' +
          (lastDate.getDate() - 1)

        return { firstDate, lastDate, title }
      }
      case 'month': {
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

  async ngOnInit() {
    // TODO get event list
  }

  t = this.langService.translate

  public prevMonth(): void {
    if (this.viewMode == 'week') {
      this.prevWeek()
      return
    }
    if (this.viewMode == 'day') {
      this.prevDay()
      return
    }
    this.currentDate.setMonth(this.currentDate.getMonth() - 1)
    this.calcWeeks()
  }

  public nextMonth(): void {
    if (this.viewMode == 'week') {
      this.nextWeek()
      return
    }
    if (this.viewMode == 'day') {
      this.nextDay()
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

  public prevDay(): void {
    this.currentDate.setDate(this.currentDate.getDate() - 1)
    this.calcWeeks()
  }

  public nextDay(): void {
    this.currentDate.setDate(this.currentDate.getDate() + 1)
    this.calcWeeks()
  }

  public selectByTime(time: number) {
    this.viewMode = 'day'
    this.currentDate = new Date(time)
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

function push(options: Option[], option: Option) {
  if (options.find((o) => o.id == option.id)) return
  options.push(option)
}

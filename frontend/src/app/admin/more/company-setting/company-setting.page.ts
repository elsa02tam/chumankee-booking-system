import { timeToDateTime, dateTimeToTime } from 'src/helpers/format'
import { DAY } from '@beenotung/tslib/time'
import {
  GetCompanyOperationTimeOutput,
  saveAllowCancelBookingTime,
} from './../../../../sdk2'
import { Component, NgZone, OnInit } from '@angular/core'
import { ApiService } from 'src/app/api.service'
import {
  getCompanySettings,
  getToken,
  delCompanyHoliday,
  GetCompanySettingsOutput,
  saveCompanyHoliday,
  saveCompanyServiceTimes,
} from 'src/sdk2'
import { LangService } from 'src/app/lang.service'

type Holiday = GetCompanySettingsOutput['holidays'][number]

@Component({
  selector: 'app-company-setting',
  templateUrl: './company-setting.page.html',
  styleUrls: ['./company-setting.page.scss'],
})
export class CompanySettingPage implements OnInit {
  company?: GetCompanySettingsOutput

  allow_cancel_booking_days = 2

  weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  constructor(private api: ApiService, private langService: LangService) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  async ngOnInit() {
    try {
      let token = getToken()
      if (!token) return
      let json = await getCompanySettings({ token })
      this.company = json
      this.company.holidays.forEach((holiday) => {
        if (holiday.from_time) {
          holiday.from_time = timeToDateTime(holiday.from_time) as any
        }
        if (holiday.to_time) {
          holiday.to_time = timeToDateTime(holiday.to_time) as any
        }
      })
      this.allow_cancel_booking_days = json.allow_cancel_booking_time / DAY
    } catch (error) {
      this.api.showError(error)
    }
  }

  setOperationTime(
    operationTime: GetCompanyOperationTimeOutput['serviceTimes'][number],
  ) {
    operationTime.from_time = '10:00:00'
    operationTime.to_time = '20:00:00'
  }

  setNoOperationTime(
    operationTime: GetCompanyOperationTimeOutput['serviceTimes'][number],
  ) {
    operationTime.from_time = ''
    operationTime.to_time = ''
  }

  async saveOperationTime() {
    try {
      let token = getToken()
      if (!token) return
      if (!this.company) return
      await saveCompanyServiceTimes({
        token,
        serviceTimes: this.company.serviceTimes,
      })
      this.api.showSuccess('saved operation times')
    } catch (error) {
      this.api.showError(error)
    }
  }

  async saveHoliday(holiday: Holiday) {
    let token = getToken()
    if (!token) return
    try {
      let json = await saveCompanyHoliday({
        token,
        holiday: {
          ...holiday,
          from_time: dateTimeToTime(holiday.from_time as any),
          to_time: dateTimeToTime(holiday.to_time as any),
        },
      })
      holiday.id = json.id
      this.api.showSuccess('saved company holiday')
    } catch (error) {
      this.api.showError(error)
    }
  }

  async delHoliday(id: number) {
    try {
      let token = getToken()
      if (!token) return
      if (!this.company) return
      await delCompanyHoliday({
        token,
        id,
      })
      this.api.showSuccess('deleted company holiday')
      let idx = this.company.serviceTimes.findIndex((s) => s.id === id)
      console.log({ idx })
      this.company.serviceTimes.splice(idx, 1)
      // FIXME UI not updated?
    } catch (error) {
      this.api.showError(error)
    }
  }

  addHoliday() {
    let date = new Date()
    date.setHours(8, 0, 0, 0)
    this.company?.holidays.push({
      id: 0,
      remark: '',
      from_time: date.getTime() + 1 * DAY,
      to_time: date.getTime() + 2 * DAY,
    })
  }

  async saveAllowCancelBookingTime() {
    let token = getToken()
    if (!token) return
    try {
      await saveAllowCancelBookingTime({
        token,
        allow_cancel_booking_time: this.allow_cancel_booking_days * DAY,
      })
      this.api.showSuccess('Update Cancel Booking Time Successfully')
    } catch (error) {
      this.api.showError(error)
    }
  }
}

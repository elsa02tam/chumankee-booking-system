import { getNowDateStr, strToDate } from 'src/helpers/format'
import {
  getBookingDetailsByAdmin,
  GetBookingDetailsByAdminOutput,
  getToken,
  acceptBookingByAdmin,
  rejectBookingByAdmin,
  checkInBookingByAdmin,
  checkOutBookingByAdmin,
  changeBookingTimeByAdmin,
  receiveBookingPaymeByAdmin,
  updateServiceBookingTimeByAdmin,
  updateBookingRemarkByAdmin,
} from './../../../../sdk2'
import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ApiService } from '../../../api.service'
import { AlertController, ModalController } from '@ionic/angular'
import { dateTimeToTime } from '../../../../helpers/format'
import {
  CalendarEvent,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar'
import { colors } from '../../../calendar-utils/colors'
import { Subject } from 'rxjs'
import { LangService } from '../../../lang.service'

type Booking = GetBookingDetailsByAdminOutput['booking']

@Component({
  selector: 'app-booking-details',
  templateUrl: './booking-details.page.html',
  styleUrls: ['./booking-details.page.scss'],
})
export class BookingDetailsPage implements OnInit {
  dateFormat = 'yyyy-MM-dd HH:mm'

  id?: number
  data?: GetBookingDetailsByAdminOutput

  //for change booking time
  selectedDate: string = getNowDateStr()
  selectedStartTime: string = '10:00'
  selectedFinishTime: string = '11:00'

  isShowReschedule = false
  showPaymentForm = false

  //for request payment data
  deposit_deadline?: string
  deposit_amount?: number
  full_pay_deadline?: string
  full_pay_amount?: number

  //for calendar
  view: CalendarView = CalendarView.Week
  viewDate = new Date()
  events: CalendarEvent[] = []
  refresh = new Subject<void>()

  constructor(
    private activatedRoute: ActivatedRoute,
    public api: ApiService,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private langService: LangService,
  ) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  async ngOnInit() {
    await this.loadBookingDetail()
  }

  async loadBookingDetail() {
    let id = parseInt(this.activatedRoute.snapshot.paramMap.get('id') ?? '0')
    console.log('booking id:', id)
    if (!id) return
    this.id = id
    try {
      let token = getToken()
      if (!token) return
      let json = await getBookingDetailsByAdmin({ token, booking_id: id })
      this.data = json
    } catch (error) {
      this.api.showError(error)
    }
  }

  async acceptBooking(booking: Booking) {
    try {
      let token = getToken()
      if (!token) return
      console.log('booking...', this)
      let full_pay_deadline = dateTimeToTime(this.full_pay_deadline || '')
      let deposit_deadline = dateTimeToTime(this.deposit_deadline || '')
      let json = await acceptBookingByAdmin({
        token,
        booking_id: booking.id,
        full_pay_amount: this.full_pay_amount || 0,
        full_pay_deadline,
        deposit_amount: this.deposit_amount || 0,
        deposit_deadline,
      })
      console.log('update payment data: ', json)
      this.api.showSuccess('Accepted Booking!')
      console.log('accept: ', booking)
      console.log('accept time: ', booking.booking_accept_time)
      this.showPaymentForm = false
      await this.loadBookingDetail()
    } catch (error) {
      this.api.showError(error)
    }
  }

  async rejectBooking(booking: Booking) {
    try {
      let token = getToken()
      if (!token) return

      console.log('booking...')
      let json = await rejectBookingByAdmin({
        token,
        booking_id: booking.id,
      })
      booking.booking_reject_time = json.booking_reject_time

      this.api.showSuccess('Rejected Booking!')
      console.log('reject: ', booking)

      console.log('reject time: ', booking.booking_reject_time)
    } catch (error) {
      this.api.showError(error)
    }
  }

  async receivePayme(
    booking: Booking,
    pay_for: string,
    received_amount: number,
  ) {
    try {
      let token = getToken()
      if (!token) return
      let json = await receiveBookingPaymeByAdmin({
        token,
        booking_id: booking.id,
        pay_for,
        received_amount,
      })
      this.api.showSuccess('Received Payme for ' + pay_for)
      await this.loadBookingDetail()
    } catch (error) {
      this.api.showError(error)
    }
  }

  async checkIn(booking: Booking) {
    try {
      let token = getToken()
      if (!token) return
      let json = await checkInBookingByAdmin({ token, booking_id: booking.id })
      booking.arrive_time = json.arrive_time
      this.api.showSuccess('Check-in successfully!')
    } catch (error) {
      this.api.showError(error)
    }
  }

  async checkOut(booking: Booking) {
    try {
      let token = getToken()
      if (!token) return
      let json = await checkOutBookingByAdmin({ token, booking_id: booking.id })
      booking.leave_time = json.leave_time
      this.api.showSuccess('Check-out successfully!')
    } catch (error) {
      this.api.showError(error)
    }
  }

  async updateBookingTime(booking: Booking) {
    let token = getToken()
    if (!token) return
    let from_time = strToDate(
      this.selectedDate,
      this.selectedStartTime,
    ).getTime()
    let to_time = strToDate(
      this.selectedDate,
      this.selectedFinishTime,
    ).getTime()

    try {
      let json = await changeBookingTimeByAdmin({
        token,
        booking_id: booking.id,
        from_time,
        to_time,
      })
      console.log('update booking result: ', json)
      //update UI after submit successfully
      booking.from_time = from_time
      booking.to_time = to_time
      this.api.showSuccess('Update Booking Time Successfully')
    } catch (error) {
      this.api.showError(error)
    }
  }

  async showCalendar() {
    if (!this.data) return
    let booking = this.data.booking
    let start = new Date(booking.from_time)
    let end = new Date(booking.to_time)
    this.events = [
      {
        title: booking.service.name,
        color: colors.yellow,
        start,
        end,
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true,
        },
      },
    ]
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    event.start = newStart
    event.end = newEnd
    this.refresh.next()
  }

  dismissReschedule() {
    this.events = []
  }

  async saveReschedule() {
    try {
      let data = this.data
      let event = this.events[0]
      let token = getToken()
      if (!token || !event || !data) return
      data.booking.from_time = event.start.getTime()
      data.booking.to_time = event.end!.getTime()
      await updateServiceBookingTimeByAdmin({
        token,
        booking_id: data.booking.id,
        from_time: data.booking.from_time,
        to_time: data.booking.to_time,
      })

      await this.api.showSuccess('Arrange successfully!')
      this.events = []
    } catch (error) {
      this.api.showError(error)
    }
  }

  async saveRemark(booking: Booking) {
    let token = getToken()
    if (!token) return
    try {
      let json = await updateBookingRemarkByAdmin({
        token,
        booking_id: booking.id,
        remark: booking.remark,
      })
      this.api.showSuccess('Update Remark Successfully')
    } catch (error) {
      this.api.showError(error)
    }
  }
}

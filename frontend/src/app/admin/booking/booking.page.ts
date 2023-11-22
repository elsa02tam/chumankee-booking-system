import { Component, OnInit } from '@angular/core'
import {
  getToken,
  GetBookingListsByAdminOutput,
  getBookingListsByAdmin,
} from 'src/sdk2'
import { ApiService } from 'src/app/api.service'
import { Router } from '@angular/router'
import { LangService } from 'src/app/lang.service'

type BookingItem = GetBookingListsByAdminOutput['booking'][number]

type UIBookingItem = BookingItem & {}

@Component({
  selector: 'app-booking',
  templateUrl: './booking.page.html',
  styleUrls: ['./booking.page.scss'],
})
export class BookingPage implements OnInit {
  dateFormat = 'yyyy-MM-dd HH:mm'

  data?: GetBookingListsByAdminOutput
  matchedResult: UIBookingItem[] = []

  searchText = ''

  //for filtering by booking status
  openFilterRadio = false
  // all / pending / accepted / rejected by admin / cancelled by consumer
  statusFilter: 'all' | 'pending' | 'accepted' | 'rejected' | 'cancelled' =
    'all'
  statusList = ['all', 'pending', 'accepted', 'rejected', 'cancelled']

  constructor(
    private api: ApiService,
    public router: Router,
    public langService: LangService,
  ) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  async ngOnInit() {
    try {
      let token = getToken()
      if (!token) return
      let result = await getBookingListsByAdmin({ token })
      this.data = result
      this.applyFilter()
      console.log('booking: ', this.data)
    } catch (error) {
      this.api.showError(error)
    }
  }

  // async searchBar() {
  //   console.log('Searching...')
  //   if (!this.data) return

  //   this.matchedResult = this.data.booking.filter((booking) => {
  //     return (
  //       booking.id.toString().includes(this.bookingId) ||
  //       booking.user.username.includes(this.username)
  //     )
  //   })
  // }

  goToBookingDetailsPage(bookingId?: any) {
    if (bookingId) {
      this.router.navigateByUrl(`/admin/booking/booking-details/${bookingId}`)
    } else {
      console.log('Booking is null or undefined')
    }
  }

  async applyFilter() {
    console.log('apply filter')
    if (!this.data) return
    console.log('has data')
    let matches = this.filterByStatus(this.statusFilter).filter(
      (booking) =>
        booking.id.toString().includes(this.searchText) ||
        booking.user.username.includes(this.searchText),
    )
    this.matchedResult = matches
  }

  filterByStatus(status: string) {
    let matches = this.data?.booking || []
    switch (status) {
      case 'all':
        break
      case 'pending':
        matches = matches.filter(
          (booking) =>
            !booking.booking_accept_time &&
            !booking.booking_cancel_time &&
            !booking.booking_reject_time,
        )
        break
      case 'accepted':
        matches = matches.filter(
          (booking) =>
            booking.booking_accept_time &&
            !booking.booking_cancel_time &&
            !booking.booking_reject_time,
        )
        break
      case 'rejected':
        matches = matches.filter(
          (booking) =>
            !booking.booking_accept_time &&
            !booking.booking_cancel_time &&
            booking.booking_reject_time,
        )
        break
      case 'cancelled':
        matches = matches.filter((booking) => booking.booking_cancel_time)
        break
    }
    return matches
  }
}

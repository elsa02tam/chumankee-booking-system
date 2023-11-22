import { Component, OnInit } from '@angular/core'
import {
  getNonAdminUserNumberByAdmin,
  getBookingSalesByAdmin,
  getBookingNumberByAdmin,
  getToken,
  getAdminNumberByAdmin,
  getUserNumberByAdmin,
  getOrderSalesByAdmin,
  getPendingBookingNumberByAdmin,
  getAcceptedBookingNumberByAdmin,
  getRejectedBookingNumberByAdmin,
  getCancelledBookingNumberByAdmin,
} from 'src/sdk2'
import { ApiService } from '../../../api.service'
import { LangService } from 'src/app/lang.service'
// import { DatePipe } from '@angular/common'

@Component({
  selector: 'app-report-sheet',
  templateUrl: './report-sheet.page.html',
  styleUrls: ['./report-sheet.page.scss'],
})
export class ReportSheetPage implements OnInit {
  public bookingNumber?: number
  public pendingBookingNumber?: number
  public acceptedBookingNumber?: number
  public rejectedBookingNumber?: number
  public cancelledBookingNumber?: number
  public orderSales?: number
  public bookingSales?: number
  public userNumber?: number
  public nonAdminUserNumber?: number
  public adminNumber?: number
  public today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Hong_Kong',
  })

  constructor(public api: ApiService, private langService: LangService) {
    api.wrapAutoUpdate(this)
  }

  async ngOnInit() {
    this.loadReportData()
  }

  t = this.langService.translate

  async loadReportData() {
    try {
      // const today = this.datePipe.transform(new Date(), 'yyyy-MM-dd')
      const token = getToken()
      if (!token) return
      const userNumberRes = await getUserNumberByAdmin({ token })
      this.userNumber = userNumberRes.data.userNumber
      const adminNumberRes = await getAdminNumberByAdmin({ token })
      this.adminNumber = adminNumberRes.data.adminNumber
      const nonAdminUserNumberRes = await getNonAdminUserNumberByAdmin({
        token,
      })
      this.nonAdminUserNumber = nonAdminUserNumberRes.data.nonAdminUserNumber
      const bookingSalesRes = await getBookingSalesByAdmin({ token })
      this.bookingSales = bookingSalesRes.data.bookingSales
      const orderSalesRes = await getOrderSalesByAdmin({ token })
      this.orderSales = orderSalesRes.data.orderSales
      const bookingNumberRes = await getBookingNumberByAdmin({ token })
      this.bookingNumber = bookingNumberRes.data.bookingNumber
      const pendingBookingNumberRes = await getPendingBookingNumberByAdmin({
        token,
      })
      this.pendingBookingNumber =
        pendingBookingNumberRes.data.pendingBookingNumber
      const acceptedBookingNumberRes = await getAcceptedBookingNumberByAdmin({
        token,
      })
      this.acceptedBookingNumber =
        acceptedBookingNumberRes.data.acceptedBookingNumber
      const rejectedBookingNumberRes = await getRejectedBookingNumberByAdmin({
        token,
      })
      this.rejectedBookingNumber =
        rejectedBookingNumberRes.data.rejectedBookingNumber
      const cancelledBookingNumberRes = await getCancelledBookingNumberByAdmin({
        token,
      })
      this.cancelledBookingNumber =
        cancelledBookingNumberRes.data.cancelledBookingNumber
    } catch (error) {
      this.api.showError(error)
    }
  }

  async loadNonAdminUserNumberByAdmin() {
    try {
      const token = getToken()
      if (!token) return
      const res = await getNonAdminUserNumberByAdmin({ token })
      this.nonAdminUserNumber = res.data.nonAdminUserNumber
    } catch (error) {
      this.api.showError(error)
    }
  }

  async loadAdminNumberByAdmin() {
    try {
      const token = getToken()
      if (!token) return
      const res = await getAdminNumberByAdmin({ token })
      this.adminNumber = res.data.adminNumber
    } catch (error) {
      this.api.showError(error)
    }
  }

  async loadUserNumberByAdmin() {
    try {
      const token = getToken()
      if (!token) return
      const res = await getUserNumberByAdmin({ token })
      this.userNumber = res.data.userNumber
    } catch (error) {
      this.api.showError(error)
    }
  }

  async loadBookingSalesByAdmin() {
    try {
      const token = getToken()
      if (!token) return
      const res = await getBookingSalesByAdmin({ token })
      this.bookingSales = res.data.bookingSales
    } catch (error) {
      this.api.showError(error)
    }
  }

  async loadOrderSalesByAdmin() {
    try {
      const token = getToken()
      if (!token) return
      const res = await getOrderSalesByAdmin({ token })
      this.orderSales = res.data.orderSales
    } catch (error) {
      this.api.showError(error)
    }
  }

  async loadBookingNumberByAdmin() {
    try {
      const token = getToken()
      if (!token) return
      const res = await getBookingNumberByAdmin({ token })
      this.bookingNumber = res.data.bookingNumber
    } catch (error) {
      this.api.showError(error)
    }
  }

  async loadPendingBookingNumberByAdmin() {
    try {
      const token = getToken()
      if (!token) return
      const res = await getPendingBookingNumberByAdmin({ token })
      this.pendingBookingNumber = res.data.pendingBookingNumber
    } catch (error) {
      this.api.showError(error)
    }
  }

  async loadAcceptedBookingNumberByAdmin() {
    try {
      const token = getToken()
      if (!token) return
      const res = await getAcceptedBookingNumberByAdmin({ token })
      this.acceptedBookingNumber = res.data.acceptedBookingNumber
    } catch (error) {
      this.api.showError(error)
    }
  }
  async loadRejectedBookingNumberByAdmin() {
    try {
      const token = getToken()
      if (!token) return
      const res = await getRejectedBookingNumberByAdmin({ token })
      this.rejectedBookingNumber = res.data.rejectedBookingNumber
    } catch (error) {
      this.api.showError(error)
    }
  }
  async loadCancelledBookingNumberByAdmin() {
    try {
      const token = getToken()
      if (!token) return
      const res = await getCancelledBookingNumberByAdmin({ token })
      this.cancelledBookingNumber = res.data.cancelledBookingNumber
    } catch (error) {
      this.api.showError(error)
    }
  }
}

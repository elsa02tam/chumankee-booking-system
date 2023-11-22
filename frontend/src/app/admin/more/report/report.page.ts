import { Component, ViewChild, OnInit } from '@angular/core'
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js'
import { BaseChartDirective } from 'ng2-charts'
import { IonModal } from '@ionic/angular'
import {
  getToken,
  getYearlyBookingReportByAdmin,
  getMonthlyBookingReportByAdmin,
  getYearlySalesReportByAdmin,
  getMonthlySalesReportByAdmin,
  getYearlyAttendanceReportByAdmin,
  getDailyBookingReportByAdmin,
  getDailySalesReportByAdmin,
  getMonthlyAttendanceReportByAdmin,
  getDailyAttendanceReportByAdmin,
  getProviderListForAdmin,
  GetProviderListForAdminOutput,
  getYearlyServiceHotnessReportByAdmin,
  getMonthlyServiceHotnessReportByAdmin,
  getDailyServiceHotnessReportByAdmin,
  getBookingListByDateByAdmin,
  GetBookingListByDateByAdminOutput,
  getNextWeekBookingListByAdmin,
} from 'src/sdk2'
import { ApiService } from '../../../api.service'
import DataLabelsPlugin from 'chartjs-plugin-datalabels'
import { LangService } from 'src/app/lang.service'

@Component({
  selector: 'app-report',
  templateUrl: './report.page.html',
  styleUrls: ['./report.page.scss'],
})
export class ReportPage {
  @ViewChild(IonModal) modal?: IonModal
  reportPage = 'charts'
  inputYearString: string = '2023'
  inputDateString: string = new Date().toISOString()
  timeScale: string = 'year'
  reportType: string = 'booking'
  providerList: GetProviderListForAdminOutput['providers'] = []
  providerId: number = -1
  selectProvider: boolean = true
  bookings: GetBookingListByDateByAdminOutput = []

  constructor(public api: ApiService, private langService: LangService) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  async ngAfterViewInit() {
    await this.renderReport()
  }

  /* ------------------------------ Chart Related ----------------------------- */
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined

  public ChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: {
      x: { display: true },
      y: {
        display: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
    plugins: {
      legend: {
        align: 'center',
        display: true,
        position: 'top',
      },
      datalabels: {
        display: false,
        anchor: 'end',
        align: 'end',
      },
    },
  }
  public ChartType: ChartType = 'bar'

  public ChartPlugins = [DataLabelsPlugin]

  public ChartData: ChartData = {
    labels: [],
    datasets: [],
  }
  /* ---------------------------- Chart Related End --------------------------- */

  public setModal(modal: IonModal) {
    this.modal = modal
  }

  public setTimeScale(scale: string) {
    this.timeScale = scale
    this.renderReport()
  }

  public setReportType(type: string) {
    this.reportType = type
    if (type === 'serviceHotness') {
      this.ChartType = 'pie'
      if (this.ChartOptions) {
        this.ChartOptions.scales = {
          x: { display: false },
          y: {
            display: false,
          },
        }
      }
    } else {
      this.ChartType = 'bar'
      if (this.ChartOptions) {
        this.ChartOptions.scales = {
          x: { display: true },
          y: {
            display: true,
            ticks: {
              stepSize: 1,
            },
          },
        }
      }
    }
    this.renderReport()
  }

  public setProviderId(id: number) {
    this.providerId = id
    this.renderReport()
  }

  public showYearPicker() {
    this.selectProvider = false
    this.timeScale = 'month'
    this.modal?.present()
  }

  public showDatePicker() {
    this.selectProvider = false
    this.timeScale = 'day'
    this.modal?.present()
  }

  public async showProviderList() {
    try {
      this.reportType = 'sales'
      this.selectProvider = true
      const token = getToken()
      if (!token) return
      const result = await getProviderListForAdmin({ token })
      if (!result) return
      this.providerList = result.providers
      this.modal?.present()
    } catch (error) {
      this.api.showError(error)
    }
  }

  public dismissModal() {
    this.modal?.dismiss()
    this.renderReport()
  }

  async getReportByAdmin(token: string) {
    switch (this.reportType) {
      case 'booking':
        switch (this.timeScale) {
          case 'year':
            return await getYearlyBookingReportByAdmin({ token })
          case 'month':
            return await getMonthlyBookingReportByAdmin({
              token,
              year: this.inputYearString,
            })
          case 'day':
            return await getDailyBookingReportByAdmin({
              token,
              date: this.inputDateString,
            })
        }
        break
      case 'sales':
        switch (this.timeScale) {
          case 'year':
            return await getYearlySalesReportByAdmin({
              token,
              providerId: this.providerId,
            })
          case 'month':
            return await getMonthlySalesReportByAdmin({
              token,
              providerId: this.providerId,
              year: this.inputYearString,
            })
          case 'day':
            return await getDailySalesReportByAdmin({
              token,
              providerId: this.providerId,
              date: this.inputDateString,
            })
        }
        break
      case 'attendance':
        switch (this.timeScale) {
          case 'year':
            return await getYearlyAttendanceReportByAdmin({ token })
          case 'month':
            return await getMonthlyAttendanceReportByAdmin({
              token,
              year: this.inputYearString,
            })
          case 'day':
            return await getDailyAttendanceReportByAdmin({
              token,
              date: this.inputDateString,
            })
        }
        break
      case 'serviceHotness':
        switch (this.timeScale) {
          case 'year':
            return await getYearlyServiceHotnessReportByAdmin({ token })
          case 'month':
            return await getMonthlyServiceHotnessReportByAdmin({
              token,
              year: this.inputYearString,
            })
          case 'day':
            return await getDailyServiceHotnessReportByAdmin({
              token,
              date: this.inputDateString,
            })
        }
        break
      default:
        throw new Error(
          `getReportByAdmin Invalid call: reportType:${this.reportType} timeScale:${this.timeScale}`,
        )
    }
    return
  }

  async renderReport() {
    this.modal?.dismiss()
    if (!this.chart) return
    try {
      const token = getToken()
      if (!token) return
      const result = await this.getReportByAdmin(token)
      if (!result) return
      this.ChartData = {
        labels: result.labels,
        datasets: [],
      }
      for (let dataLabel in result.data) {
        this.ChartData.datasets.push({
          label: dataLabel,
          data: result.data[dataLabel as keyof typeof result.data],
        })
      }
      this.chart.update()
    } catch (error) {
      this.api.showError(error)
    }
  }

  isWeekBegin = (dateString: string) => {
    const date = new Date(dateString)
    const utcDay = date.getUTCDay()

    /**
     * Date will be enabled if it is not
     * Sunday or Saturday
     */
    return utcDay === 0
  }

  async loadBookingListByAdmin() {
    try {
      const token = getToken()
      if (!token) return
      this.bookings = await getBookingListByDateByAdmin({
        token,
        date: this.inputDateString,
      })
    } catch (error) {
      this.api.showError(error)
    }
  }

  async loadNextWeekBookingListByAdmin() {
    try {
      const token = getToken()
      if (!token) return
      this.bookings = await getNextWeekBookingListByAdmin({
        token,
      })
    } catch (error) {
      this.api.showError(error)
    }
  }
}

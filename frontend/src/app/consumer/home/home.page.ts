import { Component, OnInit } from '@angular/core'
import { LangService } from 'src/app/lang.service'
import { getNowDateStr, strToDate } from 'src/helpers/format'
import {
  getServiceList,
  GetServiceListOutput,
  getToken,
  submitBooking,
} from 'src/sdk2'
import { ApiService, toImageSrc } from '../../api.service'

type Service = GetServiceListOutput['services'][number]
type Provider = Service['providers'][number]
type Plan = Service['user_plans'][number]

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  filter = 'all'

  data?: GetServiceListOutput
  items: Array<{ service: Service; status: string }> = []

  selectedProvider?: Provider
  selectedService?: Service
  selectedDate: string
  selectedStartTime: string = '10:00'
  selectedFinishTime: string = '11:00'
  selectedPlan?: Plan
  selectedAddonServicesID: number[] = []

  promo_code = ''

  constructor(private api: ApiService, private langService: LangService) {
    api.wrapAutoUpdate(this)
    this.selectedDate = getNowDateStr()
  }

  t = this.langService.translate

  ngOnInit() {
    this.loadServices()
  }

  async loadServices() {
    let token = getToken()
    if (!token) return
    try {
      this.data = await getServiceList({ token })
      this.data.services.forEach((service) => {
        service.pic = toImageSrc(service.pic) || ''
      })
      this.applyFilter()
    } catch (error) {
      this.api.showError(error)
    }
  }

  applyFilter() {
    if (!this.data) return
    this.items = this.data.services.map((service) => ({
      service,
      status: service.quota > service.booked ? 'available' : 'fully booked',
    }))
    if (this.filter !== 'all') {
      this.items = this.items.filter((item) => item.status === this.filter)
    }
  }

  selectProvider(service: Service, provider: Provider) {
    this.selectedService = service
    this.selectedProvider = provider
  }

  cancelBooking() {
    delete this.selectedService
    delete this.selectedProvider
  }

  canSubmitBooking() {
    return (
      this.selectedProvider &&
      this.selectedService &&
      this.selectedDate &&
      this.selectedStartTime &&
      this.selectedFinishTime
    )
  }

  async submitBooking() {
    let token = getToken()
    if (!token) return

    let provider_id = this.selectedProvider?.id
    let service_id = this.selectedService?.id
    if (!provider_id || !service_id) return

    let from_time = strToDate(
      this.selectedDate,
      this.selectedStartTime,
    ).getTime()
    let to_time = strToDate(
      this.selectedDate,
      this.selectedFinishTime,
    ).getTime()

    try {
      let json = await submitBooking({
        token,
        provider_id,
        service_id,
        from_time,
        to_time,
        promo_code: this.promo_code,
        user_plan_id: this.selectedPlan?.user_plan_id || 0,
        addon_service_ids: this.selectedAddonServicesID,
      })
      console.log('submit booking result:', json)
      this.api.showSuccess('submitted booking')
      this.loadServices()
    } catch (error) {
      this.api.showError(error)
    }
  }
}

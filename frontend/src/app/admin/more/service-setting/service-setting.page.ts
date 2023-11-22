import { Component, OnInit } from '@angular/core'
import { ApiService, toImageSrc, uploadFiles } from '../../../api.service'
import {
  getServiceSetting,
  GetServiceSettingOutput,
  getToken,
  saveService,
  saveServiceType,
} from '../../../../sdk2'
import { selectImage } from '@beenotung/tslib/file'
import { compressMobilePhoto, dataURItoFile } from '@beenotung/tslib/image'
import { LangService } from 'src/app/lang.service'

type Service = GetServiceSettingOutput['services'][number]
type ServiceType = GetServiceSettingOutput['serviceTypes'][number]
@Component({
  selector: 'app-service-setting',
  templateUrl: './service-setting.page.html',
  styleUrls: ['./service-setting.page.scss'],
})
export class ServiceSettingPage implements OnInit {
  data?: GetServiceSettingOutput

  //for filtering the service types
  serviceTypeIdFilter = 0 // 0 for all service types (un-filtered)

  picUrls: string[] = []

  matchedServices?: Service[]

  constructor(public api: ApiService, private langService: LangService) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  async ngOnInit() {
    let token = getToken()
    if (!token) return
    try {
      this.data = await getServiceSetting({ token })
      this.data.services.forEach((service) => {
        this.picUrls[service.id] = toImageSrc(service.pic) || ''
      })
      this.data.services.sort((a, b) => b.id - a.id)
      this.applyFilter()
    } catch (error) {
      this.api.showError(error)
    }
  }

  // finish the select and filter function
  applyFilter() {
    if (!this.data) return
    if (this.serviceTypeIdFilter === 0) {
      this.matchedServices = this.data.services
    } else {
      this.matchedServices = this.data.services.filter(
        (service) => service.type_id === this.serviceTypeIdFilter,
      )
    }
  }

  async selectServicePic(service: Service) {
    if (!this.data) return

    let [file] = await selectImage()
    if (!file) return

    let dataUrl = await compressMobilePhoto({ image: file })

    this.picUrls[service.id] = dataUrl

    file = dataURItoFile(dataUrl, file)
    let [filename] = await uploadFiles([file])
    service.pic = filename

    if (service.id > 0) {
      this.saveService(service)
    }
  }

  async saveService(service: Service) {
    let token = getToken()
    if (!token) return
    try {
      let json = await saveService({ service, token })
      this.api.showSuccess('saved service')
      service.id = json.id
      this.picUrls[service.id] = toImageSrc(service.pic) || ''
    } catch (error) {
      this.api.showError(error)
    }
  }

  addNewService() {
    this.matchedServices?.unshift({ id: -Math.random() } as any)
  }

  addNewServiceType() {
    this.data?.serviceTypes.push({
      id: -Math.random(),
      name: '',
    })
  }

  async saveServiceType(serviceType: ServiceType) {
    let token = getToken()
    if (!token) return
    try {
      let json = await saveServiceType({ token, serviceType })
      this.api.showSuccess('saved service type')
      serviceType.id = json.id
    } catch (error) {
      this.api.showError(error)
    }
  }
}

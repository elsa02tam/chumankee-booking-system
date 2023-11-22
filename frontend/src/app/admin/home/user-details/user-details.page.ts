import {
  addServiceToProvider,
  getAllServiceList,
  GetAllServiceListOutput,
  getToken,
  getUserDetailsForAdmin,
  GetUserDetailsForAdminOutput,
  removeServiceToProvider,
  saveWorkingTimesForServiceProvider,
  updateServiceProviderPic,
} from './../../../../sdk2'
import { Component, OnInit } from '@angular/core'
import { ApiService, toImageSrc, uploadFiles } from '../../../api.service'
import { ActivatedRoute } from '@angular/router'
import { AlertController } from '@ionic/angular'
import { selectImage } from '@beenotung/tslib/file'
import { compressMobilePhoto, dataURItoBlob } from '@beenotung/tslib/image'
import { LangService } from 'src/app/lang.service'

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.page.html',
  styleUrls: ['./user-details.page.scss'],
})
export class UserDetailsPage implements OnInit {
  id?: number
  userDetails?: GetUserDetailsForAdminOutput
  pic?: string | null
  // UserRoles = UserRoles;

  weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  isShowAddServiceModal = false

  // for add service modal
  serviceType: string = ''
  serviceName: string = ''
  serviceQuota?: number
  serviceTypes: GetAllServiceListOutput['service_types'] = []
  selectedServiceType?: GetAllServiceListOutput['service_types'][number]
  selectedService?: GetAllServiceListOutput['service_types'][number]['services'][number]

  // for update working time of service provider
  providerWorkingTime: any

  // for service provider

  // username: string;
  constructor(
    private activatedRoute: ActivatedRoute,
    public api: ApiService,
    public alertController: AlertController,
    private langService: LangService,
  ) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  async changePic() {
    try {
      let token = getToken()
      console.log('token: ', { token })
      if (!token) return
      let files = await selectImage({ multiple: false })
      let file = files[0]
      console.log('file: ', { file })
      if (!file) return
      let dataUrl = await compressMobilePhoto({
        image: file,
        maximumSize: 200 * 1024,
        quality: 0.8,
      })
      console.log('len', dataUrl.length)
      let blob = dataURItoBlob(dataUrl)
      file = new File([blob], file.name, {
        lastModified: file.lastModified,
        type: blob.type,
      })
      console.log('upload', { file })
      let [filename] = await uploadFiles([file])
      if (!this.userDetails) return
      this.pic = toImageSrc(filename)
      await updateServiceProviderPic({
        user_id: this.userDetails.userDetails.id,
        pic: filename,
        token,
      })
      this.api.showSuccess('Updated Image Successfully!')
    } catch (error) {
      console.error('failed to change pic', error)
      this.api.showError(error)
    }
  }

  async ngOnInit() {
    let id = parseInt(this.activatedRoute.snapshot.paramMap.get('id') ?? '0')
    console.log('user id:', id)

    if (!id) return
    this.id = id
    try {
      let token = getToken()
      if (!token) return
      let json = await getUserDetailsForAdmin({ token, user_id: id })
      this.pic = toImageSrc(json.userDetails.pic)
      this.userDetails = json
      console.log('user details:', this.userDetails)

      this.serviceTypes = (await getAllServiceList({})).service_types
      console.log('event types:', this.serviceTypes)
    } catch (error) {
      this.api.showError(error)
    }
  }

  hideAddServiceModal() {
    this.isShowAddServiceModal = false
  }

  showAddServiceModal() {
    this.isShowAddServiceModal = true
    this.serviceType = ''
    this.serviceName = ''
    this.serviceQuota = undefined
  }

  //need provider id, event id and quota max
  async submitService() {
    let token = getToken()
    if (
      !token ||
      !this.selectedServiceType ||
      !this.selectedService ||
      !this.serviceQuota ||
      !this.userDetails
    )
      return

    try {
      let json = await addServiceToProvider({
        provider_id: this.userDetails.userDetails.id,
        service_id: this.selectedService.service_id,
        quota: this.serviceQuota,
        token,
      })
      this.userDetails.services.push({
        id: json.id,
        service_name: this.selectedService.service_name,
        type_name: this.selectedServiceType.type_name,
        quota: this.serviceQuota,
      })
      this.api.showSuccess('Add Service Successfully!')

      this.hideAddServiceModal()
    } catch (error) {
      this.api.showError(error)
    }
  }

  async removeService(index: number) {
    let token = getToken()
    if (!token || !this.userDetails) return
    try {
      let service = this.userDetails.services[index]
      await removeServiceToProvider({
        // id: this.userDetails.services[index].id,
        service_id: service.id,
        provider_id: this.userDetails.userDetails.id,
        token,
      })
      this.userDetails.services.splice(index, 1)
      this.api.showSuccess('Deleted Service Successfully!')
    } catch (error) {
      this.api.showError(error)
    }
  }

  async setWorkingTime(
    workingTime: GetUserDetailsForAdminOutput['providerWorkingTime'][number],
  ) {
    workingTime.from_time = '10:00:00'
    workingTime.to_time = '20:00:00'
  }

  async noWorkingTime(
    workingTime: GetUserDetailsForAdminOutput['providerWorkingTime'][number],
  ) {
    workingTime.from_time = ''
    workingTime.to_time = ''
  }

  async updateWorkingTimeForServiceProvider() {
    try {
      let token = getToken()
      if (!token) return
      if (!this.userDetails) return
      await saveWorkingTimesForServiceProvider({
        token,
        provider_id: this.userDetails.userDetails.id,
        serviceTimes: this.userDetails.providerWorkingTime,
      })
      this.api.showSuccess('Updated Working Time Successfully!')
    } catch (error) {
      this.api.showError(error)
    }
  }
}

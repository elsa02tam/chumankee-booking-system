import { Component, OnInit } from '@angular/core'
import { ApiService } from 'src/app/api.service'
import { LangService } from 'src/app/lang.service'
import {
  getAddonServiceListByAdmin,
  GetAddonServiceListByAdminOutput,
  getToken,
  saveAddonServiceByAdmin,
} from './../../../../sdk2'

@Component({
  selector: 'app-addon-service',
  templateUrl: './addon-service.page.html',
  styleUrls: ['./addon-service.page.scss'],
})
export class AddonServicePage implements OnInit {
  data?: GetAddonServiceListByAdminOutput

  constructor(public api: ApiService, private langService: LangService) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  async ngOnInit() {
    let token = getToken()
    if (!token) return
    try {
      this.data = await getAddonServiceListByAdmin({ token })
    } catch (error) {
      this.api.showError(error)
    }
  }

  async saveAddonServices() {
    let token = getToken()
    if (!token) return
    if (!this.data) return
    try {
      let json = await saveAddonServiceByAdmin({
        addon_services: this.data.addon_services,
        token,
      })
      this.api.showSuccess('Save Add-on Service Successfully')
    } catch (error) {
      this.api.showError(error)
    }
  }

  addNewAddonService() {
    this.data?.addon_services.unshift({
      from_service_id: 0,
      to_service_id: 0,
    })
  }
}

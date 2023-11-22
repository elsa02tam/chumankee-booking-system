import { Component, OnInit } from '@angular/core'
import { LangService } from 'src/app/lang.service'
import { ApiService } from '../../../api.service'
import {
  getPlanListForAdmin,
  GetPlanListForAdminOutput,
  getToken,
  savePlan,
} from './../../../../sdk2'

type Plan = GetPlanListForAdminOutput['plans'][number]

type UIPlan = Plan & {
  by?: 'service' | 'service_type'
}

@Component({
  selector: 'app-package-setting',
  templateUrl: './package-setting.page.html',
  styleUrls: ['./package-setting.page.scss'],
})
export class PackageSettingPage implements OnInit {
  data?: GetPlanListForAdminOutput
  plans: UIPlan[] = []

  constructor(public api: ApiService, private langService: LangService) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  async ngOnInit() {
    try {
      let token = getToken()
      if (!token) return
      let json = await getPlanListForAdmin({ token })
      this.data = json
      this.plans = json.plans
      for (let plan of this.plans) {
        plan.by = plan.service_id
          ? 'service'
          : plan.service_type_id
          ? 'service_type'
          : undefined
      }
      console.log('plans: ', json)
    } catch (error) {
      this.api.showError(error)
    }
  }

  async savePlan(plan: UIPlan) {
    let token = getToken()
    if (!token) return
    try {
      let json = await savePlan({
        token,
        plan,
      })
      plan.id = json.id
      this.api.showSuccess('save plan successfully')
    } catch (error) {
      this.api.showError(error)
    }
  }

  async addNewPlan() {
    this.data?.plans.unshift({ id: -Math.random() } as any)
  }

  clearPlanBy(plan: UIPlan) {
    if (plan.by === 'service') {
      plan.service_type_id = 0
    }
    if (plan.by === 'service_type') {
      plan.service_id = 0
    }
  }
}

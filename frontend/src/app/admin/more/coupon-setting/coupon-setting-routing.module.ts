import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { CouponSettingPage } from './coupon-setting.page'

const routes: Routes = [
  {
    path: '',
    component: CouponSettingPage,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CouponSettingPageRoutingModule {}

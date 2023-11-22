import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { CouponSettingPageRoutingModule } from './coupon-setting-routing.module'

import { CouponSettingPage } from './coupon-setting.page'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CouponSettingPageRoutingModule,
  ],
  declarations: [CouponSettingPage],
})
export class CouponSettingPageModule {}

import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { ServiceSettingPageRoutingModule } from './service-setting-routing.module'

import { ServiceSettingPage } from './service-setting.page'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ServiceSettingPageRoutingModule,
  ],
  declarations: [ServiceSettingPage],
})
export class ServiceSettingPageModule {}

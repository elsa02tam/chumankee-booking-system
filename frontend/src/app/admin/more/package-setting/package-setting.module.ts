import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { PackageSettingPageRoutingModule } from './package-setting-routing.module'

import { PackageSettingPage } from './package-setting.page'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PackageSettingPageRoutingModule,
  ],
  declarations: [PackageSettingPage],
})
export class PackageSettingPageModule {}

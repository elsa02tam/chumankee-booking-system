import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { UploadSettingPageRoutingModule } from './upload-setting-routing.module'

import { UploadSettingPage } from './upload-setting.page'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UploadSettingPageRoutingModule,
  ],
  declarations: [UploadSettingPage],
})
export class UploadSettingPageModule {}

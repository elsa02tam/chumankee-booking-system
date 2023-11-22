import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { NoticeSettingPageRoutingModule } from './notice-setting-routing.module'

import { NoticeSettingPage } from './notice-setting.page'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NoticeSettingPageRoutingModule,
  ],
  declarations: [NoticeSettingPage],
})
export class NoticeSettingPageModule {}

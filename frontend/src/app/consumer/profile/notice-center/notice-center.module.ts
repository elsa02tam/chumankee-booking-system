import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { NoticeCenterPageRoutingModule } from './notice-center-routing.module'

import { NoticeCenterPage } from './notice-center.page'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NoticeCenterPageRoutingModule,
  ],
  declarations: [NoticeCenterPage],
})
export class NoticeCenterPageModule {}

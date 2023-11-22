import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { AddonServicePageRoutingModule } from './addon-service-routing.module'

import { AddonServicePage } from './addon-service.page'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddonServicePageRoutingModule,
  ],
  declarations: [AddonServicePage],
})
export class AddonServicePageModule {}

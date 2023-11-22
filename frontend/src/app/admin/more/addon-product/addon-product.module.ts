import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { AddonProductPageRoutingModule } from './addon-product-routing.module'

import { AddonProductPage } from './addon-product.page'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddonProductPageRoutingModule,
  ],
  declarations: [AddonProductPage],
})
export class AddonProductPageModule {}

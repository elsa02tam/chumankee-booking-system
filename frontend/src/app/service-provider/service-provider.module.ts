import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { ServiceProviderPageRoutingModule } from './service-provider-routing.module'

import { ServiceProviderPage } from './service-provider.page'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ServiceProviderPageRoutingModule,
  ],
  declarations: [ServiceProviderPage],
})
export class ServiceProviderPageModule {}

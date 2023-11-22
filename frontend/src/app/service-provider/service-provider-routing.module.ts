import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { dev } from 'src/config'

import { ServiceProviderPage } from './service-provider.page'

const routes: Routes = [
  {
    path: '',
    component: ServiceProviderPage,
    children: [
      {
        path: 'setting',
        loadChildren: () =>
          import('./setting/setting.module').then((m) => m.SettingPageModule),
      },
      {
        path: 'booking',
        loadChildren: () =>
          import('./booking/booking.module').then((m) => m.BookingPageModule),
      },
      {
        path: '',
        redirectTo: dev
          ? '/service-provider/setting/profile'
          : '/service-provider/booking',
        pathMatch: 'full',
      },
    ],
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ServiceProviderPageRoutingModule {}

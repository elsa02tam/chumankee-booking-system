import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { SettingPage } from './setting.page'

const routes: Routes = [
  {
    path: '',
    component: SettingPage,
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./profile/profile.module').then((m) => m.ProfilePageModule),
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingPageRoutingModule {}

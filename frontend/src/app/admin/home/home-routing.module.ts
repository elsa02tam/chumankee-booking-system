import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { HomePage } from './home.page'

const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'user-details/:id',
    loadChildren: () =>
      import('./user-details/user-details.module').then(
        (m) => m.UserDetailsPageModule,
      ),
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}

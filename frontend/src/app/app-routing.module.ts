import { NgModule } from '@angular/core'
import { PreloadAllModules, RouterModule, Routes } from '@angular/router'

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./guest/guest.module').then((m) => m.GuestPageModule),
  },
  {
    path: 'root',
    loadChildren: () =>
      import('./root/root.module').then((m) => m.RootPageModule),
    // canActivate: [canActivateByRole(UserRoles.Root)],
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminPageModule),
    // canActivate: [canActivateByRole(UserRoles.Admin)],
  },
  {
    path: 'service-provider',
    loadChildren: () =>
      import('./service-provider/service-provider.module').then(
        (m) => m.ServiceProviderPageModule,
      ),
    // canActivate: [canActivateByRole(UserRoles.Provider)],
  },
  {
    path: 'consumer',
    loadChildren: () =>
      import('./consumer/consumer.module').then((m) => m.ConsumerPageModule),
    // canActivate: [canActivateByRole(UserRoles.User)],
  },
  {
    path: 'guest',
    loadChildren: () =>
      import('./guest/guest.module').then((m) => m.GuestPageModule),
  },
]
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}

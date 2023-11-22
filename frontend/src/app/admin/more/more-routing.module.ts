import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'

import { MorePage } from './more.page'

const routes: Routes = [
  {
    path: '',
    component: MorePage,
  },
  {
    path: 'company-setting',
    loadChildren: () =>
      import('./company-setting/company-setting.module').then(
        (m) => m.CompanySettingPageModule,
      ),
  },
  {
    path: 'event-setting',
    loadChildren: () =>
      import('./event-setting/event-setting.module').then(
        (m) => m.EventSettingPageModule,
      ),
  },
  {
    path: 'package-setting',
    loadChildren: () =>
      import('./package-setting/package-setting.module').then(
        (m) => m.PackageSettingPageModule,
      ),
  },
  {
    path: 'service-setting',
    loadChildren: () =>
      import('./service-setting/service-setting.module').then(
        (m) => m.ServiceSettingPageModule,
      ),
  },
  {
    path: 'report',
    loadChildren: () =>
      import('./report/report.module').then((m) => m.ReportPageModule),
  },
  {
    path: 'coupon-setting',
    loadChildren: () =>
      import('./coupon-setting/coupon-setting.module').then(
        (m) => m.CouponSettingPageModule,
      ),
  },
  {
    path: 'upload-setting',
    loadChildren: () =>
      import('./upload-setting/upload-setting.module').then(
        (m) => m.UploadSettingPageModule,
      ),
  },
  {
    path: 'addon-service',
    loadChildren: () =>
      import('./addon-service/addon-service.module').then(
        (m) => m.AddonServicePageModule,
      ),
  },
  {
    path: 'email-settings',
    loadChildren: () =>
      import('./email-settings/email-settings.module').then(
        (m) => m.EmailSettingsPageModule,
      ),
  },
  {
    path: 'addon-product',
    loadChildren: () =>
      import('./addon-product/addon-product.module').then(
        (m) => m.AddonProductPageModule,
      ),
  },
  {
    path: 'notice-setting',
    loadChildren: () =>
      import('./notice-setting/notice-setting.module').then(
        (m) => m.NoticeSettingPageModule,
      ),
  },  {
    path: 'report-sheet',
    loadChildren: () => import('./report-sheet/report-sheet.module').then( m => m.ReportSheetPageModule)
  },

]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MorePageRoutingModule {}

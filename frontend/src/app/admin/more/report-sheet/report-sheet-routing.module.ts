import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportSheetPage } from './report-sheet.page';

const routes: Routes = [
  {
    path: '',
    component: ReportSheetPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportSheetPageRoutingModule {}

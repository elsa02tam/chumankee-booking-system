import { Component, OnInit } from '@angular/core'
import { LangService } from 'src/app/lang.service'

@Component({
  selector: 'app-service-provider',
  templateUrl: './service-provider.page.html',
  styleUrls: ['./service-provider.page.scss'],
})
export class ServiceProviderPage {
  constructor(private langService: LangService) {}

  t = this.langService.translate
}

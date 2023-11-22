import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Lang, LangService } from 'src/app/lang.service'

@Component({
  selector: 'app-more',
  templateUrl: './more.page.html',
  styleUrls: ['./more.page.scss'],
})
export class MorePage {
  constructor(public router: Router, public langService: LangService) {}

  t = this.langService.translate

  get lang() {
    return this.langService.lang
  }
  set lang(lang: Lang) {
    this.langService.lang = lang
  }

  routerModel(path: string) {
    this.router.navigateByUrl(path)
  }

  async logoutAccount() {
    localStorage.removeItem('token')
    setTimeout(() => {
      location.href = '/guest'
    }, 500)
  }
}

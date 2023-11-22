import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Lang, LangService } from 'src/app/lang.service'

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {
  constructor(public router: Router, public langService: LangService) {}

  t = this.langService.translate

  get lang() {
    return this.langService.lang
  }
  set lang(lang: Lang) {
    this.langService.lang = lang
  }

  ngOnInit() {
    console.log(this.router.url)
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

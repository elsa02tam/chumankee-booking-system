import { Router } from '@angular/router'
import { Component, OnInit } from '@angular/core'
import { ApiService, toImageSrc } from '../../api.service'
import {
  deleteAccount,
  getConsumerProfile,
  GetConsumerProfileOutput,
  getToken,
} from 'src/sdk2'
import { Lang, LangService } from 'src/app/lang.service'
import { AlertController, ModalController } from '@ionic/angular'

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  user?: GetConsumerProfileOutput
  profilePic?: string | null

  constructor(
    public router: Router,
    public api: ApiService,
    public langService: LangService,
    public alertController: AlertController,
  ) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  get lang() {
    return this.langService.lang
  }
  set lang(lang: Lang) {
    this.langService.lang = lang
  }

  async ngOnInit() {
    console.log('router.url:', this.router.url)
    try {
      let token = getToken()
      console.log('token:', { token })
      if (!token) return
      let profile = await getConsumerProfile({ token })
      this.profilePic = toImageSrc(profile.profile.pic)
      console.log('Profile:', profile)
      this.user = profile
    } catch (error) {
      this.api.showError(error)
    }
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

  async deleteAccount() {
    const token = getToken()
    if (!token) return
    let alert = await this.alertController.create({
      header: this.t('Delete Account'),
      message: this.t(
        'Confirm to delete account? This account is not reversible.',
      ),
      buttons: [
        {
          text: this.t('Dismiss'),
          role: 'cancel',
        },
        {
          text: this.t('Confirm'),
          handler: async () => {
            try {
              await deleteAccount({ token })
              this.api.showError(this.t('Deleted Account'))
              setTimeout(() => {
                this.logoutAccount()
              }, 3500)
            } catch (error) {
              this.api.showError(error)
            }
          },
        },
      ],
    })
    alert.present()
  }
}

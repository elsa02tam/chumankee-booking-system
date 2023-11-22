import { Component, OnInit } from '@angular/core'
import { AuthService } from 'src/app/auth/auth.service'
import { ApiService, toImageSrc } from '../../api.service'
import { dev } from 'src/config'
import { login, register } from 'src/sdk2'
import { LangService } from 'src/app/lang.service'
import { FacebookLogin } from '@capacitor-community/facebook-login'
import { Capacitor } from '@capacitor/core'

//for UX UI
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  watchPassword = false
  username = ''
  password = ''

  error = ''

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private langService: LangService,
  ) {
    if (dev) {
      //super admin
      // this.username = 'super_admin'
      // this.password = 'super_admin'
      //admin
      // this.username = 'PeterWong232'
      // this.password = 'Pa33word'
      // this.username = 'wongwwy'
      // this.password = 'Pa33word'
      // this.username = 'rickycheung31'
      // this.password = 'Pa33word'
      // //service provider
      // this.username = 'yfpang'
      // this.password = 'Pa33word'
      // this.username = 'michelleeyeung'
      // this.password = 'Pa33word'
      // this.username = 'tomchanyy's
      // this.password = 'Pa33word'
      // //consumer (non-vip)
      // this.username = 'chriswong'
      // this.password = 'Pa33word'
      // this.username = 'ada987'
      // this.password = 'Pa33word'
      // //consumer (vip)
      // this.username = 'tkk678'
      // this.password = 'Pa33word'
      // this.username = 'chloe432'
      // this.password = 'Pa33word'
    }
  }

  t = this.langService.translate

  async loginAccount() {
    try {
      let json = await login({
        loginId: this.username,
        password: this.password,
      })
      this.api.setToken(json.token)
      this.auth.navigateToHomeByRole()
    } catch (error) {
      return this.api.showError(error)
    }
  }

  //TODO
  async loginWithFacebook() {
    if (Capacitor.getPlatform() == 'web') {
      const self = this
      this.msg.push('login with facebook')
      FB.login(
        (response) => {
          this.msg.push('response from facebook: ' + JSON.stringify(response))
          if (response.authResponse) {
            FB.api('/me/?fields=id,email', async function (response) {
              await self.loginWithFacebookDetail(self, response)
            })
          } else {
            console.log('User cancelled login or did not fully authorize.')
          }
        },
        {
          scope: 'email, public_profile',
          return_scopes: true,
        },
      )
    } else {
      this.loginWithFacebookLib()
    }
  }

  async loginWithFacebookDetail(self: LoginPage, response: any) {
    console.log(1)
    console.log(response)
    console.log(2)
    try {
      console.log(response)
      let json = await login({
        loginId: response.id,
        password: response.id,
      })
      self.api.setToken(json.token)
      self.auth.navigateToHomeByRole()
    } catch (error) {
      try {
        let json = await register({
          username: response.id,
          phone: '12345678',
          email: response.email,
          password: response.id,
        })
        self.api.setToken(json.token)
        self.auth.navigateToHomeByRole()
      } catch (error) {
        return self.api.showError(error)
      }
    }
  }

  async loginWithFacebookLib() {
    try {
      const FACEBOOK_PERMISSIONS: string[] = ['email']
      // const FACEBOOK_PERMISSIONS = [
      //   'email',
      //   'user_birthday',
      //   'user_photos',
      //   'user_gender',
      // ]
      const result = await FacebookLogin.login({
        permissions: FACEBOOK_PERMISSIONS,
      })
      if (result.accessToken) {
        // Login successful
        const profileResult = await FacebookLogin.getProfile<{
          email: string
        }>({ fields: ['email'] })
        const self = this
        self.loginWithFacebookDetail(self, {
          id: result.accessToken.userId,
          email: profileResult.email,
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  msg = ['ready', window.location.href, Capacitor.getPlatform()]

  shouldHideFB() {
    return Capacitor.getPlatform() == 'ios'
  }
}

declare var FB: {
  login(
    cb: (response: any) => void,
    param?: {
      scope: string
      return_scopes: boolean
    },
  ): void
  api(path: string, cb: (response: any) => void): void
}

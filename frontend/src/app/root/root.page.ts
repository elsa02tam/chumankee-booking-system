import {
  getToken,
  getUserListForSuperAdmin,
  GetUserListForSuperAdminOutput,
  setUserRoleBySuperAdmin,
  SetUserRoleBySuperAdminInput,
} from './../../sdk2'
import { Component, OnInit } from '@angular/core'
import { ApiService } from '../api.service'
import { LangService } from '../lang.service'

@Component({
  selector: 'app-root',
  templateUrl: './root.page.html',
  styleUrls: ['./root.page.scss'],
})
export class RootPage implements OnInit {
  username = ''
  email = ''
  error = ''

  //allUsers = get array
  allUsers: GetUserListForSuperAdminOutput['users'] = []
  matchedUsers = this.allUsers

  constructor(public api: ApiService, private langService: LangService) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  async ngOnInit() {
    try {
      let token = getToken()
      if (!token) return
      let json = await getUserListForSuperAdmin({ token })
      this.allUsers = json.users
      this.searchBar()
      console.log(json)
    } catch (error) {
      this.api.showError(error)
    }
  }

  async searchBar() {
    this.matchedUsers = this.allUsers.filter((user) => {
      return (
        user.email.includes(this.email) && user.username.includes(this.username)
      )
    })
  }

  async changeRole(
    user: GetUserListForSuperAdminOutput['users'][number],
    role: SetUserRoleBySuperAdminInput['role'],
  ) {
    console.log('changeRole', user, role)
    try {
      let token = getToken()
      if (!token) return
      await setUserRoleBySuperAdmin({
        token,
        user_id: user.id,
        role,
      })
      user.role = role
    } catch (error) {
      this.api.showError(error)
    }
  }

  async logoutAccount() {
    localStorage.removeItem('token')
    setTimeout(() => {
      location.href = '/guest'
    }, 500)
  }
}

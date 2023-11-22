import {
  getToken,
  getUserListForAdmin,
  GetUserListForAdminOutput,
  setUserRoleByAdmin,
  createUserByAdmin,
  setUserColorByAdmin,
} from 'src/sdk2'
import { Component, OnInit } from '@angular/core'
import { ApiService, Roles } from '../../api.service'
import { Router } from '@angular/router'
import { LangService } from 'src/app/lang.service'
import { AuthService } from 'src/app/auth/auth.service'

type User = GetUserListForAdminOutput['users'][number]

type Role = User['role']

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  //for create new user data
  watchPassword = false
  createUsername = ''
  phone = ''
  email = ''
  password = ''

  openCreateUserForm = false

  //for search function
  username = ''
  error = ''

  Roles = Roles

  //allUsers = get array
  allUsers: GetUserListForAdminOutput['users'] = []
  matchedUsers = this.allUsers

  constructor(
    public api: ApiService,
    public router: Router,
    public langService: LangService,
    public auth: AuthService,
  ) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  async ngOnInit() {
    await this.loadUserList()
  }

  async loadUserList() {
    try {
      let token = getToken()
      if (!token) return
      let json = await getUserListForAdmin({ token })
      this.allUsers = json.users
      this.searchUser()
      console.log('json:', json)
    } catch (error) {
      this.api.showError(error)
    }
  }

  async searchUser() {
    this.matchedUsers = this.allUsers.filter((user) =>
      user.username.includes(this.username),
    )
  }

  async changeRole(user: User) {
    console.log('changeRole', user)
    try {
      let token = getToken()
      if (!token) return
      await setUserRoleByAdmin({
        token,
        user_id: user.id,
        role: user.role,
        is_vip: user.is_vip,
      })
    } catch (error) {
      this.api.showError(error)
    }
  }

  goToUserDetailsPage(userId?: any) {
    if (userId) {
      this.router.navigateByUrl(`/admin/home/user-details/${userId}`)
    } else {
      console.error('User ID is null or undefined')
    }
  }

  async createUser() {
    try {
      let json = await createUserByAdmin({
        username: this.createUsername,
        phone: this.phone,
        email: this.email,
        password: this.password,
      })
      this.auth.navigateToHomeByRole()
      this.api.showSuccess('Created User Successfully!')
      this.openCreateUserForm = false
      await this.loadUserList()
    } catch (error) {
      this.api.showError(error)
    }
  }

  async changeColor(user: User) {
    console.log('changeColor', user.color)
    let token = getToken()
    if (!token) return
    console.log({ user_id: user.id, color: user.color })
    try {
      let token = getToken()
      if (!token) return
      await setUserColorByAdmin({
        token,
        user_id: user.id,
        color: user.color,
      })
      this.api.showSuccess('Changed Color Successfully!')
    } catch (error) {
      this.api.showError(error)
    }
  }
}

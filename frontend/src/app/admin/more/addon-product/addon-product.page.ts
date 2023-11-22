import { Component, OnInit } from '@angular/core'
import { LangService } from 'src/app/lang.service'
import { ApiService } from 'src/app/api.service'
import {
  getAddonProductListByAdmin,
  GetAddonProductListByAdminOutput,
  getToken,
  saveAddonProductByAdmin,
} from './../../../../sdk2'

@Component({
  selector: 'app-addon-product',
  templateUrl: './addon-product.page.html',
  styleUrls: ['./addon-product.page.scss'],
})
export class AddonProductPage implements OnInit {
  data?: GetAddonProductListByAdminOutput

  constructor(public api: ApiService, private langService: LangService) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  async ngOnInit() {
    let token = getToken()
    if (!token) return
    try {
      this.data = await getAddonProductListByAdmin({ token })
    } catch (error) {
      this.api.showError(error)
    }
  }

  async saveAddonProducts() {
    let token = getToken()
    if (!token) return
    if (!this.data) return
    try {
      let json = await saveAddonProductByAdmin({
        addon_products: this.data.addon_products,
        token,
      })
      this.api.showSuccess('Save Add-on Product Successfully')
    } catch (error) {
      this.api.showError(error)
    }
  }

  addNewAddonProduct() {
    this.data?.addon_products.unshift({
      from_product_id: 0,
      to_product_id: 0,
    })
  }
}

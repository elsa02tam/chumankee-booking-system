import {
  getProductListForConsumer,
  getToken,
  GetProductListForConsumerOutput,
  addProductToShoppingCart,
  AddProductToShoppingCartInput,
} from './../../../sdk2'
import { Component, OnInit } from '@angular/core'
import { ApiService, toImageSrc } from 'src/app/api.service'
import { LangService } from 'src/app/lang.service'

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit {
  data?: GetProductListForConsumerOutput['product'] = []
  matchedResult = this.data
  shoppingCartData?: AddProductToShoppingCartInput

  //for search bar
  productName = ''

  constructor(private api: ApiService, private langService: LangService) {
    api.wrapAutoUpdate(this)
  }

  t = this.langService.translate

  //save img
  toImageSrc = toImageSrc

  async ngOnInit() {
    try {
      let token = getToken()
      if (!token) return
      let json = await getProductListForConsumer({ token })
      this.data = json.product
      console.log('on-init data:', this.data)
      this.searchBar()
    } catch (error) {
      this.api.showError(error)
    }
  }

  async searchBar() {
    console.log('Searching...')
    if (!this.data) return
    try {
      this.matchedResult = this.data.filter((product) => {
        // return str_contains(this.productName, product.name, true)
        return product.name
          .toLowerCase()
          .includes(this.productName.toLocaleLowerCase())
      })
    } catch (error) {
      this.api.showError(error)
    }
  }

  async addToShoppingCart(id: number) {
    let token = getToken()
    if (!token) return
    try {
      await addProductToShoppingCart({
        token,
        product_id: id,
      })
      this.api.showSuccess('Added to Cart Successfully!')
    } catch (error) {
      this.api.showError(error)
    }
  }
}

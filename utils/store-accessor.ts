import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import dashboard from '~/store/dashboard'

let dashboardStore: dashboard

function initialiseStores (store: Store<any>): void {
  dashboardStore = getModule(dashboard, store)
}

export { initialiseStores, dashboardStore }

import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import verificationRuntime from '~/store/verification-runtime'

let verificationRuntimeStore: verificationRuntime

function initialiseStores (store: Store<any>): void {
  verificationRuntimeStore = getModule(verificationRuntime, store)
}

export { initialiseStores, verificationRuntimeStore }

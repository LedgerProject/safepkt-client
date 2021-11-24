import Vuex, { Store } from 'vuex'
import { createLocalVue } from '@vue/test-utils'
import { getModule } from 'vuex-module-decorators'
import ReportStore from '../report'

const Vue = createLocalVue()
Vue.use(Vuex)

const getReportStore = () => {
  const store = new Store({
    modules: {
      todos: ReportStore
    }
  })
  return getModule(ReportStore, store)
}

describe('ReportStore', () => {
  it('has to get a store instance', () => {
    // See https://github.com/jest-community/eslint-plugin-jest/blob/main/docs/rules/no-done-callback.md#rule-details
    return new Promise((resolve, reject) => {
      try {
        const service = getReportStore()
        expect(service).toBeInstanceOf(Object)
        resolve(true)
      } catch (e) {
        if (e instanceof Error) {
          reject(e.message)
        }
      }
    })
  })
})

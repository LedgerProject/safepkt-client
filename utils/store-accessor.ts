import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import editor from '~/store/editor'
import report from '~/store/report'
import verificationRuntime from '~/store/verification-runtime'
import verificationSteps from '~/store/verification-steps'

let editorStore: editor
let reportStore: report
let verificationRuntimeStore: verificationRuntime
let verificationStepsStore: verificationSteps

function initialiseStores (store: Store<any>): void {
  editorStore = getModule(editor, store)
  reportStore = getModule(report, store)
  verificationRuntimeStore = getModule(verificationRuntime, store)
  verificationStepsStore = getModule(verificationSteps, store)
}

export {
  initialiseStores,
  editorStore,
  reportStore,
  verificationRuntimeStore,
  verificationStepsStore
}

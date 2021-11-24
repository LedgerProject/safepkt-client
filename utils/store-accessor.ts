import { Store } from 'vuex'
import { getModule } from 'vuex-module-decorators'
import editor from '~/store/editor'
import report from '~/store/report'
import verificationRuntime from '~/store/verification-runtime'
import verificationSteps from '~/store/verification-steps'
import uploadSource from '~/store/step/upload-source'
import programVerification from '~/store/step/program-verification'
import sourceRestoration from '~/store/step/source-restoration'

let editorStore: editor
let reportStore: report
let verificationRuntimeStore: verificationRuntime
let verificationStepsStore: verificationSteps
let programVerificationStore: programVerification
let uploadSourceStore: uploadSource
let sourceRestorationStore: sourceRestoration

function initialiseStores (store: Store<any>): void {
  editorStore = getModule(editor, store)
  reportStore = getModule(report, store)
  uploadSourceStore = getModule(uploadSource, store)
  programVerificationStore = getModule(programVerification, store)
  sourceRestorationStore = getModule(sourceRestoration, store)
  verificationRuntimeStore = getModule(verificationRuntime, store)
  verificationStepsStore = getModule(verificationSteps, store)
}

export {
  initialiseStores,
  editorStore,
  reportStore,
  uploadSourceStore,
  programVerificationStore,
  sourceRestorationStore,
  verificationRuntimeStore,
  verificationStepsStore
}

import { Module, VuexModule } from 'vuex-module-decorators'
import { Project } from '~/types/project'
import { NoTitleFound } from '~/modules/report'
import { VerificationStep as Step, VerificationStep } from '~/modules/verification-steps'
import {
  editorStore,
  verificationRuntimeStore,
  verificationStepsStore
} from '~/store'
import { ProjectNotFound } from '~/mixins/project'

@Module({
  name: 'report',
  stateFactory: true,
  namespaced: true
})
class ReportStore extends VuexModule {
  get isReportVisible (): boolean {
    return verificationStepsStore.nextStep() !== Step.uploadSourceStep
  }

  get reportTitle (): string {
    let project: Project|null = null

    if (typeof editorStore === 'undefined' || !editorStore.isProjectIdValid()) {
      return ''
    }

    try {
      project = verificationRuntimeStore.projectById(editorStore.projectId)
    } catch (e) {
      if (e instanceof ProjectNotFound) {
        return ''
      }
    }

    switch (true) {
      case verificationStepsStore.nextStep() === VerificationStep.uploadSourceStep:
        return 'Source upload'

      case verificationStepsStore.nextStep() === VerificationStep.llvmBitcodeGenerationStep ||
      (project && !project.symbolicExecutionStepStarted):
        return 'LLVM bitcode generation report'

      case verificationStepsStore.nextStep() === VerificationStep.symbolicExecutionStep:
        return 'Symbolic execution report'

      default:
        throw new NoTitleFound()
    }
  }
}

export default ReportStore

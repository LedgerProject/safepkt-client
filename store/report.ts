import { Module, VuexModule } from 'vuex-module-decorators'
import { Project } from '~/types/project'
import { NoTitleFound } from '~/modules/report'
import { VerificationStep as Step, VerificationStep } from '~/modules/verification-steps'
import {
  editorStore,
  verificationRuntimeStore,
  verificationStepsStore
} from '~/store'

@Module({
  name: 'report',
  stateFactory: true,
  namespaced: true
})
class ReportStore extends VuexModule {
  public get isReportVisible (): boolean {
    return verificationStepsStore.nextStepAvailable() !== Step.uploadSourceStep
  }

  public get reportTitle (): string {
    let project: Project|null = null

    if (editorStore.isProjectIdValid()) {
      project = verificationRuntimeStore.projectById(editorStore.projectId)
    }

    switch (true) {
      case verificationStepsStore.nextStepAvailable() === VerificationStep.uploadSourceStep:
        return 'Source upload'

      case verificationStepsStore.nextStepAvailable() === VerificationStep.llvmBitCodeGenerationStep ||
      (project && !project.symbolicExecutionStepStarted):
        return 'LLVM bitcode generation report'

      case verificationStepsStore.nextStepAvailable() === VerificationStep.symbolicExecutionStep:
        return 'Symbolic execution report'

      default:
        throw new NoTitleFound()
    }
  }
}

export default ReportStore

import { Module, Mutation, VuexModule } from 'vuex-module-decorators'
import { Project } from '~/types/project'
import { VerificationStep, VerificationStepAssertion, VerificationStepPollingTarget } from '~/types/verification-steps'
import {
  PollingTarget,
  VerificationStepProgress as Progress,
  UnexpectedStep,
  VerificationStep as VerificationStepMod, InvalidVerificationStep, VerificationStep as NextVerificationStep
} from '~/modules/verification-steps'

@Module({
  name: 'verification-steps',
  stateFactory: true,
  namespaced: true
})
export default class VerificationStepsStore extends VuexModule {
  verificationStep: VerificationStep = VerificationStepMod.uploadSourceStep

  @Mutation
  setVerificationStep (step: VerificationStep) {
    this.verificationStep = step
  }

  public get nextStepAvailable (): () => NextVerificationStep {
    return () => {
      if (!this.nextAvailableVerificationStep) {
        return NextVerificationStep.uploadSourceStep
      }

      return this.nextAvailableVerificationStep
    }
  }

  public get verificationStepReportGetter (): ({ project }: {project: Project}) => string {
    return ({ project }: {project: Project}) => {
      if (this.verificationStep === VerificationStepMod.uploadSourceStep) {
        return ''
      }

      if (
        this.verificationStep === VerificationStepMod.llvmBitCodeGenerationStep ||
          !project.symbolicExecutionStepStarted
      ) {
        return project.llvmBitcodeGenerationStepReport.messages
      }

      if (this.verificationStep === VerificationStepMod.symbolicExecutionStep) {
        return project.symbolicExecutionStepReport.messages
      }

      throw new InvalidVerificationStep(`Invalid verification step: "${this.verificationStep}"`)
    }
  }

  public get isVerificationStepProgressCompleted (): VerificationStepAssertion {
    return (project: Project, pollingTarget: VerificationStepPollingTarget) => {
      return project[pollingTarget].raw_status &&
          project[pollingTarget].raw_status === Progress.completed
    }
  }

  public get isVerificationStepSuccessful (): VerificationStepAssertion {
    return (project: Project, pollingTarget: VerificationStepPollingTarget) => {
      if (pollingTarget === PollingTarget.LLVMBitCodeGenerationStepReport) {
        return project[pollingTarget].messages &&
            project[pollingTarget].messages.includes('Wrote LLVM bitcode file')
      }

      if (pollingTarget === PollingTarget.SymbolicExecutionStepReport) {
        return project[pollingTarget].messages &&
            project[pollingTarget].messages.includes('KLEE: done: generated tests =')
      }

      throw new UnexpectedStep(`Sorry, pollingTarget ${pollingTarget} is unexpected.`)
    }
  }

  public get nextAvailableVerificationStep (): VerificationStep {
    return this.verificationStep
  }
}

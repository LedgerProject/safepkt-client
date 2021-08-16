import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import { Project } from '~/types/project'
import { VerificationStep, VerificationStepAssertion, VerificationStepPollingTarget } from '~/types/verification-steps'
import {
  PollingTarget,
  VerificationStepProgress as Progress,
  UnexpectedStep,
  VerificationStep as Step
} from '~/modules/verification-steps'
import { ProjectNotFound } from '~/mixins/project'

@Module({
  name: 'verification-steps',
  stateFactory: true,
  namespaced: true
})
export default class VerificationStepsStore extends VuexModule {
  lockedResetButton: boolean = true
  verificationStep: VerificationStep = Step.uploadSourceStep

  @Mutation
  setVerificationStep (step: VerificationStep) {
    this.verificationStep = step
  }

  @Mutation
  lockResetButton (): void {
    this.lockedResetButton = true
  }

  @Mutation
  unlockResetButton (): void {
    this.lockedResetButton = false
  }

  @Action
  reportError ({ error }: {error: Error}): void {
    this.context.commit('unlockResetButton')
    this.context.commit(
      'verification-runtime/pushError',
      { error },
      { root: true }
    )
  }

  get canRunVerificationStep (): (step: VerificationStep) => boolean {
    return (step: VerificationStep) => {
      let canDo = false

      if (step === Step.uploadSourceStep) {
        canDo = this.context.rootGetters['step/upload-source/canUploadSource']()
      }

      if (step === Step.llvmBitcodeGenerationStep) {
        canDo = this.context.rootGetters['step/llvm-bitcode-generation/canRunLlvmBitcodeGenerationStep']()
      }

      if (step === Step.symbolicExecutionStep) {
        canDo = this.context.rootGetters['step/symbolic-execution/canRunSymbolicExecutionStep']()
      }

      return canDo
    }
  }

  get isResetButtonLocked (): boolean {
    return this.lockedResetButton
  }

  get isResetButtonUnlocked (): boolean {
    return !this.isResetButtonLocked
  }

  get canResetVerificationRuntime (): boolean {
    const noVerificationStepRemaining = !this.canRunVerificationStep(Step.uploadSourceStep) &&
        !this.canRunVerificationStep(Step.llvmBitcodeGenerationStep)

    if (noVerificationStepRemaining) {
      if (!this.context.rootGetters['editor/isProjectIdValid']()) {
        return false
      }

      try {
        const project: Project|null = this.context.rootGetters['verification-runtime/currentProject']
        if (project === null) {
          return false
        }

        return project.llvmBitcodeGenerationStepDone && this.isResetButtonUnlocked
      } catch (e) {
        if (!(e instanceof ProjectNotFound)) {
          this.context.commit(
            'verification-runtime/pushError',
            { error: e },
            { root: true }
          )
        }

        return false
      }
    }

    return false
  }

  get verificationStepReportGetter (): (
    {
      project,
      step
    }: {
      project: Project,
      step: VerificationStep
    }
  ) => string {
    return ({ project, step }: {project: Project, step: VerificationStep}) => {
      if (step === Step.symbolicExecutionStep) {
        return project.symbolicExecutionStepReport.messages
      }

      if (step === Step.llvmBitcodeGenerationStep) {
        return project.llvmBitcodeGenerationStepReport.messages
      }

      return ''
    }
  }

  get isVerificationStepProgressCompleted (): (project: Project, pollingTarget: VerificationStepPollingTarget) => VerificationStepAssertion {
    return (project: Project, pollingTarget: VerificationStepPollingTarget) => {
      return project[pollingTarget].raw_status &&
          project[pollingTarget].raw_status === Progress.completed
    }
  }

  get isVerificationStepSuccessful (): VerificationStepAssertion {
    return (project: Project, pollingTarget: VerificationStepPollingTarget) => {
      if (pollingTarget === PollingTarget.LLVMBitcodeGenerationStepReport) {
        return project.llvmBitcodeGenerationStepDone
      }

      if (pollingTarget === PollingTarget.SymbolicExecutionStepProgress) {
        return project.symbolicExecutionStepDone
      }

      throw new UnexpectedStep(`Sorry, pollingTarget ${pollingTarget} is unexpected.`)
    }
  }

  get nextStep (): () => VerificationStep {
    return () => this.verificationStep
  }
}

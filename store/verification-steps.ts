import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import {
  editorStore,
  verificationRuntimeStore
} from '~/store'
import { Project } from '~/types/project'
import { VerificationStep, VerificationStepAssertion, VerificationStepPollingTarget } from '~/types/verification-steps'
import {
  PollingTarget,
  VerificationStepProgress as Progress,
  UnexpectedStep,
  InvalidVerificationStep,
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

  get isResetButtonLocked (): boolean {
    return this.lockedResetButton
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

  get canResetVerificationRuntime (): boolean {
    const noVerificationStepAvailable = !this.canRunVerificationStep(Step.uploadSourceStep) &&
        !this.canRunVerificationStep(Step.llvmBitcodeGenerationStep) &&
        !this.canRunVerificationStep(Step.symbolicExecutionStep)

    if (noVerificationStepAvailable) {
      if (typeof editorStore === 'undefined' || !editorStore.isProjectIdValid()) {
        return false
      }

      let project: Project

      try {
        project = verificationRuntimeStore.projectById(editorStore.projectId)
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

      const stepsHaveBeenCompleted = project.llvmBitcodeGenerationStepDone &&
          project.symbolicExecutionStepDone

      if (!stepsHaveBeenCompleted && !this.lockedResetButton) {
        return true
      }

      return stepsHaveBeenCompleted
    }

    return false
  }

  get verificationStepReportGetter (): ({ project }: {project: Project}) => string {
    return ({ project }: {project: Project}) => {
      if (this.verificationStep === Step.uploadSourceStep) {
        return ''
      }

      if (
        this.verificationStep === Step.llvmBitcodeGenerationStep ||
          !project.symbolicExecutionStepStarted
      ) {
        return project.llvmBitcodeGenerationStepReport.messages
      }

      if (this.verificationStep === Step.symbolicExecutionStep) {
        return project.symbolicExecutionStepReport.messages
      }

      throw new InvalidVerificationStep(`Invalid verification step: "${this.verificationStep}"`)
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

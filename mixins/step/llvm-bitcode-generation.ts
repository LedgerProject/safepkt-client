import { Component, mixins, namespace } from 'nuxt-property-decorator'
import { Project } from '~/types/project'
import { VerificationStepPollingTarget } from '~/types/verification-steps'
import { PollingTarget } from '~/modules/verification-steps'
import { ProjectNotFound } from '~/mixins/project'
import VerificationStepsMixin from '~/mixins/verification-steps'
import EventBus from '~/modules/event-bus'
import VerificationEvents from '~/modules/events'

const LlvmBitcodeGenerationStore = namespace('step/llvm-bitcode-generation')

@Component
class LlvmBitcodeGenerationMixin extends mixins(VerificationStepsMixin) {
  @LlvmBitcodeGenerationStore.Getter
  public canRunLlvmBitcodeGenerationStep!: () => boolean;

  @LlvmBitcodeGenerationStore.Action
  public generateLlvmBitcode!: (project: Project) => void

  @LlvmBitcodeGenerationStore.Action
  public pollLlvmBitcodeGenerationProgress!: (project: Project) => void

  @LlvmBitcodeGenerationStore.Action
  public pollLlvmBitcodeGenerationReport!: (project: Project) => void

  pollingLlvmBitcodeGenerationProgress?: ReturnType<typeof setInterval>

  startPollingLlvmBitcodeGenerationProgress () {
    const pollingTarget: VerificationStepPollingTarget = PollingTarget.LLVMBitcodeGenerationStepProgress

    this.pollingLlvmBitcodeGenerationProgress = setInterval(() => {
      let project: Project

      try {
        project = this.projectById(this.projectId)

        if (!project.llvmBitcodeGenerationStepStarted) {
          return
        }

        if (this.isVerificationStepProgressCompleted(project, pollingTarget)) {
          if (this.pollingLlvmBitcodeGenerationProgress) {
            clearInterval(this.pollingLlvmBitcodeGenerationProgress)
          }
          return
        }

        this.pollLlvmBitcodeGenerationProgress(project)
      } catch (e) {
        if (e instanceof ProjectNotFound) {
          // expected behavior
        } else if (this.pollingLlvmBitcodeGenerationProgress) {
          EventBus.$emit(VerificationEvents.failedVerificationStep, { error: e })
          clearInterval(this.pollingLlvmBitcodeGenerationProgress)
        }
      }
    }, 1000)
  }

  pollingLlvmBitcodeGenerationReport?: ReturnType<typeof setInterval>

  /** @throw ProjectNotFound */
  canPollLlvmBitcodeGenerationReport () {
    if (!this.isProjectIdValid()) {
      return false
    }

    const project = this.projectById(this.projectId)

    return project.llvmBitcodeGenerationStepStarted
  }

  async tryToGenerateLlvmBitcode () {
    await this.generateLlvmBitcode(this.projectById(this.projectId))
  }

  startPollingLlvmBitcodeGenerationReport () {
    const pollingTarget: VerificationStepPollingTarget = PollingTarget.LLVMBitcodeGenerationStepReport

    this.pollingLlvmBitcodeGenerationReport = setInterval(() => {
      let project: Project

      if (!this.canPollLlvmBitcodeGenerationReport()) {
        return
      }

      try {
        project = this.projectById(this.projectId)

        if (!project.llvmBitcodeGenerationStepStarted) {
          return
        }

        if (this.isVerificationStepSuccessful(project, pollingTarget)) {
          if (this.pollingLlvmBitcodeGenerationReport) {
            clearInterval(this.pollingLlvmBitcodeGenerationReport)
          }
          return
        }

        this.pollLlvmBitcodeGenerationReport(project)
      } catch (e) {
        if (e instanceof ProjectNotFound) {
          // expected behavior
        } else if (this.pollingLlvmBitcodeGenerationReport) {
          EventBus.$on(VerificationEvents.failedVerificationStep, this.reportError)
          clearInterval(this.pollingLlvmBitcodeGenerationReport)
        }
      }
    }, 1000)
  }
}

export default LlvmBitcodeGenerationMixin

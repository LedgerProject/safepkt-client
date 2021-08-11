import { Component, mixins, namespace } from 'nuxt-property-decorator'
import { Project } from '~/types/project'
import { VerificationStepPollingTarget } from '~/types/verification-steps'
import { PollingTarget } from '~/modules/verification-steps'
import { ProjectNotFound } from '~/mixins/project'
import VerificationStepsMixin from '~/mixins/verification-steps'

const VerificationRuntimeStore = namespace('verification-runtime')

@Component
class LlvmBitcodeGenerationMixin extends mixins(VerificationStepsMixin) {
  @VerificationRuntimeStore.Action
  public generateLlvmBitcode!: (project: Project) => void

  pollingLlvmBitcodeGenerationProgress?: ReturnType<typeof setInterval>

  startPollingLlvmBitcodeGenerationProgress () {
    const pollingTarget: VerificationStepPollingTarget = PollingTarget.LLVMBitCodeGenerationStepProgress

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
    const pollingTarget: VerificationStepPollingTarget = PollingTarget.LLVMBitCodeGenerationStepReport

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
          clearInterval(this.pollingLlvmBitcodeGenerationReport)
        }
      }
    }, 1000)
  }
}

export default LlvmBitcodeGenerationMixin

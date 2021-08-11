import { Component, mixins } from 'nuxt-property-decorator'
import { VerificationStepPollingTarget } from '~/types/verification-steps'
import { PollingTarget } from '~/modules/verification-steps'
import { ProjectNotFound } from '~/mixins/project'
import VerificationStepsMixin from '~/mixins/verification-steps'
import { Project } from '~/types/project'

@Component
class SymbolicExecutionMixin extends mixins(VerificationStepsMixin) {
  pollingSymbolicExecutionProgress?: ReturnType<typeof setInterval>

  pollingSymbolicExecutionReport?: ReturnType<typeof setInterval>

  canRunSymbolicExecution () {
    if (!this.isProjectIdValid()) {
      return false
    }

    const project = this.projectById(this.projectId)

    const pollingTarget: VerificationStepPollingTarget = PollingTarget.LLVMBitCodeGenerationStepReport

    return project.llvmBitcodeGenerationStepDone &&
        this.isVerificationStepSuccessful(project, pollingTarget) &&
        // No symbolic execution has started
        !project.symbolicExecutionStepStarted
  }

  async tryToRunSymbolicExecution () {
    await this.runSymbolicExecution(this.projectById(this.projectId))
  }

  startPollingSymbolicExecutionProgress () {
    const pollingTarget: VerificationStepPollingTarget = PollingTarget.SymbolicExecutionStepProgress

    this.pollingSymbolicExecutionProgress = setInterval(() => {
      let project: Project

      try {
        project = this.projectById(this.projectId)

        if (!project.symbolicExecutionStepStarted) {
          return
        }

        if (this.isVerificationStepProgressCompleted(project, pollingTarget)) {
          if (this.pollingSymbolicExecutionProgress) {
            clearInterval(this.pollingSymbolicExecutionProgress)
          }
          return
        }

        this.pollSymbolicExecutionProgress(project)
      } catch (e) {
        if (e instanceof ProjectNotFound) {
          // expected behavior
        } else if (this.pollingSymbolicExecutionProgress) {
          clearInterval(this.pollingSymbolicExecutionProgress)
        }
      }
    }, 1000)
  }

  startPollingSymbolicExecutionReport () {
    const pollingTarget: VerificationStepPollingTarget = PollingTarget.SymbolicExecutionStepReport

    this.pollingSymbolicExecutionReport = setInterval(() => {
      let project: Project

      try {
        project = this.projectById(this.projectId)

        if (
        // Early return when LLVM bitcode generation has not yet been started
        // nor it is done
          !project.llvmBitcodeGenerationStepStarted ||
            !project.llvmBitcodeGenerationStepDone ||
            !project.symbolicExecutionStepStarted
        ) {
          return
        }

        if (this.isVerificationStepSuccessful(project, pollingTarget)) {
          if (this.pollingSymbolicExecutionReport) {
            clearInterval(this.pollingSymbolicExecutionReport)
          }
          return
        }

        this.pollSymbolicExecutionReport(project)
      } catch (e) {
        if (e instanceof ProjectNotFound) {
          // expected behavior
        } else if (this.pollingSymbolicExecutionReport) {
          clearInterval(this.pollingSymbolicExecutionReport)
        }
      }
    }, 1000)
  }
}

export default SymbolicExecutionMixin

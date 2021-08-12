import { Component, mixins, namespace } from 'nuxt-property-decorator'
import { VerificationStepPollingTarget } from '~/types/verification-steps'
import { PollingTarget } from '~/modules/verification-steps'
import { ProjectNotFound } from '~/mixins/project'
import VerificationStepsMixin from '~/mixins/verification-steps'
import { Project } from '~/types/project'

const SymbolicExecutionStore = namespace('step/symbolic-execution')

@Component
class SymbolicExecutionMixin extends mixins(VerificationStepsMixin) {
  @SymbolicExecutionStore.Getter
  public canRunSymbolicExecutionStep!: () => boolean

  @SymbolicExecutionStore.Action
  public runSymbolicExecution!: (project : Project) => void

  @SymbolicExecutionStore.Action
  public pollSymbolicExecutionProgress!: (project: Project) => void

  @SymbolicExecutionStore.Action
  public pollSymbolicExecutionReport!: (project: Project) => void

  async tryToRunSymbolicExecution () {
    await this.runSymbolicExecution(this.projectById(this.projectId))
  }

  pollingSymbolicExecutionProgress?: ReturnType<typeof setInterval>

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

  pollingSymbolicExecutionReport?: ReturnType<typeof setInterval>

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

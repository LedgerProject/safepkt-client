import { Component, mixins, namespace } from 'nuxt-property-decorator'
import { VerificationStepPollingTarget } from '~/types/verification-steps'
import { PollingTarget } from '~/modules/verification-steps'
import { ProjectNotFound } from '~/mixins/project'
import VerificationStepsMixin from '~/mixins/verification-steps'
import { Project } from '~/types/project'
import EventBus from '~/modules/event-bus'
import VerificationEvents from '~/modules/events'

const SymbolicExecutionStore = namespace('step/symbolic-execution')

@Component
class SymbolicExecutionMixin extends mixins(VerificationStepsMixin) {
  @SymbolicExecutionStore.Getter
  public canRunSymbolicExecutionStep!: () => boolean

  @SymbolicExecutionStore.Action
  public runSymbolicExecution!: ({ project, flags }:{project : Project, flags: string}) => void

  @SymbolicExecutionStore.Action
  public pollSymbolicExecutionProgress!: (project: Project) => void

  async tryToRunSymbolicExecution () {
    await this.runSymbolicExecution({
      project: this.projectById(this.projectId),
      flags: this.flags
    })
  }

  pollingSymbolicExecutionProgress?: ReturnType<typeof setInterval>

  startPollingSymbolicExecutionProgress (): void {
    const pollingTarget: VerificationStepPollingTarget = PollingTarget.SymbolicExecutionStepProgress

    this.pollingSymbolicExecutionProgress = setInterval(() => {
      let project: Project

      try {
        project = this.projectById(this.projectId)

        if (
          !project.llvmBitcodeGenerationStepStarted ||
          !project.llvmBitcodeGenerationStepDone ||
          !project.symbolicExecutionStepStarted
        ) {
          // Early return when LLVM bitcode generation has not yet been started
          // nor it is done
          return
        }

        if (this.isVerificationStepSuccessful(project, pollingTarget)) {
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
          EventBus.$emit(VerificationEvents.failedVerificationStep, { error: e })
          clearInterval(this.pollingSymbolicExecutionProgress)
        }
      }
    }, 1000)
  }
}

export default SymbolicExecutionMixin

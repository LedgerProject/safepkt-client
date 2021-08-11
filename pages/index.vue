<template>
  <div class="homepage">
    <Header />
    <p>Static analysis of rust-based smart contracts</p>
    <Editor ref="editor" />
    <VerificationSteps
      ref="steps"
      :can-upload-source="canUploadSource()"
      :can-generate-llvm-bitcode="canGenerateLlvmBitcode()"
      :can-run-symbolic-execution="canRunSymbolicExecution()"
      :can-reset-verification-runtime="canResetVerificationRuntime()"
    />
    <Report
      :content="verificationStepReport()"
      :next-step-available="nextStepAvailable()"
      :title="getReportTitle()"
    />
    <UploadedProjects v-show="showUploadedProjects" />
    <notifications position="bottom right" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, namespace } from 'nuxt-property-decorator'

// - provides with logger
// - configures API host, scheme, port for current environment
import SharedState from '../modules/shared-state'
import Editor from '~/components/editor/editor.vue'
import Head from '~/components/header/header.vue'
import Report from '~/components/report/report.vue'
import UploadedProjects from '~/components/uploaded-projects/uploaded-projects.vue'
import VerificationSteps from '~/components/verification-steps/verification-steps.vue'
import EventBus from '~/modules/event-bus'
import VerificationEvents from '~/modules/events'
import { Project } from '~/types/project'
import {
  PollingTarget,
  VerificationStep as Step,
  VerificationStep as NextVerificationStep
} from '~/modules/verification-steps'
import { VerificationStep, VerificationStepPollingTarget } from '~/types/verification-steps'

const VerificationRuntime = namespace('verification-runtime')

class NoTitleFound extends Error {}
class ProjectNotFound extends Error {}

@Component({
  components: { Editor, Head, Report, UploadedProjects, VerificationSteps }
})
export default class Homepage extends Vue {
  logger = new SharedState.Logger()

  enabledSourceUpload: boolean = true

  unlockedResetButton: boolean = false

  showUploadedProjects: boolean = false

  $refs!: {
    editor: Editor
    steps: VerificationSteps
  }

  pollingLlvmBitcodeGenerationProgress?: ReturnType<typeof setInterval>

  pollingLlvmBitcodeGenerationReport?: ReturnType<typeof setInterval>

  pollingSymbolicExecutionProgress?: ReturnType<typeof setInterval>

  pollingSymbolicExecutionReport?: ReturnType<typeof setInterval>

  @VerificationRuntime.Getter
  public nextAvailableVerificationStep!: VerificationStep;

  @VerificationRuntime.Getter
  public verificationStepReportGetter: ({ project }: {project: Project}) => string;

  @VerificationRuntime.Getter
  public projectByIdGetter!: (projectId: string) => Project|undefined;

  @VerificationRuntime.Action
  public uploadSource!: ({ name, source, onSuccess }: {name: string, source: string, onSuccess: () => void}) => void

  @VerificationRuntime.Action
  public generateLlvmBitcode!: (project: Project) => void

  @VerificationRuntime.Action
  public pollLlvmBitcodeGenerationProgress!: (project: Project) => void

  @VerificationRuntime.Action
  public pollLlvmBitcodeGenerationReport!: (project: Project) => void

  @VerificationRuntime.Action
  public runSymbolicExecution!: (project : Project) => void

  @VerificationRuntime.Action
  public pollSymbolicExecutionProgress!: (project: Project) => void

  @VerificationRuntime.Action
  public pollSymbolicExecutionReport!: (project: Project) => void

  @VerificationRuntime.Action
  public resetVerificationRuntime!: () => void

  resetVerificationSteps () {
    this.unlockedResetButton = false

    this.resetVerificationRuntime()
    this.$refs.editor.setProjectId({ projectId: '' })
    this.enableSourceUpload()

    this.startPollingLlvmBitcodeGenerationProgress()
    this.startPollingLlvmBitcodeGenerationReport()
    this.startPollingSymbolicExecutionProgress()
    this.startPollingSymbolicExecutionReport()
  }

  destroyed () {
    EventBus.$off(VerificationEvents.sourceUploaded)
    EventBus.$off(VerificationEvents.llvmBitcodeGenerationStarted)
    EventBus.$off(VerificationEvents.symbolicExecutionStarted)
    EventBus.$off(VerificationEvents.resetVerificationRuntime)
    EventBus.$off(VerificationEvents.failedVerificationStep)
  }

  created () {
    this.startPollingLlvmBitcodeGenerationProgress()
    this.startPollingLlvmBitcodeGenerationReport()
    this.startPollingSymbolicExecutionProgress()
    this.startPollingSymbolicExecutionReport()

    EventBus.$off(VerificationEvents.sourceUploaded)
    EventBus.$off(VerificationEvents.llvmBitcodeGenerationStarted)
    EventBus.$off(VerificationEvents.symbolicExecutionStarted)
    EventBus.$off(VerificationEvents.resetVerificationRuntime)
    EventBus.$off(VerificationEvents.failedVerificationStep)

    EventBus.$on(VerificationEvents.sourceUploaded, this.tryToUploadSource)
    EventBus.$on(VerificationEvents.llvmBitcodeGenerationStarted, this.tryToGenerateLlvmBitcode)
    EventBus.$on(VerificationEvents.symbolicExecutionStarted, this.tryToRunSymbolicExecution)
    EventBus.$on(VerificationEvents.resetVerificationRuntime, this.resetVerificationSteps)
    EventBus.$on(VerificationEvents.failedVerificationStep, this.handleVerificationStepFailure)
  }

  beforeDestroy () {
    if (this.pollingLlvmBitcodeGenerationProgress) {
      clearInterval(this.pollingLlvmBitcodeGenerationProgress)
    }
    if (this.pollingLlvmBitcodeGenerationReport) {
      clearInterval(this.pollingLlvmBitcodeGenerationReport)
    }
    if (this.pollingSymbolicExecutionProgress) {
      clearInterval(this.pollingSymbolicExecutionProgress)
    }
    if (this.pollingSymbolicExecutionReport) {
      clearInterval(this.pollingSymbolicExecutionReport)
    }
  }

  canUploadSource (): boolean {
    return this.enabledSourceUpload
  }

  enableSourceUpload (): void {
    this.enabledSourceUpload = true
  }

  disableSourceUpload (): void {
    this.enabledSourceUpload = false
  }

  handleVerificationStepFailure () {
    this.unlockedResetButton = true
  }

  verificationStepReport (): string {
    let projectId: string = ''

    if (this.$refs.editor) {
      projectId = this.$refs.editor.getProjectId()
    }

    if (projectId.length === 0) {
      return ''
    }

    try {
      const project: Project = this.projectById(projectId)
      return this.verificationStepReportGetter({ project })
    } catch (e) {
      this.logger.error(
        e.message,
        'index.vue',
        { projectId: project.id }
      )

      return ''
    }
  }

  nextStepAvailable (): NextVerificationStep {
    if (!this.nextAvailableVerificationStep) {
      return NextVerificationStep.uploadSourceStep
    }

    return this.nextAvailableVerificationStep
  }

  startPollingLlvmBitcodeGenerationProgress () {
    const pollingTarget: VerificationStepPollingTarget = PollingTarget.LLVMBitCodeGenerationStepProgress

    this.pollingLlvmBitcodeGenerationProgress = setInterval(() => {
      let project: Project

      try {
        project = this.projectById(this.$refs.editor.getProjectId())

        if (!project.llvmBitcodeGenerationStepStarted) {
          return
        }

        if (this.$refs.steps.isVerificationStepProgressCompleted(project, pollingTarget)) {
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

  startPollingLlvmBitcodeGenerationReport () {
    const pollingTarget: VerificationStepPollingTarget = PollingTarget.LLVMBitCodeGenerationStepReport

    this.pollingLlvmBitcodeGenerationReport = setInterval(() => {
      let project: Project

      if (!this.canPollLlvmBitcodeGenerationReport()) {
        return
      }

      try {
        project = this.projectById(this.$refs.editor.getProjectId())

        if (!project.llvmBitcodeGenerationStepStarted) {
          return
        }

        if (this.$refs.steps.isVerificationStepSuccessful(project, pollingTarget)) {
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

  startPollingSymbolicExecutionProgress () {
    const pollingTarget: VerificationStepPollingTarget = PollingTarget.SymbolicExecutionStepProgress

    this.pollingSymbolicExecutionProgress = setInterval(() => {
      let project: Project

      try {
        project = this.projectById(this.$refs.editor.getProjectId())

        if (!project.symbolicExecutionStepStarted) {
          return
        }

        if (this.$refs.steps.isVerificationStepProgressCompleted(project, pollingTarget)) {
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
        project = this.projectById(this.$refs.editor.getProjectId())

        if (
        // Early return when LLVM bitcode generation has not yet been started
        // nor it is done
          !project.llvmBitcodeGenerationStepStarted ||
            !project.llvmBitcodeGenerationStepDone ||
            !project.symbolicExecutionStepStarted
        ) {
          return
        }

        if (this.$refs.steps.isVerificationStepSuccessful(project, pollingTarget)) {
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

  projectById (projectId: string): Project {
    const project = this.projectByIdGetter(projectId)
    if (typeof project === 'undefined') {
      throw new ProjectNotFound(`Could not find project having id ${projectId}`)
    }

    return project
  }

  canPollLlvmBitcodeGenerationReport () {
    if (!this.$refs.editor) {
      return false
    }

    if (this.$refs.editor.getProjectId().length === 0) {
      return false
    }

    const project = this.projectById(this.$refs.editor.getProjectId())

    if (typeof project === 'undefined') {
      return false
    }

    return project.llvmBitcodeGenerationStepStarted
  }

  canGenerateLlvmBitcode () {
    if (!this.$refs.editor) {
      return false
    }

    if (this.$refs.editor.getProjectId().length === 0) {
      return false
    }

    const project = this.projectById(this.$refs.editor.getProjectId())

    if (typeof project === 'undefined') {
      return false
    }

    return !project.llvmBitcodeGenerationStepStarted
  }

  canRunSymbolicExecution () {
    if (!this.$refs.editor) {
      return false
    }

    if (this.$refs.editor.getProjectId().length === 0) {
      return false
    }

    const project = this.projectById(this.$refs.editor.getProjectId())

    if (typeof project === 'undefined') {
      return false
    }

    const pollingTarget: VerificationStepPollingTarget = PollingTarget.LLVMBitCodeGenerationStepReport

    return project.llvmBitcodeGenerationStepDone &&
        this.$refs.steps.isVerificationStepSuccessful(project, pollingTarget) &&
        // No symbolic execution has started
        !project.symbolicExecutionStepStarted
  }

  canResetVerificationRuntime (): boolean {
    const noVerificationStepAvailable = !this.canUploadSource() &&
        !this.canGenerateLlvmBitcode() &&
        !this.canRunSymbolicExecution()

    if (noVerificationStepAvailable) {
      const project = this.projectById(this.$refs.editor.getProjectId())

      const stepsHaveBeenCompleted = project.llvmBitcodeGenerationStepDone &&
        project.symbolicExecutionStepDone

      if (!stepsHaveBeenCompleted && this.unlockedResetButton) {
        return true
      }

      return stepsHaveBeenCompleted
    }

    return false
  }

  getReportTitle () {
    let project: Project

    if (this.$refs.editor && this.$refs.editor.getProjectId()) {
      project = this.projectById(this.$refs.editor.getProjectId())
    }

    switch (true) {
      case this.nextStepAvailable() === Step.uploadSourceStep:
        return 'Source upload'

      case this.nextStepAvailable() === Step.llvmBitCodeGenerationStep ||
        (project && !project.symbolicExecutionStepStarted):
        return 'LLVM bitcode generation report'

      case this.nextStepAvailable() === Step.symbolicExecutionStep:
        return 'Symbolic execution report'

      default:
        throw new NoTitleFound()
    }
  }

  async tryToUploadSource () {
    this.$refs.editor.setProjectId({ projectId: '' })

    await this.uploadSource({
      name: this.$refs.editor.getProjectName(),
      source: this.$refs.editor.base64EncodedSource(),
      onSuccess: this.disableSourceUpload
    })
  }

  async tryToGenerateLlvmBitcode () {
    await this.generateLlvmBitcode(
      this.projectById(this.$refs.editor.getProjectId())
    )
  }

  async tryToRunSymbolicExecution () {
    await this.runSymbolicExecution(
      this.projectById(this.$refs.editor.getProjectId())
    )
  }
}
</script>

<style lang="scss">
@import "./index.scss";
</style>

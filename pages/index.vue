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
    />
    <UploadedProjects />
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
import UploadedProjects from '~/components/uploaded-projects/uploaded-projects.vue'
import VerificationSteps from '~/components/verification-steps/verification-steps.vue'
import EventBus from '~/modules/event-bus'
import VerificationEvents from '~/modules/events'
import { Project } from '~/types/project'
import { VerificationStep as Step } from '~/components/verification-steps/verification-steps-progress'
import { VerificationStep } from '~/types/verification-steps'
const Dashboard = namespace('dashboard')

class ProjectNotFound extends Error {}

@Component({
  components: { Editor, Head, UploadedProjects, VerificationSteps }
})
export default class Homepage extends Vue {
  logger = new SharedState.Logger()

  enabledSourceUpload: boolean = true

  $refs!: {
    editor: Editor
    steps: VerificationSteps
  }

  pollingLlvmBitcodeGenerationProgress?: ReturnType<typeof setInterval>

  pollingSymbolicExecutionProgress?: ReturnType<typeof setInterval>

  pollingLlvmBitcodeGenerationReport?: ReturnType<typeof setInterval>

  pollingSymbolicExecutionReport?: ReturnType<typeof setInterval>

  @Dashboard.Getter
  public projectByIdGetter!: (projectId: string) => Project|undefined;

  @Dashboard.Action
  public uploadSource!: ({ name, source, onSuccess }: {name: string, source: string, onSuccess: () => void}) => void

  @Dashboard.Action
  public generateLlvmBitcode!: (project: Project) => void

  @Dashboard.Action
  public pollLlvmBitcodeGenerationProgress!: (project: Project) => void

  @Dashboard.Action
  public pollLlvmBitcodeGenerationReport!: (project: Project) => void

  @Dashboard.Action
  public runSymbolicExecution!: (project : Project) => void

  @Dashboard.Action
  public pollSymbolicExecutionProgress!: (project: Project) => void

  @Dashboard.Action
  public pollSymbolicExecutionReport!: (project: Project) => void

  destroyed () {
    EventBus.$off(VerificationEvents.sourceUploaded)
    EventBus.$off(VerificationEvents.llvmBitcodeGenerationStarted)
    EventBus.$off(VerificationEvents.symbolicExecutionStarted)
  }

  created () {
    this.startPollingLlvmBitcodeGenerationProgress()
    this.startPollingLlvmBitcodeGenerationReport()
    this.startPollingSymbolicExecutionProgress()
    this.startPollingSymbolicExecutionReport()

    EventBus.$off(VerificationEvents.sourceUploaded)
    EventBus.$off(VerificationEvents.llvmBitcodeGenerationStarted)
    EventBus.$off(VerificationEvents.symbolicExecutionStarted)

    EventBus.$on(VerificationEvents.sourceUploaded, this.tryToUploadSource)
    EventBus.$on(VerificationEvents.llvmBitcodeGenerationStarted, this.tryToGenerateLlvmBitcode)
    EventBus.$on(VerificationEvents.symbolicExecutionStarted, this.tryToRunSymbolicExecution)
  }

  beforeDestroy () {
    if (this.pollingLlvmBitcodeGenerationProgress) {
      clearInterval(this.pollingLlvmBitcodeGenerationProgress)
    }
    if (this.pollingSymbolicExecutionProgress) {
      clearInterval(this.pollingSymbolicExecutionProgress)
    }
    if (this.pollingLlvmBitcodeGenerationReport) {
      clearInterval(this.pollingLlvmBitcodeGenerationReport)
    }
    if (this.pollingSymbolicExecutionReport) {
      clearInterval(this.pollingSymbolicExecutionReport)
    }
  }

  canUploadSource (): boolean {
    return this.enabledSourceUpload
  }

  disableSourceUpload (): void {
    this.enabledSourceUpload = false
  }

  startPollingLlvmBitcodeGenerationProgress () {
    const step: VerificationStep = Step.LLVMBitCodeGenerationStepProgress

    this.pollingLlvmBitcodeGenerationProgress = setInterval(() => {
      let project: Project

      try {
        project = this.projectById(this.$refs.editor.getProjectId())

        if (!project.llvmBitcodeGenerationStepStarted) {
          return
        }

        if (this.$refs.steps.isVerificationStepProgressCompleted(project, step)) {
          if (this.pollingLlvmBitcodeGenerationProgress) {
            clearInterval(this.pollingLlvmBitcodeGenerationProgress)
          }
          return
        }

        this.pollLlvmBitcodeGenerationProgress(project)
      } catch (e) {
        if (e instanceof ProjectNotFound) {
          this.logger.error(
            e.message,
            'index.vue',
            { step }
          )
        } else if (this.pollingLlvmBitcodeGenerationProgress) {
          clearInterval(this.pollingLlvmBitcodeGenerationProgress)
        }
      }
    }, 1000)
  }

  startPollingLlvmBitcodeGenerationReport () {
    const step: VerificationStep = Step.LLVMBitCodeGenerationStepReport

    this.pollingSymbolicExecutionReport = setInterval(() => {
      let project: Project

      if (!this.canPollLlvmBitcodeGenerationReport()) {
        return
      }

      try {
        project = this.projectById(this.$refs.editor.getProjectId())

        if (!project.llvmBitcodeGenerationStepStarted) {
          return
        }

        if (this.$refs.steps.isVerificationStepSuccessful(project, step)) {
          if (this.pollingSymbolicExecutionReport) {
            clearInterval(this.pollingSymbolicExecutionReport)
          }
          return
        }

        this.pollLlvmBitcodeGenerationReport(project)
      } catch (e) {
        if (e instanceof ProjectNotFound) {
          this.logger.error(
            e.message,
            'index.vue',
            { step }
          )
        } else if (this.pollingSymbolicExecutionReport) {
          clearInterval(this.pollingSymbolicExecutionReport)
        }
      }
    }, 1000)
  }

  startPollingSymbolicExecutionProgress () {
    const step: VerificationStep = Step.SymbolicExecutionStepProgress

    this.pollingSymbolicExecutionProgress = setInterval(() => {
      let project: Project

      try {
        project = this.projectById(this.$refs.editor.getProjectId())

        if (!project.symbolicExecutionStepStarted) {
          return
        }

        if (this.$refs.steps.isVerificationStepProgressCompleted(project, step)) {
          if (this.pollingSymbolicExecutionProgress) {
            clearInterval(this.pollingSymbolicExecutionProgress)
          }
          return
        }

        this.pollSymbolicExecutionProgress(project)
      } catch (e) {
        if (e instanceof ProjectNotFound) {
          this.logger.error(
            e.message,
            'index.vue',
            { step }
          )
        } else if (this.pollingSymbolicExecutionProgress) {
          clearInterval(this.pollingSymbolicExecutionProgress)
        }
      }
    }, 1000)
  }

  startPollingSymbolicExecutionReport () {
    const step: VerificationStep = Step.SymbolicExecutionStepReport

    this.pollingSymbolicExecutionReport = setInterval(() => {
      let project: Project

      try {
        project = this.projectById(this.$refs.editor.getProjectId())

        if (
          // Early return when LLVM bitcode has not yet been generated
          // and symbolic execution has not started
          project.llvmBitcodeGenerationStepStarted &&
          !project.llvmBitcodeGenerationStepDone &&
          !project.symbolicExecutionStepStarted
        ) {
          return
        }

        if (this.$refs.steps.isVerificationStepSuccessful(project, step)) {
          if (this.pollingSymbolicExecutionReport) {
            clearInterval(this.pollingSymbolicExecutionReport)
          }
          return
        }

        this.pollSymbolicExecutionReport(project)
      } catch (e) {
        if (e instanceof ProjectNotFound) {
          this.logger.error(
            e.message,
            'index.vue',
            { step }
          )
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

    return project.llvmBitcodeGenerationStepDone
  }

  canGenerateLlvmBitcode () {
    if (!this.$refs.editor) {
      return false
    }

    if (this.$refs.editor.getProjectId().length === 0) {
      return true
    }

    const project = this.projectById(this.$refs.editor.getProjectId())

    if (typeof project === 'undefined') {
      return false
    }

    const step: VerificationStep = Step.LLVMBitCodeGenerationStepReport

    return !this.$refs.steps.isVerificationStepSuccessful(project, step)
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

    const step: VerificationStep = Step.LLVMBitCodeGenerationStepReport

    return project.llvmBitcodeGenerationStepDone &&
      this.$refs.steps.isVerificationStepSuccessful(project, step) &&
      // No symbolic execution has started
      !project.symbolicExecutionStepStarted
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

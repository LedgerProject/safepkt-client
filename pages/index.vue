<template>
  <div class="homepage">
    <Header />
    <p>Static analysis of rust-based smart contracts</p>
    <Editor ref="editor" />
    <VerificationSteps
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

const Dashboard = namespace('dashboard')

class ProjectNotFound extends Error {}

@Component({
  components: { Editor, Head, UploadedProjects, VerificationSteps }
})
export default class Homepage extends Vue {
  logger = new SharedState.Logger()

  $refs!: {
    editor: Editor
  }

  @Dashboard.Getter
  public projectByIdGetter!: (projectId: string) => Project|undefined;

  @Dashboard.Action
  public uploadSource!: ({ name, source }: {name: string, source: string}) => void

  @Dashboard.Action
  public generateLlvmBitcode!: (project: Project) => void

  @Dashboard.Action
  public runSymbolicExecution!: (project : Project) => void

  destroyed () {
    EventBus.$off(VerificationEvents.sourceUploaded)
    EventBus.$off(VerificationEvents.llvmBitcodeGenerationStarted)
    EventBus.$off(VerificationEvents.symbolicExecutionStarted)
  }

  created () {
    EventBus.$off(VerificationEvents.sourceUploaded)
    EventBus.$off(VerificationEvents.llvmBitcodeGenerationStarted)
    EventBus.$off(VerificationEvents.symbolicExecutionStarted)

    EventBus.$on(VerificationEvents.sourceUploaded, this.tryToUploadSource)
    EventBus.$on(VerificationEvents.llvmBitcodeGenerationStarted, this.tryToGenerateLlvmBitcode)
    EventBus.$on(VerificationEvents.symbolicExecutionStarted, this.tryToRunSymbolicExecution)
  }

  projectById (projectId: string): Project {
    const project = this.projectByIdGetter(projectId)
    if (typeof project === 'undefined') {
      throw new ProjectNotFound(`Could not find project having id ${projectId}`)
    }

    return project
  }

  canGenerateLlvmBitcode () {
    if (!this.$refs.editor) {
      return false
    }

    return this.$refs.editor.getProjectId().length > 0
  }

  canRunSymbolicExecution () {
    if (!this.$refs.editor) {
      return false
    }

    return this.$refs.editor.getProjectId().length > 0
  }

  async tryToUploadSource () {
    await this.uploadSource({
      name: this.$refs.editor.getProjectName(),
      source: this.$refs.editor.base64EncodedSource()
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

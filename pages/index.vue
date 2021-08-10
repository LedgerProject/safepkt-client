<template>
  <div class="homepage">
    <Header />
    <p>Static analysis of rust-based smart contracts</p>
    <Editor ref="editor" />
    <VerificationSteps />
    <ul>
      <li
        v-for="project in getAllProjects()"
        :key="project.id"
      >
        <div
          :data-project-id="project.id"
          v-text="project.id"
        />
      </li>
    </ul>
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
import EventBus from '~/modules/event-bus'
import VerificationEvents from '~/modules/events'
import { Project } from '~/types/project'

const Dashboard = namespace('dashboard')

@Component({
  components: { Editor, Head }
})
export default class Homepage extends Vue {
  logger = new SharedState.Logger()

  $refs!: {
    editor: Editor
  }

  @Dashboard.Action
  public uploadSource!: (source: string) => void

  @Dashboard.Getter
  public allProjects!: Project[]

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
    EventBus.$on(VerificationEvents.llvmBitcodeGenerationStarted, () => {
    })
    EventBus.$on(VerificationEvents.symbolicExecutionStarted, () => {
    })
  }

  async tryToUploadSource () {
    await this.uploadSource(
      this.$refs.editor.base64EncodedSource()
    )
  }

  getAllProjects () {
    return this.allProjects
  }
}
</script>

<style lang="scss">
@import "./index.scss";
</style>

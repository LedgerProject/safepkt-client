<template>
  <div class="homepage">
    <Header />
    <p>Static analysis of rust-based smart contracts</p>
    <Editor ref="editor" />
    <VerificationSteps />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

// - provides with logger
// - configures API host, scheme, port for current environment
import SharedState from '../modules/shared-state'
import Editor from '~/components/editor/editor.vue'
import Head from '~/components/header/header.vue'
import EventBus from '~/modules/event-bus'
import VerificationEvents from '~/modules/events'
import Config from '~/config'

@Component({
  components: { Editor, Head }
})
export default class Homepage extends Vue {
  logger = new SharedState.Logger()

  $refs!: {
    editor: Editor
  }

  destroyed () {
    EventBus.$off(VerificationEvents.sourceUploaded)
    EventBus.$off(VerificationEvents.llvmBitcodeGenerationStarted)
    EventBus.$off(VerificationEvents.symbolicExecutionStarted)
  }

  created () {
    EventBus.$off(VerificationEvents.sourceUploaded)
    EventBus.$off(VerificationEvents.llvmBitcodeGenerationStarted)
    EventBus.$off(VerificationEvents.symbolicExecutionStarted)

    EventBus.$on(VerificationEvents.sourceUploaded, this.uploadSource)
    EventBus.$on(VerificationEvents.llvmBitcodeGenerationStarted, () => {})
    EventBus.$on(VerificationEvents.symbolicExecutionStarted, () => {})
  }

  async uploadSource () {
    const baseUrl = Config.getBaseURL()
    const routes = Config.getRoutes()

    const method = `${routes.uploadSource.method}`
    const url = `${baseUrl}${routes.uploadSource.url}`

    const body = JSON.stringify({ source: this.$refs.editor.base64EncodedSource() })

    const response = await fetch(url, {
      method,
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body
    })

    return response.json()
  }
}
</script>

<style lang="scss">
@import "./index.scss";
</style>

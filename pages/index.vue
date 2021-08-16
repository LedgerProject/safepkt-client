<template>
  <div class="homepage">
    <Header />
    <Editor />
    <Report
      :title="reportTitle('llvmBitcodeGeneration')"
      :content="verificationStepReport('llvmBitcodeGeneration')"
    />
    <Report
      :title="reportTitle('symbolicExecution')"
      :content="verificationStepReport('symbolicExecution')"
    />
    <UploadedProjects v-show="showUploadedProjects" />
    <notifications position="bottom right" />
  </div>
</template>

<script lang="ts">
import { Component, mixins, namespace } from 'nuxt-property-decorator'

import Editor from '~/components/editor/editor.vue'
import Head from '~/components/header/header.vue'
import Report from '~/components/report/report.vue'
import UploadedProjects from '~/components/uploaded-projects/uploaded-projects.vue'
import EventBus from '~/modules/event-bus'
import VerificationEvents from '~/modules/events'
import UploadSourceMixin from '~/mixins/step/upload-source'
import SymbolicExecutionMixin from '~/mixins/step/symbolic-execution'

const ReportStore = namespace('report')
const VerificationStepsStore = namespace('verification-steps')

@Component({
  components: { Editor, Head, Report, UploadedProjects }
})
export default class Homepage extends mixins(
  UploadSourceMixin,
  SymbolicExecutionMixin
) {
  showUploadedProjects: boolean = false

  @ReportStore.Getter
  reportTitle!: string

  @VerificationStepsStore.Mutation
  lockResetButton!: () => void

  reset () {
    this.lockResetButton()

    this.resetVerificationRuntime()
    this.setProjectId({ projectId: '' })
    this.enableSourceUpload()

    this.startPollingLlvmBitcodeGenerationProgress()
    this.startPollingSymbolicExecutionProgress()
  }

  created () {
    this.reset()

    this.startPollingLlvmBitcodeGenerationProgress()
    this.startPollingSymbolicExecutionProgress()

    EventBus.$on(VerificationEvents.resetVerificationRuntime, this.reset)
    EventBus.$on(VerificationEvents.failedVerificationStep, this.reportError)
  }

  beforeDestroy () {
    if (this.pollingLlvmBitcodeGenerationProgress) {
      clearInterval(this.pollingLlvmBitcodeGenerationProgress)
    }
    if (this.pollingSymbolicExecutionProgress) {
      clearInterval(this.pollingSymbolicExecutionProgress)
    }
  }

  destroyed () {
    EventBus.$off(VerificationEvents.resetVerificationRuntime)
    EventBus.$off(VerificationEvents.failedVerificationStep)
  }
}
</script>

<style lang="scss">
@import "./index.scss";
</style>

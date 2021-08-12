<template>
  <div class="homepage">
    <Header />
    <Editor />
    <Report
      :content="verificationStepReport()"
      :title="reportTitle"
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
import LlvmBitcodeGenerationMixin from '~/mixins/step/llvm-bitcode-generation'
import SymbolicExecutionMixin from '~/mixins/step/symbolic-execution'

const ReportStore = namespace('report')
const VerificationStepsStore = namespace('verification-steps')

@Component({
  components: { Editor, Head, Report, UploadedProjects }
})
export default class Homepage extends mixins(
  UploadSourceMixin,
  LlvmBitcodeGenerationMixin,
  SymbolicExecutionMixin
) {
  showUploadedProjects: boolean = false

  @ReportStore.Getter
  reportTitle!: string

  @VerificationStepsStore.Mutation
  unlockResetButton!: () => void

  @VerificationStepsStore.Mutation
  lockResetButton!: () => void

  resetVerificationSteps () {
    this.lockResetButton()

    this.resetVerificationRuntime()
    this.setProjectId({ projectId: '' })
    this.enableSourceUpload()

    this.startPollingLlvmBitcodeGenerationProgress()
    this.startPollingLlvmBitcodeGenerationReport()
    this.startPollingSymbolicExecutionProgress()
    this.startPollingSymbolicExecutionReport()
  }

  created () {
    this.resetVerificationRuntime()

    this.startPollingLlvmBitcodeGenerationProgress()
    this.startPollingLlvmBitcodeGenerationReport()
    this.startPollingSymbolicExecutionProgress()
    this.startPollingSymbolicExecutionReport()

    EventBus.$on(VerificationEvents.resetVerificationRuntime, this.resetVerificationSteps)
    EventBus.$on(VerificationEvents.failedVerificationStep, this.unlockResetButton)
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

  destroyed () {
    EventBus.$off(VerificationEvents.resetVerificationRuntime)
    EventBus.$off(VerificationEvents.failedVerificationStep)
  }
}
</script>

<style lang="scss">
@import "./index.scss";
</style>

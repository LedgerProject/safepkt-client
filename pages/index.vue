<template>
  <div class="homepage">
    <Header />
    <p>Static analysis of rust-based smart contracts</p>
    <Editor />
    <VerificationSteps
      :can-upload-source="canUploadSource()"
      :can-generate-llvm-bitcode="canRunVerificationStep('llvmBitCodeGenerationStep')"
      :can-run-symbolic-execution="canRunSymbolicExecution()"
      :can-reset-verification-runtime="canResetVerificationRuntime()"
    />
    <Report
      :content="verificationStepReport()"
      :next-step-available="nextStepAvailable()"
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
import VerificationSteps from '~/components/verification-steps/verification-steps.vue'
import EventBus from '~/modules/event-bus'
import VerificationEvents from '~/modules/events'
import { VerificationStep } from '~/modules/verification-steps'
import UploadSourceMixin from '~/mixins/step/upload-source'
import LlvmBitcodeGenerationMixin from '~/mixins/step/llvm-bitcode-generation'
import SymbolicExecutionMixin from '~/mixins/step/symbolic-execution'

const ReportStore = namespace('report')

@Component({
  components: { Editor, Head, Report, UploadedProjects, VerificationSteps }
})
export default class Homepage extends mixins(
  UploadSourceMixin,
  LlvmBitcodeGenerationMixin,
  SymbolicExecutionMixin
) {
  unlockedResetButton: boolean = false

  showUploadedProjects: boolean = false

  @ReportStore.Getter
  reportTitle!: string

  canResetVerificationRuntime (): boolean {
    const noVerificationStepAvailable = !this.canUploadSource() &&
        !this.canRunVerificationStep(VerificationStep.llvmBitCodeGenerationStep) &&
        !this.canRunSymbolicExecution()

    if (noVerificationStepAvailable) {
      const project = this.projectById(this.projectId)

      const stepsHaveBeenCompleted = project.llvmBitcodeGenerationStepDone &&
          project.symbolicExecutionStepDone

      if (!stepsHaveBeenCompleted && this.unlockedResetButton) {
        return true
      }

      return stepsHaveBeenCompleted
    }

    return false
  }

  resetVerificationSteps () {
    this.unlockedResetButton = false

    this.resetVerificationRuntime()
    this.setProjectId({ projectId: '' })
    this.enableSourceUpload()

    this.startPollingLlvmBitcodeGenerationProgress()
    this.startPollingLlvmBitcodeGenerationReport()
    this.startPollingSymbolicExecutionProgress()
    this.startPollingSymbolicExecutionReport()
  }

  handleVerificationStepFailure () {
    this.unlockedResetButton = true
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

  destroyed () {
    EventBus.$off(VerificationEvents.sourceUploaded)
    EventBus.$off(VerificationEvents.llvmBitcodeGenerationStarted)
    EventBus.$off(VerificationEvents.symbolicExecutionStarted)
    EventBus.$off(VerificationEvents.resetVerificationRuntime)
    EventBus.$off(VerificationEvents.failedVerificationStep)
  }
}
</script>

<style lang="scss">
@import "./index.scss";
</style>

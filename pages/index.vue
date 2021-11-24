<template>
  <div class="app">
    <AppHeader />
    <div class="app__body">
      <VerificationSteps
        :enable-upload-source-button="canRunVerificationStep(steps.uploadSourceStep)"
        :enable-generate-llvm-bitcode-button="canRunVerificationStep(steps.llvmBitcodeGenerationStep)"
        :enable-run-symbolic-execution-button="canRunVerificationStep(steps.symbolicExecutionStep)"
        :enable-reset-verification-runtime-button="canResetVerificationRuntime"
      />
      <Editor />
      <Report
        :title="reportTitle('programVerification')"
        :title-icon="titleIcon('programVerification')"
        :content="verificationStepReport('programVerification')"
        :is-report-visible="isVerificationStepReportVisible('programVerification')"
        :toggle-report-visibility="verificationStepReportVisibilityToggler('programVerification')"
      />
      <History v-show="showHistory" />
      <notifications position="bottom right" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, mixins, namespace } from 'nuxt-property-decorator'
import AppHeader from '~/components/app-header/app-header.vue'
import Editor from '~/components/editor/editor.vue'
import History from '~/components/history/history.vue'
import Report from '~/components/report/report.vue'
import UploadSourceMixin from '~/mixins/step/upload-source'
import SourceRestorationMixin from '~/mixins/step/source-restoration'
import ProgramVerificationMixin from '~/mixins/step/program-verification'
import EventBus from '~/modules/event-bus'
import VerificationEvents, { AppEvents } from '~/modules/events'
import { UnexpectedStep, VerificationStep } from '~/modules/verification-steps'
import VerificationSteps from '~/components/verification-steps/verification-steps.vue'
import { VerificationStep as VerificationStepType } from '~/types/verification-steps'
import MetaMixin from '~/mixins/meta'

const VerificationRuntime = namespace('verification-runtime')

@Component({
  components: {
    AppHeader,
    Editor,
    History,
    Report,
    VerificationSteps
  }
})
export default class Homepage extends mixins(
  MetaMixin,
  ProgramVerificationMixin,
  UploadSourceMixin,
  SourceRestorationMixin
) {
  showHistory: boolean = false
  steps: VerificationStep = new VerificationStep()

  @VerificationRuntime.Action
  emptyHistory!: () => void

  beforeDestroy () {
    EventBus.$off(AppEvents.clearHistoryRequested)
    EventBus.$off(VerificationEvents.resetVerificationRuntime)
    EventBus.$off(VerificationEvents.failedVerificationStep)

    if (this.pollingProgramVerificationProgress) {
      clearInterval(this.pollingProgramVerificationProgress)
    }
    if (this.pollingSourceRestorationProgress) {
      clearInterval(this.pollingSourceRestorationProgress)
    }
  }

  created () {
    this.steps = new VerificationStep()

    EventBus.$off(AppEvents.clearHistoryRequested)
    EventBus.$off(AppEvents.sourceRestorationRequested)
    EventBus.$off(VerificationEvents.failedVerificationStep)
    EventBus.$off(VerificationEvents.resetVerificationRuntime)

    EventBus.$on(AppEvents.clearHistoryRequested, this.clearHistory)
    EventBus.$on(AppEvents.sourceRestorationRequested, this.tryToRestoreSource)
    EventBus.$on(VerificationEvents.failedVerificationStep, this.reportError)
    EventBus.$on(VerificationEvents.resetVerificationRuntime, this.reset)

    if (this.tryToRestorePreviouslyUploadedSource()) {
      EventBus.$emit(AppEvents.sourceRestorationRequested)

      return
    }

    EventBus.$emit(VerificationEvents.resetVerificationRuntime)
  }

  clearHistory () {
    EventBus.$emit(VerificationEvents.resetVerificationRuntime)
    this.emptyHistory()
  }

  goToHomepage () {
    this.$router.push({ name: 'homepage' })
  }

  tryToRestorePreviouslyUploadedSource () {
    return this.$route.name === 'source-restoration'
  }

  reset () {
    if (!this.tryToRestorePreviouslyUploadedSource()) {
      this.goToHomepage()
      this.resetVerificationRuntime()
    }

    this.startPollingProgramVerificationProgress()
    this.startPollingSourceRestorationProgress()
  }

  get titleIcon (): (step: VerificationStepType) => string {
    return (step: VerificationStepType) => {
      switch (true) {
        case step === VerificationStep.programVerificationStep:
          if (this.isVerificationStepReportVisible(step)) {
            return 'Hide program verification report'
          }

          return 'Show program verification report'

        case step === VerificationStep.sourceRestorationStep:
          if (this.isVerificationStepReportVisible(step)) {
            return 'Hide source restoration report'
          }

          return 'Show source restoration report'

        default:

          throw new UnexpectedStep()
      }
    }
  }
}
</script>

<style lang="scss">
@import "./index.scss";
</style>

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
        :title="reportTitle('llvmBitcodeGeneration')"
        :title-icon="titleIcon('llvmBitcodeGeneration')"
        :content="verificationStepReport('llvmBitcodeGeneration')"
        :is-report-visible="isVerificationStepReportVisible('llvmBitcodeGeneration')"
        :toggle-report-visibility="verificationStepReportVisibilityToggler('llvmBitcodeGeneration')"
      />
      <Report
        :title="reportTitle('symbolicExecution')"
        :title-icon="titleIcon('symbolicExecution')"
        :content="verificationStepReport('symbolicExecution')"
        :is-report-visible="isVerificationStepReportVisible('symbolicExecution')"
        :toggle-report-visibility="verificationStepReportVisibilityToggler('symbolicExecution')"
      >
        <SymbolicExecutionFlags
          v-if="isVerificationStepReportVisible('symbolicExecution')"
        />
      </Report>
      <UploadedProjects v-show="showUploadedProjects" />
      <notifications position="bottom right" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch, mixins, namespace } from 'nuxt-property-decorator'
import { Route } from 'vue-router/types/router'
import AppHeader from '~/components/app-header/app-header.vue'
import Editor from '~/components/editor/editor.vue'
import Report from '~/components/report/report.vue'
import UploadedProjects from '~/components/uploaded-projects/uploaded-projects.vue'
import SymbolicExecutionMixin from '~/mixins/step/symbolic-execution'
import UploadSourceMixin from '~/mixins/step/upload-source'
import EventBus from '~/modules/event-bus'
import VerificationEvents from '~/modules/events'
import { UnexpectedStep, VerificationStep } from '~/modules/verification-steps'
import SymbolicExecutionFlags from '~/components/symbolic-execution-flags/symbolic-execution-flags.vue'
import VerificationSteps from '~/components/verification-steps/verification-steps.vue'
import { VerificationStep as VerificationStepType } from '~/types/verification-steps'

const ReportStore = namespace('report')

@Component({
  components: {
    AppHeader,
    Editor,
    Report,
    SymbolicExecutionFlags,
    UploadedProjects,
    VerificationSteps
  }
})
export default class Homepage extends mixins(
  UploadSourceMixin,
  SymbolicExecutionMixin
) {
  meta: any
  showUploadedProjects: boolean = false
  steps: VerificationStep = new VerificationStep()

  @ReportStore.Getter
  reportTitle!: (step: VerificationStepType) => string

  @Watch('$route')
  onRouteChange (newRoute?: Route) {
    this.updateMeta(newRoute)
  }

  updateMeta (route?: Route) {
    if (!route || !route.name || ['index', 'homepage'].includes(route.name)) {
      this.meta = this.getMeta('Welcome!')
      return
    }

    const suffix = `for project having id: "${route.params.projectId}"`

    if (route.name === 'llvm-bitcode-generation') {
      this.meta = this.getMeta(`LLVM bitcode generation ${suffix}`)
      return
    }

    if (route.name === 'symbolic-execution') {
      this.meta = this.getMeta(`Symbolic execution ${suffix}`)
    }
  }

  created () {
    this.steps = new VerificationStep()
    this.reset()

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

  get getMeta (): (title: string) => any {
    return (title: string) => {
      const twitter_handle = '@pkt_cash'
      const description = 'Static analysis tools for rust-based smart contracts.'
      const titleSuffix = ' - SafePKT'
      const getTitle = (title: string) => `${title}${titleSuffix}`

      return {
        title: getTitle(title),
        htmlAttrs: {
          lang: 'en'
        },
        meta: [
          { charset: 'utf-8' },
          { name: 'viewport', content: 'width=device-width, initial-scale=1' },
          { hid: 'description', name: 'description', content: '' },
          { hid: 'author', name: 'author', content: twitter_handle },
          {
            hid: 'og:url',
            property: 'og:url',
            content: 'https://pkt.cash'
          },
          {
            hid: 'twitter:creator',
            name: 'twitter:creator',
            content: twitter_handle
          },
          {
            hid: 'twitter:title',
            name: 'twitter:title',
            content: getTitle(title)
          },
          {
            hid: 'twitter:description',
            name: 'twitter:description',
            content: description
          },
          { name: 'format-detection', content: 'telephone=no' }
        ],
        noscript: [
          {
            innerHTML:
                'SafePKT requires JavaScript to work as intended.'
          }
        ],
        link: [
          { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
        ]
      }
    }
  }

  head () {
    const route: Route = this.$route
    this.updateMeta(route)

    return this.meta
  }

  reset () {
    this.$router.push({ name: 'homepage' })

    this.resetVerificationRuntime()

    this.startPollingLlvmBitcodeGenerationProgress()
    this.startPollingSymbolicExecutionProgress()
  }

  get titleIcon (): (step: VerificationStepType) => string {
    return (step: VerificationStepType) => {
      switch (true) {
        case step === VerificationStep.llvmBitcodeGenerationStep:
          if (this.isVerificationStepReportVisible(step)) {
            return 'Hide LLVM bitcode generation report'
          }

          return 'Show LLVM bitcode generation report'

        case step === VerificationStep.symbolicExecutionStep:
          if (this.isVerificationStepReportVisible(step)) {
            return 'Hide symbolic execution report'
          }

          return 'Show symbolic execution report'

        default:

          throw new UnexpectedStep()
      }
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

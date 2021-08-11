<template>
  <div class="report">
    <h2 v-text="title" />
    <textarea
      v-model="content"
      :class="getReportClasses()"
      :disabled="!showReport()"
      class="report__content"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import { VerificationStep } from '~/types/verification-steps'
import { VerificationStep as Step } from '~/modules/verification-steps'

@Component
export default class Report extends Vue {
  @Prop({
    type: String,
    default: ''
  })
  content!: string

  @Prop({
    type: String,
    required: true
  })
  nextStepAvailable!: VerificationStep

  @Prop({
    type: String,
    required: true
  })
  title!: string

  getReportClasses () {
    return {
      'report__content--hidden': !this.showReport()
    }
  }

  showReport () {
    return this.nextStepAvailable !== Step.uploadSourceStep
  }
}
</script>

<style lang="scss">
@import './report.scss';
</style>

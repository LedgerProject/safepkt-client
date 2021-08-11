<template>
  <div class="report">
    <h2 v-text="title" />
    <textarea
      v-model="content"
      :class="getReportClasses()"
      :disabled="!isReportVisible"
      class="report__content"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, namespace } from 'nuxt-property-decorator'
import VerificationStepsMixin from '~/mixins/verification-steps'

const ReportStore = namespace('report')

@Component
export default class Report extends VerificationStepsMixin {
  @Prop({
    type: String,
    required: true
  })
  title!: string

  @Prop({
    type: String,
    default: ''
  })
  content!: string

  @ReportStore.Getter
  isReportVisible!: boolean

  getReportClasses () {
    return {
      'report__content--hidden': !this.isReportVisible
    }
  }
}
</script>

<style lang="scss">
@import './report.scss';
</style>

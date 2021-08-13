<template>
  <div :class="getReportClasses()">
    <h2 v-text="title" />
    <textarea
      ref="content"
      v-model="content"
      :disabled="!isReportVisible"
      class="report__content"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, namespace } from 'nuxt-property-decorator'
import VerificationStepsMixin from '~/mixins/verification-steps'

const ReportStore = namespace('report')

@Component
export default class Report extends VerificationStepsMixin {
  $refs!: {
    content: HTMLElement
  }

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

  @Watch('verificationStepReport', { immediate: true, deep: true })
  onContentUpdated () {
    const content = this.$refs.content
    if (typeof content === 'undefined') {
      return
    }

    content.scrollTop = content.scrollHeight + 2 * 8
  }

  getReportClasses () {
    return {
      report: true,
      'report--hidden': !this.isReportVisible
    }
  }
}
</script>

<style lang="scss">
@import './report.scss';
</style>

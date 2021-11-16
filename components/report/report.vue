<template>
  <div :class="getReportClasses()">
    <h2 class="report__title">
      {{ title }}
      <font-awesome-icon
        class="report__icon"
        :icon="icon"
        :title="titleIcon"
        @click="toggleVisibility"
      />
    </h2>
    <slot />
    <textarea
      v-if="isReportVisible"
      ref="content"
      v-model="content"
      class="report__content"
    />
    <h2 class="report__title">
      Thanks to our partners
    </h2>
    <div class="app__logo-wrapper">
      <img
        alt="Dyne.org logo - Blumorpho logo - NGI-LEDGER logo - Fundingbox logo -  European Commission logo"
        class="app__logo"
        :height="353"
        :src="source"
        :width="456"
      >
    </div>
    <h2 class="report__title">
      About the project
    </h2>
    <p>
      Learn more about this project funded by the European Commission,<br>
      via the NGI-LEDGER program and its partners (with Dyne.org, Blumorpho, FundingBox)
      by following this link: <a class="report__link" href="https://ledgerproject.github.io/home/#/teams/SafePKT">https://ledgerproject.github.io/home/#/teams/SafePKT</a>
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, mixins } from 'nuxt-property-decorator'
import SymbolicExecutionMixin from '~/mixins/step/symbolic-execution'
import allLogos from '~/assets/all-logos.png'

@Component
export default class Report extends mixins(SymbolicExecutionMixin) {
  $refs!: {
    content: HTMLElement
  }

  icon: string = 'eye-slash';

  @Prop({
    type: String,
    required: true
  })
  title!: string

  @Prop({
    type: String,
    required: true
  })
  titleIcon!: string

  @Prop({
    type: String,
    default: ''
  })
  content!: string

  @Prop({
    type: Boolean,
    required: true
  })
  isReportVisible!: boolean

  @Prop({
    type: Function,
    required: true
  })
  toggleReportVisibility!: () => void

  @Prop({
    type: String,
    default: allLogos
  })
  readonly source!: string;

  @Prop({
    type: Number,
    default: 75
  })
  readonly side!: number;

  @Watch('content', { deep: true, immediate: true })
  onContentUpdated () {
    const content = this.$refs.content
    if (typeof content === 'undefined') {
      return
    }

    content.scrollTop = content.scrollHeight + 2 * 8
  }

  @Watch('isReportVisible', { deep: true, immediate: true })
  onVisibilityUpdate (newVisibility: boolean) {
    if (newVisibility) {
      this.icon = 'eye-slash'

      return
    }

    this.icon = 'eye'
  }

  getReportClasses () {
    return { report: true }
  }

  toggleVisibility (): void {
    this.toggleReportVisibility()
  }
}
</script>

<style lang="scss">
@import './report.scss';
</style>

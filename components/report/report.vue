<template>
  <div class="report">
    <textarea
      v-model="content"
      class="report__content"
    />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'

@Component
export default class Report extends Vue {
  @Prop({
    type: String,
    required: true
  })
  content!: string
}
</script>

<style lang="scss">
@import './report.scss';
</style>

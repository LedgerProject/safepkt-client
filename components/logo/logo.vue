<template>
  <div>
    <img
      alt="PKT logo"
      class="logo__logo"
      :height="width"
      :src="source"
      :width="width"
    >
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
class Logo extends Vue {
  @Prop({
    type: String,
    required: true
  })
  readonly source!: string;

  @Prop({
    type: Number,
    default: 100
  })
  readonly height!: number;

  @Prop({
    type: Number,
    default: 100
  })
  readonly width!: number;
}

export default Logo
</script>

<style lang="scss" scoped>
@import './logo.scss';
</style>

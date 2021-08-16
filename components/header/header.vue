<template>
  <div class="header">
    <div class="header__row">
      <Logo :source="logo" />
      <h1 class="header__title">
        SafePKT
      </h1>
    </div>
    <p class="header__short-description">
      Static analysis of rust-based smart contracts
    </p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

import Logo from '~/components/logo/logo.vue'
import logo from '~/assets/pkt-logo.svg'

@Component({
  components: { Logo }
})
export default class Header extends Vue {
  logo: string = logo;
}
</script>

<style lang="scss">
@import "./header.scss";
</style>

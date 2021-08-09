<template>
  <div class="head">
    <Logo :source="logo" />
    <h1>SafePKT</h1>
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

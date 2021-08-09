<template>
  <div>
    <Logo />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import Logo from '../components/logo/logo.vue'

@Component({
  components: { Logo }
})
class Homepage extends Vue {}

export default Homepage
</script>

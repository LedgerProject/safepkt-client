<template>
  <div class="verification-steps">
    <button @click="uploadSource">
      Upload source code
    </button>
    <button @click="generateLLVMBitcode">
      Generate LLVM bitcode
    </button>
    <button @click="runSymbolicExecution">
      Run symbolic execution
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
import EventBus from '~/modules/event-bus'
import VerificationEvents from '~/modules/events'

@Component
export default class VerificationSteps extends Vue {
  uploadSource () {
    EventBus.$emit(VerificationEvents.sourceUploaded)
  }

  generateLLVMBitcode () {
    EventBus.$emit(VerificationEvents.llvmBitcodeGenerationStarted)
  }

  runSymbolicExecution () {
    EventBus.$emit(VerificationEvents.symbolicExecutionStarted)
  }
}
</script>

<style lang="scss">
@import "./verification-steps.scss";
</style>

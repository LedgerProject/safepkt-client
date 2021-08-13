<template>
  <div class="verification-steps">
    <button
      :class="uploadSourceButtonClasses()"
      :disabled="!enableUploadSourceButton"
      @click="tryToUploadSource"
    >
      Upload source code
    </button>
    <button
      :class="generateLlvmBitcodeButtonClasses()"
      :disabled="!enableGenerateLlvmBitcodeButton"
      @click="tryToGenerateLlvmBitcode"
    >
      Generate LLVM bitcode
    </button>
    <button
      :class="symbolicExecutionButtonClasses()"
      :disabled="!enableRunSymbolicExecutionButton"
      @click="tryToRunSymbolicExecution"
    >
      Run symbolic execution
    </button>
    <button
      :class="resetVerificationButtonClasses()"
      :disabled="!enableResetVerificationRuntimeButton"
      @click="resetRuntime"
    >
      ⚠️ Reset runtime
    </button>
  </div>
</template>

<script lang="ts">
import { Component, mixins, Prop } from 'nuxt-property-decorator'
import UploadSourceMixin from '~/mixins/step/upload-source'
import LlvmBitcodeGenerationMixin from '~/mixins/step/llvm-bitcode-generation'
import SymbolicExecutionMixin from '~/mixins/step/symbolic-execution'
import VerificationEvents from '~/modules/events'
import EventBus from '~/modules/event-bus'

@Component
export default class VerificationSteps extends mixins(
  UploadSourceMixin,
  LlvmBitcodeGenerationMixin,
  SymbolicExecutionMixin
) {
  @Prop({
    type: Boolean,
    required: true
  })
  enableUploadSourceButton!: boolean;

  @Prop({
    type: Boolean,
    required: true
  })
  enableGenerateLlvmBitcodeButton!: boolean;

  @Prop({
    type: Boolean,
    required: true
  })
  enableRunSymbolicExecutionButton!: boolean;

  @Prop({
    type: Boolean,
    required: true
  })
  enableResetVerificationRuntimeButton!: boolean;

  uploadSourceButtonClasses () {
    if (!this.enableUploadSourceButton) {
      return this.getDefaultDisabledButtonClass()
    }
  }

  generateLlvmBitcodeButtonClasses () {
    if (!this.enableGenerateLlvmBitcodeButton) {
      return this.getDefaultDisabledButtonClass()
    }
  }

  symbolicExecutionButtonClasses () {
    if (!this.enableRunSymbolicExecutionButton) {
      return this.getDefaultDisabledButtonClass()
    }
  }

  resetVerificationButtonClasses () {
    if (!this.enableResetVerificationRuntimeButton) {
      return this.getDefaultDisabledButtonClass()
    }
  }

  resetRuntime (): void {
    EventBus.$emit(VerificationEvents.resetVerificationRuntime)
  }

  getDefaultDisabledButtonClass () {
    return {
      'verification-steps__disabled': true
    }
  }
}
</script>

<style lang="scss">
@import "./verification-steps.scss";
</style>

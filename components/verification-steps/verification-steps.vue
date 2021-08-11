<template>
  <div class="verification-steps">
    <button
      :class="uploadSourceButtonClasses()"
      :disabled="!canUploadSource"
      @click="uploadSource"
    >
      Upload source code
    </button>
    <button
      :class="generateLlvmBitcodeButtonClasses()"
      :disabled="!canGenerateLlvmBitcode"
      @click="generateLlvmBitcode"
    >
      Generate LLVM bitcode
    </button>
    <button
      :class="symbolicExecutionButtonClasses()"
      :disabled="!canRunSymbolicExecution"
      @click="runSymbolicExecution"
    >
      Run symbolic execution
    </button>
    <button
      :class="resetVerificationButtonClasses()"
      :disabled="!canResetVerificationRuntime"
      @click="resetVerificationRuntime"
    >
      ⚠️ Reset runtime
    </button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import EventBus from '~/modules/event-bus'
import VerificationEvents from '~/modules/events'

@Component
export default class VerificationSteps extends Vue {
  @Prop({
    type: Boolean,
    default: true
  })
  canUploadSource!: boolean;

  @Prop({
    type: Boolean,
    default: false
  })
  canGenerateLlvmBitcode!: boolean;

  @Prop({
    type: Boolean,
    default: false
  })
  canRunSymbolicExecution!: boolean;

  @Prop({
    type: Boolean,
    default: false
  })
  canResetVerificationRuntime!: boolean;

  uploadSource () {
    EventBus.$emit(VerificationEvents.sourceUploaded)
  }

  generateLlvmBitcode () {
    EventBus.$emit(VerificationEvents.llvmBitcodeGenerationStarted)
  }

  runSymbolicExecution () {
    EventBus.$emit(VerificationEvents.symbolicExecutionStarted)
  }

  resetVerificationRuntime () {
    EventBus.$emit(VerificationEvents.resetVerificationRuntime)
  }

  uploadSourceButtonClasses () {
    if (!this.canUploadSource) {
      return this.getDefaultDisabledButtonClass()
    }
  }

  generateLlvmBitcodeButtonClasses () {
    if (!this.canGenerateLlvmBitcode) {
      return this.getDefaultDisabledButtonClass()
    }
  }

  symbolicExecutionButtonClasses () {
    if (!this.canRunSymbolicExecution) {
      return this.getDefaultDisabledButtonClass()
    }
  }

  resetVerificationButtonClasses () {
    if (!this.canResetVerificationRuntime) {
      return this.getDefaultDisabledButtonClass()
    }
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

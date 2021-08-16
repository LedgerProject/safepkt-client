<template>
  <div class="verification-steps">
    <div class="verification-steps__row">
      <label for="additional-flags">
        <span class="verification-steps__label">Additional flags passed to symbolic execution command:</span>
        <input
          id="additional-flags"
          class="verification-steps__flags"
          :disabled="!enableRunSymbolicExecutionButton"
          :value="flags"
          maxlength="200"
          type="text"
          @input="amendAdditionalFlags"
        >
      </label>
    </div>
    <div class="verification-steps__row verification-steps__row--wrapped">
      <label for="command-preview">
        <span class="verification-steps__label">Symbolic execution command preview:</span>
        <textarea
          id="command-preview"
          class="verification-steps__preview"
          disabled="disabled"
          maxlength="500"
          v-text="symbolicExecutionCommandPreview"
        />
      </label>
    </div>
    <!-- source upload and llvm bitcode generation
         have been combined -->
    <button
      :class="uploadSourceButtonClasses()"
      :disabled="!enableUploadSourceButton"
      @click="tryToUploadSource"
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
import SymbolicExecutionMixin from '~/mixins/step/symbolic-execution'
import VerificationEvents from '~/modules/events'
import EventBus from '~/modules/event-bus'

@Component
export default class VerificationSteps extends mixins(
  UploadSourceMixin,
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

  get symbolicExecutionCommandPreview (): string {
    return this.commandPreview(this.projectId)
  }

  uploadSourceButtonClasses () {
    if (!this.enableUploadSourceButton) {
      return this.getDefaultDisabledButtonClass()
    }
  }

  generateLlvmBitcodeButtonClasses () {
    return this.getDefaultDisabledButtonClass()
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

  amendAdditionalFlags ({ target }: {target: {value: string}}) {
    this.setAdditionalFlags(target.value)
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

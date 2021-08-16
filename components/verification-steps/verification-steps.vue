<template>
  <div :class="componentClasses">
    <div class="verification-steps__row-group">
      <div
        v-if="!showShortcuts"
        class="verification-steps__row"
      >
        <label for="additional-flags">
          <span class="verification-steps__label">Additional flags passed to symbolic execution command:</span>
          <input
            id="additional-flags"
            class="verification-steps__flags"
            :disabled="!enableRunSymbolicExecutionButton"
            :value="flags"
            maxlength="200"
            type="text"
            autocomplete="off"
            @input="amendAdditionalFlags"
          >
        </label>
      </div>
      <div
        v-if="!showShortcuts"
        class="verification-steps__row"
      >
        <label for="command-preview">
          <span class="verification-steps__label">Symbolic execution command preview:</span>
          <div
            id="command-preview"
            class="verification-steps__preview"
            v-text="symbolicExecutionCommandPreview"
          />
        </label>
      </div>
    </div>
    <!-- source upload and llvm bitcode generation
         have been combined -->
    <div class="verification-steps__row">
      <button
        :class="uploadSourceButtonClasses()"
        :disabled="!enableUploadSourceButton"
        @click="tryToUploadSource"
      >
        <span v-if="!showShortcuts">Generate LLVM Bitcode [IR]</span>
        <span v-else>[IR]</span>
      </button>
      <button
        :class="symbolicExecutionButtonClasses()"
        :disabled="!enableRunSymbolicExecutionButton"
        @click="tryToRunSymbolicExecution"
      >
        <span v-if="!showShortcuts">Run symbolic execution [λ]</span>
        <span v-else>[λ]</span>
      </button>
      <button
        :class="resetVerificationButtonClasses()"
        :disabled="!enableResetVerificationRuntimeButton"
        @click="resetRuntime"
      >
        <span v-if="!showShortcuts">⚠️ Reset runtime [R]</span>
        <span v-else>[R]</span>
      </button>
    </div>
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

  @Prop({
    type: Boolean,
    required: false
  })
  showShortcuts!: boolean;

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

  get componentClasses (): {[key: string]: boolean} {
    return {
      'verification-steps': true,
      'verification-steps--with-shortcuts': this.showShortcuts
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

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
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import EventBus from '~/modules/event-bus'
import VerificationEvents from '~/modules/events'
import { VerificationStep } from '~/types/verification-steps'
import { VerificationStepProgress as Progress } from '~/components/verification-steps/verification-steps-progress'
import { Project } from '~/types/project'

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

  uploadSource () {
    EventBus.$emit(VerificationEvents.sourceUploaded)
  }

  generateLlvmBitcode () {
    EventBus.$emit(VerificationEvents.llvmBitcodeGenerationStarted)
  }

  runSymbolicExecution () {
    EventBus.$emit(VerificationEvents.symbolicExecutionStarted)
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

  getDefaultDisabledButtonClass () {
    return {
      'verification-steps__disabled': true
    }
  }

  isVerificationStepProgressCompleted (project: Project, step: VerificationStep): boolean {
    return project[step].raw_status &&
    project[step].raw_status === Progress.completed
  }

  isVerificationStepSuccessful (project: Project, step: VerificationStep): boolean {
    return project[step].messages &&
    project[step].messages.includes('Wrote LLVM bitcode file')
  }
}
</script>

<style lang="scss">
@import "./verification-steps.scss";
</style>

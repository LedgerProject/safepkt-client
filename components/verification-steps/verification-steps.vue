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
import { VerificationStepPollingTarget } from '~/types/verification-steps'
import { PollingTarget, VerificationStepProgress as Progress } from '~/modules/verification-steps'
import { Project } from '~/types/project'

class UnexpectedStep extends Error {}

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

  isVerificationStepProgressCompleted (project: Project, pollingTarget: VerificationStepPollingTarget): boolean {
    return project[pollingTarget].raw_status &&
    project[pollingTarget].raw_status === Progress.completed
  }

  isVerificationStepSuccessful (project: Project, pollingTarget: VerificationStepPollingTarget): boolean {
    if (pollingTarget === PollingTarget.LLVMBitCodeGenerationStepReport) {
      return project[pollingTarget].messages &&
        project[pollingTarget].messages.includes('Wrote LLVM bitcode file')
    }

    if (pollingTarget === PollingTarget.SymbolicExecutionStepReport) {
      return project[pollingTarget].messages &&
        project[pollingTarget].messages.includes('KLEE: done: generated tests =')
    }

    throw new UnexpectedStep(`Sorry, pollingTarget ${pollingTarget} is unexpected.`)
  }
}
</script>

<style lang="scss">
@import "./verification-steps.scss";
</style>

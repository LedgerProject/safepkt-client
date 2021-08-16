<template>
  <div class="editor">
    <div class="editor__inputs">
      <div class="editor__row">
        <label for="project-name">
          <span class="editor__label">Project name:</span>
          <input
            id="project-name"
            :value="projectName"
            maxlength="30"
            class="editor__project-name"
            type="text"
            @input="amendProjectName"
          >
        </label>
      </div>
      <VerificationSteps
        :enable-upload-source-button="canRunVerificationStep(steps.uploadSourceStep)"
        :enable-generate-llvm-bitcode-button="canRunVerificationStep(steps.llvmBitcodeGenerationStep)"
        :enable-run-symbolic-execution-button="canRunVerificationStep(steps.symbolicExecutionStep)"
        :enable-reset-verification-runtime-button="canResetVerificationRuntime"
      />
    </div>
    <!-- See https://nuxtjs.org/docs/2.x/features/nuxt-components#the-client-only-component -->
    <client-only
      v-if="canRunVerificationStep(steps.uploadSourceStep)"
      placeholder="Loading..."
    >
      <h2 class="editor__title">
        Source to be analyzed
      </h2>
      <prism-editor
        :value="source"
        class="editor__inner-editor"
        :highlight="highlighter"
        line-numbers
        @input="setBase64EncodedSource"
      />
    </client-only>
    <input v-model="projectId" type="hidden">
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'

import { PrismEditor } from 'vue-prism-editor'
import 'vue-prism-editor/dist/prismeditor.min.css' // import the styles somewhere

import { highlight, languages } from 'prismjs/components/prism-core'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-rust'
import 'prismjs/themes/prism-okaidia.css'
import { VerificationStep } from '~/modules/verification-steps'
import VerificationSteps from '~/components/verification-steps/verification-steps.vue'
import UploadSourceMixin from '~/mixins/step/upload-source'
import SymbolicExecutionMixin from '~/mixins/step/symbolic-execution'

@Component({
  components: { PrismEditor, VerificationSteps }
})
export default class Editor extends mixins(
  UploadSourceMixin,
  SymbolicExecutionMixin
) {
  steps: VerificationStep = new VerificationStep()

  created () {
    this.steps = new VerificationStep()
  }

  highlighter (source: string) {
    return highlight(source, languages.rust)
  }

  get source (): string {
    return atob(this.base64EncodedSource)
  }

  amendProjectName ({ target }: {target: {value: string}}) {
    this.setProjectName(target.value)
  }
}
</script>

<style lang="scss">
@import './editor.scss';
</style>

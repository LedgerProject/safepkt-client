<template>
  <div class="editor">
    <div class="editor__inputs">
      <label for="project_name">
        Project name:
        <input
          id="project_name"
          :value="projectName"
          maxlength="30"
          class="editor__project-name"
          type="text"
          @input="amendProjectName"
        >
      </label>
      <VerificationSteps
        :enable-upload-source-button="canRunVerificationStep('uploadSourceStep')"
        :enable-generate-llvm-bitcode-button="canRunVerificationStep('llvmBitcodeGenerationStep')"
        :enable-run-symbolic-execution-button="canRunVerificationStep('symbolicExecutionStep')"
        :enable-reset-verification-runtime-button="canResetVerificationRuntime"
      />
    </div>
    <prism-editor
      :value="source"
      class="editor__inner-editor"
      :highlight="highlighter"
      line-numbers
      @input="setBase64EncodedSource"
    />
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
import VerificationSteps from '~/components/verification-steps/verification-steps.vue'
import UploadSourceMixin from '~/mixins/step/upload-source'
import LlvmBitcodeGenerationMixin from '~/mixins/step/llvm-bitcode-generation'
import SymbolicExecutionMixin from '~/mixins/step/symbolic-execution'

@Component({
  components: { PrismEditor, VerificationSteps }
})
export default class Editor extends mixins(
  UploadSourceMixin,
  LlvmBitcodeGenerationMixin,
  SymbolicExecutionMixin
) {
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

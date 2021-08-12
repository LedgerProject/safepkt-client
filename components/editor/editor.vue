<template>
  <div class="editor">
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
import { Component } from 'nuxt-property-decorator'

import { PrismEditor } from 'vue-prism-editor'
import 'vue-prism-editor/dist/prismeditor.min.css' // import the styles somewhere

import { highlight, languages } from 'prismjs/components/prism-core'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-rust'
import 'prismjs/themes/prism-okaidia.css'
import ProjectMixin from '~/mixins/project'

@Component({
  components: { PrismEditor }
})
export default class Editor extends ProjectMixin {
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

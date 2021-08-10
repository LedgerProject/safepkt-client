<template>
  <div class="editor">
    <label for="project_name">
      Project name:
      <input
        id="project_name"
        v-model="projectName"
        maxlength="30"
        class="editor__project-name"
        type="text"
      >
    </label>
    <prism-editor v-model="source" class="editor__inner-editor" :highlight="highlighter" line-numbers />
    <input v-model="projectId" type="hidden">
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

import { PrismEditor } from 'vue-prism-editor'
import 'vue-prism-editor/dist/prismeditor.min.css' // import the styles somewhere

import { highlight, languages } from 'prismjs/components/prism-core'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-rust'
import 'prismjs/themes/prism-okaidia.css'
import EventBus from '~/modules/event-bus'
import { EditorEvents } from '~/modules/events'

const defaultSourceSnippet = `use verification_annotations::prelude::*;

fn main() {
    let a = u32::abstract_value();
    let b = u32::abstract_value();
    verifier::assume(1 <= a && a <= 1000);
    verifier::assume(1 <= b && b <= 1000);
    if verifier::is_replay() {
        eprintln!("Test values: a = {}, b = {}", a, b);
    }
    let r = a * b;
    verifier::assert!(1 <= r && r <= 1000000);
}
`

@Component({
  components: { PrismEditor }
})
export default class Editor extends Vue {
  source: string = defaultSourceSnippet
  projectName: string = 'KLEE :: multiplication demo '
  projectId: string = ''

  created () {
    EventBus.$off(EditorEvents.projectIdentified)
    EventBus.$on(EditorEvents.projectIdentified, this.setProjectId)
  }

  destroyed () {
    EventBus.$off(EditorEvents.projectIdentified)
  }

  highlighter (source: string) {
    return highlight(source, languages.rust)
  }

  getProjectName (): string {
    return this.projectName
  }

  getProjectId (): string {
    return this.projectId
  }

  base64EncodedSource (): string {
    return btoa(this.source)
  }

  setProjectId ({ projectId }: {projectId: string}): void {
    this.projectId = projectId
  }
}
</script>

<style lang="scss" scoped>
@import './editor.scss';
</style>

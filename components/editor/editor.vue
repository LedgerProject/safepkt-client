<template>
  <div class="editor">
    <prism-editor v-model="source" class="editor__inner-editor" :highlight="highlighter" line-numbers />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

import { PrismEditor } from 'vue-prism-editor'
import 'vue-prism-editor/dist/prismeditor.min.css' // import the styles somewhere

import { highlight, languages } from 'prismjs/components/prism-core'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-rust'
import 'prismjs/themes/prism-tomorrow.css'

const defaultSourceSnippet = `
use verification_annotations::prelude::*;

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
class Editor extends Vue {
  source: string = defaultSourceSnippet

  highlighter (source: string) {
    return highlight(source, languages.rust)
  }

  base64EncodedSource (): string {
    return btoa(this.source)
  }
}

export default Editor
</script>

<style lang="scss" scoped>
@import './editor.scss';
</style>

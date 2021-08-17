import { Module, Mutation, VuexModule } from 'vuex-module-decorators'

@Module({
  name: 'editor',
  stateFactory: true,
  namespaced: true
})
export default class EditorStore extends VuexModule {
  editor: {
    projectId: string,
    projectName: string,
    base64EncodedSource: string
  } = {
    projectId: '',
    projectName: 'Multiplication',
    base64EncodedSource: btoa(`use verification_annotations::prelude::*;

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
`)
  }

  @Mutation
  setBase64EncodedSource (source: string): void {
    this.editor = { ...this.editor, base64EncodedSource: btoa(source) }
  }

  @Mutation
  setProjectId ({ projectId }: {projectId: string}): void {
    this.editor = { ...this.editor, projectId }
  }

  @Mutation
  setProjectName (projectName: string): void {
    this.editor = { ...this.editor, projectName }
  }

  get projectId (): string {
    return this.editor.projectId
  }

  get projectName (): string {
    return this.editor.projectName
  }

  get base64EncodedSource (): string {
    return this.editor.base64EncodedSource
  }

  get isProjectIdValid () : () => boolean {
    return (): boolean => {
      return this.editor.projectId.length > 0
    }
  }
}

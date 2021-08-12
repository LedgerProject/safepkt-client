import { Component, namespace } from 'nuxt-property-decorator'
import { Project } from '~/types/project'
import ProjectMixin from '~/mixins/project'

const VerificationRuntimeStore = namespace('verification-runtime')

@Component
class VerificationRuntimeMixin extends ProjectMixin {
  @VerificationRuntimeStore.Action
  public resetVerificationRuntime!: () => void

  @VerificationRuntimeStore.Getter
  public projectByIdGetter!: (projectId: string) => Project|undefined;

  @VerificationRuntimeStore.Getter
  public projectById!: (projectId: string) => Project;
}

export default VerificationRuntimeMixin

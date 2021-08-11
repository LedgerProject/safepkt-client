import { Component, namespace } from 'nuxt-property-decorator'
import { Project } from '~/types/project'
import ProjectMixin from '~/mixins/project'

const VerificationRuntimeStore = namespace('verification-runtime')

@Component
class VerificationRuntimeMixin extends ProjectMixin {
  @VerificationRuntimeStore.Action
  public uploadSource!: ({ name, source, onSuccess }: {name: string, source: string, onSuccess: () => void}) => void

  @VerificationRuntimeStore.Action
  public pollLlvmBitcodeGenerationProgress!: (project: Project) => void

  @VerificationRuntimeStore.Action
  public pollLlvmBitcodeGenerationReport!: (project: Project) => void

  @VerificationRuntimeStore.Action
  public runSymbolicExecution!: (project : Project) => void

  @VerificationRuntimeStore.Action
  public pollSymbolicExecutionProgress!: (project: Project) => void

  @VerificationRuntimeStore.Action
  public pollSymbolicExecutionReport!: (project: Project) => void

  @VerificationRuntimeStore.Action
  public resetVerificationRuntime!: () => void

  @VerificationRuntimeStore.Getter
  public canRunLlvmBitcodeGenerationStep!: () => boolean;

  @VerificationRuntimeStore.Getter
  public projectByIdGetter!: (projectId: string) => Project|undefined;

  @VerificationRuntimeStore.Getter
  public projectById!: (projectId: string) => Project;
}

export default VerificationRuntimeMixin

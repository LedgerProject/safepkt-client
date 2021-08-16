import { Component, Vue, namespace } from 'nuxt-property-decorator'

// - provides with logger
// - configures API host, scheme, port for current environment
import SharedState from '../modules/shared-state'

const Editor = namespace('editor')

class ProjectNotFound extends Error {}

export { ProjectNotFound }

@Component
class ProjectMixin extends Vue {
  logger = new SharedState.Logger()

  @Editor.Getter
  projectId!: string

  @Editor.Getter
  projectName!: string

  @Editor.Getter
  commandPreview!: string

  @Editor.Getter
  flags!: string

  @Editor.Getter
  base64EncodedSource!: string

  @Editor.Mutation
  setProjectId!: ({ projectId }: {projectId: string}) => void

  @Editor.Mutation
  setProjectName!: (projectName: string) => void

  @Editor.Mutation
  setAdditionalFlags!: (flags: string) => void

  @Editor.Mutation
  setBase64EncodedSource!: (source: string) => void

  @Editor.Getter
  isProjectIdValid!: () => boolean
}

export default ProjectMixin

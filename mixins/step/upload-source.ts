import { Component, mixins, namespace } from 'nuxt-property-decorator'
import VerificationStepsMixin from '~/mixins/verification-steps'

const UploadSourceStore = namespace('step/upload-source')

@Component
class UploadSourceMixin extends mixins(VerificationStepsMixin) {
  @UploadSourceStore.Getter
  public canUploadSource!: () => boolean

  @UploadSourceStore.Mutation
  public enableSourceUpload!: () => void

  @UploadSourceStore.Action
  public uploadSource!: ({ name, source }: {name: string, source: string }) => void

  async tryToUploadSource () {
    this.setProjectId({ projectId: '' })

    await this.uploadSource({
      name: this.projectName,
      source: this.base64EncodedSource
    })
  }
}

export default UploadSourceMixin

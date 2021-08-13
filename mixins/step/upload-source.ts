import { Component, mixins, namespace } from 'nuxt-property-decorator'
import LlvmBitcodeGenerationMixin from '~/mixins/step/llvm-bitcode-generation'

const UploadSourceStore = namespace('step/upload-source')

@Component
class UploadSourceMixin extends mixins(LlvmBitcodeGenerationMixin) {
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
    await this.tryToGenerateLlvmBitcode()
  }
}

export default UploadSourceMixin

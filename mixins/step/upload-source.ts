import { Component, mixins } from 'nuxt-property-decorator'
import VerificationStepsMixin from '~/mixins/verification-steps'

@Component
class UploadSourceMixin extends mixins(VerificationStepsMixin) {
  enabledSourceUpload: boolean = true

  public canUploadSource (): boolean {
    return this.enabledSourceUpload
  }

  enableSourceUpload (): void {
    this.enabledSourceUpload = true
  }

  disableSourceUpload (): void {
    this.enabledSourceUpload = false
  }

  async tryToUploadSource () {
    this.setProjectId({ projectId: '' })

    await this.uploadSource({
      name: this.projectName,
      source: this.base64EncodedSource,
      onSuccess: this.disableSourceUpload
    })
  }
}

export default UploadSourceMixin

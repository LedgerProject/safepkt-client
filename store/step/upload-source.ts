import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import Vue from 'vue'
import { HttpMethod } from '~/config'
import { Project } from '~/types/project'
import { VerificationStep } from '~/modules/verification-steps'

@Module({
  name: 'upload-source',
  stateFactory: true,
  namespaced: true
})
class UploadSourceStore extends VuexModule {
    step: {
      enabledSourceUpload: boolean
    } = {
      enabledSourceUpload: true
    }

    public get canUploadSource (): () => boolean {
      return () => this.step.enabledSourceUpload
    }

    @Mutation
    enableSourceUpload (): void {
      this.step = {
        ...{ enabledSourceUpload: true }
      }
    }

    @Mutation
    disableSourceUpload (): void {
      this.step = {
        ...{ enabledSourceUpload: false }
      }
    }

    @Action
    public async uploadSource ({ name, source }: {name: string, source: string }) {
      const { baseUrl, routes } = this.context.rootGetters['verification-runtime/routingParams']

      const url = `${baseUrl}${routes.uploadSource.url}`
      const method: HttpMethod = routes.uploadSource.method
      const body: BodyInit = JSON.stringify({ source })

      try {
        const response = await fetch(url, this.context.rootGetters['verification-runtime/getFetchRequestInit'](method, body))
        const json = await response.json()

        if (
          typeof json.project_id === 'undefined' ||
                !json.project_id
        ) {
          Vue.notify({
            title: 'Warning',
            text: 'Sorry, the source upload has failed.',
            type: 'warn'
          })

          return
        }

        Vue.notify({
          title: 'Success',
          text: `The source was successfully uploaded under project id ${json.project_id}.`,
          type: 'success'
        })

        this.context.commit(
          'editor/setProjectId',
          { projectId: json.project_id },
          { root: true }
        )

        const project: Project = {
          id: json.project_id,
          name,
          source,
          llvmBitcodeGenerationStepStarted: false,
          llvmBitcodeGenerationStepReport: {},
          llvmBitcodeGenerationStepProgress: {},
          llvmBitcodeGenerationStepDone: false,
          symbolicExecutionStepStarted: false,
          symbolicExecutionStepReport: {},
          symbolicExecutionStepProgress: {},
          symbolicExecutionStepDone: false
        }

        this.context.commit(
          'verification-runtime/addProject',
          project,
          { root: true }
        )
        this.context.commit(
          'verification-steps/setVerificationStep',
          VerificationStep.llvmBitcodeGenerationStep,
          { root: true }
        )
        this.context.commit(
          'disableSourceUpload'
        )
      } catch (e) {
        this.context.commit(
          'verification-runtime/pushError',
          { error: e },
          { root: true }
        )

        Vue.notify({
          title: 'Oops',
          text: 'Sorry, something went wrong when trying to upload some source code.',
          type: 'error'
        })
      }
    }
}

export default UploadSourceStore

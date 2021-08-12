import { Action, Module, VuexModule } from 'vuex-module-decorators'
import Vue from 'vue'
import {
  editorStore,
  verificationRuntimeStore
} from '~/store'
import { Project } from '~/types/project'
import { HttpMethod } from '~/config'
import { VerificationStep as VerificationStepMod, VerificationStepProgress } from '~/modules/verification-steps'
import EventBus from '~/modules/event-bus'
import VerificationEvents from '~/modules/events'

@Module({
  name: 'llvm-bitcode-generation',
  stateFactory: true,
  namespaced: true
})
class LlvmBitcodeGenerationStore extends VuexModule {
  @Action
  public async generateLlvmBitcode (project: Project) {
    const { baseUrl, routes } = verificationRuntimeStore.routingParams

    const url = `${baseUrl}${routes.startLLVMBitcodeGeneration.url}`
      .replace('{{ projectId }}', project.id)
    const method: HttpMethod = routes.startLLVMBitcodeGeneration.method

    try {
      const response = await fetch(url, verificationRuntimeStore.getFetchRequestInit(method, null))
      const json = await response.json()

      if (
        typeof json.message === 'undefined' ||
          typeof json.error !== 'undefined'
      ) {
        Vue.notify({
          title: 'Warning',
          text: `Sorry, the LLVM bitcode generation has failed for project having id ${project.id}.`,
          type: 'warn'
        })

        return
      }

      Vue.notify({
        title: 'Success',
        text: [
          `LLVM bitcode generation has been successfully triggered for project having id ${project.id}:`,
          json.message
        ].join('\n'),
        type: 'success'
      })

      const projectState: Project = {
        ...project,
        llvmBitcodeGenerationStepStarted: true
      }

      this.context.commit(
        'verification-runtime/addProject',
        projectState,
        { root: true }
      )
    } catch (e) {
      Vue.notify({
        title: 'Oops',
        text: 'Sorry, something went wrong when trying to generate LLVM bitcode.',
        type: 'error'
      })
    }
  }

  @Action
  public async pollLlvmBitcodeGenerationProgress (project: Project) {
    const { baseUrl, routes } = verificationRuntimeStore.routingParams

    const url = `${baseUrl}${routes.getLLVMBitcodeGenerationProgress.url}`
      .replace('{{ projectId }}', project.id)
    const method: HttpMethod = routes.getLLVMBitcodeGenerationProgress.method

    try {
      const response = await fetch(url, verificationRuntimeStore.getFetchRequestInit(method, null))
      const json = await response.json()

      if (
        typeof json.message === 'undefined' ||
          typeof json.error !== 'undefined'
      ) {
        return
      }

      const llvmBitcodeGenerationStepDone = json.raw_status === VerificationStepProgress.completed

      const projectState: Project = {
        ...project,
        llvmBitcodeGenerationStepProgress: json,
        llvmBitcodeGenerationStepDone
      }

      if (llvmBitcodeGenerationStepDone) {
        this.context.commit(
          'verification-steps/setVerificationStep',
          VerificationStepMod.symbolicExecutionStep,
          { root: true }
        )
      }

      this.context.commit(
        'verification-runtime/addProject',
        projectState,
        { root: true }
      )
    } catch (e) {
      Vue.notify({
        title: 'Oops',
        text: 'Sorry, something went wrong when trying to poll the LLVM bitcode generation progress.',
        type: 'error'
      })
    }
  }

  @Action
  public async pollLlvmBitcodeGenerationReport (project: Project) {
    const { baseUrl, routes } = verificationRuntimeStore.routingParams

    const url = `${baseUrl}${routes.getLLVMBitcodeGenerationReport.url}`
      .replace('{{ projectId }}', project.id)
    const method: HttpMethod = routes.getLLVMBitcodeGenerationReport.method

    try {
      const response = await fetch(url, verificationRuntimeStore.getFetchRequestInit(method, null))
      const json = await response.json()

      if (
        typeof json.messages === 'undefined' ||
          typeof json.error !== 'undefined'
      ) {
        return
      }

      const projectState: Project = {
        ...project,
        llvmBitcodeGenerationStepReport: json
      }

      this.context.commit(
        'verification-runtime/addProject',
        projectState,
        { root: true }
      )

      if (json.messages.includes('FAILED:')) {
        EventBus.$emit(VerificationEvents.failedVerificationStep)
      }
    } catch (e) {
      Vue.notify({
        title: 'Oops',
        text: 'Sorry, something went wrong when trying to poll the LLVM bitcode generation report.',
        type: 'error'
      })
    }
  }

  public get canRunLlvmBitcodeGenerationStep (): () => boolean {
    return () => {
      if (typeof editorStore === 'undefined') {
        return false
      }

      if (!editorStore.isProjectIdValid()) {
        return false
      }

      try {
        const project = verificationRuntimeStore.projectById(editorStore.projectId)
        return this.canGenerateLlvmBitcodeForProject({
          project
        })
      } catch (e) {
        return false
      }
    }
  }

  get canGenerateLlvmBitcodeForProject (): ({ project }: {project: Project}) => boolean {
    return ({ project }: {project: Project}) => !project.llvmBitcodeGenerationStepStarted
  }
}

export default LlvmBitcodeGenerationStore

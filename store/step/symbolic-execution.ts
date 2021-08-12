import { Action, Module, VuexModule } from 'vuex-module-decorators'
import Vue from 'vue'
import { VerificationStepPollingTarget } from '~/types/verification-steps'
import { PollingTarget, VerificationStepProgress } from '~/modules/verification-steps'
import {
  editorStore,
  verificationStepsStore,
  verificationRuntimeStore
} from '~/store'
import { Project } from '~/types/project'
import { HttpMethod, Routes } from '~/config'

@Module({
  name: 'symbolic-execution',
  stateFactory: true,
  namespaced: true
})
class SymbolicExecutionStore extends VuexModule {
  get canRunSymbolicExecutionStep (): () => boolean {
    return () => {
      if (typeof editorStore !== 'undefined' && !editorStore.isProjectIdValid()) {
        return false
      }

      const project = verificationRuntimeStore.projectById(editorStore.projectId)

      const pollingTarget: VerificationStepPollingTarget = PollingTarget.LLVMBitCodeGenerationStepReport

      return project.llvmBitcodeGenerationStepDone &&
          verificationStepsStore.isVerificationStepSuccessful(project, pollingTarget) &&
          // No symbolic execution has started
          !project.symbolicExecutionStepStarted
    }
  }

  @Action
  public async runSymbolicExecution (project: Project) {
    const { baseUrl, routes }: { baseUrl: string, routes: Routes } = verificationRuntimeStore.routingParams

    const url = `${baseUrl}${routes.startSymbolicExecution.url}`
      .replace('{{ projectId }}', project.id)
    const method: HttpMethod = routes.startSymbolicExecution.method

    try {
      const response = await fetch(url, verificationRuntimeStore.getFetchRequestInit(method, null))
      const json = await response.json()

      if (
        typeof json.message === 'undefined' ||
          !json.message
      ) {
        Vue.notify({
          title: 'Warning',
          text: `Sorry, the symbolic execution has failed for project having id ${project.id}.`,
          type: 'warn'
        })

        return
      }

      Vue.notify({
        title: 'Success',
        text: [
          `Symbolic execution has been successfully triggered for project having id ${project.id}.`,
          json.message
        ].join('\n'),
        type: 'success'
      })

      const projectState: Project = {
        ...project,
        symbolicExecutionStepStarted: true
      }

      this.context.commit(
        'verification-runtime/addProject',
        projectState,
        { root: true }
      )
    } catch (e) {
      Vue.notify({
        title: 'Oops',
        text: 'Sorry, something went wrong when trying to run the symbolic execution.',
        type: 'error'
      })
    }
  }

  @Action
  public async pollSymbolicExecutionProgress (project: Project) {
    const { baseUrl, routes } = verificationRuntimeStore.routingParams

    const url = `${baseUrl}${routes.getSymbolicExecutionProgress.url}`
      .replace('{{ projectId }}', project.id)
    const method: HttpMethod = routes.getSymbolicExecutionProgress.method

    try {
      const response = await fetch(url, verificationRuntimeStore.getFetchRequestInit(method, null))
      const json = await response.json()

      if (
        typeof json.message === 'undefined' ||
          typeof json.error !== 'undefined'
      ) {
        return
      }

      const symbolicExecutionStepDone = json.raw_status === VerificationStepProgress.completed

      const projectState: Project = {
        ...project,
        symbolicExecutionStepProgress: json,
        symbolicExecutionStepDone
      }

      this.context.commit(
        'verification-runtime/addProject',
        projectState,
        { root: true }
      )
    } catch (e) {
      Vue.notify({
        title: 'Oops',
        text: 'Sorry, something went wrong when trying to poll the symbolic execution progress.',
        type: 'error'
      })
    }
  }

  @Action
  public async pollSymbolicExecutionReport (project: Project) {
    const { baseUrl, routes } = verificationRuntimeStore.routingParams

    const url = `${baseUrl}${routes.getSymbolicExecutionReport.url}`
      .replace('{{ projectId }}', project.id)
    const method: HttpMethod = routes.getSymbolicExecutionReport.method

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
        symbolicExecutionStepReport: json
      }

      this.context.commit(
        'verification-runtime/addProject',
        projectState,
        { root: true }
      )
    } catch (e) {
      Vue.notify({
        title: 'Oops',
        text: 'Sorry, something went wrong when trying to poll the symbolic execution report.',
        type: 'error'
      })
    }
  }
}

export default SymbolicExecutionStore

import { Action, Module, VuexModule } from 'vuex-module-decorators'
import Vue from 'vue'
import { VerificationStepPollingTarget } from '~/types/verification-steps'
import { PollingTarget, VerificationStepProgress } from '~/modules/verification-steps'
import { Project } from '~/types/project'
import { HttpMethod, Routes } from '~/config'
import { ProjectNotFound } from '~/mixins/project'
import EventBus from '~/modules/event-bus'
import VerificationEvents from '~/modules/events'

@Module({
  name: 'symbolic-execution',
  stateFactory: true,
  namespaced: true
})
class SymbolicExecutionStore extends VuexModule {
  public get canRunSymbolicExecutionStep (): () => boolean {
    return () => {
      let project: Project

      if (!this.context.rootGetters['editor/isProjectIdValid']()) {
        return false
      }

      try {
        const projectId = this.context.rootGetters['editor/projectId']
        project = this.context.rootGetters['verification-runtime/projectById'](projectId)
        const pollingTarget: VerificationStepPollingTarget = PollingTarget.LLVMBitcodeGenerationStepReport

        return project.llvmBitcodeGenerationStepDone &&
            this.context.rootGetters['verification-steps/isVerificationStepSuccessful'](project, pollingTarget) &&
            !project.symbolicExecutionStepStarted // No symbolic execution has started
      } catch (e) {
        if (!(e instanceof ProjectNotFound)) {
          EventBus.$emit(VerificationEvents.failedVerificationStep, { error: e })
        }

        return false
      }
    }
  }

  @Action
  public async runSymbolicExecution ({ project, flags }: {project: Project, flags: string}) {
    const { baseUrl, routes }: { baseUrl: string, routes: Routes } = this.context.rootGetters['verification-runtime/routingParams']

    const url = `${baseUrl}${routes.startSymbolicExecution.url}`
      .replace('{{ projectId }}', project.id)
    const method: HttpMethod = routes.startSymbolicExecution.method
    const body: BodyInit = JSON.stringify({ flags })

    try {
      const response = await fetch(url, this.context.rootGetters['verification-runtime/getFetchRequestInit'](method, body))
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
    const { baseUrl, routes } = this.context.rootGetters['verification-runtime/routingParams']

    const url = `${baseUrl}${routes.getSymbolicExecutionProgress.url}`
      .replace('{{ projectId }}', project.id)
    const method: HttpMethod = routes.getSymbolicExecutionProgress.method

    try {
      const response = await fetch(url, this.context.rootGetters['verification-runtime/getFetchRequestInit'](method, null))
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

      if (symbolicExecutionStepDone) {
        await this.context.dispatch('pollSymbolicExecutionReport', project)
        projectState.symbolicExecutionStepReport = this.context.rootGetters['verification-runtime/projectById'](project.id).symbolicExecutionStepReport
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
      if (!(e instanceof ProjectNotFound)) {
        this.context.commit(
          'verification-runtime/pushError',
          { error: e },
          { root: true }
        )
      }
    }
  }

  @Action
  public async pollSymbolicExecutionReport (project: Project) {
    const { baseUrl, routes } = this.context.rootGetters['verification-runtime/routingParams']

    const url = `${baseUrl}${routes.getSymbolicExecutionReport.url}`
      .replace('{{ projectId }}', project.id)
    const method: HttpMethod = routes.getSymbolicExecutionReport.method

    try {
      const response = await fetch(url, this.context.rootGetters['verification-runtime/getFetchRequestInit'](method, null))
      const json = await response.json()

      if (
        typeof json.messages === 'undefined' ||
          typeof json.error !== 'undefined'
      ) {
        return
      }

      const currentReport = this.context.rootGetters['verification-runtime/projectById'](project.id).symbolicExecutionStepReport
      if (!currentReport.messages || json.messages.trim() !== currentReport.messages.trim()) {
        const projectState: Project = {
          ...project,
          symbolicExecutionStepReport: json
        }

        this.context.commit(
          'verification-runtime/addProject',
          projectState,
          { root: true }
        )
      }
    } catch (e) {
      Vue.notify({
        title: 'Oops',
        text: 'Sorry, something went wrong when trying to poll the symbolic execution report.',
        type: 'error'
      })
      if (!(e instanceof ProjectNotFound)) {
        this.context.commit(
          'verification-runtime/pushError',
          { error: e },
          { root: true }
        )
      }
    }
  }
}

export default SymbolicExecutionStore

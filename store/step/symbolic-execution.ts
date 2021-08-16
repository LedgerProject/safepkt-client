import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import Vue from 'vue'
import { VerificationStepProgress } from '~/modules/verification-steps'
import { Project } from '~/types/project'
import { HttpMethod, Routes } from '~/config'
import { ProjectNotFound } from '~/mixins/project'
import EventBus from '~/modules/event-bus'
import VerificationEvents from '~/modules/events'
import { MUTATION_ADD_PROJECT } from '~/store/verification-runtime'
import { stableStringify } from '~/modules/json'

const ACTION_RESET_SYMBOLIC_EXECUTION = 'resetSymbolicExecution'

export {
  ACTION_RESET_SYMBOLIC_EXECUTION
}

@Module({
  name: 'symbolic-execution',
  stateFactory: true,
  namespaced: true
})
class SymbolicExecutionStore extends VuexModule {
  commandFlags: string = ''

  public get flags (): string {
    return this.commandFlags.trim()
  }

  public get canRunSymbolicExecutionStep (): () => boolean {
    return () => {
      let project: Project

      if (!this.context.rootGetters['editor/isProjectIdValid']()) {
        return false
      }

      try {
        const projectId = this.context.rootGetters['editor/projectId']
        project = this.context.rootGetters['verification-runtime/projectById'](projectId)

        return project.llvmBitcodeGenerationStepDone &&
            !project.symbolicExecutionStepStarted // No symbolic execution has started
      } catch (e) {
        if (!(e instanceof ProjectNotFound)) {
          EventBus.$emit(VerificationEvents.failedVerificationStep, { error: e })
        }

        return false
      }
    }
  }

  get commandPreview (): (projectId: string) => string {
    return (projectId: string) => {
      if (this.flags.length === 0) {
        return `klee --libc=klee --silent-klee-assume --warnings-only-to-file ${projectId}.bc`
      }

      return `klee --libc=klee ${this.flags} ${projectId}.bc`
    }
  }

  @Action
  [ACTION_RESET_SYMBOLIC_EXECUTION] (project: Project): void {
    const projectState: Project = {
      ...project
    }

    projectState.symbolicExecutionStepStarted = false
    projectState.symbolicExecutionStepProgress = {}
    projectState.symbolicExecutionStepReport = {}
    projectState.symbolicExecutionStepDone = false

    this.context.commit(
        `verification-runtime/${MUTATION_ADD_PROJECT}`,
        projectState,
        { root: true }
    )
  }

  @Mutation
  setAdditionalFlags (flags: string): void {
    this.commandFlags = flags
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
          typeof json.error !== 'undefined'
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
        symbolicExecutionStepStarted: true,
        symbolicExecutionStepDone: false
      }

      this.context.commit(
        'verification-runtime/addProject',
        projectState,
        { root: true }
      )
    } catch (e) {
      if (!(e instanceof ProjectNotFound)) {
        Vue.notify({
          title: 'Oops',
          text: 'Sorry, something went wrong when trying to run the symbolic execution.',
          type: 'error'
        })

        this.context.commit(
          'verification-runtime/pushError',
          { error: e },
          { root: true }
        )
      }
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

      await this.context.dispatch('pollSymbolicExecutionReport', project)
      projectState.symbolicExecutionStepReport = this.context.rootGetters['verification-runtime/projectById'](project.id).symbolicExecutionStepReport

      if (symbolicExecutionStepDone) {
        projectState.symbolicExecutionStepStarted = false
        this.context.commit(
          'verification-steps/unlockResetButton',
          {},
          { root: true }
        )
      }

      const currentProjectState = this.context.rootGetters['verification-runtime/projectById'](project.id)

      if (
        symbolicExecutionStepDone ||
        stableStringify(currentProjectState) !== stableStringify(projectState)
      ) {
        this.context.commit(
            `verification-runtime/${MUTATION_ADD_PROJECT}`,
            projectState,
            { root: true }
        )
      }
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
      if (stableStringify(json) !== stableStringify(currentReport)) {
        const projectState: Project = {
          ...project,
          symbolicExecutionStepReport: json
        }

        this.context.commit(
            `verification-runtime/${MUTATION_ADD_PROJECT}`,
            projectState,
            { root: true }
        )
      }
    } catch (e) {
      if (!(e instanceof ProjectNotFound)) {
        Vue.notify({
          title: 'Oops',
          text: 'Sorry, something went wrong when trying to poll the symbolic execution report.',
          type: 'error'
        })

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

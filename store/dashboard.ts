import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import Vue from 'vue'
import { Project } from '~/types/project'
import Config, { HttpMethod, Routes } from '~/config'
import EventBus from '~/modules/event-bus'
import { EditorEvents } from '~/modules/events'
import { VerificationStep as VerificationStepMod, VerificationStepProgress } from '~/modules/verification-steps'
import { VerificationStep } from '~/types/verification-steps'

@Module({
  name: 'dashboard',
  stateFactory: true,
  namespaced: true
})
export default class Dashboard extends VuexModule {
  projects: Project[] = []
  step: VerificationStep = VerificationStepMod.uploadSourceStep

  get routingParams (): {baseUrl: string, routes: Routes} {
    return {
      baseUrl: Config.getBaseURL(),
      routes: Config.getRoutes()
    }
  }

  get getFetchRequestInit (): (method: HttpMethod, body: BodyInit|null) => RequestInit {
    return (method: HttpMethod, body: BodyInit|null = null) => {
      const requestInit: RequestInit = {
        method,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
      }

      if (body !== null) {
        requestInit.body = body
      }

      return requestInit
    }
  }

  @Mutation
  addProject (project: Project): void {
    const indexedProjects = this.projects
      .reduce((acc: { [x: string]: any }, p: { id: string }) => {
        acc[p.id] = p
        return acc
      }, {})

    indexedProjects[project.id] = project

    this.projects = Object.keys(indexedProjects)
      .map(id => indexedProjects[id])
  }

  @Mutation
  public resetDashboardStore (): void {
    if (
      typeof this.projects === 'undefined' ||
      !this.projects
    ) {
      return
    }

    const projects = Object.keys(this.projects).map((id: any) => {
      const project = this.projects[id]

      project.llvmBitcodeGenerationStepStarted = false
      project.llvmBitcodeGenerationStepProgress = {}
      project.llvmBitcodeGenerationStepReport = {}
      project.llvmBitcodeGenerationStepDone = false

      project.symbolicExecutionStepStarted = false
      project.symbolicExecutionStepProgress = {}
      project.symbolicExecutionStepReport = {}
      project.symbolicExecutionStepDone = false

      return {
        ...project
      }
    })

    this.projects = [...projects]
  }

  @Action
  public async uploadSource ({ name, source, onSuccess }: {name: string, source: string, onSuccess: () => void}) {
    const { baseUrl, routes } = this.routingParams

    const url = `${baseUrl}${routes.uploadSource.url}`
    const method: HttpMethod = routes.uploadSource.method
    const body: BodyInit = JSON.stringify({ source })

    const response = await fetch(url, this.context.getters.getFetchRequestInit(method, body))

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

    EventBus.$emit(EditorEvents.projectIdentified, { projectId: json.project_id })

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

    this.context.commit('addProject', project)

    onSuccess()
  }

  @Action
  public async generateLlvmBitcode (project: Project) {
    const { baseUrl, routes } = this.routingParams

    const url = `${baseUrl}${routes.startLLVMBitcodeGeneration.url}`
      .replace('{{ projectId }}', project.id)
    const method: HttpMethod = routes.startLLVMBitcodeGeneration.method

    const response = await fetch(url, this.context.getters.getFetchRequestInit(method))

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

    this.context.commit('addProject', projectState)
  }

  @Action
  public async pollLlvmBitcodeGenerationProgress (project: Project) {
    const { baseUrl, routes } = this.routingParams

    const url = `${baseUrl}${routes.getLLVMBitcodeGenerationProgress.url}`
      .replace('{{ projectId }}', project.id)
    const method: HttpMethod = routes.getLLVMBitcodeGenerationProgress.method

    const response = await fetch(url, this.context.getters.getFetchRequestInit(method))

    const json = await response.json()

    if (
      typeof json.message === 'undefined' ||
        typeof json.error !== 'undefined'
    ) {
      return
    }

    const projectState: Project = {
      ...project,
      llvmBitcodeGenerationStepProgress: json,
      llvmBitcodeGenerationStepDone: json.raw_status === VerificationStepProgress.completed
    }

    this.context.commit('addProject', projectState)
  }

  @Action
  public async pollLlvmBitcodeGenerationReport (project: Project) {
    const { baseUrl, routes } = this.routingParams

    const url = `${baseUrl}${routes.getLLVMBitcodeGenerationReport.url}`
      .replace('{{ projectId }}', project.id)
    const method: HttpMethod = routes.getLLVMBitcodeGenerationReport.method

    const response = await fetch(url, this.context.getters.getFetchRequestInit(method))

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

    this.context.commit('addProject', projectState)
  }

  @Action
  public async runSymbolicExecution (project: Project) {
    const { baseUrl, routes }: { baseUrl: string, routes: Routes } = this.routingParams

    const url = `${baseUrl}${routes.startSymbolicExecution.url}`
      .replace('{{ projectId }}', project.id)
    const method: HttpMethod = routes.startSymbolicExecution.method

    const response = await fetch(url, this.context.getters.getFetchRequestInit(method))

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

    this.context.commit('addProject', projectState)
  }

  @Action
  public async pollSymbolicExecutionProgress (project: Project) {
    const { baseUrl, routes } = this.routingParams

    const url = `${baseUrl}${routes.getSymbolicExecutionProgress.url}`
      .replace('{{ projectId }}', project.id)
    const method: HttpMethod = routes.getSymbolicExecutionProgress.method

    const response = await fetch(url, this.context.getters.getFetchRequestInit(method))

    const json = await response.json()

    if (
      typeof json.message === 'undefined' ||
          typeof json.error !== 'undefined'
    ) {
      return
    }

    const projectState: Project = {
      ...project,
      symbolicExecutionStepProgress: json,
      symbolicExecutionStepDone: json.raw_status === VerificationStepProgress.completed
    }

    this.context.commit('addProject', projectState)
  }

  @Action
  public async pollSymbolicExecutionReport (project: Project) {
    const { baseUrl, routes } = this.routingParams

    const url = `${baseUrl}${routes.getSymbolicExecutionReport.url}`
      .replace('{{ projectId }}', project.id)
    const method: HttpMethod = routes.getSymbolicExecutionReport.method

    const response = await fetch(url, this.context.getters.getFetchRequestInit(method))

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

    this.context.commit('addProject', projectState)
  }

  public get allProjects (): Project[] {
    return this.projects
  }

  public get indexedProjects () : {[key: string]: Project} {
    return this.projects
      .reduce((acc: { [x: string]: any }, p: { id: string }) => {
        acc[p.id] = p
        return acc
      }, {})
  }

  public get projectByIdGetter () : (projectId: string) => Project|undefined {
    return (projectId: string) => {
      return this.context.getters.indexedProjects[projectId]
    }
  }
}

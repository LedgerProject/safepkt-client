import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import Vue from 'vue'
import { Project } from '~/types/project'
import Config, { HttpMethod, Routes } from '~/config'
import EventBus from '~/modules/event-bus'
import VerificationEvents, { EditorEvents } from '~/modules/events'
import { VerificationStep as VerificationStepMod, VerificationStepProgress } from '~/modules/verification-steps'
import { VerificationStep } from '~/types/verification-steps'

class InvalidVerificationStep extends Error {}

@Module({
  name: 'verification-runtime',
  stateFactory: true,
  namespaced: true
})
export default class VerificationRuntimeStore extends VuexModule {
  projects: Project[] = []
  errors: Error[] = []
  verificationStep: VerificationStep = VerificationStepMod.uploadSourceStep

  @Mutation
  pushError ({ error }: {error: Error}) {
    this.errors.push(error)
  }

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
  setVerificationStep (step: VerificationStep) {
    this.verificationStep = step
  }

  @Mutation
  public resetProjectState (): void {
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
  public resetVerificationRuntime (): void {
    this.context.commit('resetProjectState')
    this.context.commit('setVerificationStep', VerificationStepMod.uploadSourceStep)
  }

  @Action
  public async uploadSource ({ name, source, onSuccess }: {name: string, source: string, onSuccess: () => void}) {
    const { baseUrl, routes } = this.routingParams

    const url = `${baseUrl}${routes.uploadSource.url}`
    const method: HttpMethod = routes.uploadSource.method
    const body: BodyInit = JSON.stringify({ source })

    try {
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
    } catch (e) {
      this.context.commit('pushError', { error: e })
      Vue.notify({
        title: 'Oops',
        text: 'Sorry, something went wrong when trying to upload some source code.',
        type: 'error'
      })
    }
  }

  @Action
  public async generateLlvmBitcode (project: Project) {
    const { baseUrl, routes } = this.routingParams

    const url = `${baseUrl}${routes.startLLVMBitcodeGeneration.url}`
      .replace('{{ projectId }}', project.id)
    const method: HttpMethod = routes.startLLVMBitcodeGeneration.method

    try {
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

      this.context.commit('setVerificationStep', VerificationStepMod.llvmBitCodeGenerationStep)
      this.context.commit('addProject', projectState)
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
    const { baseUrl, routes } = this.routingParams

    const url = `${baseUrl}${routes.getLLVMBitcodeGenerationProgress.url}`
      .replace('{{ projectId }}', project.id)
    const method: HttpMethod = routes.getLLVMBitcodeGenerationProgress.method

    try {
      const response = await fetch(url, this.context.getters.getFetchRequestInit(method))
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
        this.context.commit('setVerificationStep', VerificationStepMod.symbolicExecutionStep)
      }
      this.context.commit('addProject', projectState)
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
    const { baseUrl, routes } = this.routingParams

    const url = `${baseUrl}${routes.getLLVMBitcodeGenerationReport.url}`
      .replace('{{ projectId }}', project.id)
    const method: HttpMethod = routes.getLLVMBitcodeGenerationReport.method

    try {
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

  @Action
  public async runSymbolicExecution (project: Project) {
    const { baseUrl, routes }: { baseUrl: string, routes: Routes } = this.routingParams

    const url = `${baseUrl}${routes.startSymbolicExecution.url}`
      .replace('{{ projectId }}', project.id)
    const method: HttpMethod = routes.startSymbolicExecution.method

    try {
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
    const { baseUrl, routes } = this.routingParams

    const url = `${baseUrl}${routes.getSymbolicExecutionProgress.url}`
      .replace('{{ projectId }}', project.id)
    const method: HttpMethod = routes.getSymbolicExecutionProgress.method

    try {
      const response = await fetch(url, this.context.getters.getFetchRequestInit(method))
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

      this.context.commit('addProject', projectState)
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
    const { baseUrl, routes } = this.routingParams

    const url = `${baseUrl}${routes.getSymbolicExecutionReport.url}`
      .replace('{{ projectId }}', project.id)
    const method: HttpMethod = routes.getSymbolicExecutionReport.method

    try {
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
    } catch (e) {
      Vue.notify({
        title: 'Oops',
        text: 'Sorry, something went wrong when trying to poll the symbolic execution report.',
        type: 'error'
      })
    }
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

  public get nextAvailableVerificationStep (): VerificationStep {
    return this.verificationStep
  }

  public get verificationStepReportGetter (): ({ project }: {project: Project}) => string {
    return ({ project }: {project: Project}) => {
      if (this.verificationStep === VerificationStepMod.uploadSourceStep) {
        return ''
      }

      if (
        this.verificationStep === VerificationStepMod.llvmBitCodeGenerationStep ||
        !project.symbolicExecutionStepStarted
      ) {
        return project.llvmBitcodeGenerationStepReport.messages
      }

      if (this.verificationStep === VerificationStepMod.symbolicExecutionStep) {
        return project.symbolicExecutionStepReport.messages
      }

      throw new InvalidVerificationStep(`Invalid verification step: "${this.verificationStep}"`)
    }
  }

  public get projectByIdGetter () : (projectId: string) => Project|undefined {
    return (projectId: string) => {
      return this.context.getters.indexedProjects[projectId]
    }
  }
}

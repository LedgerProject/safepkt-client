import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import { Project } from '~/types/project'
import Config, { HttpMethod, Routes } from '~/config'
import {
  VerificationStep as VerificationStepMod
} from '~/modules/verification-steps'
import { ProjectNotFound } from '~/mixins/project'
import { ACTION_RESET_LLVM_BITCODE_GENERATION } from '~/store/step/llvm-bitcode-generation'
import { ACTION_RESET_SYMBOLIC_EXECUTION } from '~/store/step/symbolic-execution'

const ACTION_RESET_PROJECTS = 'resetProject'
const MUTATION_ADD_PROJECT = 'addProject'

export {
  ACTION_RESET_PROJECTS,
  MUTATION_ADD_PROJECT
}

@Module({
  name: 'verification-runtime',
  stateFactory: true,
  namespaced: true
})
export default class VerificationRuntimeStore extends VuexModule {
  projects: Project[] = []

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

  get allProjects (): Project[] {
    return this.projects
  }

  get indexedProjects () : {[key: string]: Project} {
    return this.projects
      .reduce((acc: { [x: string]: any }, p: { id: string }) => {
        acc[p.id] = p
        return acc
      }, {})
  }

  get projectByIdGetter () : (projectId: string) => Project|undefined {
    return (projectId: string) => {
      return this.context.getters.indexedProjects[projectId]
    }
  }

  errors: Error[] = []

  @Mutation
  pushError ({ error }: {error: Error}) {
    if (error) {
      this.errors.push(error)
    }
  }

  get lastError (): Error|null {
    if (this.errors.length === 0) {
      return null
    }

    return this.errors[this.errors.length - 1]
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

  /** @throw ProjectNotFound */
  get projectById (): (projectId: string) => Project {
    return (projectId: string) => {
      const project = this.projectByIdGetter(projectId)
      if (typeof project === 'undefined') {
        throw new ProjectNotFound(`Could not find project having id ${projectId}`)
      }

      return project
    }
  }

  get currentProject (): Project|null {
    if (!this.context.rootGetters['editor/isProjectIdValid']()) {
      return null
    }

    return this.projectById(this.context.rootGetters['editor/projectId'])
  }

  get routingParams (): {baseUrl: string, routes: Routes} {
    return {
      baseUrl: Config.getBaseURL(),
      routes: Config.getRoutes()
    }
  }

  @Action
  [ACTION_RESET_PROJECTS] (): void {
    const allProjects = this.context.getters.allProjects

    if (
      typeof allProjects === 'undefined' ||
        !allProjects
    ) {
      return
    }

    Object.keys([...allProjects])
      .map((id: any) => {
        const project = allProjects[id]

        return {
          ...project
        }
      })
      .forEach((p: Project) => {
        this.context.dispatch(
          `step/llvm-bitcode-generation/${ACTION_RESET_LLVM_BITCODE_GENERATION}`,
          p,
          { root: true }
        )
        this.context.dispatch(
          `step/symbolic-execution/${ACTION_RESET_SYMBOLIC_EXECUTION}`,
          p,
          { root: true }
        )
      })
  }

  @Action
  resetVerificationRuntime (): void {
    this.context.commit(
      'step/upload-source/enableSourceUpload',
      {},
      { root: true }
    )
    this.context.commit(
      'editor/setProjectId',
      { projectId: '' },
      { root: true }
    )
    this.context.commit(
      'verification-steps/setVerificationStep',
      VerificationStepMod.uploadSourceStep,
      { root: true }
    )
    this.context.dispatch(ACTION_RESET_PROJECTS)
  }
}

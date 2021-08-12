import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import { Project } from '~/types/project'
import Config, { HttpMethod, Routes } from '~/config'
import {
  VerificationStep as VerificationStepMod
} from '~/modules/verification-steps'
import { ProjectNotFound } from '~/mixins/project'

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

  @Mutation
  resetProjectState (): void {
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
    this.errors.push(error)
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

  get routingParams (): {baseUrl: string, routes: Routes} {
    return {
      baseUrl: Config.getBaseURL(),
      routes: Config.getRoutes()
    }
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
    this.context.commit('resetProjectState')
  }
}

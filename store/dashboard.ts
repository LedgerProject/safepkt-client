import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import Vue from 'vue'
import { Project } from '~/types/project'
import Config from '~/config'
import EventBus from '~/modules/event-bus'
import { EditorEvents } from '~/modules/events'

@Module({
  name: 'dashboard',
  stateFactory: true,
  namespaced: true
})
export default class Dashboard extends VuexModule {
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

    @Action
    public async uploadSource ({ name, source }: {name: string, source: string}) {
      const baseUrl = Config.getBaseURL()
      const routes = Config.getRoutes()
      const method = `${routes.uploadSource.method}`
      const url = `${baseUrl}${routes.uploadSource.url}`

      const body = JSON.stringify({ source })

      const response = await fetch(url, {
        method,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body
      })

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
        llvmBitcodeGenerationStarted: false,
        symbolicExecutionStarted: false
      }

      this.context.commit('addProject', project)
    }

    @Action
    public async generateLlvmBitcode (project: Project) {
      const baseUrl = Config.getBaseURL()
      const routes = Config.getRoutes()
      const method = `${routes.startLLVMBitcodeGeneration.method}`
      const url = `${baseUrl}${routes.startLLVMBitcodeGeneration.url}`
        .replace('{{ projectId }}', project.id)

      const response = await fetch(url, {
        method,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
      })

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
        text: `The LLVM bitcode was successfully generated for project having id ${project.id}.`,
        type: 'success'
      })

      const projectState: Project = {
        ...project,
        llvmBitcodeGenerationStarted: true
      }

      this.context.commit('addProject', projectState)
    }

    @Action
    public async runSymbolicExecution (project: Project) {
      const baseUrl = Config.getBaseURL()
      const routes = Config.getRoutes()
      const method = `${routes.startSymbolicExecution.method}`
      const url = `${baseUrl}${routes.startSymbolicExecution.url}`
        .replace('{{ projectId }}', project.id)

      const response = await fetch(url, {
        method,
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer'
      })

      const json = await response.json()

      if (
        typeof json.project_id === 'undefined' ||
            !json.project_id
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
        text: `The symbolic execution was successful for project having id ${project.id}.`,
        type: 'success'
      })

      const projectState: Project = {
        ...project,
        symbolicExecutionStarted: true
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

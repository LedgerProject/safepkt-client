import { Action, Module, Mutation, VuexModule } from 'vuex-module-decorators'
import Vue from 'vue'
import { Project } from '~/types/project'
import Config from '~/config'

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
    public async uploadSource (source: string) {
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

      this.context.commit(
        'addProject',
        { id: json.project_id, source }
      )
    }

    public get allProjects (): Project[] {
      return this.projects
    }
}

<template>
  <div class="uploaded-projects">
    <h2>Uploaded project sources</h2>
    <ul class="uploaded-projects__list">
      <li
        v-for="project in getAllProjects()"
        :key="project.id"
        class="uploaded-projects__item"
      >
        <div
          :data-project-id="project.id"
          v-text="formatProjectName(project)"
        />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { Project } from '~/types/project'

const VerificationRuntime = namespace('verification-runtime')

@Component
export default class UploadedProjects extends Vue {
  @VerificationRuntime.Getter
  public allProjects!: Project[]

  getAllProjects () {
    return this.allProjects
  }

  formatProjectName (project: Project): string {
    return `${project.name} (hash: "${project.id}")`
  }
}
</script>

<style lang="scss">
@import './uploaded-projects.scss';
</style>

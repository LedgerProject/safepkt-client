import { Component, mixins, namespace } from 'nuxt-property-decorator'
import { VerificationStep, VerificationStepAssertion, VerificationStepPollingTarget } from '~/types/verification-steps'
import { Project } from '~/types/project'
import { VerificationStep as NextVerificationStep } from '~/modules/verification-steps'
import VerificationRuntimeMixin from '~/mixins/verification-runtime'

const VerificationStepsStore = namespace('verification-steps')

@Component
class VerificationStepsMixin extends mixins(VerificationRuntimeMixin) {
  @VerificationStepsStore.Getter
  public canRunVerificationStep!: (step: VerificationStep) => boolean

  @VerificationStepsStore.Getter
  public canResetVerificationRuntime!: boolean

  @VerificationStepsStore.Getter
  public isResetButtonLocked!: boolean

  @VerificationStepsStore.Getter
  public isVerificationStepSuccessful!: VerificationStepAssertion

  @VerificationStepsStore.Getter
  public isVerificationStepProgressCompleted!: (project: Project, pollingTarget: VerificationStepPollingTarget) => VerificationStepAssertion

  @VerificationStepsStore.Getter
  public verificationStepReportGetter!: ({ project }: {project: Project}) => string;

  @VerificationStepsStore.Getter
  public nextStep!: () => NextVerificationStep

  @VerificationStepsStore.Action
  public reportError!: ({ error }: { error: Error }) => void

  public get verificationStepReport (): string {
    if (!this.isProjectIdValid()) {
      return ''
    }

    try {
      const project: Project = this.projectById(this.projectId)
      return this.verificationStepReportGetter({ project })
    } catch (e) {
      this.logger.error(
        e.message,
        'index.vue',
        { projectId: this.projectId }
      )

      return ''
    }
  }
}

export default VerificationStepsMixin

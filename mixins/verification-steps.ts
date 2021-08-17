import { Component, mixins, namespace } from 'nuxt-property-decorator'
import {
  VerificationStep as VerificationStepType,
  VerificationStep,
  VerificationStepAssertion,
  VerificationStepPollingTarget
} from '~/types/verification-steps'
import { Project } from '~/types/project'
import { VerificationStep as NextVerificationStep } from '~/modules/verification-steps'
import VerificationRuntimeMixin from '~/mixins/verification-runtime'

const ReportStore = namespace('report')
const VerificationStepsStore = namespace('verification-steps')

@Component
class VerificationStepsMixin extends mixins(VerificationRuntimeMixin) {
  @ReportStore.Getter
  reportTitle!: (step: VerificationStepType) => string

  @VerificationStepsStore.Getter
  canRunVerificationStep!: (step: VerificationStep) => boolean

  @VerificationStepsStore.Getter
  canResetVerificationRuntime!: boolean

  @VerificationStepsStore.Getter
  isResetButtonLocked!: boolean

  @VerificationStepsStore.Getter
  isVerificationStepSuccessful!: VerificationStepAssertion

  @VerificationStepsStore.Getter
  isVerificationStepProgressCompleted!: (project: Project, pollingTarget: VerificationStepPollingTarget) => VerificationStepAssertion

  @VerificationStepsStore.Getter
  isVerificationStepReportVisible!: (step : VerificationStep) => boolean

  @VerificationStepsStore.Getter
  nextStep!: () => NextVerificationStep

  @VerificationStepsStore.Getter
  verificationStepReportGetter!: ({ project, step }: {project: Project, step: VerificationStep}) => string;

  @VerificationStepsStore.Getter
  verificationStepReportVisibilityToggler!: (step : VerificationStep) => () => void

  @VerificationStepsStore.Action
  reportError!: ({ error }: { error: Error }) => void

  @VerificationStepsStore.Action
  toggleVerificationStepReportVisibility!: (step: VerificationStep) => void

  get verificationStepReport (): (step: VerificationStep) => string {
    return (step: VerificationStep) => {
      if (!this.isProjectIdValid()) {
        return ''
      }

      try {
        const project: Project = this.projectById(this.projectId)
        return this.verificationStepReportGetter({ project, step })
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
}

export default VerificationStepsMixin

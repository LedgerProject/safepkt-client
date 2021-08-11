import { Component, mixins, namespace } from 'nuxt-property-decorator'
import { VerificationStep, VerificationStepAssertion } from '~/types/verification-steps'
import { Project } from '~/types/project'
import { VerificationStep as NextVerificationStep, VerificationStep as Step } from '~/modules/verification-steps'
import VerificationRuntimeMixin from '~/mixins/verification-runtime'

const VerificationStepsStore = namespace('verification-steps')

@Component
class VerificationStepsMixin extends mixins(VerificationRuntimeMixin) {
  @VerificationStepsStore.Getter
  public isVerificationStepSuccessful!: VerificationStepAssertion

  @VerificationStepsStore.Getter
  public isVerificationStepProgressCompleted!: VerificationStepAssertion

  @VerificationStepsStore.Getter
  public nextAvailableVerificationStep!: VerificationStep;

  @VerificationStepsStore.Getter
  public verificationStepReportGetter!: ({ project }: {project: Project}) => string;

  @VerificationStepsStore.Getter
  public nextStepAvailable!: () => NextVerificationStep

  canRunVerificationStep (step: VerificationStep): boolean {
    if (step === Step.llvmBitCodeGenerationStep) {
      return this.canRunLlvmBitcodeGenerationStep()
    }

    return false
  }

  verificationStepReport (): string {
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


import {
  VerificationStepPollingTarget,
  VerificationStep as Step
} from '~/types/verification-steps'

export class VerificationStepProgress {
  static running = 'running'
  static completed = 'exited'
}

export class PollingTarget {
  static SourceRestorationStepProgress: VerificationStepPollingTarget = 'sourceRestorationStepProgress'
  static SourceRestorationStepReport: VerificationStepPollingTarget = 'sourceRestorationStepReport'
  static ProgramVerificationStepProgress: VerificationStepPollingTarget = 'programVerificationStepProgress'
  static ProgramVerificationStepReport: VerificationStepPollingTarget = 'programVerificationStepReport'
}

export class VerificationStep {
  static uploadSourceStep: Step = 'uploadSource'
  static sourceRestorationStep: Step = 'sourceRestoration'
  static programVerificationStep: Step = 'programVerification'

  get uploadSourceStep () {
    return VerificationStep.uploadSourceStep
  }

  get sourceRestorationStep () {
    return VerificationStep.sourceRestorationStep
  }

  get programVerificationStep () {
    return VerificationStep.programVerificationStep
  }
}

class UnexpectedStep extends Error {}

export { UnexpectedStep }

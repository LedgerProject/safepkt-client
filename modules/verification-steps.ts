
import {
  VerificationStepPollingTarget,
  VerificationStep as Step
} from '~/types/verification-steps'

export class VerificationStepProgress {
  static running = 'running'
  static completed = 'exited'
}

export class PollingTarget {
  static LLVMBitcodeGenerationStepProgress: VerificationStepPollingTarget = 'llvmBitcodeGenerationStepProgress'
  static LLVMBitcodeGenerationStepReport: VerificationStepPollingTarget = 'llvmBitcodeGenerationStepReport'
  static SymbolicExecutionStepProgress: VerificationStepPollingTarget = 'symbolicExecutionStepProgress'
}

export class VerificationStep {
  static uploadSourceStep: Step = 'uploadSourceStep'
  static llvmBitcodeGenerationStep: Step = 'llvmBitcodeGenerationStep'
  static symbolicExecutionStep: Step = 'symbolicExecutionStep'
}

class InvalidVerificationStep extends Error {}
class UnexpectedStep extends Error {}

export { InvalidVerificationStep, UnexpectedStep }

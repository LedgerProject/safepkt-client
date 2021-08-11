
import {
  VerificationStepPollingTarget,
  VerificationStep as Step
} from '~/types/verification-steps'

export class VerificationStepProgress {
  static running = 'running'
  static completed = 'exited'
}

export class PollingTarget {
  static LLVMBitCodeGenerationStepProgress: VerificationStepPollingTarget = 'llvmBitcodeGenerationStepProgress'
  static LLVMBitCodeGenerationStepReport: VerificationStepPollingTarget = 'llvmBitcodeGenerationStepReport'
  static SymbolicExecutionStepProgress: VerificationStepPollingTarget = 'symbolicExecutionStepProgress'
  static SymbolicExecutionStepReport: VerificationStepPollingTarget = 'symbolicExecutionStepReport'
}

export class VerificationStep {
  static uploadSourceStep: Step = 'uploadSourceStep'
  static llvmBitCodeGenerationStep: Step = 'llvmBitCodeGenerationStep'
  static symbolicExecutionStep: Step = 'symbolicExecutionStep'
}

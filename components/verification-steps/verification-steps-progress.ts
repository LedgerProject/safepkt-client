
import {
  LLVMBitCodeGenerationStepReport,
  LLVMBitCodeGenerationStepProgress,
  SymbolicExecutionStepReport,
  SymbolicExecutionStepProgress
} from '~/types/verification-steps'

const VERIFICATION_STEP_PROGRESS_RUNNING = 'running'
const VERIFICATION_STEP_PROGRESS_COMPLETED = 'exited'

export class VerificationStepProgress {
  static running = VERIFICATION_STEP_PROGRESS_RUNNING
  static completed = VERIFICATION_STEP_PROGRESS_COMPLETED
}

export class VerificationStep {
  static LLVMBitCodeGenerationStepProgress: LLVMBitCodeGenerationStepProgress = 'llvmBitcodeGenerationStepProgress'
  static LLVMBitCodeGenerationStepReport: LLVMBitCodeGenerationStepReport = 'llvmBitcodeGenerationStepReport'
  static SymbolicExecutionStepProgress: SymbolicExecutionStepProgress = 'symbolicExecutionStepProgress'
  static SymbolicExecutionStepReport: SymbolicExecutionStepReport = 'symbolicExecutionStepReport'
}


type LLVMBitCodeGenerationStepProgress = 'llvmBitcodeGenerationStepProgress'
type LLVMBitCodeGenerationStepReport = 'llvmBitcodeGenerationStepReport'
type SymbolicExecutionStepProgress = 'symbolicExecutionStepProgress'
type SymbolicExecutionStepReport = 'symbolicExecutionStepReport'

type VerificationStep =
    LLVMBitCodeGenerationStepProgress|
    LLVMBitCodeGenerationStepReport|
    SymbolicExecutionStepProgress|
    SymbolicExecutionStepReport

export {
    LLVMBitCodeGenerationStepProgress,
    LLVMBitCodeGenerationStepReport,
    SymbolicExecutionStepProgress,
    SymbolicExecutionStepReport,
    VerificationStep
}

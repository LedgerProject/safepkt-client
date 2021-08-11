
type VerificationStepProgressRunning = 'verificationStepProgressRunning'
type VerificationStepProgressCompleted = 'verificationStepProgressCompleted'

type VerificationStepProgress = VerificationStepProgressRunning|VerificationStepProgressCompleted

type LLVMBitCodeGenerationStepProgress = 'llvmBitcodeGenerationStepProgress'
type LLVMBitCodeGenerationStepReport = 'llvmBitcodeGenerationStepReport'
type SymbolicExecutionStepProgress = 'symbolicExecutionStepProgress'
type SymbolicExecutionStepReport = 'symbolicExecutionStepReport'

type VerificationStepPollingTarget =
    LLVMBitCodeGenerationStepProgress|
    LLVMBitCodeGenerationStepReport|
    SymbolicExecutionStepProgress|
    SymbolicExecutionStepReport

type UploadSourceStep = 'uploadSourceStep'
type LLVMBitCodeGenerationStep = 'llvmBitCodeGenerationStep'
type SymbolicExecutionStep = 'symbolicExecutionStep'

type VerificationStep =
    UploadSourceStep|
    LLVMBitCodeGenerationStep|
    SymbolicExecutionStep

export {
    VerificationStep,
    VerificationStepProgress,
    VerificationStepPollingTarget,
}
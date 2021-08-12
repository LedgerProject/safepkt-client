import {Project} from "~/types/project";

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
type LLVMBitCodeGenerationStep = 'llvmBitcodeGenerationStep'
type SymbolicExecutionStep = 'symbolicExecutionStep'

type VerificationStep =
    UploadSourceStep|
    LLVMBitCodeGenerationStep|
    SymbolicExecutionStep

type VerificationStepAssertion = (project: Project, pollingTarget: VerificationStepPollingTarget) => boolean

export {
    VerificationStep,
    VerificationStepAssertion,
    VerificationStepPollingTarget,
}
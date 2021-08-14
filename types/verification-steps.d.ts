import {Project} from "~/types/project";

type LLVMBitcodeGenerationStepProgress = 'llvmBitcodeGenerationStepProgress'
type LLVMBitcodeGenerationStepReport = 'llvmBitcodeGenerationStepReport'
type SymbolicExecutionStepProgress = 'symbolicExecutionStepProgress'
type SymbolicExecutionStepReport = 'symbolicExecutionStepReport'

type VerificationStepPollingTarget =
    LLVMBitcodeGenerationStepProgress|
    LLVMBitcodeGenerationStepReport|
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
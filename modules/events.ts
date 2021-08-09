
export const EVENT_SOURCE_UPLOADED = 'verification-steps.source-uploaded'
export const EVENT_LLVM_BITCODE_GENERATION_STARTED = 'verification-steps.llvm-bitcode-generation-started'
export const EVENT_SYMBOLIC_EXECUTION_STARTED = 'verification-steps.symbolic-execution-started'

export default class VerificationEvents {
    static sourceUploaded = EVENT_SOURCE_UPLOADED
    static llvmBitcodeGenerationStarted = EVENT_LLVM_BITCODE_GENERATION_STARTED
    static symbolicExecutionStarted = EVENT_SYMBOLIC_EXECUTION_STARTED
}

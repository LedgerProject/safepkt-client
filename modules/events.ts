
export default class VerificationEvents {
    static sourceUploaded = 'verification-steps.source-uploaded'
    static llvmBitcodeGenerationStarted = 'verification-steps.llvm-bitcode-generation-started'
    static symbolicExecutionStarted = 'verification-steps.symbolic-execution-started'
    static resetVerificationRuntime = 'verification-steps.reset-verification-runtime'
    static failedVerificationStep = 'verification-steps.failure'
}

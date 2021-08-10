export const EVENT_EDITOR_PROJECT_IDENTIFIED = 'editor.project-identified'

export class EditorEvents {
    static projectIdentified = EVENT_EDITOR_PROJECT_IDENTIFIED
}

export const EVENT_VERIFICATION_STEPS_SOURCE_UPLOADED = 'verification-steps.source-uploaded'
export const EVENT_VERIFICATION_STEPS_LLVM_BITCODE_GENERATION_STARTED = 'verification-steps.llvm-bitcode-generation-started'
export const EVENT_VERIFICATION_STEPS_SYMBOLIC_EXECUTION_STARTED = 'verification-steps.symbolic-execution-started'

export default class VerificationEvents {
    static sourceUploaded = EVENT_VERIFICATION_STEPS_SOURCE_UPLOADED
    static llvmBitcodeGenerationStarted = EVENT_VERIFICATION_STEPS_LLVM_BITCODE_GENERATION_STARTED
    static symbolicExecutionStarted = EVENT_VERIFICATION_STEPS_SYMBOLIC_EXECUTION_STARTED
}

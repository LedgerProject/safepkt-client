
type Project = {
    id: string,
    source: string,
    name: string,
    llvmBitcodeGenerationStepStarted: boolean,
    llvmBitcodeGenerationStepProgress: any,
    llvmBitcodeGenerationStepReport: any,
    llvmBitcodeGenerationStepDone: boolean,
    symbolicExecutionStepStarted: boolean,
    symbolicExecutionStepProgress: any,
    symbolicExecutionStepReport: any,
    symbolicExecutionStepDone: boolean,
}

export { Project };

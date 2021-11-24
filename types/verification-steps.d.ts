import {Project} from "~/types/project";

type SourceRestorationStepProgress = 'sourceRestorationStepProgress'
type SourceRestorationStepReport = 'sourceRestorationStepReport'
type ProgramVerificationStepProgress = 'programVerificationStepProgress'
type ProgramVerificationStepReport = 'programVerificationStepReport'

type VerificationStepPollingTarget =
    SourceRestorationStepProgress|
    SourceRestorationStepReport|
    ProgramVerificationStepProgress|
    ProgramVerificationStepReport

type UploadSourceStep = 'uploadSource'
type SourceRestorationStep = 'sourceRestoration'
type ProgramVerificationStep = 'programVerification'

type VerificationStep =
    UploadSourceStep|
    SourceRestorationStep|
    ProgramVerificationStep

type VerificationStepAssertion = (project: Project, pollingTarget: VerificationStepPollingTarget) => boolean

export {
    VerificationStep,
    VerificationStepAssertion,
    VerificationStepPollingTarget,
}

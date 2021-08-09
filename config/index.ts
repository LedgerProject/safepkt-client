import { EnvParam, EnvProvider } from '~/modules/shared-state'

const getHostParams = (environmentProvider: EnvProvider) => {
  let host: string|undefined = 'localhost'
  let port: string|Number|undefined = '3000'
  let scheme: string|undefined = 'http://'

  const environment: EnvParam = environmentProvider.getEnvironmentParameters()
  if (environment.productionMode) {
    scheme = 'https://'
    host = process.env.API_HOST

    if (
      typeof process.env.API_PORT !== 'undefined' &&
      process.env.API_PORT
    ) {
      port = `:${process.env.API_PORT}`
    }
  } else if (
    typeof process.env.API_HOST !== 'undefined' &&
    process.env.API_HOST
  ) {
    host = process.env.API_HOST

    if (
      typeof process.env.API_PORT !== 'undefined' &&
      process.env.API_PORT
    ) {
      port = `:${process.env.API_PORT}`
    }

    if (
      typeof process.env.API_SCHEME !== 'undefined' &&
      process.env.API_SCHEME
    ) {
      scheme = process.env.API_SCHEME
    }
  }

  return {
    host,
    port,
    scheme
  }
}

type Route = {
  method: string,
  url: string,
  params: {[key: string]: StringConstructor},
}

type Routes = {
  [key: string]: Route
}

type Api = {
  host?: string,
  port?: string,
  scheme?: string,
  routes: Routes
}

const METHOD_GET = 'GET'
const METHOD_POST = 'POST'

const api: Api = {
  routes: {
    uploadSource: {
      method: METHOD_POST,
      url: '/source',
      params: {}
    },
    startLLVMBitcodeGeneration: {
      method: METHOD_POST,
      url: '/llvm-bitcode-generation/{{ project_id }}',
      params: {
        project_id: String
      }
    },
    getLLVMBitcodeGenerationProgress: {
      method: METHOD_GET,
      url: '/llvm-bitcode-generation/{{ project_id }}/progress',
      params: {
        project_id: String
      }
    },
    getLLVMBitcodeGenerationReport: {
      method: METHOD_GET,
      url: '/llvm-bitcode-generation/{{ project_id }}/report',
      params: {
        project_id: String
      }
    },
    startSymbolicExecution: {
      method: METHOD_POST,
      url: '/symbolic-execution/{{ project_id }}',
      params: {
        project_id: String
      }
    },
    getSymbolicExecutionProgress: {
      method: METHOD_GET,
      url: '/symbolic-execution/{{ project_id }}/progress',
      params: {
        project_id: String
      }
    },
    getSymbolicExecutionReport: {
      method: METHOD_GET,
      url: '/symbolic-execution/{{ project_id }}/report',
      params: {
        project_id: String
      }
    }
  }
}

const getApi = (environmentProvider: EnvProvider) => {
  api.host = getHostParams(environmentProvider).host
  api.port = getHostParams(environmentProvider).port
  api.scheme = getHostParams(environmentProvider).scheme

  return api
}

const getRoutes = (): Routes => api.routes
const getBaseURL = () => `${api.scheme}${api.host}${api.port}`

export { Api, Routes }

export default {
  getApi,
  getRoutes,
  getBaseURL
}

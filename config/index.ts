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
      url: '/llvm-bitcode-generation/{{ projectId }}',
      params: {
        projectId: String
      }
    },
    getLLVMBitcodeGenerationProgress: {
      method: METHOD_GET,
      url: '/llvm-bitcode-generation/{{ projectId }}/progress',
      params: {
        projectId: String
      }
    },
    getLLVMBitcodeGenerationReport: {
      method: METHOD_GET,
      url: '/llvm-bitcode-generation/{{ projectId }}/report',
      params: {
        projectId: String
      }
    },
    startSymbolicExecution: {
      method: METHOD_POST,
      url: '/symbolic-execution/{{ projectId }}',
      params: {
        projectId: String
      }
    },
    getSymbolicExecutionProgress: {
      method: METHOD_GET,
      url: '/symbolic-execution/{{ projectId }}/progress',
      params: {
        projectId: String
      }
    },
    getSymbolicExecutionReport: {
      method: METHOD_GET,
      url: '/symbolic-execution/{{ projectId }}/report',
      params: {
        projectId: String
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

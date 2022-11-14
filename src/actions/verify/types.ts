import {VerifyPackageConfig} from './verify-common'

export interface SanityPlugin {
  verifyPackage?: VerifyPackageConfig
}

export interface PackageJson {
  name?: string
  version?: string
  description?: string
  author?: string
  license?: string
  source?: string
  exports?: {
    [index: string]: Record<string, string> | string | undefined
  }
  main?: string
  module?: string
  types?: string
  typings?: string
  browser?: string
  files?: string[]
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  sanityPlugin?: SanityPlugin
  engines?: {
    node?: string
  }
  keywords?: string[]
  repository?: {url?: string}

  [index: string]: unknown
}

export interface CompilerOptions {
  jsx?: string
  moduleResolution?: string
  target?: string
  module?: string
  sourceMap?: boolean
  inlineSourceMap?: boolean
  esModuleInterop?: boolean
  skipLibCheck?: boolean
  isolatedModules?: boolean
  downlevelIteration?: boolean
  declaration?: boolean
  allowSyntheticDefaultImports?: boolean
  outDir?: string
  baseUrl?: string
  checkJs?: false
}

export interface TsConfig {
  compilerOptions?: CompilerOptions
  include?: string[]
}

export interface SanityV2Json {
  parts?: [
    {
      implements?: string
      path?: 'string'
    }
  ]
}

export interface SanityStudioJson {
  root?: boolean
  project?: {
    name?: string
  }
  api?: {
    projectId?: string
    dataset?: string
  }
  plugins?: string[]
  parts?: Record<string, unknown>[]
}

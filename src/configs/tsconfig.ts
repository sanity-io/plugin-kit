import {outdent} from 'outdent'
import {InjectTemplate} from '../actions/inject'
import {InitFlags} from '../actions/init'

export function tsconfigTemplate(options: {flags: InitFlags}): InjectTemplate {
  const {flags} = options

  return {
    type: 'template',
    force: flags.force,
    to: 'tsconfig.json',
    value: outdent`
      {
        "extends": "./tsconfig.settings",
        "include": ["./src", "./package.config.ts"]
      }
    `,
  }
}

export function tsconfigTemplateDist(options: {outDir: string; flags: InitFlags}): InjectTemplate {
  const {flags, outDir} = options

  return {
    type: 'template',
    force: flags.force,
    to: `tsconfig.${outDir}.json`,
    value: outdent`
      {
        "extends": "./tsconfig.settings",
        "include": ["./src"],
        "exclude": [
          "./src/**/__fixtures__",
          "./src/**/__mocks__",
          "./src/**/*.test.ts",
          "./src/**/*.test.tsx"
        ]
      }
    `,
  }
}

export function tsconfigTemplateSettings(options: {
  outDir: string
  flags: InitFlags
}): InjectTemplate {
  const {flags, outDir} = options

  return {
    type: 'template',
    force: flags.force,
    to: `tsconfig.settings.json`,
    value: outdent`
      {
        "compilerOptions": {
          "rootDir": ".",
          "outDir": "./${outDir}",

          "target": "esnext",
          "jsx": "preserve",
          "module": "preserve",
          "moduleResolution": "bundler",
          "esModuleInterop": true,
          "resolveJsonModule": true,
          "moduleDetection": "force",
          "strict": true,
          "allowSyntheticDefaultImports": true,
          "skipLibCheck": true,
          "forceConsistentCasingInFileNames": true,
          "isolatedModules": true,

          // Don't emit by default, pkg-utils will ignore this when generating .d.ts files
          "noEmit": true
        }
      }
    `,
  }
}

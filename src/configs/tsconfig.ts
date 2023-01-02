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
        "include": ["./src", "./package.config.ts"],
        "compilerOptions": {
          "rootDir": ".",
          "jsx": "react-jsx",
          "noEmit": true
        }
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
        ],
        "compilerOptions": {
          "rootDir": ".",
          "outDir": "./${outDir}",
          "jsx": "react-jsx",
          "emitDeclarationOnly": true
        }
      }
    `,
  }
}

export function tsconfigTemplateSettings(options: {flags: InitFlags}): InjectTemplate {
  const {flags} = options

  return {
    type: 'template',
    force: flags.force,
    to: `tsconfig.settings.json`,
    value: outdent`
      {
        "compilerOptions": {
          "moduleResolution": "node",
          "target": "esnext",
          "module": "esnext",
          "lib": ["DOM", "DOM.Iterable", "ESNext"],
          "esModuleInterop": true,
          "strict": true,
          "downlevelIteration": true,
          "declaration": true,
          "allowSyntheticDefaultImports": true,
          "skipLibCheck": true,
          "isolatedModules": true
        }
      }
    `,
  }
}

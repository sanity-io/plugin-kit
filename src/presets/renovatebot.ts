import {Preset} from './presets'
import {InjectOptions, writeAssets} from '../actions/inject'

export const renovatePreset: Preset = {
  name: 'renovatebot',
  description: 'Files to enable renovatebot.',
  apply: applyPreset,
}

async function applyPreset(options: InjectOptions) {
  await writeAssets(
    [
      {
        type: 'copy',
        from: ['renovatebot', 'renovate.json'],
        to: 'renovate.json',
      },
    ],
    options
  )
}

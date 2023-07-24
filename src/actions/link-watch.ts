/*
ISC License (ISC)
Copyright 2019 Johan Otterud

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted,
provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS,
WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH
THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

/*
This code is a modified version of https://github.com/johot/yalc-watch,
and the ISC License has been added for this file only, in accordance with the package.json license field in that package
*/

import nodemon from 'nodemon'
import concurrently from 'concurrently'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import log from '../util/log'
import {getPackage} from '../npm/package'
import outdent from 'outdent'
import {fileExists, mkdir} from '../util/files'
import {loadConfig as loadPackageConfig} from '@sanity/pkg-utils'
import {defaultOutDir} from '../constants'

interface YalcWatchConfig {
  command?: string
  extensions?: string
}

interface PackageJson {
  sanityPlugin?: {linkWatch?: YalcWatchConfig}
}

export async function linkWatch({basePath}: {basePath: string}) {
  const packageJson: PackageJson = JSON.parse(
    fs.readFileSync(path.join(basePath, 'package.json'), 'utf8'),
  )

  const packageConfig = await loadPackageConfig({cwd: basePath})
  const outDir = packageConfig?.dist ?? defaultOutDir

  const watch: Required<YalcWatchConfig> = {
    command: 'npm run watch',
    extensions: 'ts,js,png,svg,gif,jpeg,css',
    ...packageJson.sanityPlugin?.linkWatch,
  }

  nodemon({
    watch: [outDir],
    ext: watch.extensions,
    exec: 'yalc push --changed',
    //delay: 1000
  })

  // ensure the folder exits so it can be watched
  const folder = path.join(basePath, outDir)
  if (!(await fileExists(folder))) {
    await mkdir(folder)
  }

  const pkg = await getPackage({basePath, validate: false})

  concurrently([watch.command])

  nodemon
    .on('start', function () {
      log.info(
        outdent`
        Watching ${outDir} for changes to files with extensions: ${watch.extensions}

        To test this package in Sanity Studio or another package, in a separate shell run:
        cd /path/to/sanity/studio-or-package

        Then, run one of the below commands, based on the package manager used in studio-or-package:

        ## yarn
        ${chalk.greenBright(`yalc add --link ${pkg.name} && yarn install`)}

        ## npm
        ${chalk.greenBright(`npx yalc add ${pkg.name} && npx yalc link ${pkg.name} && npm install`)}
      `.trimStart(),
      )
    })
    .on('quit', function () {
      process.exit()
    })
    .on('restart', function (files: any) {
      log.info('Found changes in files:', chalk.magentaBright(files))
      log.info('Pushing new yalc package...')
    })
}

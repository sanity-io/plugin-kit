import execa from 'execa'
import path from 'path'
import util from 'util'
import fs from 'fs'
import readdirp, {EntryInfo} from 'readdirp'

const rimraf = util.promisify(require('rimraf'))
const baseFixturesDir = path.join(__dirname, 'fixtures')

export const readFileRaw = util.promisify(fs.readFile)
export const readFile = (file: string) => readFileRaw(file, 'utf8')
export const onlyPaths = (files: EntryInfo[]) => files.map((file) => file.path)
export const contents = (dir: string) => readdirp.promise(dir).then(onlyPaths)
export const normalize = (dirPath: string) => dirPath.replace(/\//g, path.sep)

export const pluginTestName = 'sanity-plugin-test-plugin'

export const initTestArgs = [
  '--force',
  '--no-install',
  '--name',
  pluginTestName,
  '--license',
  'mit',
  '--author',
  'Test Person <test.person@somewhere-on-the-internet.nowhere>',
  '--repo',
  'https://github.com/sanity-io/sanity',
]

export async function testFixture({
  fixturePath,
  relativeOutPath = 'lib',
  command,
  assert,
}: {
  fixturePath: string
  relativeOutPath?: string
  command: (args: {fixtureDir: string; outputDir: string}) => Promise<execa.ExecaReturnValue>
  assert: (args: {result: execa.ExecaReturnValue; outputDir: string}) => Promise<void>
}) {
  const fixtureDir = path.join(baseFixturesDir, normalize(fixturePath))
  const outputDir = path.join(fixtureDir, normalize(relativeOutPath))

  await rimraf(outputDir)

  const result = await command({fixtureDir, outputDir})
  await assert({result, outputDir})

  await rimraf(outputDir)
}

export function fileContainsValidator(
  t: any /* tap types cannot be imported? :shrug: */,
  outputDir: string
) {
  return async (file: string, ...contains: string[]) => {
    const fileString = await readFile(path.join(outputDir, normalize(file)))
    contains.forEach((content) => t.match(fileString, content, `${file} contains ${content}`))
  }
}

export function runCliCommand(command: string, args: string[] = [], options?: execa.Options) {
  return execa('ts-node', ['run-test-command.ts', command, ...args], {
    cwd: __dirname,
    reject: false,
    ...options,
  })
}

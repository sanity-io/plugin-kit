import path from 'path'
import xdgBasedir from 'xdg-basedir'
import {getGitUserInfo as _getGitUserInfo} from 'git-user-info'
import {validate as isValidEmail} from 'email-validator'
import {readJsonFile} from './files'
import {request} from './request'
import {prompt} from './prompt'
import {InjectOptions} from '../actions/inject'
import {PackageJson} from '../actions/verify/types'

export interface User {
  name: string
  email?: string
}

export async function getUserInfo(
  {requireUserConfirmation, flags}: InjectOptions,
  pkg?: PackageJson,
): Promise<User | undefined> {
  const userInfo =
    getPackageUserInfo({author: flags.author ?? pkg?.author}) ||
    (await getSanityUserInfo()) ||
    ((await getGitUserInfo()) as User | undefined)
  if (requireUserConfirmation) {
    return promptForInfo(userInfo)
  }

  return userInfo
}

export function getPackageUserInfo(pkg?: {
  author?:
    | string
    | {
        name: string
        email?: string
      }
}): User | undefined {
  let author = pkg?.author
  if (!author) {
    return undefined
  }

  if (author && typeof author !== 'string') {
    return author
  } else if (!author.includes('@')) {
    return {name: author}
  }

  const [pre, ...post] = author.replace(/[<>[\]]/g, '').split(/@/)
  const nameParts = pre.split(/\s+/)
  const email = [nameParts[nameParts.length - 1], ...post].join('@')
  const name = nameParts.slice(0, -1).join(' ')
  return {name, email}
}

async function promptForInfo(defValue?: User) {
  const name = await prompt('Author name', {
    filter: filterString,
    default: defValue && defValue.name,
    validate: requiredString,
  })

  const email = await prompt('Author email', {
    filter: filterString,
    default: defValue && defValue.email,
    validate: validOrEmptyEmail,
  })

  return {name, email}
}

async function getSanityUserInfo(): Promise<User | undefined> {
  try {
    const data = await readJsonFile<{authToken?: string}>(
      path.join(xdgBasedir.config ?? '', 'sanity', 'config.json'),
    )
    const token = data?.authToken

    if (!token) {
      return undefined
    }

    const user = await request({
      url: 'https://api.sanity.io/v1/users/me',
      headers: {Authorization: `Bearer ${token}`},
    })

    if (!user) {
      return undefined
    }

    const {name, email} = user
    return {name, email}
  } catch (err) {
    return undefined
  }
}

async function getGitUserInfo(): Promise<User | undefined> {
  const user = await _getGitUserInfo()
  return user ? {name: user.name, email: user.email} : undefined
}

function filterString(val: string) {
  return (val || '').trim()
}

function requiredString(value: string) {
  return value.length > 1 ? true : 'Required'
}

function validOrEmptyEmail(value: string): true | string {
  if (!value) {
    return true
  }

  return isValidEmail(value) ? true : 'Must either be a valid email or empty'
}

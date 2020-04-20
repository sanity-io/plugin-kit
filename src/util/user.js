const path = require('path')
const xdgBasedir = require('xdg-basedir')
const gitUserInfo = require('git-user-info')
const {validate: isValidEmail} = require('email-validator')
const {readJsonFile} = require('./files')
const {request} = require('./request')
const {prompt} = require('./prompt')

module.exports = {getUserInfo, getPackageUserInfo}

async function getUserInfo({requireUserConfirmation} = {}, pkg) {
  const userInfo =
    getPackageUserInfo(pkg) || (await getSanityUserInfo()) || (await getGitUserInfo())
  return requireUserConfirmation || !userInfo ? promptForInfo(userInfo) : userInfo
}

function getPackageUserInfo(pkg) {
  if (!pkg || !pkg.author) {
    return false
  }

  if (!pkg.author.includes('@')) {
    return {name: pkg.author}
  }

  const [pre, ...post] = pkg.author.replace(/[<>[\]]/g, '').split(/@/)
  const nameParts = pre.split(/\s+/)
  const email = [nameParts[nameParts.length - 1], ...post].join('@')
  const name = nameParts.slice(0, -1).join(' ')
  return {name, email}
}

async function promptForInfo(defValue) {
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

async function getSanityUserInfo() {
  try {
    const data = await readJsonFile(path.join(xdgBasedir.config, 'sanity', 'config.json'))
    const token = data && data.authToken

    if (!token) {
      return null
    }

    const user = await request({
      url: 'https://api.sanity.io/v1/users/me',
      headers: {Authorization: `Bearer ${token}`},
    })

    if (!user) {
      return null
    }

    const {name, email} = user
    return {name, email}
  } catch (err) {
    return null
  }
}

function getGitUserInfo() {
  const user = gitUserInfo()
  return user ? {name: user.name, email: user.email} : null
}

function filterString(val) {
  return (val || '').trim()
}

function requiredString(value) {
  return value.length > 1 ? true : 'Required'
}

function validOrEmptyEmail(value) {
  if (!value) {
    return true
  }

  return isValidEmail(value) ? true : 'Must either be a valid email or empty'
}

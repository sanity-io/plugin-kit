const path = require('path')
const xdgBasedir = require('xdg-basedir')
const gitUserInfo = require('git-user-info')
const {readJsonFile} = require('./files')
const {request} = require('./request')
const {prompt} = require('./prompt')

module.exports = {getUserInfo}

async function getUserInfo() {
  return (await getSanityUserInfo()) || (await getGitUserInfo()) || promptForName()
}

async function promptForName() {
  const name = await prompt('Your name')
  return {name}
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

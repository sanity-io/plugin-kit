const path = require('path')
const inquirer = require('inquirer')
const validNpmName = require('validate-npm-package-name')

module.exports = {prompt, promptForPackageName}

async function prompt(message, options = {}) {
  const type = options.choices ? 'list' : options.type
  const result = await inquirer.prompt([{...options, type, message, name: 'single'}])
  return result && result.single
}

prompt.separator = () => new inquirer.Separator()

function promptForPackageName({basePath}) {
  return prompt('Plugin name (sanity-plugin-...)', {
    default: path.basename(basePath),
    validate: (name) => {
      const valid = validNpmName(name)
      return valid.errors ? valid.errors[0] : true
    },
  })
}

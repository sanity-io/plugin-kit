import React from 'react'
import {Button} from '@sanity/ui'

module.exports = {
  name: 'button',
  title: 'Button',
  type: 'string',
  inputComponent: () => React.createElement(Button, {text: 'Click me'}),
}

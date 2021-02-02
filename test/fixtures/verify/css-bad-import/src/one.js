'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true,
})
exports.default = void 0

var _react = _interopRequireDefault(require('react'))

var _one = _interopRequireDefault(require('./styles/one.css'))

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj}
}

class One extends _react.default.PureComponent {
  render() {
    return /*#__PURE__*/ _react.default.createElement(
      'button',
      {
        className: _one.default.button,
      },
      'Click me'
    )
  }
}

exports.default = One

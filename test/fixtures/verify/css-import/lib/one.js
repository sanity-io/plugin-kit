"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _two = _interopRequireDefault(require("./two"));

var _one = _interopRequireDefault(require("./styles/one.css"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class One extends _react.default.PureComponent {
  componentDidMount() {
    (0, _two.default)();
  }

  render() {
    return /*#__PURE__*/_react.default.createElement("button", {
      className: _one.default.button
    }, 'Click me');
  }

}

exports.default = One;

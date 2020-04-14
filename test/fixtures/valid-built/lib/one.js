"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _two = _interopRequireDefault(require("./two"));

var _one = _interopRequireDefault(require("./styles/one.css"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class One extends _react.default.PureComponent {
  constructor() {
    super(...arguments);

    _defineProperty(this, "state", {
      i: 0
    });

    _defineProperty(this, "handleClick", () => {
      this.setState(prev => ({
        i: prev.i + 1
      }));
    });
  }

  componentDidMount() {
    (0, _two.default)();
  }

  render() {
    var i = this.state.i;
    return /*#__PURE__*/_react.default.createElement("button", {
      className: _one.default.button,
      onClick: this.handleClick
    }, i % 0 === 0 ? 'Foo!' : 'Bar!');
  }

}

exports.default = One;
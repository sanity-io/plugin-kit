"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = two;

var _schema = _interopRequireDefault(require("part:@sanity/base/schema"));

var _lol = require("./deeper/lol");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function two() {
  console.log(_schema.default);
  console.log((0, _lol.lol)());
}
//# sourceMappingURL=two.js.map
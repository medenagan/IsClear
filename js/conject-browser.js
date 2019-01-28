/* conject 0.2.0 | (c) Fabio Mereu | MIT license | https://github.com/medenagan/conject | 2019-01-17T18:32+01:00 */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.conject = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict"; // Differently from Object.assign, this works with getters and setters as well

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var propertyAssign = function propertyAssign(dest, source) {
  for (var key in source) {
    var descriptor = Object.getOwnPropertyDescriptor(source, key);
    Object.defineProperty(dest, key, descriptor);
  }

  return dest;
};

var _default = propertyAssign;
exports.default = _default;
module.exports = exports.default;
},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _evaluation = _interopRequireDefault(require("./evaluation"));

var _condition = _interopRequireDefault(require("./condition"));

var _assign = _interopRequireDefault(require("./assign"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _ = new WeakMap();

var DEBUG_COUNTER = 0; // Colors for console

var FG_GB_RESET = "\x1b[0m";
var FG_BRIGHT = "\x1b[1m";
var FG_DIM = "\x1b[2m";
var FG_UNDERSCORE = "\x1b[4m"; // const FG_BLINK = "\x1b[5m";
// const FG_GB_REVERSE = "\x1b[7m";
// const FG_GB_HIDDEN = "\x1b[8m";
// const FG_BLACK = "\x1b[30m";
// const FG_RED = "\x1b[31m";

var FG_GREEN = "\x1b[32m";
var FG_YELLOW = "\x1b[33m"; // const FG_BLUE = "\x1b[34m";
// const FG_MAGENTA = "\x1b[35m";

var FG_CYAN = "\x1b[36m";
var FG_WHITE = "\x1b[37m"; // const BG_BLACK = "\x1b[40m";

var BG_RED = "\x1b[41m"; // const BG_GREEN = "\x1b[42m";
// const BG_YELLOW = "\x1b[43m";
// const BG_BLUE = "\x1b[44m";
// const BG_MAGENTA = "\x1b[45m";

var BG_CYAN = "\x1b[46m"; // const BG_WHITE = "\x1b[47m";

var CHAINABLE_PROTOTYPE = {
  toString: function toString() {
    return "C" + _.get(this).chain.map(function (link) {
      return ".".concat(link.method.name, "(").concat(link.params.map(String).join(", "), ")");
    }).join("");
  },

  get condition() {
    var _$get = _.get(this),
        chain = _$get.chain;

    return chain.length && chain[chain.length - 1].condition || FALSE;
  },

  toPromise: function toPromise(initialValue) {
    return this.condition.toPromise(initialValue);
  },
  run: function run(initialValue, scope) {
    var evaluation = this.condition.test(initialValue, scope);
    evaluation.on();
    return evaluation;
  },
  debug: function debug(initialValue, scope) {
    var evaluation = this.condition.test(initialValue, scope);
    var handle = "#" + ++DEBUG_COUNTER;
    console.log("".concat(FG_BRIGHT).concat(FG_WHITE).concat(BG_CYAN, "TEST ").concat(handle, " runs").concat(FG_GB_RESET).concat(FG_BRIGHT).concat(FG_CYAN, " C").concat(this.toString()).concat(FG_GB_RESET));
    evaluation.on(function (value) {
      var valueColor = "".concat(FG_BRIGHT).concat(value ? FG_GREEN : FG_YELLOW);
      console.log("TEST ".concat(handle, ": [").concat(valueColor).concat(!!value).concat(FG_GB_RESET, "]").concat(valueColor), value, "".concat(FG_GB_RESET));
    }, function (reason) {
      console.error("".concat(FG_BRIGHT).concat(FG_WHITE).concat(BG_RED, "TEST ").concat(handle, " rejects the evaluation,"), reason, "".concat(FG_GB_RESET));
    });

    if (evaluation.async) {
      console.log("".concat(FG_DIM).concat(FG_UNDERSCORE).concat(FG_YELLOW, "TEST ").concat(handle, " is running asynchronously").concat(FG_GB_RESET));
    } else {
      console.log("".concat(FG_DIM).concat(FG_CYAN, "TEST ").concat(handle, " has run synchronously").concat(FG_GB_RESET));
    }

    return evaluation;
  },

  get _chain() {
    // TODO can be removed
    return _.get(this).chain.map(function (link) {
      return Object.assign({}, link);
    });
  }

};

var _isChainable = function _isChainable(what) {
  return (what = _.get(what)) && _typeof(what) === "object" && Array.isArray(what.chain);
};
/*
  Original approch was to inherit from Function. It works okay with native ES6 engines,
  but if transpiled DON'T work properly (it degenerates into an anonymous function).
  The workaround is to return a function and attach methods on its object.
  CONS: loosing instanceOf Chainable (unless using Symbols)
  PROS: it's extremely faster

  class Chainable extends Function {
    constructor(source) {
      super("return arguments.callee.run.apply(arguments.callee, arguments);");
      ...
    }
    ...
  }
*/


var Chainable
/* extends Function */
= function Chainable(source) {
  _classCallCheck(this, Chainable);

  var ChainableInstance = function ChainableInstance() {
    return ChainableInstance.run.apply(ChainableInstance, arguments);
  };

  var chain = _isChainable(source) ? _.get(source).chain.slice() : [];

  _.set(ChainableInstance, {
    chain: chain
  });

  return (0, _assign.default)(ChainableInstance, CHAINABLE_PROTOTYPE);
};

Chainable.isChainable = _isChainable;
var matryoshkingMethods = [{
  starter: true,
  name: "if",
  //      constructor: SequentialAnd, // .if(c0).if(c1) === if(c0).and(c1)
  compile: function compile(root) {
    if ((arguments.length <= 1 ? 0 : arguments.length - 1) !== 1) throw new Error(".if accepts only one Condition as parameter");
    if (root) throw new Error(".if can be used only as first method in the chain. Use .and, .or, ... instead");
    return fromAny(arguments.length <= 1 ? undefined : arguments[1]);
  }
}].concat(_toConsumableArray(
/* .fx(c0, c1, ...) with Conditions only */
[{
  starter: true,
  name: "and",
  constructor: _condition.default.SequentialAnd
}, {
  starter: true,
  name: "or",
  constructor: _condition.default.SequentialOr
}, {
  starter: true,
  name: "xor",
  constructor: _condition.default.SequentialXor
}, {
  starter: true,
  name: "nor",
  constructor: _condition.default.SequentialNor
}, {
  starter: true,
  name: "nand",
  constructor: _condition.default.SequentialNand
}, {
  starter: true,
  name: "xnor",
  constructor: _condition.default.SequentialXnor
}, {
  starter: true,
  name: "anda",
  constructor: _condition.default.ParallelAnd
}, {
  starter: true,
  name: "ora",
  constructor: _condition.default.ParallelOr
}, {
  starter: true,
  name: "xora",
  constructor: _condition.default.ParallelXor
}, {
  starter: true,
  name: "nora",
  constructor: _condition.default.ParallelNor
}, {
  starter: true,
  name: "nanda",
  constructor: _condition.default.ParallelNand
}, {
  starter: true,
  name: "xnora",
  constructor: _condition.default.ParallelXnor
}].map(function (method) {
  return Object.assign(method, {
    compile: function compile(root) {
      for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        params[_key - 1] = arguments[_key];
      }

      if (params.length - !root < 1) throw new Error(".".concat(method.name, "() needs two or more Condition operands"));
      var parsed = params.map(fromAny);
      if (root) parsed.unshift(root);
      return _construct(method.constructor, _toConsumableArray(parsed));
    }
  });
})), _toConsumableArray(
/* .fx() with zero parameters */
[{
  name: "not",
  constructor: _condition.default.NegativeCondition
}, {
  name: "bool",
  constructor: _condition.default.BooleanCondition
}].map(function (method) {
  return Object.assign(method, {
    compile: function compile(root) {
      if (arguments.length <= 1 ? 0 : arguments.length - 1) throw new Error(".".concat(method.name, "() doesn't need any parameter"));
      return new method.constructor(root);
    }
  });
})), _toConsumableArray(
/* .fx(single_parameter) */
[{
  name: "in",
  constructor: _condition.default.DelayedCondition
}, {
  name: "out",
  constructor: _condition.default.TimeoutCondition
}, {
  name: "during",
  constructor: _condition.default.DurableCondition
}, {
  name: "atmost",
  constructor: _condition.default.CycleCondition
}].map(function (method) {
  return Object.assign(method, {
    compile: function compile(root) {
      return new method.constructor(root, arguments.length <= 1 ? undefined : arguments[1]);
    }
  });
})), [{
  name: "throw",
  starter: true,
  compile: function compile(root) {
    var error = new _condition.default.ErrorCondition(arguments.length <= 1 ? undefined : arguments[1]);
    return root ? new _condition.default.SequentialLink(root, error) : error;
  }
}], _toConsumableArray(
/* .onevent(fn | arg0) */
[{
  name: "onTrue",
  constructor: _condition.default.TrueEventCondition,
  defaultHandler: console.log
}, {
  name: "onFalse",
  constructor: _condition.default.FalseEventCondition,
  defaultHandler: console.warn
}, {
  name: "onError",
  constructor: _condition.default.ErrorEventCondition,
  defaultHandler: console.error
}].map(function (method) {
  return Object.assign(method, {
    compile: function compile(root) {
      var _method$defaultHandle;

      for (var _len2 = arguments.length, params = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        params[_key2 - 1] = arguments[_key2];
      }

      return new method.constructor(root, typeof params[0] === "function" ? params[0] : (_method$defaultHandle = method.defaultHandler).bind.apply(_method$defaultHandle, [null].concat(params)));
    }
  });
})));
matryoshkingMethods.forEach(function (method) {
  var name = method.name,
      compile = method.compile,
      starter = method.starter;

  CHAINABLE_PROTOTYPE[name] = function () {
    for (var _len3 = arguments.length, params = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      params[_key3] = arguments[_key3];
    }

    // Push a new condition into the chain.
    var clone = new Chainable(this);

    var _$get2 = _.get(clone),
        chain = _$get2.chain; // root is the most external Condition


    var root = chain.length && chain[chain.length - 1].condition;
    if (!root && !starter) throw new Error(".".concat(name, "() cannot be a first condition"));
    var condition = compile.apply(void 0, [root].concat(params));
    chain.push({
      method: method,
      params: params,
      condition: condition
    });
    return clone;
  };
});

var fromValue = function fromValue(value) {
  return new _condition.default.StaticCondition(value);
};

var fromFunction = function fromFunction(fn) {
  return new _condition.default.FunctionalCondition(fn);
};

var fromPromise = function fromPromise(promise) {
  return new _condition.default.PromiseCondition(promise);
};

var fromAny = function fromAny(any) {
  if (any instanceof _condition.default.Condition) {
    return any;
  } else if (_isChainable(any)) {
    return any.condition;
  } else if (any instanceof Promise) {
    return new _condition.default.PromiseCondition(any);
  } else if (typeof any === "function") {
    return new _condition.default.FunctionalCondition(any);
  } else {
    return new _condition.default.StaticCondition(any);
  }
}; // Help construct a new Condition


var conditionFrom = {
  fromValue: fromValue,
  fromFunction: fromFunction,
  fromPromise: fromPromise,
  fromAny: fromAny
}; // Help construct a new Chainable object from .if, .and, ...
// C.if: (...params) => (new Chainable()).if(...params)

var C = {};
matryoshkingMethods.filter(function (method) {
  return method.starter;
}).forEach(function (method) {
  return C[method.name] = function () {
    var _ref;

    return (_ref = new Chainable())[method.name].apply(_ref, arguments);
  };
});
var _default = {
  Chainable: Chainable,
  C: C,
  conditionFrom: conditionFrom
};
exports.default = _default;
module.exports = exports.default;
},{"./assign":1,"./condition":3,"./evaluation":5}],3:[function(require,module,exports){
(function (process){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _evaluation = _interopRequireDefault(require("./evaluation"));

var _scope = _interopRequireDefault(require("./scope"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var _ = new WeakMap();

var MAX_TIMEOUT = 1e17; // Node / Browser timing function

var now = (typeof process === "undefined" ? "undefined" : _typeof(process)) === "object" && typeof process.hrtime === "function" ? function (a, b) {
  var _process$hrtime, _process$hrtime2;

  return (_process$hrtime = process.hrtime(), _process$hrtime2 = _slicedToArray(_process$hrtime, 2), a = _process$hrtime2[0], b = _process$hrtime2[1], _process$hrtime), a * 1e3 + b * 1e-6;
} : (typeof performance === "undefined" ? "undefined" : _typeof(performance)) === "object" && typeof performance.now === "function" ? performance.now.bind(performance) : Date.now; // Base class

var Condition =
/*#__PURE__*/
function () {
  function Condition() {
    var members = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Condition);

    _.set(this, Object.assign({}, members));
  }

  _createClass(Condition, [{
    key: "test",
    value: function test() {
      return _evaluation.default.reject(new Error(this.constructor.name + ".test() must be implemented on a derived class"));
    }
  }, {
    key: "toPromise",
    value: function toPromise(initialValue) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        return _this.test(initialValue).on(resolve, reject);
      });
    }
  }]);

  return Condition;
}();

var StaticCondition =
/*#__PURE__*/
function (_Condition) {
  _inherits(StaticCondition, _Condition);

  function StaticCondition(value) {
    _classCallCheck(this, StaticCondition);

    return _possibleConstructorReturn(this, _getPrototypeOf(StaticCondition).call(this, {
      value: value
    }));
  }

  _createClass(StaticCondition, [{
    key: "test",
    value: function test() {
      return _evaluation.default.resolve(_.get(this).value);
    }
  }, {
    key: "toString",
    value: function toString() {
      var _$get = _.get(this),
          value = _$get.value;

      return typeof value === "string" ? "(\"".concat(value, "\")") : "(".concat(String(value), ")");
    }
  }, {
    key: "value",
    get: function get() {
      return _.get(this).value;
    }
  }]);

  return StaticCondition;
}(Condition);

var TrueCondition =
/*#__PURE__*/
function (_StaticCondition) {
  _inherits(TrueCondition, _StaticCondition);

  function TrueCondition() {
    var _this2;

    _classCallCheck(this, TrueCondition);

    if (_.has(TrueCondition)) return _possibleConstructorReturn(_this2, _.get(TrueCondition));
    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(TrueCondition).call(this, true));

    _.set(TrueCondition, _assertThisInitialized(_assertThisInitialized(_this2)));

    return _this2;
  }

  return TrueCondition;
}(StaticCondition);

var FalseCondition =
/*#__PURE__*/
function (_StaticCondition2) {
  _inherits(FalseCondition, _StaticCondition2);

  function FalseCondition() {
    var _this3;

    _classCallCheck(this, FalseCondition);

    if (_.has(FalseCondition)) return _possibleConstructorReturn(_this3, _.get(FalseCondition));
    _this3 = _possibleConstructorReturn(this, _getPrototypeOf(FalseCondition).call(this, false));

    _.set(FalseCondition, _assertThisInitialized(_assertThisInitialized(_this3)));

    return _this3;
  }

  return FalseCondition;
}(StaticCondition);

var TRUE = new TrueCondition();
var FALSE = new FalseCondition(); // Useful for debug

var ErrorCondition =
/*#__PURE__*/
function (_Condition2) {
  _inherits(ErrorCondition, _Condition2);

  function ErrorCondition(reason) {
    _classCallCheck(this, ErrorCondition);

    return _possibleConstructorReturn(this, _getPrototypeOf(ErrorCondition).call(this, {
      reason: reason
    }));
  }

  _createClass(ErrorCondition, [{
    key: "test",
    value: function test() {
      return _evaluation.default.reject(_.get(this).reason);
    }
  }, {
    key: "toString",
    value: function toString() {
      return "(throw " + String(_.get(this).reason) + ")";
    }
  }, {
    key: "reason",
    get: function get() {
      return _.get(this).reason;
    }
  }]);

  return ErrorCondition;
}(Condition); // A never-resolving condition


var EternalCondition =
/*#__PURE__*/
function (_Condition3) {
  _inherits(EternalCondition, _Condition3);

  function EternalCondition() {
    _classCallCheck(this, EternalCondition);

    return _possibleConstructorReturn(this, _getPrototypeOf(EternalCondition).apply(this, arguments));
  }

  _createClass(EternalCondition, [{
    key: "test",
    value: function test() {
      return new _evaluation.default(function () {
        return undefined;
      });
    }
  }, {
    key: "toString",
    value: function toString() {
      return "(∞)";
    }
  }]);

  return EternalCondition;
}(Condition); // A function that either:
// returns a value (behave as StaticCondition)
// throws an error (behave as ErrorCondition)
// returns a Promise (behave as PromiseCondition)
// returns either a Condition/Chainable object (resolve recursively)


var FunctionalCondition =
/*#__PURE__*/
function (_Condition4) {
  _inherits(FunctionalCondition, _Condition4);

  function FunctionalCondition(fn) {
    var _this4;

    _classCallCheck(this, FunctionalCondition);

    _this4 = _possibleConstructorReturn(this, _getPrototypeOf(FunctionalCondition).call(this, {
      fn: fn
    }));
    if (typeof fn !== "function") throw new Error(_this4.constructor.name + " must be constructed from a function");
    return _this4;
  }

  _createClass(FunctionalCondition, [{
    key: "test",
    value: function test(initialValue, initialScope) {
      var _$get2 = _.get(this),
          fn = _$get2.fn;

      var scope = new _scope.default(initialScope);
      return new _evaluation.default(function (resolve, reject) {
        try {
          var result = fn.call(null, initialValue, scope.getChildContext()); // if (isChainable(result))  {

          if (typeof result === "function" && result.condition instanceof Condition) {
            result.condition.test(initialValue).on(resolve, reject);
          } else if (result instanceof Condition) {
            result.test(initialValue, scope).on(resolve, reject);
          } else if (result instanceof Promise) {
            new PromiseCondition(result).test(initialValue, scope).on(resolve, reject);
          } else {
            resolve(result);
          }
        } catch (e) {
          reject(e);
        }
      });
    }
  }, {
    key: "toString",
    value: function toString() {
      var _$get3 = _.get(this),
          fn = _$get3.fn;

      return "ƒ(" + String(fn) + ")";
    }
  }, {
    key: "fn",
    get: function get() {
      return _.get(this).fn;
    }
  }]);

  return FunctionalCondition;
}(Condition);

var PromiseCondition =
/*#__PURE__*/
function (_Condition5) {
  _inherits(PromiseCondition, _Condition5);

  function PromiseCondition(promise) {
    var _this5;

    _classCallCheck(this, PromiseCondition);

    _this5 = _possibleConstructorReturn(this, _getPrototypeOf(PromiseCondition).call(this, {
      promise: promise
    }));
    if (!(promise instanceof Promise)) throw new Error(_this5.constructor.name + " must be constructed from a Promise");
    return _this5;
  }

  _createClass(PromiseCondition, [{
    key: "test",
    value: function test() {
      var _this6 = this;

      return new _evaluation.default(function (resolve, reject) {
        return _.get(_this6).promise.then(resolve, reject);
      });
    }
  }, {
    key: "toString",
    value: function toString() {
      return "(" + String(_.get(this).promise) + ")";
    }
  }, {
    key: "promise",
    get: function get() {
      return _.get(this).promise;
    }
  }]);

  return PromiseCondition;
}(Condition); // Base class for MultyProxy


var ConditionList =
/*#__PURE__*/
function (_Condition6) {
  _inherits(ConditionList, _Condition6);

  function ConditionList() {
    var _this7;

    for (var _len = arguments.length, conditions = new Array(_len), _key = 0; _key < _len; _key++) {
      conditions[_key] = arguments[_key];
    }

    _classCallCheck(this, ConditionList);

    _this7 = _possibleConstructorReturn(this, _getPrototypeOf(ConditionList).call(this, {
      conditions: conditions
    }));
    if (conditions.some(function (condition) {
      return !(condition instanceof Condition);
    })) throw new Error(_this7.constructor.name + " must be constructed from Condition objects only");
    if (conditions.length < 2) throw new Error(_this7.constructor.name + " must be constructed from at least two Condition objects");
    return _this7;
  }

  _createClass(ConditionList, [{
    key: "toString",
    value: function toString() {
      return "[" + _.get(this).conditions.map(String).join() + "]";
    }
  }, {
    key: "conditions",
    get: function get() {
      return _.get(this).conditions.slice();
    }
  }, {
    key: "length",
    get: function get() {
      return _.get(this).conditions.length;
    }
  }]);

  return ConditionList;
}(Condition); // MixIn


var Sequential = function Sequential(operator) {
  return (
    /*#__PURE__*/
    function (_ConditionList) {
      _inherits(_class, _ConditionList);

      function _class() {
        _classCallCheck(this, _class);

        return _possibleConstructorReturn(this, _getPrototypeOf(_class).apply(this, arguments));
      }

      _createClass(_class, [{
        key: "test",
        value: function test(initialValue, initialScope) {
          var scope = new _scope.default(initialScope);

          var _$get4 = _.get(this),
              conditions = _$get4.conditions;

          var aborted, subEvaluation;

          var resolver = function resolver(resolve, reject) {
            var result;

            var testOne = function testOne() {
              var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
              if (aborted) return;

              if (index >= conditions.length) {
                resolve(result);
                return;
              }

              subEvaluation = conditions[index].test(index ? result : initialValue, scope);
              subEvaluation.on(function (value) {
                var ref = {
                  value: value,
                  isFirst: !index,
                  isLast: index + 1 >= conditions.length,
                  result: result,
                  shouldBreak: false
                };

                try {
                  operator.call(null, ref);
                  result = ref.result;
                } catch (reason) {
                  reject(reason);
                  return;
                }

                testOne(ref.shouldBreak ? Infinity : ++index);
              }, reject);
            };

            testOne(0);
          };

          return new _evaluation.default(resolver, function () {
            aborted = true;
            if (subEvaluation) subEvaluation.abort();
          });
        }
      }, {
        key: "toString",
        value: function toString() {
          return "[" + _.get(this).conditions.map(String).join(operator.name) + "]";
        }
      }]);

      return _class;
    }(ConditionList)
  );
}; // MixIn


var Parallel = function Parallel(operator) {
  return (
    /*#__PURE__*/
    function (_ConditionList2) {
      _inherits(_class2, _ConditionList2);

      function _class2() {
        _classCallCheck(this, _class2);

        return _possibleConstructorReturn(this, _getPrototypeOf(_class2).apply(this, arguments));
      }

      _createClass(_class2, [{
        key: "test",
        value: function test(initialValue, initialScope) {
          var _$get5 = _.get(this),
              conditions = _$get5.conditions;

          var length = conditions.length;
          var scope = new _scope.default(initialScope);
          var aborted, subEvaluations;

          var aborter = function aborter() {
            aborted = true;
            if (subEvaluations) subEvaluations.forEach(function (subEvaluation) {
              return subEvaluation.abort();
            });
          };

          var resolver = function resolver(resolve, reject) {
            var result, done;
            var executed = 0;

            var shouldResolve = function shouldResolve() {
              if (done || aborted) return;
              resolve(result);
              done = true;
            };

            var shouldReject = function shouldReject(reason) {
              if (done || aborted) return;
              reject(reason);
              done = true;
            };

            var onResolvedOne = function onResolvedOne(value) {
              var isFirst = !executed;
              var isLast = ++executed >= length;
              var ref = {
                value: value,
                isFirst: isFirst,
                isLast: isLast,
                result: result,
                shouldBreak: false
              };

              try {
                operator.call(null, ref);
                result = ref.result;
                if (ref.shouldBreak || isLast) shouldResolve();
              } catch (reason) {
                shouldReject(reason);
              }
            };

            subEvaluations = conditions.map(function (condition) {
              var subEvaluation = condition.test(initialValue, scope.fork());
              subEvaluation.ona(onResolvedOne, shouldReject);
              return subEvaluation;
            });
          };

          return new _evaluation.default(resolver, aborter);
        }
      }, {
        key: "toString",
        value: function toString() {
          return "[" + _.get(this).conditions.map(String).join("⋕" + operator.name + "⋕") + "]";
        }
      }]);

      return _class2;
    }(ConditionList)
  );
};
/*  OPERATORS:
    +  must be SYNCHRONOUS
    +  op({result, value, isFirst, isLast, shouldBreak}) {...}
    +  isFirst, isLast: is not related to index (in parallel mode, in sequential coincides)
    +  if shouldBreak is set true, testing sequence is interrupted.
    +  in case it throws an error, .test() returns a rejected Evaluation */


var OR = function OR(r) {
  r.result = r.result || r.value;
  r.shouldBreak = r.result;
};

var AND = function AND(r) {
  r.result = r.isFirst ? r.value : r.result && r.value;
  r.shouldBreak = !r.result;
};

var NOR = function NOR(r) {
  r.result = r.isFirst ? !r.value : r.result && !r.value;
  r.shouldBreak = r.value;
};

var NAND = function NAND(r) {
  r.result = r.result || !r.value;
  r.shouldBreak = r.result;
};

var XOR = function XOR(r) {
  r.result = r.isFirst ? r.value : !r.result && r.value || !r.value && r.result;
};

var XNOR = function XNOR(r) {
  r.result = r.isFirst ? r.value : !r.result && !r.value || r.result && r.value;
};

var LINK = function LINK(r) {
  r.result = r.value;
};

var SequentialOr =
/*#__PURE__*/
function (_Sequential) {
  _inherits(SequentialOr, _Sequential);

  function SequentialOr() {
    _classCallCheck(this, SequentialOr);

    return _possibleConstructorReturn(this, _getPrototypeOf(SequentialOr).apply(this, arguments));
  }

  return SequentialOr;
}(Sequential(OR));

var SequentialAnd =
/*#__PURE__*/
function (_Sequential2) {
  _inherits(SequentialAnd, _Sequential2);

  function SequentialAnd() {
    _classCallCheck(this, SequentialAnd);

    return _possibleConstructorReturn(this, _getPrototypeOf(SequentialAnd).apply(this, arguments));
  }

  return SequentialAnd;
}(Sequential(AND));

var SequentialNor =
/*#__PURE__*/
function (_Sequential3) {
  _inherits(SequentialNor, _Sequential3);

  function SequentialNor() {
    _classCallCheck(this, SequentialNor);

    return _possibleConstructorReturn(this, _getPrototypeOf(SequentialNor).apply(this, arguments));
  }

  return SequentialNor;
}(Sequential(NOR));

var SequentialNand =
/*#__PURE__*/
function (_Sequential4) {
  _inherits(SequentialNand, _Sequential4);

  function SequentialNand() {
    _classCallCheck(this, SequentialNand);

    return _possibleConstructorReturn(this, _getPrototypeOf(SequentialNand).apply(this, arguments));
  }

  return SequentialNand;
}(Sequential(NAND));

var SequentialXor =
/*#__PURE__*/
function (_Sequential5) {
  _inherits(SequentialXor, _Sequential5);

  function SequentialXor() {
    _classCallCheck(this, SequentialXor);

    return _possibleConstructorReturn(this, _getPrototypeOf(SequentialXor).apply(this, arguments));
  }

  return SequentialXor;
}(Sequential(XOR));

var SequentialXnor =
/*#__PURE__*/
function (_Sequential6) {
  _inherits(SequentialXnor, _Sequential6);

  function SequentialXnor() {
    _classCallCheck(this, SequentialXnor);

    return _possibleConstructorReturn(this, _getPrototypeOf(SequentialXnor).apply(this, arguments));
  }

  return SequentialXnor;
}(Sequential(XNOR));

var SequentialLink =
/*#__PURE__*/
function (_Sequential7) {
  _inherits(SequentialLink, _Sequential7);

  function SequentialLink() {
    _classCallCheck(this, SequentialLink);

    return _possibleConstructorReturn(this, _getPrototypeOf(SequentialLink).apply(this, arguments));
  }

  return SequentialLink;
}(Sequential(LINK));

var ParallelOr =
/*#__PURE__*/
function (_Parallel) {
  _inherits(ParallelOr, _Parallel);

  function ParallelOr() {
    _classCallCheck(this, ParallelOr);

    return _possibleConstructorReturn(this, _getPrototypeOf(ParallelOr).apply(this, arguments));
  }

  return ParallelOr;
}(Parallel(OR));

var ParallelAnd =
/*#__PURE__*/
function (_Parallel2) {
  _inherits(ParallelAnd, _Parallel2);

  function ParallelAnd() {
    _classCallCheck(this, ParallelAnd);

    return _possibleConstructorReturn(this, _getPrototypeOf(ParallelAnd).apply(this, arguments));
  }

  return ParallelAnd;
}(Parallel(AND));

var ParallelNor =
/*#__PURE__*/
function (_Parallel3) {
  _inherits(ParallelNor, _Parallel3);

  function ParallelNor() {
    _classCallCheck(this, ParallelNor);

    return _possibleConstructorReturn(this, _getPrototypeOf(ParallelNor).apply(this, arguments));
  }

  return ParallelNor;
}(Parallel(NOR));

var ParallelNand =
/*#__PURE__*/
function (_Parallel4) {
  _inherits(ParallelNand, _Parallel4);

  function ParallelNand() {
    _classCallCheck(this, ParallelNand);

    return _possibleConstructorReturn(this, _getPrototypeOf(ParallelNand).apply(this, arguments));
  }

  return ParallelNand;
}(Parallel(NAND));

var ParallelXor =
/*#__PURE__*/
function (_Parallel5) {
  _inherits(ParallelXor, _Parallel5);

  function ParallelXor() {
    _classCallCheck(this, ParallelXor);

    return _possibleConstructorReturn(this, _getPrototypeOf(ParallelXor).apply(this, arguments));
  }

  return ParallelXor;
}(Parallel(XOR));

var ParallelXnor =
/*#__PURE__*/
function (_Parallel6) {
  _inherits(ParallelXnor, _Parallel6);

  function ParallelXnor() {
    _classCallCheck(this, ParallelXnor);

    return _possibleConstructorReturn(this, _getPrototypeOf(ParallelXnor).apply(this, arguments));
  }

  return ParallelXnor;
}(Parallel(XNOR));

var ParallelLink =
/*#__PURE__*/
function (_Parallel7) {
  _inherits(ParallelLink, _Parallel7);

  function ParallelLink() {
    _classCallCheck(this, ParallelLink);

    return _possibleConstructorReturn(this, _getPrototypeOf(ParallelLink).apply(this, arguments));
  }

  return ParallelLink;
}(Parallel(LINK)); // A base for single Condition Proxy


var UnaryProxyCondition =
/*#__PURE__*/
function (_Condition7) {
  _inherits(UnaryProxyCondition, _Condition7);

  function UnaryProxyCondition(source) {
    var _this8;

    var members = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, UnaryProxyCondition);

    _this8 = _possibleConstructorReturn(this, _getPrototypeOf(UnaryProxyCondition).call(this, Object.assign({}, members, {
      source: source
    })));
    if (!(source instanceof Condition)) throw new Error(_this8.constructor.name + " must be constructed from a Condition object");
    return _this8;
  }

  _createClass(UnaryProxyCondition, [{
    key: "toString",
    value: function toString() {
      return "(Proxy: " + _.get(this).source.toString() + ")";
    } // test () {...} should be overriden by subclass

  }, {
    key: "source",
    get: function get() {
      return _.get(this).source;
    }
  }]);

  return UnaryProxyCondition;
}(Condition);

var DelayedCondition =
/*#__PURE__*/
function (_UnaryProxyCondition) {
  _inherits(DelayedCondition, _UnaryProxyCondition);

  function DelayedCondition(source) {
    var _this9;

    var delay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    _classCallCheck(this, DelayedCondition);

    _this9 = _possibleConstructorReturn(this, _getPrototypeOf(DelayedCondition).call(this, source));
    delay = +delay;
    if (Number.isNaN(delay)) throw new Error(_this9.constructor.name + "(..., delay) requires a numeric value or it can be omitted");
    if (delay < 0) delay = 0;
    if (delay > MAX_TIMEOUT) return _possibleConstructorReturn(_this9, new EternalCondition());
    _.get(_assertThisInitialized(_assertThisInitialized(_this9))).delay = delay;
    return _this9;
  }

  _createClass(DelayedCondition, [{
    key: "test",
    value: function test() {
      for (var _len2 = arguments.length, params = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        params[_key2] = arguments[_key2];
      }

      var _$get6 = _.get(this),
          source = _$get6.source,
          delay = _$get6.delay;

      var handle, subEvaluation;
      return new _evaluation.default(function (resolve, reject) {
        return handle = setTimeout(function () {
          handle = null;
          subEvaluation = source.test.apply(source, params);
          subEvaluation.on(resolve, reject);
        }, delay);
      }, function () {
        /* aborter */
        if (handle) {
          clearTimeout(handle);
          handle = null;
        }

        if (subEvaluation) subEvaluation.abort();
      });
    }
  }, {
    key: "toString",
    value: function toString() {
      var _$get7 = _.get(this),
          source = _$get7.source,
          delay = _$get7.delay;

      return "{".concat(delay, "ms\u2197").concat(source.toString(), "}");
    }
  }, {
    key: "delay",
    get: function get() {
      return _.get(this).delay;
    }
  }]);

  return DelayedCondition;
}(UnaryProxyCondition);

var DurableCondition =
/*#__PURE__*/
function (_UnaryProxyCondition2) {
  _inherits(DurableCondition, _UnaryProxyCondition2);

  function DurableCondition(source) {
    var _this10;

    var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    _classCallCheck(this, DurableCondition);

    _this10 = _possibleConstructorReturn(this, _getPrototypeOf(DurableCondition).call(this, source));
    duration = +duration;
    if (Number.isNaN(duration)) throw new Error(_this10.constructor.name + " expects a numeric duration or it can be omitted");
    if (duration < 0) return _possibleConstructorReturn(_this10, FALSE);
    if (!duration) return _possibleConstructorReturn(_this10, source);
    if (duration > MAX_TIMEOUT) duration = +Infinity;
    _.get(_assertThisInitialized(_assertThisInitialized(_this10))).duration = duration;
    return _this10;
  }

  _createClass(DurableCondition, [{
    key: "test",
    value: function test(initialValue, initialScope) {
      var _$get8 = _.get(this),
          source = _$get8.source,
          duration = _$get8.duration;

      var scope = new _scope.default(initialScope);
      var commit = scope.commit();
      var t0 = now();
      var aborted;
      var subEvaluation;
      return new _evaluation.default(function (resolve, reject) {
        var attempt = function attempt() {
          subEvaluation = source.test(initialValue, scope.checkout(commit));
          subEvaluation.on(function (value) {
            if (aborted) return;else if (!value || now() - t0 >= duration) {
              resolve(value);
              scope.deleteCommit(commit);
            } else {
              setTimeout(attempt, 0); // Average: 4.318518785088027
              // Promise.resolve({then: attempt}); // Average: 0.007504767491017662
            }
          }, reject); // FIXME
        };

        attempt();
      }, function () {
        /* aborter */
        aborted = true;
        if (subEvaluation) subEvaluation.abort();
        commit.deleteCommit(commit);
      });
    }
  }, {
    key: "toString",
    value: function toString() {
      return _.get(this).source.toString();
    }
  }, {
    key: "duration",
    get: function get() {
      return _.get(this).duration;
    }
  }]);

  return DurableCondition;
}(UnaryProxyCondition);

var TimeoutCondition =
/*#__PURE__*/
function (_UnaryProxyCondition3) {
  _inherits(TimeoutCondition, _UnaryProxyCondition3);

  function TimeoutCondition(source) {
    var _this11;

    var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Infinity;

    _classCallCheck(this, TimeoutCondition);

    _this11 = _possibleConstructorReturn(this, _getPrototypeOf(TimeoutCondition).call(this, source));
    duration = +duration;
    if (Number.isNaN(duration)) throw new Error(_this11.constructor.name + " expects a numeric duration or it can be omitted");
    if (duration > MAX_TIMEOUT) return _possibleConstructorReturn(_this11, source);
    if (duration <= 0) return _possibleConstructorReturn(_this11, FALSE);
    _.get(_assertThisInitialized(_assertThisInitialized(_this11))).duration = duration;
    return _this11;
  }

  _createClass(TimeoutCondition, [{
    key: "test",
    value: function test() {
      for (var _len3 = arguments.length, params = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        params[_key3] = arguments[_key3];
      }

      var _$get9 = _.get(this),
          source = _$get9.source,
          duration = _$get9.duration;

      var done, handle, subEvaluation;

      var clear = function clear() {
        if (!handle) return;
        clearTimeout(handle);
        handle = null;
      };

      var aborter = function aborter() {
        done = true;
        clear();
        if (subEvaluation) subEvaluation.abort();
      };

      var resolver = function resolver(resolve, reject) {
        var shouldReject = function shouldReject(reason) {
          if (done) return;
          done = true;
          clear();
          reject(reason);
        };

        var shouldResolve = function shouldResolve(value) {
          if (done) return;
          done = true;
          clear();
          resolve(value);
        };

        subEvaluation = source.test.apply(source, params);
        handle = setTimeout(function () {
          handle = null;
          shouldResolve(false);
          subEvaluation.abort();
        }, duration);
        subEvaluation.ona(shouldResolve, shouldReject);
      };

      return new _evaluation.default(resolver, aborter);
    }
  }, {
    key: "toString",
    value: function toString() {
      return _.get(this).source.toString();
    }
  }, {
    key: "duration",
    get: function get() {
      return _.get(this).duration;
    }
  }]);

  return TimeoutCondition;
}(UnaryProxyCondition); // Try to confirm the conjecture by repeating test
// on the condition until it results true


var CycleCondition =
/*#__PURE__*/
function (_UnaryProxyCondition4) {
  _inherits(CycleCondition, _UnaryProxyCondition4);

  function CycleCondition(source) {
    var _this12;

    var attempts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

    _classCallCheck(this, CycleCondition);

    _this12 = _possibleConstructorReturn(this, _getPrototypeOf(CycleCondition).call(this, source));
    attempts = +attempts;
    if (Number.isNaN(attempts)) throw new Error(_this12.constructor.name + " requires an integer for attempts or it can be omitted");
    if (attempts < 1) return _possibleConstructorReturn(_this12, FALSE);
    attempts = Math.floor(attempts);
    _.get(_assertThisInitialized(_assertThisInitialized(_this12))).attempts = attempts;
    return _this12;
  }

  _createClass(CycleCondition, [{
    key: "test",
    value: function test(initialValue, initialScope) {
      var _$get10 = _.get(this),
          source = _$get10.source,
          attempts = _$get10.attempts;

      var scope = new _scope.default(initialScope);
      var commit = scope.commit();
      var subEvaluation;
      var aborted;
      var countdown = attempts;

      var aborter = function aborter() {
        aborted = true;
        if (subEvaluation) subEvaluation.abort();
        scope.deleteCommit(commit);
      };

      var resolver = function resolver(resolve, reject) {
        var attempt = function attempt() {
          if (aborted) return;
          subEvaluation = source.test(initialValue, scope.checkout(commit));
          subEvaluation.on(function (value) {
            if (aborted) return;else if (value || --countdown < 1) {
              resolve(value);
              scope.deleteCommit(commit);
            } else {
              setTimeout(attempt, 0);
            }
          }, reject);
        };

        attempt();
      };

      return new _evaluation.default(resolver, aborter);
    }
  }, {
    key: "attempts",
    get: function get() {
      return _.get(this).attempts;
    }
  }]);

  return CycleCondition;
}(UnaryProxyCondition); // Resolves in !value


var NegativeCondition =
/*#__PURE__*/
function (_UnaryProxyCondition5) {
  _inherits(NegativeCondition, _UnaryProxyCondition5);

  function NegativeCondition(source) {
    var _this13;

    _classCallCheck(this, NegativeCondition);

    _this13 = _possibleConstructorReturn(this, _getPrototypeOf(NegativeCondition).call(this, source)); // (!(! x)) => Bool(x)

    if (source instanceof NegativeCondition) return _possibleConstructorReturn(_this13, new BooleanCondition(source.source)); // (!(Bool(x)) => (!x)

    if (source instanceof BooleanCondition) return _possibleConstructorReturn(_this13, new NegativeCondition(source.source));
    return _this13;
  }

  _createClass(NegativeCondition, [{
    key: "test",
    value: function test() {
      for (var _len4 = arguments.length, params = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        params[_key4] = arguments[_key4];
      }

      var _$get11 = _.get(this),
          source = _$get11.source;

      var subEvaluation;
      return new _evaluation.default(function (resolve, reject) {
        subEvaluation = source.test.apply(source, params);
        subEvaluation.on(function (result) {
          return resolve(!result);
        }, reject);
      }, function () {
        return subEvaluation && subEvaluation.abort();
      });
    }
  }, {
    key: "toString",
    value: function toString() {
      return "!" + _.get(this).source.toString();
    }
  }]);

  return NegativeCondition;
}(UnaryProxyCondition); // Resolves in !!value or Boolean(value)


var BooleanCondition =
/*#__PURE__*/
function (_UnaryProxyCondition6) {
  _inherits(BooleanCondition, _UnaryProxyCondition6);

  function BooleanCondition(source) {
    var _this14;

    _classCallCheck(this, BooleanCondition);

    _this14 = _possibleConstructorReturn(this, _getPrototypeOf(BooleanCondition).call(this, source)); // Boolean(Boolean(x)) = Boolean(x);  Boolean(!(x)) = !(x)

    if (source instanceof BooleanCondition || source instanceof NegativeCondition) return _possibleConstructorReturn(_this14, source);
    return _this14;
  }

  _createClass(BooleanCondition, [{
    key: "test",
    value: function test() {
      for (var _len5 = arguments.length, params = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        params[_key5] = arguments[_key5];
      }

      var _$get12 = _.get(this),
          source = _$get12.source;

      var subEvaluation;
      return new _evaluation.default(function (resolve, reject) {
        subEvaluation = source.test.apply(source, params);
        subEvaluation.on(function (result) {
          return resolve(!!result);
        }, reject);
      }, function () {
        return subEvaluation && subEvaluation.abort();
      });
    }
  }, {
    key: "toString",
    value: function toString() {
      return "Boolean" + _.get(this).source.toString();
    }
  }]);

  return BooleanCondition;
}(UnaryProxyCondition);

var EventCondition =
/*#__PURE__*/
function (_UnaryProxyCondition7) {
  _inherits(EventCondition, _UnaryProxyCondition7);

  function EventCondition(source, onResolve, onReject) {
    var _this15;

    _classCallCheck(this, EventCondition);

    _this15 = _possibleConstructorReturn(this, _getPrototypeOf(EventCondition).call(this, source));
    _.get(_assertThisInitialized(_assertThisInitialized(_this15))).onResolve = typeof onResolve === "function" ? onResolve : function (_) {
      return undefined;
    };
    _.get(_assertThisInitialized(_assertThisInitialized(_this15))).onReject = typeof onReject === "function" ? onReject : function (_) {
      return undefined;
    };
    return _this15;
  }

  _createClass(EventCondition, [{
    key: "test",
    value: function test() {
      for (var _len6 = arguments.length, params = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
        params[_key6] = arguments[_key6];
      }

      var _$get13 = _.get(this),
          source = _$get13.source,
          onResolve = _$get13.onResolve,
          onReject = _$get13.onReject;

      var subEvaluation;
      return new _evaluation.default(function (resolve, reject) {
        subEvaluation = source.test.apply(source, params);
        subEvaluation.on(function (value) {
          onResolve.call(null, value);
          resolve(value);
        }, function (reason) {
          onReject.call(null, reason);
          reject(reason);
        });
      }, function () {
        /* aborter */
        if (subEvaluation) subEvaluation.abort();
      });
    }
  }, {
    key: "toString",
    value: function toString() {
      return _.get(this).source.toString();
    }
  }]);

  return EventCondition;
}(UnaryProxyCondition);

var TrueEventCondition =
/*#__PURE__*/
function (_EventCondition) {
  _inherits(TrueEventCondition, _EventCondition);

  function TrueEventCondition(source, handler) {
    var _this16;

    _classCallCheck(this, TrueEventCondition);

    var onResolve = function onResolve(value) {
      return value && handler.call(null, value);
    };

    _this16 = _possibleConstructorReturn(this, _getPrototypeOf(TrueEventCondition).call(this, source, onResolve));
    if (typeof handler !== "function") throw new Error(_this16.constructor.name + " needs a function as handler");
    return _this16;
  }

  return TrueEventCondition;
}(EventCondition);

var FalseEventCondition =
/*#__PURE__*/
function (_EventCondition2) {
  _inherits(FalseEventCondition, _EventCondition2);

  function FalseEventCondition(source, handler) {
    var _this17;

    _classCallCheck(this, FalseEventCondition);

    var onResolve = function onResolve(value) {
      return value || handler.call(null, value);
    };

    _this17 = _possibleConstructorReturn(this, _getPrototypeOf(FalseEventCondition).call(this, source, onResolve));
    if (typeof handler !== "function") throw new Error(_this17.constructor.name + " needs a function as handler");
    return _this17;
  }

  return FalseEventCondition;
}(EventCondition);

var ErrorEventCondition =
/*#__PURE__*/
function (_EventCondition3) {
  _inherits(ErrorEventCondition, _EventCondition3);

  function ErrorEventCondition(source, handler) {
    var _this18;

    _classCallCheck(this, ErrorEventCondition);

    _this18 = _possibleConstructorReturn(this, _getPrototypeOf(ErrorEventCondition).call(this, source, undefined, handler));
    if (typeof handler !== "function") throw new Error(_this18.constructor.name + " needs a function as handler");
    return _this18;
  }

  return ErrorEventCondition;
}(EventCondition);

var _default = {
  Condition: Condition,

  /* Condition, (A) */
  StaticCondition: StaticCondition,
  TrueCondition: TrueCondition,
  FalseCondition: FalseCondition,
  FunctionalCondition: FunctionalCondition,
  PromiseCondition: PromiseCondition,
  ErrorCondition: ErrorCondition,
  EternalCondition: EternalCondition,

  /* ConditionList, */
  SequentialAnd: SequentialAnd,
  SequentialOr: SequentialOr,
  SequentialXor: SequentialXor,
  SequentialNor: SequentialNor,
  SequentialNand: SequentialNand,
  SequentialXnor: SequentialXnor,
  SequentialLink: SequentialLink,
  ParallelAnd: ParallelAnd,
  ParallelOr: ParallelOr,
  ParallelXor: ParallelXor,
  ParallelNor: ParallelNor,
  ParallelNand: ParallelNand,
  ParallelXnor: ParallelXnor,
  ParallelLink: ParallelLink,

  /* UnaryProxyCondition, (A) */
  NegativeCondition: NegativeCondition,
  BooleanCondition: BooleanCondition,
  DelayedCondition: DelayedCondition,
  CycleCondition: CycleCondition,
  DurableCondition: DurableCondition,
  TimeoutCondition: TimeoutCondition,
  EventCondition: EventCondition,
  TrueEventCondition: TrueEventCondition,
  FalseEventCondition: FalseEventCondition,
  ErrorEventCondition: ErrorEventCondition,
  // ready-to-use Condition objects
  TRUE: TRUE,
  FALSE: FALSE
};
exports.default = _default;
module.exports = exports.default;
}).call(this,require('_process'))
},{"./evaluation":5,"./scope":6,"_process":7}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _evaluation = _interopRequireDefault(require("./evaluation"));

var _chainable = require("./chainable");

var _condition = _interopRequireDefault(require("./condition"));

var _assign = _interopRequireDefault(require("./assign"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _assign.default)(_chainable.C, {
  Evaluation: _evaluation.default,
  Chainable: _chainable.Chainable,
  condition: (_condition.default, _chainable.conditionFrom)
});
var _default = _chainable.C;
exports.default = _default;
module.exports = exports.default;
},{"./assign":1,"./chainable":2,"./condition":3,"./evaluation":5}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _ = new WeakMap(); // Helper to handle multiple callbacks listening to an event


var DisposableMegaphone =
/*#__PURE__*/
function () {
  function DisposableMegaphone() {
    _classCallCheck(this, DisposableMegaphone);

    _.set(this, {
      callbacks: []
    });
  }

  _createClass(DisposableMegaphone, [{
    key: "speak",
    value: function speak() {
      for (var _len = arguments.length, params = new Array(_len), _key = 0; _key < _len; _key++) {
        params[_key] = arguments[_key];
      }

      var self = _.get(this);

      if (self.used) throw new Error(this.constructor.name + ".speak() must be called only once." + " Cannot accept " + String(params) + " after " + String(self.params));
      self.used = true;
      self.params = params;
      self.callbacks.forEach(function (callback) {
        return callback.apply(null, params);
      });
      self.callbacks = null;
    }
  }, {
    key: "listen",
    value: function listen(callback) {
      if (typeof callback !== "function") throw new Error(this.constructor.name + ".listen requires a function as callback");

      var _$get = _.get(this),
          used = _$get.used,
          params = _$get.params,
          callbacks = _$get.callbacks;

      if (used) {
        callback.apply(null, params);
      } else {
        callbacks.push(callback);
      }
    }
  }]);

  return DisposableMegaphone;
}();
/*
   Evaluation is something between a normal foo(callback) and a Promise = () = {...}

   Promise always run asynchrounsly: this creates some problems, since Condition uses proxying:
   ! (c0) => NotClass(Class(...)): normally all logic evaluations should be transactional

   Also, Promise is resolved as soon as it's created, this doesn't facilitate lazy behaviour with
   arrays of Conditions that must be passed to an && or || operator.

   Lastly, there is a specific issue with any Condition using a setTimeout or setInterval: you can't
   easily clear it off in case you don't need it anymore. This may happen using .anda(), or .out()
   for example.

   Evaluation object allows two-side communication for this regard, with the .abort() method.

   Some features:

   - It's "functional-like": nothing can be changed once evaluated.

   - .on((...x) => {}) returns nothing. This stuff is not chainable, at the moment.

   - if no .on() has ever been called, the condition is NOT evaluated (lazy behaviour)

   - a.on(f0), a.on(f1), a.on.(f2): all f0, f1, ... things may happen:

     SYNCH/ASYNCH but ALREADY RESOLVED/REJECTED: Evaluation.on(resolve, reject), listener runs immediately

     ASYNCH pending or ongoing: .on(listener, ...) listener is scheduled in a queue

     SYNCH pending or ongoing: .on(listener, ...) listner runs immediately

   - It can be encapsulated into a Promise with .toPromise(). WILL BREAK LAZINESS:
     This will cause calling .on() and evaluating it.

   - .then() is a shortcut for .toPromise().then()

   - .ona() method schedules the evaluation for async execution. Differently from .then(),
      which evalutes immediately but schedules the listeners async, .ona() evaluates asynch:

       .then(resolve); foo(); => [EVALUATE]+[FOO] +/async/[RESOLVE]
       .ona(resolve); foo(); => [FOO] +/async/[EVALUATE]+[RESOLVE]

*/


var EVALUATION_PENDING = "pending";
var EVALUATION_ONGOING = "ongoing";
var EVALUATION_RESOLVED = "resolved";
var EVALUATION_REJECTED = "rejected";

var EVALUATION_FULFILL = function EVALUATION_FULFILL(value) {
  var self = _.get(this);

  if (self.done) {
    console.warn("Resolver function attempted to call onFulfilled after status was already set, ignored");
    return;
  }

  self.done = true;
  self.value = value;
  self.status = EVALUATION_RESOLVED;
  self.queue.speak(function (resolve, reject) {
    return resolve(value);
  });
};

var EVALUATION_REJECT = function EVALUATION_REJECT(reason) {
  var self = _.get(this);

  if (self.done) {
    console.warn("Resolver function attempted to call onRejected after status was already set, ignored");
    return;
  }

  self.done = true;
  self.reason = reason;
  self.status = EVALUATION_REJECTED;
  self.queue.speak(function (resolve, reject) {
    return reject(reason);
  });
};

var Evaluation =
/*#__PURE__*/
function () {
  _createClass(Evaluation, null, [{
    key: "resolve",
    value: function resolve(value) {
      return new Evaluation(function (resolve) {
        return resolve(value);
      });
    }
  }, {
    key: "reject",
    value: function reject(reason) {
      return new Evaluation(function (_, reject) {
        return reject(reason);
      });
    }
  }]);

  function Evaluation(resolver) {
    var aborter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {
      return undefined;
    };

    _classCallCheck(this, Evaluation);

    if (typeof resolver !== "function") throw new Error(this.constructor.name + " resolver " + String(resolver) + " is not a function");
    if (typeof aborter !== "function") throw new Error(this.constructor.name + " aborter " + String(aborter) + " is not a function");

    _.set(this, {
      resolver: resolver,
      aborter: aborter,
      done: false,
      status: EVALUATION_PENDING,
      queue: new DisposableMegaphone()
    });
  }

  _createClass(Evaluation, [{
    key: "abort",
    value: function abort() {
      var reason = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "aborted";

      var _$get2 = _.get(this),
          status = _$get2.status,
          aborter = _$get2.aborter;

      if (status === EVALUATION_ONGOING) {
        EVALUATION_REJECT.call(this, reason);

        try {
          aborter.call(null);
        } catch (e) {
          // Silent error
          console.warn(this.constructor.name + ".abort()", e);
        }

        return true;
      } else if (status === EVALUATION_PENDING) {
        EVALUATION_REJECT.call(this, reason);
        return true;
      } // Can't abort an already resolved / rejected Evaluation


      return false;
    }
  }, {
    key: "on",
    value: function on(onFulfilled, onRejected) {
      // As the Promise object, it does ignore non-function parameters
      typeof onFulfilled === "function" || (onFulfilled = function onFulfilled(x) {
        return x;
      });
      typeof onRejected === "function" || (onRejected = function onRejected(e) {
        throw e;
      });

      var self = _.get(this);

      if (self.status === EVALUATION_PENDING) {
        // Resolve for the very first time
        self.status = EVALUATION_ONGOING;

        try {
          self.resolver.call(null, EVALUATION_FULFILL.bind(this), EVALUATION_REJECT.bind(this));
        } catch (reason) {
          EVALUATION_REJECT.call(this, reason);
        } finally {
          self.async = !self.done;
        }
      }

      if (self.status === EVALUATION_RESOLVED) {
        onFulfilled.call(null, self.value);
      } else if (self.status === EVALUATION_REJECTED) {
        onRejected.call(null, self.reason);
      } else if (self.status === EVALUATION_ONGOING) {
        // Queue this instance listeners
        self.queue.listen(function (fn) {
          return fn(onFulfilled, onRejected);
        });
      }
    } // then(...) resolver is synch, listener is async
    // .ona(...) both resolver and listener is async

  }, {
    key: "ona",
    value: function ona(onFulfilled, onRejected) {
      var _this = this;

      Promise.resolve().then(function (_) {
        _this.on(onFulfilled, onRejected);
      });
    }
  }, {
    key: "toString",
    value: function toString() {
      var _$get3 = _.get(this),
          status = _$get3.status,
          reason = _$get3.reason,
          value = _$get3.value;

      var info = status === EVALUATION_RESOLVED ? value : status === EVALUATION_REJECTED ? reason : "";
      return "<".concat(status, ">").concat(info);
    }
  }, {
    key: "toPromise",
    value: function toPromise() {
      // Breaks lazyness
      return new Promise(this.on.bind(this));
    }
  }, {
    key: "then",
    value: function then(onFulfilled, onRejected) {
      return this.toPromise().then(onFulfilled, onRejected);
    } // [util.inspect.custom] (depth, options) needs handling for browserify

  }, {
    key: "status",
    get: function get() {
      return _.get(this).status;
    }
  }, {
    key: "async",
    get: function get() {
      var _$get4 = _.get(this),
          status = _$get4.status,
          async = _$get4.async;

      if (status === EVALUATION_PENDING) throw new Error(".async does not exist for [" + status + "] status");
      return !!async;
    }
  }, {
    key: "value",
    get: function get() {
      var _$get5 = _.get(this),
          status = _$get5.status,
          value = _$get5.value;

      if (status !== EVALUATION_RESOLVED) throw new Error(".value does not exist for [" + status + "] status");
      return value;
    }
  }, {
    key: "reason",
    get: function get() {
      var _$get6 = _.get(this),
          status = _$get6.status,
          reason = _$get6.reason;

      if (status !== EVALUATION_REJECTED) throw new Error(".reason does not exist for [" + status + "] status");
      return reason;
    }
  }, {
    key: Symbol.toStringTag,
    get: function get() {
      return this.toString();
    }
  }]);

  return Evaluation;
}();

var _default = Evaluation;
exports.default = _default;
module.exports = exports.default;
},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _ = new WeakMap();

var Scope =
/*#__PURE__*/
function () {
  function Scope(source) {
    _classCallCheck(this, Scope);

    if (source instanceof Scope) return source;
    var context = Object.assign({}, source);

    _.set(this, {
      context: context,
      commits: new Map()
    });
  } // After getChildContext is called, previous objects are detatched  


  _createClass(Scope, [{
    key: "getChildContext",
    value: function getChildContext() {
      var self = _.get(this); // const childContext = Object.create(contextes[contextes.length - 1]);


      var childContext = Object.assign({}, self.context);
      self.context = childContext;
      return childContext;
    } // Create a clone of the Scope object

  }, {
    key: "fork",
    value: function fork() {
      return new Scope(_.get(this).context);
    } // Save a copy of the current context

  }, {
    key: "commit",
    value: function commit(description) {
      var _$get = _.get(this),
          context = _$get.context,
          commits = _$get.commits;

      var symbol = Symbol(description);
      commits.set(symbol, Object.assign({}, context));
      return symbol;
    } // Restore a saved context and return this Scope

  }, {
    key: "checkout",
    value: function checkout(symbol) {
      var self = _.get(this);

      var commits = self.commits;
      if (!commits.has(symbol)) throw new Error("".concat(this.constructor.name, ".checkout() can't find this commit"));
      self.context = Object.assign({}, commits.get(symbol));
      return this;
    } // Delete a previously stored context

  }, {
    key: "deleteCommit",
    value: function deleteCommit(symbol) {
      return _.get(this).commits.delete(symbol);
    }
  }]);

  return Scope;
}();

var _default = Scope;
exports.default = _default;
module.exports = exports.default;
},{}],7:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[4])(4)
});

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Calculator = factory());
}(this, function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  var Calculator =
  /*#__PURE__*/
  function () {
    function Calculator() {
      _classCallCheck(this, Calculator);

      this._symbols = {};

      this._definedOperator("+", this.last, "prefix", 3);

      this._definedOperator("-", this.negation, "prefix", 3);

      this._definedOperator("+", this.add, 'infix', 2);

      this._definedOperator("-", this.sub, 'infix', 2);

      this._definedOperator("*", this.multi, 'infix', 4);

      this._definedOperator("/", this.div, 'infix', 4);

      this._definedOperator("(", this.last, 'prefix');

      this._definedOperator(")", null, "postfix");

      this._definedOperator("|", this.mod, 'infix', 4);

      this._definedOperator("!", this.fac, 'postfix', 6);

      this._definedOperator("^", Math.pow, 'infix', 4, true);

      this._definedOperator("min", Math.min);

      this._definedOperator("max", Math.max);

      this._definedOperator(",", Array.of, 'infix', 1);

      this._definedOperator("%", this.rate, "postfix", 6);

      this._definedOperator("cos", Math.cos);

      this._definedOperator("sin", Math.sin);

      this._definedOperator("tan", Math.tan);

      this._definedOperator("abs", Math.abs);

      this._definedOperator("log", this.log);

      this._definedOperator("//", this.sqrt, "infix", 4);

      this.calcReg();
      this._caches = {};
    } //generate a regular expression


    _createClass(Calculator, [{
      key: "calcReg",
      value: function calcReg() {
        var regstr = "\\d+(?:\\.\\d+)?|" + Object.values(this._symbols) //longer symbols should be listed in front of shorter ones
        .sort(function (a, b) {
          return b.symbol.length - a.symbol.length;
        }) //replace special characters
        .map(function (val) {
          return val.symbol.replace(/[\\*+^()$?.{}|[\]]/g, '\\$&');
        }).join("|") //capture undefined characters
        + "|(\\S)";
        this.pattern = new RegExp(regstr, "g");
      }
      /**
       * define a operator
       * @param symbol  name
       * @param handle handle function
       * @param type  symbol type [prefix,infix,postfix]
       * @param precedence operator priority
      **/

    }, {
      key: "_definedOperator",
      value: function _definedOperator(symbol, handle) {
        var _Object$assign;

        var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'func';
        var precedence = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
        var right2left = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
        if (type === 'func') precedence = 0;
        var argCount = type === 'infix' ? 2 : 1; // Some symbols may have different handle like '-' and '+'

        this._symbols[symbol] = Object.assign({}, this._symbols[symbol], (_Object$assign = {}, _defineProperty(_Object$assign, type, {
          symbol: symbol,
          handle: handle,
          precedence: precedence,
          argCount: argCount,
          type: type,
          right2left: right2left
        }), _defineProperty(_Object$assign, "symbol", symbol), _Object$assign));
      } // API for custom symbols

    }, {
      key: "definedOperators",
      value: function definedOperators(operators) {
        var _this = this;

        operators = Array.isArray(operators) ? operators : [operators];
        operators.map(function (v) {
          if (["(", ")", ","].indexOf(v.token) === -1) {
            var operator = _this._symbols[v.token];

            if (operator && (operator.infix && v.type === "postfix" || operator.postfix && v.type === 'infix')) {
              console.warn("".concat(v.token, ": infix and postfix operator should be mutually exclusive"));
            } else {
              _this._definedOperator(v.token, v.func, v.type, v.weight, v.rtol);
            }
          }
        });
        this.calcReg();
      }
    }, {
      key: "parse",
      value: function parse(s) {
        var _this2 = this;

        var calc = function calc(symbol) {
          var _ref;

          symbol.symbol != "(" && notation.push(symbol);
          result.push(symbol.handle.apply(symbol, _toConsumableArray((_ref = []).concat.apply(_ref, _toConsumableArray(result.splice(-symbol.argCount))))));
          return symbol.precedence;
        };

        var error = function error(code, msg) {
          var pos = match ? match.index : s.length,
              str = "[error code:".concat(code, "] ").concat(msg, " at ").concat(pos, ":\n").concat(s, "\n").concat(' '.repeat(pos), "^");
          console.warn("".concat(str));
          var err = {
            code: code,
            message: msg
          };
          _this2._caches[s].err = err;
          return err;
        };

        var operators = [this._symbols["("].prefix],
            result = [],
            notation = [],
            // RPN
        // results of regular execution
        match,
            token,
            //Is the last token a number?
        lastIsNumber = false;
        s = s.replace(/\s/g, '');
        var cache = this._caches[s];

        if (cache) {
          if (cache.err) {
            return error(cache.err.code, cache.err.message);
          } else {
            return cache;
          }
        }

        this._caches[s] = {};
        this.pattern.lastIndex = 0;

        do {
          match = this.pattern.exec(s);
          token = match ? match[0] : ")";
          var curr = this._symbols[token]; //captured an undefined symbol

          if (match && match[1]) {
            return error(1001, "".concat(match[1], " is undefined"));
          } //The last token is not a number and the current token is neither a number nor a prefix operator or func


          if (!lastIsNumber && isNaN(token) && (!curr || curr && !curr.prefix && !curr.func)) {
            return error(1002, "Syntax error");
          }

          if (lastIsNumber) {
            //The current operator should be an infix or postfix operator
            var currSymbol = curr.postfix || curr.infix;

            do {
              //comparing operator precedence
              var prev = operators[operators.length - 1];
              if ((currSymbol.precedence - prev.precedence || prev.right2left) > 0) break;
            } while (calc(operators.pop())); // Exit the loop after executing an opening parenthesis or function


            if (currSymbol.symbol != ")") {
              if (currSymbol.type === "postfix") {
                // The postfix should be first executed, it would get a number result
                calc(currSymbol);
                lastIsNumber = true;
              } else {
                // other operators
                operators.push(currSymbol);
                lastIsNumber = false;
              }
            } else {
              lastIsNumber = currSymbol.type === "postfix";
            }
          } else if (isNaN(+token)) {
            // function or prefix operator
            operators.push(curr.prefix || curr.func);

            if (curr.func) {
              match = this.pattern.exec(s);
              if (!match || match[0] !== '(') return error(1003, "Missing a opening parenthesis after function \"".concat(token, "\""));
            }
          } else {
            // is a number
            lastIsNumber = true;
            result.push(+token);
            notation.push(+token);
          }
        } while (match && operators.length);

        return operators.length ? error(1004, "Opening parenthesis is more than closing parenthesis") : match ? error(1005, "Closing parenthesis is more than opening parenthesis") : this._caches[s] = {
          notation: notation,
          value: result.pop()
        };
      } //handlers

    }, {
      key: "last",
      value: function last() {
        for (var _len = arguments.length, a = new Array(_len), _key = 0; _key < _len; _key++) {
          a[_key] = arguments[_key];
        }

        return a.pop();
      }
    }, {
      key: "negation",
      value: function negation(a) {
        return -a;
      }
    }, {
      key: "add",
      value: function add(a, b) {
        return a + b;
      }
    }, {
      key: "sub",
      value: function sub(a, b) {
        return a - b;
      }
    }, {
      key: "multi",
      value: function multi(a, b) {
        return a * b;
      }
    }, {
      key: "div",
      value: function div(a, b) {
        if (b === 0) throw new Error("The divisor cannot be zero");
        return a / b;
      }
    }, {
      key: "mod",
      value: function mod(a, b) {
        if (b === 0) throw new Error("The divisor cannot be zero");
        return a % b;
      }
    }, {
      key: "fac",
      value: function fac(a) {
        if (a % 1 || !(+a >= 0)) return NaN;
        if (a > 170) return Infinity;
        var b = 1;

        while (a > 1) {
          b *= a--;
        }

        return b;
      }
    }, {
      key: "log",
      value: function log(a, b) {
        if (a <= 0 || a == 1) {
          throw new Error("The base number of logarithmic operations must be greater than 0 and not equal to 1");
        }

        return Math.log(b) / Math.log(a);
      }
    }, {
      key: "rate",
      value: function rate(a) {
        return a / 100;
      }
    }, {
      key: "sqrt",
      value: function sqrt(a, b) {
        return Math.pow(b, 1 / a);
      }
    }]);

    return Calculator;
  }();

  return Calculator;

}));

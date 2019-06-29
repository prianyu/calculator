class Calculator {
  constructor(options = {}) {
    this._symbols = {};
    this._definedOperator("+", this.last, "prefix", 3)
    this._definedOperator("-", this.negation, "prefix", 3)
    this._definedOperator("+", this.add, 'infix', 2)
    this._definedOperator("-", this.sub, 'infix', 2)
    this._definedOperator("*", this.multi, 'infix', 4)
    this._definedOperator("/", this.div, 'infix', 4)
    this._definedOperator("(", this.last, 'prefix')
    this._definedOperator(")", null, "postfix")
    this._definedOperator("|", this.mod, 'infix', 4)
    this._definedOperator("!", this.fac, 'postfix', 6)
    this._definedOperator("^",  Math.pow, 'infix', 5, true)
    this._definedOperator("min", Math.min)
    this._definedOperator("max", Math.max)
    this._definedOperator(",", Array.of, 'infix', 1)
    this._definedOperator("%", this.rate, "postfix", 6)
    this._definedOperator("cos", Math.cos)
    this._definedOperator("sin", Math.sin)
    this._definedOperator("tan", Math.tan)
    this._definedOperator("abs", Math.abs)
    this._definedOperator("log", this.log)
    this._definedOperator("//", this.sqrt, "infix", 4)

    this.definedOperators(options.operators || [])
    this.handleError = typeof options.handleError === 'function' ? options.handleError : null
    this._caches = {}
  }


   //generate a regular expression
  calcReg () {
    let regstr =  "\\d+(?:\\.\\d+)?|" +
    Object.values(this._symbols)
    //longer symbols should be listed in front of shorter ones
    .sort((a, b) => b.symbol.length - a.symbol.length)
    //replace special characters
    .map(val => val.symbol.replace(/[\\*+^()$?.{}|[\]]/g, '\\$&'))
    .join("|")
    //capture undefined characters
    + "|(\\S)"
    this.pattern = new RegExp(regstr,"g")
  }

  /**
   * define a operator
   * @param symbol  name
   * @param handle handle function
   * @param type  symbol type [prefix,infix,postfix]
   * @param precedence operator priority
  **/
  _definedOperator(symbol, handle, type = 'func', precedence = 0, right2left = false) {
    if(type === 'func') precedence = 0
    let argCount = type === 'infix' ? 2 : 1
    // Some symbols may have different handle like '-' and '+'
    this._symbols[symbol] =  Object.assign({}, this._symbols[symbol], {
      [type]:{symbol, handle: handle ? handle.bind(this) :handle, precedence, argCount, type, right2left},
      symbol
    })
  }
  // API for custom symbols
  definedOperators(operators) {
    operators = Array.isArray(operators) ? operators : [operators]
    operators.map(v => {
      if(["(", ")", ","].indexOf(v.token) === -1 && v.token && v.func) {
        let operator = this._symbols[v.token]
        if(operator && (operator.infix && v.type === "postfix" ||operator.postfix && v.type === 'infix')) {
          console.warn(`${v.token}: infix and postfix operator should be mutually exclusive`)
        } else {
          this._definedOperator(v.token,v.func,v.type,v.weight, v.rtol)
        }
      }
    })
    this.calcReg()
  }

  parse(s) {
    let calc = symbol => {
      symbol.symbol != "(" && notation.push(symbol)
      result.push(symbol.handle(...[].concat(...result.splice(-symbol.argCount))))
      return symbol.precedence
    }
    let error = this.handleError || ((code, msg) => {
      let pos  = match ? match.index : s.length,
          str = `[error code:${code}] ${msg} at ${pos}:\n${s}\n${' '.repeat(pos)}^`
          console.warn(`${str}`)
      let err = {
        code: code,
        message: msg
      }
      this._caches[s].err = err
      return err
    })

    let operators = [this._symbols["("].prefix],
        result = [],
        notation = [], // RPN
        // results of regular execution
        match, token,
        //Is the last token a number?
        lastIsNumber = false

    s = s.replace(/\s/g,'')
    let cache  = this._caches[s]
    if(cache) {
      if(cache.err) {
        return error(cache.err.code, cache.err.message)
      } else {
        return cache;
      }
    }
    this._caches[s] = {}
    this.pattern.lastIndex = 0

    do{
      match = this.pattern.exec(s)
      token = match ? match[0] : ")"
      const curr = this._symbols[token]

      //captured an undefined symbol
      if(match && match[1]) {
        return error(1001, `${match[1]} is undefined`)
      }

      //The last token is not a number and the current token is neither a number nor a prefix operator or func
      if(!lastIsNumber && isNaN(token) && (!curr  || curr && !curr.prefix && !curr.func)) {
        return error(1002, "Syntax error")
      }

      if(lastIsNumber) {
        //The current operator should be an infix or postfix operator
        const currSymbol = curr.postfix || curr.infix
        do {
          //comparing operator precedence
          let prev =  operators[operators.length - 1]
          if(((currSymbol.precedence - prev.precedence) || prev.right2left) > 0) break

        } while(calc(operators.pop())) // Exit the loop after executing an opening parenthesis or function

        if(currSymbol.symbol != ")") {
          if(currSymbol.type === "postfix") {
            // The postfix should be first executed, it would get a number result
            calc(currSymbol)
            lastIsNumber = true
          } else {// other operators
            operators.push(currSymbol)
            lastIsNumber = false
          }
        } else {
          lastIsNumber = currSymbol.type === "postfix"
        }
      } else if(isNaN(+token)) {// function or prefix operator
        operators.push(curr.prefix || curr.func)
        if(curr.func) {
          match = this.pattern.exec(s)
          if(!match || match[0] !== '(')
            return error(1003, `Missing a opening parenthesis after function "${token}"`)
        }
      } else {// is a number
        lastIsNumber = true
        result.push(+token)
        notation.push(+token)
      }
    } while(match && operators.length)
    return operators.length ? error(1004, "Opening parenthesis is more than closing parenthesis")
                            : match ? error(1005, "Closing parenthesis is more than opening parenthesis")
                                    : (this._caches[s] = {notation, value: result.pop()})
  }

  //handlers

  last(...a) {
    return a.pop()
  }

  negation(a) {
     return -a
  }

  add(a,b) {
    return a + b
  }

  sub(a,b) {
    return a - b
  }

  multi(a,b) {
    return a * b
  }

  div(a,b) {
    if(b === 0){
      this.handleError && this.handleError({code: 1006, message:"The divisor cannot be zero"})
      return Infinity
    }
    return a / b
  }

  mod(a,b) {
    if(b === 0) {
      this.handleError && this.handleError({code: 1006, message:"The divisor cannot be zero"})
      return Infinity
    }
    return a % b
  }

  fac(a) {
    if(a % 1 || !(+a >=0)) return NaN
    if(a > 170) return Infinity
    let b = 1
    while( a > 1) b *= a--
    return b
  }

  log(a,b) {
    if(a <= 0 || a == 1) {
      this.handleError && this.handleError({code: 1007, message: "The base number of logarithmic operations must be greater than 0 and not equal to 1"})
      return NaN
    }
    return Math.log(b) / Math.log(a)
  }

  rate(a) {
    return a / 100;
  }

  sqrt(a,b) {
    return Math.pow(b, 1/a)
  }
}
export default Calculator
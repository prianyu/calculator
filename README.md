[中文文档](./README_CN.md)

# calculator
A mathematical expression parser for Javascript.

+ Works in Wechat miniProgram
+ Supports IE9+
+ Supports AMD/CommonJS
+ Supports custom operators

You can use the util to parse a mathematical expression into an Reverse Polish Notation or evaluate it.For example,when you parse `1+2*3`，you will get the expression `+ * 3 2 1` and the result `7`.

## Installation

### Direct download

Download the script  [here](https://github.com/prianyu/calculator/archive/master.zip) and include it:

```html
<script src="/dist/calculator.min.js"></script>
<!-- or -->
<script src="/dist/calculator.js"></script>
```

### Package Managers

#### NPM

```shell
$ npm install @iboxer/calculator --save
```

#### AMD

```javascript
require(['./dist/calculator.js'], function(Calculator) {
  var calculator = new Calculator()
  calculator.parse("1+2+3")
})
```

## Basic Usage

### Instance

> new Calculator(options)

```javascript
var calculator = new Calculator();

```
**options**

  > **handleError:** Error handler.For more details, please click here[click here](https://github.com/prianyu/calculator/blob/master/README_CN.md#Errors) 

  > **operators:** Custom operators.For more details, please click here[click here](https://github.com/prianyu/calculator/blob/master/README_CN.md#API)

### Parse

```javascript
var result = calculator.parse("1+2*3");
console.log(result);
```
You will get the result:

![](./images/result.png)

+ **value**: The result of evaluating the expression
+ **notation:** The Reverse Polish Notation of parsing the expression

So you can get the result by `result.value` and get the notation by `result.notation`.

The util supports parsing mathematical operator(like `+,-,*,/`) and functions,Currently it supports by default the following mathematical operators:

|Operator|Type  |Precedence |Description|
|:-------|:----:|------|:----------|
|`+`      |prefix |3|positive sign|
|`-`       |prefix|3| negative sign|
|`+`       |infix|2     |addition   |
|`-`       |infix|2      |subtraction|
|`*`       |infix|4      |multiplication|
|`/`      |infix|4      |division|
|`\|`       |infix|4      |Mod|
|`%`       |postfix|6      |percentage|
|`(`,`)`      |prefix,postfix |0     |parentheses|
|`!`       |postfix|6      |factorial|
|`^`       |infix|4      |exponentiation|
|`//`       |infix|4      |radical expression|
|`log`     |func |0     |logarithm|
|`abs`     |func |0     |get absolute value|
|`sin`,`tan`,`cos`|func|0    |trigonometric function|
|`,`          |infix|1     |parameter separator of a function|


### API

You can also define custom operators and functions by using the API `definedOperators(Object|Array)`.For example, you may define an operator `||` to get the quotient and an function `ca` to get the area of a circle：

```javascript
calculator.definedOperators({
  token: "||",
  type: "infix",
  func: function(a, b) {
    return Math.floor(a / b);
  },
  weight: 4
});
calculator.definedOperators({
  token: "ca",
  type: "func",
  func: function(r) {
    return Math.PI * r * r;
  }
});

console.log("ca(5) = ", calculator.parse('ca(5)').value); // ca(5) =  78.53981633974483
console.log("10 || 3 + 2 = ", calculator.parse('10 || 3 + 2').value); // 10 || 3 + 2 = 5
```

|Param |  Type  | Required | Description |
|:------:|---|---- |:----------|
|`token` | String  | Yes   |name of the operator,can not be`(`, `)`or`,`|
|`func`  | Function  |  Yes  |the handle function |
|`type`  | String  | No   |type of the operator,just can be `prefix`,'infix',`postfix` and `func`,default `func` |
|`weight` | Number  | No   |the precedence of the operator,default `0`|
|`rtol`   |Boolean   | No   |is it a right-combination operator?,default `undefined`|

> **The same operator can be `infix` and `prefix` ,like the operator `+`,but `infix` and `postfix` should be mutually exclusive**
> **The API can pass in an object or an array of objects to define a set of operators at the same time**


## Errors

When parse a invalid expression, you will get an error.In order to customize error handling, exceptions will not be thrown directly.Instead,you will get the result like:

```javascript
{
  code: 1004,
  message: "Opening parenthesis is more than closing parenthesis",
  pos: 20,
  token: "/"
}
```
| key | description|
|:----:|--------|
|code|error code|
|message|description|
|pos|the error position in the expression|
|token|current operator|
```
and get a warning on console like:

![](./images/error.png)

By default, the error object is returned as a result, and you can define a custom error-handler by passing  `handleError` for the instance:

```javascript
var calculator = new Calculator({
  handleError: function(err) {
    if(err.code === 1006)
      return {
        value: Infinity
      }
  }
});

Here are all the error types:

| code | description|
|:----:|--------|
|1001|Contains undefined operators|
|1002|Syntax error|
|1003|Missing a opening parenthesis after a function|
|1004|Opening parenthesis is more than closing parenthesis|
|1005|Closing parenthesis is more than opening parenthesis|
|1006|The divisor cannot be zero|
|1007|The base number of logarithmic operations must be greater than 0 and not equal to 1|
|1008|The factorial base must be a non-negative integer|


## Demos

[Demos](./test/index.html)


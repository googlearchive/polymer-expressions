import { assert } from 'chai';

import * as codegen from '../polymer-expressions/codegen';
import * as parser from '../polymer-expressions/parser';

const Parser = parser.Parser;

const astFactory = new codegen.CodeGenAstFactory();

function expectCode(s: string, expected: string) {
  const expr = new Parser(s, astFactory).parse();
  const result = expr.gen();
  assert.equal(result, expected);
}

suite('codegen', () => {

  test('should return empty string for an empty expression', () => {
    expectCode('', '');
  });

  suite('literals', () => {

    test('generates a string literal', () => {
      expectCode('"a"', '"a"');
      expectCode("'a'", '"a"');
    });

    test('generates a string literal with quotes', () => {
      // codegen always uses double-quotes and always escapes quote characters

      // double-quoted string with single-quote: "'"
      expectCode('"\'"', '"\\\'"');
      // double-quoted string with escaped single-quote: "\'"
      expectCode('"\\\'"', '"\\\'"');
      // double-quoted string with escaped double-quote: "\""
      expectCode('"\\\""', '"\\\""');

      // single-quoted string with double-quote: '"'
      expectCode("'\"'", '"\\\""');
      // single-quoted string with escaped double-quote: '\"'
      expectCode("'\\\"'", '"\\""');
      // single-quoted string with escaped single-quote: '\''
      expectCode("'\\\''", '"\\\'"');
    });

    test('generates a number literal', () => {
      expectCode('123', '123');
    });

    test('generates a boolean literal', () => {
      expectCode('true', 'true');
    });

    test('generates a null literal', () => {
      expectCode('null', 'null');
    });

  });

  suite('properties', () => {

    test('generates an instance property', () => {
      expectCode('foo', 'model.foo');
    });

    test('generates chained instance properties', () => {
      expectCode('foo.bar', 'model.foo.bar');
    });

    test('generates an instance property with `this`', () => {
      expectCode('this.foo', 'model.foo');
    });

    test('generates an indexed instance property', () => {
      expectCode('this["foo"]', 'model["foo"]');
    });

  });

  suite('methods', () => {

    test('generates an instance method call', () => {
      expectCode('foo()', 'model.foo()');
    });

    test('generates an instance method call with `this`', () => {
      expectCode('this.foo()', 'model.foo()');
    });

  });

  suite('operators', () => {

    test('generates an unary operator', () => {
      expectCode('!foo', '!model.foo');
    });

    test('generates a binary operator', () => {
      expectCode('1 + 2', '1 + 2');
    });

    test('generates a binary + uniary operators', () => {
      expectCode('1 + -1', '1 + -1');
    });

    test('generates function call for pipe operator', () => {
      expectCode('a | f', 'model.f(model.a)');
    });

    test('generates correct precedence with parens', () => {
      expectCode('1 - (2 + 3)', '1 - (2 + 3)');
    });

    test('generates a ternary operator', () => {
      expectCode('a ? true : false', 'model.a ? true : false');
    });

  });

  suite('maps', () => {

    test('generates an empty map', () => {
      expectCode('{}', '{}');
    });

    test('generates a map with entries', () => {
      expectCode('{"a":b, "c":d}', '{"a": model.b, "c": model.d}');
    });

  });

  suite('lists', () => {

    test('generates an empty list', () => {
      expectCode('[]', '[]');
    });

    test('generates a list with items', () => {
      expectCode('[1,2,3]', '[1, 2, 3]');
    });

  });


});

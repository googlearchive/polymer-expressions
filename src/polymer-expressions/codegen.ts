import * as ast from './ast';
import { AstFactory } from './ast_factory';
import { escapeString } from './tokenizer';

export interface Generator {
  gen(this: this): string;
}

export type Expression = Literal | Empty | ID | Unary | Binary | Getter | Invoke |
  Paren | Index | Ternary | Map | List;

export interface Literal extends Generator {
  type: 'Literal';
  value: ast.LiteralValue;
}

export interface Empty extends Generator {
  type: 'Empty';
}

export interface ID extends Generator {
  type: 'ID';
  value: string;
}

export interface Unary extends Generator {
  type: 'Unary';
  operator: string;
  child: Expression;
}

export interface Binary extends Generator {
  type: 'Binary';
  operator: string;
  left: Expression;
  right: Expression;
}

export interface Getter extends Generator {
  type: 'Getter';
  receiver: Expression;
  name: string;
}

export interface Invoke extends Generator {
  type: 'Invoke';
  receiver: Expression;
  method: string | null;
  arguments: Array<Expression> | null;
}

export interface Paren extends Generator {
  type: 'Paren';
  child: Expression;
}

export interface Index extends Generator {
  type: 'Index';
  receiver: Expression;
  argument: Expression;
}

export interface Ternary extends Generator {
  type: 'Ternary';
  condition: Expression;
  trueExpr: Expression;
  falseExpr: Expression;
}

export interface Map extends Generator {
  type: 'Map';
  entries: { [key: string]: Expression | null } | null;
}

export interface List extends Generator {
  type: 'List';
  items: Array<Expression> | null;
}

// declare var console: any;

function genString(str: string): string {
  return `"${escapeString(str)}"`;
}

export class CodeGenAstFactory implements AstFactory<Expression> {
  empty(): Empty {
    return {
      type: 'Empty',
      gen() { return ''; },
    };
  }

  literal(v: string): Literal {
    return {
      type: 'Literal',
      value: v,
      gen() {
        const type = typeof this.value;
        if (type === "string") {
          return genString(this.value as string);
        }
        return `${this.value}`;
      },
    };
  }

  id(v: string): ID {
    return {
      type: 'ID',
      value: v,
      gen() {
        if (this.value === 'this') {
          return 'model';
        }
        return `model.${this.value}`;
      },
    };
  }

  unary(op: string, expr: Expression): Unary {
    return {
      type: 'Unary',
      operator: op,
      child: expr,
      gen() { return this.operator + this.child.gen(); },
    };
  }

  binary(l: Expression, op: string, r: Expression): Binary {
    return {
      type: 'Binary',
      operator: op,
      left: l,
      right: r,
      gen() {
        if (this.operator === '|') {
          return `${this.right.gen()}(${this.left.gen()})`;
        }
        return `${this.left.gen()} ${op} ${this.right.gen()}`;
      },
    };
  }

  getter(g: Expression, n: string): Getter {
    return {
      type: 'Getter',
      receiver: g,
      name: n,
      gen() {
        return `${this.receiver.gen()}.${this.name}`;
      },
    };
  }

  invoke(receiver: Expression, method: string, args: Expression[]): Invoke {
    if (method != null && typeof method !== 'string') {
      throw new Error('method not a string');
    }
    return {
      type: 'Invoke',
      receiver: receiver,
      method: method,
      arguments: args,
      gen() {
        const receiver = this.receiver.gen();
        const method = this.method ? `.${this.method}` : '';
        const args = (this.arguments || []).map((a) => a.gen()).join(',');
        return receiver + method + `(${args})`;
      },
    };
  }

  paren(child: Expression): Paren {
    return {
      type: 'Paren',
      child,
      gen() { return `(${this.child.gen()})`; }
    };
  }

  index(e: Expression, a: Expression): Index {
    return {
      type: 'Index',
      receiver: e,
      argument: a,
      gen() {
        return `${this.receiver.gen()}[${this.argument.gen()}]`;
      },
    };
  }

  ternary(c: Expression, t: Expression, f: Expression): Ternary {
    return {
      type: 'Ternary',
      condition: c,
      trueExpr: t,
      falseExpr: f,
      gen() {
        return `${this.condition.gen()} ? ${this.trueExpr.gen()} : ${this.falseExpr.gen()}`;
      },
    };
  }

  map(entries: { [key: string]: Expression } | null): Map {
    return {
      type: 'Map',
      entries: entries,
      gen() {
        const entries = Object.entries(this.entries || {}).map((e) => `${genString(e[0])}: ${e[1].gen()}`)
        return `{${entries.join(', ')}}`;
      },
    };
  }

  // TODO(justinfagnani): if the list is deeply literal
  list(l: Array<Expression> | null): List {
    return {
      type: 'List',
      items: l,
      gen() {
        return `[${(this.items || []).map((a) => a.gen()).join(', ')}]`;
      },
    };
  }
}

const OPERATOR_PATTERN = /[+\-*/%]/;

function isOperator(value: string) {
  return OPERATOR_PATTERN.test(value);
}

function getLastCharacter(expression: string) {
  return expression.at(-1) ?? "";
}

function countOpenGroups(expression: string) {
  let depth = 0;

  for (const character of expression) {
    if (character === "(") {
      depth += 1;
      continue;
    }

    if (character === ")") {
      depth -= 1;
    }
  }

  return depth;
}

function getCurrentNumberSegment(expression: string) {
  const match = expression.match(/(^|[+\-*/%(])(-?\d*\.?\d*)$/);
  return match?.[2] ?? "";
}

export function backspaceCalculatorExpression(expression: string) {
  const nextExpression = expression.slice(0, -1);

  return nextExpression.length > 0 ? nextExpression : "0";
}

export function applyCalculatorInput(expression: string, value: string) {
  const lastCharacter = getLastCharacter(expression);

  if (/^\d$/.test(value)) {
    if (expression === "0") {
      return value;
    }

    if (lastCharacter === ")" || lastCharacter === "%") {
      return `${expression}*${value}`;
    }

    return `${expression}${value}`;
  }

  if (value === ".") {
    if (lastCharacter === ")" || lastCharacter === "%") {
      return expression;
    }

    const segment = getCurrentNumberSegment(expression);

    if (segment.includes(".")) {
      return expression;
    }

    if (expression === "0") {
      return "0.";
    }

    if (!lastCharacter || isOperator(lastCharacter) || lastCharacter === "(") {
      return `${expression}0.`;
    }

    return `${expression}.`;
  }

  if (value === "(") {
    if (expression === "0") {
      return "(";
    }

    if (/\d|\)|%/.test(lastCharacter)) {
      return `${expression}*(`;
    }

    return `${expression}(`;
  }

  if (value === ")") {
    if (countOpenGroups(expression) <= 0) {
      return expression;
    }

    if (!lastCharacter || isOperator(lastCharacter) || lastCharacter === "(") {
      return expression;
    }

    return `${expression})`;
  }

  if (value === "%") {
    if (!lastCharacter || isOperator(lastCharacter) || lastCharacter === "(" || lastCharacter === ".") {
      return expression;
    }

    return `${expression}%`;
  }

  if (isOperator(value)) {
    if (expression === "0") {
      return value === "-" ? "-" : expression;
    }

    if (lastCharacter === "(") {
      return value === "-" ? `${expression}-` : expression;
    }

    if (isOperator(lastCharacter)) {
      if (value === "-" && lastCharacter !== "-") {
        return `${expression}-`;
      }

      return `${expression.slice(0, -1)}${value}`;
    }

    if (lastCharacter === ".") {
      return expression;
    }

    return `${expression}${value}`;
  }

  return expression;
}

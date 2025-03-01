export const add = (a: number, b: number): number => a + b;
export const subtract = (a: number, b: number): number => a - b;
export const multiply = (a: number, b: number): number => a * b;
export const divide = (a: number, b: number): number => {
  if (b === 0) {
    throw new Error("Division by zero is not allowed");
  }
  return a / b;
};

export const power = (a: number, b: number): number => a ** b;
export const squareRoot = (a: number): number => a ** (1 / 2);
export const cubeRoot = (a: number): number => a ** (1 / 3);

export const absoluteValue = (a: number): number => Math.abs(a);
export const sign = (a: number): number => Math.sign(a);
export const max = (a: number, b: number): number => Math.max(a, b);
export const min = (a: number, b: number): number => Math.min(a, b);
export const random = (a: number, b: number): number =>
  Math.random() * (b - a) + a;

export const factorial = (n: number): number => {
  if (n === 0) return 1;
  return n * factorial(n - 1);
};

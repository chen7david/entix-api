import {
  add,
  subtract,
  multiply,
  divide,
  power,
  squareRoot,
  cubeRoot,
  absoluteValue,
  sign,
  max,
  min,
  factorial,
  random,
} from "@/utils/math.util";

describe("Math Utilities", () => {
  describe("Basic Operations", () => {
    test("should add two numbers correctly", () => {
      expect(add(2, 3)).toBe(5);
      expect(add(-1, 1)).toBe(0);
      expect(add(0, 0)).toBe(0);
    });

    test("should subtract two numbers correctly", () => {
      expect(subtract(5, 3)).toBe(2);
      expect(subtract(1, 1)).toBe(0);
      expect(subtract(0, 5)).toBe(-5);
    });

    test("should multiply two numbers correctly", () => {
      expect(multiply(2, 3)).toBe(6);
      expect(multiply(-2, 3)).toBe(-6);
      expect(multiply(0, 5)).toBe(0);
    });

    test("should divide two numbers correctly", () => {
      expect(divide(6, 2)).toBe(3);
      expect(divide(5, 2)).toBe(2.5);
      expect(divide(0, 5)).toBe(0);
    });

    test("should throw error when dividing by zero", () => {
      expect(() => divide(5, 0)).toThrow();
    });
  });

  describe("Power Operations", () => {
    test("should calculate power correctly", () => {
      expect(power(2, 3)).toBe(8);
      expect(power(3, 2)).toBe(9);
      expect(power(2, 0)).toBe(1);
    });

    test("should calculate square root correctly", () => {
      expect(squareRoot(4)).toBe(2);
      expect(squareRoot(9)).toBe(3);
      expect(squareRoot(0)).toBe(0);
    });

    test("should calculate cube root correctly", () => {
      expect(cubeRoot(8)).toBe(2);
      expect(cubeRoot(27)).toBe(3);
      expect(cubeRoot(0)).toBe(0);
    });
  });

  describe("Number Properties", () => {
    test("should calculate absolute value correctly", () => {
      expect(absoluteValue(-5)).toBe(5);
      expect(absoluteValue(5)).toBe(5);
      expect(absoluteValue(0)).toBe(0);
    });

    test("should determine sign correctly", () => {
      expect(sign(-5)).toBe(-1);
      expect(sign(5)).toBe(1);
      expect(sign(0)).toBe(0);
    });

    test("should find maximum correctly", () => {
      expect(max(5, 3)).toBe(5);
      expect(max(-5, 3)).toBe(3);
      expect(max(0, 0)).toBe(0);
    });

    test("should find minimum correctly", () => {
      expect(min(5, 3)).toBe(3);
      expect(min(-5, 3)).toBe(-5);
      expect(min(0, 0)).toBe(0);
    });
  });

  describe("Complex Operations", () => {
    test("should calculate factorial correctly", () => {
      expect(factorial(0)).toBe(1);
      expect(factorial(1)).toBe(1);
      expect(factorial(5)).toBe(120);
    });

    test("should generate random number within range", () => {
      const min = 1;
      const max = 10;
      const randomNum = random(min, max);

      expect(randomNum).toBeGreaterThanOrEqual(min);
      expect(randomNum).toBeLessThanOrEqual(max);
    });
  });
});

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Operator = "+" | "-" | "×" | "÷";

export function Calculator() {
  const [display, setDisplay] = useState("0");
  const [previous, setPrevious] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [waiting, setWaiting] = useState(false);

  const inputDigit = (d: string) => {
    if (waiting) {
      setDisplay(d);
      setWaiting(false);
    } else {
      setDisplay(display === "0" ? d : display + d);
    }
  };

  const inputDot = () => {
    if (waiting) {
      setDisplay("0.");
      setWaiting(false);
      return;
    }
    if (!display.includes(".")) setDisplay(display + ".");
  };

  const clear = () => {
    setDisplay("0");
    setPrevious(null);
    setOperator(null);
    setWaiting(false);
  };

  const toggleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const percent = () => {
    setDisplay(String(parseFloat(display) / 100));
  };

  const compute = (a: number, b: number, op: Operator): number => {
    switch (op) {
      case "+": return a + b;
      case "-": return a - b;
      case "×": return a * b;
      case "÷": return b === 0 ? 0 : a / b;
    }
  };

  const handleOperator = (op: Operator) => {
    const value = parseFloat(display);
    if (previous !== null && operator && !waiting) {
      const result = compute(previous, value, operator);
      setDisplay(String(result));
      setPrevious(result);
    } else {
      setPrevious(value);
    }
    setOperator(op);
    setWaiting(true);
  };

  const equals = () => {
    if (previous === null || operator === null) return;
    const result = compute(previous, parseFloat(display), operator);
    setDisplay(String(result));
    setPrevious(null);
    setOperator(null);
    setWaiting(true);
  };

  const opBtn = (op: Operator) => (
    <Button
      variant={operator === op && waiting ? "secondary" : "default"}
      className="h-16 text-2xl font-medium bg-accent-foreground text-background hover:bg-accent-foreground/90"
      onClick={() => handleOperator(op)}
    >
      {op}
    </Button>
  );

  const numBtn = (n: string) => (
    <Button
      variant="secondary"
      className="h-16 text-2xl font-medium"
      onClick={() => inputDigit(n)}
    >
      {n}
    </Button>
  );

  return (
    <div className="w-full max-w-xs rounded-3xl bg-card p-6 shadow-2xl border border-border">
      <div className="mb-6 rounded-2xl bg-muted px-4 py-6 text-right">
        <div className="text-5xl font-light text-foreground tabular-nums truncate">
          {display}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <Button variant="outline" className="h-16 text-lg font-medium" onClick={clear}>AC</Button>
        <Button variant="outline" className="h-16 text-lg font-medium" onClick={toggleSign}>+/-</Button>
        <Button variant="outline" className="h-16 text-lg font-medium" onClick={percent}>%</Button>
        {opBtn("÷")}

        {numBtn("7")}{numBtn("8")}{numBtn("9")}{opBtn("×")}
        {numBtn("4")}{numBtn("5")}{numBtn("6")}{opBtn("-")}
        {numBtn("1")}{numBtn("2")}{numBtn("3")}{opBtn("+")}

        <Button variant="secondary" className="h-16 text-2xl font-medium col-span-2" onClick={() => inputDigit("0")}>0</Button>
        <Button variant="secondary" className="h-16 text-2xl font-medium" onClick={inputDot}>.</Button>
        <Button className="h-16 text-2xl font-medium bg-primary text-primary-foreground hover:bg-primary/90" onClick={equals}>=</Button>
      </div>
    </div>
  );
}

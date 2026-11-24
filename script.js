const keypad = document.querySelector(".keypad");
const result = document.querySelector("#result");
const expression = document.querySelector("#expression");

const symbols = { "+": "+", "-": "−", "*": "×", "/": "÷" };
const operations = {
  "+": (left, right) => left + right,
  "-": (left, right) => left - right,
  "*": (left, right) => left * right,
  "/": (left, right) => left / right
};

let entry = "0";
let stored = null;
let operator = null;
let replaceEntry = false;
let error = "";

function reset() {
  entry = "0";
  stored = null;
  operator = null;
  replaceEntry = false;
  error = "";
}

function format(number) {
  return String(Number(number.toPrecision(12)));
}

function render() {
  expression.textContent = operator ? stored + " " + symbols[operator] : "";
  result.classList.toggle("error", Boolean(error));
  result.textContent = error || entry;
}

function calculate() {
  const right = Number(entry);
  if (operator === "/" && right === 0) {
    error = "Sıfıra bölmək olmaz";
    return false;
  }

  const value = operations[operator](stored, right);
  if (!Number.isFinite(value)) {
    error = "Nəticə çox böyükdür";
    return false;
  }

  entry = format(value);
  return true;
}

function enterDigit(key) {
  if (replaceEntry) {
    entry = "0";
    replaceEntry = false;
  }

  if (key === ".") {
    if (!entry.includes(".")) entry += ".";
    return;
  }

  if (entry.replace(/[^0-9]/g, "").length >= 12) return;
  if (entry === "0") entry = key;
  else if (entry === "-0") entry = "-" + key;
  else entry += key;
}

function selectOperator(key) {
  if (operator && !replaceEntry && !calculate()) return;
  stored = Number(entry);
  operator = key;
  replaceEntry = true;
}

function editEntry(key) {
  if (replaceEntry && (operator || key === "backspace")) return;

  if (key === "backspace") {
    entry = entry.includes("e") ? "0" : entry.slice(0, -1);
    if (!entry || entry === "-") entry = "0";
  } else if (key === "sign") {
    entry = entry.startsWith("-") ? entry.slice(1) : "-" + entry;
  } else {
    const fraction = Number(entry) / 100;
    const relative = operator === "+" || operator === "-";
    entry = format(relative ? stored * fraction : fraction);
  }
}

function handleKey(key) {
  const isDigit = /^[0-9.]$/.test(key);
  if (key === "clear" || (error && isDigit)) reset();
  if (error) return;

  if (isDigit) {
    enterDigit(key);
  } else if (Object.hasOwn(operations, key)) {
    selectOperator(key);
  } else if (key === "=") {
    if (operator && !replaceEntry && calculate()) {
      stored = null;
      operator = null;
      replaceEntry = true;
    }
  } else if (key !== "clear") {
    editEntry(key);
  }

  render();
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-key]");
  if (button) handleKey(button.dataset.key);
});

const keyboardAliases = {
  Enter: "=",
  Escape: "clear",
  Delete: "clear",
  Backspace: "backspace",
  ",": "."
};

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === "Enter" && event.target.closest("button")) return;

  const key = keyboardAliases[event.key] || event.key;
  if (!/^[0-9.+*/%=-]$/.test(key) && !["clear", "backspace"].includes(key)) return;
  event.preventDefault();
  handleKey(key === "%" ? "percent" : key);
});

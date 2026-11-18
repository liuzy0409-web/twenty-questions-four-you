import { quizContent as content } from "@/data/quizContent";
export const types = ["knowing", "personality", "bold", "creative"] as const;
export type ResultType = (typeof types)[number];
export type Answers = (number | null)[];

// Each row maps the four visible options to their independent score category.
export const scoreMap: readonly (readonly ResultType[])[] = [
  ["creative", "knowing", "bold", "personality"],
  ["personality", "bold", "creative", "knowing"],
  ["knowing", "creative", "personality", "bold"],
  ["bold", "personality", "knowing", "creative"],
  ["personality", "knowing", "creative", "bold"],
  ["creative", "bold", "knowing", "personality"],
  ["bold", "creative", "personality", "knowing"],
  ["knowing", "personality", "bold", "creative"],
  ["creative", "personality", "knowing", "bold"],
  ["bold", "knowing", "personality", "creative"],
  ["personality", "creative", "bold", "knowing"],
  ["knowing", "bold", "creative", "personality"],
  ["bold", "personality", "creative", "knowing"],
  ["knowing", "creative", "bold", "personality"],
  ["creative", "knowing", "personality", "bold"],
  ["personality", "bold", "knowing", "creative"],
  ["knowing", "personality", "creative", "bold"],
  ["creative", "bold", "personality", "knowing"],
  ["personality", "knowing", "bold", "creative"],
  ["bold", "creative", "knowing", "personality"],
];

export function isResultType(value: unknown): value is ResultType {
  return types.some((type) => type === value);
}

export function isComplete(answers: Answers): boolean {
  return answers.length === 20 && answers.every((answer) => Number.isInteger(answer) && answer !== null && answer >= 0 && answer < 4);
}

export function calculateResult(answers: Answers) {
  if (!isComplete(answers)) throw new Error(content.errors.incomplete);
  const scores: Record<ResultType, number> = { knowing: 0, personality: 0, bold: 0, creative: 0 };
  answers.forEach((answer, index) => {
    const type = typeof answer === "number" ? scoreMap[index]?.[answer] : undefined;
    if (type) scores[type] += 1;
  });
  const highest = Math.max(...Object.values(scores));
  const tied = types.filter((type) => scores[type] === highest);
  if (tied.length === 1 && tied[0]) return { type: tied[0], scores };
  // A top-scoring category has at least one answer, so the backward scan always finds it.
  for (let index = 19; index >= 0; index -= 1) {
    const answer = answers[index];
    const type = typeof answer === "number" ? scoreMap[index]?.[answer] : undefined;
    if (type && tied.includes(type)) return { type, scores };
  }
  throw new Error(content.errors.calculation);
}
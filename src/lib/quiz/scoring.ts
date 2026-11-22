
import { quizContent as content, questions } from "@/data/quizContent";

export const types = [
  "knowing",
  "personality",
  "bold",
  "creative",
] as const;

export type ResultType = (typeof types)[number];

export type Answers = (number | null)[];

export const scoreMap: readonly (readonly ResultType[])[] = [
  ["knowing", "personality", "bold", "creative"], // 1
  ["creative", "personality", "knowing", "bold"], // 2
  ["knowing", "personality", "bold", "creative"], // 3
  ["bold", "creative", "knowing", "personality"], // 4
  ["knowing", "bold", "creative", "personality"], // 5
  ["knowing", "creative", "bold", "personality"], // 6
  ["personality", "bold", "creative", "knowing"], // 7
  ["knowing", "bold", "personality", "creative"], // 8
  ["creative", "knowing", "personality", "bold"], // 9
  ["knowing", "creative", "bold", "personality"], // 10
  ["knowing", "personality", "bold", "creative"], // 11
  ["knowing", "bold", "creative", "personality"], // 12
  ["bold", "knowing", "creative", "personality"], // 13
  ["knowing", "bold", "creative", "personality"], // 14
  ["creative", "knowing", "bold", "personality"], // 15
  ["knowing", "creative", "bold", "personality"], // 16
  ["knowing", "bold", "personality", "creative"], // 17
  ["creative", "bold", "knowing", "personality"], // 18
  ["creative", "knowing", "bold", "personality"], // 19
  ["creative", "bold", "knowing", "personality"], // 20
];

export function isResultType(value: unknown): value is ResultType {
  return types.includes(value as ResultType);
}

export function isComplete(answers: Answers): boolean {
  return (
    answers.length === questions.length &&
    answers.every(
      (answer) =>
        Number.isInteger(answer) &&
        answer !== null &&
        answer >= 0 &&
        answer <= 3,
    )
  );
}

export function calculateResult(answers: Answers): {
  type: ResultType;
  types: ResultType[];
  scores: Record<ResultType, number>;
} {
  if (!isComplete(answers)) {
    throw new Error(content.errors.incomplete);
  }

  const scores: Record<ResultType, number> = {
    knowing: 0,
    personality: 0,
    bold: 0,
    creative: 0,
  };

  answers.forEach((answer, index) => {
    if (answer === null) {
      throw new Error(content.errors.calculation);
    }

    const selectedType = scoreMap[index]?.[answer];

    if (!selectedType) {
      throw new Error(content.errors.calculation);
    }

    scores[selectedType] += 1;
  });

  const highestScore = Math.max(...types.map((type) => scores[type]));

  const topTypes = types.filter(
    (type) => scores[type] === highestScore,
  );

  return {
    // 兼容原有结果页
    type: topTypes[0],
    // 新增：保留全部最高分人格
    types: topTypes,
    scores,
  };
}

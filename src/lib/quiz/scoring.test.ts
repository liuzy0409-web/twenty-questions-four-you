import { describe, expect, it } from "vitest";
import { calculateResult, isComplete, scoreMap, types, type ResultType } from "./scoring";
import { questions } from "./questions";
import { resultUrl } from "./share";
import { clearProgress, emptyProgress, loadProgress, saveProgress } from "./progress";

function answersFor(sequence: ResultType[]) {
  return sequence.map((type, index) => scoreMap[index]?.indexOf(type) ?? -1);
}
describe("20-question sorting rules", () => {
  it("contains exactly 20 questions and 4 options per question", () => {
    expect(questions).toHaveLength(20);
    for (const question of questions) expect(question.options).toHaveLength(4);
  });
  it("maps each question to all four types exactly once", () => {
    expect(scoreMap).toHaveLength(20);
    for (const row of scoreMap) expect([...row].sort()).toEqual([...types].sort());
  });
  it("contains exactly 20 options per type and varies their positions", () => {
    for (const type of types) {
      expect(scoreMap.flat().filter((value) => value === type)).toHaveLength(20);
      expect(new Set(scoreMap.map((row) => row.indexOf(type))).size).toBe(4);
    }
  });
  for (const type of types) it(`awards exactly 20 points to ${type} when all choices match`, () => {
    const result = calculateResult(answersFor(Array(20).fill(type)));
    expect(result.type).toBe(type);
    expect(result.scores[type]).toBe(20);
    expect(Object.values(result.scores).reduce((a, b) => a + b, 0)).toBe(20);
    for (const other of types.filter((value) => value !== type)) expect(result.scores[other]).toBe(0);
  });
  it("refuses incomplete 20-answer submissions", () => {
    expect(isComplete(Array(20).fill(null))).toBe(false);
    expect(() => calculateResult(Array(19).fill(0))).toThrow();
    expect(() => calculateResult([...Array(19).fill(0), null])).toThrow();
    expect(() => calculateResult([...Array(19).fill(0), 4])).toThrow();
  });
  it("resolves a four-way tie using question 20", () => {
    const sequence = Array.from({ length: 20 }, (_, i) => types[i % 4] ?? "knowing");
    const result = calculateResult(answersFor(sequence));
    expect(result.scores).toEqual({ knowing: 5, personality: 5, bold: 5, creative: 5 });
    expect(result.type).toBe("creative");
  });
  it("uses question 19 if question 20 is not a top-scoring type", () => {
    const sequence: ResultType[] = [...Array(8).fill("knowing"), ...Array(8).fill("bold"), "personality", "creative", "bold", "personality"];
    sequence[0] = "knowing"; sequence[8] = "knowing";
    const result = calculateResult(answersFor(sequence));
    expect(result.scores).toEqual({ knowing: 9, personality: 2, bold: 8, creative: 1 });
    // Construct an actual 8–8 tie with two non-leading final answers.
    const tied: ResultType[] = [...Array(8).fill("knowing"), ...Array(7).fill("bold"), "personality", "creative", "creative", "bold", "personality"];
    const computed = calculateResult(answersFor(tied));
    expect(computed.scores).toEqual({ knowing: 8, personality: 2, bold: 8, creative: 2 });
    expect(computed.type).toBe("bold");
  });
  it("continues backward through question 18 when the last two cannot break a tie", () => {
    const sequence: ResultType[] = [...Array(8).fill("bold"), ...Array(7).fill("knowing"), "personality", "creative", "knowing", "personality", "creative"];
    expect(calculateResult(answersFor(sequence)).type).toBe("knowing");
  });
  it("replaces rather than accumulates points after changing an answer", () => {
    const answers = answersFor(Array(20).fill("knowing"));
    calculateResult(answers); calculateResult(answers);
    answers[0] = scoreMap[0]?.indexOf("bold") ?? -1;
    expect(calculateResult(answers).scores).toEqual({ knowing: 19, bold: 1, creative: 0, personality: 0 });
  });
});
describe("progress and shared links", () => {
  it("retains selected answers and the current question after reading storage", () => {
    const progress = emptyProgress(); progress.answers[0] = 2; progress.index = 3;
    saveProgress(progress);
    expect(loadProgress()).toEqual(progress);
  });
  it("clears all answers for a fresh test", () => {
    saveProgress({ answers: Array(20).fill(1), index: 19 }); clearProgress();
    expect(loadProgress()).toBeNull();
    expect(emptyProgress()).toEqual({ answers: Array(20).fill(null), index: 0 });
  });
  it("shares each result on the deployment origin without quiz answers", () => {
    for (const type of types) expect(resultUrl(type, "https://fans.example.com")).toBe(`https://fans.example.com/?result=${type}`);
  });
});
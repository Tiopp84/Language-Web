import { normalizeForCompare, normalizeGerman, stripTrailingPunctuation } from "@/lib/utils";
import type { ExerciseQuestion } from "@/data/content";

export function isAnswerCorrect(question: ExerciseQuestion, response: string | string[] | undefined) {
  if (response === undefined) return false;

  if (question.type === "order") {
    const expected = Array.isArray(question.answer) ? question.answer : question.answer.split(" ");
    const actual = Array.isArray(response) ? response : response.split(" ");
    return normalizeForCompare(actual.join(" ")) === normalizeForCompare(expected.join(" "));
  }

  if (question.type === "fill") {
    const actual = normalizeForCompare(Array.isArray(response) ? response.join(" ") : response);
    const accepted = [question.answer, ...(question.acceptable ?? [])]
      .filter((item): item is string => typeof item === "string")
      .map((item) => normalizeForCompare(stripTrailingPunctuation(item)));
    return accepted.includes(normalizeForCompare(stripTrailingPunctuation(actual)));
  }

  return response === question.answer;
}

export function shapeExerciseScore(question: ExerciseQuestion, response: string | string[] | undefined) {
  return isAnswerCorrect(question, response);
}

export function displayCorrectAnswer(question: ExerciseQuestion) {
  if (question.type === "order") {
    return Array.isArray(question.answer) ? question.answer.join(" ") : question.answer;
  }
  if (question.type === "mcq" || question.type === "truefalse") {
    const option = question.options?.find((item) => item.id === question.answer);
    return option?.label ?? question.answer;
  }
  return Array.isArray(question.answer) ? question.answer[0] : question.answer;
}

export function normalizeDictation(value: string) {
  return normalizeGerman(value);
}

export interface DictationToken {
  raw: string;
  core: string;
  normalized: string;
  hasCaseMismatch?: boolean;
}

function tokenize(text: string): DictationToken[] {
  return normalizeGerman(text)
    .split(" ")
    .filter(Boolean)
    .map((raw) => {
      const core = raw.replace(/^[„“"'()]+|[.,!?;:„“"'()]+$/gu, "");
      return { raw, core, normalized: core.toLocaleLowerCase("de-DE") };
    });
}

export type DiffOp =
  | { type: "equal"; target: DictationToken; user: DictationToken; caseMismatch: boolean }
  | { type: "wrong"; target: DictationToken; user: DictationToken }
  | { type: "missing"; target: DictationToken }
  | { type: "extra"; user: DictationToken };

function diffOperations(target: DictationToken[], user: DictationToken[]): DiffOp[] {
  const rows = target.length + 1;
  const cols = user.length + 1;
  const dp: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i <= target.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= user.length; j += 1) dp[0][j] = j;

  for (let i = 1; i <= target.length; i += 1) {
    for (let j = 1; j <= user.length; j += 1) {
      if (target[i - 1].normalized === user[j - 1].normalized) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]) + 1;
      }
    }
  }

  const ops: DiffOp[] = [];
  let i = target.length;
  let j = user.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && target[i - 1].normalized === user[j - 1].normalized) {
      const caseMismatch = target[i - 1].core !== user[j - 1].core;
      ops.push({ type: "equal", target: target[i - 1], user: user[j - 1], caseMismatch });
      i -= 1;
      j -= 1;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      ops.push({ type: "wrong", target: target[i - 1], user: user[j - 1] });
      i -= 1;
      j -= 1;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      ops.push({ type: "missing", target: target[i - 1] });
      i -= 1;
    } else {
      ops.push({ type: "extra", user: user[j - 1] });
      j -= 1;
    }
  }

  return ops.reverse();
}

export interface DictationResult {
  ops: DiffOp[];
  targetTokens: DictationToken[];
  userTokens: DictationToken[];
  correctCount: number;
  wrongCount: number;
  missingCount: number;
  extraCount: number;
  accuracy: number;
  capitalizationIssues: string[];
  punctuationIssue: boolean;
}

export function evaluateDictation(targetText: string, userText: string): DictationResult {
  const targetTokens = tokenize(targetText);
  const userTokens = tokenize(userText);
  const ops = diffOperations(targetTokens, userTokens);

  const correctCount = ops.filter((op) => op.type === "equal").length;
  const wrongCount = ops.filter((op) => op.type === "wrong").length;
  const missingCount = ops.filter((op) => op.type === "missing").length;
  const extraCount = ops.filter((op) => op.type === "extra").length;
  const capitalizationIssues = ops
    .filter((op): op is Extract<DiffOp, { type: "equal" }> => op.type === "equal" && op.caseMismatch)
    .map((op) => `${op.user.core} → ${op.target.core}`);

  const targetEnd = normalizeGerman(targetText).slice(-1);
  const userEnd = normalizeGerman(userText).slice(-1);
  const punctuationIssue = /[.!?]/u.test(targetEnd) && targetEnd !== userEnd;

  const accuracy =
    targetTokens.length === 0
      ? 0
      : Math.round((correctCount / targetTokens.length) * 100);

  return {
    ops,
    targetTokens,
    userTokens,
    correctCount,
    wrongCount,
    missingCount,
    extraCount,
    accuracy,
    capitalizationIssues,
    punctuationIssue,
  };
}

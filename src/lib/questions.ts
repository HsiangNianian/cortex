export interface Question {
  id: number
  type: "logic" | "math" | "vocab"
  category: string
  question: string
  options: string[]
  answer: number // index into options
  explanation: string
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    type: "logic",
    category: "逻辑推理",
    question:
      "某仓库失窃，四人接受调查。他们的陈述如下：\n\n甲说：\"不是我干的。\"\n乙说：\"是丙干的。\"\n丙说：\"不是我干的。\"\n丁说：\"甲说的是真话。\"\n\n已知四人中只有一人说了真话。那么谁是作案者？",
    options: ["甲", "乙", "丙", "丁"],
    answer: 0,
    explanation:
      "逐一假设：\n如果甲是作案者，则：甲假、乙假、丙真、丁假 → 恰好一真 ✅\n如果乙是作案者，则：甲真、乙假、丙真、丁真 → 三真 ❌\n如果丙是作案者，则：甲真、乙真、丙假、丁真 → 三真 ❌\n如果丁是作案者，则：甲真、乙假、丙真、丁真 → 三真 ❌\n\n因此作案者是甲。",
  },
  {
    id: 2,
    type: "math",
    category: "速算",
    question:
      "一本书原价 240 元。书店先提价 25%，再打八折出售。最终售价比原价：",
    options: ["比原价高", "比原价低", "和原价一样", "无法确定"],
    answer: 2,
    explanation:
      "提价 25% 后：240 × 1.25 = 300 元\n打八折后：300 × 0.8 = 240 元\n最终价格和原价一样。\n\n25% 和八折互为倒数——很多人直觉认为\"先提后打折肯定不一样\"，但数学上一加一减恰好抵消。",
  },
  {
    id: 3,
    type: "vocab",
    category: "词汇语义",
    question: "下列哪个词语与其他三个不属于同一类？",
    options: ["高瞻远瞩", "鼠目寸光", "井底之蛙", "坐井观天"],
    answer: 0,
    explanation:
      "\"高瞻远瞩\"是褒义词，形容眼光远大。\n\"鼠目寸光\"\"井底之蛙\"\"坐井观天\"都是贬义词，形容见识短浅。\n\n这题测试的是词汇的褒贬义辨析——看似同类，但情感色彩不同。",
  },
  {
    id: 4,
    type: "logic",
    category: "数列推理",
    question: "观察数列，找出规律：\n\n3, 8, 15, 24, 35, ?\n\n问号处应填入什么数字？",
    options: ["42", "46", "48", "50"],
    answer: 2,
    explanation:
      "相邻两项的差值：\n8 − 3 = 5, 15 − 8 = 7, 24 − 15 = 9, 35 − 24 = 11\n差值构成等差数列：5, 7, 9, 11, 13...\n所以下一个数 = 35 + 13 = 48\n\n也可看作：1×3, 2×4, 3×5, 4×6, 5×7, 6×8 = 48",
  },
  {
    id: 5,
    type: "logic",
    category: "逻辑推理",
    question:
      "在一次同学聚会上，五名老同学见面后互相握手。每两人之间只握一次手。他们一共握了多少次手？",
    options: ["8 次", "10 次", "12 次", "15 次"],
    answer: 1,
    explanation:
      "从 5 人中选 2 人握手，组合数公式：\nC(5,2) = 5 × 4 ÷ 2 = 10\n\n也可以这样理解：每个人跟其他 4 人握手，但每次握手被计算了两次：\n5 × 4 ÷ 2 = 10",
  },
]

export const QUESTION_TIME = 40 // seconds per question

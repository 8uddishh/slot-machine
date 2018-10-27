export const SLOT_BAR = 1;
export const SLOT_BAR2 = 2;
export const SLOT_BAR3 = 4;
export const SLOT_NUMBER_7 = 8;
export const SLOT_CHERRY = 16;

/* eslint no-bitwise: ["error", { "allow": ["|"] }] */
export const winningCombinations = [
  {
    slotPosition: 0,
    winnings: [
      {
        combination: SLOT_CHERRY,
        score: 2000,
      },
      {
        combination: SLOT_NUMBER_7,
        score: 150,
      },
      {
        combination: SLOT_NUMBER_7 | SLOT_CHERRY,
        score: 75,
      },
      {
        combination: SLOT_BAR3,
        score: 50,
      },
      {
        combination: SLOT_BAR2,
        score: 20,
      },
      {
        combination: SLOT_BAR,
        score: 10,
      },
      {
        combination: SLOT_BAR | SLOT_BAR2 | SLOT_BAR3,
        score: 5,
      },
      {
        combination: SLOT_BAR | SLOT_BAR2,
        score: 5,
      },
      {
        combination: SLOT_BAR | SLOT_BAR3,
        score: 5,
      },
      {
        combination: SLOT_BAR2 | SLOT_BAR3,
        score: 5,
      },
    ],
  },
  {
    slotPosition: 1,
    winnings: [
      {
        combination: SLOT_CHERRY,
        score: 1000,
      },
      {
        combination: SLOT_NUMBER_7,
        score: 150,
      },
      {
        combination: SLOT_NUMBER_7 | SLOT_CHERRY,
        score: 75,
      },
      {
        combination: SLOT_BAR3,
        score: 50,
      },
      {
        combination: SLOT_BAR2,
        score: 20,
      },
      {
        combination: SLOT_BAR,
        score: 10,
      },
      {
        combination: SLOT_BAR | SLOT_BAR2 | SLOT_BAR3,
        score: 5,
      },
      {
        combination: SLOT_BAR | SLOT_BAR2,
        score: 5,
      },
      {
        combination: SLOT_BAR | SLOT_BAR3,
        score: 5,
      },
      {
        combination: SLOT_BAR2 | SLOT_BAR3,
        score: 5,
      },
    ],
  },
  {
    slotPosition: 2,
    winnings: [
      {
        combination: SLOT_CHERRY,
        score: 4000,
      },
      {
        combination: SLOT_NUMBER_7,
        score: 150,
      },
      {
        combination: SLOT_NUMBER_7 | SLOT_CHERRY,
        score: 75,
      },
      {
        combination: SLOT_BAR3,
        score: 50,
      },
      {
        combination: SLOT_BAR2,
        score: 20,
      },
      {
        combination: SLOT_BAR,
        score: 10,
      },
      {
        combination: SLOT_BAR | SLOT_BAR2 | SLOT_BAR3,
        score: 5,
      },
      {
        combination: SLOT_BAR | SLOT_BAR2,
        score: 5,
      },
      {
        combination: SLOT_BAR | SLOT_BAR3,
        score: 5,
      },
      {
        combination: SLOT_BAR2 | SLOT_BAR3,
        score: 5,
      },
    ],
  },
];

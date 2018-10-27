export const SLOT_BAR = 1;
export const SLOT_BAR2 = 2;
export const SLOT_BAR3 = 4;
export const SLOT_NUMBER_7 = 8;
export const SLOT_CHERRY = 16;

export const paylineInfo = [
  '3 CHERRY symbols on top line 2000',
  '3 CHERRY symbols on center line 1000',
  '3 CHERRY symbols on bottom line 4000',
  '3 7 symbols on any line 150',
  'Any combination of CHERRY and 7 on any line 75',
  '3 3xBAR symbols on any line 50',
  '3 2xBAR symbols on any line 20',
  '3 BAR symbols on any line 10',
  'Combination of any BAR symbols on any line 5',
];

/* eslint no-bitwise: ["error", { "allow": ["|"] }] */
export const winningCombinations = [
  {
    slotPosition: 0,
    winnings: [
      {
        combination: SLOT_CHERRY,
        score: 2000,
        paylinePos: 0,
      },
      {
        combination: SLOT_NUMBER_7,
        score: 150,
        paylinePos: 3,
      },
      {
        combination: SLOT_NUMBER_7 | SLOT_CHERRY,
        score: 75,
        paylinePos: 4,
      },
      {
        combination: SLOT_BAR3,
        score: 50,
        paylinePos: 5,
      },
      {
        combination: SLOT_BAR2,
        score: 20,
        paylinePos: 6,
      },
      {
        combination: SLOT_BAR,
        score: 10,
        paylinePos: 7,
      },
      {
        combination: SLOT_BAR | SLOT_BAR2 | SLOT_BAR3,
        score: 5,
        paylinePos: 8,
      },
      {
        combination: SLOT_BAR | SLOT_BAR2,
        score: 5,
        paylinePos: 8,
      },
      {
        combination: SLOT_BAR | SLOT_BAR3,
        score: 5,
        paylinePos: 8,
      },
      {
        combination: SLOT_BAR2 | SLOT_BAR3,
        score: 5,
        paylinePos: 8,
      },
    ],
  },
  {
    slotPosition: 1,
    winnings: [
      {
        combination: SLOT_CHERRY,
        score: 1000,
        paylinePos: 1,
      },
      {
        combination: SLOT_NUMBER_7,
        score: 150,
        paylinePos: 3,
      },
      {
        combination: SLOT_NUMBER_7 | SLOT_CHERRY,
        score: 75,
        paylinePos: 4,
      },
      {
        combination: SLOT_BAR3,
        score: 50,
        paylinePos: 5,
      },
      {
        combination: SLOT_BAR2,
        score: 20,
        paylinePos: 6,
      },
      {
        combination: SLOT_BAR,
        score: 10,
        paylinePos: 7,
      },
      {
        combination: SLOT_BAR | SLOT_BAR2 | SLOT_BAR3,
        score: 5,
        paylinePos: 8,
      },
      {
        combination: SLOT_BAR | SLOT_BAR2,
        score: 5,
        paylinePos: 8,
      },
      {
        combination: SLOT_BAR | SLOT_BAR3,
        score: 5,
        paylinePos: 8,
      },
      {
        combination: SLOT_BAR2 | SLOT_BAR3,
        score: 5,
        paylinePos: 8,
      },
    ],
  },
  {
    slotPosition: 2,
    winnings: [
      {
        combination: SLOT_CHERRY,
        score: 4000,
        paylinePos: 2,
      },
      {
        combination: SLOT_NUMBER_7,
        score: 150,
        paylinePos: 3,
      },
      {
        combination: SLOT_NUMBER_7 | SLOT_CHERRY,
        score: 75,
        paylinePos: 4,
      },
      {
        combination: SLOT_BAR3,
        score: 50,
        paylinePos: 5,
      },
      {
        combination: SLOT_BAR2,
        score: 20,
        paylinePos: 6,
      },
      {
        combination: SLOT_BAR,
        score: 10,
        paylinePos: 7,
      },
      {
        combination: SLOT_BAR | SLOT_BAR2 | SLOT_BAR3,
        score: 5,
        paylinePos: 8,
      },
      {
        combination: SLOT_BAR | SLOT_BAR2,
        score: 5,
        paylinePos: 8,
      },
      {
        combination: SLOT_BAR | SLOT_BAR3,
        score: 5,
        paylinePos: 8,
      },
      {
        combination: SLOT_BAR2 | SLOT_BAR3,
        score: 5,
        paylinePos: 8,
      },
    ],
  },
];

export const HasFlag = (combined, flag) => (combined | flag) === combined;

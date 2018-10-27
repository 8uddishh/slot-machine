/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint no-bitwise: ["error", { "allow": ["|"] }] */

import {
  from,
  interval,
  of,
  BehaviorSubject,
} from 'rxjs';

import {
  map,
  tap,
  combineAll,
  take,
  filter,
} from 'rxjs/operators';

import {
  SLOT_BAR,
  SLOT_BAR2,
  SLOT_BAR3,
  SLOT_CHERRY,
  SLOT_NUMBER_7,
  winningCombinations,
  HasFlag,
  paylineInfo,
} from './combinations';

import bar2x from '../assets/2xBAR.png';
import bar3x from '../assets/3xBAR.png';
import num7 from '../assets/7.png';
import bar from '../assets/BAR.png';
import cherry from '../assets/Cherry.png';

export default class slotManager {
  constructor() {
    this.slots = [0, 1, 2];
    this.imageSprites = [
      bar3x,
      bar,
      bar2x,
      num7,
      cherry,
      bar3x,
      bar,
      bar2x,
      num7,
      cherry,
    ];
    this.slotImages = [
      { text: 'bar3x', value: SLOT_BAR3 },
      { text: 'bar', value: SLOT_BAR },
      { text: 'bar2x', value: SLOT_BAR2 },
      { text: 'num7', value: SLOT_NUMBER_7 },
      { text: 'cherry', value: SLOT_CHERRY },
    ];
    this.betweens = [
      { min: 1600, max: 2800 },
      { min: 3200, max: 4800 },
      { min: 5000, max: 6500 },
    ];
    this.randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    this.imagePositions = [[], [], []];
    this.scoreReducer = new BehaviorSubject(0);
    this.scoreIncrementer = new BehaviorSubject(0);
    this.winSlotDisplayer = new BehaviorSubject('');
    this.getPayline = () => from(paylineInfo);
  }

  getSlotDimensions() {
    return from(this.slots).pipe(
      map(idx => ({
        idx,
        x: idx * 161,
        y: 0,
        height: 2000,
        width: 161,
      })),
    );
  }

  getImagePositions(reelnum) {
    let runner = 0;
    return from(this.imageSprites).pipe(
      map(img => ({
        img,
        x: 10,
        y: runner * 200 + 10,
        name: this.slotImages[runner % 5].text,
        slotId: this.slotImages[runner % 5].value,
      })),
      tap((img) => {
        this.imagePositions[reelnum].push(img);
        runner += 1;
      }),
    );
  }

  getRandomInterval(slot) {
    const { min, max } = this.betweens[slot];
    return this.randomBetween(min, max);
  }

  getTopPosition(currentY, spinEnded) {
    if (!spinEnded) {
      if (currentY < -1000) {
        return 410;
      }
      return currentY - 10;
    }

    const y = -1 * currentY;
    const lessers = this.imagePositions[0].filter(img => img.y <= y);
    const greater = this.imagePositions[0].find(img => img.y >= y);
    if (lessers && lessers.length > 0) {
      const less = [...lessers].pop();
      if (y - less.y < greater.y - y) {
        return -1 * (less.y - 10);
      }
      return -1 * (greater.y - 10);
    }
    return 0;
  }

  getQualifyingReelImages(reelnum, topY) {
    return from(this.imagePositions[reelnum]).pipe(
      filter(img => img.y >= topY),
      take(3),
      map(img => of({ name: img.name, slotId: img.slotId })),
      combineAll(),
    );
  }

  spinReel(intvl, reel) {
    return interval(1).pipe(
      take(Math.floor(intvl / 5)),
      tap((spin) => {
        reel.y = this.getTopPosition(reel.y);
        if (Math.floor(intvl / 5) - spin === 1) {
          reel.y = this.getTopPosition(reel.y, true);
        }
      }),
    );
  }

  calculate(scores) {
    const rowTopWinnings = winningCombinations
      .find(x => x.slotPosition === 0)
      .winnings.filter(x => HasFlag(
        x.combination,
        scores[0][0].slotId | scores[1][0].slotId | scores[2][0].slotId,
      ));

    const rowMiddleWinnings = winningCombinations
      .find(x => x.slotPosition === 1)
      .winnings.filter(x => HasFlag(
        x.combination,
        scores[0][1].slotId | scores[1][1].slotId | scores[2][1].slotId,
      ));

    const rowBottomWinnings = winningCombinations
      .find(x => x.slotPosition === 2)
      .winnings.filter(x => HasFlag(
        x.combination,
        scores[0][2].slotId | scores[1][2].slotId | scores[2][2].slotId,
      ));

    const rowTopMax = Math.max(...rowTopWinnings.map(w => w.score), 0);
    const rowMiddleMax = Math.max(...rowMiddleWinnings.map(w => w.score), 0);
    const rowBottomMax = Math.max(...rowBottomWinnings.map(w => w.score), 0);

    if (
      rowTopMax > 0
      && rowTopMax >= rowMiddleMax
      && rowTopMax >= rowBottomMax
    ) {
      this.scoreIncrementer.next(rowTopMax);
      this.winSlotDisplayer.next('top');
      return;
    }

    if (
      rowMiddleMax > 0
      && rowMiddleMax > rowTopMax
      && rowMiddleMax >= rowBottomMax
    ) {
      this.scoreIncrementer.next(rowMiddleMax);
      this.winSlotDisplayer.next('middle');
      return;
    }

    if (
      rowBottomMax > 0
      && rowBottomMax > rowTopMax
      && rowBottomMax > rowMiddleMax
    ) {
      this.scoreIncrementer.next(rowBottomMax);
      this.winSlotDisplayer.next('bottom');
    }
  }
}

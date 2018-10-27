import { from, of, interval } from 'rxjs';
import {
  map,
  tap,
  switchMap,
  mergeMap,
  combineAll,
  take,
  filter
} from 'rxjs/operators';
import {
  SLOT_BAR,
  SLOT_BAR2,
  SLOT_BAR3,
  SLOT_CHERRY,
  SLOT_NUMBER_7
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
      cherry
    ];
    this.slotImages = [
      { text: 'bar3x', value: SLOT_BAR3 },
      { text: 'bar', value: SLOT_BAR },
      { text: 'bar2x', value: SLOT_BAR2 },
      { text: 'num7', value: SLOT_NUMBER_7 },
      { text: 'cherry', value: SLOT_CHERRY }
    ];
    this.betweens = [
      { min: 1600, max: 2800 },
      { min: 3200, max: 4800 },
      { min: 5000, max: 6500 }
    ];
    this.randomBetween = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    this.imagePositions = [];
  }

  getSlotDimensions() {
    return from(this.slots).pipe(
      map(idx => ({
        idx,
        x: idx * 161,
        y: 0,
        height: 2000,
        width: 161
      }))
    );
  }

  getImagePositions() {
    let runner = 0;
    const shouldInsert = this.imagePositions.length === 0;
    return from(this.imageSprites).pipe(
      map(img => ({
        img,
        x: 10,
        y: runner * 200 + 10,
        name: this.slotImages[runner % 5].text,
        slotId: this.slotImages[runner % 5].value
      })),
      tap(img => {
        if (shouldInsert) {
          this.imagePositions.push(img);
        }
        runner += 1;
      })
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
    const lessers = this.imagePositions.filter(img => img.y <= y);
    const greater = this.imagePositions.find(img => img.y >= y);
    if (lessers && lessers.length > 0) {
      const less = [...lessers].pop();
      if (y - less.y < greater.y - y) {
        return -1 * (less.y - 10);
      }
      return -1 * (greater.y - 10);
    }
    return 0;
  }
}

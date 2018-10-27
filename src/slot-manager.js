import { from, of, interval, BehaviorSubject } from 'rxjs';
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
  SLOT_NUMBER_7,
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
      { text: 'cherry', value: SLOT_CHERRY }
    ];
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

  getImagePositions() {
    let runner = 0;
    return from(this.imageSprites).pipe(
      map(img => ({
        img,
        x: 10,
        y: runner * 200 + 10,
        name: this.slotImages[runner % 5].text,
        slotId: this.slotImages[runner % 5].value,
      })),
      tap(() => {
        runner += 1;
      }),
    );
  }
}

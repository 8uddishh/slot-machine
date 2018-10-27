/* eslint no-bitwise: ["error", { "allow": ["|"] }] */
/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint no-plusplus: [0] */

import {
  Application,
  Sprite,
  Container,
  Graphics,
  TextStyle,
  Text,
} from 'pixi.js';

import {
  from,
  of,
  interval,
  BehaviorSubject,
} from 'rxjs';

import {
  map,
  tap,
  switchMap,
  mergeMap,
  combineAll,
  take,
  filter,
  concatMap,
} from 'rxjs/operators';

import '../assets/style.css';
import buttonSp from '../assets/spin-button.png';
import {
  winningCombinations,
} from './combinations';

import SlotManager from './slot-manager';

const HasFlag = (combined, flag) => (combined | flag) === combined;
const sltMgr = new SlotManager();
let startScore = 1000;
const scoreReducer = new BehaviorSubject(0);
const scoreIncrementer = new BehaviorSubject(0);
const winSlotDisplayer = new BehaviorSubject('');
const app = new Application(750, 550);
app.renderer.backgroundColor = 0xf5f5f5;
const { view } = app;

const playContainer = new Container();
const reels = [];
const images = [[], [], []];
let spinCounter = -1;

playContainer.x = 0;
playContainer.y = 0;
playContainer.height = 500;
playContainer.width = 900;
app.stage.addChild(playContainer);

const controlContainer = new Container();
controlContainer.x = 485;
controlContainer.y = 0;
controlContainer.height = 500;
controlContainer.width = 217;
app.stage.addChild(controlContainer);

const winningSlot = new Graphics();
winningSlot.lineStyle(2, 0x003300, 1);
winningSlot.beginFill(0x009933, 0.25);
winningSlot.drawRoundedRect(10, -121, 460, 120, 10);
winningSlot.endFill();

app.stage.addChild(winningSlot);

/* eslint no-undef: "off" */
document.getElementById('playground').appendChild(view);

const top = new Graphics();
top.beginFill(0, 1);
top.drawRect(490, 10, 250, 530);
playContainer.addChild(top);

const style = new TextStyle({
  fontFamily: 'Arial',
  fontSize: 48,
  fontStyle: 'italic',
  fontWeight: 'bold',
  fill: ['#ffffff', '#00ff99'], // gradient
  stroke: '#4a1850',
  strokeThickness: 5,
  dropShadow: true,
  dropShadowColor: '#000000',
  dropShadowBlur: 4,
  dropShadowAngle: Math.PI / 6,
  dropShadowDistance: 6,
  wordWrap: true,
  wordWrapWidth: 440,
});

const scoreBoard = new Text(startScore, style);
scoreBoard.x = 575;
scoreBoard.y = 30;
top.addChild(scoreBoard);

const button = Sprite.fromImage(buttonSp);
button.interactive = true;
button.buttonMode = true;
button.x = 50;
button.y = 200;

controlContainer.addChild(button);

sltMgr.getSlotDimensions()
  .pipe(
    map(attr => ({ reelContainer: new Container(), ...attr })),
    tap(({
      reelContainer,
      x,
      y,
      height,
      width,
    }) => {
      reelContainer.x = x;
      reelContainer.y = y;
      reelContainer.height = height;
      reelContainer.width = width;
    }),
    map(({ reelContainer, idx }) => ({ reelContainer, idx })),
    switchMap(({ reelContainer, idx }) => sltMgr.getImagePositions().pipe(
      map(({
        img,
        x,
        y,
        name,
        slotId,
      }) => ({
        img: Sprite.fromImage(img),
        x,
        y,
        name,
        slotId,
      })),
      tap(({
        img, x, y, name, slotId,
      }) => {
        img.x = x;
        img.y = y;
        img.name = name;
        img.slotId = slotId;
        reelContainer.addChild(img);
        images[idx].push(img);
      }),
      map(({
        img,
      }) => of(img)),
      combineAll(),
      tap(() => {
        reelContainer.idx = idx;
      }),
      map(() => reelContainer),
    )),
  )
  .subscribe((reelContainer) => {
    reels.push(reelContainer);
    playContainer.addChild(reelContainer);
  });

let spinning = false;

const calculate = () => {
  let index = 0;
  from(reels)
    .pipe(
      map(reel => ({ topY: -1 * reel.y + 10, idx: index })),
      tap(() => {
        index += 1;
      }),
      switchMap(({ topY, idx }) => from(images[idx]).pipe(
        filter(img => img.y >= topY),
        take(3),
        map(img => of({ name: img.name, slotId: img.slotId })),
        combineAll(),
      )),
      map(img => of(img)),
      combineAll(),
    )
    .subscribe((scores) => {
      spinning = false;
      spinCounter = -1;
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
        scoreIncrementer.next(rowTopMax);
        winSlotDisplayer.next('top');
        return;
      }

      if (
        rowMiddleMax > 0
        && rowMiddleMax > rowTopMax
        && rowMiddleMax >= rowBottomMax
      ) {
        scoreIncrementer.next(rowMiddleMax);
        winSlotDisplayer.next('middle');
        return;
      }

      if (
        rowBottomMax > 0
        && rowBottomMax > rowTopMax
        && rowBottomMax > rowMiddleMax
      ) {
        scoreIncrementer.next(rowBottomMax);
        winSlotDisplayer.next('bottom');
      }
    });
};

button.on('pointerdown', () => {
  if (!spinning) {
    spinning = true;
    winningSlot.y = -121;
    scoreReducer.next(1);
    from(reels)
      .pipe(
        map(reel => ({ reel, intvl: sltMgr.getRandomInterval(reel.idx) })),
        mergeMap(({ reel, intvl }) => interval(1).pipe(
          take(Math.floor(intvl / 5)),
          tap((spin) => {
            reel.y = sltMgr.getTopPosition(reel.y);
            if (Math.floor(intvl / 5) - spin === 1) {
              reel.y = sltMgr.getTopPosition(reel.y, true);
            }
          }),
        )),
      )
      .subscribe(() => {},
        err => console.log('Error', err),
        () => {
          calculate();
        });
  }
});

scoreReducer
  .pipe(switchMap(decr => interval(100).pipe(take(decr))))
  .subscribe(() => {
    startScore -= 1;
    scoreBoard.text = startScore;
  });

scoreIncrementer
  .pipe(switchMap(incr => interval(1).pipe(take(incr))))
  .subscribe(() => {
    startScore += 1;
    scoreBoard.text = startScore;
  });

winSlotDisplayer
  .pipe(
    /* eslint no-nested-ternary: "off" */
    map(slot => (slot === '' ? 0 : slot === 'top' ? 250 : slot === 'middle' ? 450 : 650)),
    filter(slot => slot > 0),
    switchMap(slot => interval(5).pipe(take(slot))),
  )
  .subscribe(() => {
    winningSlot.y += 1;
  });

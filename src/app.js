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
} from 'rxjs';

import {
  map,
  tap,
  switchMap,
  mergeMap,
  combineAll,
  take,
  filter,
} from 'rxjs/operators';

import '../assets/style.css';
import buttonSp from '../assets/spin-button.png';
import SlotManager from './slot-manager';

const sltMgr = new SlotManager();
let startScore = 1000;
const app = new Application(750, 550);
app.renderer.backgroundColor = 0xf5f5f5;
const { view } = app;

const playContainer = new Container();
const reels = [];
const images = [[], [], []];

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
    switchMap(({ reelContainer, idx }) => sltMgr.getImagePositions(idx).pipe(
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
      switchMap(({ topY, idx }) => sltMgr.getQualifyingReelImages(idx, topY)),
      map(img => of(img)),
      combineAll(),
    )
    .subscribe((scores) => {
      spinning = false;
      sltMgr.calculate(scores);
    });
};

button.on('pointerdown', () => {
  if (!spinning) {
    spinning = true;
    winningSlot.y = -121;
    sltMgr.scoreReducer.next(1);
    from(reels)
      .pipe(
        map(reel => ({ reel, intvl: sltMgr.getRandomInterval(reel.idx) })),
        mergeMap(({ reel, intvl }) => sltMgr.spinReel(intvl, reel)),
      )
      .subscribe(() => {},
        err => console.log('Error', err),
        () => {
          calculate();
        });
  }
});

sltMgr.scoreReducer
  .pipe(switchMap(decr => interval(100).pipe(take(decr))))
  .subscribe(() => {
    startScore -= 1;
    scoreBoard.text = startScore;
  });

sltMgr.scoreIncrementer
  .pipe(switchMap(incr => interval(1).pipe(take(incr))))
  .subscribe(() => {
    startScore += 1;
    scoreBoard.text = startScore;
  });

sltMgr.winSlotDisplayer
  .pipe(
    /* eslint no-nested-ternary: "off" */
    map(slot => (slot === '' ? 0 : slot === 'top' ? 250 : slot === 'middle' ? 450 : 650)),
    filter(slot => slot > 0),
    switchMap(slot => interval(5).pipe(take(slot))),
  )
  .subscribe(() => {
    winningSlot.y += 1;
  });

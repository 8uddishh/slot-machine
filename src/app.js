import './../assets/style.css';
import buttonSp from './../assets/spin-button.png';
import bar2x from './../assets/2xBAR.png';
import bar3x from './../assets/3xBAR.png';
import num7 from './../assets/7.png';
import bar from './../assets/BAR.png';
import cherry from './../assets/Cherry.png';
import {
  SLOT_BAR,
  SLOT_BAR2,
  SLOT_BAR3,
  SLOT_CHERRY,
  SLOT_NUMBER_7,
  winningCombinations
} from './combinations';

const HasFlag = (combined, flag) => (combined | flag) == combined;

import {
  Application,
  Sprite,
  Container,
  Graphics,
  TextStyle,
  Text
} from 'pixi.js';

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

let startScore = 1000;
const scoreReducer = new BehaviorSubject(0);
const scoreIncrementer = new BehaviorSubject(0);
const winSlotDisplayer = new BehaviorSubject('');
const app = new Application(750, 550);
app.renderer.backgroundColor = 0xf5f5f5;
const { view } = app;

const playContainer = new Container();
let reels = [];
const images = [[], [], []];
const slotImages = [
  { text: 'bar3x', value: SLOT_BAR3 },
  { text: 'bar', value: SLOT_BAR },
  { text: 'bar2x', value: SLOT_BAR2 },
  { text: 'num7', value: SLOT_NUMBER_7 },
  { text: 'cherry', value: SLOT_CHERRY }
];

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

var winningSlot = new Graphics();
winningSlot.lineStyle(2, 0x003300, 1);
winningSlot.beginFill(0x009933, 0.25);
winningSlot.drawRoundedRect(10, -121, 460, 120, 10);
winningSlot.endFill();

app.stage.addChild(winningSlot);

document.getElementById('playground').appendChild(view);

var top = new Graphics();
top.beginFill(0, 1);
top.drawRect(490, 10, 250, 530);
playContainer.addChild(top);

var style = new TextStyle({
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
  wordWrapWidth: 440
});

var scoreBoard = new Text(startScore, style);
scoreBoard.x = 575;
scoreBoard.y = 30;
top.addChild(scoreBoard);

const button = Sprite.fromImage(buttonSp);
button.interactive = true;
button.buttonMode = true;
button.x = 50;
button.y = 200;

controlContainer.addChild(button);
let runner = 0;
from([0, 1, 2])
  .pipe(
    map(idx => ({ reelContainer: new Container(), idx })),
    tap(({ reelContainer, idx }) => {
      reelContainer.x = idx * 161;
      reelContainer.y = 0;
      reelContainer.height = 2000;
      reelContainer.width = 161;
    }),
    switchMap(({ reelContainer, idx }) =>
      from([
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
      ]).pipe(
        map(img => Sprite.fromImage(img)),
        tap(img => {
          img.x = 10;
          img.y = runner * 200 + 10;
          img.name = slotImages[runner % 5].text;
          img.slotId = slotImages[runner % 5].value;
          reelContainer.addChild(img);
          images[idx].push(img);
          runner++;
        }),
        map(img => of(img)),
        combineAll(),
        tap(_ => (runner = 0)),
        map(_ => reelContainer)
      )
    )
  )
  .subscribe(reelContainer => {
    reels.push(reelContainer);
    playContainer.addChild(reelContainer);
  });

const randomBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const betweens = [
  { min: 1600, max: 2800 },
  { min: 3200, max: 4800 },
  { min: 5000, max: 6500 }
];
let spinCounter = -1;
let spinning = false;

button.on('pointerdown', _ => {
  if (!spinning) {
    spinning = true;
    winningSlot.y = -121;
    scoreReducer.next(1);
    from(reels)
      .pipe(
        map(reel => ({ reel, btw: betweens[++spinCounter] })),
        map(({ reel, btw }) => ({
          reel,
          intvl: randomBetween(btw.min, btw.max)
        })),
        mergeMap(({ reel, intvl }) =>
          interval(1).pipe(
            take(Math.floor(intvl / 5)),
            tap(spin => {
              if (reel.y < -1000) {
                reel.y = 410;
              } else {
                reel.y -= 10;
              }

              if (Math.floor(intvl / 5) - spin == 1) {
                const y = -1 * reel.y;
                const lessers = images[0].filter(img => img.y <= y);
                const greater = images[0].find(img => img.y >= y);
                if (lessers && lessers.length > 0) {
                  const less = [...lessers].pop();
                  if (y - less.y < greater.y - y) {
                    reel.y = -1 * (less.y - 10);
                  } else {
                    reel.y = -1 * (greater.y - 10);
                  }
                } else {
                  reel.y = 0;
                }
              }
            })
          )
        )
      )
      .subscribe(
        _ => {},
        err => console.log('Error', err),
        () => {
          calculate();
        }
      );
  }
});

scoreReducer
  .pipe(switchMap(decr => interval(100).pipe(take(decr))))
  .subscribe(_ => {
    startScore--;
    scoreBoard.text = startScore;
  });

scoreIncrementer
  .pipe(switchMap(incr => interval(1).pipe(take(incr))))
  .subscribe(_ => {
    startScore++;
    scoreBoard.text = startScore;
  });

winSlotDisplayer
  .pipe(
    map(
      slot =>
        slot == '' ? 0 : slot == 'top' ? 250 : slot == 'middle' ? 450 : 650
    ),
    filter(slot => slot > 0),
    switchMap(slot => interval(5).pipe(take(slot)))
  )
  .subscribe(_ => {
    winningSlot.y = winningSlot.y + 1;
  });

const calculate = () => {
  let idx = 0;
  from(reels)
    .pipe(
      map(reel => ({ topY: -1 * reel.y + 10, idx })),
      tap(_ => idx++),
      switchMap(({ topY, idx }) =>
        from(images[idx]).pipe(
          filter(img => img.y >= topY),
          take(3),
          map(img => of({ name: img.name, slotId: img.slotId })),
          combineAll()
        )
      ),
      map(img => of(img)),
      combineAll()
    )
    .subscribe(scores => {
      spinning = false;
      spinCounter = -1;
      const rowTopWinnings = winningCombinations
        .find(x => x.slotPosition == 0)
        .winnings.filter(x =>
          HasFlag(
            x.combination,
            scores[0][0].slotId | scores[1][0].slotId | scores[2][0].slotId
          )
        );

      const rowMiddleWinnings = winningCombinations
        .find(x => x.slotPosition == 1)
        .winnings.filter(x =>
          HasFlag(
            x.combination,
            scores[0][1].slotId | scores[1][1].slotId | scores[2][1].slotId
          )
        );

      const rowBottomWinnings = winningCombinations
        .find(x => x.slotPosition == 2)
        .winnings.filter(x =>
          HasFlag(
            x.combination,
            scores[0][2].slotId | scores[1][2].slotId | scores[2][2].slotId
          )
        );

      const rowTopMax = Math.max(...rowTopWinnings.map(w => w.score), 0);
      const rowMiddleMax = Math.max(...rowMiddleWinnings.map(w => w.score), 0);
      const rowBottomMax = Math.max(...rowBottomWinnings.map(w => w.score), 0);

      if (rowTopMax > 0 && rowTopMax >= rowMiddleMax && rowTopMax >= rowBottomMax) {
        scoreIncrementer.next(rowTopMax);
        winSlotDisplayer.next('top');
        return;
      }

      if (rowMiddleMax > 0 && rowMiddleMax > rowTopMax && rowMiddleMax >= rowBottomMax) {
        scoreIncrementer.next(rowMiddleMax);
        winSlotDisplayer.next('middle');
        return;
      }

      if (rowBottomMax > 0 && rowBottomMax > rowTopMax && rowBottomMax > rowMiddleMax) {
        scoreIncrementer.next(rowBottomMax);
        winSlotDisplayer.next('bottom');
        return;
      }
    });
};

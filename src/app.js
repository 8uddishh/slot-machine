import './../assets/style.css';
import buttonSp from './../assets/spin-button.png';
import bar2x from './../assets/2xBAR.png';
import bar3x from './../assets/3xBAR.png';
import num7 from './../assets/7.png';
import bar from './../assets/BAR.png';
import cherry from './../assets/Cherry.png';

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
const slotImages = ['bar3x', 'bar', 'bar2x', 'num7', 'cherry'];

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
  fontSize: 36,
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
          img.name = slotImages[runner % 5];
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
  { min: 2000, max: 2800 },
  { min: 4000, max: 4800 },
  { min: 5500, max: 6500 }
];
let spinCounter = -1;
let spinning = false;

button.on('pointerdown', _ => {
  if (!spinning) {
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
          map(img => of(img.name)),
          combineAll()
        )
      ),
      map(img => of(img)),
      combineAll()
    )
    .subscribe(scores => {
      spinning = false;
      spinCounter = -1;

      // 3 cherry on bottom
      if (
        scores[0][2] == 'cherry' &&
        scores[1][2] == 'cherry' &&
        scores[2][2] == 'cherry'
      ) {
        console.log('3 cherry on bottom - 4000');
        scoreIncrementer.next(4000);
        winSlotDisplayer.next('bottom');
        return;
      }

      // 3 cherry on top
      if (
        scores[0][0] == 'cherry' &&
        scores[1][0] == 'cherry' &&
        scores[2][0] == 'cherry'
      ) {
        console.log('3 cherry on top - 2000');
        scoreIncrementer.next(2000);
        winSlotDisplayer.next('top');
        return;
      }

      // 3 cherry on middle
      if (
        scores[0][1] == 'cherry' &&
        scores[1][1] == 'cherry' &&
        scores[2][1] == 'cherry'
      ) {
        console.log('3 cherry on middle - 1000');
        scoreIncrementer.next(1000);
        winSlotDisplayer.next('middle');
        return;
      }

      // 3 7 in top
      if (
        scores[0][0] == 'num7' &&
        scores[1][0] == 'num7' &&
        scores[2][0] == 'num7'
      ) {
        console.log('3 7 on top - 150');
        scoreIncrementer.next(150);
        winSlotDisplayer.next('top');
        return;
      }

      // 3 7 in middle
      if (
        scores[0][1] == 'num7' &&
        scores[1][1] == 'num7' &&
        scores[2][1] == 'num7'
      ) {
        console.log('3 7 on middle - 150');
        scoreIncrementer.next(150);
        winSlotDisplayer.next('middle');
        return;
      }

      // 3 7 in bottom
      if (
        scores[0][2] == 'num7' &&
        scores[1][2] == 'num7' &&
        scores[2][2] == 'num7'
      ) {
        console.log('3 7 on bottom - 150');
        scoreIncrementer.next(150);
        winSlotDisplayer.next('bottom');
        return;
      }

      // 3 num 7 and cherry on top
      if (
        (scores[0][0] == 'num7' || scores[0][0] == 'cherry') &&
        (scores[1][0] == 'num7' || scores[1][0] == 'cherry') &&
        (scores[2][0] == 'num7' || scores[2][0] == 'cherry')
      ) {
        console.log('3 7 or cherry on top - 75');
        scoreIncrementer.next(75);
        winSlotDisplayer.next('top');
        return;
      }

      // 3 num 7 and cherry on middle
      if (
        (scores[0][1] == 'num7' || scores[0][1] == 'cherry') &&
        (scores[1][1] == 'num7' || scores[1][1] == 'cherry') &&
        (scores[2][1] == 'num7' || scores[2][1] == 'cherry')
      ) {
        console.log('3 7 or cherry on middle - 75');
        scoreIncrementer.next(75);
        winSlotDisplayer.next('middle');
        return;
      }

      // 3 num 7 and cherry on bottom
      if (
        (scores[0][2] == 'num7' || scores[0][2] == 'cherry') &&
        (scores[1][2] == 'num7' || scores[1][2] == 'cherry') &&
        (scores[2][2] == 'num7' || scores[2][2] == 'cherry')
      ) {
        console.log('3 7 or cherry on bottom - 75');
        scoreIncrementer.next(75);
        winSlotDisplayer.next('bottom');
        return;
      }

      // 3 bar3x on top
      if (
        scores[0][0] == 'bar3x' &&
        scores[1][0] == 'bar3x' &&
        scores[2][0] == 'bar3x'
      ) {
        console.log('3 bar3x on top - 50');
        scoreIncrementer.next(50);
        winSlotDisplayer.next('top');
        return;
      }

      // 3 bar3x on middle
      if (
        scores[0][1] == 'bar3x' &&
        scores[1][1] == 'bar3x' &&
        scores[2][1] == 'bar3x'
      ) {
        console.log('3 bar3x on middle - 50');
        scoreIncrementer.next(50);
        winSlotDisplayer.next('middle');
        return;
      }

      // 3 bar3x on bottom
      if (
        scores[0][2] == 'bar3x' &&
        scores[1][2] == 'bar3x' &&
        scores[2][2] == 'bar3x'
      ) {
        console.log('3 bar3x on bottom - 50');
        scoreIncrementer.next(50);
        winSlotDisplayer.next('bottom');
        return;
      }

      // 3 bar2x on top
      if (
        scores[0][0] == 'bar2x' &&
        scores[1][0] == 'bar2x' &&
        scores[2][0] == 'bar2x'
      ) {
        console.log('3 bar2x on top - 20');
        scoreIncrementer.next(20);
        winSlotDisplayer.next('top');
        return;
      }

      // 3 bar2x on middle
      if (
        scores[0][1] == 'bar2x' &&
        scores[1][1] == 'bar2x' &&
        scores[2][1] == 'bar2x'
      ) {
        console.log('3 bar2x on middle - 20');
        scoreIncrementer.next(20);
        winSlotDisplayer.next('middle');
        return;
      }

      // 3 bar2x on bottom
      if (
        scores[0][2] == 'bar2x' &&
        scores[1][2] == 'bar2x' &&
        scores[2][2] == 'bar2x'
      ) {
        console.log('3 bar2x on bottom - 20');
        scoreIncrementer.next(20);
        winSlotDisplayer.next('bottom');
        return;
      }

      // 3 bar on top
      if (
        scores[0][0] == 'bar' &&
        scores[1][0] == 'bar' &&
        scores[2][0] == 'bar'
      ) {
        console.log('3 bar on top - 10');
        scoreIncrementer.next(10);
        winSlotDisplayer.next('top');
        return;
      }

      // 3 bar on middle
      if (
        scores[0][1] == 'bar' &&
        scores[1][1] == 'bar' &&
        scores[2][1] == 'bar'
      ) {
        console.log('3 bar on middle - 10');
        scoreIncrementer.next(10);
        winSlotDisplayer.next('middle');
        return;
      }

      // 3 bar on bottom
      if (
        scores[0][2] == 'bar' &&
        scores[1][2] == 'bar' &&
        scores[2][2] == 'bar'
      ) {
        console.log('3 bar on middle - 10');
        scoreIncrementer.next(10);
        winSlotDisplayer.next('bottom');
        return;
      }

      // 3 bar on top
      if (
        scores[0][0].startsWith('bar') &&
        scores[1][0].startsWith('bar') &&
        scores[2][0].startsWith('bar')
      ) {
        console.log('3 any bar on top - 5');
        scoreIncrementer.next(5);
        winSlotDisplayer.next('top');
        return;
      }

      // 3 bar on middle
      if (
        scores[0][1].startsWith('bar') &&
        scores[1][1].startsWith('bar') &&
        scores[2][1].startsWith('bar')
      ) {
        console.log('3 any bar on middle - 5');
        scoreIncrementer.next(5);
        winSlotDisplayer.next('middle');
        return;
      }

      // 3 bar on bottom
      if (
        scores[0][2].startsWith('bar') &&
        scores[1][2].startsWith('bar') &&
        scores[2][2].startsWith('bar')
      ) {
        console.log('3 any bar on bottom - 5');
        scoreIncrementer.next(5);
        winSlotDisplayer.next('bottom');
        return;
      }
    });
};

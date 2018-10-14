import './../assets/style.css';
import buttonSp from './../assets/spin-button.png';
import bar2x from './../assets/2xBAR.png';
import bar3x from './../assets/3xBAR.png';
import num7 from './../assets/7.png';
import bar from './../assets/BAR.png';
import cherry from './../assets/Cherry.png';

import { Application, Sprite, Container } from 'pixi.js';

import { from, of, interval } from 'rxjs';
import {
  map,
  tap,
  switchMap,
  mergeMap,
  combineAll,
  take
} from 'rxjs/operators';

import shuffle from 'shuffle-array';

const app = new Application(1200, 550);
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
controlContainer.x = 901;
controlContainer.y = 0;
controlContainer.height = 500;
controlContainer.width = 900;
app.stage.addChild(controlContainer);

document.getElementById('playground').appendChild(view);

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
      reelContainer.x = idx * 300;
      reelContainer.y = 0;
      reelContainer.height = 500;
      reelContainer.width = 900;
    }),
    switchMap(({ reelContainer, idx }) =>
      from([bar3x, bar, bar2x, num7, cherry,bar3x, bar, bar2x, num7, cherry]).pipe(
        map(img => Sprite.fromImage(img)),
        tap(img => {
          img.y = runner * 200 + 10;
          img.name = slotImages[(runner%5)];
          reelContainer.addChild(img);
          images[idx].push(img);
          if(idx == 0)
            console.log(img.name)
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
    from(reels)
      .pipe(
        map(reel => ({ reel, btw: betweens[++spinCounter] })),
        map(({ reel, btw }) => ({
          reel,
          intvl: randomBetween(btw.min, btw.max)
        })),
        tap(({ intvl }) => console.log(`interval ${intvl}`)),
        mergeMap(({ reel, intvl }) =>
          interval(1).pipe(
            take(Math.floor(intvl / 5)),
            tap(spin => {
              if (reel.y < -450) {
                reel.y = 100;
              } else {
                reel.y -= 10;
              }

              if (Math.floor(intvl / 5) - spin == 1 ) {
                const lessers = images[0].filter(img => img.y <= -1 * reel.y)
                const greater = images[0].find(img => img.y >= -1 * reel.y)
                if (lessers && lessers.length > 0) {
                    const less = [...lessers].pop()
                    reel.y = -1 * (less.y - 10)
                }
                else {
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
          spinning = false;
          spinCounter = -1;
          // adjustReels();
        }
      );
  }
});

const adjustReels = () => {
  let idx = 0;
  from(reels)
    .pipe(
      map(reel => ({
        reel,
        lesser: images[idx].filter(img => img.y <= -1 * reel.y),
        greater: images[idx].find(img => img.y >= -1 * reel.y)
      })),
      tap(({reel, lesser, greater}) => {
          if (lesser && lesser.length > 0) {
              const less = [...lesser].pop()
              reel.y = -1 * (less.y - 10)
              console.log(`Reel y: ${reel.y} Lesser y: ${less.y} Greater y: ${greater.y}`)
          }
          else {
            reel.y = 0;
            console.log(`Reel y: ${reel.y} Lesser y: 0 Greater y: ${greater.y}`)
          }
      })
    )
    .subscribe(_ => {});
};

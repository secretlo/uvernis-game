class Circle {
   constructor(x, y, diameter) {
      this.x = x;
      this.y = y;
      this.radius = diameter / 2;
   }

   checkIntersection(other) {
      const diffXPerc = this.x - other.x,
         diffYPerc = this.y - other.y,
         diffX = percToX(diffXPerc),
         diffY = percToY(diffYPerc);
      const distance = Math.sqrt(diffX*diffX + diffY*diffY);
      const res = distance - this.radius - other.radius;

      return res < 0;
   }
}

class Player extends Circle {
   constructor(host, isCurrentPlayer = false) {
      super(0, 0, 60);

      const self = this;

      this.host = host;
      this.el = $('<div class="player"></div>')[0];
      this.el.dataset.host = host;
      this.alive = true;
      
      $('.game').append(this.el);
      
      if (isCurrentPlayer) {
         $(window).on('mousemove', e => {
            self.updatePos(e.clientX / window.innerWidth * 100, e.clientY / window.innerHeight * 100);
         });
      
         this.updateInterval = setInterval(() => {
            if (self.alive)
               sendPositionUpdate(self.x, self.y);
         }, 200);
      }
   }
   
   updatePos(x, y) {
      if (!this.alive) return;

      this.x = x;
      this.y = y;

      this.el.style.left = percToX(x) + 'px';
      this.el.style.top = percToY(y) + 'px';
   }
   
   sendDie() {
      sendDie();
   }

   die() {
      this.el.remove();
      this.alive = false;

      if (this.host == HOST)
         messageBox.textContent = 'Вы проиграли!';
   }
}

class Enemy extends Circle {
   constructor(x, y, vxe, vye, speed) {
      let diameter;
      if (speed == 1)
         diameter = 18;
      else if (speed == 2)
         diameter = 30;
      else if (speed == 3)
         diameter = 42;

      super(x, y, diameter);

      this.el = $(`<div class="enemy enemy_speed_${speed}"></div>`)[0];
      $('.game').append(this.el);

      this.updatePos(x, y);
      
      this.moveDirection = {
         x: vxe,
         y: vye,
      };
      this.speed = speed;
   }

   updatePos(x, y) {
      this.x = x;
      this.y = y;

      this.el.style.left = percToX(x) + 'px';
      this.el.style.top = percToY(y) + 'px';
   }
   
   deleteIfOverflow() {
      if (this.x > 100 || this.x < 0 || this.y > 100 || this.y < 0) {
         this.el.remove();
         return true;
      }
      else return false;
   }
   
   move() {
      const newX = this.x + this.moveDirection.x * this.speed * Enemy.speedFactor,
         newY = this.y + this.moveDirection.y * this.speed * Enemy.speedFactor;
      this.updatePos(newX, newY);
   }
}
Enemy.speedFactor = 1;

$(buttonReady).click(e => {
   buttonReady.classList.add('dn');
   buttonNotReady.classList.remove('dn');
   sendReady();
});
$(buttonNotReady).click(e => {
   buttonNotReady.classList.add('dn');
   buttonReady.classList.remove('dn');
   sendUnready();
});

$(buttonDisconnect).click(e => {
   sendDisconnect();
   loadPage('main-menu');
});
$(buttonLeave).click(e => {
   sendDisconnect();
   loadPage('main-menu');
});


getGameId(gameId => {
   gameIdElement.textContent = gameId;
});
let HOST;
getUserHost(host => {
   HOST = host;
});

getConnectionCount(count => {
   setConnectionCount(count);
});

getReadyCount(readyCount => {
   setReadyCount(readyCount);
});

function setConnectionCount(count) {
   connectionCount.textContent = count;
   $('.total-count').text(count);
   
   count = +count;

   let countWord;
   switch (count) {
      case 1:
         countWord = 'игрок'; break;
      case 2:
      case 3:
      case 4:
         countWord = 'игрока'; break;
      case 5:
         countWord = 'игроков'; break;
   };
   connectionCountWord.textContent = countWord;
}

function setReadyCount(count) {
   $('.ready-count').text(count);
}

function setPositionUpdate(host, x, y) {
   if (host != HOST)
      PLAYERS[host].updatePos(x, y);
}


const PLAYERS = {};
let CURR_PLAYER = {x: 0, y: 0};
function startGame(players) {
   $('.info').addClass('dn');
   $('.game').removeClass('dn');

   timeoutEnemyRequest();
   
   for (const host of players) {
      PLAYERS[host] = new Player(host, host == HOST);
      if (host == HOST)
         CURR_PLAYER = PLAYERS[host];
   }
}

function diePlayer(host) {
   PLAYERS[host].die();
}


let maxEnemyTimeout = 1000;
let timeout = maxEnemyTimeout, createEnemyCount = 0;
let gameLevel = 0.999; // less = harder
function timeoutEnemyRequest() {
   timeout = Math.pow(gameLevel, createEnemyCount) * maxEnemyTimeout;
   setTimeout(() => {
      const percentX = Math.trunc(CURR_PLAYER.x), percentY = Math.trunc(CURR_PLAYER.y);
      sendEnemyRequest(percentX, percentY);
      timeoutEnemyRequest();
   }, timeout);
}

let ENEMIES = [];
function createEnemy(x, y, vx, vy, speed) {
   const vr = Math.sqrt(vx*vx + vy*vy);
   const vxe = vx/vr, vye = vy/vr;
   ENEMIES.push(new Enemy(x, y, vxe, vye, speed));
   createEnemyCount++;
}
setInterval(() => {
   let lenENEMIES = ENEMIES.length;
   let enemy;
   for (let i = 0; i < lenENEMIES; i++) {
      enemy = ENEMIES[i]
      enemy.move();
      if (CURR_PLAYER.alive)
         if (enemy.checkIntersection(CURR_PLAYER))
            CURR_PLAYER.sendDie();
   }
   ENEMIES = ENEMIES.filter(enemy => !enemy.deleteIfOverflow());
}, 100);


setInterval(() => {
   getTasks(tasks => {
      if (tasks.length > 0)
         console.log('Running tasks:', tasks);
      for (const [task, args] of tasks) {
         window[task](...args);
      }
   })
}, 100);


function xToPerc(x) {
   return x / window.innerWidth * 100;
}
function yToPerc(y) {
   return y / window.innerHeight * 100;
}
function percToX(perc) {
   return perc / 100 * window.innerWidth;
}
function percToY(perc) {
   return perc / 100 * window.innerHeight;
}
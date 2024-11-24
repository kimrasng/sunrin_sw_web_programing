const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const getJSON = function(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
        const status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
};
let score;
let scoreText;
let highscore;
let highscoreText;
let dino;
let gravity;
let obstacles = [];
let gameSpeed;
let keys = {};
let tempSeoul = 0;
let windSpeed = 0;
let weatherCondition = '';
let api_gamespeed = 3;
document.addEventListener('keydown', function(evt){
    keys[evt.code] = true;
});
document.addEventListener('keyup', function(evt){
    keys[evt.code] = false;
});

getJSON('http://api.openweathermap.org/data/2.5/weather?q=seoul&appid=df54b40e7c614cb48107fac285e16b9a&units=metric',
function Update(){
    requestAnimationFrame(Update);
    ctx.clearRect(0,0,canvas.width, canvas.height);

    // Change background based on weather condition and color
    if (weatherCondition === 'Rain') {
        canvas.style.backgroundColor = '#a3a3a3';
    } else if (weatherCondition === 'Clear') {
        canvas.style.backgroundColor = '#87CEEB';
    } else if (weatherCondition === 'Snow') {
        canvas.style.backgroundColor = '#FFFFFF';
    } else {
        canvas.style.backgroundColor = '#F0F0F0';
    }

    dino.Animate();

    spwanTimer--;
    if (spwanTimer <= 0){
        SpawnObstacle();
        spwanTimer = initialSpawnTimer - gameSpeed * 8;

        if(spwanTimer < 60){
            spwanTimer = 60;
        }
    }
    for(let i=0; i<obstacles.length; i++){
        let o = obstacles[i];
        if(o.x + o.w < 0){
            obstacles.splice(i, 1);
        }
        if(
            dino.x < o.x + o.w &&
            dino.x + dino.w > o.x &&
            dino.y < o.y + o.h &&
            dino.y + dino.h > o.y
        ){
            alert('');
            init();
            return;
        }
        
        o.Update();
    }
    gameSpeed += 0.003;
    score++;
    scoreText.t = "Score: " + score;
    scoreText.Draw();
    if(score > highscore){
        highscore = score;
        highscoreText.t = "Highscore: " + highscore;   
    }
    highscoreText.Draw();
}
);

class Dino {
    constructor(x, y, w, h, c) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.c = c;

        this.dy = 0;
        this.jumpForce = 20;
        this.originalHeight = h;
        this.grounded = false;
        this.jumpTimer = 0;
        this.jumpCount = 0; 
    }

    Draw() {
        var img = new Image();
        if ((keys['ShiftLeft'] || keys['KeyS']) && this.grounded) {
            img.src = 'dino.webp';
            ctx.drawImage(img, this.x, this.y - 100, this.w * 3, this.h * 3);
        } else {
            if (tempSeoul > 20) {
                img.src = 'dino2.webp';
                ctx.drawImage(img, this.x, this.y - 100, this.w * 3, this.h * 3);
            } else {
                img.src = 'dino.webp';
                ctx.drawImage(img, this.x, this.y - 100, this.w * 3, this.h * 3);
            }
        }
    }

    Drow2() {
        // 500점 이상일 때 사용되는 공룡 이미지
        var img = new Image();
        img.src = "dino2.webp"; // 새로운 공룡 이미지
        ctx.drawImage(img, this.x, this.y - 100, this.w * 3, this.h * 3);
    }

    Jump() {
        if (this.grounded || this.jumpCount < 2) {
            this.jumpTimer = 1;
            this.dy = -this.jumpForce;
            this.jumpCount++;
        }
    }

    Animate() {
        if (keys['Space'] || keys['KeyW']) {
            if (this.jumpTimer === 0) this.Jump();
        } else {
            this.jumpTimer = 0;
        }

        if (keys['ShiftLeft'] || keys['KeyS']) {
            this.h = this.originalHeight / 2;
        } else {
            this.h = this.originalHeight;
        }

        this.y += this.dy;

        if (this.y + this.h < canvas.height) {
            this.dy += gravity;
            this.grounded = false;
        } else {
            this.dy = 0;
            this.grounded = true;
            this.y = canvas.height - this.h;
            this.jumpCount = 0;
        }

        if (keys['KeyD']) {
            gameSpeed=40
        } else {
            gameSpeed=3// 점프 초기화
        }

        if (invincible) {
            this.Drow2(); // 무적 상태일 때 공룡 이미지를 그리기
          } else {
            this.Draw(); // 기본 공룡 그리기
        }

        this.Draw();
    }
}
class Obstacle{
    constructor(x,y,w,h,c){
        this.x = x;
        this.y = y; 
        this.w = w; 
        this.h = h; 
        this.c = c; 

        this.dx = -gameSpeed;
        this.isBird = false;
    }
    Update(){
        this.x += this.dx;
        this.Draw();
        this.dx = -gameSpeed;
    }
    Draw(){
        var img = new Image();
        if(this.isBird==true)
        {
            img.src = 'bird.png';
            ctx.drawImage(img, this.x, this.y-100, this.w*2, this.h*2);
        } else{
            img.src = 'cactus.png';
            ctx.drawImage(img, this.x, this.y-100, this.w*2, this.h*2);
        }
    }
}

class Text {
    constructor(t,x,y,a,c,s){
        this.t = t;
        this.x = x;
        this.y = y;
        this.a = a;
        this.c = c;
        this.s = s;
    }
    Draw(){
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.font = this.s + "px sans-serif";
        ctx.textAlign = this.a;
        ctx.fillText(this.t, this.x, this.y);
        ctx.closePath();
    }

}

function SpawnObstacle(){
    let size = RandomIntInRange(20, 70);
    let type = RandomIntInRange(0, 1);
    let obstacle = new Obstacle(canvas.width + size, canvas.height - size, size, size, '#2484E4');

    if(type == 1){
        obstacle.y -= dino.originalHeight - 10;
        obstacle.isBird = true;
    }   
    obstacles.push(obstacle);
}

function RandomIntInRange(min, max){
    return Math.round(Math.random() * (max - min) + min);
}

function Start(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.font = "20px sans-serif";

    gameSpeed = api_gamespeed;
    gravity = 1;    
    score = 0;
    highscore = 0;
    if(localStorage.getItem('highscore')){
        highscore = localStorage.getItem('highscore');
    }
    dino = new Dino(25, canvas.height - 150, 50, 50, '#ff0000');
    scoreText = new Text("Score: " + score, 25, 25, "left", "#212121", "20");
    highscoreText = new Text("Highscore: " + highscore, canvas.width - 25, 25, "right", "#212121", "20");

    requestAnimationFrame(Update);
}

let initialSpawnTimer = 200;
let spwanTimer = initialSpawnTimer;

function init(){
    obstacles = [];
    gameSpeed = 3;
    score = 0;
    spwanTimer = initialSpawnTimer;
    window.localStorage.setItem('highscore', highscore);
}

function Update(){
    requestAnimationFrame(Update);
    ctx.clearRect(0,0,canvas.width, canvas.height);

    // Change background based on weather condition
    if (weatherCondition === 'Rain') {
        canvas.style.background = 'color: #a3a3a3';
    } else if (weatherCondition === 'Clear') {
        canvas.style.background = 'color: #87CEEB';
    } else if (weatherCondition === 'Snow') {
        canvas.style.background = 'color: #FFFFFF';
    } else {
        canvas.style.background = 'color: #F0F0F0';
    }

    dino.Animate();

    spwanTimer--;
    if (spwanTimer <= 0){
        SpawnObstacle();
        spwanTimer = initialSpawnTimer - gameSpeed * 8;

        if(spwanTimer < 60){
            spwanTimer = 60;
        }
    }
    for(let i=0; i<obstacles.length; i++){
        let o = obstacles[i];
        if(o.x + o.w < 0){
            obstacles.splice(i, 1);
        }
        if(
            dino.x < o.x + o.w &&
            dino.x + dino.w > o.x &&
            dino.y < o.y + o.h &&
            dino.y + dino.h > o.y
        ){
            alert('');
            init();
            return;
        }
        
        o.Update();
    }
    gameSpeed += 0.003;
    score++;
    scoreText.t = "Score: " + score;
    scoreText.Draw();
    if(score > highscore){
        highscore = score;
        highscoreText.t = "Highscore: " + highscore;   
    }



  // 500점 이상일 때 변환
  if (score > 500 && !invincible) {
    trans(); // 공룡 이미지 변경
    invincible = true; // 무적 상태로 변경
    invincibleTimer = 10 * 60; // 10초 동안 무적 상태 유지 (60프레임 기준)
    score = score - 500; // 500점 차감
  }

  // 무적 상태 타이머
  if (invincibleTimer > 0) {
    invincibleTimer--;
  } else {
    invincible = false; // 무적 상태 종료
  }

  highscoreText.Draw();
}

function trans() {
  // 500점 이상일 때 공룡을 변환
  var img = new Image();
  img.src = "dino2.webp"; // 새로운 공룡 이미지
  ctx.drawImage(img, dino.x, dino.y - 100, dino.w * 3, dino.h * 3);
}
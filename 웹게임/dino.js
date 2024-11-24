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
getJSON('http://api.openweathermap.org/data/2.5/weather?q=seoul&appid=df54b40e7c614cb48107fac285e16b9a&units=metric',
function(err, data) {
    // if (err !== null) {
    //     alert('Something went wrong: ' + err);
    // } else {
    //     tempSeoul = data.main.temp;
    //     alert(`현재 온도는 ${data.main.temp}도
    //     풍속은 ${data.wind.speed}m/s
    //     습도는 ${data.main.humidity}% 입니다.
    //     오늘의 
    //     최고기온은 ${data.main.temp_max}도
    //     최저기온은 ${data.main.temp_min}도
    //     입니다`)
    // }
});
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
document.addEventListener('keydown', function(evt){
    keys[evt.code] = true;
});
document.addEventListener('keyup', function(evt){
    keys[evt.code] = false;
});

class Dino{
    constructor(x,y,w,h,c){
        this.x = x;
        this.y = y; 
        this.w = w; 
        this.h = h; 
        this.c = c; 

        this.dy = 0;
        this.jumpForce = 15;    
        this.originalHeight = h;    
        this.grounded = false;
        this.jumpTimer = 0;
}

    Draw(){
        // ctx.beginPath();
        // ctx.fillStyle = this.c;
        // ctx.fillRect(this.x, this.y, this.w, this.h);
        // ctx.closePath();
        var img = new Image();
        if((keys['ShiftLeft'] || keys['KeyS']) && this.grounded == true){
            img.src = 'dino.webp';
            ctx.drawImage(img, this.x, this.y-100, this.w*3, this.h*3);
        } else{
            if(tempSeoul>20)
            {
                img.src = 'dino2.webp';
                ctx.drawImage(img, this.x, this.y-100, this.w*3, this.h*3);

            }else{
                img.src = 'dino.webp';
                ctx.drawImage(img, this.x, this.y-100, this.w*3, this.h*3);
            }
        }
        // img.src = 'dino.webp';
        // ctx.drawImage(img, this.x, this.y-100, this.w*3, this.h*3);   
        //그림을 크게 하려면? 

}
    Jump(){
        if(this.grounded && this.jumpTimer == 0){
            this.jumpTimer = 1;
            this.dy = -this.jumpForce;
        } else if(this.jumpTimer > 0 && this.jumpTimer < 15){
            this.jumpTimer++;
            this.dy = -this.jumpForce - (this.jumpTimer / 50);
        }
}


    Animate(){
        if(keys['Space'] || keys['KeyW']){
            this.Jump();
        }else{
            this.jumpTimer = 0;
        }
        
        if(keys['ShiftLeft'] || keys['KeyS']){
            this.h = this.originalHeight / 2;
        } else{
            this.h = this.originalHeight;
        }
        this.y += this.dy;

        if(this.y + this.h < canvas.height){
            this.dy += gravity;
            this.grounded = false;
        }else{
            this.dy = 0;
            this.grounded = true;
            this.y = canvas.height - this.h;
    }
        // this.y += this.dy;  
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
        // ctx.beginPath();
        // ctx.fillStyle = this.c;
        // ctx.fillRect(this.x, this.y, this.w, this.h);
        // ctx.closePath();
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
        obstacle.y -= player.originalHeight - 10;
        obscacle.isBird = true;
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

    gameSpeed = 3;
    gravity = 1;    
    score = 0;
    highscore = 0;
    if(localStorage.getItem('highscore')){
        highscore = localStorage.getItem('highscore');
    }
    dino = new Dino(25, canvas.height - 150, 50, 50, '#ff0000');
    // dino.Draw();
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
    // dino.Draw();
    // dino.x++;
    dino.Animate();

    spwanTimer--;
    if (spwanTimer <= 0){
        SpawnObstacle();
        console.log(obstacles);
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
            init();
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
Start();
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
    // gameSpeed += 0.003;
    // score++;
    // scoreText.t = "Score: " + score;
    // scoreText.Draw();
    // if(score > highscore){
    //     highscore = score;
    //     highscoreText.t = "Highscore: " + highscore;   
    // }
    // highscoreText.Draw();
}

Start();
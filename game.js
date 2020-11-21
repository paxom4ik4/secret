////////////////////////////////////////////////////////////////////////////
// TODO:
//
//  !1. Реализовать Drag'n'drop
//  *2. Сделать таймер и счётчик ходов
//  *3. Сделать меню с элементами(рестарт, изменить размер, ...)
//  *4. Реализовать сохранение игры
//  !5. Анимация перемещения.
//  !6. Победное завершение игры 1/2
//  !7. Звук для фишек
//  !8. Топ-10 результатов
//  !9. Сделать режим с картинками
// !10. Завершение игры (анимированое) 
// !11. Адаптирование
//                                                                          
/////////////////////////////////////////////////////////////////////////////

document.oncontextmenu = function (){return false};

class StartMenu {
    menu = document.createElement("div");
    sizeBtn = document.createElement("div");
    loadBtn = document.createElement("div");
    startBtn = document.createElement("div");
    sizes = [
        { sizeX: 3, sizeY: 3},
        { sizeX: 4, sizeY: 4},
        { sizeX: 5, sizeY: 5},
        { sizeX: 6, sizeY: 6},
        { sizeX: 7, sizeY: 7},
        { sizeX: 8, sizeY: 8},
    ];
    size = 0;

    constructor() {
        this.menu.classList.add("start-menu");
        this.renderMainBtns();
    }

    renderMainBtns = () => {
        document.body.innerHTML = "";
        document.body.append(this.menu);
        this.renderSizeBtn();
        this.renderLoadBtn();
        this.renderStartBtn();
    }

    renderSizeBtn = () => {
        this.sizeBtn.innerHTML = `Size: ${this.sizes[this.size].sizeX}x${this.sizes[this.size].sizeY}`;
        this.sizeBtn.onclick = () => {
            if(this.size > 4) this.size = -1;
            this.sizeBtn.innerHTML = `Size: ${this.sizes[++this.size].sizeX}x${this.sizes[this.size].sizeY}`;
        }
        this.menu.append(this.sizeBtn);
    }

    renderStartBtn = () => {
        this.startBtn.innerText = "Start game";
        this.menu.append(this.startBtn);
        this.startBtn.onclick = () => {
            this.menu.style.display = "none";
            this.startGame();
        }
    }

    loadBlock = document.createElement("div");
    backBtn = document.createElement("div");
    message = document.createElement("div");
    message2 = document.createElement("div");
    saveBlock = document.createElement("div");

    onLoad = () => {
        this.loadBlock.classList.add("load-block");
        document.body.innerHTML = "";
        let data = JSON.parse(localStorage.getItem("data")) || [];

        this.backBtn.classList.add("back");
        this.backBtn.innerHTML = "Back";
        this.saveBlock.classList.add("save-block");
        this.message2.classList.add("message");

        this.message2.innerHTML = "To delete, right click on save";


        this.backBtn.onclick = () => this.renderMainBtns();
        this.saveBlock.innerHTML = "";

        if(data.length === 0) {
            this.message.classList.add("message");
            this.message.innerText = "No data saved";
            this.loadBlock.append(this.message);
        }

        if(data[0] == null) {
            data = [];
            localStorage.setItem("data", JSON.stringify(data));
            this.message.classList.add("message");
            this.message.innerText = "No data saved";
            this.loadBlock.append(this.message);
        }

        if(data.length >= 1) {
            for(let i = 0; i < data.length; i++) {
                let save = document.createElement("div");
                save.innerHTML = `${i+1}. Size: ${data[i].sizeX}x${data[i].sizeY}, time: ${data[i].minutes}:${data[i].seconds}, steps: ${data[i].steps}`;
                this.saveBlock.append(save);
                save.onclick = () => {
                    this.loadBlock.style.display = "none";
                    let game = new Game(data[i].sizeX, data[i].sizeY);
                    // game.ceils = data[i].field;
                    for(let k = 0; k < data[i].field.length; k++) {
                        game.ceils[k] = data[i].field[k];
                        let temp = document.createElement("div");
                        game.ceils[k].obj = temp;
                    }
                    game.minutes = data[i].minutes;
                    game.seconds = data[i].seconds;
                    game.steps = data[i].steps;
                    game.renderCeils();
                    game.onCeilClick();
                }
                save.addEventListener("contextmenu", () => {
                    save.style.display = "none";
                    delete data[i];
                    localStorage.setItem("data", JSON.stringify(data));
                    if(data.length == 0) {
                        data = [];
                        localStorage.setItem("data", JSON.stringify(data));
                        this.message.classList.add("message");
                        this.message.innerText = "No data saved";
                        this.loadBlock.append(this.message);
                    }
                })
            }
        }

        this.loadBlock.append(this.message2);
        this.loadBlock.append(this.backBtn);
        this.loadBlock.append(this.saveBlock);
        document.body.append(this.loadBlock);
    }

    renderLoadBtn = () => {
        this.loadBtn.innerText = "Load game";
        this.menu.append(this.loadBtn);
        this.loadBtn.onclick = () => {
            this.onLoad();
        }
    }

    initOptions = () => this.sizes[this.size];

    startGame = () => {
        let sizes = this.initOptions();
        let game = new Game(sizes.sizeX, sizes.sizeY);
        game.generateCeilArr();
        game.shuffle();
        game.renderCeils();
        game.onCeilClick();

    }

}

class Game {
    gameDOM = document.createElement("div");
    field = document.createElement("div");
    stepsDOM = document.createElement("div");
    panel = document.createElement("div");
    menu = document.createElement("div");
    gameMenu = document.createElement("div");
    timer = document.createElement("div");

    resumeBtn = document.createElement("div");
    saveBtn = document.createElement("div");
    restartBtn = document.createElement("div");

    interval;

    constructor(sizeX = 4, sizeY = 4) {
        this.gameDOM.classList.add("game");
        this.field.classList.add("field");
        this.stepsDOM.classList.add("steps");
        this.panel.classList.add("panel");

        document.body.append(this.gameDOM);
        document.body.append(this.panel);
        this.gameDOM.append(this.field);
        this.panel.append(this.stepsDOM);

        this.ceils = [];
        this.steps = 0;
        this.minutes = 0;
        this.seconds = 0;

        this.sizeX = sizeX;
        this.sizeY = sizeY;

        this.fieldSize = this.sizeX * this.sizeY;

        this.renderTimer();
        this.renderSteps();

        this.initField();
        this.createMenu();
    }

    createMenu = () => {
        this.menu.innerHTML = "MENU";
        this.menu.classList.add("menu");
        this.gameDOM.append(this.menu);
        this.menu.onclick = () => {
            this.renderMenu();
        }
    }

    onResume = () => {
        this.menu.style.display = "block";
        this.gameMenu.style.display = "none";
        this.interval = setInterval(() => {
            this.timer.innerText = `${this.minutes < 10? "0"+this.minutes:this.minutes}:${this.seconds < 10? "0"+this.seconds++:this.seconds++}`;
            if(this.seconds > 59) {
                this.minutes++;
                this.seconds = 0;
            }
        }, 1000);
    }

    onSave = () => {
        let data = JSON.parse(localStorage.getItem('data')) || [];
        data.push({ field: this.ceils, sizeX: this.sizeX, sizeY: this.sizeY, steps: this.steps, minutes: this.minutes, seconds: this.seconds });
        localStorage.setItem('data', JSON.stringify(data));
        this.saveBtn.innerHTML = "Game has saved";
    }

    onRestart = () => {
        document.body.innerHTML = "";
        let start = new StartMenu();
    }

    renderMenuElements = () => {
        clearInterval(this.interval);

        this.resumeBtn.classList.add("resume");
        this.saveBtn.classList.add("save");
        this.restartBtn.classList.add("restart");

        this.resumeBtn.innerHTML = "Resume game";
        this.saveBtn.innerHTML = "Save game";
        this.restartBtn.innerHTML = "Restart game";

        this.resumeBtn.onclick = () => this.onResume();
        this.saveBtn.onclick = () => this.onSave();
        this.restartBtn.onclick = () => this.onRestart();

        this.gameMenu.append(this.resumeBtn);
        this.gameMenu.append(this.saveBtn);
        this.gameMenu.append(this.restartBtn);
    }

    renderMenu = () => {
        this.gameMenu.classList.add("game-menu");
        document.body.append(this.gameMenu);
        this.menu.style.display = "none";
        this.gameMenu.style.display = "block";
        this.renderMenuElements();
    }

    isWin = () => {
        for(let i = 0; i < this.sizeX * this.sizeY; i++) {
            if(this.ceils[i].pos != i+1) return false;
        }
        return true;
    }
    
    renderTimer = () => {
        this.timer.classList.add("timer");
        this.timer.innerText = `${this.minutes < 10? "0"+this.minutes:this.minutes}:${this.seconds < 10? "0"+this.seconds++:this.seconds++}`;
        this.interval = setInterval(() => {
            this.timer.innerText = `${this.minutes < 10? "0"+this.minutes:this.minutes}:${this.seconds < 10? "0"+this.seconds++:this.seconds++}`;
            if(this.seconds > 59) {
                this.minutes++;
                this.seconds = 0;
            }
        }, 1000);
        this.panel.append(this.timer);
    }

    renderSteps = () => {
        this.stepsDOM.innerText = `Steps: ${this.steps++}`;
    }

    initField = () => {
        this.field.style.width = 14.1 * this.sizeX + "em";
        this.field.style.height = 14.1 * this.sizeY + "em";
        
        let rows = "";
        let columns = "";
        for(let i = 0; i < this.sizeX; i++) rows += "1fr ";
        for(let i = 0; i < this.sizeY; i++) columns += "1fr ";
        
        this.field.style.gridTemplateRows = rows;
        this.field.style.gridTemplateColumns = columns;
    }

    generateCeilArr = () => {
        for(let i = 0; i < this.fieldSize; i++) {
            let ceil = { obj: document.createElement("div"), pos: i + 1, isEmpty: false };
            this.ceils[i] = ceil;
            if(ceil.pos === this.fieldSize) {
                ceil.obj.classList.add("empty");
                ceil.isEmpty = true;
            }

        }
    }

    renderCeils = () => {
        console.log(this.ceils);
        this.ceils.forEach(ceil => {
            ceil.obj.innerHTML = ceil.pos;
            ceil.obj.classList.add("ceil");
            this.field.append(ceil.obj);
            if(ceil.isEmpty) {
                ceil.obj.classList.add("empty");
            }

        })
    }

    shuffle = () => {
        this.ceils.sort(() => {
            return Math.random() - 0.5;
        });
        this.renderCeils();
    } 

    onWin = () => {
        document.body.innerHTML = "";
        let winBlock = document.createElement("div");
        let message = document.createElement("div");
        let restart = document.createElement("div");
        winBlock.classList.add("win-block");
        message.classList.add("win-message");
        restart.classList.add("win-restart");
        message.innerHTML = "You're win! Want to play some more?";
        restart.innerHTML = "Again";

        document.body.append(winBlock);
        winBlock.append(message);
        winBlock.append(restart);

        restart.onclick = () => this.onRestart();
    }

    moveCeil = pos => {
        loop1:
        for(let i = 0; i < this.sizeX; i++) {
            for(let k = 0; k < this.sizeY; k++) {
                if(this.ceils[i * this.sizeX + k].pos === pos) {
                    if(k != 0 && this.ceils[i * this.sizeX + k - 1].isEmpty === true) {
                        console.log("Left " + pos);
                        const temp = this.ceils[i * this.sizeX + k - 1];
                        this.ceils[i * this.sizeX + k - 1] = this.ceils[i * this.sizeX + k];   
                        this.ceils[i * this.sizeX + k] = temp;          
                        this.renderCeils();
                        this.renderSteps();

                        break loop1;
                    }
                    else if(k != this.sizeX - 1 && this.ceils[i * this.sizeX + k + 1].isEmpty === true) {
                        console.log("Right "+ pos);
                        const temp = this.ceils[i * this.sizeX + k + 1];
                        this.ceils[i * this.sizeX + k + 1] = this.ceils[i * this.sizeX + k];   
                        this.ceils[i * this.sizeX + k] = temp;          
                        this.renderCeils();
                        this.renderSteps();

                        break loop1;
                    }
                    else if(i * this.sizeX != 0 && this.ceils[i * this.sizeY + k - this.sizeX].isEmpty === true) {
                        console.log("Top "+ pos);
                        const temp = this.ceils[i * this.sizeY + k - this.sizeX];
                        this.ceils[i * this.sizeY + k - this.sizeX] = this.ceils[i * this.sizeY + k];
                        this.ceils[i * this.sizeY + k] = temp;
                        this.renderCeils();
                        this.renderSteps();
                        
                        break loop1;
                    }
                    else if(this.ceils[i * this.sizeY + k + this.sizeX].isEmpty === true) {
                        console.log("Down "+ pos);
                        const temp = this.ceils[i * this.sizeY + k + this.sizeX];
                        this.ceils[i * this.sizeY + k + this.sizeX] = this.ceils[i * this.sizeY + k];
                        this.ceils[i * this.sizeY + k] = temp;
                        this.renderCeils();
                        this.renderSteps();

                        break loop1;
                    }
                    else {
                        break loop1;
                    }
                }
            }
        }
        if(this.isWin()) this.onWin();
    }

    onCeilDrag = () => {
        this.ceils.forEach(ceil => {
            ceil.obj.addEventListener("mousedown", (e) => {
                ceil.obj.style.position = "absolute";
                moveAt(e);
                function moveAt(e) {
                    ceil.obj.style.left = e.pageX + "px";
                    ceil.obj.style.top = e.pageY + "px";
                }
                document.onmousemove = function(e) {
                    moveAt(e);
                }
                document.onmouseup = function() {
                    document.onmousemove = null;
                    ceil.obj.onmouseup = null;
                }
            });
        })
        
    }

    onCeilClick = () => {
        this.ceils.forEach(ceil => {
            ceil.obj.addEventListener("click", () => this.moveCeil(ceil.pos));
        })
    }
}

const start = new StartMenu();

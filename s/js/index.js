'use strict';

//Load YouTube widget API
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

//Properties
const globalFont = "Serif";
const globalEasing = "easeInOutSine";
const url = "";
let isMobile = false;

//Detect browser
let userAgent = navigator.userAgent;
let browserName;
//https://codepedia.info/detect-browser-in-javascript
if (userAgent.match(/chrome|chromium|crios/i)) {
    browserName = "chrome";
} else if (userAgent.match(/firefox|fxios/i)) {
    browserName = "firefox";
} else if (userAgent.match(/safari/i)) {
    browserName = "safari";
} else if (userAgent.match(/opr\//i)) {
    browserName = "opera";
} else if (userAgent.match(/edg/i)) {
    browserName = "edge";
}

//Get fps
const defaultFps = 144 //thats my monitor
let fps = 0;
let fpsMultiplier = Math.max(defaultFps / fps, 1); //144
let initialTime = 0;
function updateFps(timeStamp) {
    window.requestAnimationFrame(updateFps);

    let deltaTime = (timeStamp - initialTime) / 1000;
    initialTime = timeStamp;
    fps = Math.floor(1 / deltaTime);
    fpsMultiplier = Math.min(Math.max(defaultFps / fps, 1), 3);
}
updateFps()

//Classes
class Particles {
    static disabled = false;
    disabled = false;
    streaksLen = 10;

    spawnwait = 10; //time before another particle spawns in
    particles = [];
    particleSize = 5;
    jitterness = .1;
    initialSpeed = {
        x: 0,
        y: 0
    };
    windSpeed = { //Constantly changes
        x: 0,
        y: 0
    };
    offset = {
        x: 0,
        y: 0
    };
    spawnDomain = {
        min: 0,
        max: 0
    };
    spawnRange = {
        min: 0,
        max: 1,
    };
    maxLen = 50;
    tick = 0;
    streaksJitter = 1;
    followMouse = false;
    bigG = .01;
    distanceBasedOpacity = false;
    sizeVariance = 5;
    constructor(left, top, width, height, color, tween) { //Color is an object with RGB values
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.color = color;
        this.tween = tween;

        //Set boundaries
        this.spawnDomain.min = 0;
        this.spawnDomain.max = width;
        this.spawnRange.min = 0;
        this.spawnRange.max = height;

        const canvas = Canvas.new(left, top, width, height);
        const ctx = canvas.getContext("2d");

        canvas.object = this;

        this.canvas = canvas;
        this.ctx = ctx;

        if (tween !== undefined) {
            canvas.style.opacity = "0";
            $(canvas).animate({
                opacity: 1
            }, {
                duration: tween
            })
        }

        this.update();
    }
    getCanvas() {
        return this.canvas;
    }
    createParticle(x, y, color, vX, vY) {
        //Velocity
        const m = 10;
        const jitX = (getRandomNumber(-this.jitterness, this.jitterness)) * m;
        const jitY = (getRandomNumber(-this.jitterness, this.jitterness)) * m;
        vX = vX || (this.initialSpeed.x * fpsMultiplier + jitX);
        vY = vY || (this.initialSpeed.y * fpsMultiplier + jitY);

        const particleSize = this.particleSize + Math.floor(getRandomNumber(0, this.sizeVariance))

        const obj = {
            x: x,
            y: y,
            vX: vX,
            vY: vY,
            size: particleSize,
            opacity: 0,
            color: color
            // appliedOffset : {
            //     y : 0,
            //     x : 0
            // }
        }
        if (this.streaksLen > 0) {
            const a = [obj];
            this.particles.push(a);
            return;
        }
        this.particles.push(obj);
    }
    update() {
        if (document.body.contains(this.canvas)) {
            window.requestAnimationFrame(this.update.bind(this));
        }
        if (Particles.disabled === true || this.disabled === true || Game.lowDetailMode || this.canvas.style.opacity == "0") {
            return;
        }

        //Update dimensions
        if (this.canvas.width != window.innerWidth * (parseInt(this.canvas.style.width) / 100) || this.canvas.height != window.innerHeight * (parseInt(this.canvas.style.height) / 100)) {
            this.canvas.width = window.innerWidth * (parseInt(this.canvas.style.width) / 100);
            this.canvas.height = window.innerHeight * (parseInt(this.canvas.style.height) / 100);
        }

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        //Spawn in particles
        let tick = this.tick;
        ++this.tick;
        if (tick % Math.floor(this.spawnwait / fpsMultiplier) === 0) {
            const x = Math.floor(getRandomNumber(this.spawnDomain.min, this.spawnDomain.max));
            const y = Math.floor(getRandomNumber(this.spawnRange.min, this.spawnRange.max));
            this.createParticle(x, y, this.color)
            tick = 0;
        }

        const particles = this.particles;
        const ctx = this.ctx;
        //Clear canvas
        ctx.clearRect(0, 0, this.width, this.height);
        // ctx.fillStyle = "rgba(255,255,255,.05)"
        // ctx.fillRect(0,0,this.width,this.height);

        for (let i = 0; i < particles.length; ++i) {
            const streak = particles[i];
            if (Array.isArray(streak) === true) { //If the streak is actually a streak rather than just a particle
                //Change front-most particle
                const frontParticle = streak[0];

                const x1 = frontParticle.x;
                const y1 = frontParticle.y;
                const vx1 = frontParticle.vX;
                const vy1 = frontParticle.vY;
                const size = frontParticle.size;
                let opacity = Math.min(frontParticle.opacity + .005, 1);
                const color = frontParticle.color;

                const x2 = x1 + vx1;
                const y2 = y1 + vy1;

                //Becomes the new front-most particle
                const newParticle = {
                    x: x2,
                    y: y2,
                    vX: vx1 + getRandomNumber(-this.jitterness, this.jitterness) * fpsMultiplier + this.windSpeed.x,
                    vY: vy1 + getRandomNumber(-this.jitterness, this.jitterness) * fpsMultiplier + this.windSpeed.y,
                    size: size,
                    opacity: opacity,
                    color: color
                    // appliedOffset : {
                    //     x : frontParticle.appliedOffset.x,
                    //     y : frontParticle.appliedOffset.y
                    // }
                }
                //Follow mouse
                if (this.followMouse === true) {
                    const bigG = this.bigG;
                    const mouseX = Mouse.x;
                    const mouseY = Mouse.y;
                    const radius = getDistance(x2, mouseX, y2, mouseY);
                    const force = bigG * 1 / radius;
                    const newvX = (mouseX - x2) * force;
                    const newvY = (mouseY - y2) * force;
                    newParticle.vX = newvX + newParticle.vX;
                    newParticle.vY = newvY + newParticle.vY;

                    //Opacity is now based on the mouse distance
                    // opacity = opacity - radius / (screen.width / 2);
                }
                if (this.distanceBasedOpacity === true) {
                    const radius = getDistance(x2, this.width / 2, y2, this.height / 2);
                    const invisiblityRadius = 20;
                    opacity = clamp(opacity, -1, this.width / (radius * invisiblityRadius));
                }
                streak.unshift(newParticle);

                const parsedColor = Color.new(color.r, color.g, color.b, opacity);
                //Change size/opacity of each particle
                for (let e = 1; e < streak.length; ++e) {
                    const p = streak[e];
                    const t = e / this.maxLen;
                    const s = size + (0 - size) * t; //Use linear interpolation to calculate size
                    const o = opacity + (0 - opacity) * t; //Opacity
                    p.size = s;
                    p.opacity = o;

                    //Draw streak
                    const streakColor = Color.new(color.r, color.g, color.b, o);


                    if (!this.isFallingStar) {
                        Canvas.drawRect(ctx, p.x + p.vX + this.offset.x, p.y + p.vY + this.offset.y, p.size, p.size, streakColor);
                    }
                    else {
                        const behindMoon = this.isBehindMoon(p.x + p.vX + this.offset.x, p.y + p.vY + this.offset.y);
                        if (!behindMoon) {
                            Canvas.drawRect(ctx, p.x + p.vX + this.offset.x, p.y + p.vY + this.offset.y, p.size, p.size, streakColor);
                        }
                    }
                    //Change velocity
                    p.vX += getRandomNumber(-this.streaksJitter, this.streaksJitter);
                    p.vY += getRandomNumber(-this.streaksJitter, this.streaksJitter);

                    //Remove back-end streaks
                    if (s <= 0 || o <= 0 || streak.length >= this.maxLen) {
                        streak.pop();
                    }
                }
                //Draw front-most particle
                const behindMoon = this.isBehindMoon(x2 + this.offset.x, y2 + this.offset.y);
                if (!this.isFallingStar || !behindMoon) {
                    Canvas.drawRect(ctx, x2 + this.offset.x, y2 + this.offset.y, size, size, parsedColor);
                }


                if (x2 > this.width + 50 || x2 < -50 || y2 > this.height + 50 || y2 < -50) {
                    particles.splice(i, 1);
                    i--;
                }
            }
        }
    }
    isBehindMoon(x, y) {
        const moonRadius = window.innerHeight / 2;
        const yOffset = window.innerHeight * (-0.075);
        const x1 = window.innerWidth / 2;
        const y1 = moonRadius + yOffset;

        const distance = Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2));

        const distanceMultiplier = .83;
        if (distance < moonRadius * distanceMultiplier) {
            return true;
        }
        return false;
    }
    pulse(x, y, intensity) {
        const particles = this.particles;

        for (let i = 0; i < particles.length; ++i) {
            const frontParticle = this.particles[i][0];

            const distance = Math.pow(Math.sqrt(Math.pow(x - frontParticle.x, 2) + Math.pow(y - frontParticle.y, 2)) + 1, 2);

            frontParticle.vX -= (x - frontParticle.x) * intensity / distance;
            frontParticle.vY -= (y - frontParticle.y) * intensity / distance;
        }
    }

    applyOffset(x, y) {
        const particles = this.particles

        for (let i = 0; i < particles.length; ++i) {
            const particle = particles[i];

            if (particle.length > 1) {
                for (let e = 0; e < particle.length; ++e) {
                    particle[e].x += x;
                    particle[e].y += y;
                }
            }
            else {
                particle[0].x += x;
                particle[0].y += y;
            }
        }
    }

    // applyAlternativeOffset(x,y) {
    //     const particles = this.particles;
    //     for (let i = 0;i < particles.length;++i) {
    //         const particle = particles[i][0];

    //         let offsetX = particle.appliedOffset.x || 0;
    //         let offsetY = particle.appliedOffset.y || 0;

    //         particle.x += x - offsetX;
    //         particle.y += y - offsetY;

    //         console.log(x - offsetX)

    //         particle.appliedOffset.x = x;
    //         particle.appliedOffset.y = y;
    //     }
    // }
}

class Piano {
    whiteKeys = [
        "C",
        "D",
        "E",
        "F",
        "G",
        "A",
        "B"
    ];
    blackKeys = [
        "Db",
        "Eb",
        "",
        "Gb",
        "Ab",
        "Bb",
        ""
    ];
    piano = undefined;
    showing = false;
    constructor(left, top, pianoWidth, pianoHeight, octaveCount) {
        octaveCount = octaveCount || 1;

        const whiteKeysData = this.whiteKeys;
        const blackKeysData = this.blackKeys;

        const whiteKeysLength = whiteKeysData.length * octaveCount;
        const blackKeysLength = blackKeysData.length * octaveCount;

        const piano = createPiano();
        this.piano = piano;
        piano.style.opacity = "0";
        createKeys();

        const onKeyClick = (event) => {
            const div = event.target;
            if (this.onKeyClick) {
                this.onKeyClick(div);
            }
        }

        function createKeys() {
            createWhiteKeys();
            createBlackKeys();
        }

        function createWhiteKeys() {
            for (let i = 0; i < whiteKeysLength; ++i) {
                const left = `${i / whiteKeysLength * 100}%`;
                const width = `${1 / whiteKeysLength * 100}%`;
                const div = DivHelper.new(left, 0, width, pianoHeight);
                div.setAttribute("class", "whitePianoKey");
                div.setAttribute("id", whiteKeysData[i % whiteKeysData.length] + String(Math.floor(i / whiteKeysData.length) + 1))
                piano.append(div);

                div.onclick = function (event) {
                    onKeyClick(event);
                };
            }
        }
        function createBlackKeys() {
            for (let i = 0; i < blackKeysLength; ++i) {
                if (blackKeysData[i % blackKeysData.length] == "") {
                    continue;
                }
                const width = `${1 / whiteKeysLength * 50}%`;
                const left = `${i / whiteKeysLength * 100 + parseFloat(width) * 1.5}%`;
                const height = parseFloat(pianoHeight) / 1.5 + "vh";

                const div = DivHelper.new(left, 0, width, height);

                div.setAttribute("class", "blackPianoKey");
                div.setAttribute("id", blackKeysData[i % blackKeysData.length] + String(Math.floor(i / blackKeysData.length) + 1))
                piano.append(div);

                div.onclick = function (event) {
                    onKeyClick(event);
                };
            }
        }
        function createPiano() {
            const div = DivHelper.new(left, top, pianoWidth, pianoHeight);
            div.setAttribute("id", "piano");
            return div;
        }
    }

    onKeyClick(div) { }

    show(duration) {
        if (this.showing) {
            return;
        }
        duration = duration || 0;
        const piano = this.piano;
        piano.style.display = "inline";
        piano.style.opacity = "1";
        this.showing = true;
        // anime({
        //     targets: piano,
        //     opacity: 1,
        //     easing: globalEasing,
        //     duration: duration,
        //     complete: () => {
        //         this.showing = true;
        //     }
        // })
    }

    hide(duration) {
        if (!this.showing) {
            return;
        }
        duration = duration || 0;
        const piano = this.piano;
        piano.style.display = "none";
        piano.style.opacity = "1";
        this.showing = false;
        this.onKeyClick = undefined;
        // anime({
        //     targets : piano,
        //     opacity : 0,
        //     easing : globalEasing,
        //     duration : duration,
        //     complete : () => {
        //         piano.style.display = "none";
        //         this.showing = false;
        //         this.onKeyClick = undefined;
        //     }
        // })
    }
}

class ValueBar {
    width = "100px";
    height = "10px";
    top = "10px";
    left = "10px";
    value = 0;
    initialValue = 0;
    color = "rgb(255,255,255)";
    color2 = "rgba(255,255,255,.15)"
    animated = true;
    fadeAmount = 5;
    animateSpeed = 1;
    round = 1; //3
    duration = 1000;

    constructor(left, top, width, height, value, color, animate, reversed, selectable) {
        this.width = width;
        this.height = height;
        this.top = top;
        this.left = left;
        this.value = value || this.value;
        this.color = color || this.color;
        this.animated = animate || this.animated;
        this.reversed = reversed || false;
        this.selectable = selectable;

        const div = DivHelper.new(left, top, width, height);
        div.style.borderRight = "1px solid " + this.color;
        div.style.borderBottom = "1px solid " + this.color;
        div.style.zIndex = "4";
        div.object = this;
        this.element = div;
        div.setAttribute("class", "valueBar");

        if (this.reversed) {
            div.style.borderRight = "none";
            div.style.borderLeft = "1px solid " + this.color;
        }

        if (animate) {
            div.style.opacity = "0";
            $(div).animate({ opacity: 1 }, {
                duration: 500, complete: function () {
                    div.style.opacity = "1";
                }
            });
        }

        this.update()

        //Selectable 
        if (!selectable) {
            return;
        }

        const element = this.element;
        element.onmousedown = (event) => {
            const offsetX = event.offsetX;
            const width = element.offsetWidth;
            const mouseValue = offsetX / width;
            this.updateValue(mouseValue);
        }
    }
    updateValue(value) {
        const initialValue = this.value;
        this.value = value;
        this.update(initialValue);
    }
    update(initialValue) {
        const value = this.value * 100;
        const object = {
            value: initialValue * 100
        }
        const duration = this.animated ? this.duration : 0;

        const max = this.selectable ? 100 : 95;
        const transparentA = this.selectable ? "transparent 0%," : "transparent 5%,";
        const transparentB = this.selectable ? ",transparent 100%)" : ",transparent 95%)";
        anime({
            targets: object,
            value: value,
            easing: globalEasing,
            update: () => {
                const currentValue = object.value;
                let gradient;

                if (this.reversed) {
                    gradient = String("linear-gradient(135deg," + transparentA + this.color2 + " " + (100 - currentValue) + "%," + this.color + " " + Math.max((100 - currentValue) + this.fadeAmount, 0) + "%" + ")");
                }
                else {
                    gradient = String("linear-gradient(45deg," + this.color + " " + Math.min(currentValue - this.fadeAmount, max) + "%," + this.color2 + Math.min(currentValue, max) + "%" + transparentB);
                }
                this.element.style.background = gradient;
            },
            round: this.round,
            duration: duration
        })
    }
}

class GameCanvas {
    width = 1;
    height = 1;
    scale = 1;
    laneSpaceFactor = 26.5;
    laneSpace = window.innerWidth / this.laneSpaceFactor * this.scale; //How far the space between the lanes are (w/26.5 makes 75 if 1920)
    laneWidth = 2 * this.scale;
    timePosition = 0;
    notes = [];
    lanesArray = []; //Physical data of lanes
    scoreCacheData = {}; //Keeps track of where each grade is located
    scoreData = []; //Keeps track of score text objects
    scoreGradeData = ["F", "D", "C", "B", "A"];

    //Note properties
    noteWidth = this.laneSpace
    noteHeight = 12.5 * this.scale;

    //Game properties
    playing = false;
    composing = false;
    perspectiveMode = true;

    //Input data
    inputData = [];

    //Composing properties
    songBPM = 60;
    songOffset = 0;
    BPMDetail = 1;
    beatsArray = [];
    snapToBeatLines = true;
    overrideUpdate = false;

    //Youtube property
    isUsingYouTube = true;
    youtubeOffset = .1;

    //Update gradient markers
    gradientDeltas = {};

    //Cache
    scoreText = [];

    //Object properties
    createdTime = Date.now();
    transtionInitial = Date.now();

    //Performance properties
    currentTick = 0;

    constructor(lanes, left, top, laneColor, width, height, duration, isUsingYouTube, alter) { //height and width are scaled
        const w = window.innerWidth * width || this.width;
        const h = window.innerHeight * height || this.height;

        //Create canvas
        const canvas = Canvas.new(left, top, w, h);
        canvas.style.opacity = "0";
        canvas.style.transform = String("perspective(" + window.innerHeight / 2 + "px)" + "rotateX(55deg)");
        canvas.setAttribute("id", "gameCanvas");
        animate.fadeIn(canvas, duration);

        const cacheCanvas = Canvas.new(left, top, w, h);
        cacheCanvas.remove();
        const cacheCtx = cacheCanvas.getContext("2d");

        const textCanvas = Canvas.new(left, top, w, h);
        textCanvas.style.zIndex = "10";
        textCanvas.setAttribute("id", "textCanvas");
        textCanvas.style.opacity = "0";
        animate.fadeIn(textCanvas, duration);

        this.cacheCanvas = cacheCanvas;
        this.cacheCtx = cacheCtx;
        this.textCanvas = textCanvas;

        this.isUsingYouTube = isUsingYouTube;
        this.canvas = canvas;
        this.lanes = lanes;
        this.left = left;
        this.top = top;
        this.laneColor = laneColor;
        this.widthScalar = width;
        this.heightScalar = height;
        this.width = window.innerWidth * this.widthScalar;
        this.height = window.innerHeight * this.heightScalar;
        this.ctx = canvas.getContext("2d");
        this.alter = alter

        //Set settings
        this.laneSpaceFactor = -localStorage.getItem("laneSpace") + this.laneSpaceFactor || this.laneSpaceFactor;

        //Set up input data array
        for (let i = 0; i < lanes.length; ++i) {
            const obj = {
                key: lanes.substring(i, i + 1),
                value: 0, //How "activated" this lane will be
                tweenValue: 0,
                lock: false,
                color: "rgba(255,255,255,1)"
            }
            this.inputData.push(obj);
        }

        window.onresize = this.updateDimensions.bind(this);

        //Begin rendering
        this.render();
        this.updateDimensions();
    }
    render() {
        if (this.canvas) {
            window.requestAnimationFrame(() => this.render());
        }
        else {
            this.textCanvas.remove();
            this.cacheCanvas.remove();

            this.textCanvas = undefined;
            this.cacheCanvas = undefined;
        }

        if (this.canvas.width != this.width || this.canvas.height != this.height) {
            this.canvas.height = this.height;
            this.canvas.width = this.width;

            // this.cacheCanvas.height = this.height;
            // this.cacheCanvas.width = this.width;

            // this.canvas.style.width = this.width / this.scale + "px";
            // this.canvas.style.height = this.height / this.scale + "px";
            this.canvas.style.width = "100vw";
            this.canvas.style.height = "100vh";
        }

        this.targetLine = this.height / 1.25;

        //Accomodate different windows
        this.originalHeight = 929 * this.scale;
        this.heightOffset = (this.height - (this.originalHeight)) / this.scale;

        //Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        //If used for menu screen
        if (this.alter) {
            this.renderLanes();
            this.renderNotesAlternative();
        }
        else {
            //Render elements
            this.renderLanes();
            this.renderNotes();
            this.renderInput();
        }
        if (this.composing === true) {
            this.renderBeatLines();
            if (this.playing) {
                this.updateTimePositionSliderValue();
            }
            if (!this.overrideUpdate) {
                this.updateTimePosition();
            }
        }
        else {
            this.renderScores();
        }

        //Update settings
        Game.scrollingSpeed = clamp(Math.floor((1000 * localStorage.getItem("scrollingSpeed"))) || Game.scrollingSpeed, 50, 1000);

        //Update gradients (performance)
        // this.updateDimensions();

        //Update timeposition
        if (this.playing === true) {
            //Update settings (moved down)
            if (this.isUsingYouTube) {
                Game.gameAudio.setVolume(localStorage.getItem("musicVolume") * 100 || 100);
            }
            else {
                Game.gameAudio.volume = (localStorage.getItem("musicVolume") * 1 || 1);
            }

            this.updateTimePosition();
            //Play audio
            if (this.isUsingYouTube && (Game.gameAudio.getPlayerState() === 2 || Game.gameAudio.getPlayerState() === -1 || Game.gameAudio.getPlayerState() === 5)) {
                Game.gameAudio.playVideo();
            }
            else if (Game.gameAudio.paused) {
                Game.gameAudio.play();
            }
        }
        else {
            //Pause audio and sync up with timePosition
            if (this.isUsingYouTube) {
                Game.gameAudio.pauseVideo();
            }
            else {
                Game.gameAudio.pause();
            }
            // Game.gameAudio.currentTime = this.timePosition;

            //Transition when game begins
            const initialTime = this.transtionInitial;

            if (this.timePosition < 0 && this.composing === false) {
                const deltaTime = initialTime - Date.now();
                this.timePosition -= deltaTime / 1000;
                this.transtionInitial = Date.now();

                if (this.timePosition >= 0) {
                    this.playing = true;
                }
            }
        }

        if (this.currentTick >= 1000) {
            this.currentTick = 0;
        }
        ++this.currentTick;
    }

    updateDimensions() {
        this.width = window.innerWidth * this.widthScalar * this.scale;
        this.height = window.innerHeight * this.heightScalar * this.scale;

        this.laneSpace = window.innerWidth / this.laneSpaceFactor * this.scale;
        this.noteWidth = this.laneSpace;

        // const textOffset = this.laneWidth;

        const ctx = this.cacheCtx;

        ctx.clearRect(0, 0, this.width, this.height);

        const updateLaneGradient = () => {
            const laneGradientColor = Game.baseSongData[Game.selectedSong].laneGradient;
            const laneGradient = ctx.createLinearGradient(0, 0, 0, this.height / 1.2);

            laneGradient.addColorStop(0, laneGradientColor.color1);
            laneGradient.addColorStop(.7, laneGradientColor.color2);
            laneGradient.addColorStop(.75, laneGradientColor.color2);
            laneGradient.addColorStop(1, laneGradientColor.color3);
            Canvas.drawRect(ctx, 0, 0, this.laneWidth, this.height / 1.2, laneGradient);
        }

        const updateBottomLine = () => {
            const laneCount = this.laneCount;
            const x = this.width / 2 - laneCount / 2 * this.laneSpace - this.laneSpace;
            const w = this.laneSpace * this.lanes.length + this.laneSpace * 2;
            const gradient = ctx.createLinearGradient(x, 0, w + x, 0);
            const laneGradient = Game.baseSongData[Game.selectedSong].laneGradient;

            let color2 = parseColor(laneGradient.color2)
            color2 = Color.new(color2[0], color2[1], color2[2], 1)

            gradient.addColorStop(.1, laneGradient.color1);
            gradient.addColorStop(.5, color2);
            gradient.addColorStop(.9, laneGradient.color3);

            this.bottomLine = gradient;
        }

        const updateTextCanvas = () => {
            const textCanvas = this.textCanvas;
            const textCtx = textCanvas.getContext("2d");

            textCanvas.width = this.width * (2 / this.scale);
            textCanvas.height = this.height * (2 / this.scale);

            textCanvas.style.width = "100vw";
            textCanvas.style.height = "100vh";

            textCanvas.style.transform = this.perspectiveMode ? `perspective(${window.innerHeight / 2}px) rotateX(${55}deg)` : "none";

            const laneSpace = this.laneSpace * (2 / this.scale);

            for (let i = 0; i < this.laneCount; ++i) {
                const x = (textCanvas.width / 2 - this.lanes.length / 2 * laneSpace + (i * laneSpace));
                const color = Game.currentSongData ? Game.currentSongData.laneGradient.color2 : "rgb(255,255,255)";

                const fontSize = Math.floor(laneSpace / 6);
                Canvas.drawText(textCtx, x + laneSpace / 2 - fontSize / 5, textCanvas.height / 1.18, this.lanes[i], color, String(fontSize) + "px" + " Serif");
            }
        }

        const updateLongNoteGradient = () => {
            let color = Game.currentSongData ? Game.currentSongData.noteColor : "rgb(255,255,255)";
            color = color ? color : "rgb(255,255,255)";

            this.longNoteGradient = ctx.createLinearGradient(0, 0, 0, this.height);

            this.longNoteGradient.addColorStop(0, "rgba(255,255,255,0)");
            this.longNoteGradient.addColorStop(1, color);
        }

        const updateScoreText = () => {
            const fontSize = Math.floor(this.laneSpace / 3);

            const colorData = [
                "rgb(50,50,50)",
                "rgb(255,225,225)",
                "rgb(255,255,225)",
                "rgb(225,255,225)",
                "rgb(225,255,255)"
            ]

            const grades = this.scoreGradeData;
            const offsetX = 10;
            const offsetY = 100;


            for (let i = 0; i < grades.length; ++i) {
                const letter = grades[i];

                const x = fontSize * i + offsetX;
                const y = offsetY;

                const color = colorData[i];

                Canvas.drawText(ctx, x, y, letter, color, String(fontSize) + "px" + " Serif");

                this.scoreCacheData[letter] = {
                    x: x,
                    y: y,
                    fontSize: fontSize
                }
            }
        }

        // const perspectiveDistance = this.composing ? 464.5 : window.innerHeight / 2;
        // const rotation = this.composing ? Math.tanh(perspectiveDistance / window.innerHeight) * (180 / Math.PI) + 29 : 55;

        this.canvas.style.transform = this.perspectiveMode ? `perspective(${window.innerHeight / 2}px) rotateX(${55}deg)` : "none";

        updateLaneGradient();
        updateBottomLine();
        updateTextCanvas();
        updateLongNoteGradient();
        updateScoreText();

        //update fonts
        // const fontSize = this.laneSpace / 6;
        // ctx.font = String(fontSize) + "px" + " Serif";
    }

    renderScores() {
        const scoreData = this.scoreData;

        for (let i = 0; i < scoreData.length; ++i) {
            const scoreObj = scoreData[i];

            const letter = scoreObj.letter;

            const cacheLocationX = this.scoreCacheData[letter].x;
            const cacheLocationY = this.scoreCacheData[letter].y;
            const fontSize = this.scoreCacheData[letter].fontSize;

            const destinationX = scoreObj.x + fontSize / .85;
            const destinationY = scoreObj.y;

            this.ctx.globalAlpha = scoreObj.opacity;
            this.ctx.drawImage(this.cacheCanvas, cacheLocationX, cacheLocationY - fontSize, fontSize, fontSize, destinationX, destinationY, fontSize, fontSize);

            scoreObj.opacity -= 0.02 * fpsMultiplier;
            scoreObj.y += scoreObj.vY;
            scoreObj.vY += .03 * fpsMultiplier;

            scoreObj.opacity = Math.max(scoreObj.opacity, 0);

            this.ctx.globalAlpha = 1;

            if (scoreObj.opacity <= 0) {
                scoreData.splice(i, 1);
                i--;
            }
        }
    }

    addScore(lane, letter) {
        letter = this.scoreGradeData[letter];

        const scoreObj = {
            x: this.lanesArray[lane],
            y: this.height / 1.4,
            vY: 0,
            letter: letter,
            opacity: 1
        }

        this.scoreData.push(scoreObj);
    }

    renderLanes() {
        const lanes = this.lanes;
        const laneCount = lanes.length
        this.laneCount = laneCount;
        const ctx = this.ctx;
        for (let i = 0; i <= laneCount; ++i) {
            const x = (this.width / 2 - laneCount / 2 * this.laneSpace + (i * this.laneSpace));
            const y = 0;

            const height = this.height / 1.2;

            this.lanesArray[i] = x;

            if (this.alter) {
                return;
            }

            // Canvas.drawRect(ctx, x, y, this.laneWidth, this.height / 1.2, this.laneGradient);

            ctx.drawImage(this.cacheCanvas, 0, 0, this.laneWidth, height, x, y, this.laneWidth, Math.floor(height));
            // ctx.drawImage(this.cacheCanvas,x,y);

            //Draw lane text
            // if (i != laneCount) { //Workaround for undefined thing
            //     const textOffset = this.laneWidth;  
            //     const fontSize = Math.floor(this.laneSpace / 6);

            //     // Canvas.drawText(ctx, x + this.laneSpace / 2 - fontSize / 5, this.height / 1.18, lanes[i], laneGradient.color2, String(fontSize) + "px" + " Serif");
            //     console.log(x + this.laneSpace / 2 - fontSize / 5 + textOffset)

            //     ctx.drawImage(this.cacheCanvas, 
            //     x + this.laneSpace / 2 - fontSize / 5 + textOffset,
            //     100 - fontSize,
            //     fontSize,
            //     fontSize,
            //     x + this.laneSpace / 2 - fontSize / 5,
            //     this.height / 1.22,
            //     fontSize,
            //     fontSize,)
            // }


        }
        //Debounce
        this.laneDataCreated = true;

        //Bottom line
        // if (this.composing) {
        const x = this.width / 2 - laneCount / 2 * this.laneSpace - this.laneSpace;
        const w = this.laneSpace * this.lanes.length + this.laneSpace * 2;
        Canvas.drawRect(ctx, x, this.targetLine, w, this.laneWidth / 1.5, this.bottomLine); //was this.height/1.25
        // }

    }
    createNote(lane, timePosition, timePositionEnd, pianoNote) { //Time position end for the hold down notes
        //Create note on nearest beat
        const beatsArray = this.beatsArray;

        let closest = beatsArray[0];
        let closestIndex = 0;

        for (let i = 0; i < beatsArray.length; ++i) {
            const newTimePosition = beatsArray[i];

            const distance = Math.abs(timePosition - newTimePosition);

            if (distance < closest) {
                closestIndex = i;
                closest = distance;
            }
        }

        let closestEnd = beatsArray[0];
        let closestIndexEnd = 0;

        for (let i = 0; i < beatsArray.length; ++i) {
            if (!timePositionEnd) {
                break;
            }
            const newTimePosition = beatsArray[i];

            const distance = Math.abs(timePositionEnd - newTimePosition);

            if (distance < closestEnd) {
                closestIndexEnd = i;
                closestEnd = distance;
            }
        }
        //Remove duplicates
        for (let i = 0; i < this.notes.length; ++i) {
            const note = this.notes[i];

            if (note.timePosition === beatsArray[closestIndex] && note.lane === lane) {
                return;
            }

            if (document.querySelector("#snapToOtherNotesInput").checked) {
                for (let j = 0; j < this.notes.length; ++j) {
                    const noteB = this.notes[j];

                    if (note != noteB && note.timePosition === noteB.timePosition && note.lane == noteB.lane) {
                        // this.selectNote(note);
                        return;
                    }
                }
            }
        }

        if (!this.snapToBeatLines) {
            timePosition = timePosition;
            timePositionEnd = timePositionEnd;
        }
        else {
            timePosition = beatsArray[closestIndex];
            timePositionEnd = timePositionEnd === false || closestIndex === closestIndexEnd ? false : beatsArray[closestIndexEnd];
        }


        const note = {
            lane: lane,
            timePosition: timePosition,
            timePositionEnd: timePositionEnd,
            pianoNote: pianoNote || false
        }
        this.notes.push(note);
    }

    selectNote(note) { }

    renderNotes() {
        const notes = this.notes;
        const scale = this.scale;

        for (let i = 0; i < notes.length; ++i) {
            const note = notes[i];

            //Calculate Y position
            let noteY = (this.timePosition + note.timePosition) * scale;
            noteY = (noteY - this.targetLine) * Game.scrollingSpeed + this.targetLine;
            noteY += (this.heightOffset * Game.scrollingSpeed) * 0.8 * this.scale;

            noteY = Math.floor(noteY);

            if ((noteY < 0 || noteY > this.height) && (note.timePositionEnd === undefined || note.timePositionEnd == false)) {
                continue;
            }

            let height = note.timePositionEnd ? Math.abs(note.timePositionEnd - note.timePosition) * this.scale : this.noteHeight;

            //Lower transparency of notes near edges
            let opacity = 0;

            let scaleOpacity = this.scale >= 2 ? 0 : 100;

            const targetLineFactor = 1.2;
            if (noteY > 0 && noteY < this.targetLine) {
                opacity = clamp(noteY / (500 - scaleOpacity), 0, 1);
            }
            else if (noteY > this.targetLine) {
                opacity = 0;
            }

            //Long note opacity
            if (note.timePositionEnd) {
                const newY = noteY + (height * Game.scrollingSpeed);
                if (newY > 0 && noteY < this.targetLine / targetLineFactor) {
                    opacity = 1;
                }
            }

            if (opacity <= 0) {
                continue;
            }

            if (note.tagged) {
                opacity = Math.min(.25, opacity);
            }

            // noteY = noteY + (this.targetLine - noteY) * this.timePosition/((note.timePosition - this.targetLine));
            const noteX = (this.width / 2 - this.laneCount / 2 * this.laneSpace + (note.lane * this.laneSpace) + this.laneWidth / 2);
            const width = this.noteWidth;
            let color = Game.currentSongData.noteColor || "rgb(255,255,255)";

            color = parseColor(color);

            color = Color.new(color[0], color[1], color[2], opacity);

            if (height !== this.noteHeight) { //Long notes
                let longHeight = clamp(this.targetLine - (noteY), 0, height * Game.scrollingSpeed);

                const colorStopOne = note.tagged && Game.gameCombo == 0 ? "rgba(50,50,50,.25)" : this.longNoteGradient;

                const widthTween = Math.floor(note.widthTween) || 0;
                const longWidth = clamp(width / 2 + widthTween, width / 2, width) || width / 2;

                // Canvas.drawRect(this.ctx, noteX + (longWidth/2) - widthTween, noteY, longWidth, longHeight, colorStopOne);

                this.ctx.fillStyle = colorStopOne;
                this.ctx.fillRect(noteX + (longWidth / 2) - widthTween, noteY, longWidth, longHeight)

                height = this.noteHeight;

                Canvas.drawRect(this.ctx, noteX, noteY + longHeight, width, height, color);
            }

            Canvas.drawRect(this.ctx, noteX, noteY, width, height, color);
        }
    }
    renderInput() {
        const inputData = this.inputData;
        const ctx = this.ctx;
        const lanesArray = this.lanesArray;

        const songData = Game.baseSongData[Game.selectedSong];

        for (let i = 0; i < inputData.length; ++i) {
            // const lightEffectValue = Game.lightEffectValue !== undefined && Game.lightEffectValue !== NaN ? Game.lightEffectValue : 0;

            const obj = inputData[i];
            const value = obj.value * this.scale;
            const speed = .25 * fpsMultiplier;
            const tweenValue = Math.floor(obj.tweenValue + (value - obj.tweenValue) * speed);

            const offsetWidth = 1; //math.floor errors
            const x = lanesArray[i];
            const y = this.height / 1.2 - tweenValue;
            const width = this.laneSpace + offsetWidth;
            const height = tweenValue;

            let gradient = undefined;

            const color = obj.color || songData.noteColor || songData.laneGradient.color2;

            if (!Game.lowDetailMode) {
                gradient = ctx.createLinearGradient(0, y, 0, height + y);

                gradient.addColorStop(0, "rgba(255,255,255,0)");
                gradient.addColorStop(1, color);
            }
            else {
                gradient = color;
            }

            Canvas.drawRect(ctx, x, y, width, height, gradient);

            if (obj.lock === false) {
                // obj.value = obj.value + (0 - obj.value) * .025;
                obj.value -= 1 * fpsMultiplier;
            }
            // else {
            //     obj.value += getRandomNumber(-1, 1) * lightEffectValue/10;
            //     obj.value = clamp(obj.value, Game.inputReach - 50, Game.inputReach + 50)
            // }
            obj.value = clamp(obj.value, 0, 10000)
            obj.tweenValue = tweenValue;
        }
    }
    renderBeatLines() {
        const songLength = this.isUsingYouTube ? Game.gameAudio.getDuration() : Game.gameAudio.duration;
        const beatCount = (songLength / 60) * (this.songBPM * this.BPMDetail);
        const factor = 60 / (this.songBPM * this.BPMDetail);

        this.beatsArray = [];
        const beatsArray = this.beatsArray;


        for (let i = 0; i < beatCount; ++i) {
            const timePos = (this.targetLine / this.scale) - ((i) * factor) + (this.songOffset) / 60 - this.heightOffset * .8;
            let y = (this.timePosition + timePos) * this.scale;
            y = (y - this.targetLine) * Game.scrollingSpeed + this.targetLine;
            y += (this.heightOffset * Game.scrollingSpeed) * 0.8 * this.scale;

            beatsArray[i] = timePos;

            if (y < 0 || y > this.targetLine) {
                continue;
            }

            const x = this.width / 2 - this.lanes.length / 2 * this.laneSpace;
            const width = this.laneSpace * this.lanes.length;
            const height = 3;
            const color = i % this.BPMDetail === 0 ? "rgb(255,255,255)" : "rgba(255,255,255,.25)";
            Canvas.drawRect(this.ctx, x, y, width, height, color);
        }


    }
    updateTimePosition() {
        const audio = Game.gameAudio;

        let currentTime;
        if (this.isUsingYouTube) {
            const a = audio.getCurrentTime() + this.youtubeOffset;
            currentTime = this.timePosition + (a - this.timePosition) * (.1 * fpsMultiplier);
        }
        else {
            currentTime = audio.currentTime;
        }
        currentTime += Game.timeOffset / 100;
        // console.log(audio.getPlayerState() + " " + (currentTime) + " " + (this.timePosition))

        //Fixish jumping timeposition bug
        if (currentTime - this.timePosition < 0 && Math.abs(currentTime - this.timePosition) < 1 && this.isUsingYouTube) {
            // currentTime -= (currentTime - this.timePosition);
            // return;
        }
        this.timePosition = currentTime;
    }
    removeNote(index) {
        this.notes.splice(index, 1);
    }
    //Compose methods
    noteHit(timePosition, lane) { //Returns note index at timeposition
        const notes = this.notes;

        for (let i = 0; i < notes.length; ++i) {
            const note = notes[i];
            const tP = note.timePosition;
            const tPEnd = note.timePositionEnd;
            const laneNew = note.lane;

            if (tPEnd !== false) {
                if (timePosition < tPEnd && timePosition > tP && lane === laneNew) {
                    return i;
                }
            }

            if (Math.abs(timePosition - tP) < this.noteHeight / Game.scrollingSpeed && lane === laneNew) {
                return i;
            }
        }
        return false;
    }
    updateTimePositionSliderValue() {
        const audio = Game.gameAudio;
        let currentTime;
        if (this.isUsingYouTube) {
            currentTime = audio.getCurrentTime();
        }
        else {
            currentTime = audio.currentTime;
        }
        if (this.currentTick % 25 == 0) {
            document.getElementById("timePositionLabel").textContent = "TIME POSITION : " + Math.round(currentTime * 100) / 100;
        }
        $("#timePositionSlider").slider("value", currentTime);
    }

    setScale(scale) {
        this.scale = scale;

        this.laneSpace = this.laneSpace = window.innerWidth / this.laneSpaceFactor * this.scale;
        this.laneWidth = 2 * scale;
        this.noteWidth = this.laneSpace;
        this.noteHeight = 12.5 * this.scale;
    }
}

class Title {
    static titles = [];

    tickScale = 1000;
    deltaTime = 0;

    constructor(left, top, duration, offsetSize) {
        const alto = Game.baseImages.alto;
        const titleLogo = Game.baseImages.title;
        const ripple = Game.baseImages.ripple;
        const mark = Game.baseImages.mark;


        const titleWidth = String(20 + offsetSize) + "vw";
        const titleHeight = String(20 + offsetSize) + "vh";

        const titleLeft = String(left - parseFloat(titleWidth) / 2) + "vw";
        const titleTop = String(top - parseFloat(titleHeight) / 2) + "vh";

        const titleDiv = DivHelper.new(titleLeft, titleTop, titleWidth, titleHeight, "img");
        titleDiv.src = titleLogo.src;
        titleDiv.setAttribute("id", "titleDiv");


        const rippleWidth = String(20 + offsetSize) + "vw";
        const rippleHeight = String(20 + offsetSize) + "vh";

        const rippleLeft = String(left - parseFloat(titleWidth) / 2) + "vw";
        const rippleTop = String((top + 11) - parseFloat(titleHeight) / 2 + offsetSize) + "vh";

        const rippleDiv = DivHelper.new(rippleLeft, rippleTop, rippleWidth, rippleHeight, "img");
        rippleDiv.src = ripple.src;


        const altoWidth = String(6 + offsetSize / 2) + "vw";
        const altoHeight = String(6 + offsetSize / 2) + "vh";

        const altoLeft = String(left - parseFloat(altoWidth) / 2) + "vw";
        const altoTop = String((top - 12) - parseFloat(altoHeight) / 2 - offsetSize) + "vh";

        const altoDiv = DivHelper.new(altoLeft, altoTop, altoWidth, altoHeight, "img");
        altoDiv.src = alto.src;
        altoDiv.setAttribute("id", "altoDiv");


        const markLeftWidth = String(12 + offsetSize) + "vw";
        const markLeftHeight = String(12 + offsetSize) + "vh";

        const markLeftLeft = String((left - 12) - parseFloat(markLeftWidth) / 2 - offsetSize / 2) + "vw";
        const markLeftTop = String((top - 2.5) - parseFloat(markLeftHeight) / 2 - offsetSize / 2) + "vh";

        const markLeftDiv = DivHelper.new(markLeftLeft, markLeftTop, markLeftWidth, markLeftHeight, "img");
        markLeftDiv.src = mark.src;
        markLeftDiv.setAttribute("id", "markLeft");

        const markRightWidth = String(12 + offsetSize) + "vw";
        const markRightHeight = String(12 + offsetSize) + "vh";

        const markRightLeft = String((left + 13) - parseFloat(markRightWidth) / 2 + offsetSize / 2) + "vw";
        const markRightTop = String((top + 2.5) - parseFloat(markRightHeight) / 2 + offsetSize / 2) + "vh";

        const markRightDiv = DivHelper.new(markRightLeft, markRightTop, markRightWidth, markRightHeight, "img");
        markRightDiv.src = mark.src;
        markRightDiv.style.transform = "rotate(180deg)";
        markRightDiv.setAttribute("id", "markRight");

        const data = {
            title: {
                top: parseFloat(titleTop),
                left: parseFloat(titleLeft),
                width: parseFloat(titleWidth),
                height: parseFloat(titleHeight),
                element: titleDiv,
                opacity: 1
            },
            ripple: {
                top: parseFloat(rippleTop),
                left: parseFloat(rippleLeft),
                width: parseFloat(rippleWidth),
                height: parseFloat(rippleHeight),
                element: rippleDiv,
                opacity: 1
            },
            alto: {
                top: parseFloat(altoTop),
                left: parseFloat(altoLeft),
                width: parseFloat(altoWidth),
                height: parseFloat(altoHeight),
                element: altoDiv,
                opacity: 1
            },
            markLeft: {
                top: parseFloat(markLeftTop),
                left: parseFloat(markLeftLeft),
                width: parseFloat(markLeftWidth),
                height: parseFloat(markLeftHeight),
                element: markLeftDiv,
                opacity: 1
            },
            markRight: {
                top: parseFloat(markRightTop),
                left: parseFloat(markRightLeft),
                width: parseFloat(markRightWidth),
                height: parseFloat(markRightHeight),
                element: markRightDiv,
                opacity: 1
            }
        }

        const changeData = {
            title: {
                opacity: 0
            },
            ripple: {
                // top: data.ripple.top + 2,
                opacity: 0
            },
            alto: {
                top: data.alto.top - 5,
                opacity: 0
            },
            markLeft: {
                top: data.markLeft.top - 10,
                opacity: 0
            },
            markRight: {
                top: data.markRight.top + 10,
                opacity: 0
            }
        }

        this.changeData = changeData;
        this.data = data;
        this.offsetSize = offsetSize;

        Title.titles.push(data);

        //Update all elements

        const keys = Object.keys(data);
        for (let i = 0; i < keys.length; ++i) {
            const dataObject = data[keys[i]];
            const changeObject = changeData[keys[i]];

            const element = dataObject.element;

            element.style.opacity = String(changeObject.opacity);
            element.style.top = changeObject.top ? String(changeObject.top) + "vh" : element.style.top;

            //Animate elements
            anime({
                targets: element,
                top: dataObject.top + "vh",
                left: dataObject.left + "vw",
                width: dataObject.width + "vw",
                height: dataObject.height + "vh",
                opacity: dataObject.opacity,
                easing: globalEasing,
                duration: duration
            })

            element.setAttribute("class", "title")
        }

        //Gradient effect
        const gradient = { percent: 0 };
        const dropShadow = { opacity: 0 }

        anime(
            {
                targets: gradient,
                percent: 105,
                easing: globalEasing,
                update: function () {
                    const newGradient = `linear-gradient(45deg, black 0%, black ${Math.max(gradient.percent, 0)}% , transparent ${gradient.percent + 5}%)`;
                    titleDiv.style.webkitMaskImage = newGradient;
                },
                duration: duration,
                complete: function () {
                    titleDiv.style.webkitMaskImage = "none";
                    $(dropShadow).animate({
                        opacity: 1
                    }, {
                        step: function () {
                            titleDiv.style.filter = `drop-shadow(0vw 0vw 1vw rgba(255,255,255,${dropShadow.opacity}))`;
                        },
                        complete: function () {
                            titleDiv.style.filter = "drop-shadow(0vw 0vw 1vw white)";
                        },
                        duration: duration
                    })
                }
            }
        )

        setTimeout(() => {
            // this.update();

            const date = new Date();
            this.deltaTime = date.getTime();
        }, duration);
    }
    update() {
        const data = this.data;
        if (document.body.contains(data.title.element)) {
            window.requestAnimationFrame(this.update.bind(this));
        }

        const date = new Date();
        const tick = date.getTime() - this.deltaTime;

        const tickScale = this.tickScale;

        const cosValue = (Math.cos(tick / tickScale + Math.PI) + 1) / 2;

        const rippleElement = data.ripple.element;
        const titleElement = data.title.element;

        rippleElement.style.opacity = String(cosValue);
        titleElement.style.top = String(data.title.top + (cosValue * (2))) + "vh"
    }

    destroy() {
        const data = this.data;
        const keys = Object.keys(data);
        for (let i = 0; i < keys.length; ++i) {
            const dataObject = data[keys[i]];

            const element = dataObject.element;

            $(element).remove();
        }

        this.data = undefined;
    }

    fadeOut(duration) {
        const data = this.data;
        const keys = Object.keys(data);
        for (let i = 0; i < keys.length; ++i) {
            const dataObject = data[keys[i]];

            const element = dataObject.element;
            $(element).stop();

            animate.fadeOut(element, duration)
        }
    }
}

class Sound {
    static ctxArray = [];
    constructor(instrument, options) {
        const audioCtx = new AudioContext();
        Sound.ctxArray.push(audioCtx);

        Soundfont.instrument(audioCtx, instrument, options).then(function (instrumentObject) {
            this.instrument = instrumentObject;
        }.bind(this))

        this.audioCtx = audioCtx;
    }
    play(note) {
        const instrument = this.instrument;
        instrument.play(note);
    }
    remove() {
        const index = findInArray(this.audioCtx, Sound.ctxArray);
        Sound.ctxArray.splice(index, 1);
        this.instrument = undefined;
        this.audioCtx.close();
    }
}

class SongsList {
    songs = [];
    containerDiv = DivHelper.new("0vw", "0vh", "40vw", "100vh");
    divWidth = "35vw";
    divHeight = "10vh";
    selectedSong = undefined;
    hoveredSong = 0;
    scrollingHeight = 0;
    constructor() {
        this.containerDiv.setAttribute("id", "songsContainer");
        this.containerDiv.style.opacity = "0";

        animate.fadeIn(this.containerDiv, 1000);
        this.update();
    }

    update() {
        if (document.body.contains(this.containerDiv)) {
            window.requestAnimationFrame(this.update.bind(this));
        }
        const songs = this.songs;

        for (let i = 0; i < songs.length; ++i) {
            const songObject = songs[i];
            const songDiv = songObject.songDiv;
            const songData = songObject.songData;

            const distance = Math.abs(i - this.hoveredSong) + 2;

            const translateY = songObject.scrollingHeight + (this.scrollingHeight - songObject.scrollingHeight) * .1 - .1;
            let translateX = songObject.translateX + (distance - songObject.translateX) * .1;

            if (i == this.selectedSong) {
                translateX = songObject.translateX + (0 - songObject.translateX) * .1;
            }
            songDiv.style.transform = `translateY(${translateY}vh) translateX(${-translateX}vw)`;
            songDiv.style.opacity = String(1 - translateX / 10)

            songObject.translateX = translateX;
            songObject.scrollingHeight = translateY;
        }
        if (this.hoveredSong && songs[this.hoveredSong]) {
            this.scrollingHeight = this.scrollingHeight + ((-songs[this.hoveredSong].index * 10 + 50) - this.scrollingHeight) * .1;
            this.scrollingHeight = clamp(this.scrollingHeight, -songs.length * 10 + 100, 0);
        }
    }

    addSong(songData) {
        const songs = this.songs;

        const top = (songs.length * parseInt(this.divHeight) + 1) + "vh";

        const div = DivHelper.new("0vw", top, this.divWidth, this.divHeight);
        div.setAttribute("class", "songDiv");
        this.containerDiv.append(div);

        div.textContent = songData.name;
        // div.style.color = songData.textColor.title;

        const obj = {
            songData: songData,
            songDiv: div,
            scrollingHeight: this.scrollingHeight,
            translateX: 0,
            index: songs.length
        }

        //Add event
        div.onmouseover = () => {
            this.hoveredSong = obj.index;
        }
        div.onclick = (e) => {
            if (this.selectedSong == obj.index) {
                this.selectedSong = undefined;
                // return;
            }
            else {
                this.hoveredSong = obj.index;
                this.selectedSong = obj.index;
            }

            this.onclick(e);
        }

        songs.push(obj);
    }

    onclick() { }

    removeSong(index) {
        console.log(index)
        console.log(this.songs)
        this.songs[index].songDiv.remove();
        this.songs.splice(index, 1);
        this.updatePositions();
        if (index == this.hoveredSong) {
            this.hoveredSong = 0;
        }
        if (index == this.selectedSong) {
            this.selectedSong = undefined;
        }
    }

    removeAllSongs() {
        for (let i = 0; i < this.songs.length; ++i) {
            this.songs[i].songDiv.remove();

            this.songs[i] = undefined;

            if (i == this.hoveredSong) {
                this.hoveredSong = 0;
            }
            if (i == this.selectedSong) {
                this.selectedSong = undefined;
            }
        }
        this.songs = [];
        this.updatePositions();
    }

    updatePositions() {
        const songs = this.songs;
        for (let i = 0; i < songs.length; ++i) {
            const top = (i * parseInt(this.divHeight) + 1) + "vh";
            songs[i].songDiv.style.top = top;
            songs[i].index = i;
        }
    }

    remove() {
        animate.fadeOut(this.containerDiv, 1000);
        setTimeout(() => {
            this.containerDiv.remove();
        }, 1000);
    }
}

class AudioBars {
    canvas;
    left;
    top;
    width;
    height;
    cssWidth;
    cssHeight;
    detail = 10; //14
    middleBased = true;
    topBased = false;
    scale = 400; //ampitude idk why i named it scale (should be 500 ORIGINALLY)
    polygonMode = true;
    polygonGradientDistance = .15;
    hideBottomPart = true;
    constructor(left, top, width, height, cssWidth, cssHeight) {
        const canvas = Canvas.new(left, top, width, height);
        canvas.style.left = left;
        canvas.style.top = top;
        canvas.object = this;

        canvas.style.width = cssWidth ? cssWidth : undefined;
        canvas.style.height = cssHeight ? cssHeight : undefined;


        if (Game.lowDetailMode) {
            canvas.style.filter = "none";
        }

        const ctx = canvas.getContext("2d");
        this.ctx = ctx;

        this.canvas = canvas;
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
        this.cssWidth = cssWidth;
        this.cssHeight = cssHeight;

        if (this.polygonMode) {
            const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(.5 - this.polygonGradientDistance, "rgba(255,255,255,1)");
            gradient.addColorStop(.5, "rgba(255,255,255,0)");
            gradient.addColorStop(.5 + this.polygonGradientDistance, "rgba(255,255,255,1)");
            ctx.fillStyle = gradient;
        }
    }
    update(frequencyData) {
        const canvas = this.canvas;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);

        const data = frequencyData;

        this.detail = Game.lowDetailMode ? 25 : 10;

        const width = Math.floor(this.width / (data.length / this.detail));

        for (let i = 0; i < data.length / this.detail; ++i) {
            let v = Math.pow(frequencyData[i] / 1, 2) / this.scale;

            const volume = Game.titleSongAudio.volume;
            v += Math.pow(v * (1 - volume), 1.2);

            const x = Math.floor(width * (i));
            let y = this.middleBased ? this.height / 2 - v / 2 : 0;
            if (!this.middleBased) {
                y = this.topBased ? 0 : this.height - v;
            }

            if (this.polygonMode) {
                let v2 = Math.pow(frequencyData[i + 1] / 1, 2) / this.scale;
                v2 += Math.pow(v2 * (1 - volume), 1.2)
                let y1 = y;
                let x1 = x;
                let y2 = this.middleBased ? this.height / 2 - v2 / 2 : 0;
                if (!this.middleBased) {
                    y2 = this.topBased ? 0 : this.height - v2;
                }
                let x2 = Math.floor(width * (i + 1));

                const offsetLineA = this.middleBased ? v2 : v2;
                const offsetLineB = this.middleBased ? v : v;

                const yA = this.hideBottomPart ? this.height / 2 : y2 + offsetLineA;
                const yB = this.hideBottomPart ? this.height / 2 : y1 + offsetLineB;

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.lineTo(x2, yA); //the/2 makes the bototm part invisible but looks so fucking nice
                ctx.lineTo(x1, yB);
                ctx.lineTo(x1, y1);
                ctx.closePath();
                ctx.fill();
                continue;
            }

            const gradient = ctx.createLinearGradient(x, y, x, y + v);

            if (this.middleBased) {
                gradient.addColorStop(0, "rgba(255,255,255,1)");
                gradient.addColorStop(.5, "rgba(255,255,255,0)");
                gradient.addColorStop(1, "rgba(255,255,255,.1)");
            }
            else if (this.topBased) {
                gradient.addColorStop(0, "rgba(255,255,255,1)");
                gradient.addColorStop(.5, "rgba(255,255,255,.5)");
            }
            else {
                gradient.addColorStop(0, "rgba(255,255,255,.5)");
                gradient.addColorStop(.5, "rgba(255,255,255,1)");
            }

            //Draw bars
            Canvas.drawRect(ctx, x, y, width, v, gradient);
        }
    }
}

// class FallingStars {
//     avoidMoon = true;
//     spawnDelay = 100;
//     direction = -1;
//     gravity = 1;
//     tick = 0;

//     stars = [];

//     color = "white";
//     size = 2;
//     maxY = 0;

//     constructor(left,top,width,height) {
//         const canvas = Canvas.new(left,top,width,height);
//         document.body.appendChild(canvas);
//         canvas.style.zIndex = "10";
//         const ctx = canvas.getContext("2d");
//         ctx.fillStyle = this.color;

//         this.canvas = canvas;
//         this.ctx = ctx;

//         this.width = width;
//         this.height = height;

//         this.maxY = this.height;

//         this.update();
//     }
//     update() {
//         window.requestAnimationFrame(this.update.bind(this))

//         this.ctx.clearRect(0,0,this.width,this.height);

//         if (this.tick % this.spawnDelay == 0) {
//             this.tick = 0;
//             this.spawnStar();
//         }
//         this.tick++;

//         this.renderStars();
//     }
//     renderStars() {
//         const stars = this.stars;
//         const ctx = this.ctx;

//         for (let i = 0;i < stars.length;++i) {
//             const star = stars[i];

//             star.x += this.direction;
//             star.y += this.gravity;

//             ctx.fillRect(star.x,star.y,this.size,this.size);
//         }
//     }
//     spawnStar() {
//         const x = getRandomNumber(0,this.width);
//         const y = getRandomNumber(0,this.height);
//         const obj = {
//             x : x,
//             y : y,
//             originX : x,
//             originY : y
//         }
//         this.stars.push(obj);
//     }
// }

//Objects and Functions
function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}
function getDistance(x1, x2, y1, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}
// function pixelToVw(left) {
//     return (left/window.innerWidth);
// }
// function pixelToVh(top) {
//     return (top/window.innerHeight)
// }
// function pixelToVw(left) {
//     return (left/window.innerWidth);
// }
// function pixelToVh(top) {
//     return (top/window.innerHeight)
// }

//https://stackoverflow.com/a/5624139
function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

function hexToRgb(hex) {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

const ArrayFunctions = {
    swap: (array, a, b) => { //Swaps array index a with index b
        const c = array[a];
        array[a] = array[b];
        array[b] = c;
    }
}

function findInArray(v, array) { //Returns index of the found element , else false
    for (let i = 0; i < array.length; ++i) {
        const n = array[i];
        if (n == v) {
            return i;
        }
    }
    return false;
}
function findInDeepArray(v, e, array) { //Returns index of the found element , else false
    for (let i = 0; i < array.length; ++i) {
        const n = array[i][e];
        if (n == v) {
            return i;
        }
    }
    return false;
}

function parseColor(input) { //https://stackoverflow.com/a/21966100/20363208 thanks
    return input.split("(")[1].split(")")[0].split(",");
}

function parseGradient(gradient) {
    gradient = gradient.substring(gradient.indexOf('(') + 1, gradient.lastIndexOf(')'));
    return gradient.split(/,(?![^(]*\))(?![^"']*["'](?:[^"']*["'][^"']*["'])*[^"']*$)/);
}

function YouTubeGetID(url) {
    url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const Color = {
    new: (r, g, b, a) => {
        if (a === undefined) {
            return String("rgb(" + r + "," + g + "," + b + ")");
        }
        return String("rgba(" + r + "," + g + "," + b + "," + Math.floor(a * 10) / 10 + ")");
    }
}

const animate = {
    fadeOut: (element, duration) => { //Makes an element disappear
        if (duration == undefined) {
            duration = 1000;
        }
        anime({
            targets: element,
            opacity: 0,
            duration: duration,
            easing: globalEasing
        })
    },
    fadeIn: (element, duration) => { //Makes an element appear
        if (duration == undefined) {
            duration = 1000;
        }
        anime({
            targets: element,
            opacity: 1,
            duration: duration,
            easing: globalEasing
        })
    },
    setOpacity: (element, opacity, duration) => {
        if (duration == undefined) {
            duration = 1000;
        }
        anime({
            targets: element,
            opacity: opacity,
            duration: duration,
            easing: globalEasing
        })
    },
    setPosition: (element, left, top, duration) => {
        if (duration == undefined) {
            duration = 1000;
        }
        $(element).animate({
            left: left,
            top: top
        }, {
            duration: duration
        });
    }
}

const DivHelper = {
    new: (left, top, width, height, type, duration) => {
        type = type || "div";
        const div = document.createElement(type);
        div.style.position = "absolute";
        div.style.left = left;
        div.style.top = top;
        div.style.width = width;
        div.style.height = height;
        document.body.appendChild(div);
        if (duration) {
            div.style.opacity = "0";
            animate.fadeIn(div, duration);
        }
        return div;
    }
}

const flashingDiv = {
    stop: false,
    divs: [], //Divs that are added to this array will have their opacity be flashing 
    speed: .005, //How fast the flashing is
    began: false,
    add: (div, min, max, speed) => {
        if (flashingDiv.began === false) {
            flashingDiv.update();
            flashingDiv.began = true;
        }
        const obj = {
            div: div,
            vector: 1,
            min: min,
            max: max,
            speed: speed
        };
        flashingDiv.divs.push(obj);
    },
    remove: (div) => {
        for (let i = 0; i < flashingDiv.divs.length; ++i) {
            const obj = flashingDiv.divs[i];
            const d = obj.div;
            if (d === div) {
                flashingDiv.divs.splice(i, 1);
                return;
            }
        }
    },
    update: () => {
        window.requestAnimationFrame(flashingDiv.update);
        if (flashingDiv.stop === true || flashingDiv.divs.length == 0) { return; }
        const divs = flashingDiv.divs;
        for (let i = 0; i < divs.length; ++i) {
            const obj = divs[i];
            const div = obj.div;
            if (div === undefined) {
                divs.splice(i, 1);
                break;
            }

            let opacity = parseFloat(div.style.opacity);
            if (div.style.opacity === "") {
                opacity = 1;
                div.style.opacity = "1";
            }

            const min = obj.min || 0;
            const max = obj.max || 1;

            if (opacity >= max) {
                obj.vector = -1;
            }
            else if (opacity <= min) {
                obj.vector = 1;
            }
            opacity += obj.vector * (obj.speed || flashingDiv.speed);

            opacity = clamp(opacity, min, max);

            div.style.opacity = String(opacity);
        }
    }
}

const Canvas = { //Contains easy canvas related functions
    new: (left, top, width, height) => {
        const canvas = document.createElement("canvas");
        canvas.style.position = "absolute";
        canvas.width = width;
        canvas.height = height;
        canvas.style.left = left;
        canvas.style.top = top;
        document.body.append(canvas);
        return canvas;
    },
    drawRect: (ctx, x, y, width, height, color) => {
        if (ctx.fillStyle != color) {
            ctx.fillStyle = color;
        }
        // ctx.fillStyle = color || "rgb(255,255,255)";
        ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(width), Math.floor(height));
    },
    drawLine: (ctx, x1, y1, x2, y2, color, width) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = width || 15
        ctx.strokeStyle = color;
        ctx.stroke();
    },
    drawText: (ctx, x, y, text, color, font) => {
        ctx.fillStyle = color || "rgb(255,255,255)";
        if (font) {
            ctx.font = font;
        }
        ctx.fillText(text, x, y)
    }
}

// const LoadingScreen = {
//     canvas: Canvas.new("0px", "0px", window.innerWidth, window.innerHeight),
//     stop: true,
//     pointsScale: 300,
//     pointsOffsets:
//         [{ //Point 1
//             x: 0,
//             y: 0
//         },
//         { //Point 2
//             x: .5,
//             y: .5
//         },
//         { //Point 3
//             x: 1,
//             y: 0
//         },
//         { //Point 4
//             x: .5,
//             y: -.5
//         }],
//     points: [], //Stores location of every point
//     lines: [], //Stores opacity of every line
//     backgroundColor: "linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(35,35,35,1) 50%, rgba(28,28,28,1) 100%)",
//     start: (tween) => { //Condition is a Promise
//         if (LoadingScreen.stop === false) { return }
//         const canvas = LoadingScreen.canvas;
//         const ctx = canvas.getContext("2d");
//         canvas.style.opacity = "0";
//         canvas.style.background = LoadingScreen.backgroundColor;
//         canvas.setAttribute("id", "loadingScreen")
//         canvas.setAttribute("class", "important");
//         $(canvas).animate({
//             opacity: 1
//         }, {
//             duration: tween,
//             complete: () => {
//                 canvas.style.opacity = "1";
//             }
//         })

//         LoadingScreen.stop = false;

//         //Create object Points and Lines
//         const pointsOffsets = LoadingScreen.pointsOffsets;
//         const scale = LoadingScreen.pointsScale;
//         const points = LoadingScreen.points;
//         const lines = LoadingScreen.lines;

//         const originX = canvas.width / 2 - scale / 2;
//         const originY = canvas.height / 2;

//         for (let i = 0; i < pointsOffsets.length; ++i) {
//             const point = pointsOffsets[i];
//             const x = point.x * scale + originX;
//             const y = point.y * scale + originY;

//             const obj = {
//                 x: x,
//                 y: y,
//                 sX: x,
//                 sY: y
//             }
//             points.push(obj);
//             lines.push(.5);
//         }

//         LoadingScreen.update(); //Begin rendering
//     },
//     lineChosen: 0,
//     switchSpeed: .02, //How fast the lines switch
//     update: () => {
//         if (LoadingScreen.stop === true) { return }
//         window.requestAnimationFrame(LoadingScreen.update);

//         const canvas = LoadingScreen.canvas;
//         const ctx = canvas.getContext("2d");
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         const points = LoadingScreen.points;
//         const lines = LoadingScreen.lines;

//         //Update dimensions
//         canvas.width = window.innerWidth;
//         canvas.height = window.innerHeight

//         //Filters
//         ctx.shadowColor = "rgb(255,255,255)";
//         ctx.shadowBlur = 25;

//         for (let i = 0; i < lines.length; ++i) { //Update lines
//             const opacity = lines[i];

//             const x1 = points[i].x;
//             const y1 = points[i].y;

//             let x2 = points[i + 1] || points[0];
//             let y2 = points[i + 1] || points[0];

//             x2 = x2.x;
//             y2 = y2.y;

//             Canvas.drawLine(ctx, x1, y1, x2, y2, Color.new(240, 240, 255, opacity), 3);

//             //Change line opacity
//             if (LoadingScreen.lineChosen === i) {
//                 lines[i] += LoadingScreen.switchSpeed;
//             }
//             else {
//                 lines[i] -= LoadingScreen.switchSpeed / 2;
//             }
//             if (lines[LoadingScreen.lineChosen] === 1) {
//                 if (LoadingScreen.lineChosen === lines.length - 1) {
//                     LoadingScreen.lineChosen = 0;
//                 }
//                 else {
//                     ++LoadingScreen.lineChosen;
//                 }
//             }
//             lines[i] = clamp(lines[i], .5, 1);
//         }
//     },
//     remove: (tween) => {
//         const canvas = LoadingScreen.canvas;
//         LoadingScreen.stop = true;

//         $(canvas).animate({
//             opacity: 0
//         }, {
//             duration: tween,
//             complete: function () {
//                 LoadingScreen.lines = [];
//                 LoadingScreen.points = [];
//             }
//         })
//     }
// }

const LoadingScreen = {
    show: (duration) => {
        const elements = LoadingScreen.elements;
        if (elements.canvas === undefined) {
            LoadingScreen.create(duration);
        }
        else {
            document.body.append(elements.div);
            document.body.append(elements.canvas);

            elements.div.style.zIndex = String(LoadingScreen.zIndex)
            elements.canvas.style.zIndex = String(LoadingScreen.zIndex + 1);

            animate.fadeIn(elements.div, duration);
            animate.fadeIn(elements.canvas, duration);
        }

        LoadingScreen.visible = true;
        LoadingScreen.update();

        //Fun thing
        elements.canvas.onmousedown = function () {
            LoadingScreen.noteToSpawn = Math.floor(getRandomNumber(0, 6));
        }
        LoadingScreen.notes = [];
        const spawnInterval = setInterval(() => {
            if (LoadingScreen.visible === false || LoadingScreen.stopNotes === true) {
                clearInterval(spawnInterval);
            }
            LoadingScreen.noteToSpawn = Math.floor(getRandomNumber(0, 6));
        }, 500)
    },
    hide: (duration) => {
        duration = duration || 1000;

        const elements = LoadingScreen.elements;

        const div = elements.div;
        const canvas = elements.canvas;

        animate.fadeOut(div, duration);
        animate.fadeOut(canvas, duration);

        setTimeout(() => {
            LoadingScreen.visible = false;
            LoadingScreen.stopNotes = false;
            div.remove();
            canvas.remove();
        }, duration);
    },
    update: () => {
        if (LoadingScreen.visible === true) {
            window.requestAnimationFrame(LoadingScreen.update);
        }

        const elements = LoadingScreen.elements;
        const canvas = elements.canvas;
        const div = elements.div;
        const ctx = canvas.getContext("2d");

        //Refresh canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //Lane properties
        const lineCount = 7;
        const lineWidth = 2;
        const lineHeight = canvas.height;
        const laneSpace = canvas.width / lineCount;

        //Note properties
        const noteHeight = 10;
        const noteWidth = laneSpace;

        renderLines();
        renderNotes();

        function renderLines() {
            for (let i = 0; i < lineCount; ++i) {
                const x = i * laneSpace + laneSpace / 2;
                const y = 0;


                const gradient = ctx.createLinearGradient(x, y, x, y + lineHeight);

                gradient.addColorStop(0, "rgba(255,255,255,0)");
                gradient.addColorStop(.5, "rgba(255,255,255,1)")
                gradient.addColorStop(1, "rgba(255,255,255,0)");

                Canvas.drawRect(ctx, x, y, lineWidth, lineHeight, gradient)
            }
        }

        function renderNotes() {
            const notes = LoadingScreen.notes;
            for (let i = 0; i < notes.length; ++i) {
                const obj = notes[i];

                const lane = obj.lane;
                const x = lane * laneSpace + lineWidth / 2 + laneSpace / 2;
                const y = obj.y;
                const width = noteWidth;
                const height = noteHeight;

                const opacity = -(Math.abs(lineHeight / 2 - y) / (lineHeight / 2)) + 1;

                const color = Color.new(255, 255, 255, opacity)

                Canvas.drawRect(ctx, x, y, width, height, color);

                obj.y += 3 * fpsMultiplier;
            }

            if (LoadingScreen.noteToSpawn !== false) {
                createNote(LoadingScreen.noteToSpawn);
                LoadingScreen.noteToSpawn = false;
            }
        }

        function createNote(lane) {
            const obj = {
                y: 0,
                lane: lane
            }
            LoadingScreen.notes.push(obj);
        }
    },
    create: (duration) => {
        //Create elements
        const screenWidth = Math.max(screen.width, screen.height)
        const screenHeight = Math.min(screen.width, screen.height)

        const div = DivHelper.new("0px", "0px", "100vw", "100vh");
        const canvas = Canvas.new("37.5vw", "27.5vh", screenWidth / 4, screenHeight / 4);

        div.setAttribute("class", "loadingScreen");
        canvas.setAttribute("class", "loadingScreen");

        div.setAttribute("id", "loadingScreenDiv");
        canvas.setAttribute("id", "loadingScreenCanvas");

        LoadingScreen.elements.div = div;
        LoadingScreen.elements.canvas = canvas;

        //Animate
        div.style.opacity = "0";
        canvas.style.opacity = "0";

        div.style.zIndex = String(LoadingScreen.zIndex)
        canvas.style.zIndex = String(LoadingScreen.zIndex + 1);

        animate.fadeIn(div, duration);
        animate.fadeIn(canvas, duration);
    },
    elements: {},
    visible: false,
    notes: [],
    noteToSpawn: 0,
    zIndex: 2
}

const Mouse = {
    x: 0,
    y: 0,
    underlines: [],
    track: () => {
        function mouseMove(event) {
            const clientX = event.clientX;
            const clientY = event.clientY;
            Mouse.x = clientX;
            Mouse.y = clientY;
        }
        function update() {
            window.requestAnimationFrame(update);

            const x = Mouse.x;
            const y = Mouse.y;
        }
        document.addEventListener("mousemove", mouseMove);
        //update();
    }
}

const Effects = {
    shakingElements: [],
    notifyMouseDebounce: false,
    hrefHold: undefined,
    pulse: (size, x, y, duration) => {
        const pulseDiameter = size;
        const left = String((x) + "px");
        const top = String((y) + "px");

        const element = DivHelper.new(left, top, 1 + "px", 1 + "px");
        element.setAttribute("id", "pulseEffect");

        let parsedGradient = parseGradient(document.body.style.background)[2]
        parsedGradient = parsedGradient.substring(0, parsedGradient.length - 3)
        const backgroundGradient = "radial-gradient(circle, transparent 0%," + parsedGradient + "40% , transparent 50%)";
        element.style.background = backgroundGradient;

        if (browserName == "chrome") {
            anime({
                targets: element,
                scale: pulseDiameter,
                opacity: 0,
                easing: globalEasing,
                duration: duration,
                complete: function () {
                    $(element).remove();
                }
            })
        }
        else {
            anime({
                targets: element,
                left: (x - pulseDiameter / 2) + "px",
                top: (y - pulseDiameter / 2) + "px",
                width: pulseDiameter + "px",
                height: pulseDiameter + "px",
                opacity: 0,
                easing: globalEasing,
                duration: duration,
                complete: function () {
                    $(element).remove();
                }
            })
        }


        // $(element).animate({
        //     left: (x - pulseDiameter / 2) + "px",
        //     top: (y - pulseDiameter / 2) + "px",
        //     width: pulseDiameter + "px",
        //     height: pulseDiameter + "px",
        //     opacity: 0
        // }, {
        //     duration: duration,
        //     complete: function () {
        //         $(element).remove();
        //     }
        // })
    },
    displayMessage: (message, timeout, duration, top) => {
        const div = DivHelper.new("0vw", top || "40vh", "100vw", "0vh", "div", duration);
        div.setAttribute("class", "displayMessage");
        div.textContent = message;

        if (!timeout) {
            return;
        }

        setTimeout(() => {
            animate.fadeOut(div, duration);
            setTimeout(() => {
                $(div).remove();
            }, duration);
        }, timeout);
    },
    notify: (message, timeout, href) => {
        const duration = 1000;
        timeout = Math.max(timeout + duration, 1000);

        if (document.querySelector("#notification")) {
            hideMessage();
            setTimeout(() => {
                showMessage();
            }, duration);
        }
        else {
            showMessage();
        }

        if (timeout) {
            setTimeout(() => {
                hideMessage();
            }, timeout);
        }

        Effects.hrefHold = href;

        function showMessage() {
            const div = document.querySelector("#notification") || DivHelper.new("100vw", "75vh", "15vw", "7.5vh");
            div.setAttribute("id", "notification");
            div.setAttribute("class", "important");
            div.textContent = message

            anime({
                targets: div,
                left: "85vw",
                opacity: "1",
                duration: duration,
                easing: globalEasing
            })

            if (!Effects.notifyMouseDebounce) {
                Effects.notifyMouseDebounce = true;
                div.onmousedown = function () {
                    if (Effects.hrefHold) {
                        window.open(Effects.hrefHold, "_blank");
                        Effects.hrefHold = undefined;
                    }
                    hideMessage();
                }
            }
        }
        function hideMessage() {
            const div = document.querySelector("#notification") || DivHelper.new("100vw", "75vh", "15vw", "7.5vh");

            anime({
                targets: div,
                left: "100vw",
                opacity: "0",
                duration: duration,
                easing: globalEasing
            })

            div.onclick = undefined;
        }
    },
    shakeElement: (element, duration, scale, intensity) => {
        duration /= (scale * 3);
        const timeline = anime.timeline({
            easing: globalEasing,
            duration: duration,
            loop: Math.floor(scale),
            autoplay: true
        })

        timeline.add({
            targets: element,
            translateX: intensity,
            translateY: intensity
        })
            .add({
                targets: element,
                translateX: -intensity,
                translateY: -intensity
            })
            .add({
                targets: element,
                translateX: 0,
                translateY: 0
            })
    }
}

const BackButton = {
    destination: undefined,
    left: "0vw",
    top: "5vh",
    element: undefined,
    duration: 1000,
    show: (destination, cleanUp, timeout, loadingScreen, duration, hideLoadingScreenWhenComplete) => {
        BackButton.element = Game.actions.getBackButton(BackButton.left, BackButton.top);

        BackButton.destination = destination;

        const element = BackButton.element;
        element.style.opacity = "0";
        animate.setOpacity(element, .5, BackButton.duration);

        element.onmouseover = function () {
            animate.fadeIn(element, BackButton.duration);
        }
        element.onmouseleave = function () {
            animate.setOpacity(element, .5, BackButton.duration);
        }
        element.onmousedown = function () {
            animate.fadeOut(element, BackButton.duration);

            element.onmousedown = undefined;
            element.onmouseover = undefined;
            element.onmouseleave = undefined;

            if (loadingScreen) {
                LoadingScreen.show(duration);
            }

            setTimeout(() => {
                if (cleanUp) {
                    Game.actions.cleanUp();
                }
                if (hideLoadingScreenWhenComplete) {
                    LoadingScreen.hide(duration);
                }
                BackButton.destination();
            }, timeout);
        }
    },
    hide: (duration) => {
        const element = BackButton.element;
        element.onmousedown = undefined;
        element.onmouseover = undefined;
        element.onmouseleave = undefined;
        animate.fadeOut(element, duration);
        setTimeout(() => {
            element.remove();
        }, duration);
    }
}

const MouseEffects = {
    active: true,
    blacklist: [
        "playParticles",
        "menuParticles",
        "fallingStars"
    ],
    create: () => {
        document.onmousedown = function (event) {
            MouseEffects.pulseMouse(event);
            MouseEffects.playNoise(event);
        };
    },
    pulseMouse: () => {
        const mouseX = Mouse.x;
        const mouseY = Mouse.y;

        if (Game.gameCanvas && Game.gameCanvas.canvas) {
            return;
        }

        if (mouseX === 0 && mouseY === 0) {
            //Return so a click isnt registered when mouse isnt initialized
            return;
        }

        const elementFromPoint = document.elementFromPoint(mouseX, mouseY);

        const hasEvents = elementFromPoint !== undefined ? (elementFromPoint.onmouseenter || elementFromPoint.onmouseleave || elementFromPoint.onmousedown || elementFromPoint.onmouseup || elementFromPoint.onclick) && MouseEffects.blacklist.find(item => item == elementFromPoint.getAttribute("id")) : null;

        let pulseDiameter = window.innerWidth / 5;
        const duration = 500;

        const left = String((mouseX) + "px");
        const top = String((mouseY) + "px");

        //Pulse mouse
        const element = DivHelper.new(left, top, 1 + "px", 1 + "px");
        let parsedGradient = parseGradient(document.body.style.background)[2]
        parsedGradient = parsedGradient.substring(0, parsedGradient.length - 3)
        element.setAttribute("id", "pulseEffect");
        const backgroundGradient = "radial-gradient(circle, transparent 0%," + parsedGradient + "40% , transparent 50%)";

        element.style.background = backgroundGradient;
        element.style.zIndex = "1000";

        if (hasEvents === null || MouseEffects.blacklist.find(item => item == elementFromPoint.getAttribute("id"))) {
            // return;
            pulseDiameter = window.innerWidth / 10;
            element.style.opacity = ".5";
        }

        if (browserName == "chrome") {
            anime({
                targets: element,
                scale: pulseDiameter,
                opacity: 0,
                duration: duration,
                easing: globalEasing,
                complete: function () {
                    $(element).remove();
                }
            })
        }
        else {
            anime({
                targets: element,
                left: (mouseX - pulseDiameter / 2) + "px",
                top: (mouseY - pulseDiameter / 2) + "px",
                width: pulseDiameter + "px",
                height: pulseDiameter + "px",
                opacity: 0,
                duration: duration,
                easing: globalEasing,
                complete: function () {
                    $(element).remove();
                }
            })
        }


        // $(element).animate({
        //     left: (mouseX - pulseDiameter / 2) + "px",
        //     top: (mouseY - pulseDiameter / 2) + "px",
        //     width: pulseDiameter + "px",
        //     height: pulseDiameter + "px",
        //     opacity: 0
        // }, {
        //     duration: duration,
        //     complete: function () {
        //         $(element).remove();
        //     }
        // })
    },
    playNoise: () => {
        if (Game.gameCanvas && Game.gameCanvas.canvas) {
            return;
        }
        const mouseX = Mouse.x;
        const mouseY = Mouse.y;

        if (MouseEffects.playPiano == undefined) {
            Soundfont.instrument(MouseEffects.playNoiseAudioCtx, 'tinkle_bell', { gain: .3, decay: 500, sustain: 10 }).then(function (piano) { //tinkle_bell {decay : 1000, sustain : 10}
                MouseEffects.playPiano = piano;
            })
        }
        const piano = MouseEffects.playPiano;

        const elementFromPoint = document.elementFromPoint(mouseX, mouseY);
        const hasEvents = elementFromPoint !== undefined ? (elementFromPoint.onmouseenter || elementFromPoint.onmouseleave || elementFromPoint.onmousedown || elementFromPoint.onmouseup || elementFromPoint.onclick) : null;

        if (piano == undefined) {
            return;
        }

        piano.play(MouseEffects.playPianoNotesLeft[MouseEffects.playPianoIndex]);

        if (hasEvents && !MouseEffects.blacklist.find(item => item == elementFromPoint.getAttribute("id"))) {
            piano.play(MouseEffects.playPianoNotesRight[MouseEffects.playPianoIndex]);
        }
        MouseEffects.playPianoIndex = MouseEffects.playPianoIndex == MouseEffects.playPianoNotesRight.length - 1 ? 0 : MouseEffects.playPianoIndex + 1;
    },
    playNoiseAudioCtx: new AudioContext(),
    playPiano: undefined,
    playPianoNotesRight: [
        "b6"
    ],
    playPianoNotesLeft: [
        "d6"
    ],
    // playPianoNotesRight: [
    //     "b6", "a6", "Ab6", "d7",
    //     // "a6","Ab6",
    //     "b6", "a6", "Ab6", "b6",
    //     // "a6","Ab6",
    //     "a6", "Db6", "e6", "Db7",
    //     // "Db6","e6",
    //     "a6", "Db6", "e6", "b6",
    //     // "Db6","e6",
    // ],
    // playPianoNotesLeft: [
    //     "d5", "Gb5", "a5", "d6",
    //     // "","",
    //     "d5", "Gb5", "a5", "d6",
    //     // "","",
    //     "Db5", "e5", "a5", "Db6",
    //     // "","",
    //     "Db5", "e5", "a5", "Db6",
    //     // "","",
    // ],
    playPianoIndex: 0
    // hoverMouse : () => {
    //     window.requestAnimationFrame(MouseEffects.update)

    //     if (MouseEffects.active !== true) {
    //         return;
    //     }

    //     const x = Mouse.x;
    //     const y = Mouse.y;

    //     const element = document.elementFromPoint(x,y);

    //     //Check if the element has active events which indicate that it's a button
    //     const hasEvents = element !== undefined ? (element.onmouseenter || element.onmouseleave || element.onmousedown || element.onmouseup || element.onclick) : null;

    //     MouseEffects.opacity = clamp(MouseEffects.opacity ,0,MouseEffects.sinValue)
    //     const hoverElement = MouseEffects.element;
    //     hoverElement.style.opacity = String(MouseEffects.opacity);

    //     const offsetWidth = hoverElement.offsetWidth;
    //     const offsetHeight = hoverElement.offsetHeight;

    //     hoverElement.style.left = String((x - offsetWidth/2) + "px");
    //     hoverElement.style.top = String((y - offsetHeight/2) + "px");

    //     MouseEffects.interval++;

    //     if (MouseEffects === null) {
    //         HoverEffect.opacity -= .01;
    //         return;
    //     }

    //     const sinValue = (.5) * Math.sin(MouseEffects.interval/50) + .5;
    //     MouseEffects.sinValue = sinValue;

    //     MouseEffects.opacity += .01;
    // }
}

const titleSongController = {
    init: () => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioCtx.createAnalyser();

        const source = audioCtx.createMediaElementSource(Game.titleSongAudio);
        const listen = audioCtx.createGain();

        source.connect(listen);
        listen.connect(analyser);
        listen.connect(audioCtx.destination);

        const frequencyData = new Uint8Array(analyser.frequencyBinCount);

        titleSongController.audioCtx = audioCtx;
        titleSongController.analyser = analyser;
        titleSongController.source = source;
        titleSongController.listen = listen;
        titleSongController.frequencyData = frequencyData;

        analyser.smoothingTimeConstant = titleSongController.smoothingTimeConstant;
    },
    getTitleSongValue: () => {
        const controller = titleSongController;

        const analyser = controller.analyser;
        const frequencyData = controller.frequencyData;

        analyser.getByteFrequencyData(frequencyData);

        let n = 0;

        for (let i = 0; i < frequencyData.length; ++i) {
            const v = frequencyData[i];
            n += v;
        }

        n /= frequencyData.length;

        return n;
    },
    play: () => {
        const titleSong = Game.titleSongAudio;
        titleSong.play();
    },
    pause: () => {
        const titleSong = Game.titleSongAudio;
        titleSong.pause();
    },
    remove: () => {
        const controller = titleSongController;

        const listen = controller.listen;
        const audioCtx = controller.audioCtx;
        const analyser = controller.analyser;
        const frequencyData = controller.frequencyData;
        const source = controller.source;

        source.disconnect();
        listen.disconnect();
        analyser.disconnect();
        audioCtx.close();
        frequencyData = undefined;

        source = undefined;
        listen = undefined;
        audioCtx = undefined;
        analyser = undefined;
        source = undefined;
    },
    fadeOut: () => {
        const audio = Game.titleSongAudio;

        const vol = { volume: audio.volume };

        $(vol).animate({
            volume: 0
        }, {
            duration: 1000,
            step: function () {
                audio.volume = vol.volume;
            }
        });
        setTimeout(() => {
            audio.pause();
        }, 1000);
    },
    audioCtx: undefined,
    smoothingTimeConstant: .85, //.8
    frequencyData: undefined,
    analyser: undefined,
    source: undefined,
    listen: undefined,
    stopUpdating: false,
    titleSongData: undefined
}

const Game = { //Object containg every game scene
    premenu: () => {
        //game version
        const version = DivHelper.new("90vw", "97.5vh", "10vw", "5vh", "div", 1000);
        version.setAttribute("id", "gameVersion");
        version.setAttribute("class", "important");
        version.textContent = Game.version;

        const actions = Game.actions;
        actions.createVignette();

        const duration = 2000//localStorage.getItem("returningUser") ? 1000 : 2000

        //Animate vignette
        document.querySelector("#vignette").style.opacity = 0;
        animate.fadeIn(document.querySelector("#vignette"), duration);

        animate.setOpacity(LoadingScreen.elements.canvas, .1, duration);
        LoadingScreen.stopNotes = false;

        const welcomeLabel = DivHelper.new("50%", "25vh", "60vmax", "", "div", 1000);
        // welcomeLabel.setAttribute("class", "label");
        welcomeLabel.setAttribute("id", "welcomeLabel");
        welcomeLabel.innerText = "Welcome to lunarbeats, an online rhythm game! \n An account is not required to play.";
        welcomeLabel.style.fontSize = "2vmax";

        const loginButton = DivHelper.new("50%", "40vh", "10vmax", "5vmin", "div");
        loginButton.setAttribute("id", "loginButton");
        loginButton.setAttribute("class", "premenuButtons");

        const signupButton = DivHelper.new("50%", "50vh", "15vmax", "5vmin", "div");
        signupButton.setAttribute("id", "signupButton");
        signupButton.setAttribute("class", "premenuButtons");

        const guestButton = DivHelper.new("50%", "65vh", "20vmax", "5vmin", "div");
        guestButton.setAttribute("id", "guestButton");
        guestButton.setAttribute("class", "premenuButtons");

        const tosLabel = DivHelper.new("20vw", "96vh", "60vw", "", "div", 1000);
        tosLabel.setAttribute("id", "tosLabel");
        tosLabel.innerHTML = "By continuing you agree with the " + '<a href="' + "terms.html" + '">' + "Terms of Service" + '</a>';
        tosLabel.style.fontSize = "1rem";

        loginButton.textContent = "LOGIN";
        signupButton.textContent = "SIGN UP";
        guestButton.textContent = "CONTINUE";

        loginButton.style.opacity = "0";
        signupButton.style.opacity = "0";
        guestButton.style.opacity = "0";

        const divider = DivHelper.new("50%", "55vh", "25vmax", "10vmin", "img")
        divider.setAttribute("class", "premenuButtons");
        divider.src = Game.baseImages.divider.src;
        divider.style.opacity = "0";
        animate.setOpacity(divider, .15, duration);
        divider.style.pointerEvents = "none";

        // const topDivider = DivHelper.new("37.5vw", "32vh", "25vw", "5vh", "img");
        // topDivider.setAttribute("class", "premenuButtons");
        // topDivider.src = Game.baseImages.difficultyDivider.src;
        // topDivider.style.opacity = "0";
        // animate.setOpacity(topDivider, .25, duration);
        // topDivider.style.pointerEvents = "none";

        const buttons = [loginButton, signupButton, guestButton];

        let textButtons = [];

        buttons.forEach((button) => {
            button.onmouseenter = onmouseenter;
            button.onmouseleave = onmouseleave;
            animate.setOpacity(button, .5, duration / 2);
        })

        function onmouseenter(e) {
            const button = e.target;
            animate.fadeIn(button, duration / 4);
        }
        function onmouseleave(e) {
            const button = e.target;
            animate.setOpacity(button, .5, duration / 4);
        }

        loginButton.onclick = loginScreen;
        signupButton.onclick = signupScreen;
        guestButton.onclick = function () {
            hideInitialButtons();
            finish();
        }

        checkToken();

        async function checkToken() {
            const token = localStorage.getItem("token");
            const username = localStorage.getItem("username");

            if (!token) {
                return;
            }

            await fetch("/api/logIn", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    "Accepts": "application/json"
                },
                body: JSON.stringify({
                    token: token,
                    username: username
                })
            })
                .then(response => response.json())
                .then((data) => {
                    if (data.error) {
                        Effects.displayMessage("Automatic login failed. Please manually log in.", 3000, 1000, "20vh");
                        return;
                    }

                    localStorage.setItem("username", data.username);
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("userId", data.userId);

                    anime({
                        targets: guestButton,
                        // scale: 1.25,
                        duration: duration,
                        easing: globalEasing,
                        update: function (a) {
                            signupButton.style.filter = "blur(" + 3 * a.progress / 100 + "px)";
                            loginButton.style.filter = "blur(" + 3 * a.progress / 100 + "px)";
                            guestButton.style.filter = "drop-shadow(0vw 0vw " + 2 * a.progress / 100 + "vw white)";
                        }
                    })

                    animate.fadeOut(welcomeLabel, duration);

                    Effects.displayMessage("Welcome back " + data.username + ".", 2000, 1000, "20vh");
                })
        }

        async function signupScreen() {
            hideInitialButtons();

            const backButton = DivHelper.new("45vw", "77.5vh", "10vw", "4vh", "div");
            backButton.setAttribute("id", "backButtonPreMenu");
            backButton.setAttribute("class", "premenuButtons");
            backButton.textContent = "RETURN";
            backButton.onmouseenter = onmouseenter;
            backButton.onmouseleave = onmouseleave;
            backButton.onclick = backButtonClick;
            backButton.style.opacity = "0";
            animate.setOpacity(backButton, .5, duration);

            const username = DivHelper.new("40vw", "40vh", "20vw", "5vh", "input", duration);
            username.setAttribute("id", "usernameText");
            username.setAttribute("class", "premenuButtons");
            username.placeholder = "USER NAME";
            username.maxLength = 16;

            const password = DivHelper.new("40vw", "50vh", "20vw", "5vh", "input", duration);
            password.setAttribute("id", "passwordText");
            password.setAttribute("class", "premenuButtons");
            password.placeholder = "PASSWORD";
            password.type = "password";
            password.maxLength = 50;

            const passwordConfirm = DivHelper.new("40vw", "60vh", "20vw", "5vh", "input", duration);
            passwordConfirm.setAttribute("id", "passwordConfirmText");
            passwordConfirm.setAttribute("class", "premenuButtons");
            passwordConfirm.placeholder = "CONFIRM PASSWORD";
            passwordConfirm.type = "password";
            passwordConfirm.maxLength = 50;

            const continueButton = DivHelper.new("40vw", "70vh", "20vw", "5vh", "div");
            continueButton.setAttribute("id", "guestButton");
            continueButton.setAttribute("class", "premenuButtons");
            continueButton.style.opacity = "0";
            continueButton.textContent = "CONTINUE";

            continueButton.onmouseenter = onmouseenter;
            continueButton.onmouseleave = onmouseleave;
            continueButton.onclick = onclick;

            textButtons = [continueButton, passwordConfirm, password, username, backButton];

            animate.fadeOut(divider, duration);
            animate.setOpacity(continueButton, .5, duration);

            async function onclick() {
                const usernameValue = username.value;
                const passwordValue = password.value;
                const passwordConfirmValue = passwordConfirm.value;

                if (passwordConfirmValue != passwordValue) {
                    Effects.displayMessage("Passwords do not match.", 3000, 1000, "20vh");
                    return;
                }

                try {
                    await fetch("/api/signUp", {
                        method: "post",
                        headers: {
                            "Content-Type": "application/json",
                            "Accepts": "application/json"
                        },
                        body: JSON.stringify({
                            username: usernameValue,
                            password: passwordValue
                        })
                    })
                        .then(response => response.json())
                        .then((data) => {
                            if (data.error) {
                                Effects.displayMessage(data.error, 3000, 1000, "20vh");
                                return;
                            }
                            Effects.displayMessage("Hello, " + usernameValue + "! Enjoy your stay.", 3000, 1000, "20vh");

                            localStorage.setItem("username", usernameValue);
                            localStorage.setItem("token", data.token);
                            localStorage.setItem("userId", data.userId);

                            finish()
                        })
                }
                catch {
                    Effects.displayMessage("Internal server error.", 3000, 1000, "20vh");
                }


            }
        }

        async function loginScreen() {
            hideInitialButtons();

            // const token = localStorage.getItem("token");

            let loginFailed = false;

            // if (token) {
            //     await fetch("/api/logIn", {
            //         method: "post",
            //         headers: {
            //             "Content-Type": "application/json",
            //             "Accepts": "application/json"
            //         },
            //         body: JSON.stringify({
            //             token: token
            //         })
            //     })
            //         .then(response => response.json())
            //         .then((data) => {
            //             if (data.error) {
            //                 Effects.displayMessage("Login failed.", 3000, 1000, "20vh");
            //             }
            //         })

            //     if (loginFailed) {
            //         console.log("login failed");
            //     }
            //     else {
            //         return;
            //     }
            // }

            const backButton = DivHelper.new("45vw", "72.5vh", "10vw", "4vh", "div");
            backButton.setAttribute("id", "backButtonPreMenu");
            backButton.setAttribute("class", "premenuButtons");
            backButton.textContent = "RETURN";
            backButton.onmouseenter = onmouseenter;
            backButton.onmouseleave = onmouseleave;
            backButton.onclick = backButtonClick;
            backButton.style.opacity = "0";
            animate.setOpacity(backButton, .5, duration);

            const username = DivHelper.new("40vw", "40vh", "20vw", "5vh", "input", duration);
            username.setAttribute("id", "usernameText");
            username.setAttribute("class", "premenuButtons");
            username.placeholder = "USER NAME";
            username.maxLength = 16;

            const password = DivHelper.new("40vw", "50vh", "20vw", "5vh", "input", duration);
            password.setAttribute("id", "passwordText");
            password.setAttribute("class", "premenuButtons");
            password.placeholder = "PASSWORD";
            password.type = "password";
            password.maxLength = 50;

            const continueButton = DivHelper.new("40vw", "65vh", "20vw", "5vh", "div");
            continueButton.setAttribute("id", "guestButton");
            continueButton.setAttribute("class", "premenuButtons");
            continueButton.style.opacity = "0";
            continueButton.textContent = "CONTINUE";

            continueButton.onmouseenter = onmouseenter;
            continueButton.onmouseleave = onmouseleave;
            continueButton.onclick = onclick;

            animate.setOpacity(continueButton, .5, duration);

            textButtons = [password, continueButton, username, backButton];

            async function onclick() {
                const usernameValue = username.value;
                const passwordValue = password.value;

                try {
                    await fetch("/api/logIn", {
                        method: "post",
                        headers: {
                            "Content-Type": "application/json",
                            "Accepts": "application/json"
                        },
                        body: JSON.stringify({
                            username: usernameValue,
                            password: passwordValue
                        })
                    })
                        .then(response => response.json())
                        .then((data) => {
                            if (data.error) {
                                Effects.displayMessage("Invalid username or password.", 3000, 1000, "20vh");
                            }
                            else {
                                localStorage.setItem("username", usernameValue);
                                localStorage.setItem("token", data.token);
                                localStorage.setItem("userId", data.userId);
                                finish();
                            }
                        })
                }
                catch {
                    Effects.displayMessage("Internal server error.", 3000, 1000, "20vh");
                }
            }
        }

        function backButtonClick() {
            showInitialButtons();
        }

        function finish() {
            animate.fadeOut(divider, duration);
            animate.setOpacity(LoadingScreen.elements.canvas, 0, duration);

            LoadingScreen.hide(duration * 4);

            titleSongController.init();

            textButtons.forEach((button) => {
                button.style.pointerEvents = "none";
                button.onmouseenter = undefined;
                button.onmouseleave = undefined;
                animate.fadeOut(button, duration);
            })
            buttons.forEach((button) => {
                button.style.pointerEvents = "none";
                button.onmouseenter = undefined;
                button.onmouseleave = undefined;
                animate.fadeOut(button, duration);
            })

            document.body.style.background = "linear-gradient(0deg, rgb(29 36 55) 0%, rgb(227 230 238) 50%, rgb(69 79 99) 100%, rgb(30, 36, 44) 110%)";

            //cool gradient effect
            const customGradient = {
                gradient: {
                    color1: "rgb(25, 30, 40)",
                    color2: "rgb(150 160 170)",
                    color3: "rgb(25, 30, 40)",
                    color4: "rgb(109, 131, 144)"
                }
            }

            Game.actions.makeGradientPerspective(0, false, customGradient, 40);
            Game.actions.makeGradientPerspective(duration * 4, true, customGradient, 40);

            //prevent dragging images ghetto as heck
            window.ondragstart = function () { return false }

            //Begin mouse tracking
            Mouse.track();
            MouseEffects.create();
            document.addEventListener("contextmenu", function (event) {
                event.preventDefault();
            })

            //Prevent middle click
            document.addEventListener("mousedown", function (event) {
                if (event.button == 1) {
                    event.preventDefault();
                }
            });

            if (localStorage.getItem("startFullScreen") == "1") {
                document.documentElement.requestFullscreen();
            }
            if (localStorage.getItem("lowDetailMode") == "1") {
                Game.lowDetailMode = true;
            }

            const musicDelay = 1500;

            setTimeout(() => {
                titleSongController.play();
            }, musicDelay);

            setTimeout(() => {
                showBranding();

                setTimeout(() => {
                    showDiscordLogo();
                }, duration);

                setTimeout(() => {
                    showDisclaimer();

                    setTimeout(() => {
                        Game.actions.createStars(1000);
                        Game.actions.tweenUp(500, duration);
                        Game.menu(true);
                        LoadingScreen.zIndex = 1000;
                    }, duration * 3);
                }, duration * 2);
            }, duration);
        }

        function hideInitialButtons() {
            animate.fadeOut(welcomeLabel, duration);
            buttons.forEach((button) => {
                button.style.pointerEvents = "none";
                animate.setOpacity(button, 0, duration);
            })
        }

        function showInitialButtons() {
            animate.setOpacity(divider, .15, duration);
            buttons.forEach((button) => {
                button.style.pointerEvents = "auto";
                animate.setOpacity(button, .5, duration);
            })
            textButtons.forEach((button) => {
                button.style.pointerEvents = "none";
                animate.fadeOut(button, duration);
                setTimeout(() => {
                    button.remove();
                }, duration);
            })
        }

        function showBranding() {
            const img = DivHelper.new("40vw", "40vh", "20vw", "20vh", "img", duration);
            img.src = Game.baseImages.youtubeBranding.src;
            img.setAttribute("class", "important");
            img.setAttribute("id", "youtubeBranding");
            img.setAttribute("alt", "developed with YouTube")

            const brandingRipple = DivHelper.new("40vw", "50vh", "20vw", "10vh", "img", duration);
            brandingRipple.src = Game.baseImages.ripple.src;
            brandingRipple.setAttribute("id", "brandingRipple");
            brandingRipple.style.objectFit = "contain";

            img.addEventListener("click", function () {
                window.open("https://www.youtube.com/", "_blank");
            });

            setTimeout(() => {
                animate.fadeOut(brandingRipple, duration);
                anime({
                    targets: img,
                    top: "0vh", //0vh
                    left: "2vw", //90vw
                    width: "10vw",
                    height: "7.5vh",
                    duration: duration,
                    easing: globalEasing,
                    complete: function () {
                        $(brandingRipple).remove();
                    }
                })
            }, duration * 2);
        }

        function showDiscordLogo() {
            const logo = DivHelper.new("0vw", ".75vh", "2vw", "2vh", "img", duration);
            logo.setAttribute("id", "discordLogo");
            logo.setAttribute("class", "important");
            logo.style.objectFit = "contain"
            logo.src = Game.baseImages.clyde.src;

            logo.onclick = function () {
                window.open("https://discord.gg/2qDtjt6xJV", "_blank");
            }
        }

        function showDisclaimer() {
            const div = DivHelper.new("0vw", "50vh", "100vw", "0vh", "div", duration / 2);
            div.setAttribute("id", "disclaimer");
            div.innerText = "This game may potentially trigger seizures for people with photosensitive epilepsy.\n Viewer discretion is advised";

            setTimeout(() => {
                animate.fadeOut(div, duration);
            }, duration * 3);
        }

        // const baseImages = Game.baseImages;

        // const playButton = DivHelper.new("37.5vw", "27vh", "25vw", "50vh", "img");

        // playButton.setAttribute("id", "playButton");
        // playButton.setAttribute("class", "button");

        // playButton.draggable = false;
        // playButton.src = baseImages.playButton.src;
        // playButton.style.opacity = "0";

        // let initialAnimationComplete = false;
        // let clicked = false;

        // anime({
        //     targets: playButton,
        //     easing: globalEasing,
        //     top: "25vh",
        //     opacity: ".6",
        //     duration: duration / 2,
        //     complete: function () {
        //         initialAnimationComplete = true;
        //         if (clicked) {
        //             playButton.onmousedown();
        //         }
        //     }
        // })

        // playButton.onmouseover = function () {
        //     if (initialAnimationComplete === true) {
        //         animate.setOpacity(playButton, 1, duration / 6);
        //         animate.setOpacity(LoadingScreen.elements.canvas, .1, duration / 6);
        //     }
        // }
        // playButton.onmouseleave = function () {
        //     if (initialAnimationComplete === true) {
        //         animate.setOpacity(playButton, .6, duration / 6);
        //         animate.setOpacity(LoadingScreen.elements.canvas, .25, duration / 6);
        //     }
        // }
        // playButton.onmousedown = function () {
        //     if (!initialAnimationComplete) {
        //         clicked = true;
        //         return;
        //     }

        //     if (localStorage.getItem("startFullScreen") == "1") {
        //         document.documentElement.requestFullscreen();
        //     }
        //     if (localStorage.getItem("lowDetailMode") == "1") {
        //         Game.lowDetailMode = true;
        //     }

        //     playButton.onmouseover = undefined;
        //     playButton.onmouseleave = undefined;
        //     playButton.onmousedown = undefined;

        //     //Prevent dragging images (GHETTO)
        //     window.ondragstart = function () { return false }

        //     //Begin mouse tracking
        //     Mouse.track();
        //     MouseEffects.create();
        //     document.addEventListener("contextmenu", function (event) {
        //         event.preventDefault();
        //     })

        //     //Prevent middle click
        //     document.addEventListener("mousedown", function (event) {
        //         if (event.button == 1) {
        //             event.preventDefault();
        //         }
        //     });

        //     const brandingDuration = (duration * 2);
        //     const perspectiveDuration = duration * 2;

        //     $(LoadingScreen.elements.canvas).stop();

        //     // animate.fadeOut(LoadingScreen.elements.canvas, 1000);
        //     animate.fadeOut(playButton, duration / 3);

        //     LoadingScreen.hide(brandingDuration + disclaimerDuration);

        //     setTimeout(() => {
        //         showBranding();
        //         showDiscordLogo();
        //     }, duration / 2);

        //     setTimeout(() => {
        //         showDisclaimer();
        //     }, duration / 2 + brandingDuration);

        //     // document.body.style.background = "linear-gradient(0deg, rgb(29 36 55) 0%, rgb(227 230 238) 50%, rgb(69 79 99) 100%, rgb(30, 36, 44) 110%)";

        //     //cool gradient effect
        //     const customGradient = {
        //         gradient: {
        //             color1: "rgb(25, 30, 40)",
        //             color2: "rgb(150 160 170)",
        //             color3: "rgb(25, 30, 40)",
        //             color4: "rgb(109, 131, 144)"
        //         }
        //     }

        //     Game.actions.makeGradientPerspective(0, false, customGradient, 40);
        //     Game.actions.makeGradientPerspective(brandingDuration + perspectiveDuration, true, customGradient, 40);
        //     setTimeout(() => {
        //         hideDisclaimer();

        //         //Begin audio init
        //         titleSongController.init();

        //         // Game.actions.makeGradientPerspective(perspectiveDuration, true, customGradient, 40);
        //         Game.actions.changeGradient("linear-gradient(0deg, rgb(29 36 55) 0%, rgb(227 230 238) 40%, rgb(69 79 99) 100%, rgb(30, 36, 44) 110%)", perspectiveDuration);
        //     }, brandingDuration + disclaimerDuration);
        //     setTimeout(() => {
        //         hideBranding();
        //     }, brandingDuration - 500);

        //     setTimeout(() => {
        //         playButton.remove();
        //         Game.actions.createStars(1000);
        //         Game.menu(true);
        //         LoadingScreen.zIndex = 1000;
        //     }, duration / 2 + brandingDuration + perspectiveDuration / 2 + disclaimerDuration);



        //     function hideDisclaimer() {
        //         const div = document.querySelector("#disclaimer");
        //         animate.fadeOut(div, duration / 2);


        //         setTimeout(() => {
        //             $(div).remove();
        //         }, duration / 2);
        //     }

        //     function showBranding() {
        //         const img = DivHelper.new("40vw", "40vh", "20vw", "20vh", "img", duration);
        //         img.src = Game.baseImages.youtubeBranding.src;
        //         img.setAttribute("class", "important");
        //         img.setAttribute("id", "youtubeBranding");
        //         img.setAttribute("alt", "developed with YouTube")

        //         const brandingRipple = DivHelper.new("40vw", "50vh", "20vw", "10vh", "img", duration);
        //         brandingRipple.src = Game.baseImages.ripple.src;
        //         brandingRipple.setAttribute("id", "brandingRipple");
        //         brandingRipple.style.objectFit = "contain";

        //         img.addEventListener("click", function () {
        //             window.open("https://www.youtube.com/", "_blank");
        //         });
        //     }



        //     function hideBranding() {
        //         const branding = document.querySelector("#youtubeBranding");
        //         const brandingRipple = document.querySelector("#brandingRipple");
        //         animate.fadeOut(brandingRipple, duration / 3);

        //         anime({
        //             targets: branding,
        //             top: "96.5vh", //0vh
        //             left: "0vw", //90vw
        //             width: "10vw",
        //             height: "7.5vh",
        //             duration: duration,
        //             easing: globalEasing,
        //             complete: function () {
        //                 $(brandingRipple).remove();
        //             }
        //         })
        //     }
        // }
    },
    menu: (fromPre, dontRemakeMoon, dontdrawbuttons) => {
        //Do stuff premenu used to do
        const titleSong = Game.titleSongAudio;
        Game.menuVignetteBaseOpacity = 1;

        if (Game.lowDetailMode) {
            const vignette = document.querySelector("#vignette");
            const grain = document.querySelector("#grain");

            if (vignette && grain) {
                vignette.style.display = "none";
                grain.style.display = "none";
            }
        }
        else {
            const vignette = document.querySelector("#vignette");
            const grain = document.querySelector("#grain");

            if (vignette && grain) {
                vignette.style.display = "inline";
                grain.style.display = "inline";
            }
        }

        setTimeout(() => {
            Game.actions.changeGradient("linear-gradient(0deg, rgb(59 65 75) 0%, rgb(227 230 238) 40%, rgb(109 131 144) 100%)", 1000);

            document.querySelector("#stars").style.opacity = "1";
            const starsBackground = document.querySelector("#starsBackground");
            starsBackground.style.opacity = ".25";

            if (Game.updatingAudioDecorations === false) {
                Game.actions.updateAudioDecorations();
                Game.updatingAudioDecorations = true;
            }

            if (!titleSong.playing) {
                titleSongController.play();
            }

            const songCreditsDuration = 10000;

            Effects.notify("「 Saint Slime 」  Lightness//Peace", songCreditsDuration, Game.titleSongCredits); //OMORI - Sugar Star Planetarium [2014]

            //Update decorations
            const bars = document.querySelector("#mainAudioBar").object;

            bars.canvas.style.opacity = "1";
            bars.middleBased = true;
            bars.canvas.style.top = "47.5vh";
        }, fromPre ? 1000 : 0);

        if (fromPre) {
            const returning = localStorage.getItem("returningUser");

            if (!returning) {
                // Effects.displayMessage("Welcome to SUZUNE!", 2000, 2000);
                localStorage.setItem("returningUser", "1");
            }
            else {
                // Effects.displayMessage("Welcome back!", 2000, 2000);
            }
        }

        if (!dontRemakeMoon) {
            Game.actions.showCelestialObject(fromPre);
        }

        let stopButtonEffect = true;
        const buttonEffectDistance = 2;
        const buttonEffectDuration = 500;

        //Set input
        const maxLanesCount = 24;
        const defaultLanes = [
            "a",
            "as",
            "asd",
            "asdf",
            "asdfg",
            "asdjkl"
        ];
        for (let i = 0; i < defaultLanes.length; ++i) {
            if (!Game.actions.getLanesInputData(i + 1)) {
                Game.actions.setLanesInputData(i + 1, defaultLanes[i], true);
            }
        }
        const randomizer = "abcdefghijklmnopqrstuvwxyz";
        for (let i = 5; i < randomizer.length; ++i) {
            if (!Game.actions.getLanesInputData(i + 1)) {
                Game.actions.setLanesInputData(i + 1, randomizer.substring(0, i + 1), true);
            }
        }

        for (let i = 3; i < maxLanesCount; ++i) {

        }

        // Show grain
        $(document.querySelector("#grain")).animate({
            opacity: .05
        }, {
            duration: 500
        })

        $(document.querySelector("#vignette")).animate({
            opacity: 1
        }, {
            duration: 100
        })

        //Show title
        // const title = new Title(50, 17.5, 2000, 2);
        // const ripple = title.data.ripple.element;
        // const alto = title.data.alto.element;
        // ripple.remove();

        // const extraCredits = DivHelper.new("0vw","0vh","0vw","0vw","div",1000);
        // extraCredits.innerText = "PLAYING : Lightness // Peace \n by 「 Saint Slime 」";
        // extraCredits.setAttribute("class","label");
        // extraCredits.style.fontSize = "1vw";
        // extraCredits.style.whiteSpace = "nowrap";
        // extraCredits.style.pointerEvents = "none";
        // setTimeout(() => {
        //     animate.fadeOut(extraCredits,7000);
        // }, 1000);
        // followmouse();
        // function followmouse() {
        //     requestAnimationFrame(followmouse);

        //     extraCredits.style.transform = `translate(${Mouse.x - screen.width/40}px, ${Mouse.y - screen.width/40}px)`

        // }

        const durationTitle = fromPre ? 2000 : 1000;

        const title = new Title(50, 50, durationTitle, 2);
        const ripple = title.data.ripple.element;
        const alto = title.data.alto.element;
        const titleElement = title.data.title.element;
        const leftQuote = title.data.markLeft.element;
        const rightQuote = title.data.markRight.element;
        const titleElements = [alto, titleElement, leftQuote];

        const rippleDiv = DivHelper.new("0vw", "0vh", "100vw", "10vh", "img", durationTitle);
        rippleDiv.style.transform = "translateY(57vh)";
        rippleDiv.style.pointerEvents = "none";
        rippleDiv.src = Game.baseImages.ripple.src;
        rippleDiv.style.zIndex = "100";

        ripple.remove();
        setTimeout(() => {
            anime({
                targets: titleElements,
                translateY: "-32.5vh",
                duration: durationTitle / 2,
                easing: globalEasing
            })
            anime({
                targets: rightQuote,
                translateY: "32.5vh",
                duration: durationTitle / 2,
                easing: globalEasing
            })
            anime({
                targets: rippleDiv,
                translateY: "70vh",
                duration: durationTitle / 2,
                easing: globalEasing
            })

            setTimeout(() => {
                rippleDiv.remove();
            }, durationTitle / 2);
        }, durationTitle);

        const buttonsDelay = durationTitle + durationTitle / 2;

        // alto.remove();
        // //Funny effect
        // let intensity = 1;
        // let s = 5;
        // titleElement.style.pointerEvents = "all";
        // titleElement.onclick = function () {
        //     Effects.shakeElement(titleElement, 1000, s, intensity);

        //     s *= 1.5;
        //     intensity += 100;

        //     if (intensity === 6) {
        //         titleElement.style.filter = "drop-shadow(0px 0px 2.5vw red)"
        //         Effects.displayMessage("ENOUGH!", 2000, 100);
        //     }
        // }

        //Remove previous
        if (document.querySelector("#menuParticles")) {
            document.querySelector("#menuParticles").remove();
        }
        if (document.querySelector("#fallingStars")) {
            document.querySelector("#fallingStars").remove();
        }

        //Create title particles
        const particles = new Particles("0vw", "0vh", screen.width, screen.height, { r: 255, g: 255, b: 255 }, 2000);
        // const particles = new Particles("37.5vmax", "-5vh", window.innerWidth * .25, window.innerWidth * .25, { r: 255, g: 255, b: 255 }, 2000);
        particles.distanceBasedOpacity = true;
        particles.particleSize = 3;
        particles.maxLen = 0;
        particles.followMouse = false;
        particles.initialSpeed.y = -2;
        // particles.streaksJitter = 20;
        particles.spawnwait = 10;
        particles.canvas.setAttribute("id", "menuParticles");
        particles.canvas.setAttribute("class", "important");
        particles.canvas.style.position = "absolute";
        particles.canvas.style.width = "100vw";
        particles.canvas.style.height = "100vh";
        particles.canvas.style.zIndex = "3";

        //Pulse canvas effect
        particles.canvas.onclick = function (event) {
            const x = event.clientX;
            const y = event.clientY;

            particles.pulse(x, y, 300);
        }

        const fallingStars = new Particles("0vw", "0vh", screen.width, screen.height, { r: 250, g: 250, b: 255 }, 2000);
        fallingStars.canvas.style.width = "100vw";
        fallingStars.canvas.style.height = "60vh";
        fallingStars.canvas.style.zIndex = "3";
        fallingStars.initialSpeed.x = -2;
        fallingStars.canvas.setAttribute("id", "fallingStars");
        fallingStars.canvas.setAttribute("class", "important");
        // fallingStars.distanceBasedOpacity = true;
        fallingStars.initialSpeed.y = 2.5;
        fallingStars.jitterness = .02;
        fallingStars.canvas.zIndex = "0";
        fallingStars.particleSize = 2;
        fallingStars.maxLen = 50;
        fallingStars.streaksJitter = 1;
        fallingStars.isFallingStar = true;
        fallingStars.spawnwait = 25;
        fallingStars.spawnRange = {
            min: 0,
            max: 10
        }
        // fallingStars.followMouse = true;
        // fallingStars.bigG = .001;

        fallingStars.canvas.onclick = function (event) {
            const x = event.clientX;
            const y = event.clientY;

            fallingStars.pulse(x, y, 300);
        }

        setTimeout(() => {
            if (dontdrawbuttons) {
                return;
            }
            //Handle buttons
            let selectedButton = 2;

            const data = [
                {
                    translateX: "40vw",
                    translateY: "40vh",
                    scale: .0,
                    width: "20vw",
                    height: "40vh",
                    opacity: "-.25",
                    perspective: "10vw",
                    rotateY: "90deg"
                },
                {
                    translateX: "5vw",
                    translateY: "30vh",
                    scale: .5,
                    width: "20vw",
                    height: "40vh",
                    opacity: ".25",
                    perspective: "10vw",
                    rotateY: "20deg"
                },
                { //Selected
                    translateX: "40vw",
                    translateY: "25vh",
                    scale: 1,
                    width: "20vw",
                    height: "40vh",
                    opacity: "1",
                    perspective: "10vw",
                    rotateY: "0deg"
                },
                {
                    translateX: "75vw",
                    translateY: "30vh",
                    scale: .5,
                    width: "20vw",
                    height: "40vh",
                    opacity: ".25",
                    perspective: "10vw",
                    rotateY: "-20deg"
                },
                {
                    translateX: "40vw",
                    translateY: "40vh",
                    scale: .0,
                    width: "20vw",
                    height: "40vh",
                    opacity: "-.25",
                    perspective: "10vw",
                    rotateY: "-90deg"
                },
            ]

            const baseSongsButton = DivHelper.new("0vw", "0vw", data[2].width, data[2].height, "img");
            const customSongsButton = DivHelper.new("0vw", "0vw", data[3].width, data[3].height, "img");
            const settingsButton = DivHelper.new("0vw", "0vw", data[1].width, data[1].height, "img");
            const composeButton = DivHelper.new("0vw", "0vw", data[4].width, data[4].height, "img");
            const myAccountButton = DivHelper.new("0vw", "0vw", data[0].width, data[0].height, "img");

            const rippleDiv = DivHelper.new("0vw", "70vh", "100vw", "10vh", "img");
            rippleDiv.style.pointerEvents = "none";

            const buttonLabel = DivHelper.new("0vw", "82.5vh", "100vw", "10vh");
            buttonLabel.textContent = "SONGS";
            buttonLabel.setAttribute("class", "menuText");
            buttonLabel.style.opacity = "0";

            // const topDivider = DivHelper.new("0vw","15vh","100vw","7.5vh","img",1000);
            // topDivider.src = Game.baseImages.difficultyDivider.src;
            // topDivider.style.zIndex = "100";

            const descriptionLabel = DivHelper.new("0vw", "90vh", "100vw", "10vh");
            descriptionLabel.setAttribute("class", "menuText");
            descriptionLabel.style.fontSize = "1.5vmax";
            descriptionLabel.style.opacity = "0";


            baseSongsButton.src = Game.baseImages.songs.src;
            customSongsButton.src = Game.baseImages.customSongs.src;
            settingsButton.src = Game.baseImages.settings.src;
            composeButton.src = Game.baseImages.compose.src;
            myAccountButton.src = Game.baseImages.myAccount.src;

            rippleDiv.src = Game.baseImages.ripple.src;

            rippleDiv.style.zIndex = "100";

            const buttons = [{
                element: myAccountButton,
                text: "MY ACCOUNT",
                description: "View your account statistics.",
                destination: Game.myAccount
            }, {
                element: settingsButton,
                text: "SETTINGS",
                description: "Change properties such as volume, note speed, and graphics detail.",
                destination: Game.settings
            }, {
                element: baseSongsButton,
                text: "SONGS",
                description: "Play beatmaps created by the developer!",
                destination: Game.baseSongsGroups
            }, {
                element: customSongsButton,
                text: "CUSTOM SONGS",
                description: "Play beatmaps created by other players!",
                destination: Game.customSongs
            }, {
                element: composeButton,
                text: "COMPOSE",
                description: "Create beatmaps to share with others!",
                destination: Game.compose
            }];
            setTimeout(() => {
                addEvents()
            }, 1000);
            setAttributes();
            positionButtons();
            updateDisplay(1000);
            // temptAnimation();

            function updateDisplay(duration) {
                //Anime labels and icons
                // animate.setOpacity(rippleDiv, .5, duration / 2);
                anime({
                    targets: buttonLabel,
                    opacity: 0,
                    translateY: "2.5vh",
                    easing: globalEasing,
                    duration: duration / 2
                })
                anime({
                    targets: descriptionLabel,
                    opacity: 0,
                    translateY: "5vh",
                    easing: globalEasing,
                    duration: duration / 2
                })
                setTimeout(() => {
                    // animate.setOpacity(rippleDiv, 1, duration / 2);
                    anime({
                        targets: buttonLabel,
                        opacity: 1,
                        translateY: "0vh",
                        easing: globalEasing,
                        duration: duration / 2
                    })
                    anime({
                        targets: descriptionLabel,
                        opacity: .5,
                        translateY: "0vh",
                        easing: globalEasing,
                        duration: duration / 2
                    })
                    buttonLabel.textContent = buttons[selectedButton].text;
                    descriptionLabel.textContent = buttons[selectedButton].description;
                }, duration / 2);

                for (let i = 0; i < buttons.length; ++i) {
                    const button = buttons[i].element;
                    const buttonIndex = clamp(i - selectedButton + 2, 0, 4);
                    const buttonData = data[buttonIndex];

                    anime.remove(button);

                    anime({
                        targets: button,
                        translateX: buttonData.translateX,
                        translateY: buttonData.translateY,
                        rotateY: buttonData.rotateY,
                        scale: buttonData.scale,
                        opacity: buttonData.opacity,
                        rotateZ: "0deg",
                        duration: duration,
                        easing: globalEasing,
                        complete: () => {
                            button.moving = false;
                        }
                    })

                    button.moving = true
                }
            }

            function particleEffect(deltaSelectedIndex) {
                anime({
                    x: 1,
                    // round : 1,
                    update: function () {
                        if (deltaSelectedIndex > 0) {
                            particles.applyOffset(-4, 0);
                            // fallingStars.applyOffset(-1, 0);
                        }
                        else {
                            particles.applyOffset(4, 0);
                            // fallingStars.applyOffset(1, 0);
                        }
                    },
                    easing: "linear"
                })
            }

            function addEvents() {
                for (let i = 0; i < buttons.length; ++i) {
                    const button = buttons[i].element;

                    button.onclick = onclick;
                    button.onmouseenter = onmouseenter;
                    button.onmouseleave = onmouseleave;
                }
            }

            // function temptAnimation() {
            //     const duration = 1000;
            //     temptAnimationInterval = setInterval(() => {
            //         if (buttons[selectedButton].element.moving || buttons[selectedButton].element.mouseover) {
            //             return;
            //         }

            //         const button = buttons[selectedButton];
            //         const element = button.element;

            //         anime({
            //             targets: element,
            //             translateY: String(parseInt(data[2].translateY) + 2) + "vh",
            //             easing: globalEasing,
            //             duration: duration / 2,
            //             complete: () => {
            //                 if (buttons[selectedButton].element.moving || buttons[selectedButton].element.mouseover) {
            //                     return;
            //                 }
            //                 anime({
            //                     targets: element,
            //                     translateY: String(parseInt(data[2].translateY)) + "vh",
            //                     easing: globalEasing,
            //                     duration: duration / 2
            //                 })
            //             }
            //         })
            //     }, duration);
            // }

            // function temptAnimation() {
            //     temptAnimationInterval = setInterval(() => {
            //         for (let i = 0;i < buttons.length;++i) {
            //             if (Math.abs(selectedButton - i) < 2) {
            //                 const button = buttons[i];
            //                 const element = button.element;
            //                 const delay = Math.max(selectedButton - i + 1,0) * 250;
            //                 setTimeout(() => {
            //                     anime({
            //                         targets : element,
            //                         translateY : String(parseInt(data[i].translateY) - 3) + "vh",
            //                         easing : globalEasing,
            //                         duration : 500,
            //                         direction : "alternate"
            //                     })
            //                 }, delay);
            //             }
            //         }
            //     }, 5000)
            // }

            function onmouseenter(event) {
                const button = event.target;

                if (button.moving) {
                    return;
                }
                button.mouseover = true;
                const buttonIndex = clamp(button.buttonIndex - selectedButton + 2, 0, 4);

                anime({
                    targets: button,
                    duration: 500,
                    easing: globalEasing,
                    // rotateZ: "10deg",
                    translateY: String(parseInt(data[buttonIndex].translateY) - 2) + "vh"
                })

                if (buttonIndex == 2) {
                    animate.setOpacity(rippleDiv, .25, 500);

                    anime({
                        targets: buttonLabel,
                        opacity: .5,
                        translateY: "1vh",
                        easing: globalEasing,
                        duration: 500
                    })
                    anime({
                        targets: descriptionLabel,
                        opacity: .25,
                        translateY: "2vh",
                        easing: globalEasing,
                        duration: 500
                    })
                }
            }

            function onmouseleave(event) {
                const button = event.target;
                button.mouseover = false;
                if (button.moving) {
                    return;
                }

                const buttonIndex = clamp(button.buttonIndex - selectedButton + 2, 0, 4);

                anime({
                    targets: button,
                    duration: 500,
                    easing: globalEasing,
                    // rotateZ: "0deg",
                    translateY: data[buttonIndex].translateY
                })

                anime({
                    targets: buttonLabel,
                    opacity: 1,
                    translateY: "0vh",
                    easing: globalEasing,
                    duration: 500
                })
                anime({
                    targets: descriptionLabel,
                    opacity: .5,
                    translateY: "0vh",
                    easing: globalEasing,
                    duration: 500
                })

                animate.setOpacity(rippleDiv, 1, 500);
            }

            function onclick(event) {
                const button = event.target;
                const buttonIndex = button.buttonIndex;

                if (buttonIndex == selectedButton) {
                    if (button == myAccountButton) {
                        buttons[buttonIndex].destination();
                        return;
                    }
                    for (let i = 0; i < buttons.length; ++i) {
                        const button = buttons[i];
                        button.element.onclick = undefined;
                    }
                    //Go to destination and "tween up"
                    Game.actions.tweenUp(1000, [buttonLabel, descriptionLabel, rippleDiv]);
                    buttons[buttonIndex].destination();
                    buttons[buttonIndex].element.onmouseenter = undefined;
                    buttons[buttonIndex].element.onmouseleave = undefined;

                    anime({
                        targets: buttonLabel,
                        opacity: 0,
                        translateY: "10vh",
                        easing: globalEasing,
                        duration: 1000
                    })
                    anime({
                        targets: descriptionLabel,
                        opacity: 0,
                        translateY: "20vh",
                        easing: globalEasing,
                        duration: 1000
                    })
                    animate.setOpacity(rippleDiv, 0, 1000);
                    return;
                }
                particleEffect(buttonIndex - selectedButton);
                selectedButton = buttonIndex;

                updateDisplay(1000);
            }

            function setAttributes() {
                for (let i = 0; i < buttons.length; ++i) {
                    const button = buttons[i].element;

                    button.setAttribute("class", "menuButton");
                    button.buttonIndex = i;
                }
            }

            function positionButtons() {
                for (let i = 0; i < buttons.length; ++i) {
                    const button = buttons[i].element;
                    const buttonIndex = clamp(i - selectedButton + 2, 0, 4);
                    const buttonData = data[buttonIndex];

                    button.style.transform = `translateX(${buttonData.translateX}) translateY(${buttonData.translateY}) scale(${buttonData.scale}) perspective(${buttonData.perspective})`;
                    button.style.opacity = "0";
                }
            }
        }, buttonsDelay);
    },
    settings: () => {
        setTimeout(() => {
            const duration = 1000;

            const particles = document.querySelector("#menuParticles");
            particles.width = screen.width;
            particles.height = screen.height;
            particles.style.left = "0px";

            const musicVolumeLabel = DivHelper.new("1vw", "70vh", "50vw", "10vh");
            musicVolumeLabel.textContent = "MUSIC VOLUME";
            musicVolumeLabel.setAttribute("class", "settingsLabels");
            musicVolumeLabel.style.opacity = "0";
            musicVolumeLabel.style.textAlign = "left";

            const musicVolumeBar = new ValueBar("0vw", "75vh", "50vw", "2vh", localStorage.getItem("musicVolume") || 1, "rgba(255,255,255,.75)", true, false, true);
            musicVolumeBar.element.setAttribute("class", "settingsBars");
            musicVolumeBar.element.style.zIndex = "11";

            const scrollingSpeedLabel = DivHelper.new("1vw", "85vh", "50vw", "10vh");
            scrollingSpeedLabel.textContent = "NOTES SPEED";
            scrollingSpeedLabel.setAttribute("class", "settingsLabels");
            scrollingSpeedLabel.style.opacity = "0";
            scrollingSpeedLabel.style.textAlign = "left";

            const scrollingSpeedBar = new ValueBar("0vw", "90vh", "50vw", "2vh", localStorage.getItem("scrollingSpeed") || 1, "rgba(255,255,255,.75)", true, false, true);
            scrollingSpeedBar.element.setAttribute("class", "settingsBars");
            scrollingSpeedBar.element.style.zIndex = "11";

            const backgroundFade = DivHelper.new("0vw", "0vh", "100vw", "100vh");
            backgroundFade.style.opacity = "0";
            backgroundFade.style.background = "rgb(0,0,0)";

            //Checkboxes

            const lowDetailModeBox = DivHelper.new("1vw", "60vh", "2vw", "2vw", "input", duration);
            lowDetailModeBox.setAttribute("class", "settingsBox");
            lowDetailModeBox.type = "checkbox";
            lowDetailModeBox.checked = localStorage.getItem("lowDetailMode") == "1" ? true : false;

            const lowDetailLabel = DivHelper.new("5vw", "60.5vh", "15vw", "2vw", "div", duration);
            lowDetailLabel.setAttribute("class", "settingsLabels");
            lowDetailLabel.textContent = "LOW DETAIL MODE";

            const startFullScreenBox = DivHelper.new("25vw", "60vh", "2vw", "2vw", "input", duration);
            startFullScreenBox.setAttribute("class", "settingsBox");
            startFullScreenBox.type = "checkbox";
            startFullScreenBox.checked = localStorage.getItem("startFullScreen") == "1" ? true : false;

            const startFullScreenLabel = DivHelper.new("29vw", "60.5vh", "20vw", "2vw", "div", duration);
            startFullScreenLabel.setAttribute("class", "settingsLabels");
            startFullScreenLabel.textContent = "START IN FULLSCREEN";

            //Textboxes
            const laneSpaceLabel = DivHelper.new("5vw", "45.5vh", "20vw", "2vw", "div", duration);
            laneSpaceLabel.setAttribute("class", "settingsLabels");
            laneSpaceLabel.textContent = "LANE SPACE";

            const laneSpaceNumberBox = DivHelper.new("1vw", "45vh", "3vw", "2vw", "input", duration);
            laneSpaceNumberBox.setAttribute("class", "settingsNumberBox");
            laneSpaceNumberBox.type = "number"
            laneSpaceNumberBox.min = -20;
            laneSpaceNumberBox.max = 20;
            laneSpaceNumberBox.step = .5;
            laneSpaceNumberBox.value = localStorage.getItem("laneSpace") || 0;

            const timeOffsetLabel = DivHelper.new("29vw", "45.5vh", "20vw", "2vw", "div", duration);
            timeOffsetLabel.setAttribute("class", "settingsLabels");
            timeOffsetLabel.textContent = "MUSIC OFFSET";

            const timeOffsetNumberBox = DivHelper.new("25vw", "45vh", "3vw", "2vw", "input", duration);
            timeOffsetNumberBox.setAttribute("class", "settingsNumberBox");
            timeOffsetNumberBox.type = "number"
            timeOffsetNumberBox.min = -10;
            timeOffsetNumberBox.max = 10;
            timeOffsetNumberBox.step = .05;
            timeOffsetNumberBox.value = localStorage.getItem("timeOffset") || 0;

            //Input settings
            const inputLabel = DivHelper.new("50vw", "65vh", "50vw", "5vh", "div", duration);
            inputLabel.setAttribute("class", "settingsLabels");
            inputLabel.setAttribute("id", "inputLabel");
            inputLabel.textContent = "EDIT INPUT"

            const laneCountLabel = DivHelper.new("60vw", "75vh", "50vw", "5vh", "div", duration);
            laneCountLabel.setAttribute("class", "settingsLabels");
            laneCountLabel.textContent = "LANE COUNT :"
            laneCountLabel.style.textAlign = "left";

            const laneCountNumber = DivHelper.new("73.5vw", "74vh", "3vw", "3vw", "input", duration);
            laneCountNumber.setAttribute("class", "settingsNumberBox");
            laneCountNumber.type = "number";
            laneCountNumber.min = 3;
            laneCountNumber.max = 26;
            laneCountNumber.value = 6;

            const laneInputLabel = DivHelper.new("60vw", "86vh", "50vw", "5vh", "div", duration);
            laneInputLabel.setAttribute("class", "settingsLabels");
            laneInputLabel.textContent = "LANE INPUT :"
            laneInputLabel.style.textAlign = "left";

            const laneCountTextBox = DivHelper.new("73.5vw", "85vh", "15vw", "3vw", "input", duration);
            laneCountTextBox.setAttribute("class", "settingsTextBox");
            laneCountTextBox.value = "ENTER HERE"

            const laneCountSubmit = DivHelper.new("78.5vw", "75vh", "5vw", "5vh", "input", duration);
            laneCountSubmit.type = "button";
            laneCountSubmit.setAttribute("class", "settingsNumberBox");
            laneCountSubmit.value = "SUBMIT";

            laneCountSubmit.onclick = function () {
                Game.actions.setLanesInputData(laneCountNumber.value, laneCountTextBox.value)
            }

            const discordLogo = DivHelper.new("35vw", "10vh", "10vw", "10vw", "img", duration);
            discordLogo.src = Game.baseImages.clyde.src;
            discordLogo.style.zIndex = 100;

            discordLogo.onclick = function () {
                window.open("https://discord.gg/2qDtjt6xJV", "_blank");
            }

            const emailLogo = DivHelper.new("60vw", "10vh", "10vw", "10vw", "img", duration);
            emailLogo.src = Game.baseImages.mail.src;
            emailLogo.style.zIndex = 100;

            emailLogo.onclick = function () {
                window.open("mailto:suzunebeats@gmail.com", "_blank");
            }

            animate.setOpacity(backgroundFade, .5, duration);
            animate.fadeIn(musicVolumeLabel, duration);
            animate.fadeIn(scrollingSpeedLabel, duration);

            //Backbutton
            const backButton = Game.actions.getBackButton("0vw", "5vh")
            backButton.style.opacity = "0";

            animate.setOpacity(backButton, .5, duration);

            backButton.onmouseover = function () {
                $(backButton).stop();
                animate.fadeIn(backButton, duration / 4);
            }
            backButton.onmouseleave = function () {
                $(backButton).stop();
                animate.setOpacity(backButton, .5, duration / 4);
            }
            backButton.onmousedown = function () {
                $(backButton).stop();

                backButton.onmousedown = undefined;
                backButton.onmouseleave = undefined;
                backButton.onmouseover = undefined;

                // animate.fadeOut(discordLabel, duration);
                // animate.fadeOut(thankYouLabel, duration);
                // animate.fadeOut(discordLink, duration);

                // animate.fadeOut(musicVolumeLabel, duration);
                // animate.fadeOut(scrollingSpeedLabel, duration);
                // animate.fadeOut(backButton, duration);
                // animate.fadeOut(musicVolumeBar.element, duration);
                // animate.fadeOut(scrollingSpeedBar.element, duration);

                LoadingScreen.show(duration);

                //Save data
                localStorage.setItem("scrollingSpeed", scrollingSpeedBar.value);
                localStorage.setItem("musicVolume", musicVolumeBar.value);
                localStorage.setItem("laneSpace", clamp(laneSpaceNumberBox.value, laneSpaceNumberBox.min, laneSpaceNumberBox.max));
                localStorage.setItem("timeOffset", timeOffsetNumberBox.value);
                localStorage.setItem("lowDetailMode", lowDetailModeBox.checked ? "1" : "0");
                localStorage.setItem("startFullScreen", startFullScreenBox.checked ? "1" : "0");

                Game.lowDetailMode = lowDetailModeBox.checked;

                //Apply music volume to title song
                Game.titleSongAudio.volume = localStorage.getItem("musicVolume");

                setTimeout(() => {
                    Game.actions.cleanUp();
                    Game.menu();
                    LoadingScreen.hide(duration / 2);
                }, duration);
            }
        }, 0);
    },
    myAccount: () => {
        const userId = localStorage.getItem("userId");

        if (!userId) {
            Effects.displayMessage("Please log in or create an account!", 4000, 1000);
            setTimeout(() => {
                Game.menu();
            }, 4000);
            return;
        }

        Game.actions.showAccount();
    },
    //Params for online
    play: (data, icon, songIndex, songID, destination) => {
        //set settings
        Game.timeOffset = parseFloat(localStorage.getItem("timeOffset")) || 0;
        const particles = document.querySelector("#menuParticles");
        const duration = 3000;

        const customGradient = data ? { gradient: data.gradient } : false;
        if (data) {
            if (!data.stars) {
                animate.fadeOut(document.querySelector("#stars"));
                animate.fadeOut(document.querySelector("#starsBackground"));
            }
        }

        Game.actions.makeGradientPerspective(duration, false, customGradient);
        animate.fadeIn(document.querySelector("#vignette"), duration);

        animate.setOpacity(document.querySelector("#grain"), .05, duration);
        animate.fadeIn(document.querySelector("#vignette"), duration);
        animate.fadeOut(particles, duration);
        // animate.fadeOut(document.querySelector("#starsBackground"));

        //Fade out mainAudioBar and titleMusic
        Game.actions.stopTitleSong();
        // const mainAudioBar = document.querySelector("#mainAudioBar");
        // const titleSongLightEffect = document.querySelector("#titleSongLightEffect");
        // animate.fadeOut(titleSongLightEffect, 500);
        // animate.fadeOut(mainAudioBar, 500);
        // titleSongController.fadeOut();
        // Game.stopVignette = true;

        const selectedSong = Game.selectedSong;
        const songData = data || Game.baseSongData[selectedSong];
        const songIcon = icon || Game.baseSongImages[selectedSong];
        const songURL = songData.songURL;

        Game.currentSongData = songData;

        let gameAudio;

        let preload = false;

        const playerDiv = DivHelper.new();
        playerDiv.setAttribute("id", "player")
        playerDiv.style.opacity = "0";

        const missSound = new Sound("synth_drum", { only: "C3" });
        const hitSound = songData.instrument ? new Sound(songData.instrument, { soundfont: "FluidR3_GM" }) : undefined;

        const player = new YT.Player('player', {
            // height: getHeightAndWidth(true),
            // width: getHeightAndWidth(false),
            videoId: songURL,
            playerVars: {
                'playsinline': 1,
                origin: window.location.href
            },
            modestbranding: 1,
            autoplay: 1,
            events: {
                'onReady': (event) => {
                    Game.gameAudio = player;
                    gameAudio = player;
                    gameAudio.playVideo();
                    gameAudio.setVolume(0);

                    const iFrame = player.getIframe();

                    const width = Math.max(screen.width / 6, 200);
                    const height = Math.max(width * .56, 200);

                    iFrame.width = width;
                    iFrame.height = height;

                    iFrame.style.opacity = "0";
                    iFrame.style.zIndex = "1000";

                    if (songData.videoOnTop) {
                        iFrame.style.left = String(screen.width / 2 - width / 2) + "px";
                        iFrame.style.top = "1vh";
                    }
                    else {
                        iFrame.style.right = "0vw";
                        iFrame.style.bottom = "10vh";
                    }
                    // iFrame.style.filter = "drop-shadow(0px 0px 5vw " + songData.gradient.color2 + ")";
                    iFrame.style.filter = "drop-shadow(0px 0px 5vw " + "black" + ")";

                    animate.setOpacity(iFrame, 1, duration * 2);
                },
                'onError': (event) => {
                    const errorVals = {
                        2: "Invalid URL.",
                        5: "This video is not allowed to be played.",
                        100: "Video is possibly private or removed.",
                        101: "This video is not allowed to be played.",
                        150: "This video is not allowed to be played."
                    }
                    if (event.data == 150) {
                        Effects.displayMessage("Do not play other YouTube videos while playing.", 5000, 1000);
                    }
                    else {
                        Effects.displayMessage(errorVals[event.data], 5000, 1000);
                    }
                    setTimeout(() => {
                        Game.gameCanvas.canvas.remove();
                        Game.actions.playTitleSong(1, true);
                        Game.gameCanvas = undefined;
                        Game.gameAudio.destroy();
                        Game.actions.cleanUp();
                        Game.menu();
                    }, 4000);

                    Game.gameAudio.destroy();
                },
                'onStateChange': (event) => {
                    const stateDestination = {
                        "-1": () => {

                        },
                        0: () => {
                            Game.gameCanvas.playing = false;

                            //Remove events
                            document.onkeydown = undefined;
                            document.onkeyup = undefined;

                            //Remove backbutton/pause menu
                            hidePauseMenu();
                            removeBackButton();

                            // animate.fadeOut(player.getIframe(),duration);

                            setTimeout(handleEnd, 1000);
                        },
                        1: () => {
                            if (preload === false) {
                                player.unMute();
                                begin();
                                preload = true;
                                gameAudio.pauseVideo();
                                gameAudio.seekTo(0, true);
                            }
                        },
                        2: () => {

                        },
                        3: () => {

                        },
                        4: () => {

                        },
                        5: () => {

                        },
                    }
                    stateDestination[event.data]();
                }
            }
        });

        //Pre-create this for the update function
        let lightEffect;
        let lightOpacity = 0;
        const lightOpacityFactor = 3;//.1
        const lightOpacityFade = .03;//.01
        let playParticles;
        let timeBar;
        let scoreBar;
        let comboText;
        // let scoreText;
        let comboDeco;
        let backButton;
        const shade = document.querySelector("#vignette");

        let comboOpacity = 0;
        const comboThreshold = 5;

        const maxScore = Game.actions.getMaxScore(songData);

        let comboScore = 0;
        let maxComboScore = 0;
        let score = [];
        let totalScore = 0;

        const keyData = [];

        const scoringDirectory = [
            1000, //F
            .12, //D
            .1, //C
            .08, //B
            .06 //A
        ];


        //Delay
        function begin() {
            setTimeout(() => {
                //Cleanup
                Game.actions.cleanUp();
                document.getElementById("mainAudioBar").style.top = "37.5vh";

                //Remove old gameCanvas if present
                // if (Game.gameCanvas) {
                //     Game.gameCanvas.delete();
                // }

                const lineColor = songData.laneGradient.color2;

                //Create new gameCanvas
                const laneKeyData = Game.actions.getLanesInputData(songData.inputCount);
                const gameCanvas = new GameCanvas(laneKeyData.toUpperCase(), "0vw", "-5vh", lineColor, 1, 1, 1000, true);
                if (Game.lowDetailMode) {
                    gameCanvas.setScale(1);
                }
                gameCanvas.playing = false;
                Game.gameCanvas = gameCanvas;

                //Transition
                const transitionTimePosition = -3;
                gameCanvas.timePosition = transitionTimePosition;

                //Set notes
                gameCanvas.notes = songData.notesData;

                for (let i = 0; i < gameCanvas.notes.length; ++i) {
                    const note = gameCanvas.notes[i];
                    note.tagged = undefined;
                    note.holding = undefined;
                    note.widthTween = undefined;
                    delete note.tagged;
                    delete note.holding;
                    delete note.widthTween;
                }

                //Show title label and decorative icon
                if (data) {
                    showCustomAudioLabels();
                }
                else {
                    showAudioLabels();
                }


                //Create particles
                let playParticlesColor = parseColor(songData.gradient.color2) || "rgb(255,255,255)"; //parseColor(songData.textColor.title) || 
                playParticlesColor = {
                    r: playParticlesColor[0],
                    g: playParticlesColor[1],
                    b: playParticlesColor[2]
                }
                playParticles = new Particles("0px", "-5vh", screen.width, screen.height, playParticlesColor, 1000);

                playParticles.distanceBasedOpacity = false;

                playParticles.particleSize = 4;
                playParticles.maxLen = 0;
                playParticles.streaksJitter = .5; //.02
                playParticles.jitterness = .02;
                playParticles.spawnwait = 10;
                playParticles.initialSpeed.y = 3;
                // playParticles.offset.y = -100;

                playParticles.canvas.style.zIndex = "5";
                playParticles.canvas.style.pointerEvents = "none";
                playParticles.canvas.style.transform = String("perspective(" + screen.height / 2 + "px)" + "rotateX(55deg)");
                playParticles.canvas.style.width = "100vw";
                playParticles.canvas.style.height = "100vh";
                playParticles.canvas.setAttribute("id", "playParticles");

                //Create light effect
                lightEffect = DivHelper.new("0px", "0px", "100vw", "100vh");
                lightEffect.setAttribute("id", "lightEffect");
                lightEffect.style.background = "radial-gradient(circle, rgba(255, 255, 255, 0) 0%," + lineColor + " 65%,  " + lineColor + "70%," + lineColor + "100%)";
                lightEffect.style.opacity = "0";
                lightEffect.style.display = "none";

                //Create Timebar
                timeBar = DivHelper.new("0px", "0px", "0px", ".5vh");
                timeBar.setAttribute("id", "timeBar");

                //Create scoreBar
                scoreBar = DivHelper.new("0px", "0px", "0px", ".5vh");
                scoreBar.setAttribute("id", "scoreBar");

                //Create comboText
                comboText = DivHelper.new("47.5vw", "40vh", "5vw", "");
                comboText.style.fontSize = "2vw";
                comboText.setAttribute("id", "comboText");
                comboText.textContent = "126";
                comboText.style.opacity = "0";

                //Create comboDeco
                comboDeco = DivHelper.new("45vw", "27.5vh", "10vw", "", "img");
                comboDeco.draggable = false;
                comboDeco.setAttribute("id", "comboDeco")
                comboDeco.src = Game.baseImages.comboDeco.src;
                comboDeco.style.opacity = "0";

                //Create back button
                backButton = Game.actions.getBackButton("90vw", "5vh")
                backButton.style.opacity = "0";
                setTimeout(() => {
                    animate.setOpacity(backButton, .5, duration);
                }, 5000);

                //Update light effect every frame
                updateLightEffect();

                //Update the time bar and progress every frame
                updateBars();

                //Get input
                getUserInput();

                //Update combo elements
                updateScore();

                //Handle back button
                backButton.onmouseover = function () {
                    $(backButton).stop();
                    animate.setOpacity(backButton, 1, duration / 4);
                }
                backButton.onmouseleave = function () {
                    $(backButton).stop();
                    animate.setOpacity(backButton, .5, duration / 4);
                }
                backButton.onmousedown = function () {
                    if (Game.gameCanvas.playing === true) {
                        showPauseMenu();
                        return;
                    }
                    Effects.displayMessage("Please wait.", 500, 500)
                    Effects.shakeElement(backButton, 250, 2, 10);
                    // hidePauseMenu();
                    // setTimeout(() => {
                    //     Game.gameCanvas.playing = true;
                    // }, duration / 2);
                }
            }, duration / 2);
        }

        function handleEnd(fromPause) {
            const gameAudio = Game.gameAudio;
            const gameCanvas = Game.gameCanvas;

            const duration = 1000;

            lightEffect.remove();
            lightEffect = false;
            animate.fadeOut(gameCanvas.canvas, duration);
            animate.fadeOut(timeBar, duration);
            animate.fadeOut(scoreBar, duration);
            animate.fadeOut(comboText, duration);
            animate.fadeOut(comboDeco, duration);

            if (fromPause) {
                LoadingScreen.show(duration);
                setTimeout(() => {
                    Game.actions.playTitleSong(.25, true);
                    comboText.remove();
                    comboDeco.remove();
                    gameCanvas.canvas.remove();
                    gameCanvas.canvas = undefined;
                    gameCanvas.notes = undefined;

                    Game.gameAudio.destroy();

                    Game.actions.cleanUp();

                    setTimeout(() => {
                        LoadingScreen.hide(duration);
                    }, duration);

                    setTimeout(() => {
                        LoadingScreen.show(1000);

                        setTimeout(() => {
                            Game.actions.cleanUp();

                            destination();

                            LoadingScreen.hide(1000);
                        }, 1000);
                    }, duration);
                }, duration);
                return;
            }

            LoadingScreen.show(duration);

            setTimeout(() => {
                createMetrics();

                comboText.remove();
                comboDeco.remove();
                gameCanvas.canvas.remove();
                gameCanvas.canvas = undefined;
                gameCanvas.notes = undefined;

                Game.gameAudio.destroy();
            }, duration);
        }

        function showCustomMetrics() {
            const titleDiv = document.querySelector("#gameTitleLabel");
            const artistDiv = document.querySelector("#gameArtistLabel");

            animate.fadeOut(titleDiv, duration / 4);
            animate.fadeOut(artistDiv, duration / 4);

            setTimeout(() => {
                titleDiv.style.textAlign = "center";
                artistDiv.style.textAlign = "center";

                titleDiv.style.left = "0vw";
                artistDiv.style.left = "0vw";
                titleDiv.style.width = "100vw";
                artistDiv.style.width = "100vw";

                animate.fadeIn(titleDiv, duration / 4);
                animate.fadeIn(artistDiv, duration / 4);

                const originalScore = data.gpa || 0;
                const originalCombo = data.combo || 0;

                const scoreValue = score / maxScore;
                const comboValue = maxComboScore / maxScore;

                const color = "rgb(255,255,255)";

                const scoreBar = new ValueBar("12.5vw", "50vh", "75vw", "2vh", scoreValue, color, true);
                const comboBar = new ValueBar("12.5vw", "65vh", "75vw", "2vh", comboValue, color, true);

                const scoreIcon = DivHelper.new("12.5vw", "45vh", "75vw", "3vh");
                scoreIcon.setAttribute("class", "performanceIcons");
                scoreIcon.textContent = String("SCORE : " + score + " (" + Math.floor(scoreValue * 100) + "%)");
                scoreIcon.style.color = color;
                scoreIcon.style.opacity = "0";
                animate.fadeIn(scoreIcon, duration);

                const comboIcon = DivHelper.new("12.5vw", "60vh", "75vw", "3vh");
                comboIcon.setAttribute("class", "performanceIcons");
                comboIcon.textContent = String("MAX COMBO : " + maxComboScore);
                comboIcon.style.color = color;
                comboIcon.style.opacity = "0";
                animate.fadeIn(comboIcon, duration);

                let highScoreInterval = undefined;
                let highScore = false;

                if (originalScore < score || originalCombo < maxComboScore) {
                    let scoreType;
                    highScore = true;
                    if (originalScore < score && originalCombo < maxComboScore) {
                        scoreType = "NEW HIGH COMBO AND SCORE!";
                    }
                    else if (originalScore < score) {
                        scoreType = "NEW HIGH SCORE!";
                    }
                    else {
                        scoreType = "NEW MAX COMBO!";
                    }

                    setTimeout(() => {
                        handleHighScore(scoreType);
                    }, duration);
                }

                data.score = score;
                data.combo = maxComboScore;

                let waitTime = highScore == false ? 2 : 6;

                setTimeout(() => {
                    if (highScoreInterval) {
                        clearInterval(highScoreInterval);
                    }
                    LoadingScreen.show(1000);

                    setTimeout(() => {
                        Game.actions.cleanUp();
                        Game.menu();
                        Game.actions.playTitleSong(1, true);
                        Game.actions.cleanUp();
                        Game.compose();
                        LoadingScreen.hide(1000);
                    }, 1000);
                }, duration * waitTime);

                function handleHighScore(text) {
                    //Save
                    Game.actions.saveSongData(data, songIndex);

                    Effects.displayMessage(text, 5000, 1000);
                    Effects.notify(data.artist + " would be proud!", 5000);

                    playParticles.maxLen = 50;
                    playParticles.streaksJitter = 2;

                    highScoreInterval = setInterval(() => {
                        const size = getRandomNumber(50, 250);
                        const x = getRandomNumber(0, window.innerWidth);
                        const y = getRandomNumber(0, window.innerHeight / 3);
                        const d = getRandomNumber(1000, 2000);
                        Effects.pulse(size, x, y, d);
                    }, 100);
                }
            }, duration / 2);
        }

        function showPauseMenu() {
            Game.actions.showSettings();
            const resumeButton = DivHelper.new("40vw", "25vh", "20vw", "");
            resumeButton.setAttribute("id", "resumeButton");
            resumeButton.setAttribute("class", "pauseButtons");
            resumeButton.textContent = "RESUME";
            resumeButton.style.opacity = "0";

            const retryButton = DivHelper.new("40vw", "40vh", "20vw", "");
            retryButton.setAttribute("id", "retryButton");
            retryButton.setAttribute("class", "pauseButtons");
            retryButton.textContent = "REPLAY";
            retryButton.style.opacity = "0";

            const exitButton = DivHelper.new("45vw", "55vh", "10vw", "");
            exitButton.setAttribute("id", "exitButton");
            exitButton.setAttribute("class", "pauseButtons");
            exitButton.textContent = "EXIT";
            exitButton.style.opacity = "0";

            const backgroundPause = DivHelper.new("0vw", "0vh", "100vw", "100vh", "div", 1000);
            backgroundPause.setAttribute("id", "backgroundPause");

            //Pause game
            Game.gameCanvas.playing = false;

            animate.setOpacity(resumeButton, .5, duration / 4);
            animate.setOpacity(retryButton, .5, duration / 4);
            animate.setOpacity(exitButton, .5, duration / 4);

            resumeButton.onmouseover = function () {
                animate.setOpacity(resumeButton, 1, duration / 6);
            }
            resumeButton.onmouseleave = function () {
                animate.setOpacity(resumeButton, .5, duration / 6);
            }
            retryButton.onmouseover = function () {
                animate.setOpacity(retryButton, 1, duration / 6);
            }
            retryButton.onmouseleave = function () {
                animate.setOpacity(retryButton, .5, duration / 6);
            }
            exitButton.onmouseover = function () {
                animate.setOpacity(exitButton, 1, duration / 6);
            }
            exitButton.onmouseleave = function () {
                animate.setOpacity(exitButton, .5, duration / 6);
            }

            resumeButton.onmousedown = function () {
                Game.actions.hideSettings(duration, true);
                resumeButton.onmouseover = undefined;
                resumeButton.onmouseleave = undefined;
                exitButton.onmouseover = undefined;
                exitButton.onmouseleave = undefined;
                retryButton.onmouseover = undefined;
                retryButton.onmouseleave = undefined;

                removeBackground();

                //Fade out then play 
                animate.fadeOut(resumeButton, duration);
                animate.fadeOut(exitButton, duration);
                animate.fadeOut(retryButton, duration);
                setTimeout(() => {
                    resumeButton.remove();
                    exitButton.remove();
                    retryButton.remove();
                    Game.gameCanvas.playing = true;
                }, duration);
            }

            retryButton.onmousedown = function () {
                LoadingScreen.show(1000);

                setTimeout(() => {
                    const gameCanvas = Game.gameCanvas;

                    const duration = 1000;

                    lightEffect.remove();
                    lightEffect = false;
                    animate.fadeOut(gameCanvas.canvas, duration);
                    animate.fadeOut(timeBar, duration);
                    animate.fadeOut(scoreBar, duration);
                    animate.fadeOut(comboText, duration);
                    animate.fadeOut(comboDeco, duration);

                    comboText.remove();
                    comboDeco.remove();
                    gameCanvas.canvas.remove();
                    gameCanvas.canvas = undefined;
                    gameCanvas.notes = undefined;

                    Game.gameAudio.destroy();

                    Game.actions.cleanUp();

                    Game.play(data, icon, songIndex, songID, destination);

                    LoadingScreen.hide(1000);
                }, 1000);
            }

            exitButton.onmousedown = function () {
                hidePauseMenu();

                removeBackButton();

                score = [];
                maxComboScore = 0
                comboScore = 0;

                //Clean up
                Game.gameCanvas.playing = false;

                //Remove events
                document.onkeydown = undefined;
                document.onkeyup = undefined;

                setTimeout(() => {
                    handleEnd(true);
                }, 0);
            }
        }

        function removeBackButton() {
            if (!document.body.contains(backButton)) {
                return;
            }
            backButton.onmouseover = undefined;
            backButton.onmouseleave = undefined;
            backButton.onmousedown = undefined;
            $(backButton).stop();
            animate.fadeOut(backButton, duration);
            setTimeout(() => {
                $(backButton).remove();
            }, duration);
        }

        function hidePauseMenu() {
            Game.actions.hideSettings(duration / 2, true);
            const resumeButton = document.querySelector("#resumeButton");
            const exitButton = document.querySelector("#exitButton");

            if (!document.body.contains(resumeButton)) {
                return;
            }

            removeBackground();


            resumeButton.onmouseover = undefined;
            resumeButton.onmouseleave = undefined;
            exitButton.onmouseover = undefined;
            exitButton.onmouseleave = undefined;

            animate.fadeOut(resumeButton, duration / 2);
            animate.fadeOut(exitButton, duration / 2);

            setTimeout(() => {
                $(resumeButton).remove();
                $(exitButton).remove();
            }, duration);
        }

        function removeBackground() {
            const backgroundPause = document.querySelector("#backgroundPause");
            animate.fadeOut(backgroundPause, duration);
            setTimeout(() => {
                backgroundPause.remove();
            }, duration);
        }

        function createMetrics() {
            const duration = 2000;
            let highScoreInterval;
            transitionToMetrics();
            positionLabels();
            setupPlayParticles();

            const scoreData = {
                gpa: Game.actions.getAverageGrade(score),
                gradeACount: score.filter(x => x == 4).length || 0,
                gradeBCount: score.filter(x => x == 3).length || 0,
                gradeCCount: score.filter(x => x == 2).length || 0,
                gradeDCount: score.filter(x => x == 1).length || 0,
                gradeFCount: score.filter(x => x == 0).length || 0,
                maxScore: Game.actions.getMaxScore(songData)
            };

            //Save data to local storage
            if (data && !songID) { //If a local custom song
                saveCustomSong();
            }
            else if (songID) { //If an online song
                saveOnlineSong();
            }
            else { //If base song
                saveBaseSong();
            }

            setTimeout(() => {
                generateScoreReport();
                createExitButton();
                createRetryButton();
                setTimeout(() => {
                    showOpinion();
                }, duration);
            }, duration);

            function showOpinion() {
                const opinions = [
                    {
                        gpa: 4.0,
                        message: "Straight A's!"
                    },
                    {
                        gpa: 3.75,
                        message: "Honor roll!"
                    },
                    {
                        gpa: 3.5,
                        message: "Nice!"
                    },
                    {
                        gpa: 3.0,
                        message: "Pretty good!"
                    },
                    {
                        gpa: 2.0,
                        message: "Not bad!"
                    },
                    {
                        gpa: 1.0,
                        message: "I have seen worse."
                    },
                    {
                        gpa: 0.0,
                        message: "You could do better."
                    }
                ];

                let message = "WTF is going on!?";

                for (let i = 0; i < opinions.length; ++i) {
                    const minGPA = opinions[i].gpa;

                    if (scoreData.gpa >= minGPA) {
                        message = opinions[i].message;
                        break;
                    }
                }

                const opinionDiv = DivHelper.new("55vw", "45vh", "10vw", "5vh", "div", 1000);
                opinionDiv.textContent = message;
                opinionDiv.setAttribute("class", "createMetricsLabels");
                opinionDiv.style.whiteSpace = "nowrap";
                opinionDiv.style.fontSize = "3vw";
                opinionDiv.style.color = "rgb(255,255,255)";

                animate.setOpacity(document.getElementById("gameIconLabel"), .5, duration);
            }

            function createExitButton() {
                const exitButton = DivHelper.new("100vw", "10vh", "20vw", "10vh");
                exitButton.setAttribute("class", "metricsOptions");
                exitButton.textContent = "EXIT SONG";
                exitButton.style.textAlign = "left";

                anime({
                    targets: exitButton,
                    easing: globalEasing,
                    duration: duration / 1.5,
                    left: "82.5vw",
                    opacity: .75
                })

                exitButton.onmouseenter = onmouseenter;
                exitButton.onmouseleave = onmouseleave;

                exitButton.onclick = function () {
                    LoadingScreen.show(1000);

                    clearInterval(highScoreInterval);

                    setTimeout(() => {
                        Game.actions.cleanUp();

                        destination();

                        LoadingScreen.hide(1000);
                    }, 1000);
                }
            }

            function createRetryButton() {
                const retryButton = DivHelper.new("100vw", "20vh", "20vw", "10vh");
                retryButton.setAttribute("class", "metricsOptions");
                retryButton.textContent = "REPLAY SONG";
                retryButton.style.textAlign = "left";

                anime({
                    targets: retryButton,
                    easing: globalEasing,
                    duration: duration,
                    left: "84.5vw",
                    opacity: .75
                })

                retryButton.onmouseenter = onmouseenter;
                retryButton.onmouseleave = onmouseleave;

                retryButton.onclick = function () {
                    retry();
                }
            }

            function retry() {
                LoadingScreen.show(1000);

                clearInterval(highScoreInterval);

                setTimeout(() => {
                    Game.actions.cleanUp();

                    Game.play(data, icon, songIndex, songID, destination);

                    LoadingScreen.hide(1000);
                }, 1000);
            }

            function onmouseenter(e) {
                const div = e.target;

                anime({
                    targets: div,
                    easing: globalEasing,
                    duration: duration / 4,
                    translateX: "-2.5vw",
                    opacity: 1
                })
            }

            function onmouseleave(e) {
                const div = e.target;

                anime({
                    targets: div,
                    easing: globalEasing,
                    duration: duration / 4,
                    translateX: "0vw",
                    opacity: .75
                })
            }

            function setupPlayParticles() {
                playParticles.canvas.style.transform = "none";
                playParticles.particleSize = 4;
                playParticles.maxLen = 0;
                playParticles.streaksJitter = 0;
                playParticles.jitterness = .1;
                playParticles.spawnwait = 10;
                playParticles.initialSpeed.y = -2;
            }

            function transitionToMetrics() {
                LoadingScreen.hide(duration);
                Game.actions.playTitleSong(.25, true);
                timeBar.remove();
                scoreBar.remove();

                //Change background
                const g = songData.gradient;
                const newColor = String("linear-gradient(0deg," + g.color1 + "0%," + g.color2 + "50%," + g.color3 + "100%," + g.color4 + " 110%)");
                Game.actions.changeGradient(newColor, 0);
            }

            function generateScoreReport() {
                const gradeAValue = scoreData.gradeACount / scoreData.maxScore;
                const gradeBValue = scoreData.gradeBCount / scoreData.maxScore;
                const gradeCValue = scoreData.gradeCCount / scoreData.maxScore;
                const gradeDValue = scoreData.gradeDCount / scoreData.maxScore;
                const gradeFValue = scoreData.gradeFCount / scoreData.maxScore;

                const gradeABar = new ValueBar("5vw", "36vh", "15vw", "2vh", gradeAValue, "rgb(255,255,255)", true); //42.5vh
                const gradeBBar = new ValueBar("30vw", "43.5vh", "15vw", "2vh", gradeBValue, "rgb(235,235,235)", true); //50vh
                const gradeCBar = new ValueBar("5vw", "51vh", "15vw", "2vh", gradeCValue, "rgb(215,215,215)", true);
                const gradeDBar = new ValueBar("30vw", "58.5vh", "15vw", "2vh", gradeDValue, "rgb(200,200,200)", true);
                const gradeFBar = new ValueBar("5vw", "66vh", "15vw", "2vh", gradeFValue, "rgb(50,50,50)", true);

                const gpaValue = scoreData.gpa / 4;
                const maxComboValue = maxComboScore / scoreData.maxScore;

                const gpaValueBar = new ValueBar("0vw", "97vh", "35vw", "3vh", gpaValue, "rgba(255,255,255,.75)", true, false); //85vh //2vh height
                const maxComboValueBar = new ValueBar("65vw", "97vh", "35vw", "3vh", maxComboValue, "rgba(255,255,255,.75)", true, true); //85vh

                const allValueBars = [gradeABar, gradeBBar, gradeCBar, gradeDBar, gradeFBar, gpaValueBar, maxComboValueBar];

                for (let i = 0; i < allValueBars.length; ++i) {
                    allValueBars[i].element.style.border = "none";
                }
            }

            function positionLabels() {
                let songIcon = document.getElementById("gameIconLabel");
                document.getElementById("gameTitleLabel").style.opacity = "0";

                setupSongIcon();
                setTimeout(() => {
                    animateSongIcon();
                    setupSongLabels();
                    setupBottomDivider();
                }, duration);

                function setupBottomDivider() {
                    const bottomDivider = DivHelper.new("0vw", "60vh", "100vw", "45vh", "img");
                    bottomDivider.setAttribute("id", "bottomSongDivider");
                    bottomDivider.style.opacity = "0";
                    bottomDivider.src = Game.baseImages.bottomSongDivider.src;
                    animate.setOpacity(bottomDivider, .5, duration);
                }

                function setupSongLabels() {
                    const titleLabel = document.getElementById("gameTitleLabel");
                    const artistLabel = document.getElementById("gameArtistLabel") || titleLabel.cloneNode();
                    document.body.appendChild(artistLabel);
                    artistLabel.setAttribute("id", "gameArtistLabel");

                    titleLabel.style.zIndex = "100";
                    artistLabel.style.zIndex = "100";

                    titleLabel.textContent = "「 " + titleLabel.textContent + " 」";
                    artistLabel.textContent = songData.artist;

                    titleLabel.style.width = "50vw";
                    artistLabel.style.width = "50vw";

                    titleLabel.style.fontSize = "5vw";
                    artistLabel.style.fontSize = "2.5vw";
                    artistLabel.style.color = songData.textColor.artist;

                    titleLabel.style.textAlign = "center";
                    artistLabel.style.textAlign = "center";

                    titleLabel.style.left = "0vw";
                    titleLabel.style.top = "10vh";
                    artistLabel.style.left = "0vw";
                    artistLabel.style.top = "25vh";

                    titleLabel.style.filter = "drop-shadow(.3vw .3vw .3vw rgba(0,0,0,.5))";
                    artistLabel.style.filter = "drop-shadow(.3vw .3vw .3vw rgba(0,0,0,.5))";

                    titleLabel.style.opacity = "0";
                    artistLabel.style.opacity = "0";

                    animate.fadeIn(titleLabel, duration);
                    animate.fadeIn(artistLabel, duration);

                    //Create grade labels
                    const gradeA = DivHelper.new("5vw", "39.5vh", "15vw", "5vh", "div"); //35vh
                    const gradeB = DivHelper.new("30vw", "47vh", "15vw", "5vh", "div"); //42.5vh
                    const gradeC = DivHelper.new("5vw", "54.5vh", "15vw", "5vh", "div");
                    const gradeD = DivHelper.new("30vw", "62vh", "15vw", "5vh", "div");
                    const gradeF = DivHelper.new("5vw", "69.5vh", "15vw", "5vh", "div");

                    gradeA.textContent = "A : " + (scoreData.gradeACount || 0) + " (" + Math.floor(scoreData.gradeACount * 100 / scoreData.maxScore) + "%)";
                    gradeB.textContent = "B : " + (scoreData.gradeBCount || 0) + " (" + Math.floor(scoreData.gradeBCount * 100 / scoreData.maxScore) + "%)";
                    gradeC.textContent = "C : " + (scoreData.gradeCCount || 0) + " (" + Math.floor(scoreData.gradeCCount * 100 / scoreData.maxScore) + "%)";
                    gradeD.textContent = "D : " + (scoreData.gradeDCount || 0) + " (" + Math.floor(scoreData.gradeDCount * 100 / scoreData.maxScore) + "%)";
                    gradeF.textContent = "F : " + (scoreData.gradeFCount || 0) + " (" + Math.floor(scoreData.gradeFCount * 100 / scoreData.maxScore) + "%)";

                    const grades = [gradeF, gradeD, gradeC, gradeB, gradeA];
                    // const gradesText = ["GRADE F", "GRADE D", "GRADE C", "GRADE B", "GRADE A"]
                    const gradesColor = [
                        "rgb(75,75,75)",
                        "rgb(220,220,220)",
                        "rgb(230,230,230)",
                        "rgb(240,240,240)",
                        "rgb(255,255,255)"
                    ]

                    for (let i = 0; i < grades.length; ++i) {
                        const gradeDiv = grades[i];
                        const gradeColor = gradesColor[i];

                        gradeDiv.setAttribute("class", "createMetricsLabels");
                        gradeDiv.style.color = gradeColor;

                        gradeDiv.style.transform = "translateY(2.5vh)";
                        gradeDiv.style.opacity = "0";

                        anime({
                            targets: gradeDiv,
                            translateY: "0vh",
                            duration: duration + (i * 150),
                            opacity: 1,
                            easing: globalEasing
                        })
                    }

                    //Create GPA/max combo labels
                    const labelColor = "rgb(255,255,255)"

                    const scoreIcon = DivHelper.new("0vw", "89vh", "35vw", "5vh", "div", duration);
                    scoreIcon.setAttribute("class", "createMetricsLabels");
                    scoreIcon.textContent = "GRADE POINT AVERAGE : " + Math.floor(scoreData.gpa * 100) / 100;
                    scoreIcon.style.color = labelColor;

                    const comboIcon = DivHelper.new("65vw", "89vh", "35vw", "5vh", "div", duration);
                    comboIcon.setAttribute("class", "createMetricsLabels");
                    comboIcon.textContent = "MAX COMBO : " + maxComboScore;
                    comboIcon.style.color = labelColor;

                }

                function setupSongIcon() {
                    if (!songIcon) {
                        songIcon = DivHelper.new("60vw", "12vh", "17vw", "17vw", "img");

                        songIcon.src = `https://img.youtube.com/vi/${songURL}/sddefault.jpg`;
                    }
                    else {
                        songIcon.style.width = "25vw";
                        songIcon.style.height = "25vw";

                        songIcon.style.left = "55vw";
                        songIcon.style.top = "0vh";
                    }

                    songIcon.style.opacity = "0";

                    songIcon.style.transform = "perspective(10vw)";

                    songIcon.style.filter = "drop-shadow(1vw 1vw 1vw rgba(0,0,0,.5))";

                    songIcon.style.zIndex = "100";

                    songIcon.onclick = function () {
                        window.open(`https://youtu.be/${songURL}`, "_blank")
                    }
                }


                function animateSongIcon() {
                    const final = "20vh";

                    anime({
                        targets: songIcon,
                        translateY: final,
                        rotateY: "-10deg",
                        opacity: 1,
                        duration: duration,
                        easing: globalEasing
                    })
                }
            }

            function saveCustomSong() {
                let storedGPA = data.gpa || data.score || 0;
                let storedCombo = data.combo || 0;

                storedGPA = sanityCheckGPA(storedGPA);

                let highGPA = false;
                let highCombo = false;
                if (scoreData.gpa > storedGPA) {
                    data.gpa = scoreData.gpa;
                    highGPA = true;
                }
                if (maxComboScore > storedCombo) {
                    data.combo = maxComboScore;
                    highCombo = true;
                }

                if (highGPA || highCombo) {
                    Game.actions.saveSongData(data, songIndex);
                }

                setTimeout(() => {
                    handleHighScore(highGPA, highCombo);
                }, duration);
            }

            function saveOnlineSong() {
                const gpaKey = "songIdGPA" + songID;
                const comboKey = "songIdCombo" + songID;

                let storedGPA = Number(localStorage.getItem(gpaKey)) || 0;
                let storedCombo = Number(localStorage.getItem(comboKey)) || 0;
                console.log(storedGPA);
                console.log(gpaKey)
                let highGPA = false;
                let highCombo = false;
                if (scoreData.gpa > storedGPA) {
                    console.log("yes");
                    localStorage.setItem(gpaKey, scoreData.gpa);
                    highGPA = true;
                }
                if (maxComboScore > storedCombo) {
                    localStorage.setItem(comboKey, maxComboScore);
                    highCombo = true;
                }

                setTimeout(() => {
                    handleHighScore(highGPA, highCombo);
                }, duration);
            }

            function saveBaseSong() {
                const gpaKey = "baseSongGPA" + Game.selectedSong;
                const comboKey = "baseSongCombo" + Game.selectedSong;

                let storedGPA = Number(localStorage.getItem(gpaKey)) || 0;
                let storedCombo = Number(localStorage.getItem(comboKey)) || 0;

                storedGPA = sanityCheckGPA(storedGPA);

                let highGPA = false;
                let highCombo = false;
                if (scoreData.gpa > storedGPA) {
                    localStorage.setItem(gpaKey, scoreData.gpa);
                    highGPA = true;
                }
                if (maxComboScore > storedCombo) {
                    localStorage.setItem(comboKey, maxComboScore);
                    highCombo = true;
                }

                setTimeout(() => {
                    handleHighScore(highGPA, highCombo);
                }, duration);
            }

            function handleHighScore(highGPA, highCombo) {
                console.log(score)
                if (!highGPA && !highCombo) {
                    return;
                }

                const recordDiv = DivHelper.new("0vw", "2.5vh", "100vw", "0vh", "div", 1000);
                recordDiv.setAttribute("class", "createMetricsLabels");
                recordDiv.style.whiteSpace = "nowrap";
                recordDiv.style.fontSize = "3vw";
                recordDiv.style.color = "rgb(255,255,255)";

                if (highGPA && highCombo) {
                    // Effects.displayMessage("New record GPA and COMBO!", 5000, 1000, "2.5vh");
                    recordDiv.textContent = "New record GPA and COMBO!";
                }
                else if (highGPA) {
                    recordDiv.textContent = "New record GPA!";
                }
                else if (highCombo) {
                    recordDiv.textContent = "New record COMBO!";
                }

                Effects.notify(songData.artist + " would be proud!", 5000);

                highScoreInterval = setInterval(() => {
                    const size = getRandomNumber(50, 250);
                    const x = getRandomNumber(0, window.innerWidth);
                    const y = getRandomNumber(0, window.innerHeight / 3);
                    const d = getRandomNumber(1000, 2000);
                    Effects.pulse(size, x, y, d);
                }, 100);
            }

            //Checks if original score is over 4.0
            function sanityCheckGPA(storedGPA) {
                if (storedGPA < 0 || storedGPA > 4) {
                    storedGPA = 0;
                }

                return storedGPA;
            }

            // const originalScore = localStorage.getItem(scoreKey);
            // const originalMaxCombo = localStorage.getItem(comboKey);

            // if (originalScore < score || originalMaxCombo < maxComboScore) {
            //     let scoreType;
            //     if (originalScore < score && originalMaxCombo < maxComboScore) {
            //         scoreType = "NEW HIGH COMBO AND SCORE!";
            //     }
            //     else if (originalScore < score) {
            //         scoreType = "NEW HIGH SCORE!";
            //     }
            //     else {
            //         scoreType = "NEW MAX COMBO!";
            //     }
            //     setTimeout(() => {
            //         handleHighScore(scoreType);
            //     }, duration * 2);
            // }
            // //debug
            // // setTimeout(() => {
            // //     handleHighScore();
            // // }, duration * 2);
            // if (originalScore === null || originalScore < score) {
            //     localStorage.setItem(scoreKey, score);
            // }
            // if (originalMaxCombo === null || originalMaxCombo < maxComboScore) {
            //     localStorage.setItem(comboKey, maxComboScore);
            // }

            // //Stylize scene
            // const titleLabel = document.querySelector("#gameTitleLabel");
            // const iconLabel = document.querySelector("#gameIconLabel");

            // titleLabel.style.opacity = "0";
            // titleLabel.style.width = "100vw";
            // titleLabel.style.top = "20vh"; //to 12.5 (7.5)
            // titleLabel.style.left = "0vw";
            // titleLabel.style.textAlign = "center";
            // titleLabel.style.textShadow = "7px 7px 10px rgba(0, 0, 0, .5)";
            // titleLabel.style.fontSize = "3.5vw";
            // titleLabel.style.zIndex = "2";

            // iconLabel.style.opacity = "0";
            // iconLabel.style.width = "20vw";
            // iconLabel.style.height = "20vw";
            // iconLabel.style.left = "40vw";
            // iconLabel.style.top = "30vh";
            // iconLabel.style.filter = "drop-shadow(7px 7px 7px rgba(0,0,0,.5)";
            // iconLabel.style.zIndex = "20";

            // titleLabel.textContent = "「 " + titleLabel.textContent + " 」";

            // const g = songData.gradient;
            // const newColor = String("linear-gradient(0deg," + g.color1 + "0%," + g.color2 + "50%," + g.color3 + "100%," + g.color4 + " 110%)");
            // Game.actions.changeGradient(newColor, 0);

            // playParticles.canvas.style.transform = "none";
            // playParticles.particleSize = 4;
            // playParticles.maxLen = 0;
            // playParticles.streaksJitter = 0;
            // playParticles.jitterness = .1;
            // playParticles.spawnwait = 10;
            // playParticles.initialSpeed.y = -2;

            // let highScoreInterval = undefined;

            // //Reveal labels
            // setTimeout(() => {
            //     animate.setOpacity(document.querySelector("#vignette"), .5, 2000)

            //     revealLabels();
            // }, 2000);

            // function saveBaseSong() {

            // }

            // function revealLabels() {
            //     const duration = 2000;
            //     $(titleLabel).animate({
            //         top: "10vh",
            //         opacity: 1
            //     }, {
            //         duration: duration
            //     });
            //     $(iconLabel).animate({
            //         top: "22.5vh",
            //         opacity: 1
            //     }, {
            //         duration: duration
            //     });

            //     //Create score bars
            //     setTimeout(() => {
            //         const scoreValue = score / maxScore;
            //         const comboValue = maxComboScore / maxScore;

            //         const color = "rgb(255,255,255)";

            //         const scoreBar = new ValueBar("12.5vw", "75vh", "75vw", "2vh", scoreValue, color, true);

            //         const comboBar = new ValueBar("12.5vw", "90vh", "75vw", "2vh", comboValue, color, true);

            //         const scoreIcon = DivHelper.new("12.5vw", "70vh", "75vw", "3vh");
            //         scoreIcon.setAttribute("class", "performanceIcons");
            //         scoreIcon.textContent = String("SCORE : " + score + " (" + Math.floor(scoreValue * 100) + "%)");
            //         scoreIcon.style.color = color;
            //         scoreIcon.style.opacity = "0";
            //         animate.fadeIn(scoreIcon, duration);

            //         const comboIcon = DivHelper.new("12.5vw", "85vh", "75vw", "3vh");
            //         comboIcon.setAttribute("class", "performanceIcons");
            //         comboIcon.textContent = String("MAX COMBO : " + maxComboScore);
            //         comboIcon.style.color = color;
            //         comboIcon.style.opacity = "0";
            //         animate.fadeIn(comboIcon, duration);
            //     }, duration);

            //     //Continue
            //     setTimeout(() => {
            //         iconLabel.addEventListener("click", function () {
            //             iconLabel.style.zIndex = "2";
            //             LoadingScreen.show(duration / 2)
            //             //WORKAROUND
            //             LoadingScreen.elements.div.style.zIndex = "1000";
            //             LoadingScreen.elements.canvas.style.zIndex = "1001";
            //             if (highScoreInterval !== undefined) {
            //                 clearInterval(highScoreInterval);
            //             }

            //             setTimeout(() => {
            //                 Game.actions.cleanUp();

            //                 LoadingScreen.hide(duration);

            //                 setTimeout(() => {
            //                     //Change when multiplayer sharing is added
            //                     Game.baseSongs(Game.baseSongsMin, Game.baseSongsMax);
            //                 }, duration);
            //             }, duration / 2);
            //         })
            //     }, duration * 1);
            // }

            // function handleHighScore(text) {
            //     Effects.displayMessage(text, 5000, 1000);
            //     Effects.notify(songData.artist + " would be proud!", 5000);
            //     Effects.shakeElement(iconLabel, duration, 1, 10);

            //     playParticles.maxLen = 50;
            //     playParticles.streaksJitter = 2;

            //     highScoreInterval = setInterval(() => {
            //         const size = getRandomNumber(50, 250);
            //         const x = getRandomNumber(0, window.innerWidth);
            //         const y = getRandomNumber(0, window.innerHeight / 3);
            //         const d = getRandomNumber(1000, 2000);
            //         Effects.pulse(size, x, y, d);
            //     }, 100);
            // }
        }

        function showAudioLabels() {
            const titleLabel = DivHelper.new("2.5vw", "18vh", "10vw", "10vh");
            titleLabel.setAttribute("id", "gameTitleLabel");

            titleLabel.textContent = songData.name;

            titleLabel.style.opacity = "0";
            titleLabel.style.color = songData.textColor.title;

            const iconLabel = DivHelper.new("5vw", "5vh", "30vh", "30vh", "img");
            iconLabel.setAttribute("id", "gameIconLabel");

            iconLabel.src = songIcon.src;
            iconLabel.style.opacity = "0";

            //Animate in
            const duration = 1000;

            $(titleLabel).animate({
                opacity: "1",
                top: "16.5vh"
            }, {
                duration: duration
            })
            animate.setOpacity(iconLabel, .25, duration)
        }

        function showCustomAudioLabels() {
            const titleDiv = DivHelper.new("2.5vw", "18vh", "10vw", "10vh", "div", duration);
            const artistDiv = DivHelper.new("2.5vw", "25vh", "10vw", "10vh", "div", duration);

            titleDiv.setAttribute("id", "gameTitleLabel");
            artistDiv.setAttribute("id", "gameArtistLabel");

            titleDiv.textContent = songData.name;
            artistDiv.textContent = songData.artist;

            titleDiv.style.color = songData.textColor.title;
            artistDiv.style.color = songData.textColor.artist;
        }

        function updateLightEffect() {
            if (document.body.contains(lightEffect)) {
                window.requestAnimationFrame(updateLightEffect);
            }
            const shadeOpacity = parseFloat(shade.style.opacity);
            const opacity = shadeOpacity + ((1 - lightOpacity) - shadeOpacity) * (.05 * fpsMultiplier);
            shade.style.opacity = String(opacity);

            lightOpacity -= lightOpacityFade * fpsMultiplier;
            lightOpacity = clamp(lightOpacity, 0, 1)
        }
        function updateBars() {
            if (document.contains(timeBar) && !Game.lowDetailMode) {
                window.requestAnimationFrame(updateBars);
            }
            const duration = Game.gameCanvas.isUsingYouTube ? Game.gameAudio.getDuration() : Game.gameAudio.duration;
            const currentTime = Game.gameCanvas.isUsingYouTube ? Game.gameAudio.getCurrentTime() : Game.gameAudio.currentTime;

            const songPercentage = currentTime / duration * 100;

            const width = String(songPercentage + "vw");
            timeBar.style.width = width;

            //scorebar
            const scorePercentage = ((totalScore / score.length) / 4) * 100;
            const currentWidth = parseFloat(scoreBar.style.width);
            scoreBar.style.width = String(currentWidth + (scorePercentage - currentWidth) * .05) + "vw";
        }
        function determineLane(xPosition) {
            const gameCanvas = Game.gameCanvas;
            const laneCount = gameCanvas.laneCount;

            for (let i = 0; i < laneCount; ++i) {
                const lanePosition1 = gameCanvas.lanesArray[i];
                const lanePosition2 = gameCanvas.lanesArray[i + 1];

                if (xPosition > lanePosition1 && xPosition < lanePosition2) {
                    return i;
                }
            }
            return undefined;
        }
        function getUserInput() {
            const gameCanvas = Game.gameCanvas;

            const valueSet = Game.inputReach;

            //First note hit
            let hitNote = undefined;

            //Second (if holding down)
            let hitNoteEnd = undefined;

            // document.addEventListener("keydown", keyDown);
            // document.addEventListener("keyup", keyUp);
            document.onkeydown = function (event) {
                keyDown(event);
            }
            document.onkeyup = function (event) {
                keyUp(event);
            }

            let touchDown = false;
            Game.gameCanvas.canvas.onmousedown = function (event) {
                const offsetX = event.offsetX;

                const lane = determineLane(offsetX * gameCanvas.scale);
                if (lane === undefined) {
                    return;
                }

                keyDown(null, lane);
            }

            Game.gameCanvas.canvas.onmouseup = function () {
                if (touchDown !== false) {
                    keyUp(null, touchDown)
                }
            }

            //Work around for buggy keydown event
            for (let i = 0; i < gameCanvas.lanes.length; ++i) {
                keyData[i] = false;
            }

            function keyDown(event, touchLane) {
                if (touchLane === undefined && event.repeat) { return }
                if (!Game.gameCanvas.playing) { return }

                //get lane
                let lane = null;
                if (touchLane === undefined) {
                    const key = event.key;
                    lane = getLane(key);
                }
                else {
                    lane = touchLane;
                    touchDown = touchLane;
                }

                if (lane === undefined || keyData[lane] === true) { return }

                const objLane = gameCanvas.inputData[lane];

                hitNote = findHitNote(lane, true);

                if (hitNote) {
                    addScore(hitNote.note, hitNote.distance);
                    if (hitNote.note.timePositionEnd) {
                        keyData[lane] = hitNote.note;
                    }
                }

                if (keyData[lane]) {
                    hitNote = true;
                }

                objLane.value = valueSet;
                objLane.lock = true;
                objLane.color = hitNote !== false ? selectedSong.noteColor : "rgb(255,225,200)";
            }

            function keyUp(event, touchLane) {
                if (touchLane === undefined && event.repeat) { return }
                if (!Game.gameCanvas.playing) { return }

                //get lane
                let lane = null;
                if (touchLane === undefined) {
                    const key = event.key;
                    lane = getLane(key);
                }
                else {
                    lane = touchLane;
                    touchDown = false;
                }

                keyData[lane] = false;

                if (lane === undefined) { return }

                const objLane = gameCanvas.inputData[lane];

                hitNoteEnd = findHitNote(lane, false);

                if (hitNoteEnd) {
                    addScore(hitNoteEnd.note, hitNoteEnd.distance);
                }

                objLane.lock = false;
            }

            function findHitNote(lane, keyDown) {
                const gameCanvas = Game.gameCanvas;
                const notes = gameCanvas.notes;

                for (let i = 0; i < notes.length; ++i) {
                    const note = notes[i];

                    if (note.tagged || note.lane != lane) {
                        continue;
                    }

                    const targetLine = gameCanvas.targetLine;
                    const heightOffset = (gameCanvas.heightOffset / gameCanvas.scale) * 0.8 * gameCanvas.scale;
                    const threshold = Game.inputReach / 500; //prev 500
                    const distanceA = Math.abs((targetLine / gameCanvas.scale) - (note.timePosition + gameCanvas.timePosition + heightOffset));
                    const distanceB = note.timePositionEnd ? Math.abs((targetLine / gameCanvas.scale) - (note.timePositionEnd + gameCanvas.timePosition + heightOffset)) : false;

                    //Handle non-long notes
                    if (!distanceB && keyDown) {
                        if (distanceA < threshold) {
                            note.tagged = true;
                            if (note.pianoNote) { hitSound.play(note.pianoNote) }
                            return {
                                note: note,
                                distance: distanceA
                            };
                        }
                    }
                    //Handle long notes
                    else if (distanceB) {
                        if (keyDown && (distanceB < threshold)) {
                            note.holding = true;
                            if (note.pianoNote) { hitSound.play(note.pianoNote) }
                            return {
                                note: note,
                                distance: distanceB
                            };
                        }
                        else if (!keyDown && (distanceA < threshold)) {
                            note.holding = false;
                            note.tagged = true;
                            return {
                                note: note,
                                distance: distanceA
                            };
                        }
                    }
                }
                return false;
            }

            function getLane(key) {
                const inputData = gameCanvas.inputData;
                for (let i = 0; i < inputData.length; ++i) {
                    const obj = inputData[i];

                    if (key === obj.key || key === obj.key.toLowerCase()) {
                        return i;
                    }
                }
            }
        }
        function shake() {
            //Miss sound i guess cuz everyting hits here
            missSound.play("c3");

            // const duration = 100;
            // Effects.shakeElement(Game.gameCanvas.canvas, duration, 2, 5);
            // Effects.shakeElement(Game.gameCanvas.textCanvas, duration, 3, 5);
            // if (data) {
            //     Effects.shakeElement(document.querySelector("#gameArtistLabel"), duration, 3, 15);
            // }
            // else {
            //     Effects.shakeElement(document.querySelector("#gameIconLabel"), duration, 3, 15);
            // }
            // Effects.shakeElement(document.querySelector("#gameTitleLabel"), duration, 3, 15);
            // Effects.shakeElement(document.querySelector("#stars"), duration, 3, 5);
            // Effects.shakeElement(document.querySelector("#starsBackground"), duration, 3, 15);
            // Effects.shakeElement(playParticles.canvas, duration, 3, 10);

        }
        function updateScore() {
            //goofy workaround
            if (lightEffect) { window.requestAnimationFrame(updateScore); }

            //Check for focus
            if (!document.hasFocus()) {
                if (Game.gameCanvas.playing) {
                    showPauseMenu();
                }
            }

            //Check if notes crossed line
            for (let i = 0; i < Game.gameCanvas.notes.length; ++i) {
                const note = Game.gameCanvas.notes[i];
                if (note.tagged) {
                    continue;
                }
                const heightOffset = (Game.gameCanvas.heightOffset / Game.gameCanvas.scale) * 0.8 * Game.gameCanvas.scale;
                const timePosition = (Game.gameCanvas.targetLine / Game.gameCanvas.scale) - (note.timePosition + Game.gameCanvas.timePosition + heightOffset) + ((Game.inputReach / (2 * Game.scrollingSpeed)) / Game.gameCanvas.scale);
                const timePositionEnd = note.timePositionEnd ? (Game.gameCanvas.targetLine / Game.gameCanvas.scale) - (note.timePositionEnd + Game.gameCanvas.timePosition + heightOffset) : false

                const targetLineBuffer = .1;

                if (note.tagged == undefined && timePosition < 0 - targetLineBuffer) {
                    note.tagged = true;
                    note.holding = true;
                    removeScore(note);
                }
                else if (note.tagged == undefined && timePositionEnd && timePositionEnd < 0 - targetLineBuffer && !note.holding) {
                    note.tagged = true;
                    note.holding = true;
                    removeScore(note);
                }


            }

            //Check for long notes
            // for (let i = 0; i < keyData.length; ++i) {
            //     const note = keyData[i];

            //     if (!note.timePositionEnd) {
            //         continue;
            //     }

            //     if (note.tagged) {
            //         removeScore(note);
            //         continue;
            //     }

            //     const heightOffset = (Game.gameCanvas.heightOffset / Game.gameCanvas.scale) * 0.8 * Game.gameCanvas.scale;
            //     const timePosition = (Game.gameCanvas.targetLine / Game.gameCanvas.scale) - (note.timePosition + Game.gameCanvas.timePosition + heightOffset) + ((Game.inputReach / (2 * Game.scrollingSpeed)) / Game.gameCanvas.scale);

            //     note.widthTween = note.widthTween != undefined ? note.widthTween + (Game.gameCanvas.noteWidth / 2 - note.widthTween) * (.05 * fpsMultiplier) : 0;
            //     if (timePosition < 0.1) {
            //         keyData[i] = false;
            //         note.tagged = true;
            //         addScore(note, 0);
            //     }
            // }

            if (comboScore > comboThreshold) {
                comboOpacity = clamp(comboOpacity - .01, .1, 1);
            }
            else {
                comboOpacity = 0;
            }

            const newOpacity = parseFloat(comboDeco.style.opacity) + (comboOpacity - parseFloat(comboDeco.style.opacity)) * (.025 * fpsMultiplier);

            comboDeco.style.opacity = String(newOpacity);
            comboText.style.opacity = String(newOpacity);
            comboText.textContent = String(comboScore);

            comboOpacity = clamp(comboOpacity, 0, 1);

            if (comboScore > maxComboScore) {
                maxComboScore = comboScore;
            }

            Game.gameScore = score;
            Game.gameCombo = comboScore;
        }

        function addScore(note, distance) {
            const calculatedScore = calculateScore(distance);

            if (calculatedScore <= 0) {
                removeScore(note);
                return;
            }

            score.push(calculatedScore);
            totalScore += calculatedScore;
            comboScore++;

            lightOpacity += ((calculatedScore / 4 + 1) - lightOpacity) / lightOpacityFactor;
            comboOpacity = 1;

            Game.gameCanvas.addScore(note.lane, calculatedScore);
        }

        function calculateScore(distance) {
            for (let i = scoringDirectory.length; i >= 0; --i) {
                const scoreDistance = scoringDirectory[i];
                if (distance < scoreDistance) {
                    return i;
                }
            }
        }

        function removeScore(note) {
            const lane = note.lane;

            const objLane = Game.gameCanvas.inputData[lane];

            objLane.value = Game.inputReach;

            objLane.color = "rgb(255,200,200)";

            if (!Game.lowDetailMode) {
                shake();
            }

            Game.gameCanvas.addScore(lane, 0);

            score.push(0);
            comboScore = 0;
        }
    },
    compose: () => {
        const duration = 1000;
        let savedSongs = localStorage.getItem("savedSongs");
        let createSongButton = undefined;
        const deleteSongButton = showDeleteSongButton("100vw", "100vh", .5);
        const playSongButton = showPlayButton("100vw", "100vh", .5);
        let songs = new SongsList();

        BackButton.show(Game.menu, true, 1000, true, 1000, true);
        BackButton.element.style.left = "90vw";

        const scoreBar = new ValueBar("60vw", "40vh", "40vw", "2vh", 0, "rgba(255,255,255,.75)");
        const comboBar = new ValueBar("60vw", "55vh", "40vw", "2vh", 0, "rgba(255,255,255,.75)");

        scoreBar.reversed = true;
        comboBar.reversed = true;

        scoreBar.element.style.border = "none";
        comboBar.element.style.border = "none";

        const scoreLabel = DivHelper.new("60vw", "35vh", "40vw", "2vh");
        const comboLabel = DivHelper.new("60vw", "50vh", "40vw", "2vh");

        scoreLabel.setAttribute("class", "composeLabels");
        comboLabel.setAttribute("class", "composeLabels");

        scoreLabel.textContent = "SCORE : 100%";
        comboLabel.textContent = "MAX SCORE : 100%";

        const difficultyLabel = DivHelper.new("60vw", "33vh", "40vw", "2vh");

        difficultyLabel.textContent = "EASY LEVEL 1";
        difficultyLabel.setAttribute("class", "composeLabels");
        difficultyLabel.style.textAlign = "right";
        difficultyLabel.style.fontSize = "2.5vw";

        scoreBar.element.style.opacity = "0";
        comboBar.element.style.opacity = "0";
        scoreBar.element.style.zIndex = "11";
        comboBar.element.style.zIndex = "11";

        scoreLabel.style.opacity = "0";
        comboLabel.style.opacity = "0";
        difficultyLabel.style.opacity = "0";

        if (savedSongs) {
            savedSongs = JSON.parse(savedSongs);
            createSongButton = showCreateNewSongButton("85vw", "75vh", .5, true);

            for (let i = 0; i < savedSongs.length; ++i) {
                const song = savedSongs[i];
                songs.addSong(song);
            }
        }
        else {
            setTimeout(() => {
                Effects.displayMessage("You have no saved songs! Lets make some!", duration * 2, duration);
            }, duration);
            setTimeout(() => {
                createSongButton = showCreateNewSongButton("45vw", "45vh", 1, true);
            }, duration * 2);
        }
        deleteSongButton.textContent = "-";
        deleteSongButton.onclick = async (e) => {
            e.stopPropagation();
            if (songs.selectedSong == undefined) {
                return;
            }

            const index = songs.selectedSong;

            const songData = songs.songs[index].songData;

            if (songData.songId) {
                try {
                    await fetch("/api/deleteSong", {
                        method: "delete",
                        headers: {
                            "Content-Type": "application/json",
                            "Accepts": "application/json"
                        },
                        body: JSON.stringify({
                            token: localStorage.getItem("token"),
                            userId: localStorage.getItem("userId"),
                            songId: songData.songId
                        })
                    })
                        .then(response => response.json())
                        .then((data) => {
                            if (data.error) {
                                Effects.displayMessage("Failed to delete song. Please contact owner in the discord.");
                                return;
                            }
                            Effects.displayMessage("De-uploaded song.", 5000, 1000);
                        })
                }
                catch {
                    Effects.displayMessage("Failed to delete song. Please contact owner in the discord.", 5000, 1000);
                    return;
                }
            }

            songs.removeSong(songs.selectedSong);

            //Delete song from data
            Game.actions.removeLocalSong(index);

            savedSongs.splice(index, 1);
        }

        playSongButton.onclick = () => {
            if (songs.selectedSong == undefined || !savedSongs) {
                return;
            }

            const index = songs.selectedSong;

            const songData = savedSongs[index];

            if (songData) {
                LoadingScreen.show(1000);
                setTimeout(() => {
                    const audioBar = document.querySelector("#mainAudioBar");
                    animate.fadeOut(audioBar, 1000);

                    const celestialObject = document.querySelector("#celestialObject");
                    animate.fadeOut(celestialObject, 1000);

                    const fallingStars = document.querySelector("#fallingStars");
                    animate.fadeOut(fallingStars, 1000);

                    Game.actions.cleanUp();
                    LoadingScreen.hide(1000);
                    Game.play(songData, undefined, index, false, () => {
                        // Game.actions.playTitleSong(1, true);

                        Game.menu(false, false, true);

                        Game.actions.cleanUp();

                        Game.compose();
                    });
                }, 1000);
            }
        }

        songs.onclick = () => {
            // const obj = songs.songs[songs.selectedSong].songData;
            if (songs.selectedSong != undefined && songs.songs[songs.selectedSong]) {
                showOptions();
                return;
            }
            hideOptions();
            // showSongOptions(obj, songs.selectedSong);
            // songs.remove();
        }

        function hideOptions() {
            animate.fadeOut(createSongButton, duration / 2);
            animate.fadeOut(deleteSongButton, duration / 2);
            animate.fadeOut(playSongButton, duration / 2);

            hideStatistics();

            setTimeout(() => {
                animate.fadeIn(createSongButton, duration / 2);
                document.body.append(createSongButton);

                createSongButton.style.left = "85vw";
                createSongButton.style.top = "75vh";
                deleteSongButton.style.top = "100vw";
                deleteSongButton.style.left = "100vh";
            }, duration / 2);
        }

        function showOptions() {
            animate.fadeOut(createSongButton, duration / 2);
            animate.fadeOut(deleteSongButton, duration / 2);
            animate.fadeOut(playSongButton, duration / 2);

            updateStatistics(songs.selectedSong);

            setTimeout(() => {
                animate.fadeIn(createSongButton, duration / 2);
                animate.fadeIn(deleteSongButton, duration / 2);
                animate.fadeIn(playSongButton, duration / 2);

                songs.songs[songs.selectedSong].songDiv.append(createSongButton);
                songs.songs[songs.selectedSong].songDiv.append(deleteSongButton);
                songs.songs[songs.selectedSong].songDiv.append(playSongButton);

                playSongButton.style.left = "35vw";
                playSongButton.style.top = "-5vh";

                createSongButton.style.left = "42.5vw";
                createSongButton.style.top = "-5vh";

                deleteSongButton.style.left = "50vw";
                deleteSongButton.style.top = "-5vh";
            }, duration / 2);
        }

        function updateStatistics(index) {
            let songData = undefined;
            if (!savedSongs) {
                songData = {
                    gpa: 0,
                    combo: 0
                }
            }
            else {
                songData = savedSongs[index];
            }

            let score = songData ? songData.gpa : 0;
            let combo = songData ? songData.combo : 0;

            score = score ? songData.gpa : 0;
            combo = score ? songData.combo : 0;

            score = Math.floor(score * 100) / 100;

            const maxScore = Game.actions.getMaxScore(songData) || 1;

            const scoreValue = Math.floor(score * 100 / 4);
            const comboValue = Math.floor(combo / maxScore * 100);

            scoreLabel.textContent = `GPA : ${score} (${scoreValue})%`
            comboLabel.textContent = `MAX COMBO : ${combo} (${comboValue})%`

            scoreBar.updateValue(scoreValue / 100);
            comboBar.updateValue(comboValue / 100);

            const difficulty = Game.actions.getDifficulty(songData);
            difficultyLabel.textContent = difficulty;

            showStatisics(scoreValue, comboValue);
        }

        function showStatisics(score, combo) {
            animate.fadeIn(scoreBar.element, duration / 2);
            animate.fadeIn(comboBar.element, duration / 2);
            animate.setOpacity(scoreLabel, clamp((score * 5) / 100, .25, 1), duration / 2);
            animate.setOpacity(comboLabel, clamp((combo * 5) / 100, .25, 1), duration / 2);
            animate.setOpacity(difficultyLabel, clamp((score * 5) / 100, .25, 1), duration / 2);
        }

        function hideStatistics() {
            animate.fadeOut(scoreBar.element, duration / 2);
            animate.fadeOut(comboBar.element, duration / 2);
            animate.fadeOut(scoreLabel, duration / 2);
            animate.fadeOut(comboLabel, duration / 2);
            animate.fadeOut(difficultyLabel, duration / 2);
        }

        function showCreateNewSongButton(left, top, scale) {
            const createSongButton = DivHelper.new(left, top, "10vw", "10vw");
            createSongButton.setAttribute("id", "createSongButton");
            createSongButton.textContent = "+";

            createSongButton.style.opacity = "0";
            createSongButton.style.transform = `scale(${scale})`;

            animate.fadeIn(createSongButton, duration);

            createSongButton.onclick = function () {
                if (songs.selectedSong != undefined && songs.songs[songs.selectedSong]) {
                    showSongOptions(songs.songs[songs.selectedSong].songData, songs.selectedSong);
                    songs.onclick = () => { };
                    songs.remove();
                    deleteSongButton.remove();

                    anime({
                        targets: createSongButton,
                        // top: "75vh",
                        // left: "45vw",
                        opacity: 0,
                        easing: globalEasing,
                        duration: duration,
                        // scale: .75,
                        complete: () => {
                            createSongButton.style.left = "45vw";
                            createSongButton.style.top = "75vh";
                            document.body.append(createSongButton);
                            animate.fadeIn(createSongButton, duration);
                        }
                    })
                    return;
                }
                anime({
                    targets: createSongButton,
                    easing: globalEasing,
                    duration: duration,
                    left: "85vw",
                    top: "75vh",
                    scale: .5
                })
                createNewSong();
            }

            return createSongButton;
        }

        function showDeleteSongButton(left, top, scale) {
            const deleteSongButton = DivHelper.new(left, top, "10vw", "10vw");
            deleteSongButton.setAttribute("id", "deleteSongButton");
            deleteSongButton.textContent = "-";

            deleteSongButton.style.opacity = "0";
            deleteSongButton.style.transform = `scale(${scale})`;

            return deleteSongButton;
        }

        function showPlayButton(left, top, scale) {
            const playButton = DivHelper.new(left, top, "10vw", "10vw");
            playButton.setAttribute("id", "playSongButton");
            playButton.textContent = "♫";

            playButton.style.opacity = "0";
            playButton.style.transform = `scale(${scale})`;

            return playButton;
        }

        function createNewSong() {
            //Default
            const obj = Game.actions.createSongData(
                "Unnamed Song",
                "Unnamed Artist",
                "rgb(109,131,144)", "rgb(227,230,238)", "rgb(59,65,75)",
                "rgb(255,255,255)",
                "rgb(200,200,200)",
                [],
                true,
                6
            );
            songs.addSong(obj);
        }

        function showSongOptions(songData, index) {
            // anime({
            //     targets: createSongButton,
            //     top: "75vh",
            //     left: "45vw",
            //     easing: globalEasing,
            //     duration: duration,
            //     scale: .75
            // })

            // hideStatistics();

            const songTitle = DivHelper.new("2.5vw", "18vh", "22.5vw", "7.5vh", "input", 1000);
            const songArtist = DivHelper.new("2.5vw", "25vh", "17.5vw", "7.5vh", "input", 1000);

            const titleColor = DivHelper.new("25vw", "20vh", "2vw", "2vw", "input", 1000);
            const artistColor = DivHelper.new("20vw", "27vh", "2vw", "2vw", "input", 1000);

            //bottom
            const gradient1 = DivHelper.new("20vw", "55vh", "2vw", "2vw", "input", 1000);
            //middle
            const gradient2 = DivHelper.new("11.25vw", "50vh", "2vw", "2vw", "input", 1000);
            //top
            const gradient3 = DivHelper.new("2.5vw", "45vh", "2vw", "2vw", "input", 1000);

            gradient1.type = "color";
            gradient2.type = "color";
            gradient3.type = "color";

            const importSongBox = DivHelper.new("2.5vw", "69.5vh", "27.5vw", "5vh", "textarea", 1000);
            importSongBox.setAttribute("id", "importSongBox");
            importSongBox.value = "OPTIONAL*"

            const importSongLabel = DivHelper.new("2.5vw", "75vh", "27.5vw", "10vh", "div", 1000);
            importSongLabel.setAttribute("class", "settingSongLabels");

            importSongLabel.textContent = "PASTE EXPORTED SONG DATA";

            const laneCount = DivHelper.new("2.5vw", "35vh", "10vw", "5vh", "input", 1000);
            laneCount.style.textAlign = "center";
            const laneCountLabel = DivHelper.new("2.5vw", "40vh", "10vw", "5vh", "div", 1000);
            laneCountLabel.style.borderTop = "solid 1px white";

            const gradientLabel = DivHelper.new("2.5vw", "60vh", "", "10vh", "div", 1000);
            gradientLabel.style.borderTop = "solid 1px white";

            const starsLabel = DivHelper.new("25vw", "60vh", "5vw", "5vh", "div", 1000);
            starsLabel.style.borderTop = "solid 1px white";
            const starsBoolean = DivHelper.new("26.5vw", "53vh", "2vw", "2vw", "input", 1000);

            const instrumentLabel = DivHelper.new("17.5vw", "40vh", "12.5vw", "5vh", "div", 1000);
            const instrumentSelect = DivHelper.new("17.5vw", "35vh", "12.5vw", "5vh", "select", 1000);

            if (songData.instrument !== undefined) {
                const option = document.createElement("option");
                option.value = songData.instrument;
                option.textContent = songData.instrument;

                instrumentSelect.append(option);
            }
            for (let i = 0; i < instrumentNames.length; ++i) {
                const instrument = instrumentNames[i];
                if (songData.instrument == instrument) {
                    continue;
                }
                const option = document.createElement("option");
                option.value = instrument;
                option.textContent = instrument;

                instrumentSelect.append(option);
            }
            instrumentLabel.textContent = "INSTRUMENT";

            laneCount.type = "number";
            laneCount.value = songData.inputCount;

            laneCount.min = 3;
            laneCount.max = 12;

            starsBoolean.type = "checkbox";
            starsBoolean.checked = songData.stars;

            songTitle.value = songData.name;
            songArtist.value = songData.artist;

            titleColor.type = "color";
            artistColor.type = "color";

            titleColor.value = rgbToHex(parseColor(songData.textColor.title)[0], parseColor(songData.textColor.title)[1], parseColor(songData.textColor.title)[2]);
            artistColor.value = rgbToHex(parseColor(songData.textColor.artist)[0], parseColor(songData.textColor.artist)[1], parseColor(songData.textColor.artist)[2]);;

            starsLabel.textContent = "STARS";
            laneCountLabel.textContent = "LANE COUNT";
            gradientLabel.textContent = "CONFIGURE BACKGROUND";

            gradient1.value = rgbToHex(parseColor(songData.gradient.color1)[0], parseColor(songData.gradient.color1)[1], parseColor(songData.gradient.color1)[2]);
            gradient2.value = rgbToHex(parseColor(songData.gradient.color2)[0], parseColor(songData.gradient.color2)[1], parseColor(songData.gradient.color2)[2]);
            gradient3.value = rgbToHex(parseColor(songData.gradient.color3)[0], parseColor(songData.gradient.color3)[1], parseColor(songData.gradient.color3)[2]);

            starsBoolean.style.zIndex = "100";

            songArtist.setAttribute("class", "settingSongProperties");
            laneCount.setAttribute("class", "settingSongProperties");
            songTitle.setAttribute("class", "settingSongProperties");
            titleColor.setAttribute("class", "settingSongProperties");
            artistColor.setAttribute("class", "settingSongProperties");
            instrumentSelect.setAttribute("class", "settingSongPropertiesSelect");

            gradient1.setAttribute("class", "settingSongProperties");
            gradient2.setAttribute("class", "settingSongProperties");
            gradient3.setAttribute("class", "settingSongProperties");

            starsLabel.setAttribute("class", "settingSongLabels");
            instrumentLabel.setAttribute("class", "settingSongLabels");
            laneCountLabel.setAttribute("class", "settingSongLabels");
            gradientLabel.setAttribute("class", "settingSongLabels");

            songArtist.style.fontSize = "1.5vw";
            titleColor.style.fontSize = "1.25vw";
            artistColor.style.fontSize = "1.25vw";

            laneCountLabel.style.fontSize = "1.5vw";
            laneCount.style.fontSize = "1.5vw";

            const demoGradient = DivHelper.new("0vw", "0vh", "100vw", "100vh", "div", 1000);
            const demoVignette = DivHelper.new("0vw", "0vh", "100vw", "100vh", "div", 1000);

            demoGradient.setAttribute("id", "demoGradient");
            demoVignette.setAttribute("id", "demoVignette");

            gradient1.oninput = changedGradient;
            gradient2.oninput = changedGradient;
            gradient3.oninput = changedGradient;

            changedGradient();
            titleColorChanged();
            artistColorChanged();
            starsBoolChanged();

            titleColor.oninput = titleColorChanged;
            artistColor.oninput = artistColorChanged;

            starsBoolean.onchange = starsBoolChanged;

            function artistColorChanged() {
                const color = Color.new(hexToRgb(artistColor.value).r, hexToRgb(artistColor.value).g, hexToRgb(artistColor.value).b);

                songArtist.style.color = color;
                if (songArtist.style.color == "") {
                    songArtist.style.color = "white";
                    artistColor.value = "rgb(255,255,255)";
                }
            }

            function titleColorChanged() {
                const color = Color.new(hexToRgb(titleColor.value).r, hexToRgb(titleColor.value).g, hexToRgb(titleColor.value).b);

                songTitle.style.color = color;
                if (songTitle.style.color == "") {
                    songTitle.style.color = "white";
                    titleColor.value = "rgb(255,255,255)";
                }
            }

            function starsBoolChanged() {
                const opacity = starsBoolean.checked ? 1 : 0;
                Game.actions.setStarsOpacity(opacity, 1000);
            }

            function changedGradient() {
                const color1 = Color.new(hexToRgb(gradient1.value).r, hexToRgb(gradient1.value).g, hexToRgb(gradient1.value).b);
                const color2 = Color.new(hexToRgb(gradient2.value).r, hexToRgb(gradient2.value).g, hexToRgb(gradient2.value).b);
                const color3 = Color.new(hexToRgb(gradient3.value).r, hexToRgb(gradient3.value).g, hexToRgb(gradient3.value).b);

                const newGradient = `linear-gradient(0deg, ${color1} 0%, ${color2} 20%, ${color3} 70%)`;
                demoGradient.style.background = newGradient;
            }

            createSongButton.onclick = function () {
                createSongButton.onclick = undefined;

                const color1 = Color.new(hexToRgb(gradient1.value).r, hexToRgb(gradient1.value).g, hexToRgb(gradient1.value).b) || "black";
                const color2 = Color.new(hexToRgb(gradient2.value).r, hexToRgb(gradient2.value).g, hexToRgb(gradient2.value).b) || "black";
                const color3 = Color.new(hexToRgb(gradient3.value).r, hexToRgb(gradient3.value).g, hexToRgb(gradient3.value).b) || "black";

                let parsedTitleColor = "rgb(0,0,0)";
                let parsedArtistColor = "rgb(0,0,0)"

                songArtist.style.color = artistColor.value;
                if (songArtist.style.color == "") {
                    songArtist.style.color = "white";
                    parsedArtistColor = "rgb(255,255,255)";
                }
                else {
                    parsedArtistColor = Color.new(hexToRgb(artistColor.value).r, hexToRgb(artistColor.value).g, hexToRgb(artistColor.value).b) || "black";
                }

                songTitle.style.color = titleColor.value;
                if (songTitle.style.color == "") {
                    songTitle.style.color = "white";
                    parsedTitleColor = "rgb(255,255,255)";
                }
                else {
                    parsedTitleColor = Color.new(hexToRgb(titleColor.value).r, hexToRgb(titleColor.value).g, hexToRgb(titleColor.value).b) || "black";
                }

                let obj = Game.actions.createSongData(
                    songTitle.value, songArtist.value,
                    color1, color2, color3,
                    parsedTitleColor,
                    parsedArtistColor,
                    (savedSongs && savedSongs[index]) ? songData.notesData : [],
                    starsBoolean.checked,
                    laneCount.value,
                    instrumentSelect.value,
                    (savedSongs && savedSongs[index]) ? songData.songURL : undefined,
                    (savedSongs && savedSongs[index]) ? songData.properties : {},
                    (savedSongs && savedSongs[index]) ? songData.songId : undefined
                );

                if (importSongBox.value.length > 10) {
                    try {
                        JSON.parse(importSongBox.value)

                        obj = JSON.parse(importSongBox.value);
                    }
                    catch (e) {
                        Game.actions.cleanUp();

                        Effects.displayMessage("Error parsing imported song data.", 5000, 1000);

                        Game.compose();
                        return obj;
                    }
                }


                if (savedSongs && savedSongs[index]) {
                    Game.actions.saveSongData(obj, index);
                }
                else {
                    Game.actions.saveSongData(obj);
                }

                anime({
                    targets: createSongButton,
                    top: "100vh",
                    left: "45vw",
                    easing: globalEasing,
                    duration: duration,
                    opacity: 0
                })

                setTimeout(() => {
                    createSongButton.remove();
                    LoadingScreen.show(duration);
                    setTimeout(() => {
                        Game.actions.cleanUp();
                        LoadingScreen.hide(duration);
                        Game.editor(obj, index);
                    }, duration);
                }, duration);
            }
        }
    },
    editor: (songData, index) => {
        //Cleanup
        Game.currentSongData = songData;
        setTimeout(() => {
            Game.actions.cleanUp();
            animate.fadeOut(document.querySelector("#fallingStars"));
            animate.fadeOut(document.querySelector("#menuParticles"));
        }, 500);
        Game.actions.stopTitleSong();

        const duration = 2000;
        const customGradient = songData.gradient ? { gradient: songData.gradient } : {
            gradient: {
                color1: "rgb(59, 65, 75)",
                color2: "rgb(227 230 238)",
                color3: "rgb(109, 131, 144)",
                color4: "rgb(109, 131, 144)"
            }
        }
        Game.actions.makeGradientPerspective(0, false, customGradient);
        animate.fadeIn(document.querySelector("#vignette"), duration);
        // animate.fadeOut(document.querySelector("#starsBackground"), duration);
        animate.fadeOut(document.querySelector("#celestialObject"), 500);

        let beganComposing = false;

        let audio;

        let data = undefined;
        let file = undefined;
        let item = undefined;

        let deltaMouse = 0;
        let rightMouseDown = false;

        let instrument = new Sound((songData.instrument || "acoustic_grand_piano"), { soundfont: "FluidR3_GM" });

        setTimeout(() => {
            const videoURL = DivHelper.new("35vw", "45vh", "30vw", "7.5vh", "input", duration);
            videoURL.type = "text";
            videoURL.value = songData.songURL || "Enter YouTube video URL.";
            videoURL.setAttribute("class", "composeProperties");
            videoURL.style.borderBottom = "1px white solid";

            const beginButton = DivHelper.new("45vw", "55vh", "10vw", "5vh", "div", duration);
            beginButton.setAttribute("class", "composeProperties");
            beginButton.textContent = "Enter the Editor";
            beginButton.style.whiteSpace = "nowrap";

            beginButton.onclick = onclick;

            function onclick(event) {
                beginButton.onclick = undefined;
                let playerDiv = DivHelper.new();
                playerDiv.style.opacity = "0";
                playerDiv.setAttribute("id", "player");
                let player = new YT.Player('player', {
                    height: '200px',
                    width: '200px',
                    videoId: YouTubeGetID(videoURL.value),
                    playerVars: {
                        'playsinline': 1,
                        origin: window.location.href
                    },
                    events: {
                        'onReady': (event) => {
                            const iFrame = player.getIframe();
                            iFrame.style.bottom = "10vh";
                            iFrame.style.right = "0vw";
                            animate.fadeIn(iFrame, duration * 2);
                            iFrame.style.zIndex = "101";
                            iFrame.style.filter = "drop-shadow(0px 0px 1vw black)"
                            player.playVideo();
                            songData.songURL = YouTubeGetID(videoURL.value);
                        },
                        'onError': (event) => {
                            beginButton.onclick = onclick;
                            const errorVals = {
                                2: "Invalid URL.",
                                5: "This video is not allowed to be played.",
                                100: "Video is possibly private or removed.",
                                101: "This video is not allowed to be played.",
                                150: "This video is not allowed to be played."
                            }
                            videoURL.value = errorVals[event.data];
                            if (beganComposing === true) {
                                if (event.data == 150) {
                                    Effects.displayMessage("Do not play other YouTube videos while playing.", 5000, 1000);
                                }
                                else {
                                    Effects.displayMessage(errorVals[event.data], 5000, 1000);
                                }
                                setTimeout(() => {
                                    Game.gameCanvas.canvas.remove();
                                    Game.actions.playTitleSong(1, true);
                                    Game.gameCanvas = undefined;
                                    Game.gameAudio.destroy();
                                    Game.actions.cleanUp();
                                    Game.menu();
                                }, 4000);
                            }
                            player.destroy();
                        },
                        'onStateChange': (event) => {
                            const stateDestination = {
                                "-1": () => {

                                },
                                0: () => {

                                },
                                1: () => {
                                    if (beganComposing === false) {
                                        videoURL.value = player.getVideoData().title;

                                        beganComposing = true;

                                        Game.gameAudio = player;
                                        audio = player;

                                        player.pauseVideo();
                                        player.seekTo(0);
                                        player.unMute();

                                        // animate.fadeOut(dropper, duration);
                                        animate.fadeOut(videoURL, duration);
                                        animate.fadeOut(beginButton, duration);

                                        setTimeout(() => {
                                            const canvas = new GameCanvas(Game.actions.getLanesInputData(songData.inputCount).toUpperCase(), "0vw", "-5vh", "rgb(255,255,255)", 1, 1, 0, true);
                                            canvas.composing = true;
                                            Game.gameCanvas = canvas;

                                            // $(dropper).remove();
                                            $(videoURL).remove();
                                            $(beginButton).remove();

                                            beginComposing();
                                        }, duration * 1.25);

                                        return;
                                    }

                                    player.playVideo();
                                    Game.gameCanvas.playing = true;
                                },
                                2: () => {
                                    if (beganComposing === false && Game.gameCanvas) {
                                        return;
                                    }
                                    // Game.gameCanvas.playing = false;
                                },
                                3: () => {

                                },
                                4: () => {

                                },
                                5: () => {

                                },
                            }

                            stateDestination[event.data]();
                        }
                    }
                });
            }

            function ondrop(event) {
                event.preventDefault();

                $(dropper).stop();
                $(videoURL).stop();
                $(beginButton).stop();

                animate.fadeOut(dropper, duration);
                animate.fadeOut(videoURL, duration);
                animate.fadeOut(beginButton, duration);

                data = event.dataTransfer;
                file = data.files[0];
                item = data.items[0];

                //Read file
                const fileReader = new FileReader();

                fileReader.onload = function (event) {
                    audio = document.createElement("audio");
                    audio.src = event.target.result;
                    audio.setAttribute("id", "gameMusic");
                    document.body.append(audio);
                    Game.gameAudio = audio;
                }
                fileReader.readAsDataURL(file);
                dropper.textContent = file.name;
                setTimeout(() => {
                    const canvas = new GameCanvas(Game.actions.getLanesInputData(songData.inputCount), "0vw", "-5vh", "rgb(255,255,255)", 1, 1, 0, false);
                    Game.gameCanvas = canvas;
                    Game.gameCanvas.composing = true;
                    $(dropper).remove();
                    $(videoURL).remove();
                    $(beginButton).remove();

                    beginComposing();
                }, duration * 1.25);
            }
        }, duration / 2);

        function beginComposing() {
            //set notes
            Game.gameCanvas.notes = songData.notesData;

            //Load data such as BPM and offset if present
            loadData();

            //Create and handle the piano
            handlePiano();

            //Handle note creation
            noteCreationInput();

            //Handle time position slider
            timePositionInput();

            //Scroll wheel input
            scrollWheelInput();

            //Handle beats detail slider
            beatsDetailInput();

            //Handle pause button
            pauseButtonInput();

            // Toggle snapping notes to grid
            toggleBeatLines();

            //BPM Changer
            changeBPM();

            //Offset setter
            setOffset();

            //set playback rate
            setPlaybackRate();

            //Handle tagged notes
            handleTags();

            //Handle decoration
            showSongData();

            //Handle composing via playing
            getUserInput();

            //snap to other notes
            snapToOtherNotes();

            //Scrolling speed "zoom"
            scrollingSpeedInput();

            //Handles free scrolling wtf duh
            handleFreeScrolling();

            //Save song button
            saveSong();
            saveAndExit();
            exportSong();
            uploadSong();
            exitSong();
        }

        function loadData() {
            if (!songData.properties) {
                songData.properties = {};
            }

            Game.gameCanvas.songBPM = songData.properties.songBPM || 60;
            Game.gameCanvas.songOffset = songData.properties.songOffset || 0;
        }

        function getUserInput() {
            const gameCanvas = Game.gameCanvas;

            const valueSet = Game.inputReach;

            // document.addEventListener("keydown", keyDown);
            // document.addEventListener("keyup", keyUp);
            document.onkeydown = function (event) {
                spaceBarInput(event);
                keyDown(event);
            }
            document.onkeyup = function (event) {
                keyUp(event);
            }

            //Work around for buggy keydown event
            const keyData = [];
            for (let i = 0; i < gameCanvas.lanes.length; ++i) {
                keyData[i] = false;
            }

            function spaceBarInput(event) {
                if (event.code === "Space" && !Game.gameCanvas.lanes.includes(" ")) {
                    Game.gameCanvas.playing = Game.gameCanvas.playing === true ? false : true;
                }
                else if (event.code === "Enter" && Game.gameCanvas.lanes.includes(" ")) {
                    Game.gameCanvas.playing = Game.gameCanvas.playing === true ? false : true;
                }
            }

            function keyDown(event) {
                if (event.repeat) { return }

                const key = event.key;
                const lane = getLane(key);

                if (lane === undefined || keyData[lane]) { return }

                const objLane = gameCanvas.inputData[lane];

                const timePosition = (Game.gameCanvas.targetLine / Game.gameCanvas.scale) - (Game.gameCanvas.timePosition + Game.gameCanvas.heightOffset * 0.8);
                keyData[lane] = timePosition;

                objLane.value = valueSet;
                objLane.lock = true;
            }

            function keyUp(event) {
                if (event.repeat) { return }

                const key = event.key;
                const lane = getLane(key);

                if (lane === undefined) {
                    return;
                }

                let timePositionInitial = keyData[lane];

                let timePositionFinal = (Game.gameCanvas.targetLine / Game.gameCanvas.scale) - (Game.gameCanvas.timePosition + Game.gameCanvas.heightOffset * 0.8);

                const longNoteThreshold = (gameCanvas.noteHeight / Game.scrollingSpeed * 2) * 6;

                if (document.querySelector("#snapToOtherNotesInput").checked) {
                    const threshold = 50;
                    let isEnd = timePositionInitial - timePositionFinal > longNoteThreshold ? true : false;
                    timePositionInitial = snappedTimePosition(timePositionInitial, threshold, isEnd);
                    timePositionFinal = snappedTimePosition(timePositionFinal, threshold, false);
                }

                if (timePositionInitial - timePositionFinal > longNoteThreshold) {
                    Game.gameCanvas.createNote(lane, timePositionFinal, timePositionInitial, false);
                }
                else {
                    Game.gameCanvas.createNote(lane, timePositionInitial, false, false);
                }

                keyData[lane] = false;

                const objLane = gameCanvas.inputData[lane];

                objLane.lock = false;
            }

            function getLane(key) {
                const inputData = gameCanvas.inputData;
                for (let i = 0; i < inputData.length; ++i) {
                    const obj = inputData[i];

                    if (key === obj.key || key === obj.key.toLowerCase()) {
                        return i;
                    }
                }
            }
        }

        function toggleBeatLines() {
            const beatLinesInput = DivHelper.new("1vw", "65vh", "1.5vw", "1.5vw", "input");
            beatLinesInput.type = "checkbox";
            beatLinesInput.setAttribute("class", "editorButtons");

            const beatLinesLabel = DivHelper.new("3vw", "65.5vh", "10vw", "5vh");
            beatLinesLabel.setAttribute("class", "composeButtons");
            beatLinesLabel.textContent = "SNAP TO BEATLINES";
            beatLinesLabel.style.border = "none";
            beatLinesLabel.style.pointerEvents = "none";

            beatLinesInput.checked = true;

            beatLinesInput.onchange = function () {
                const checked = beatLinesInput.checked;

                Game.gameCanvas.snapToBeatLines = checked;
            }
        }

        function snapToOtherNotes() {
            const snapToOtherNotesInput = DivHelper.new("14vw", "65vh", "1.5vw", "1.5vw", "input");
            snapToOtherNotesInput.type = "checkbox";
            snapToOtherNotesInput.setAttribute("class", "editorButtons");
            snapToOtherNotesInput.setAttribute("id", "snapToOtherNotesInput");

            const snapToOtherNotesLabel = DivHelper.new("15vw", "65.5vh", "10vw", "5vh");
            snapToOtherNotesLabel.setAttribute("class", "composeButtons");
            snapToOtherNotesLabel.textContent = "SNAP TO NOTES";
            snapToOtherNotesLabel.style.border = "none";
            snapToOtherNotesLabel.style.pointerEvents = "none";

            snapToOtherNotesInput.checked = false;
        }

        function showSongData() {
            const titleDiv = DivHelper.new("2.5vw", "18vh", "10vw", "10vh");
            const artistDiv = DivHelper.new("2.5vw", "25vh", "10vw", "10vh");

            titleDiv.setAttribute("id", "gameTitleLabel");
            artistDiv.setAttribute("id", "gameArtistLabel");

            titleDiv.textContent = songData.name;
            artistDiv.textContent = songData.artist;

            titleDiv.style.color = songData.textColor.title;
            artistDiv.style.color = songData.textColor.artist;
        }

        function handleFreeScrolling() {
            if (Game.gameCanvas && Game.gameCanvas.composing) {
                window.requestAnimationFrame(handleFreeScrolling);
            }

            if (rightMouseDown) {
                Game.gameCanvas.overrideUpdate = true;
                const deltaY = Mouse.y - deltaMouse;
                deltaMouse = Mouse.y;

                if (deltaY > .1) {
                    Game.gameCanvas.playing = false;
                }

                Game.gameCanvas.timePosition += deltaY / 100;
            }
        }

        function handleTags() {
            if (Game.gameCanvas && Game.gameCanvas.composing) {
                window.requestAnimationFrame(handleTags);
            }
            const gameCanvas = Game.gameCanvas;
            const notes = gameCanvas.notes;

            for (let i = 0; i < notes.length; ++i) {
                const note = notes[i];
                const heightOffset = (Game.gameCanvas.heightOffset / Game.gameCanvas.scale) * 0.8 * Game.gameCanvas.scale;
                const timePosition = (Game.gameCanvas.targetLine / Game.gameCanvas.scale) - (note.timePosition + Game.gameCanvas.timePosition + heightOffset);
                const timePositionEnd = note.timePositionEnd ? (Game.gameCanvas.targetLine / Game.gameCanvas.scale) - (note.timePositionEnd + Game.gameCanvas.timePosition + heightOffset) : false

                if (!note.tagged && timePosition < 0) {
                    const lane = note.lane;
                    Game.gameCanvas.inputData[lane].value = Game.inputReach * Game.gameCanvas.scale;
                    note.tagged = true;
                    if (note.pianoNote) {
                        instrument.play(note.pianoNote);
                    }
                }
                else if (note.tagged && timePosition > 0) {
                    note.tagged = false;
                }
            }
        }

        function handlePiano() {
            const gameCanvas = Game.gameCanvas;
            Game.composePiano = new Piano("0vw", "90vh", "100vw", "10vh", 7);
            const piano = Game.composePiano;

            gameCanvas.selectNote = (note) => {
                piano.show();
                piano.onKeyClick = (key) => {
                    key = key.id;
                    note.pianoNote = key;
                    instrument.play(key);
                }
            }
        }

        function scrollWheelInput() {
            const gameCanvas = Game.gameCanvas;
            const gameAudio = Game.gameAudio;

            document.onwheel = function (event) {
                // const songBPM = gameCanvas.songBPM;
                // const BPMDetail = gameCanvas.BPMDetail;
                // const currentTime = gameAudio.getCurrentTime();

                const deltaY = event.deltaY;
                let indexOffset = 0;

                Game.gameCanvas.updateTimePositionSliderValue();

                //Down
                if (deltaY > 0) {
                    indexOffset = -1;
                }
                //Up
                else {
                    indexOffset = 1;
                }
                if (Game.gameCanvas.isUsingYouTube) {
                    gameAudio.seekTo(gameAudio.getCurrentTime() - deltaY / 100, true)
                }
                else {
                    gameAudio.currentTime = (gameAudio.currentTime - deltaY / 100)
                }
            }
        }

        function timePositionInput() {
            const gameCanvas = Game.gameCanvas;

            const timePositionSlider = DivHelper.new("2.5vw", "35vh", "20vw");
            timePositionSlider.setAttribute("id", "timePositionSlider");
            timePositionSlider.setAttribute("class", "composeSliders");

            const timePositionLabel = DivHelper.new("2.5vw", "32.5vh", "5vw");
            timePositionLabel.setAttribute("class", "editorSliderLabel");
            timePositionLabel.textContent = "TIME POSITION : 0";
            timePositionLabel.setAttribute("id", "timePositionLabel");

            const max = Game.gameCanvas.isUsingYouTube ? audio.getDuration() : audio.duration;

            $("#timePositionSlider").slider({
                animate: true,
                max: max,
                min: 0,
                start: function (event, ui) {
                    gameCanvas.playing = false;
                },
                stop: function (event, ui) {
                    timePositionLabel.textContent = "TIME POSITION : " + ui.value;
                    gameCanvas.timePosition = ui.value;
                    if (gameCanvas.isUsingYouTube) {
                        Game.gameAudio.seekTo(ui.value);
                    }
                    else {
                        Game.gameAudio.currentTime = ui.value;
                    }
                    // gameCanvas.playing = true;
                },
                slide: function (event, ui) {
                    timePositionLabel.textContent = "TIME POSITION : " + ui.value;
                    gameCanvas.timePosition = ui.value;
                    if (gameCanvas.isUsingYouTube) {
                        Game.gameAudio.seekTo(ui.value);
                    }
                    else {
                        Game.gameAudio.currentTime = ui.value;
                    }
                }
            });
        }

        function scrollingSpeedInput() {
            const scrollingSpeedSlider = DivHelper.new("2.5vw", "50vh", "20vw");
            scrollingSpeedSlider.setAttribute("id", "scrollingSpeedSlider");
            scrollingSpeedSlider.setAttribute("class", "composeSliders");

            const scrollingSpeedLabel = DivHelper.new("2.5vw", "47.5vh", "5vw");
            scrollingSpeedLabel.setAttribute("class", "editorSliderLabel");
            scrollingSpeedLabel.textContent = "SCROLLING SPEED : " + Game.scrollingSpeed / 1000;

            $("#scrollingSpeedSlider").slider({
                animate: true,
                max: 1000,
                min: 100,
                value: Game.scrollingSpeed,
                stop: (event, ui) => {
                    scrollingSpeedLabel.textContent = "SCROLLING SPEED : " + ui.value / 1000;
                    localStorage.setItem("scrollingSpeed", ui.value / 1000);
                }
            });
        }

        function beatsDetailInput() {
            const gameCanvas = Game.gameCanvas;

            const beatsDetailSlider = DivHelper.new("2.5vw", "45vh", "20vw");
            beatsDetailSlider.setAttribute("id", "beatsDetailSlider");
            beatsDetailSlider.setAttribute("class", "composeSliders");

            const beatsDetailLabel = DivHelper.new("2.5vw", "42.5vh", "5vw");
            beatsDetailLabel.setAttribute("class", "editorSliderLabel");
            beatsDetailLabel.textContent = "BEATLINES DETAIL : 1";

            $("#beatsDetailSlider").slider({
                animate: true,
                max: 32,
                min: 1,
                stop: (event, ui) => {
                    beatsDetailLabel.textContent = "BEATLINES DETAIL : " + ui.value;
                    gameCanvas.BPMDetail = ui.value;
                }
            });
        }

        function saveSong() {
            const saveSongButton = DivHelper.new("80vw", "15vh", "20vw", "5vh", "div");
            saveSongButton.textContent = "SAVE SONG";
            saveSongButton.setAttribute("class", "editorOptions");
            saveSongButton.style.opacity = ".25";

            saveSongButton.onmouseenter = () => {
                animate.fadeIn(saveSongButton, duration / 6);
            }
            saveSongButton.onmouseleave = () => {
                animate.setOpacity(saveSongButton, .25, duration / 6);
            }
            saveSongButton.onclick = () => {
                saveToData();
            }
        }

        function saveAndExit() {
            const saveAndExitButton = DivHelper.new("80vw", "10vh", "20vw", "5vh", "div");
            saveAndExitButton.textContent = "SAVE AND EXIT";
            saveAndExitButton.setAttribute("class", "editorOptions");
            saveAndExitButton.style.opacity = ".25";

            saveAndExitButton.onmouseenter = () => {
                animate.fadeIn(saveAndExitButton, duration / 6);
            }
            saveAndExitButton.onmouseleave = () => {
                animate.setOpacity(saveAndExitButton, .25, duration / 6);
            }
            saveAndExitButton.onclick = () => {
                saveToData();
                LoadingScreen.show(1000);
                setTimeout(() => {
                    handleExit();
                    Game.actions.cleanUp();
                    LoadingScreen.hide(1000);
                    Game.menu();
                }, 1000);
            }
        }

        function saveToData() {
            songData.properties.songBPM = Game.gameCanvas.songBPM;
            songData.properties.songOffset = Game.gameCanvas.songOffset;
            songData.notesData = Game.gameCanvas.notes;
            Game.actions.saveSongData(songData, index);
        }

        function exitSong() {
            const exitButton = DivHelper.new("80vw", "30vh", "20vw", "5vh", "div");
            exitButton.textContent = "EXIT";
            exitButton.setAttribute("class", "editorOptions");
            exitButton.style.opacity = ".25";

            exitButton.onmouseenter = () => {
                animate.fadeIn(exitButton, duration / 6);
            }
            exitButton.onmouseleave = () => {
                animate.setOpacity(exitButton, .25, duration / 6);
            }
            exitButton.onclick = () => {
                LoadingScreen.show(1000);
                setTimeout(() => {
                    handleExit();
                    Game.actions.cleanUp();
                    LoadingScreen.hide(1000);
                    Game.menu();
                }, 1000);
            }
        }

        function handleExit() {
            Game.gameCanvas.playing = false;
            Game.gameCanvas.notes = undefined;
            Game.gameCanvas.canvas.remove();
            Game.gameCanvas.canvas = undefined;
            Game.gameCanvas = undefined;
            Game.gameAudio.destroy();
            document.onkeydown = undefined;
            document.onkeyup = undefined;
            Game.actions.playTitleSong(1, true);
        }
        let lastUpload = Date.now();
        function uploadSong() {
            const uploadButton = DivHelper.new("80vw", "25vh", "20vw", "5vh", "div");
            uploadButton.textContent = songData.songId ? "UPDATE SONG" : "UPLOAD SONG";
            uploadButton.setAttribute("class", "editorOptions");
            uploadButton.style.opacity = ".25";

            uploadButton.onmouseenter = () => {
                animate.fadeIn(uploadButton, duration / 6);
            }
            uploadButton.onmouseleave = () => {
                animate.setOpacity(uploadButton, .25, duration / 6);
            }
            uploadButton.onclick = async () => {
                const token = localStorage.getItem("token");
                const userId = localStorage.getItem("userId");

                if (!token || !userId) {
                    Effects.displayMessage("Please log in or create an account!", 5000, 1000);
                }

                const uploadFrequency = 10000;

                if (Date.now() - lastUpload < 10000) {
                    Effects.displayMessage("Slow down upload frequency!", 5000, 1000);
                    return;
                }
                lastUpload = Date.now();

                const difficulty = Game.actions.getDifficulty(songData);
                const maxScore = Game.actions.getMaxScore(songData);

                Game.actions.compressNotes(songData);

                const apiURL = songData.songId ? "/api/updateSong" : "/api/createSong";
                const httpMethod = songData.songId ? "put" : "post";

                await fetch(apiURL, {
                    method: httpMethod,
                    headers: {
                        "Content-Type": "application/json",
                        "Accepts": "application/json"
                    },
                    body: JSON.stringify({
                        token: token,
                        userId: userId,
                        songData: songData,
                        difficulty: difficulty,
                        maxScore: maxScore,
                        songId: songData.songId
                    })
                })
                    .then(response => response.json())
                    .then((data) => {
                        if (data.error) {
                            Effects.displayMessage(data.error, 5000, 1000);
                            Game.actions.uncompressNotes(songData);
                            return;
                        }

                        Effects.displayMessage("Published song!", 5000, 1000);
                        Game.actions.uncompressNotes(songData);

                        uploadButton.textContent = "UPDATE SONG";
                        if (!songData.songId) {
                            songData.songId = data.songId;
                        }

                        saveToData();
                    })

            }
        }

        function exportSong() {
            const exportSongButton = DivHelper.new("80vw", "20vh", "20vw", "5vh", "div");
            exportSongButton.textContent = "EXPORT SONG";
            exportSongButton.setAttribute("class", "editorOptions");
            exportSongButton.style.opacity = ".25";

            exportSongButton.onmouseenter = () => {
                animate.fadeIn(exportSongButton, duration / 6);
            }
            exportSongButton.onmouseleave = () => {
                animate.setOpacity(exportSongButton, .25, duration / 6);
            }
            exportSongButton.onclick = () => {
                songData.notesData = Game.gameCanvas.notes;
                const jsonArray = JSON.stringify(songData);
                navigator.clipboard.writeText(jsonArray);
                Effects.displayMessage("Copied Song Data. Share it on the Discord!", 5000, 1000);
            }
        }

        function changeBPM() {
            const button = DivHelper.new("2.5vw", "60vh", "10vw", "5vh");
            button.setAttribute("class", "composeButtons");
            button.textContent = "BEATS PER MINUTE";
            button.style.borderBottom = "none";

            const textBox = DivHelper.new("2.5vw", "55vh", "10vw", "4vh", "input");
            textBox.setAttribute("class", "composeButtons");
            textBox.type = "number";
            textBox.min = 1;
            textBox.max = 1000;
            textBox.step = 1;
            textBox.value = Game.gameCanvas.songBPM;

            textBox.onchange = () => {
                const BPM = textBox.value;
                Game.gameCanvas.songBPM = BPM;
            }

            // button.onclick = function () {
            //     const BPM = textBox.value;
            //     const type = Number(BPM);
            //     if (isNaN(type) || type <= 0) {
            //         textBox.value = "NOT VALID!";
            //         return;
            //     }
            //     Game.gameCanvas.songBPM = BPM;
            // }
        }

        function setOffset() {
            const button = DivHelper.new("15vw", "60vh", "7.5vw", "5vh");
            button.setAttribute("class", "composeButtons");
            button.textContent = "TIME OFFSET";
            button.style.borderBottom = "none";

            const textBox = DivHelper.new("15vw", "55vh", "7.5vw", "4vh", "input");
            textBox.setAttribute("class", "composeButtons");
            textBox.type = "number";
            textBox.value = Game.gameCanvas.songOffset;

            textBox.onchange = () => {
                const timeOffset = textBox.value;
                Game.gameCanvas.songOffset = timeOffset;
            }

            // button.onclick = function () {
            //     const offset = textBox.value;
            //     const type = Number(offset);
            //     if (isNaN(type)) {
            //         textBox.value = "NOT VALID!";
            //         return;
            //     }
            //     Game.gameCanvas.songOffset = offset;
            // }
        }

        function setPlaybackRate() {
            const gameCanvas = Game.gameCanvas;

            const playbackRateSlider = DivHelper.new("2.5vw", "40vh", "20vw");
            playbackRateSlider.setAttribute("id", "playbackRateSlider");
            playbackRateSlider.setAttribute("class", "composeSliders");

            const playbackRateLabel = DivHelper.new("2.5vw", "37.5vh", "5vw");
            playbackRateLabel.setAttribute("class", "editorSliderLabel");
            playbackRateLabel.textContent = "PLAYBACK RATE : 1";

            $("#playbackRateSlider").slider({
                animate: true,
                max: 10,
                min: 3,
                value: 10,
                stop: (event, ui) => {
                    playbackRateLabel.textContent = "PLAYBACK RATE : " + ui.value / 10;
                    if (gameCanvas.isUsingYouTube) {
                        Game.gameAudio.setPlaybackRate(ui.value / 10);
                    }
                    else {
                        Game.gameAudio.playbackRate = ui.value / 10;
                    }
                }
            });
        }

        function pauseButtonInput() {

        }

        function noteCreationInput() {
            let downTimePosition = 0;
            let upTimePosition = 0;
            const longNoteThreshold = 10; //if upTimePosition - downTimePosition is greater than this, it is a long note

            const gameCanvas = Game.gameCanvas;

            gameCanvas.canvas.onmousedown = function (event) {
                //hide piano
                Game.composePiano.hide();
                const offsetY = event.offsetY;

                //New way to avoid gameSpeed
                const heightOffset = -gameCanvas.heightOffset * .8;
                downTimePosition = (offsetY - gameCanvas.timePosition * Game.scrollingSpeed - gameCanvas.targetLine / gameCanvas.scale) / (Game.scrollingSpeed) + gameCanvas.targetLine / gameCanvas.scale + heightOffset;

                deltaMouse = Mouse.y;
                if (event.which == 3) {
                    rightMouseDown = true;
                }
                else {
                    rightMouseDown = false;
                }
            }
            gameCanvas.canvas.onmouseup = function (event) {
                rightMouseDown = false;
                if (Game.gameCanvas.timePosition - Game.gameAudio.getCurrentTime() > 0.15) {
                    Game.gameAudio.seekTo(Game.gameCanvas.timePosition);
                    Game.gameCanvas.overrideUpdate = false;
                }

                const offsetX = event.offsetX;
                const offsetY = event.offsetY;

                const heightOffset = -gameCanvas.heightOffset * .8;

                upTimePosition = (offsetY - gameCanvas.timePosition * Game.scrollingSpeed - gameCanvas.targetLine / gameCanvas.scale) / (Game.scrollingSpeed) + gameCanvas.targetLine / gameCanvas.scale + heightOffset;

                const lane = determineLane(offsetX * gameCanvas.scale);
                if (lane === undefined) {
                    return;
                }
                let timePosition = downTimePosition;

                let timePositionEnd = upTimePosition - downTimePosition > gameCanvas.noteHeight / Game.scrollingSpeed * 2 ? upTimePosition : false;

                const noteHit = gameCanvas.noteHit(timePosition, lane);

                if (event.which !== 3) { //If mouseup isnt right click
                    if (noteHit) {
                        gameCanvas.selectNote(gameCanvas.notes[noteHit]);
                        return;
                    }

                    if (document.querySelector("#snapToOtherNotesInput").checked) {
                        const threshold = 50;
                        let isEnd = timePosition - timePositionEnd > gameCanvas.noteHeight / Game.scrollingSpeed * 2 ? true : false;
                        timePosition = snappedTimePosition(timePosition, threshold, false);
                        timePositionEnd = snappedTimePosition(timePositionEnd, threshold, isEnd);
                    }

                    gameCanvas.createNote(lane, timePosition, timePositionEnd);
                    return;
                }

                if (noteHit !== false) {
                    gameCanvas.removeNote(noteHit);
                }
            }
        }

        function determineLane(xPosition) {
            const gameCanvas = Game.gameCanvas;
            const laneCount = gameCanvas.laneCount;

            for (let i = 0; i < laneCount; ++i) {
                // const lanePosition1 = (gameCanvas.width / 2 - laneCount / 2 * gameCanvas.laneSpace + (i * gameCanvas.laneSpace));
                // const lanePosition2 = (gameCanvas.width / 2 - laneCount / 2 * gameCanvas.laneSpace + ((i + 1) * gameCanvas.laneSpace));
                const lanePosition1 = gameCanvas.lanesArray[i];
                const lanePosition2 = gameCanvas.lanesArray[i + 1];

                if (xPosition > lanePosition1 && xPosition < lanePosition2) {
                    return i;
                }
            }
            return undefined;
        }

        function snappedTimePosition(timePosition, threshold, isEnd) { //Snaps notes to parallel notes
            if (!timePosition) {
                return;
            }

            const gameCanvas = Game.gameCanvas;
            const notes = gameCanvas.notes;
            for (let i = 0; i < notes.length; ++i) {
                const newTp = isEnd ? notes[i].timePositionEnd : notes[i].timePosition;
                if (Math.abs(newTp - timePosition) < threshold / Game.scrollingSpeed) {
                    return newTp;
                }
            }
            return timePosition;
        }
    },
    songs: () => {
        let focus = 0;
        const data = [
            {
                left: "10vw",
                top: "30vh",
                width: "15vw",
                height: "30vh",
                opacity: .5
            },
            {
                left: "40vw",
                top: "30vh",
                width: "20vw",
                height: "50vh",
                opacity: 1
            },
            {
                left: "75vw",
                top: "30vh",
                width: "15vw",
                height: "30vh",
                opacity: .5
            }
        ]

        const duration = 1000;

        const baseSongs = DivHelper.new("40vw", "30vh", "20vw", "50vh", "img");
        baseSongs.src = Game.baseImages.baseSongs.src;

        const customSongs = DivHelper.new("75vw", "30vh", "15vw", "30vh", "img");
        customSongs.src = Game.baseImages.customSongs.src;

        baseSongs.setAttribute("id", "baseSongsGroups");
        customSongs.setAttribute("id", "customSongs");
        customSongs.setAttribute("class", "songsType");
        baseSongs.setAttribute("class", "songsType");

        customSongs.style.opacity = "0";
        baseSongs.style.opacity = "0";

        const elements = [baseSongs, customSongs];

        baseSongs.onmousedown = onmousedown;
        customSongs.onmousedown = onmousedown;

        update();

        BackButton.show(Game.menu, true, 1000, true, 1000, true);

        function update() {
            for (let i = 0; i < elements.length; ++i) {
                const index = i - focus + 1;
                const object = data[index];
                const element = elements[i];
                $(element).stop();

                $(element).animate({
                    left: object.left,
                    top: object.top,
                    width: object.width,
                    height: object.height,
                    opacity: object.opacity
                }, {
                    duration: duration
                })
            }
        }
        function onmousedown(event) {
            const element = event.target;
            const index = findInArray(element, elements);
            if (focus == index) { //TEMP
                baseSongs.onmousedown = undefined;
                customSongs.onmousedown = undefined;

                // animate.fadeOut(baseSongs,duration);
                // animate.fadeOut(customSongs,duration);
                for (let i = 0; i < elements.length; ++i) {
                    const elementB = elements[i];
                    $(elementB).stop();

                    if (elementB == element) {

                        $(element).animate({
                            top: "35vh",
                            opacity: 0
                        }, {
                            duration: duration
                        })
                    }
                    else {
                        animate.fadeOut(elementB, duration);
                    }
                }

                const id = element.getAttribute("id");

                //So u dont have to wait for baseSongs + customSongs to finish
                setTimeout(() => {
                    Game[id]();
                }, 0);
                setTimeout(() => {
                    $(baseSongs).remove();
                    $(customSongs).remove();
                }, duration)

                if (id == "customSongs") {
                    Effects.notify("Click here to join the Discord to get songs!", 5000, "https://discord.gg/2qDtjt6xJV");
                }
                return;
            }
            focus = index;
            update();
        }
    },
    customSongs: async () => {
        const songsList = new SongsList();

        const mostPlayedButton = DivHelper.new("85vw", "5vh", "20vw", "5vh", "div");
        mostPlayedButton.textContent = "MOST PLAYED";
        mostPlayedButton.setAttribute("class", "customSongsSortBy");

        const mostRecentButton = DivHelper.new("85vw", "10vh", "20vw", "5vh", "div");
        mostRecentButton.textContent = "MOST RECENT";
        mostRecentButton.setAttribute("class", "customSongsSortBy");

        const exitButton = DivHelper.new("82.5vw", "15vh", "20vw", "5vh", "div");
        exitButton.textContent = "EXIT TO MENU";
        exitButton.setAttribute("class", "customSongsSortBy");

        const searchButton = DivHelper.new("65vw", "0vh", "40vw", "5vh", "div");
        searchButton.textContent = "SEARCH :";
        searchButton.setAttribute("class", "customSongsSortBy");

        const searchBox = DivHelper.new("10vw", "0vh", "25vw", "4vh", "input");
        searchButton.append(searchBox);
        searchBox.setAttribute("id", "searchBox");
        searchBox.placeholder = "Enter a Title, Artist, Creator, or Difficulty";

        const buttons = [mostPlayedButton, mostRecentButton, searchButton];

        mostPlayedButton.style.opacity = "0";
        mostRecentButton.style.opacity = "0";
        searchButton.style.opacity = "0";
        exitButton.style.opacity = "0";

        mostPlayedButton.onclick = onclick;
        mostRecentButton.onclick = onclick;
        searchButton.onclick = onclick;

        animate.setOpacity(exitButton, .5, 1000);
        exitButton.onclick = () => {
            Game.actions.tweenUp(1000, []);

            Game.menu(false, true);
        }

        const scoreBar = new ValueBar("60vw", "60vh", "40vw", "2vh", 0, "rgba(255,255,255,.75)");
        const comboBar = new ValueBar("60vw", "75vh", "40vw", "2vh", 0, "rgba(255,255,255,.75)");

        scoreBar.reversed = true;
        comboBar.reversed = true;

        scoreBar.element.style.border = "none";
        comboBar.element.style.border = "none";

        const scoreLabel = DivHelper.new("60vw", "65vh", "40vw", "2vh");
        const comboLabel = DivHelper.new("60vw", "80vh", "40vw", "2vh");

        scoreLabel.setAttribute("class", "composeLabels");
        comboLabel.setAttribute("class", "composeLabels");

        scoreLabel.textContent = "SCORE : 100%";
        comboLabel.textContent = "MAX SCORE : 100%";

        const difficultyLabel = DivHelper.new("60vw", "62.5vh", "40vw", "2vh");

        difficultyLabel.textContent = "EASY LEVEL 1";
        difficultyLabel.setAttribute("class", "composeLabels");
        difficultyLabel.style.textAlign = "right";
        difficultyLabel.style.fontSize = "2.5vw";

        // const artistLabel = DivHelper.new("60vw", "53vh", "40vw", "2vh");
        // artistLabel.setAttribute("class", "composeLabels");
        // artistLabel.style.textAlign = "right";
        // artistLabel.style.fontSize = "2.5vw";
        // artistLabel.textContent = "Saint Slime";

        // artistLabel.style.opacity = "1";

        const playCountLabel = DivHelper.new("58vw", "34vh", "40vw", "2vh");
        playCountLabel.setAttribute("class", "composeLabels");
        playCountLabel.style.textAlign = "right";
        playCountLabel.style.fontSize = "1.5vw";
        playCountLabel.textContent = "153 plays";

        playCountLabel.style.opacity = "0";

        const mapperLabel = DivHelper.new("60vw", "25vh", "40vw", "2vh");
        mapperLabel.setAttribute("class", "composeLabels");
        mapperLabel.style.textAlign = "right";
        mapperLabel.style.fontSize = "3vw";
        mapperLabel.textContent = "lunarbeats";

        mapperLabel.style.opacity = "0";

        const thumbnail = DivHelper.new("60vw", "25vh", "40vw", "35vh", "img");
        thumbnail.setAttribute("id", "thumbnail");
        thumbnail.style.opacity = "0";

        const loadingLabel = DivHelper.new("0vw", "40vh", "100vw", "10vh", "div")
        loadingLabel.textContent = "PLEASE WAIT...";
        loadingLabel.setAttribute("class", "composeLabels");
        loadingLabel.style.textAlign = "center";
        loadingLabel.style.fontSize = "2.5vw";
        loadingLabel.style.opacity = "0";

        scoreBar.element.style.opacity = "0";
        comboBar.element.style.opacity = "0";
        scoreBar.element.style.zIndex = "11";
        comboBar.element.style.zIndex = "11";

        scoreLabel.style.opacity = "0";
        comboLabel.style.opacity = "0";
        difficultyLabel.style.opacity = "0";

        const playButton = createPlayButton("0vw", "0vh", .5);

        songsList.onclick = onSongsClick;
        playButton.onclick = onPlayButtonClick;

        mostPlayed();

        async function mostPlayed() {
            updateButtonsPosition(mostPlayedButton);
            songsList.removeAllSongs();

            animate.fadeIn(loadingLabel, 500);
            const mostPlayedSongs = await getMostPlayedSongs();
            songsList.removeAllSongs();
            animate.fadeOut(loadingLabel, 500);

            if (!mostPlayedSongs) {
                return;
            }

            addSongs(mostPlayedSongs);
        }

        async function mostRecent() {
            updateButtonsPosition(mostRecentButton);
            songsList.removeAllSongs();

            animate.fadeIn(loadingLabel, 500);
            const mostRecent = await getRecentSongs();
            songsList.removeAllSongs();
            animate.fadeOut(loadingLabel, 500);

            if (!mostRecent) {
                return;
            }

            addSongs(mostRecent);
        }

        async function getSearchedSong() {
            updateButtonsPosition(searchButton);
            songsList.removeAllSongs();

            const searchQuery = searchBox.value;

            animate.fadeIn(loadingLabel, 500);
            const searchedSong = await searchSong(searchQuery);
            songsList.removeAllSongs();
            animate.fadeOut(loadingLabel, 500);

            if (!searchedSong) {
                return;
            }

            addSongs(searchedSong);
        }

        async function searchSong(searchQuery) {
            let searchedSongs = await fetch("/api/searchSongs", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    "Accepts": "application/json"
                },
                body: JSON.stringify({
                    searchQuery: searchQuery
                })
            })

            searchedSongs = await searchedSongs.json();

            return searchedSongs;
        }

        async function getRecentSongs() {
            let recentSongs = await fetch("/api/getRecentSongs", {
                method: "get",
                headers: {
                    "Content-Type": "application/json",
                    "Accepts": "application/json"
                }
            })

            recentSongs = await recentSongs.json();

            return recentSongs;
        }

        async function getMostPlayedSongs() {
            let mostPlayedSongs = await fetch("/api/getMostPlayedSongs", {
                method: "get",
                headers: {
                    "Content-Type": "application/json",
                    "Accepts": "application/json"
                }
            })

            mostPlayedSongs = await mostPlayedSongs.json();

            return mostPlayedSongs;
        }

        async function onPlayButtonClick(e) {
            e.stopPropagation();
            const selectedSong = songsList.selectedSong;

            const songData = songsList.songs[selectedSong].songData;

            const songId = songData.songId;

            fetch("/api/loadSongData", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    "Accepts": "application/json"
                },
                body: JSON.stringify({
                    songId: songId,
                })
            })
                .then(response => response.json())
                .then((data) => {
                    if (data.error) {
                        Effects.displayMessage(data.error, 5000, 1000);
                        return;
                    }

                    const playData = (data);

                    Game.actions.tweenUp(500, []);
                    animate.fadeOut(document.getElementById("celestialObject"), 1000);
                    animate.fadeOut(document.getElementById("fallingStars"), 1000);

                    const g = playData.gradient;

                    const newColor = String("linear-gradient(0deg," + g.color1 + "0%," + g.color2 + "50%," + g.color3 + "100%," + g.color4 + " 110%)")

                    Game.actions.changeGradient(newColor, 500);

                    Game.actions.uncompressNotes(playData);

                    setTimeout(() => {
                        Game.play(playData, false, false, songId, () => {
                            Game.menu(false, false, true);
                            Game.actions.cleanUp();
                            Game.customSongs();
                        })
                    }, 500);
                })
        }

        function onSongsClick(e) {
            if (songsList.selectedSong == undefined) {
                hideStatistics();
                return;
            }

            const songData = songsList.songs[songsList.selectedSong].songData;

            updateStatistics(songData);
        }

        function updateStatistics(songData) {
            const songId = songData.songId;
            const username = songData.username;
            const plays = songData.plays;
            const artist = songData.artist;
            const songURL = songData.songURL;
            const maxScore = songData.maxScore;
            const difficulty = songData.difficulty;

            let score = localStorage.getItem("songIdGPA" + songId) || 0;
            let combo = localStorage.getItem("songIdCombo" + songId) || 0;

            score = Math.floor(score * 100) / 100;

            const scoreValue = Math.floor(score * 100 / 4);
            const comboValue = Math.floor(combo / maxScore * 100);

            scoreLabel.textContent = `GPA : ${score} (${scoreValue})%`
            comboLabel.textContent = `MAX COMBO : ${combo} (${comboValue})%`

            scoreBar.updateValue(scoreValue / 100);
            comboBar.updateValue(comboValue / 100);

            difficultyLabel.textContent = difficulty;

            thumbnail.src = `https://img.youtube.com/vi/${songURL}/sddefault.jpg`;
            thumbnail.onload = () => {
                animate.setOpacity(thumbnail, .5, 500);
            }
            mapperLabel.textContent = "「 " + username + " 」";
            playCountLabel.textContent = plays + " PLAYS";

            showStatisics(score, combo);
        }

        function showPlayButton() {
            const selectedElement = songsList.songs[songsList.selectedSong].songDiv;

            const translateX = songsList.divWidth;

            playButton.style.transform = "translateY(-5vh) translateX(" + translateX + ") scale(.5)";

            selectedElement.append(playButton);

            animate.fadeIn(playButton, 500);
        }

        function hidePlayButton() {
            animate.fadeOut(playButton, 500);
        }

        function showStatisics(score, combo) {
            showPlayButton();
            animate.fadeIn(playCountLabel, 500);
            animate.fadeIn(mapperLabel, 500);
            animate.fadeIn(scoreBar.element, 1000 / 2);
            animate.fadeIn(comboBar.element, 1000 / 2);
            animate.setOpacity(scoreLabel, 1, 1000 / 2);
            animate.setOpacity(comboLabel, 1, 1000 / 2);
            animate.setOpacity(difficultyLabel, 1, 1000 / 2);
        }

        function hideStatistics() {
            hidePlayButton();
            animate.fadeOut(playCountLabel, 500);
            animate.fadeOut(mapperLabel, 500);
            animate.setOpacity(thumbnail, 0, 500);
            animate.fadeOut(scoreBar.element, 1000 / 2);
            animate.fadeOut(comboBar.element, 1000 / 2);
            animate.fadeOut(scoreLabel, 1000 / 2);
            animate.fadeOut(comboLabel, 1000 / 2);
            animate.fadeOut(difficultyLabel, 1000 / 2);
        }

        function createPlayButton(left, top, scale) {
            const playButton = DivHelper.new(left, top, "10vw", "10vw");
            playButton.setAttribute("id", "playSongButton");
            playButton.textContent = "♫";

            playButton.style.opacity = "0";
            playButton.style.transform = `scale(${scale})`;

            return playButton;
        }

        function onclick(e) {
            const element = e.target;

            switch (element) {
                case mostPlayedButton:
                    mostPlayed();
                    break;
                case mostRecentButton:
                    mostRecent();
                    break;
                case searchButton:
                    getSearchedSong();
                    break;
            }
        }

        function addSongs(data) {
            for (let i = 0; i < data.length; ++i) {
                const song = data[i];
                songsList.addSong(song);
            }

            for (let i = 0; i < songsList.songs.length; ++i) {
                const song = songsList.songs[i];

                const element = song.songDiv;
                const artist = song.songData.artist;
                const title = song.songData.name;

                element.textContent = title + " // " + artist;
            }
        }

        function updateButtonsPosition(focus) {
            hideStatistics();
            for (let i = 0; i < buttons.length; ++i) {
                const button = buttons[i];

                if (button == focus) {
                    anime({
                        targets: button,
                        duration: 500,
                        easing: globalEasing,
                        translateX: "-5vw",
                        opacity: 1
                    })
                }
                else {
                    anime({
                        targets: button,
                        duration: 500,
                        easing: globalEasing,
                        translateX: "-2.5vw",
                        opacity: .5
                    })
                }
            }
        }
    },
    baseSongsGroups: () => {
        const duration = 1000;
        const songGroups = Game.songGroups;
        const particles = document.querySelector("#menuParticles").object;
        BackButton.show(Game.menu, true, 1000, true, 1000, true);
        const iconData = [
            { //Invisible left (0)
                translateX: "-20vw",
                translateY: "45vh",
                width: "20vw",
                height: "20vw",
                opacity: "0",
                blur: 0,
                scale: .5,
                perspective: "10vw",
                rotateY: "45deg"
            },
            { //Left (1)
                translateX: "5vw",
                translateY: "30vh",
                width: "20vw",
                height: "20vw",
                opacity: ".25",
                blur: 5,
                scale: .7,
                perspective: "10vw",
                rotateY: "15deg"
            },
            { //Selected (2)
                translateX: "40vw",
                translateY: "20vh",
                width: "20vw",
                height: "20vw",
                opacity: "1",
                blur: 0,
                scale: 1,
                perspective: "10vw",
                rotateY: "0deg"
            },
            { //Right (3)
                translateX: "75vw",
                translateY: "30vh",
                width: "20vw",
                height: "20vw",
                opacity: ".25",
                blur: 5,
                scale: .7,
                perspective: "10vw",
                rotateY: "-15deg"
            },
            { //Invisible Right (4)
                translateX: "100vw",
                translateY: "45vh",
                width: "20vw",
                height: "20vw",
                opacity: "0",
                blur: 0,
                scale: .5,
                perspective: "10vw",
                rotateY: "-45deg"
            }
        ]

        const groupName = DivHelper.new("0vw", "75vh", "100vw", "10vh");
        groupName.style.opacity = "0";
        groupName.setAttribute("id", "groupName");

        const ripple = DivHelper.new("40vw", "85vh", "20vw", "10vh", "img");
        ripple.src = Game.baseImages.ripple.src;
        ripple.style.opacity = "0";
        ripple.style.zIndex = "10";

        const completionBar = new ValueBar("40vw", "66.5vh", "20vw", "2vh", 0, "rgba(255,255,255,.75)"); //86vh
        completionBar.color2 = "rgba(255,255,255,.25)"
        completionBar.element.style.border = "none";
        completionBar.element.style.opacity = "0";

        const completionLabel = DivHelper.new("40vw", "70vh", "20vw", "10vh");
        completionLabel.style.opacity = "0";
        completionLabel.setAttribute("id", "completionGroupsLabel");
        completionLabel.style.fontSize = "1.5vw"

        animate.fadeIn(completionBar.element, duration);
        animate.setOpacity(ripple, .25, duration);

        let selectedIndex = 0;

        initIcons();
        updateDisplay();

        function updateDisplay() {
            updateGroupCompletion();
            animate.fadeOut(groupName, duration / 2);
            animate.fadeOut(completionLabel, duration / 2);
            setTimeout(() => {
                groupName.textContent = songGroups[selectedIndex][0];
                animate.fadeIn(groupName, duration / 2);
            }, duration / 2);
            for (let i = 0; i < songGroups.length; ++i) {
                const groupArray = songGroups[i];
                const groupName = groupArray[0];
                const icon = groupArray[3];

                const iconIndex = clamp(i - selectedIndex + 2, 0, 4);
                const iconDataIndex = iconData[iconIndex];

                anime({
                    targets: icon,
                    translateX: iconDataIndex.translateX,
                    translateY: iconDataIndex.translateY,
                    rotateY: iconDataIndex.rotateY,
                    scale: iconDataIndex.scale,
                    opacity: iconDataIndex.opacity,
                    blur: iconDataIndex.blur,
                    duration: duration,
                    easing: globalEasing,
                    update: function () {
                        icon.style.filter = "blur(" + icon.blur + "px)" + "drop-shadow(7px 7px 7px rgba(0,0,0,.5))";
                    },
                    complete: function () {
                        icon.style.filter = "blur(" + iconDataIndex.blur + "px)" + "drop-shadow(7px 7px 7px rgba(0,0,0,.5))";
                    }
                })
            }
        }
        function initIcons() {
            for (let i = 0; i < songGroups.length; ++i) {
                const groupArray = songGroups[i];
                const icon = groupArray[3];

                const iconIndex = clamp(i - selectedIndex + 2, 0, 4);
                const iconDataIndex = iconData[iconIndex];

                icon.style.transform = `translateX(${iconDataIndex.translateX}) translateY(${iconDataIndex.translateY}) scale(${iconDataIndex.scale}) perspective(${iconDataIndex.perspective}) rotateY(${iconDataIndex.rotateY})`; //iconDataIndex.rotateY
                icon.style.width = iconDataIndex.width;
                icon.style.height = iconDataIndex.height;
                icon.style.opacity = "0";

                icon.i = i;

                document.body.append(icon);
                icon.setAttribute("class", "baseGroupIcon");
                icon.onmousedown = onmousedown;
            }
        }
        function onmousedown(event) {
            const iconIndex = event.target.i;
            const deltaSelectedIndex = iconIndex - selectedIndex;
            if (deltaSelectedIndex == 0) {
                //begin basesongs
                const min = songGroups[iconIndex][1];
                const max = songGroups[iconIndex][2] + 1; //bc update display isn't inclusive and i dont want to change it

                Game.baseSongsMin = min;
                Game.baseSongsMax = max;

                // animate.fadeOut(groupName, duration);
                // animate.fadeOut(completionBar.element, duration / 2);
                // animate.fadeOut(completionLabel, duration / 2);
                // animate.fadeOut(Game.actions.getBackButton(), duration / 2);
                animate.fadeOut(document.querySelector("#fallingStars"), duration);

                for (let i = 0; i < songGroups.length; ++i) {
                    const groupArray = songGroups[i];
                    const icon = groupArray[3];
                    icon.onmousedown = undefined;

                    if (i == iconIndex) {
                        anime({
                            targets: icon,
                            easing: globalEasing,
                            translateY: "30vh",
                            opacity: 0,
                            duration: duration
                        })
                        animate.fadeIn(ripple, duration / 2);
                        setTimeout(() => {
                            animate.fadeOut(ripple, duration / 2);
                        }, duration / 2);
                    }
                    else {
                        animate.fadeOut(icon);
                    }
                }

                const audioBar = document.querySelector("#mainAudioBar");
                // animate.fadeOut(audioBar, duration);

                const celestialObject = document.querySelector("#celestialObject");
                animate.fadeOut(celestialObject, duration);
                celestialObject.blur = "0vw";

                // const starsBackground = document.querySelector("#starsBackground");
                // animate.fadeOut(starsBackground, duration);
                anime({
                    targets: celestialObject,
                    duration: duration,
                    easing: globalEasing,
                    blur: "2vw",
                    update: function () {
                        celestialObject.style.filter = `blur(${celestialObject.blur})`;
                    }
                })
                Game.actions.tweenUp(duration, [audioBar]);
                // setTimeout(() => {
                // Game.actions.cleanUp();
                Game.baseSongs(min, max);
                // }, duration);

                return;
            }
            selectedIndex += deltaSelectedIndex;
            updateDisplay();

            anime({
                x: 1,
                // round : 1,
                update: function () {
                    if (deltaSelectedIndex > 0) {
                        particles.applyOffset(-3, 0);
                    }
                    else {
                        particles.applyOffset(3, 0);
                    }
                },
                easing: "linear"
            })
        }

        function updateGroupCompletion() {
            const group = songGroups[selectedIndex];
            const min = group[1];
            const max = group[2] + 1;

            let score = 0;

            for (let i = min; i < max; ++i) {
                const scoreKey = String("baseSongGPA" + i);
                score += parseFloat(localStorage.getItem(scoreKey)) || 0;
            }
            const percentage = score / ((max - min) * 4);
            completionBar.updateValue(percentage);

            setTimeout(() => {
                completionLabel.textContent = `${Math.floor(percentage * 100)}% COMPLETION`;
                animate.setOpacity(completionLabel, String(clamp(percentage * 5, .5, 1)), duration / 2);
                animate.setOpacity(ripple, String(clamp(percentage * 5, .25, 1)), duration / 2);
            }, duration / 2);
        }
    },
    baseSongs: (min, max) => {
        //Lower opacity of decorations stuff in background
        const musicBars = document.querySelector("#mainAudioBar");

        //make sure you dont get empty song
        if (Game.selectedSong >= max) {
            Game.selectedSong = min;
        }
        else {
            Game.selectedSong = Math.max(min, Game.selectedSong);
        }
        // musicBars.style.top = "37.5vh";
        anime({
            targets: musicBars,
            easing: globalEasing,
            duration: 500,
            opacity: .25,
            top: "37.5vh"
        })
        const m = { opacity: 1 };
        anime({
            targets: m,
            opacity: .5,
            update: function () {
                Game.menuVignetteBaseOpacity = m.opacity;
            },
            duration: 500
        })

        //Expand particles
        const particles = document.querySelector("#menuParticles").object;
        particles.width = screen.width;
        particles.height = screen.height;
        particles.canvas.width = screen.width;
        particles.canvas.height = screen.height;
        particles.canvas.style.left = "0px";
        particles.canvas.style.right = "0px";
        particles.initialSpeed.y = -3;
        particles.particleSize = 4;
        animate.fadeIn(particles.canvas, 500);

        //Increase visibility
        animate.setOpacity(document.querySelector("#vignette"), .5, 1000);
        animate.setOpacity(document.querySelector("#grain"), .1, 1000);

        const songData = Game.baseSongData;
        const imageData = Game.baseSongImages

        //Create the display
        const duration = Game.lowDetailMode ? 500 : 1000; //How fast you switch to different songs

        const title = DivHelper.new("0vw", "10vh", "100vw", "10vh");
        const artist = DivHelper.new("0vw", "22.5vh", "100vw", "7.5vh");
        title.style.background = "rgb(255,255,255)";
        artist.style.background = "rgb(255,255,255)";

        title.setAttribute("id", "songTitle");
        artist.setAttribute("id", "songArtist");

        title.style.opacity = "0";
        artist.style.opacity = "0";
        title.style.background = "none";
        artist.style.background = "none";

        //Create alto and divider
        const altoIcon = DivHelper.new("46.5vw", "2.5vh", "7.5vw", "7.5vh", "img");
        altoIcon.src = Game.baseImages.alto.src;
        altoIcon.style.opacity = "0";
        altoIcon.setAttribute("class", "songDecoration");
        altoIcon.setAttribute("id", "altoIcon");

        const dividerIcon = DivHelper.new("35.25vw", "30vh", "30vw", "7.5vh", "img");
        dividerIcon.src = Game.baseImages.divider.src;
        dividerIcon.style.opacity = "0";
        dividerIcon.setAttribute("class", "songDecoration");
        dividerIcon.setAttribute("id", "dividerIcon")

        const stars = document.querySelector("#stars");
        stars.style.opacity = "1";
        stars.setAttribute("id", "stars")

        const icons = [];
        const iconData = [
            { //Invisible left (0)
                translateX: "-20vw",
                translateY: "0vh", //15vh
                width: "20vw",
                height: "20vw",
                opacity: "0",
                blur: 0,
                scale: .5,
                perspective: "10vw",
                rotateY: "45deg"
            },
            { //Left (1)
                translateX: "5vw",
                translateY: "22.5vh", //25vh
                width: "20vw",
                height: "20vw",
                opacity: ".25",
                blur: 5,
                scale: .7,
                perspective: "10vw",
                rotateY: "15deg"
            },
            { //Selected (2)
                translateX: "40vw",
                translateY: "40vh",
                width: "20vw",
                height: "20vw",
                opacity: "1",
                blur: 0,
                scale: 1,
                perspective: "10vw",
                rotateY: "0deg"
            },
            { //Right (3)
                translateX: "75vw",
                translateY: "22.5vh",
                width: "20vw",
                height: "20vw",
                opacity: ".25",
                blur: 5,
                scale: .7,
                perspective: "10vw",
                rotateY: "-15deg"
            },
            { //Invisible Right (4)
                translateX: "100vw",
                translateY: "0vh",
                width: "20vw",
                height: "20vw",
                opacity: "0",
                blur: 0,
                scale: .5,
                perspective: "10vw",
                rotateY: "-45deg"
            }
        ]

        //Score divider
        const bottomDivider = DivHelper.new("0vw", "60vh", "100vw", "45vh", "img");
        bottomDivider.setAttribute("id", "bottomSongDivider");
        bottomDivider.style.opacity = "0";
        bottomDivider.src = Game.baseImages.bottomSongDivider.src;

        const difficultyDivider = DivHelper.new("37.5vw", "95vh", "25vw", "5vh", "img");
        difficultyDivider.setAttribute("id", "difficultyDivider");
        difficultyDivider.style.opacity = "0";
        difficultyDivider.src = Game.baseImages.difficultyDivider.src;

        const difficultyText = DivHelper.new("37.5vw", "88.5vh", "25vw", "5vh");
        difficultyText.setAttribute("id", "difficultyText");


        //Create value bars
        const scoreValueBar = new ValueBar("0vw", "97vh", "35vw", "3vh", 0, "rgba(255,255,255,.75)", true, false); //85vh //2vh height
        const maxComboValueBar = new ValueBar("65vw", "97vh", "35vw", "3vh", 0, "rgba(255,255,255,.75)", true, true); //85vh

        //Remove borders
        scoreValueBar.element.style.borderStyle = "none";
        maxComboValueBar.element.style.borderStyle = "none";

        const scoreIcon = DivHelper.new("0vw", "89vh", "35vw", "5vh"); //80vh
        const comboIcon = DivHelper.new("65vw", "89vh", "35vw", "5vh");

        scoreIcon.style.color = "rgb(255,255,255)";
        comboIcon.style.color = "rgb(255,255,255)";

        scoreIcon.setAttribute("class", "performanceIcons");
        comboIcon.setAttribute("class", "performanceIcons");

        //Initate icons
        for (let i = min; i < max; ++i) {
            imageData[i].onmousedown = onmousedown;
            createIcon(i);
        }

        let debounce = false;

        //Display selected the selected song's data
        updateDisplay(true);

        //Create back button
        const backButton = Game.actions.getBackButton("0vw", "5vh")
        // backButton.style.opacity = "0"
        animate.setOpacity(backButton, .5, duration)

        //Back button input
        backButton.onmouseover = function () {
            $(backButton).stop();
            animate.setOpacity(backButton, 1, duration / 4);
        }
        backButton.onmouseleave = function () {
            $(backButton).stop();
            animate.setOpacity(backButton, .5, duration / 4);
        }
        backButton.onmousedown = function () {
            backButton.onmousedown = undefined;
            $(backButton).stop();
            animate.fadeOut(backButton, duration);
            LoadingScreen.show(duration);

            LoadingScreen.elements.canvas.style.zIndex = "100";
            LoadingScreen.elements.div.style.zIndex = "100";
            setTimeout(() => {
                LoadingScreen.hide(duration);
                Game.actions.cleanUp();
                Game.menu(false, false, true);
                Game.actions.cleanUp();
                Game.baseSongsGroups();
            }, duration);
        }

        function updateDisplay(justStarting) {
            debounce = true;
            const selectedIndex = Game.selectedSong;
            const selectedSong = songData[selectedIndex];

            //Value bars variables
            const scoreKey = String("baseSongGPA" + Game.selectedSong);
            const comboKey = String("baseSongCombo" + Game.selectedSong);

            const scoreValue = Math.floor(localStorage.getItem(scoreKey) * 100) / 100 || 0;
            const comboValue = localStorage.getItem(comboKey) || 0;

            const maxScore = Game.actions.getMaxScore(selectedSong) || 1;

            setTimeout(() => {
                if (!debounce) {
                    //Debounce is set to false when a game is beginning. This is to stop weird text showing up randomly
                    return;
                }
                //Set text color
                const parsedTitleColor = parseColor(selectedSong.textColor.title);
                const parsedArtistColor = parseColor(selectedSong.textColor.artist);

                const titleGradient = "linear-gradient(" + selectedSong.textColor.title + "," + Color.new(parsedTitleColor[0], parsedTitleColor[1], parsedTitleColor[2], .75) + ")";
                const artistGradient = "linear-gradient(" + selectedSong.textColor.artist + "," + Color.new(parsedArtistColor[0], parsedArtistColor[1], parsedArtistColor[2], .75) + ")";

                title.style.color = selectedSong.textColor.title;
                artist.style.color = selectedSong.textColor.artist;

                title.style.background = titleGradient;
                artist.style.background = artistGradient;

                title.style.webkitBackgroundClip = "text";
                artist.style.webkitBackgroundClip = "text";

                animate.setOpacity(title, 1, duration / 2);
                animate.setOpacity(artist, 1, duration / 2);
                title.textContent = "「 " + selectedSong.name + " 」";
                artist.textContent = selectedSong.artist;

                //Set performance text
                scoreIcon.textContent = String("GRADE POINT AVERAGE : " + scoreValue + " (" + Math.floor(scoreValue / 4 * 100) + "%)");
                comboIcon.textContent = String("MAX COMBO : " + comboValue + " (" + Math.floor(comboValue / maxScore * 100) + "%)")

                difficultyText.textContent = Game.actions.getDifficulty(selectedSong);

                animate.setOpacity(scoreIcon, 1, duration / 2);
                animate.setOpacity(comboIcon, 1, duration / 2);

                animate.setOpacity(difficultyText, 1, duration / 2);

                debounce = false;
            }, duration / 2);

            animate.setOpacity(title, 0, duration / 2);
            animate.setOpacity(artist, 0, duration / 2);

            animate.setOpacity(difficultyText, 0, duration / 2);

            animate.setOpacity(scoreIcon, 0, duration / 2);
            animate.setOpacity(comboIcon, 0, duration / 2);

            //Update icons
            for (let i = min; i < max; ++i) {
                const iconIndex = clamp(i - selectedIndex + 2, 0, 4);
                const icon = imageData[i];
                const iconDataIndex = iconData[iconIndex];

                if (icon.style.opacity == iconDataIndex.opacity && !justStarting) {
                    icon.style.display = "none";
                    continue;
                }
                icon.style.display = "inline";

                if (justStarting) {
                    icon.style.transform = `translateX(${iconDataIndex.translateX}) translateY(${iconDataIndex.translateY}) scale(${iconDataIndex.scale}) perspective(${iconDataIndex.perspective}) rotateY(${iconDataIndex.rotateY})`; //iconDataIndex.rotateY
                    icon.style.width = iconDataIndex.width;
                    icon.style.height = iconDataIndex.height;
                    icon.style.opacity = "0";
                }
                anime({
                    targets: icon,
                    translateX: iconDataIndex.translateX,
                    translateY: iconDataIndex.translateY,
                    // perspective : iconDataIndex.perspective,
                    rotateY: iconDataIndex.rotateY,
                    scale: iconDataIndex.scale,
                    opacity: iconDataIndex.opacity,
                    blur: iconDataIndex.blur,
                    duration: duration,
                    easing: globalEasing,
                    // round: 75,
                    update: function () {
                        icon.style.filter = "blur(" + icon.blur + "px)" + "drop-shadow(7px 7px 7px rgba(0,0,0,.5))";
                    },
                    complete: function () {
                        icon.style.filter = "blur(" + iconDataIndex.blur + "px)" + "drop-shadow(7px 7px 7px rgba(0,0,0,.5))";
                    }
                })
            }
            //Strange clamp to set bottomDivider more transparent when singvaluebar is nothing 
            animate.setOpacity(bottomDivider, clamp(selectedSong.decoration, .2, .3 + (clamp(scoreValue / maxScore, 0, .2))), duration);
            animate.setOpacity(difficultyDivider, clamp(selectedSong.decoration, .5, 1), duration);
            setTimeout(() => {
                if (!debounce && !justStarting) {
                    //again to stop weird shit from happening
                    return;
                }
                animate.setOpacity(altoIcon, clamp(selectedSong.decoration, .2, 1), duration / 2);
                animate.setOpacity(dividerIcon, selectedSong.decoration, duration / 2);
            }, justStarting ? duration / 2 : 0);
            //Check for stars
            if (selectedSong.stars === true) {
                Game.actions.setStarsOpacity(1, duration / 2);
            }
            else {
                Game.actions.setStarsOpacity(0, duration / 2);
            }
            //Update gradient
            const g = selectedSong.gradient;
            const newColor = String("linear-gradient(0deg," + g.color1 + "0%," + g.color2 + "50%," + g.color3 + "100%," + g.color4 + " 110%)")
            Game.actions.changeGradient(newColor, duration);

            //Update valueBars
            scoreValueBar.updateValue(scoreValue / 4);
            maxComboValueBar.updateValue(comboValue / maxScore);
        }
        function createIcon(i) {
            const img = imageData[i];
            img.style.width = "25vw";
            img.style.height = "25vw";
            img.setAttribute("class", "songIcon");
            img.i = i;
            img.draggable = false;
            document.body.appendChild(img);
        }

        function onmousedown(event) {
            const i = event.target.i;
            if (i - Game.selectedSong == 0) {
                //Start song
                debounce = false;

                animate.fadeOut(title, duration);
                animate.fadeOut(artist, duration);
                animate.fadeOut(altoIcon, duration);
                animate.fadeOut(dividerIcon, duration);
                animate.fadeOut(scoreValueBar.element, duration);
                animate.fadeOut(maxComboValueBar.element, duration);
                animate.fadeOut(scoreIcon, duration);
                animate.fadeOut(comboIcon, duration);
                animate.fadeOut(bottomDivider, duration);
                animate.fadeOut(backButton, duration);
                animate.fadeOut(difficultyDivider, duration);
                animate.fadeOut(difficultyText, duration);

                backButton.onmousedown = undefined;
                backButton.onmouseover = undefined;
                backButton.onmouseleave = undefined;

                for (let i = 0; i < songData.length; ++i) {
                    const icon = Game.baseSongImages[i];
                    if (Game.selectedSong === i) {
                        anime({
                            targets: icon,
                            translateY: "50vh",
                            rotateY: "10deg",
                            rotateX: "10deg",
                            opacity: 0,
                            duration: duration,
                            easing: globalEasing
                        })
                    }
                    else {
                        animate.fadeOut(icon, duration);
                    }

                    icon.onmousedown = undefined;
                }
                setTimeout(() => {
                    Game.play(false, false, false, false, () => {
                        // Game.actions.playTitleSong(.25, true);
                        Game.baseSongs(Game.baseSongsMin, Game.baseSongsMax);
                    });

                    //Remove icons
                    document.querySelectorAll(".songIcon").forEach(function (button) {
                        button.remove()
                    })
                }, duration);
                return;
            }

            if (debounce) {
                return;
            }

            let deltaSelected = Game.selectedSong - i;

            anime({
                x: 1,
                // round : 1,
                update: function () {
                    if (deltaSelected > 0) {
                        particles.applyOffset(4, 0);
                    }
                    else {
                        particles.applyOffset(-4, 0);
                    }
                },
                easing: "linear"
            })

            Game.selectedSong = i;
            updateDisplay()
        }
    },
    actions: {
        createVignette: () => { //Applies vignette
            if (document.querySelector("#vignette") === null) {
                createVignette();
            }

            function createVignette() {
                const div = DivHelper.new("0vw", "0vh", "100vw", "100vh");
                div.setAttribute("id", "vignette");
                div.setAttribute("class", "important");
                div.style.opacity = ".75";

                //Create "grain"
                const img = DivHelper.new("0vw", "0vh", "100vw", "100vh", "img");
                img.setAttribute("id", "grain");
                img.setAttribute("class", "important");
                img.src = url + "svg/grain.svg";
                img.style.opacity = "0";
            }
        },
        showCelestialObject: (justStarting) => {
            const object = document.querySelector("#celestialObject") || createObject();

            object.blur = "1vw";

            if (justStarting) {
                anime({
                    targets: object,
                    opacity: 1,
                    easing: globalEasing,
                    // top: "2.5%",
                    blur: "0vw",
                    duration: 1000,
                    update: function () {
                        object.style.filter = `blur(${object.blur})`;
                    }
                })
            }
            else {
                anime({
                    targets: object,
                    opacity: 1,
                    easing: globalEasing,
                    blur: "0vw",
                    duration: 2000,
                    update: function () {
                        object.style.filter = `blur(${object.blur})`;
                    }
                })
            }
            // if (Game.lowDetailMode) {
            //     object.src = "";
            //     object.style.background = "linear-gradient(0deg, rgba(0,0,0,0) 35%, rgba(0,0,0,.3) 50%, rgba(140, 146, 151,1))"
            // }
            function createObject() {
                const div = DivHelper.new("50%", "-7.5%", "100vh", "100vh", "img"); //2.5%
                div.src = Game.baseImages.moon.src;
                div.setAttribute("id", "celestialObject");
                div.setAttribute("class", "important");
                div.style.opacity = "0";



                return div;
            }
        },
        createStars: (starCount) => {
            const width = Math.max(screen.height, screen.width);
            const height = Math.min(screen.height, screen.width) / 4;
            const canvas = Canvas.new("0vw", "0vh", width, height);
            const ctx = canvas.getContext("2d");
            canvas.setAttribute("id", "stars");
            canvas.setAttribute("class", "important");
            for (let i = 0; i < starCount; ++i) {
                const x = getRandomNumber(0, width);
                const y = getRandomNumber(0, height);
                const w = getRandomNumber(1, 2) + .5;
                // const w = 1;

                const opacity = -(y / height) + 1;
                const color = Color.new(getRandomNumber(200, 255), getRandomNumber(200, 255), getRandomNumber(245, 255), opacity)
                Canvas.drawRect(ctx, x, y, w, w, color);
            }
            canvas.style.opacity = "0";
            animate.fadeIn(canvas, 1000);

            const stars = DivHelper.new("0vw", "0vh", "100vw", "30vh", "img");
            stars.setAttribute("id", "starsBackground");
            stars.setAttribute("class", "important");
            stars.src = Game.baseImages.stars.src;
            stars.style.display = "none"

            stars.style.opacity = "0";

            animate.setOpacity(stars, .25, 1000);
            animate.fadeIn(canvas, 1000);

            return stars;
        },
        makeGradientPerspective: (duration, reversed, customGradient, p2) => {
            $(document.body).stop();
            p2 = p2 || 50;
            const selectedSong = customGradient || Game.baseSongData[Game.selectedSong];

            const c1 = selectedSong.gradient.color1;
            const c2 = selectedSong.gradient.color2;
            let c3 = selectedSong.gradient.color3;
            let c4 = selectedSong.gradient.color4; //What color 3 will transition into

            c3 = c3.replace(/[^\d,]/g, '').split(',');
            c4 = c4.replace(/[^\d,]/g, '').split(','); //Convert rgb string to values
            let r = parseInt(c3[0]);
            let g = parseInt(c3[1]);
            let b = parseInt(c3[2]);

            const config = {
                p1: 0,
                p2: !reversed ? p2 : 20,
                p3: !reversed ? 100 : 70,
                r: r,
                g: g,
                b: b
            }

            $(config).animate({
                p1: 0,
                p2: !reversed ? 20 : p2,
                p3: !reversed ? 70 : 100,
                r: parseInt(c4[0]),
                g: parseInt(c4[1]),
                b: parseInt(c4[2]),
            }, {
                duration: duration,
                step: () => {
                    document.body.style.background = String("linear-gradient(0deg, " + c1 + config.p1 + "%," + c2 + config.p2 + "%," + Color.new(config.r, config.g, config.b) + config.p3 + "%)");
                },
                complete: () => {
                    document.body.style.background = String("linear-gradient(0deg, " + c1 + config.p1 + "%," + c2 + config.p2 + "%," + Color.new(config.r, config.g, config.b) + config.p3 + "%)");
                }
            })
        },
        changeGradient: (newColor, duration) => {
            const newGradient = String(newColor);
            const fakeGradient = DivHelper.new("0vw", "0vh", "100vw", "100vh");
            fakeGradient.style.background = newGradient;
            fakeGradient.style.zIndex = "0";
            fakeGradient.style.opacity = "0";
            animate.fadeIn(fakeGradient, duration / 2);
            setTimeout(() => {
                fakeGradient.remove();
                document.body.style.background = newGradient;
            }, duration / 2);
        },
        cleanUp: () => {
            let all = document.getElementsByTagName("*");
            all = Array.prototype.slice.call(all);

            all.forEach(function (element) {
                const tagName = element.tagName;
                const className = element.className;

                if (tagName === "DIV" || tagName === "CANVAS" || tagName === "IMG" || tagName === "SVG" || tagName === "A" || tagName === "INPUT" || tagName === "SELECT" || tagName === "TEXTAREA") {
                    if (className !== "important" && className !== "loadingScreen") {
                        $(element).remove();
                    }
                }
            });

            //remove game canvas
            // if (Game.gameCanvas) {
            //     Game.gameCanvas.playing = false;
            //     Game.gameCanvas.notes = undefined;
            //     Game.gameCanvas.canvas.remove();
            //     Game.gameCanvas.canvas = undefined;
            //     Game.gameCanvas = undefined;
            //     Game.gameAudio.destroy();
            // }
        },
        getBackButton: (left, top) => {
            if (document.querySelector("#backButton") && left !== undefined) {
                document.querySelector("#backButton").remove();
            }
            else if (left === undefined) {
                return document.querySelector("#backButton");
            }

            const backButton = DivHelper.new(left, top, "7.5vw", "7.5vw", "img");
            backButton.src = Game.baseImages.backButton.src;
            backButton.setAttribute("id", "backButton");

            return backButton;
        },
        showSettings: (duration) => {
            duration = duration || 1000;

            const musicVolumeLabel = DivHelper.new("25vw", "70vh", "50vw", "10vh");
            musicVolumeLabel.textContent = "MUSIC VOLUME";
            musicVolumeLabel.setAttribute("class", "settingsLabels");
            musicVolumeLabel.style.opacity = "0";
            musicVolumeLabel.setAttribute("id", "musicVolumeLabel");

            const musicVolumeBar = new ValueBar("25vw", "75vh", "50vw", "2vh", localStorage.getItem("musicVolume") || 1, "rgba(255,255,255,1)", true, false, true);
            musicVolumeBar.element.setAttribute("class", "settingsBars");
            musicVolumeBar.element.style.zIndex = "200";
            musicVolumeBar.element.setAttribute("id", "musicVolumeBar");

            const scrollingSpeedLabel = DivHelper.new("25vw", "85vh", "50vw", "10vh");
            scrollingSpeedLabel.textContent = "NOTES SPEED";
            scrollingSpeedLabel.setAttribute("class", "settingsLabels");
            scrollingSpeedLabel.style.opacity = "0";
            scrollingSpeedLabel.setAttribute("id", "scrollingSpeedLabel");

            const scrollingSpeedBar = new ValueBar("25vw", "90vh", "50vw", "2vh", localStorage.getItem("scrollingSpeed") || .5, "rgba(255,255,255,1)", true, false, true);
            scrollingSpeedBar.element.setAttribute("class", "settingsBars");
            scrollingSpeedBar.element.style.zIndex = "200";
            scrollingSpeedBar.element.setAttribute("id", "scrollingSpeedBar");


            animate.fadeIn(musicVolumeLabel, duration);
            animate.fadeIn(scrollingSpeedLabel, duration);
        },
        hideSettings: (duration, setSettings) => {
            duration = duration || 1000;

            const musicVolumeLabel = document.querySelector("#musicVolumeLabel");
            const musicVolumeBar = document.querySelector("#musicVolumeBar");
            const scrollingSpeedLabel = document.querySelector("#scrollingSpeedLabel");
            const scrollingSpeedBar = document.querySelector("#scrollingSpeedBar");

            if (!document.body.contains(musicVolumeBar)) {
                return;
            }

            const scrollingSpeed = scrollingSpeedBar.object.value;
            const musicVolume = musicVolumeBar.object.value;

            animate.fadeOut(musicVolumeLabel, duration);
            animate.fadeOut(musicVolumeBar, duration);
            animate.fadeOut(scrollingSpeedLabel, duration);
            animate.fadeOut(scrollingSpeedBar, duration);

            //Save settings
            localStorage.setItem("musicVolume", musicVolume);
            localStorage.setItem("scrollingSpeed", scrollingSpeed);

            setTimeout(() => {
                $(musicVolumeLabel).remove();
                $(musicVolumeBar).remove();
                $(scrollingSpeedLabel).remove();
                $(scrollingSpeedBar).remove();
            }, duration);

            //Change settings in game
            // if (setSettings) {
            //     Game.gameAudio.volume = musicVolume;
            //     Game.scrollingSpeed = clamp(Math.floor((1000 * scrollingSpeed)),50,1000);
            // }
        },
        updateAudioDecorations: () => {
            window.requestAnimationFrame(Game.actions.updateAudioDecorations);
            if (Game.stopVignette) {
                return;
            }

            let bars = document.getElementById("mainAudioBar")

            if (!bars) {
                bars = new AudioBars("0vw", "47.5vh", screen.width, screen.height / 4, "100vw", "25vh");
                bars.canvas.setAttribute("class", "important");
                bars.canvas.setAttribute("id", "mainAudioBar");
            }
            else {
                bars = document.getElementById("mainAudioBar").object;
            }

            const vignette = document.getElementById("vignette");
            // const lightEffect = document.body.querySelector("#titleSongLightEffect") ? document.querySelector("#titleSongLightEffect") : DivHelper.new("0vw", "0vh", "100vw", "100vh");
            // lightEffect.setAttribute("id", "titleSongLightEffect");
            // lightEffect.setAttribute("class", "important");

            const amplitude = 4; //sugarstar is 2

            const n = titleSongController.getTitleSongValue() * amplitude;

            const intensity = 300; //100
            // const positionIntensity = 5;

            vignette.style.opacity = String(Game.menuVignetteBaseOpacity - n / intensity);
            // lightEffect.style.width = String((n / positionIntensity + 100) + "vw");
            // lightEffect.style.left = String(-(n / positionIntensity) / 2 + "vw");
            // lightEffect.style.opacity = String(n / intensity);

            bars.update(titleSongController.frequencyData);
        },
        stopTitleSong: () => {
            const audio = Game.titleSongAudio;
            titleSongController.fadeOut(1000);
            setTimeout(() => {
                audio.pause();
            }, 1000);

            const mainAudioBar = document.querySelector("#mainAudioBar");
            const titleSongLightEffect = document.querySelector("#titleSongLightEffect");
            animate.fadeOut(mainAudioBar, 1000);
            animate.fadeOut(titleSongLightEffect, 1000);

            Game.stopVignette = true;
        },
        playTitleSong: (opacity, reset) => {
            const audio = Game.titleSongAudio;
            audio.play();
            audio.currentTime = reset ? 0 : audio.currentTime;
            audio.volume = localStorage.getItem("musicVolume") || 1;

            const mainAudioBar = document.querySelector("#mainAudioBar");
            animate.setOpacity(mainAudioBar, opacity, 1000);

            Game.stopVignette = false;
        },
        getMaxScore: (songData) => {
            const selectedIndex = Game.selectedSong;
            const selectedSong = songData || Game.baseSongData[selectedIndex];

            if (!selectedSong) {
                return 0
            }

            const notes = selectedSong.notesData;

            if (!notes) {
                return 0;
            }

            let longNotesCount = 0;

            for (let i = 0; i < notes.length; ++i) {
                const note = notes[i];
                if (note.timePositionEnd) {
                    longNotesCount++;
                }
            }

            return (notes.length + longNotesCount);
        },
        getLanesInputData: (laneCount) => {
            return localStorage.getItem(`lanesInput${laneCount}`);
        },
        setLanesInputData: (laneCount, data, dontNotify) => {
            // if (data.includes(" ")) {
            //     Effects.notify("Error : Lanes data contains a space", 4000);
            //     return;
            // }
            if (data.length != laneCount) {
                Effects.notify("Error : Lane count doesn't match input length", 4000);
                return;
            }
            if (!dontNotify) {
                Effects.notify("Successfully changed lane input!", 4000)
            }
            localStorage.setItem(`lanesInput${laneCount}`, data);
        },
        setStarsOpacity: (opacity, duration) => {
            duration = duration || 1000;

            const starsBackground = document.querySelector("#starsBackground");
            const stars = document.querySelector("#stars");

            animate.setOpacity(starsBackground, opacity / 8, duration);
            animate.setOpacity(stars, opacity, duration);
        },
        createSongData: (title, artist, gradient1, gradient2, gradient3, titleColor, artistColor, notesData, stars, inputCount, instrument, songURL, properties, songId) => {
            const obj = {
                "name": title,
                "artist": artist,
                "gradient": {
                    "color1": gradient1,
                    "color2": gradient2,
                    "color3": gradient3,
                    "color4": gradient3
                },
                "textColor": {
                    "title": titleColor,
                    "artist": artistColor
                },
                "notesData": notesData,
                "decoration": 0,
                "stars": stars,
                "laneGradient": {
                    "color1": "rgba(255,255,255,0)",
                    "color2": "rgba(255,255,255,1)",
                    "color3": "rgba(255,255,255,0)"
                },
                "noteColor": "rgb(253, 253, 237)",
                "songURL": "",
                "inputCount": inputCount,
                "instrument": instrument,
                "songURL": songURL,
                "properties": properties,
                "songId": songId
            };

            return obj;
        },
        saveSongData: (songData, index) => {
            let savedSongs = localStorage.getItem("savedSongs") || createSongFolder();

            savedSongs = JSON.parse(savedSongs);

            let foundIndex = false;
            if (index === false || index == undefined) {
                for (let i = 0; i < savedSongs.length; ++i) {
                    const song = savedSongs[i];

                    const songName = song.name;

                    if (songName == songData.name) {
                        foundIndex = true;
                        songData.name += " copy";
                        break;
                    }
                }
            }


            if (index != undefined && index !== false) {
                savedSongs[index] = songData;
            }
            else {
                savedSongs.push(songData);
            }
            savedSongs = savedSongs.filter(n => n);
            localStorage.setItem("savedSongs", JSON.stringify(savedSongs));

            function createSongFolder() {
                localStorage.setItem("savedSongs", "[]");

                return "[]";
            }
        },
        showSongProperties: (left, top, songData) => {

        },
        getLocalSongData: (index) => {

        },
        removeLocalSong: (index) => {
            let savedSongs = localStorage.getItem("savedSongs");
            if (savedSongs) {
                savedSongs = JSON.parse(savedSongs);
            }
            else {
                savedSongs = [];
            }

            savedSongs.splice(index, 1);

            savedSongs = JSON.stringify(savedSongs);

            localStorage.setItem("savedSongs", savedSongs);
        },
        getDifficulty: (songData) => {
            if (!songData) {
                return "Empty Song Data"
            }
            const notes = songData.notesData;

            if (!notes || !notes[0] || !songData || notes.length <= 0) {
                return "Empty Notes Data";
            }

            let smallest = notes[0].timePosition;
            let largest = notes[0].timePosition;

            for (let i = 0; i < notes.length; ++i) {
                const note = notes[i];
                const timePosition = note.timePosition;

                if (timePosition > largest) {
                    largest = timePosition;
                }
                if (timePosition < smallest) {
                    smallest = timePosition;
                }
            }

            const duration = largest - smallest;

            const level = Math.floor(notes.length / duration) * Game.difficultyConstant;

            const difficultyData = {
                1: "EASY",
                2: "MEDIUM",
                4: "HARD",
                10: "VERY HARD",
                16: "IMPOSSIBLE"
            }

            let difficulty = "EASY";

            const difficultyArray = Object.keys(difficultyData);
            for (let i = 0; i < difficultyArray.length; ++i) {
                const difficultyLevel = difficultyArray[i];

                if (level > difficultyLevel) {
                    difficulty = difficultyData[difficultyLevel];
                }
            }

            return difficulty + " LEVEL " + level
        },
        getAverageGrade: (score) => {
            let total = 0;
            for (let i = 0; i < score.length; ++i) {
                total += score[i];
            }
            return total / score.length;
        },
        tweenUp: (duration, blacklist) => {
            let all = document.getElementsByTagName("*");
            all = Array.prototype.slice.call(all);

            all.forEach(function (element) {
                const tagName = element.tagName;
                const className = element.className;
                const idName = element.getAttribute("id");

                if (tagName === "DIV" || tagName === "CANVAS" || tagName === "IMG" || tagName === "SVG" || tagName === "A" || tagName === "INPUT" || tagName === "SELECT" || tagName === "TEXTAREA") {
                    if (className !== "important" && className !== "loadingScreen" && idName != "pulseEffect") {
                        if (!findInArray(element, blacklist)) {
                            animate.fadeOut(element, duration);
                        }
                        setTimeout(() => {
                            $(element).remove();
                        }, duration);
                    }
                }
            });
        },
        compressNotes: (songData) => {
            const notes = songData.notesData;

            for (let i = 0; i < notes.length; ++i) {
                const note = notes[i];

                const newNote = {
                    tP: Math.floor(note.timePosition * 1000) / 1000,
                    tPE: Math.floor(note.timePositionEnd * 1000) / 1000,
                    l: note.lane
                }

                if (note.pianoNote) {
                    newNote.pN = note.pianoNote;
                }

                notes[i] = newNote;
            }
        },
        uncompressNotes: (songData) => {
            const notes = songData.notesData;

            for (let i = 0; i < notes.length; ++i) {
                const note = notes[i];

                const timePosition = note.tP || 0;
                const timePositionEnd = note.tPE || 0;

                const newNote = {
                    timePosition: timePosition,
                    timePositionEnd: timePositionEnd,
                    lane: note.l
                }

                if (note.pN) {
                    newNote.pianoNote = note.pN;
                }

                notes[i] = newNote;
            }
        },
        showAccount: (customId) => {
            const anyClick = DivHelper.new("0vw", "0vh", "100vw", "100vh", "div");
            anyClick.style.zIndex = "1000";

            const container = DivHelper.new("30vw", "35vh", "40vw", "30vh", "div", 1000);
            container.setAttribute("id", "myAccountContainer");

            const memoryUsageLabel = DivHelper.new("0vw", "75%", "10vw", "10vh", "div", 1000);
            memoryUsageLabel.setAttribute("class", "label");
            memoryUsageLabel.textContent = "MEMORY USAGE";

            const userIdLabel = DivHelper.new("0vw", "15%", "100%", "10vh", "div", 1000);
            userIdLabel.setAttribute("class", "label");
            userIdLabel.textContent = "USER ID : 3";

            const usernameLabel = DivHelper.new("0vw", "2.5%", "100%", "10vh", "div", 1000);
            usernameLabel.setAttribute("class", "label");
            usernameLabel.textContent = "USERNAME : lunarbeats";

            const memoryUsageBar = new ValueBar("0%", "90%", "75%", "7.5%", 1, "rgb(255,255,255)", true, false, false);

            anyClick.onclick = function () {
                console.log("yes")
                animate.fadeOut(container, 1000);
                anyClick.onclick = undefined;
                setTimeout(() => {
                    container.remove();
                    anyClick.remove();
                }, 1000);
            }

            container.append(usernameLabel);
            container.append(userIdLabel);
            container.append(memoryUsageBar.element);
            container.append(memoryUsageLabel);

            fetch("/api/getAccountData", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    "Accepts": "application/json"
                },
                body: JSON.stringify({
                    userId: customId || localStorage.getItem("userId"),
                })
            })
                .then(response => response.json())
                .then((data) => {
                    if (data.error) {
                        Effects.displayMessage(data.error, 5000, 1000);
                        return;
                    }
                    const username = data.username;
                    const userId = data.userId;
                    const memoryUsage = data.memoryUsage;

                    const maxMemory = 150000;

                    usernameLabel.textContent = "USER NAME : " + username;
                    userIdLabel.textContent = "USER ID : " + userId;
                    memoryUsageLabel.textContent = "MEMORY USAGE : " + memoryUsage * 100 / maxMemory + "% " + "(" + memoryUsage + ")";
                    memoryUsageBar.updateValue(memoryUsage / maxMemory);
                })
        }
    },
    baseSongData: [], //JSONs
    baseSongImages: [], //SVGs
    baseImages: {},
    baseSongAudio: [], //MP3s
    selectedSong: 0, //Index of selected song based on the baseSongData array
    gameCanvas: undefined,
    gameAudio: undefined,
    currentSongData: undefined,
    inputReach: 75,
    scrollingSpeed: localStorage.getItem("scrollingSpeed") || 1000,
    titleSongData: {},
    titleSongAudio: undefined,
    titleSongCtx: undefined,
    stopVignette: false,
    menuVignetteBaseOpacity: 1,
    updatingAudioDecorations: false,
    gameScore: 0,
    gameCombo: 0,
    titleSongCredits: "https://saintslime.carrd.co/",
    version: "v1.0.0",
    lowDetailMode: false,
    timeOffset: 0,
    composePiano: undefined,
    songGroups: [],
    baseSongsMin: 0,
    baseSongsMax: 0,
    difficultyConstant: 2
}

$(document).ready(() => {
    //Show Initial Loading Screen
    LoadingScreen.show(1000);

    //Check if mobile 
    if (navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)) {
        // isMobile = true;
    }

    if (isMobile) {
        alert("Mobile is currently not supported! Sorry!");
    }

    let finished = false;

    let directory = undefined;

    $.getJSON(url + "directory.json", function (data) {
        directory = data;
        complete()
    })

    //Add songdata to array

    function complete() {
        const songCount = directory.base.songCount;
        const songURL = directory.base.songURL;
        const baseImages = directory.baseImages;
        const songGroups = directory.base.songGroups;
        const baseSongData = Game.baseSongData;
        const baseSongImages = Game.baseSongImages;

        let began = false;
        let finishedIcons = 0;
        let finishedGroupIcons = 0;
        let titleSongLoaded = false;

        const titleSong = document.createElement("audio");
        Game.titleSongAudio = titleSong;
        titleSong.volume = localStorage.getItem("musicVolume") || 1;
        titleSong.src = "mp3/LightnessPeaceReverb.ogg";
        titleSong.loop = true;
        // document.body.append(titleSong);
        titleSong.oncanplaythrough = function () {
            titleSongLoaded = true;
        }

        for (let i = 0; i < songCount; ++i) {
            const parsedURL = String(url + songURL + "/song" + String(i));
            $.getJSON(parsedURL + "/data.json", function (data) {
                baseSongData[i] = data;
                finishedIcons++;
            })
            const songImage = document.createElement("img");
            songImage.src = url + parsedURL + "/icon.svg";
            baseSongImages[i] = songImage;
        }

        //Preload base images
        let finishedImages = 0;
        for (let i = 0; i < baseImages.length; ++i) {
            //Index 0 is the name of the object, index 1 is the URL
            const v = baseImages[i];
            const name = v[0];
            const url = v[1];
            const img = document.createElement("img");
            img.src = url;
            Game.baseImages[name] = img;
            $(img).on("load", function () {
                finishedImages++;
            })
        }
        //Preload song group images
        for (let i = 0; i < songGroups.length; ++i) {
            const v = songGroups[i][0];
            const parsedURL = `songs/base/groups/${v}.svg`;
            const img = document.createElement("img");
            img.src = parsedURL;
            img.setAttribute("id", songGroups[i]);
            songGroups[i].push(img);
            Game.songGroups.push(songGroups[i]);
            img.onload = function () {
                finishedGroupIcons++;
            }
        }
        const checkFinished = setInterval(() => {
            if (finishedImages === baseImages.length && finishedIcons === songCount && began === false && titleSongLoaded && finishedGroupIcons === songGroups.length) {
                clearInterval(checkFinished);
                finishLoading();
            }
        }, 100);
    }

    setTimeout(() => { //If taking too long
        if (finished === false) {
            Effects.displayMessage("Error loading : Timeout", 5000, 1000);
            finishLoading();
        }
    }, 30000);

    //Constantly check if device is portrait
    const portraitWarning = document.getElementById("portraitWarning")
    setInterval(() => {
        const isPortrait = window.matchMedia("(orientation: portrait)").matches;

        if (!isPortrait) {
            portraitWarning.style.display = "none"
            return
        }

        portraitWarning.style.display = "block"
    }, 500);

    function finishLoading() {
        finished = true;
        // document.body.style.background = "linear-gradient(0deg, rgb(29 36 55) 0%, rgb(198 198 207) 50%, rgb(69 79 99) 100%, rgb(30, 36, 44) 110%)";
        // Game.actions.createStars(1000);
        // LoadingScreen.hide();
        Game.premenu();
    }
})
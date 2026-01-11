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

window.Particles = Particles
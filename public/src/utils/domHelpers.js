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
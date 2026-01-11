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
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
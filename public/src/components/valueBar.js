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
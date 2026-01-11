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
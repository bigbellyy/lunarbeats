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
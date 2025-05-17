window.onload = async () => {
    const canvas = document.getElementById("canvas");
    
    const fourierContext = new CanvasFourierDrawingContext(canvas);
    await fourierContext.loadShaders();

    let circleUrl = "/circles/anatol.json";
    if (Math.random() < 0.5) {
        circleUrl = "/circles/troll.json";
    }

    let circleData = await fetch(circleUrl).then(res => res.json());
    circleData.sort((a, b) => a.offset[0] < b.offset[0] ? -1 : 1);

    fourierContext.setData(circleData);
    
    let renderStart = new Date();

    function renderCallback() {
        let time = new Date();
        let t = (time.getTime() - renderStart.getTime()) * 0.001 * 0.1;
        fourierContext.draw(t);
        requestAnimationFrame(renderCallback);
    }

    requestAnimationFrame(renderCallback);
}
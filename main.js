
//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
    let currentIndex = array.length;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
  
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

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

    /*loadAllData().then(data => {
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, data.vertexShader);
        const fragShader = createShader(gl, gl.FRAGMENT_SHADER, data.fragShader);

        const basicVertexShader = createShader(gl, gl.VERTEX_SHADER, data.basicVertexShader);
        const basicFragShader = createShader(gl, gl.FRAGMENT_SHADER, data.basicFragShader);

        const fourierProgram = createProgram(gl, vertexShader, fragShader);
        const basicProgram = createProgram(gl, basicVertexShader, basicFragShader);

        const circleData = data.circleData;

        if (!vertexShader || !fragShader) {
            console.error("Error creating shaders");
            return;
        }

        console.log("Compiled shaders");

        if (!fourierProgram) {
            console.error("Error creating program");
            return;
        }

        if (!basicProgram) {
            console.error("Error creating program");
            return;
        }

        

        let drawers = [];
        let minx = 5000, miny = 5000;
        let maxx = 0, maxy = 0;

        for (const i in circleData) {
            const obj = circleData[i];
            let hue = (240 + i * 10) % 360;

            let drawer = new FourierDrawer([1.0, 1.0], obj.offset, obj.circles, hue);
            drawers.push(new WebGLFourierDrawer(drawer, 1.0, 250, gl, fourierProgram));

            for (point of drawer.points) {
                minx = Math.min(minx, point[0] + obj.offset[0]);
                miny = Math.min(miny, point[1] + obj.offset[1]);
                maxx = Math.max(maxx, point[0] + obj.offset[0]);
                maxy = Math.max(maxy, point[1] + obj.offset[1]);
            }
        }

        const centerx = ((maxx + miny) / 2)
        const centery = ((maxy + miny) / 2);

        const objectWidth = maxx - minx;
        const objectHeight = maxy - miny;

        // Set up circle rendering

        const startTime = new Date();

        const circleDrawer = new CircleDrawer(30, gl, basicProgram);
        let framesRendered = 0;

        let fpsTrackStart = new Date();

        let permutation = [...Array(drawers.length).keys()];
        shuffle(permutation);

        let easing = (x) => {
            if (x < 0.5) return x * x;
            else return x - 0.25;
        };

        function renderScene() {
            tryResizeCanvas(canvas);

            const canvasWidth = gl.canvas.width;
            const canvasHeight = gl.canvas.height;

            const widthFrac = objectWidth / canvasWidth;
            const heightFrac = objectHeight / canvasHeight;

            const targetFrac = 0.75;

            const scale = targetFrac / Math.max(widthFrac, heightFrac);
            //console.log("Scale: " + scale);

            let secondaryOffset = [
                ((canvasWidth / 2) - centerx),
                ((canvasHeight / 2) - centery)
            ];

            const currTime = new Date();
            t = (currTime.getTime() - startTime.getTime()) * 0.001 * 0.1;

            framesRendered++;
            if (framesRendered == 100) {
                const fpsTrackEnd = new Date();
                const fps = 100 / ((fpsTrackEnd.getTime() - fpsTrackStart.getTime()) / 1000);
                console.log("FPS: " + fps);
                fpsTrackStart = currTime;
                framesRendered = 0;
            }
            
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(fourierProgram);
            gl.uniform1f(gl.getUniformLocation(fourierProgram, "u_extraScale"), scale);
            gl.uniform2f(gl.getUniformLocation(fourierProgram, "u_resolution"), gl.canvas.width, gl.canvas.height);
            gl.uniform2f(gl.getUniformLocation(fourierProgram, "u_offset"), ...secondaryOffset);

            circleDrawer.setupResolution([canvasWidth, canvasHeight], scale, secondaryOffset);

            for (const i in drawers) {
                let localTime = easing(Math.max(0, t - permutation[i] * 0.02));

                gl.useProgram(fourierProgram);
                gl.uniform1f(gl.getUniformLocation(fourierProgram, "u_time"), localTime);
                drawers[i].draw(localTime, circleDrawer);
            }

            circleDrawer.drawBufferedCircles();
        }

        function renderCallback() {
            renderScene();

            requestAnimationFrame(renderCallback);
        }

        requestAnimationFrame(renderCallback);
    }).catch(err => {
        console.error("Error loading data: " + err);
    });*/
}
CIRCLES = [[0, 20.17366690003934, 31.210864826095086], [2, -8.297223100169726, 7.3375681194240645], [4, 8.766173885735205, -1.825854405162394], [3, 4.828799579383228, 6.949623634873109], [1, -5.624921112754044, 3.786127046115491], [-3, 0.6965798864892989, 6.719110608460776], [-4, -6.223195729451153, -1.1345861180330268], [-1, 0.018508972819354486, 6.306372311595307], [-2, -4.344662238255573, -2.1415072096011514], [-5, 0.6665183837485866, -2.9186792828877044], [5, -0.8740773336279825, -2.6419780628237537]]

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }
  
function rgbToHex(r, g, b, a) {
    let res = "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    if (a) res += componentToHex(a);
    return res;
}

const POINT_COUNT = 400;
const SEGMENT_COUNT = 20;
const SEGMENT_FRACTION = 1 / SEGMENT_COUNT;

let performanceMode = false;

class FourierDrawer {
    constructor(scale, offset, circles, hue) {
        this.scale = scale;
        this.offset = offset;
        this.secondaryOffset = [0, 0];
        this.circles = circles;
        this.hue = hue;

        this.points = [];

        for (let i = 0; i < POINT_COUNT; i++) {
            this.points.push(this.calcPos(i / POINT_COUNT));
        }

        this.colors = [];

        for (let i = 0; i <= SEGMENT_COUNT; i++) {
            this.colors.push(`hsl(${hue}, 100%, ${50 + i / SEGMENT_COUNT * 50}%)`);
        }
    }

    calcPos(t) {
        let prevPos = [0, 0];

        for (const circle of this.circles) {
            const freq = circle[0];
            const real = circle[1];
            const imag = circle[2];

            const x = t * freq * 2 * Math.PI;
            let dx = Math.cos(x) * real - Math.sin(x) * imag;
            let dy = Math.sin(x) * real + Math.cos(x) * imag;

            let newPos = [prevPos[0] + dx, prevPos[1] + dy];

            prevPos = newPos;
        }

        return prevPos;
    }

    calcDerivative(t) {
        let deriv = [0, 0];

        for (const circle of this.circles) {
            const freq = circle[0];
            const real = circle[1];
            const imag = circle[2];

            const omega = freq * 2 * Math.PI;
            const x = t * omega;

            let dx = omega * (-Math.sin(x) * real - Math.cos(x) * imag);
            let dy = omega * (Math.cos(x) * real - Math.sin(x) * imag);

            deriv[0] += dx;
            deriv[1] += dy;
        }

        return deriv;
    }

    renderPath(t, ctx, partial) {
        const segmentStarts = [];
        
        for (let i = 0; i < SEGMENT_COUNT; i++) {
            let start = Math.round((t - i * SEGMENT_FRACTION) * this.points.length);
            if (start < 0 && partial) continue;
            let bounded = (start % this.points.length + this.points.length) % this.points.length;
            segmentStarts.push(bounded);
        }


        for (let i = segmentStarts.length - 1; i >= 0; i--) {
            let start = segmentStarts[i];
            let end;

            if (i == segmentStarts.length - 1) {
                if (partial) {
                    end = 0;
                } else {
                    end = (start - Math.round(SEGMENT_FRACTION * this.points.length) + this.points.length) % this.points.length;
                }
            } else {
                end = Math.max(0, segmentStarts[i+1]-1);
            }

            let startColor = this.colors[i];
            let endColor = this.colors[i+1];

            if (performanceMode) {
                ctx.strokeStyle = startColor;
            } else {
                let gradient = ctx.createLinearGradient(this.points[start][0], this.points[start][1], this.points[end][0], this.points[end][1]);
                gradient.addColorStop(0, startColor);
                gradient.addColorStop(1, endColor);
                ctx.strokeStyle = gradient;
            }

            ctx.beginPath();
            ctx.moveTo(...this.points[start]);

            if (start != end) {
                for (let i = (start - 1 + this.points.length) % this.points.length; i != end; i = (i - 1 + this.points.length) % this.points.length) {
                    ctx.lineTo(...this.points[i]);
                }
            }

            ctx.lineTo(...this.points[end]);

            ctx.stroke();
        }
    }

    renderArms(t, ctx) {

        ctx.strokeStyle = "#7772";
        ctx.fillStyle = "#000d";
        
        //ctx.moveTo(0, 0)
        ctx.lineWidth = 0.5;

        let prevPos = [0, 0];
        for (const i in this.circles) {
            if (performanceMode && i > 25) break;

            const circle = this.circles[i];
            const freq = circle[0];
            const real = circle[1];
            const imag = circle[2];
            const mag = Math.hypot(real, imag);

            if (mag < 0.1) break;

            const x = t * freq * 2 * Math.PI;
            let dx = Math.cos(x) * real - Math.sin(x) * imag;
            let dy = Math.sin(x) * real + Math.cos(x) * imag;

            let newPos = [prevPos[0] + dx, prevPos[1] + dy];

            if (i != 0 || freq != 0) {
                ctx.beginPath();
                ctx.ellipse(prevPos[0], prevPos[1], mag, mag, 0, 0, 2 * Math.PI);
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.ellipse(newPos[0], newPos[1], 0.5, 0.5, 0, 0, 2 * Math.PI);
            ctx.fill();

            prevPos = newPos;
        }
    }

    renderState(t, ctx) {
        let partial = t < 1;
        t = t % 1;

        ctx.resetTransform();
        ctx.lineJoin = "round";
        ctx.lineWidth = 1.0;

        ctx.translate(...this.secondaryOffset);
        ctx.scale(...this.scale);
        ctx.translate(...this.offset);

        this.renderPath(t, ctx, partial);
        this.renderArms(t, ctx);
    }

    constructMeshData(nPoints, thickness) {
        // Could this computation be sped up with FFT?
        const pointsOnLine = [];
        const derivatives = [];
        
        for (let i = 0; i < nPoints; i++) {
            const t = -i / nPoints;
            
            const pos = this.calcPos(t);
            pointsOnLine.push([pos[0] + this.offset[0], pos[1] + this.offset[1]]);
            derivatives.push(this.calcDerivative(t));
        }

        const vertexData = []; // Vertex format: [x, y, t]
        const indices = [];

        for (let i = 0; i < pointsOnLine.length; i++) {
            const t = -i / nPoints;

            let thisPoint = pointsOnLine[i];

            let velocity = derivatives[i];
            let speed = Math.hypot(velocity[0], velocity[1]);
            let normal = [-velocity[1] / speed, velocity[0] / speed];

            let leftPoint = [
                thisPoint[0] + normal[0] * thickness / 2,
                thisPoint[1] + normal[1] * thickness / 2
            ];

            let rightPoint = [
                thisPoint[0] - normal[0] * thickness / 2,
                thisPoint[1] - normal[1] * thickness / 2
            ];

            vertexData.push(leftPoint[0], leftPoint[1], i / pointsOnLine.length);
            vertexData.push(rightPoint[0], rightPoint[1], i / pointsOnLine.length);

            let triOne = [i * 2, i * 2 + 1, (i + 1) * 2];
            let triTwo = [(i + 1) * 2, (i + 1) * 2 + 1, i * 2 + 1];

            for (let j = 0; j < 3; j++) {
                triOne[j] %= (nPoints * 2);
                triTwo[j] %= (nPoints * 2);
            }

            indices.push(...triOne);
            indices.push(...triTwo);
        }

        return {
            vertexData: new Float32Array(vertexData),
            indices: new Uint16Array(indices),
            nPoints: nPoints,
            thickness: thickness
        }
    }
};

// From https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
function hsv2rgb(h,s,v) 
{                              
  let f= (n,k=(n+h/60)%6) => v - v*s*Math.max( Math.min(k,4-k,1), 0);     
  return [f(5),f(3),f(1)];
}   

class WebGLFourierDrawer {
    constructor(drawer, thickness, nPoints, gl, program) {
        this.drawer = drawer;
        this.gl = gl;

        let {vertexData, indices} = drawer.constructMeshData(nPoints, thickness);
        this.vertexData = vertexData;
        this.indices = indices;
        this.nPoints = nPoints;
        this.thickness = thickness;

        this.program = program;

        gl.useProgram(program);
        this.positionAttribLocation = gl.getAttribLocation(program, "a_position");
        this.tAttribLocation = gl.getAttribLocation(program, "a_t");
        
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        this.vertexArray = gl.createVertexArray();
        gl.bindVertexArray(this.vertexArray);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.enableVertexAttribArray(this.positionAttribLocation);
        gl.enableVertexAttribArray(this.tAttribLocation);
        gl.vertexAttribPointer(this.positionAttribLocation, 2, gl.FLOAT, false, 3 * 4, 0);
        gl.vertexAttribPointer(this.tAttribLocation, 1, gl.FLOAT, false, 3 * 4, 2 * 4);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        // Convert colour to rbg
        this.baseColour = hsv2rgb(drawer.hue, 1, 1);
    }

    draw(t, circleDrawer) {
        this.gl.useProgram(this.program);
        this.gl.bindVertexArray(this.vertexArray);

        this.gl.uniform3f(this.gl.getUniformLocation(this.program, "u_baseColor"), ...this.baseColour);

        this.gl.drawElements(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0);
        this.gl.bindVertexArray(null);

        this.renderArms(t, circleDrawer);
    }

    renderArms(t, circleDrawer) {
        //ctx.strokeStyle = "#7772";
        //ctx.fillStyle = "#000d";
        const STROKE_COLOR = [0.467, 0.467, 0.467, 0.6];
        const FILL_COLOR = [0, 0, 0, 0.867];
        
        //ctx.moveTo(0, 0)
        //ctx.lineWidth = 0.5;

        let x = this.drawer.offset[0];
        let y = this.drawer.offset[1];
        for (const i in this.drawer.circles) {
            const circle = this.drawer.circles[i];
            const freq = circle[0];
            const real = circle[1];
            const imag = circle[2];
            const mag = Math.hypot(real, imag);

            if (mag < 0.1) break;

            const xt = t * freq * 2 * Math.PI;
            let dx = Math.cos(xt) * real - Math.sin(xt) * imag;
            let dy = Math.sin(xt) * real + Math.cos(xt) * imag;

            let nx = x + dx;
            let ny = y + dy;

            if (i != 0 || freq != 0) {
                circleDrawer.drawCircle(x, y, mag - 0.25, mag + 0.25, STROKE_COLOR);
            }

            circleDrawer.drawCircle(nx, ny, 0, 0.5, FILL_COLOR);

            x = nx;
            y = ny;
        }
    }
}

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

let t = 0;
const SCALE = 3;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Error compiling shader: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Error linking program: " + gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

function createCircleMeshData(nPoints) {
    const vertexData = [];
    const indices = [];

    for (let i = 0; i < nPoints; i++) {
        const t = i / nPoints;

        let innerX = Math.cos(t * 2 * Math.PI);
        let innerY = Math.sin(t * 2 * Math.PI);

        let outerX = Math.cos(t * 2 * Math.PI);
        let outerY = Math.sin(t * 2 * Math.PI);

        vertexData.push(innerX, innerY, 0); // 0 - inner
        vertexData.push(outerX, outerY, 1); // 1 - outer

        let triOne = [i * 2, i * 2 + 1, (i + 1) * 2];
        let triTwo = [(i + 1) * 2, (i + 1) * 2 + 1, i * 2 + 1];

        for (let j = 0; j < 3; j++) {
            triOne[j] %= (nPoints * 2);
            triTwo[j] %= (nPoints * 2);
        }

        indices.push(...triOne);
        indices.push(...triTwo);
    }

    return {
        vertexData: new Float32Array(vertexData),
        indices: new Uint16Array(indices)
    }
}

function pollError(gl, pos) {
    const error = gl.getError();
    if (error != gl.NO_ERROR) {
        let errorString = "[Unknown error (" + error + ")]";

        switch (error) {
            case gl.INVALID_ENUM:
                errorString = "INVALID_ENUM";
                break;
            case gl.INVALID_VALUE:
                errorString = "INVALID_VALUE";
                break;
            case gl.INVALID_OPERATION:
                errorString = "INVALID_OPERATION";
                break;
            case gl.INVALID_FRAMEBUFFER_OPERATION:
                errorString = "INVALID_FRAMEBUFFER_OPERATION";
                break;
            case gl.OUT_OF_MEMORY:
                errorString = "OUT_OF_MEMORY";
                break;
        }
        console.error("Error at " + pos + ": " + errorString);
    }
}

const MAX_CIRCLES = 2000;

class CircleDrawer {
    constructor(nPoints, gl, program) {
        this.nPoints = nPoints;

        let {vertexData, indices} = createCircleMeshData(nPoints);

        this.vertexData = vertexData;
        this.indices = indices;

        this.gl = gl;
        this.program = program;

        gl.useProgram(program);

        this.positionAttribLocation = gl.getAttribLocation(program, "a_position");
        this.outerAttribLocation = gl.getAttribLocation(program, "a_outer");
        
        this.resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
        this.extraScaleUniformLocation = gl.getUniformLocation(program, "u_extraScale");

        //this.offsetUniformLocation = gl.getUniformLocation(program, "u_offset");
        //this.innerRadiusUniformLocation = gl.getUniformLocation(program, "u_innerRadius");
        //this.outerRadiusUniformLocation = gl.getUniformLocation(program, "u_outerRadius");
        //this.colorUniformLocation = gl.getUniformLocation(program, "u_color");

        this.offsetAttribLocation = gl.getAttribLocation(program, "a_offset");
        this.innerRadiusAttribLocation = gl.getAttribLocation(program, "a_innerRadius");
        this.outerRadiusAttribLocation = gl.getAttribLocation(program, "a_outerRadius");
        this.colorAttribLocation = gl.getAttribLocation(program, "a_color");

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        this.instanceAttribBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceAttribBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, MAX_CIRCLES * 8 * 4, gl.DYNAMIC_DRAW);

        this.vertexArray = gl.createVertexArray();
        gl.bindVertexArray(this.vertexArray);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

        gl.enableVertexAttribArray(this.positionAttribLocation);
        gl.enableVertexAttribArray(this.outerAttribLocation);
        gl.vertexAttribPointer(this.positionAttribLocation, 2, gl.FLOAT, false, 3 * 4, 0);
        gl.vertexAttribPointer(this.outerAttribLocation, 1, gl.FLOAT, false, 3 * 4, 2 * 4);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceAttribBuffer);
        gl.enableVertexAttribArray(this.offsetAttribLocation); // 2 floats
        gl.enableVertexAttribArray(this.innerRadiusAttribLocation); // 1 float
        gl.enableVertexAttribArray(this.outerRadiusAttribLocation); // 1 float
        gl.enableVertexAttribArray(this.colorAttribLocation); // 4 floats
        // Total = 8 floats
        gl.vertexAttribPointer(this.offsetAttribLocation, 2, gl.FLOAT, false, 4 * 8, 0);
        gl.vertexAttribPointer(this.innerRadiusAttribLocation, 1, gl.FLOAT, false, 4 * 8, 2 * 4);
        gl.vertexAttribPointer(this.outerRadiusAttribLocation, 1, gl.FLOAT, false, 4 * 8, 3 * 4);
        gl.vertexAttribPointer(this.colorAttribLocation, 4, gl.FLOAT, false, 4 * 8, 4 * 4);
        gl.vertexAttribDivisor(this.offsetAttribLocation, 1);
        gl.vertexAttribDivisor(this.innerRadiusAttribLocation, 1);
        gl.vertexAttribDivisor(this.outerRadiusAttribLocation, 1);
        gl.vertexAttribDivisor(this.colorAttribLocation, 1);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        
        this.circleData = new Float32Array(MAX_CIRCLES * 8);
        this.numCircles = 0;
    }

    setupResolution(resolution, scale, extraOffset) {
        this.gl.useProgram(this.program);
        this.gl.uniform2f(this.resolutionUniformLocation, resolution[0], resolution[1]);
        this.gl.uniform1f(this.extraScaleUniformLocation, scale);

        this.extraOffset = extraOffset;

        pollError(this.gl, "setupResolution");
    }

    drawCircle(cx, cy, innerRadius, outerRadius, color) {
        if (this.numCircles >= MAX_CIRCLES) {
            this.drawBufferedCircles();
        }

        let index = this.numCircles * 8;
        this.circleData[index] = cx + this.extraOffset[0];
        this.circleData[index + 1] = cy + this.extraOffset[1];
        this.circleData[index + 2] = innerRadius;
        this.circleData[index + 3] = outerRadius;
        this.circleData[index + 4] = color[0];
        this.circleData[index + 5] = color[1];
        this.circleData[index + 6] = color[2];
        this.circleData[index + 7] = color[3];

        this.numCircles++;
    }

    drawBufferedCircles() {
        //console.log("Drawing " + this.numCircles + " circles");
        this.gl.useProgram(this.program);
        this.gl.bindVertexArray(this.vertexArray);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceAttribBuffer);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.circleData.subarray(0, this.numCircles * 8));

        this.gl.drawElementsInstanced(this.gl.TRIANGLES, this.indices.length, this.gl.UNSIGNED_SHORT, 0, this.numCircles);

        this.numCircles = 0;
    }
}

async function loadAllData() {
    let circleUrl = "circles/anatol.json";
    if (Math.random() < 10.01) {
        circleUrl = "circles/troll.json";
    }

    let vertexShaderUrl = "/projects/fourier/shaders/vertex.glsl";
    let fragShaderUrl = "/projects/fourier/shaders/fragment.glsl";

    let basicVertexShaderUrl = "/projects/fourier/shaders/vertex_circle.glsl";
    let basicFragShaderUrl = "/projects/fourier/shaders/fragment_circle.glsl";

    let circlePromise = fetch(circleUrl).then(res => res.json());
    let vertexShaderPromise = fetch(vertexShaderUrl).then(res => res.text());
    let fragShaderPromise = fetch(fragShaderUrl).then(res => res.text());
    let basicVertexShaderPromise = fetch(basicVertexShaderUrl).then(res => res.text());
    let basicFragShaderPromise = fetch(basicFragShaderUrl).then(res => res.text());

    let [circleData, vertexShader, fragShader, basicVertexShader, basicFragShader] = await Promise.all([
        circlePromise,
        vertexShaderPromise,
        fragShaderPromise,
        basicVertexShaderPromise,
        basicFragShaderPromise
    ]);

    return {
        circleData: circleData,
        vertexShader: vertexShader,
        fragShader: fragShader,
        basicVertexShader: basicVertexShader,
        basicFragShader: basicFragShader
    }
}

function tryResizeCanvas(canvas) {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;

        return true;
    }

    return false;
}

window.onload = () => {
    const canvas = document.getElementById("canvas");
    tryResizeCanvas(canvas);

    const gl = canvas.getContext("webgl2", { antialias: true });
    if (!gl) {
        console.error("WebGL2 not supported");
        return;
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    loadAllData().then(data => {
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

        circleData.sort((a, b) => a.offset[0] < b.offset[0] ? -1 : 1);

        let drawers = [];
        let minx = 5000, miny = 5000;
        let maxx = 0, maxy = 0;

        for (const i in circleData) {
            const obj = circleData[i];
            let hue = (240 + i * 10) % 360;

            let drawer = new FourierDrawer([SCALE, SCALE], obj.offset, obj.circles, hue);
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
    });
}
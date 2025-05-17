function f(omega) {
    const SIZE = 30;
    x = line_ft(new Complex(0, 0), new Complex(0, SIZE), 0, 4, omega);
    x = x.add(line_ft(new Complex(0, SIZE), new Complex(SIZE, 0), 1, 4, omega));
    x = x.add(line_ft(new Complex(SIZE, SIZE), new Complex(0, -SIZE), 2, 4, omega));
    x = x.add(line_ft(new Complex(SIZE, 0), new Complex(-SIZE, 0), 3, 4, omega));
    return x;
}

FONT_CACHE = {};
PENDING_FONTS = {};

let renderStart;

async function getFont(url) {
    if (FONT_CACHE[url]) {
        return FONT_CACHE[url];
    }

    if (PENDING_FONTS[url]) {
        return await PENDING_FONTS[url];
    }

    const promise = fetch(url).then(
        res => res.arrayBuffer()
    ).then(
        buffer => opentype.parse(buffer)
    ).catch(err => {
        console.error("Error loading font", err.message);
        console.error(err.stack);
        return null;
    });

    PENDING_FONTS[url] = promise;

    const font = await promise;

    FONT_CACHE[url] = font;
    delete PENDING_FONTS[url];

    return font;
}

async function updateLiveFourierText(newText, resetTime = true) {
    const FONT_URL = "https://fonts.gstatic.com/s/baumans/v17/-W_-XJj9QyTd3QfpR_oyaksqY5Q.ttf";
    const font = await getFont(FONT_URL);

    if (!font) {
        console.error("Error loading font");
        return;
    }

    FREQ_RANGE = 20;

    const path = font.getPath(newText, 0, 0, 72);
    
    const pathParts = [[]]; // Split path on move instructions
    const pathElements = path.commands;

    for (const command of pathElements) {
        if (command.type === 'M') {
            if (pathParts[pathParts.length - 1].length > 0) {
                pathParts.push([]);
            }
        }

        pathParts[pathParts.length - 1].push(command);
    }

    const nonEmptyParts = pathParts.filter(part => part.length > 0);

    const data = []

    for (const part of nonEmptyParts) {
        const startingPosition = [part[0].x, part[0].y];

        let lastPosition = startingPosition;

        // Remove first element and any Z instructions that do nearly nothing
        const actualCommands = [];

        for (let i = 1; i < part.length; i++) {
            const command = part[i];
            if (command.type === 'Z') {
                if (Math.abs(command.x - lastPosition[0]) < 1e-5 && Math.abs(command.y - lastPosition[1]) < 1e-5) {
                    continue;
                }
            }

            actualCommands.push(command);
            lastPosition = [command.x, command.y];
        }

        const N = actualCommands.length;
        lastPosition = startingPosition;

        const pathFourierTransforms = new Array(actualCommands.length);
        for (let i = 0; i < actualCommands.length; i++) {
            const command = actualCommands[i];

            if (command.type === 'L') {
                const newPosition = [command.x, command.y];
                
                const startingComplex = a2c(lastPosition);
                const endingComplex = a2c(newPosition);
                const delta = endingComplex.subtract(startingComplex);

                pathFourierTransforms[i] = (omega) => line_ft(startingComplex, delta, i, N, omega);
                lastPosition = newPosition;
            } else if (command.type === 'Z') {
                const newPosition = startingPosition;
                
                const startingComplex = a2c(lastPosition);
                const endingComplex = a2c(newPosition);
                const delta = endingComplex.subtract(startingComplex);

                pathFourierTransforms[i] = (omega) => line_ft(startingComplex, delta, i, N, omega);
                lastPosition = newPosition;
            } else if (command.type === 'C') {
                const newPosition = [command.x, command.y];
                const control1 = [command.x1, command.y1];
                const control2 = [command.x2, command.y2];

                const startingComplex = a2c(lastPosition);
                const endingComplex = a2c(newPosition);
                const control1Complex = a2c(control1);
                const control2Complex = a2c(control2);

                pathFourierTransforms[i] = (omega) => bezier_ft(startingComplex, control1Complex, control2Complex, endingComplex, i, N, omega);
                lastPosition = newPosition;
            } else if (command.type === 'Q') {
                const newPosition = [command.x, command.y];
                const control = [command.x1, command.y1];

                const startingComplex = a2c(lastPosition);
                const endingComplex = a2c(newPosition);
                const controlComplex = a2c(control);

                // Turn the quadratic bezier into a cubic bezier
                const control1Complex = startingComplex.add(controlComplex.subtract(startingComplex).scalarMultiply(2/3));
                const control2Complex = endingComplex.add(controlComplex.subtract(endingComplex).scalarMultiply(2/3));

                pathFourierTransforms[i] = (omega) => bezier_ft(startingComplex, control1Complex, control2Complex, endingComplex, i, N, omega);
                lastPosition = newPosition;
            } else if (command.type === 'A') {
                alert("Arc commands are not supported yet");
                console.error("Arc commands are not supported yet");
                return;
            } else {
                console.error("Unknown command type:", command.type);
                return;
            }
        }
    
        const circles = [];
        for (let f = -FREQ_RANGE; f <= FREQ_RANGE; f++) {
            const omega = f * Math.PI * 2;
            let val = new Complex(0, 0);
            for (let i = 0; i < pathFourierTransforms.length; i++) {
                const contribution = pathFourierTransforms[i](omega);
                // Check if is nan
                if (isNaN(contribution.real) || isNaN(contribution.imag)) {
                    console.error(`NaN contribution for f=${f}, i=${i}, omega=${omega}, command=${actualCommands[i].type}`);
                    continue;
                }
                val = val.add(pathFourierTransforms[i](omega));
            }
            circles.push([f, val.real, val.imag]);
        }

        circles.sort((a, b) => a[1]*a[1] + a[2]*a[2] > b[1]*b[1] + b[2]*b[2] ? -1 : 1);
        data.push({
            offset: [0, 0],
            circles: circles
        });
    }

    liveFourierContext.setData(data);

    if (resetTime) {
        renderStart = new Date();
    }
}

let liveFourierContext;

window.onload = async () => {
    const canvas = document.getElementById("canvas");
    
    liveFourierContext = new CanvasFourierDrawingContext(canvas);
    await liveFourierContext.loadShaders();

    let text = "Your text here!";
    const elm = document.getElementById("fourier-text-input");
    if (elm.value !== "") {
        text = elm.value;
    }
    await updateLiveFourierText(text)

    function renderCallback() {
        let time = new Date();
        let t = (time.getTime() - renderStart.getTime()) * 0.001 * 0.1;
        liveFourierContext.draw(t);
        requestAnimationFrame(renderCallback);
    }

    requestAnimationFrame(renderCallback);
}
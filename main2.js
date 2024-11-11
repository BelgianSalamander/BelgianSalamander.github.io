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

class FourierDrawer {
    constructor(scale, offset, circles, hue) {
        this.scale = scale;
        this.offset = offset;
        this.secondaryOffset = [0, 0];
        this.circles = circles;

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

            let gradient = ctx.createLinearGradient(this.points[start][0], this.points[start][1], this.points[end][0], this.points[end][1]);
            gradient.addColorStop(0, startColor);
            gradient.addColorStop(1, endColor);

            ctx.strokeStyle = gradient;
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
        let prevPos = [0, 0];

        ctx.strokeStyle = "#7772";
        ctx.fillStyle = "#000d";
        
        //ctx.moveTo(0, 0)
        ctx.lineWidth = 0.5;

        for (const i in this.circles) {
            const circle = this.circles[i];
            const freq = circle[0];
            const real = circle[1];
            const imag = circle[2];
            const mag = Math.hypot(real, imag);

            const x = t * freq * 2 * Math.PI;
            let dx = Math.cos(x) * real - Math.sin(x) * imag;
            let dy = Math.sin(x) * real + Math.cos(x) * imag;

            let newPos = [prevPos[0] + dx, prevPos[1] + dy];

            //ctx.lineTo(newPos[0], newPos[1]);
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
};

function renderState(t) {
    t = t % 1;
    const canvas = document.getElementById("canvas");

    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;

    let ctx = canvas.getContext("2d");
    ctx.resetTransform();
    ctx.lineJoin = "round";
    ctx.lineWidth = 1.0;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.translate(20, 20);
    ctx.scale(1.5, 1.5);

    const COLORS = [
        /*"#2200ff",
        "#152cff",
        "#375bff",
        "#506aff",
        "#5fbfff",
        "#79c3ff"*/
    ];

    const COUNT = 50;

    for (let i = 0; i < COUNT; i++) {
        COLORS.push(`hsl(240, 100%, ${50 + i / COUNT * 50}%)`);
    }

    const segmentFraction = 0.02;
    const segmentStarts = [];

    for (const i in COLORS) {
        segmentStarts.push((Math.round((t * points.length - i * segmentFraction * points.length)) % points.length + points.length) % points.length);
    }

    for (let i = COLORS.length - 1; i >= 0; i--) {
        let start = segmentStarts[i];
        let end;

        if (i == COLORS.length - 1) {
            end = (start - Math.round(segmentFraction * points.length) + points.length) % points.length;
        } else {
            end = segmentStarts[i+1];
        }

        ctx.strokeStyle = COLORS[i];
        ctx.beginPath();
        ctx.moveTo(...points[start]);

        for (let i = (start - 1 + points.length) % points.length; i != end; i = (i - 1 + points.length) % points.length) {
            ctx.lineTo(...points[i]);
        }

        ctx.lineTo(...points[end]);

        ctx.stroke();
    }

    /*ctx.strokeStyle = "#20f";
    ctx.beginPath();
    ctx.moveTo(...points[0]);

    for (let i = 1; i < points.length * t; i++) {
        ctx.lineTo(...points[i]);
    }

    ctx.stroke();*/

    let prevPos = [0, 0];

    ctx.strokeStyle = "#7774";
    
    //ctx.moveTo(0, 0)
    ctx.lineWidth = 0.5;

    for (circle of CIRCLES) {
        const freq = circle[0];
        const real = circle[1];
        const imag = circle[2];
        const mag = Math.hypot(real, imag);

        const x = t * freq * 2 * Math.PI;
        let dx = Math.cos(x) * real - Math.sin(x) * imag;
        let dy = Math.sin(x) * real + Math.cos(x) * imag;

        let newPos = [prevPos[0] + dx, prevPos[1] + dy];

        //ctx.lineTo(newPos[0], newPos[1]);
        ctx.beginPath();
        ctx.ellipse(prevPos[0], prevPos[1], mag, mag, 0, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(newPos[0], newPos[1], 0.5, 0.5, 0, 0, 2 * Math.PI);
        ctx.fill();

        prevPos = newPos;
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

const choices = [
    "/circles/anatol.json",
    "/circles/anatol.json",
    "/circles/anatol.json",
    "/circles/anatol.json",
    "/circles/anatol.json",
    "/circles/anatol.json",
    "/circles/anatol.json",
    "/circles/anatol.json",
    "/circles/salamander.json",
    "/circles/troll.json"
];

window.onload = () => {
    fetch(choices[Math.floor(Math.random() * choices.length)]).then(res => res.json()).then(data => {
        data.sort((a, b) => a.offset[0] < b.offset[0] ? -1 : 1);
        console.log(data);

        let canvas = document.getElementById("canvas");
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        let drawers = [];
        let minx = 5000, miny = 5000;
        let maxx = 0, maxy = 0;

        for (const i in data) {
            const obj = data[i];
            let hue = (240 + i * 10) % 360;

            let drawer = new FourierDrawer([SCALE, SCALE], obj.offset, obj.circles, hue);
            drawers.push(drawer);

            for (point of drawer.points) {
                minx = Math.min(minx, point[0] + obj.offset[0]);
                miny = Math.min(miny, point[1] + obj.offset[1]);
                maxx = Math.max(maxx, point[0] + obj.offset[0]);
                maxy = Math.max(maxy, point[1] + obj.offset[1]);
            }
        }

        let centerx = ((maxx + miny) / 2) * SCALE;
        let centery = ((maxy + miny) / 2) * SCALE;

        console.log(centerx, centery);
        console.log(minx, maxx);

        for (const i in data) {
            console.log((canvasWidth / 2) - centerx);
            drawers[i].secondaryOffset = [
                (canvasWidth / 2) - centerx,
                (canvasHeight / 2) - centery
            ];
        }

        let permutation = [...Array(drawers.length).keys()];
        shuffle(permutation);

        setInterval(() => {
            let ctx = canvas.getContext("2d");
            ctx.resetTransform();
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
            t += 0.001;

            let easing = (x) => {
                if (x < 0.5) return x * x;
                else return x - 0.25;
            };
            
            for (const i in drawers) {
                drawers[i].renderState(easing(Math.max(0, t - permutation[i] * 0.02)), ctx);
            }
        }, 10)
    });
}
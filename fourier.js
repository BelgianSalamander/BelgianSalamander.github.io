let url = "circles/anatol.json";

SVG_NS = "http://www.w3.org/2000/svg";

fetch(url).then(res => res.json()).then(data => {
    data.sort((a, b) => a.offset[0] < b.offset[0] ? -1 : 1);
    console.log(data);

    const container = document.getElementById("fourier-drawer-container");
    
    const target = document.createElementNS(SVG_NS, "svg");
    target.id = "fourier-drawer";
    target.setAttributeNS(null, "width", "1000");
    target.setAttributeNS(null, "height", "500");
    target.setAttributeNS(null, "viewBox", "0 0 333 167");

    const filter = document.createElement("filter");
    filter.id = "Darken"

    container.appendChild(target);

    for (const letter of data) {
        let offset = letter["offset"];

        const points = [];
        const NUM_POINTS = 200;
        for (let i = 0; i < NUM_POINTS; i++) {
            let t = i * 2 * Math.PI / NUM_POINTS;

            let x = 0;
            let y = 0;

            for (circle of letter["circles"]) {
                let freq = circle[0];
                let xi = circle[1];
                let yi = circle[2];

                const wt = t * freq;

                let dx = Math.cos(wt) * xi - Math.sin(wt) * yi;
                let dy = Math.sin(wt) * xi + Math.cos(wt) * yi;

                x += dx;
                y += dy;
            }

            points.push([x, y]);
        }

        console.log(points);
        
        let root = document.createElementNS(SVG_NS, "g");
        root.setAttribute("transform", `translate(${offset[0]}, ${offset[1]})`);
        target.appendChild(root);

        for (let i = 0; i < NUM_POINTS; i++) {
            let p1 = points[i];
            let p2 = points[(i+1)%NUM_POINTS];
            let p0 = points[(i+NUM_POINTS-1)%NUM_POINTS];

            let t = i / NUM_POINTS;

            let line = document.createElementNS(SVG_NS, "line");
            line.setAttribute("x1", `${p1[0]}`);
            line.setAttribute("y1", `${p1[1]}`);
            line.setAttribute("x2", `${p2[0]}`);
            line.setAttribute("y2", `${p2[1]}`);
            line.setAttribute("stroke", "#ffffff");

            root.appendChild(line);

            const animation = document.createElementNS(SVG_NS, "animate");
            animation.setAttribute("attributeName", "stroke");
            animation.setAttribute("values", "#0000ff;#ffffff");
            animation.setAttribute("dur", "10s");
            animation.setAttribute("begin", `${t * 10}s`)
            animation.setAttribute("repeatCount", "indefinite");

            line.appendChild(animation);

            let v1 = [p2[0] - p1[0], p2[1] - p1[1]];
            let v2 = [p1[0] - p0[0], p1[1] - p0[1]];

            let dot = v1[0] * v2[1] - v1[1] * v2[0];
            dot = dot / (Math.hypot(v1[0], v1[1]) * Math.hypot(v2[0], v2[1]));
            console.log(dot);

            if (Math.abs(dot) > 0.05) {
                let cap = document.createElementNS(SVG_NS, "circle");
                cap.setAttribute("cx", `${p1[0]}`);
                cap.setAttribute("cy", `${p1[1]}`);
                cap.setAttribute("r", "0.5");
                cap.setAttribute("fill", "#ffffff");

                root.insertBefore(cap, root.childNodes[0]);

                const animation2 = document.createElementNS(SVG_NS, "animate");
                animation2.setAttribute("attributeName", "fill");
                animation2.setAttribute("values", "#0000ff;#ffffff");
                animation2.setAttribute("dur", "10s");
                animation2.setAttribute("begin", `${t * 10}s`)
                animation2.setAttribute("repeatCount", "indefinite");

                cap.appendChild(animation2);
            }
        }

        let parent = document.createElementNS(SVG_NS, "g");
        root.appendChild(parent);

        let extraSpin = 0;

        for (circle of letter["circles"]) {
            const centerPoint = document.createElementNS(SVG_NS, "circle");
            centerPoint.setAttribute("cx", "0");
            centerPoint.setAttribute("cy", "0");
            centerPoint.setAttribute("r", "0.5");
            centerPoint.setAttribute("fill", "#000d");

            let freq = circle[0];
            let xi = circle[1];
            let yi = circle[2];

            let mag = Math.sqrt(xi * xi + yi * yi);

            const outerCircle = document.createElementNS(SVG_NS, "circle");
            outerCircle.setAttribute("cx", "0");
            outerCircle.setAttribute("cy", "0");
            outerCircle.setAttribute("r", `${mag}`);
            outerCircle.setAttribute("fill", "none");
            outerCircle.setAttribute("stroke", "#7772");

            const nextContainer = document.createElementNS(SVG_NS, "g");
            nextContainer.setAttribute("transform", `translate(${xi}, ${yi})`);

            if (freq) {
                const correctFreq = freq - extraSpin;
                if (Math.abs(correctFreq) < 0.1) {
                    console.log(":(");
                }

                const animation = document.createElementNS(SVG_NS, "animateTransform");
                animation.setAttribute("attributeName", "transform");
                animation.setAttribute("type", "rotate");
                animation.setAttribute("begin", "0s");
                animation.setAttribute("dur", `${10 / Math.abs(correctFreq)}s`);
                if (correctFreq > 0) {
                    animation.setAttribute("from", "0 0 0");
                    animation.setAttribute("to", "360 0 0");
                } else {
                    animation.setAttribute("from", "360 0 0");
                    animation.setAttribute("to", "0 0 0");
                }
                animation.setAttribute("repeatCount", "indefinite");
                parent.appendChild(animation);

                extraSpin += correctFreq;

                parent.appendChild(centerPoint);
                parent.appendChild(outerCircle);
            }

            parent.appendChild(nextContainer);

            const rotateable = document.createElementNS(SVG_NS, "g");
            nextContainer.appendChild(rotateable);

            parent = rotateable;
        }
    }
});
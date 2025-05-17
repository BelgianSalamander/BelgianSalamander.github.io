class Complex {
    constructor(real, imag) {
        this.real = real;
        this.imag = imag;
    }

    add(other) {
        return new Complex(this.real + other.real, this.imag + other.imag);
    }

    subtract(other) {
        return new Complex(this.real - other.real, this.imag - other.imag);
    }

    multiply(other) {
        return new Complex(
            this.real * other.real - this.imag * other.imag,
            this.real * other.imag + this.imag * other.real
        );
    }

    scalarMultiply(scalar) {
        return new Complex(this.real * scalar, this.imag * scalar);
    }

    scalarDivide(scalar) {
        return new Complex(this.real / scalar, this.imag / scalar);
    }

    magnitude() {
        return Math.sqrt(this.real ** 2 + this.imag ** 2);
    }

    exp() {
        let realPart = Math.exp(this.real);
        return new Complex(
            realPart * Math.cos(this.imag),
            realPart * Math.sin(this.imag)
        );
    }

    reciprocal() {
        let denom = this.real ** 2 + this.imag ** 2;
        return new Complex(this.real / denom, -this.imag / denom);
    }

    toString() {
        return `${this.real} + ${this.imag}i`;
    }
}

function a2c(a) {
    return new Complex(a[0], a[1]);
}

const I = new Complex(0, 1);

function factorial(n) {
    if (n <= 1) {
        return 1;
    }
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function X_hat(omega, a, b) {
    if (Math.abs(omega) < 1e-10) {
        return new Complex(b - a, 0);
    } else {
        let ea = (new Complex(0, -a * omega)).exp();
        let eb = (new Complex(0, -b * omega)).exp();

        return I.scalarMultiply(1 / omega).multiply(eb.subtract(ea));
    }
}

function Y_hat(omega, a, b) {
    if (Math.abs(omega) < 1e-10) {
        return new Complex(0.5 * (b*b - a * a), 0);
    } else {
        let ea = (new Complex(0, -a * omega)).exp().scalarMultiply(a);
        let eb = (new Complex(0, -b * omega)).exp().scalarMultiply(b);

        return I.scalarMultiply(1 / omega).multiply(eb.subtract(ea)).subtract(I.scalarMultiply(1 / omega).multiply(X_hat(omega, a, b)));
    }
}

function Z_hat(omega, alpha, beta, a, b) {
    if (Math.abs(omega) < 1e-10) {
        let val = factorial(alpha) * factorial(beta) / factorial(alpha + beta + 1) * Math.pow(b - a, alpha + beta + 1);
        return new Complex(val, 0);
    } else if (alpha == 0 && beta == 0) {
        return X_hat(omega, a, b);
    } else if (alpha == 0) {
        return I.scalarMultiply(-Math.pow(b - a, beta) / omega).multiply((new Complex(0, - a * omega)).exp()).add(I.scalarMultiply(beta / omega).multiply(Z_hat(omega, 0, beta - 1, a, b)));
    } else if (beta == 0) {
        //return I.scalarMultiply(1 / omega) * Math.pow(b - a, alpha) * (new Complex(0, - b * omega)).exp().add(I.scalarMultiply(-alpha / omega) * Z_hat(omega, alpha - 1, 0, a, b));
        return I.scalarMultiply(Math.pow(b - a, alpha) / omega).multiply((new Complex(0, - b * omega)).exp()).add(I.scalarMultiply(-alpha / omega).multiply(Z_hat(omega, alpha - 1, 0, a, b)));
    } else {
        return I.scalarMultiply(beta / omega).multiply(Z_hat(omega, alpha, beta - 1, a, b)).add(I.scalarMultiply(-alpha / omega).multiply(Z_hat(omega, alpha - 1, beta, a, b)));
    }
}

function W_hat(omega, p, a, b) {
    // If p is a number, make it complex
    if (typeof p === 'number') {
        p = new Complex(p, 0);
    }

    let diff = p.subtract(new Complex(0, omega));

    if (diff.magnitude() < 1e-10) {
        return new Complex(b - a, 0);
    } else {
        let ea = diff.scalarMultiply(a).exp();
        let eb = diff.scalarMultiply(b).exp();

        return diff.reciprocal().multiply(eb.subtract(ea));
    }
}

function line_ft(a, v, k, N, omega) {
    let constantTerm = (a.subtract(v.scalarMultiply(k))).multiply(X_hat(omega, k / N, (k+1) / N));
    let linearTerm = v.scalarMultiply(N).multiply(Y_hat(omega, k / N, (k+1) / N));

    return constantTerm.add(linearTerm);
}

function bezier_ft(p0, p1, p2, p3, k, N, omega) {
    let a = k / N;
    let b = (k + 1) / N;

    let c0 = Z_hat(omega, 0, 3, a, b);
    let c1 = Z_hat(omega, 1, 2, a, b).scalarMultiply(3);
    let c2 = Z_hat(omega, 2, 1, a, b).scalarMultiply(3);
    let c3 = Z_hat(omega, 3, 0, a, b);

    let p0Term = c0.multiply(p0);
    let p1Term = c1.multiply(p1);
    let p2Term = c2.multiply(p2);
    let p3Term = c3.multiply(p3);

    let total = p0Term.add(p1Term).add(p2Term).add(p3Term);

    return total.scalarMultiply(N * N * N);
}

function arc_ft(C, alpha, theta_0, d_theta, rx, ry, k, N, omega) {
    let a = k / N;
    let b = (k + 1) / N;

    let centerTerm = C.multiply(X_hat(omega, a, b));

    // C \cdot \hat{X}(\omega_n, a, b) + \frac{1}{2} \left(r_x + r_y\right) e^{\left(\alpha+\theta_0-a\Delta\theta\right)i} \cdot \hat{W}(\omega_n, N\Delta\theta i, a, b) + \frac{1}{2} (r_x - r_y) e^{\left(\alpha - \theta_0 + a \Delta\theta\right)i} \cdot \hat{W}(\omega_n, -N\Delta \theta i,a,b)

    let firstEllipseTerm = (new Complex(0, alpha + theta_0 - a * d_theta)).exp().scalarMultiply((rx + ry) / 2).multiply(W_hat(omega, I.scalarMultiply(N * d_theta), a, b));
    let secondEllipseTerm = (new Complex(0, alpha - theta_0 + a * d_theta)).exp().scalarMultiply((rx - ry) / 2).multiply(W_hat(omega, I.scalarMultiply(-N * d_theta), a, b));
    let total = centerTerm.add(firstEllipseTerm).add(secondEllipseTerm);

    return total;
}
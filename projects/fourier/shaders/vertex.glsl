precision mediump float;

// an attribute will receive data from a buffer
attribute vec2 a_position;
attribute float a_t;

uniform vec2 u_resolution;
uniform float u_extraScale;
uniform vec2 u_offset;
uniform float u_time;

varying float v_t;
     
// all shaders have a main function
void main() {
    // Map from pixel space (resolution) to -1.0 to +1.0
    // Normalized device coordinates
    vec2 zeroToOne = (a_position + u_offset) / u_resolution;
    // convert to 0.0 to 2.0
    vec2 zeroToTwo = zeroToOne * 2.0;
    // convert to -1.0 to +1.0
    vec2 clipSpace = (zeroToTwo - 1.0) * u_extraScale;

    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    float t = a_t + u_time;
    if (t < 1.0) {
        v_t = 1.0;
    } else {
        v_t = mod(t, 1.0);
    }
}
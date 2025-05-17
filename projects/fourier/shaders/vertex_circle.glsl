precision mediump float;

// an attribute will receive data from a buffer
attribute vec2 a_position;
attribute float a_outer;

uniform vec2 u_resolution;
uniform float u_extraScale;

attribute vec2 a_offset;
attribute float a_innerRadius;
attribute float a_outerRadius;
attribute vec4 a_color;

varying vec4 v_color;
     
// all shaders have a main function
void main() {
    float radius = mix(a_innerRadius, a_outerRadius, a_outer);
    vec2 pos = a_position * radius;

    vec2 zeroToOne = (pos + a_offset) / u_resolution;
    // convert to 0.0 to 2.0
    vec2 zeroToTwo = zeroToOne * 2.0;
    // convert to -1.0 to +1.0
    vec2 clipSpace = (zeroToTwo - 1.0) * u_extraScale;

    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

    v_color = a_color;
}
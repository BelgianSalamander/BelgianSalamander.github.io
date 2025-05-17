// fragment shaders don't have a default precision so we need
// to pick one. mediump is a good default. It means "medium precision"
precision mediump float;

uniform vec3 u_baseColor;

// Get varying v_t
varying float v_t;
     
void main() {
  float brightness = max(0.0, v_t);

  vec3 lightenedColor = mix(u_baseColor, vec3(1.0), brightness);

  gl_FragColor = vec4(lightenedColor, 1.0);
}
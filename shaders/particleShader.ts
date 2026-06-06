export const PARTICLE_VERTEX = /* glsl */ `
  attribute float aRandom;
  attribute vec3  aColor;

  uniform float uTime;
  uniform float uSize;

  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;

    float t    = uTime * 0.4;
    float seed = aRandom;

    // Smooth figure-eight float
    vec3 pos = position;
    pos.y += sin(seed * 94.7 + t * 0.8) * 0.55;
    pos.x += sin(seed * 71.3 + t * 0.6) * 0.30;
    pos.z += cos(seed * 53.1 + t * 0.5) * 0.30;

    // Fade near top / bottom edges
    vAlpha = 1.0 - abs(pos.y / 10.0);
    vAlpha = clamp(vAlpha, 0.0, 1.0);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * (130.0 / -mv.z);
    gl_Position  = projectionMatrix * mv;
  }
`

export const PARTICLE_FRAGMENT = /* glsl */ `
  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    vec2  coord = gl_PointCoord - vec2(0.5);
    float dist  = length(coord);
    if (dist > 0.5) discard;

    // Soft radial falloff
    float alpha = (1.0 - smoothstep(0.18, 0.5, dist)) * vAlpha * 0.55;
    gl_FragColor = vec4(vColor, alpha);
  }
`

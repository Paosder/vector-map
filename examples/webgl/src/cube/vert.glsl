// be careful.
// https://stackoverflow.com/questions/38172696/should-i-ever-use-a-vec3-inside-of-a-uniform-buffer-or-shader-storage-buffer-o

// surface.
attribute vec3 a_surface;

// instanced data.
attribute vec3 a_position;
attribute vec4 a_color;
attribute vec4 a_rotation;

varying vec4 v_color;

void main() {
  gl_Position = vec4(a_position * 0.5, 1);
  gl_PointSize = 10.0;
  v_color = a_color;
}

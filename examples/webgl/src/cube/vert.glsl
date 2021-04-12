// be careful.
// https://stackoverflow.com/questions/38172696/should-i-ever-use-a-vec3-inside-of-a-uniform-buffer-or-shader-storage-buffer-o

// surface.
attribute vec3 a_surface;

// instanced data.
attribute vec3 a_position;
attribute vec4 a_color;
attribute vec4 a_rotation;

uniform mat4 u_camera;
uniform mat4 u_projection;

varying vec4 v_color;

void main() {
  gl_Position = u_camera * u_projection * vec4(a_position + a_surface, 1);
  v_color = a_rotation; // test
  v_color = a_color;
}

// be careful.
// https://stackoverflow.com/questions/38172696/should-i-ever-use-a-vec3-inside-of-a-uniform-buffer-or-shader-storage-buffer-o

// surface.
attribute vec3 a_surface;

// instanced data.
attribute vec3 a_position;
attribute vec4 a_color;
attribute mat4 a_rotation;
attribute float a_size;

uniform mat4 u_transform;

varying vec4 v_color;

void main() {
  gl_Position = u_transform * a_rotation * vec4((a_position + a_surface) * a_size, 1);
  gl_Position = u_transform * a_rotation * vec4((a_position + a_surface) * a_size, 1);
  v_color = a_color;
}

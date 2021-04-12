/**
 * Create identity matrix.
 * @param mat matrix array.
 * @param n row count: nxn.
 */
export function generateIdentityMatrix(n: number) {
  const mat = new Float32Array(n * n);
  for (let i = 0; i < n; i += 1) {
    mat[i * (n + 1)] = 1;
  }
  return mat;
}

/**
 * multiply two matrices.
 * @param A matrix A.
 * @param B matrix B.
 * @param C multiplied matrix C.
 * @param aCol column count of A.
 */
export function multiplyMatrix(A: Float32Array, B: Float32Array, C: Float32Array, aCol: number) {
  const aRow = A.length / aCol;
  const bCol = B.length / aCol;
  let acc = 0;
  for (let i = 0; i < aRow; i += 1) {
    for (let j = 0; j < aCol; j += 1) {
      for (let k = 0; k < bCol; k += 1) {
        acc += A[i + k * aRow] * B[k + j * aCol];
      }
      C[i + j * aRow] = acc; // [i, j]
      acc = 0;
    }
  }
  return C;
}

/**
 * multiply matrix A and vector x.
 * @param A Matrix to multiply.
 * @param x vector to multiply.
 * @param b result vector.
 * @returns b
 */
export function computeAx(A: Float32Array, x: Float32Array, b: Float32Array): Float32Array {
  const col = x.length;
  if (b.length < col) {
    throw new Error('small array size to compute: \'b\'');
  }
  const row = A.length / col;
  b.fill(0);
  for (let i = 0; i < row; i += 1) {
    for (let j = 0; j < col; j += 1) {
      b[i] += A[j * row + i] * x[j];
    }
  }
  return b;
}

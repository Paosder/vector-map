export type MapSource<U, V> = {key: U, value: V};

export class VectorMap<U, V> {
  pointer: Map<U, number>;

  source: Array<MapSource<U, V>>;

  constructor(arr?: Array<[U, V]>) {
    this.source = arr?.map<MapSource<U, V>>((el) => {
      if (typeof el === 'object' && el[0] && el[1]) {
        return {
          key: el[0],
          value: el[1],
        };
      }
      throw Error('wrong type of object');
    }) ?? [];
    this.pointer = new Map(arr?.map<[U, number]>((el, i) => [el[0], i]));

    this.forEach = this.forEach.bind(this);
    this.map = this.map.bind(this);
    this.reduce = this.reduce.bind(this);
    this.delete = this.delete.bind(this);
    this.clear = this.clear.bind(this);
    this.swap = this.swap.bind(this);
    this.swapIndex = this.swapIndex.bind(this);
    this.swapPointer = this.swapPointer.bind(this);
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.getIndex = this.getIndex.bind(this);
    this.set = this.set.bind(this);
    this.pop = this.pop.bind(this);
  }

  forEach(callback: (data: MapSource<U, V>, index: number, arr: Array<MapSource<U, V>>) => any) {
    this.pointer.forEach((index) => {
      callback(this.source[index], index, this.source);
    });
  }

  map<T>(mapFunc: (data: MapSource<U, V>, index: number, arr: Array<MapSource<U, V>>) => T): Array<T> {
    const result: Array<T> = [];
    this.pointer.forEach((index) => {
      result.push(mapFunc(this.source[index], index, this.source));
    });
    return result;
  }

  reduce<T>(reducer: (acc: T, data: MapSource<U, V>, index: number,
    arr: Array<MapSource<U, V>>) => T, accumulator: T): T {
    let res: T = accumulator;
    this.pointer.forEach((index) => {
      res = reducer(res, this.source[index], index, this.source);
    });
    return res;
  }

  * [Symbol.iterator]() {
    for (let i = 0; i < this.source.length; i += 1) {
      yield this.source[i];
    }
  }

  /**
   * Swap item with tail and remove it from map.
   * @param key key.
   * @param callback calls callback when item swapped with tail.
   */
  delete(key: U, callback?: (swapped: MapSource<U, V>, deleted: MapSource<U, V>) => any): boolean {
    const targetIndex = this.pointer.get(key);
    let swapped = false;
    if (targetIndex === undefined) {
      return false;
    } if (targetIndex < this.source.length - 1) {
      this.swapIndex(key);
      swapped = true;
    }
    const removed = this.source.pop()!;

    if (callback && swapped) {
      callback(this.source[targetIndex], removed);
    }
    // @ts-ignore
    removed.key = undefined;
    this.pointer.delete(key);
    return true;
  }

  /**
   * clear map.
   */
  clear() {
    this.pointer.clear();
    this.source = [];
  }

  /**
   * Swap item without preserve its order.
   * Equivalent to `swapPointer` + `swapOrder`, but more simple & efficient.
   * @param key1 key 1.
   * @param key2 key 2.
   */
  swap(key1: U, key2: U) {
    const i1 = this.pointer.get(key1);
    if (i1 === undefined) {
      throw new Error(`Key does not exists: '${key1}'`);
    }
    const i2 = this.pointer.get(key2);
    if (i2 === undefined) {
      throw new Error(`Key does not exists: '${key2}'`);
    }

    const temp = this.source[i1];
    this.source[i1] = this.source[i2];
    this.source[i1].key = key1;
    this.source[i2] = temp;
    this.source[i2].key = key2;
  }

  /**
   * Swap item with preserve its order.
   * @param key1 key 1.
   * @param key2 key 2.
   */
  swapPointer(key1: U, key2: U) {
    const i1 = this.pointer.get(key1);
    if (i1 === undefined) {
      throw new Error(`Key does not exists: '${key1}'`);
    }
    const i2 = this.pointer.get(key2);
    if (i2 === undefined) {
      throw new Error(`Key does not exists: '${key2}'`);
    }
    this.source[i1].key = key2;
    this.source[i2].key = key1;

    this.pointer.set(key1, i2);
    this.pointer.set(key2, i1);
  }

  /**
   * Swap source order.
   * @param key1 key 1.
   * @param key2 key 2.
   */
  swapIndex(key1: U, key2?: U) {
    const i1 = this.pointer.get(key1);
    if (i1 === undefined) {
      throw new Error(`Key does not exists: '${key1}'`);
    }
    let i2;
    if (key2 !== undefined) {
      i2 = this.pointer.get(key2);
      if (i2 === undefined) {
        throw new Error(`Key does not exists: '${key2}'`);
      }
    } else {
      i2 = this.source.length - 1;
    }
    this.pointer.set(this.source[i2].key, i1);
    this.pointer.set(this.source[i1].key, i2);

    const temp = this.source[i1];
    this.source[i1] = this.source[i2];
    this.source[i2] = temp;
  }

  /**
   * Get item from map.
   * @param key key.
   */
  get(key: U): V | undefined {
    const targetIndex = this.pointer.get(key);
    if (targetIndex === undefined) {
      return undefined;
    }
    return this.source[targetIndex].value;
  }

  /**
   * Get index of item.
   * @param key key.
   */
  getIndex(key: U): number | undefined {
    return this.pointer.get(key);
  }

  /**
   * add item in map and return its index.
   * @param key key.
   * @param value value.
   */
  set(key: U, value: V): number {
    let index = this.pointer.get(key);
    if (index !== undefined) {
      this.source[index].value = value;
      return index;
    }
    index = this.source.length;
    this.pointer.set(key, index);
    this.source.push({
      key,
      value,
    });
    return index;
  }

  /**
   * pop out last item like array.
   */
  pop(): MapSource<U, V> | undefined {
    if (this.source.length > 0) {
      const removed = this.source.pop()!;
      this.pointer.delete(removed.key);
      return removed;
    }
    return undefined;
  }

  get size() {
    return this.source.length;
  }
}

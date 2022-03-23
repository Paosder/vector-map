/**
 * MapSource object.
 *
 * This is the inner object which VectorMap uses to manage data.
 * Some methods return MapSource object reference directly,
 * this means you can modify it yourself if you needed.
 * But modifying `key` is strongly discouraged because
 * it could make a mangling pointer.
 */
export type MapSource<U, V> = {key: U, value: V};

export class VectorMap<U, V> {
  /**
   * Pointer map.
   *
   * It contains an index of the source array to access the target directly.
   */
  pointer: Map<U, number>;

  /**
   * Data source array.
   */
  source: Array<MapSource<U, V>>;

  /**
   * Create a new VectorMap.
   * @param arr Initial data which has pairs of key and value.
   */
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
    this.has = this.has.bind(this);
    this.set = this.set.bind(this);
    this.getIndex = this.getIndex.bind(this);
    this.set = this.set.bind(this);
    this.pop = this.pop.bind(this);
    this.shallowClone = this.shallowClone.bind(this);
  }

  /**
   * Iterate items. Same to Array.forEach in source array.
   * @param callback callback function to execute every iteration.
   */
  forEach(callback: (data: MapSource<U, V>, index: number, arr: Array<MapSource<U, V>>) => any): void {
    this.source.forEach(callback);
  }

  /**
   * Generate a new array. Same to Array.map in source array.
   * @param mapFunc map function to execute every iteration.
   * @returns Array<T>.
   */
  map<T>(mapFunc: (data: MapSource<U, V>, index: number, arr: Array<MapSource<U, V>>) => T): Array<T> {
    return this.source.map(mapFunc);
  }

  /**
   * Equivalent to Array.some.
   * @param someFunc function to execute every iteration. Must return boolean type.
   * @returns boolean.
   */
  some(someFunc: (data: MapSource<U, V>, index: number, arr: Array<MapSource<U, V>>) => boolean): boolean {
    return this.source.some(someFunc);
  }

  /**
   * Get head of map.
   */
  get head(): MapSource<U, V> | undefined {
    if (this.source.length > 0) {
      return this.source[0];
    }
    return undefined;
  }

  /**
   * Get tail of map.
   */
  get tail(): MapSource<U, V> | undefined {
    if (this.source.length > 0) {
      return this.source[this.source.length - 1];
    }
    return undefined;
  }

  /**
   * Reduce map. Same to Array.reduce in source array.
   * @param reducer reducer function to execute every iteration.
   * @param accumulator default value of accumulator.
   * @returns T
   */
  reduce<T>(reducer: (acc: T, data: MapSource<U, V>, index: number,
    arr: Array<MapSource<U, V>>) => T, accumulator: T): T {
    return this.source.reduce(reducer, accumulator);
  }

  * [Symbol.iterator]() {
    for (let i = 0; i < this.source.length; i += 1) {
      yield this.source[i];
    }
  }

  /**
   * Swap item with tail and remove it from map.
   * @param key key.
   * @param callback Calls callback when item swapped with tail. Arguments are reference of each item,
   * and 'key' is the key of map that indicates array index(pointer),
   * therefore should be careful to not modify 'key' or it could make mangling pointer.
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
   * Clear map.
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
   * Check if item exists.
   * @param key key.
   */
  has(key: U): boolean {
    return this.pointer.has(key);
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
    if (!this.source[targetIndex]) {
      throw new Error(`mangling pointer detected.
      key: '${key}', pointer: '${targetIndex}'.`);
    }
    return this.source[targetIndex].value;
  }

  /**
   * Get index(pointer) of item.
   * @param key key.
   */
  getIndex(key: U): number | undefined {
    return this.pointer.get(key);
  }

  /**
   * Add item in map and return its index.
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
   * Pop out last item like array.
   */
  pop(): MapSource<U, V> | undefined {
    if (this.source.length > 0) {
      const removed = this.source.pop()!;
      this.pointer.delete(removed.key);
      return removed;
    }
    return undefined;
  }

  /**
   * Reverse order of source array.
   */
  reverse() {
    this.source.reverse();
    this.source.forEach(({ key }, i) => {
      // reconnect pointer.
      this.pointer.set(key, i);
    });
  }

  /**
   * shallow clone itself. Useful when use with immutable state management (ex. React state).
   */
  shallowClone(): VectorMap<U, V> {
    const newMap = new VectorMap<U, V>();
    newMap.pointer = this.pointer;
    newMap.source = this.source.slice();
    return newMap;
  }

  /**
   * Size of map.
   */
  get size() {
    return this.source.length;
  }
}

/* eslint-disable no-restricted-syntax */
import { VectorMap, MapSource } from '../src/map';

describe('init', () => {
  test('init without default object', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const map = new VectorMap();
  });

  test('init with default object which has one element', () => {
    const map = new VectorMap<string, number>([['foo', 1]]);
    expect(map.size).toEqual(1);
  });

  test('init with default object which has two element', () => {
    const map = new VectorMap<string, number>([['foo', 1], ['bar', 2]]);
    expect(map.size).toEqual(2);
  });

  test('init with wrong object', () => {
    // @ts-ignore
    expect(() => new VectorMap([1, 2, 3, 4])).toThrowError();
  });
});

describe('set', () => {
  test('set items', () => {
    const map = new VectorMap<string, number>();
    map.set('foo', 1);
    map.set('bar', 2);
    map.set('baz', 3);
    expect(map.size).toEqual(3);
  });

  test('set items with duplicated keys', () => {
    const map = new VectorMap<string, number>();
    map.set('foo', 1);
    map.set('foo', 2);
    map.set('bar', 3);
    expect(map.size).toEqual(2);
  });

  test('set items with object keys', () => {
    type SomeType = {
      foo: string;
      bar: string;
    };
    const map = new VectorMap<SomeType, number>();

    map.set({
      foo: 'foo',
      bar: 'bar',
    }, 1);

    map.set({
      foo: 'foo2',
      bar: 'bar2',
    }, 2);
    expect(map.size).toEqual(2);
  });

  test('set items with duplicated object keys(swallow comp)', () => {
    type SomeType = {
      foo: string;
      bar: string;
    };
    const map = new VectorMap<SomeType, number>();

    const foo = {
      foo: 'foo',
      bar: 'bar',
    };

    const bar = {
      foo: 'foo2',
      bar: 'bar2',
    };

    map.set(foo, 1);
    map.set(bar, 2);
    map.set(foo, 2);

    expect(map.size).toEqual(2);
  });
});

describe('get', () => {
  const map = new VectorMap<string, string>();

  beforeAll(() => {
    map.set('foo', 'bar');
    map.set('bar', 'baz');
    map.set('baz', 'foo');
  });

  test('get items', () => {
    expect(map.get('foo')).toEqual('bar');
    expect(map.get('bar')).toEqual('baz');
    expect(map.get('baz')).toEqual('foo');
  });

  test('get index', () => {
    expect(map.getIndex('foo')).toEqual(0);
    expect(map.getIndex('bar')).toEqual(1);
    expect(map.getIndex('baz')).toEqual(2);
  });

  test('try to get item which doesn\'t exist', () => {
    expect(map.get('foo2')).toEqual(undefined);
    expect(map.get('foo0')).toEqual(undefined);
    expect(map.get('')).toEqual(undefined);
  });
});

describe('has', () => {
  const map = new VectorMap<string, string>();

  beforeAll(() => {
    map.set('foo', 'bar');
    map.set('bar', 'baz');
    map.set('baz', 'foo');
  });

  test('item exists', () => {
    expect(map.has('foo')).toEqual(true);
  });

  test('item exists after delete', () => {
    map.delete('bar');
    expect(map.has('foo')).toEqual(true);
  });

  test('item doesn\'t exists', () => {
    expect(map.has('hello')).toEqual(false);
  });

  test('item doesn\'t exists after delete', () => {
    map.delete('foo');
    expect(map.has('foo')).toEqual(false);
  });
});

describe('getters', () => {
  const map = new VectorMap<string, string>();

  beforeAll(() => {
    map.set('foo', 'bar');
    map.set('bar', 'baz');
    map.set('baz', 'foo');
  });

  test('head', () => {
    expect(map.head).toEqual({
      key: 'foo',
      value: 'bar',
    });
  });

  test('head with empty map', () => {
    const newMap = new VectorMap<string, string>();
    expect(newMap.head).toBeUndefined();
  });

  test('tail', () => {
    expect(map.tail).toEqual({
      key: 'baz',
      value: 'foo',
    });
  });

  test('tail with empty map', () => {
    const newMap = new VectorMap<string, string>();
    expect(newMap.tail).toBeUndefined();
  });
});

describe('delete', () => {
  const map = new VectorMap<string, string>();

  beforeEach(() => {
    map.clear();
    map.set('foo', 'bar');
    map.set('bar', 'baz');
    map.set('baz', 'foo');
  });

  test('delete item', () => {
    expect(map.delete('foo')).toEqual(true);
    expect(map.size).toEqual(2);
    expect(map.get('foo')).toEqual(undefined);
  });

  test('delete last item', () => {
    expect(map.delete('baz')).toEqual(true);
    expect(map.size).toEqual(2);
    expect(map.get('baz')).toEqual(undefined);
  });

  test('delete item which doesn\'t exist', () => {
    expect(map.delete('foo2')).toEqual(false);
    expect(map.size).toEqual(3);
  });

  test('delete item with callback', () => {
    const callback = (swapped: MapSource<string, string>, deleted: MapSource<string, string>) => {
      expect(deleted.key).toEqual('bar');
      expect(deleted.value).toEqual('baz');
      expect(swapped.key).toEqual('baz');
      expect(swapped.value).toEqual('foo');
    };
    map.delete('bar', callback);
  });
});

describe('iterate', () => {
  const map = new VectorMap<string, number>();
  const expected = [{
    key: 'foo',
    value: 1,
  }, {
    key: 'bar',
    value: 2,
  }, {
    key: 'baz',
    value: 3,
  }];

  beforeAll(() => {
    map.set('foo', 1);
    map.set('bar', 2);
    map.set('baz', 3);
  });

  test('with Symbol.iterator', () => {
    const resultValue: Array<number> = [];

    for (const t of map) {
      resultValue.push(t);
    }

    expect(resultValue).toEqual([1, 2, 3]);
  });

  test('with forEach', () => {
    const result: Array<{key: string, value: number }> = [];
    map.forEach((value, key) => {
      result.push({
        key,
        value,
      });
    });
    expect(result).toEqual(expected);
  });

  test('with map', () => {
    const result = map.map((value, key) => ({
      key,
      value,
    }));
    expect(result).toEqual(expected);
  });

  test('with some [true]', () => {
    const result = map.some((value, key) => {
      if (key === 'bar' && value === 2) {
        return true;
      }
      return false;
    });
    expect(result).toEqual(true);
  });

  test('with some [false]', () => {
    const result = map.some((value, key) => {
      if (key === 'baz' && value === 0) {
        return true;
      }
      return false;
    });
    expect(result).toEqual(false);
  });

  test('with reduce', () => {
    const result = map.reduce<Array<{key: string, value: number }>>((acc, value, key) => {
      acc.push({
        key,
        value,
      });
      return acc;
    }, []);
    expect(result).toEqual(expected);
  });

  test('with filterMap', () => {
    const result = map.filterMap((value, key) => {
      if (value > 1) {
        return key;
      }
      return undefined;
    });
    expect(result).toEqual(['bar', 'baz']);
  });
});

describe('swap', () => {
  const map = new VectorMap<string, number>();

  beforeEach(() => {
    map.clear();
    map.set('foo', 1);
    map.set('bar', 2);
    map.set('baz', 3);
  });

  test('swapIndex', () => {
    map.swapIndex('foo', 'bar');

    expect(map.get('foo')).toEqual(1);
    expect(map.get('bar')).toEqual(2);

    const resultValue: Array<number> = [];

    for (const t of map) {
      resultValue.push(t);
    }

    expect(resultValue[0]).toEqual(2);
    expect(resultValue[1]).toEqual(1);
  });

  test('swapIndex with tail', () => {
    map.swapIndex('foo'); // baz

    expect(map.get('foo')).toEqual(1);
    expect(map.get('baz')).toEqual(3);

    const resultValue: Array<number> = [];

    for (const t of map) {
      resultValue.push(t);
    }

    expect(resultValue[0]).toEqual(3);
    expect(resultValue[2]).toEqual(1);
  });

  test('swapPointer', () => {
    map.swapPointer('foo', 'bar');

    expect(map.get('foo')).toEqual(2);
    expect(map.get('bar')).toEqual(1);

    const resultValue: Array<number> = [];

    for (const t of map) {
      resultValue.push(t);
    }

    expect(resultValue[0]).toEqual(1);
    expect(resultValue[1]).toEqual(2);
  });

  test('swap', () => {
    map.swap('foo', 'bar');

    expect(map.get('foo')).toEqual(2);
    expect(map.get('bar')).toEqual(1);

    const resultValue: Array<number> = [];

    for (const t of map) {
      resultValue.push(t);
    }

    expect(resultValue[0]).toEqual(2);
    expect(resultValue[1]).toEqual(1);
  });

  test('try swapOrder with non-exist', () => {
    expect(() => map.swapIndex('foo2')).toThrowError('Key does not exists');
    expect(() => map.swapIndex('foo2', 'bar')).toThrowError('Key does not exists');
    expect(() => map.swapIndex('bar', 'foo2')).toThrowError('Key does not exists');
  });

  test('try swapPointer with non-exist', () => {
    expect(() => map.swapPointer('foo2', 'bar')).toThrowError('Key does not exists');
    expect(() => map.swapPointer('bar', 'foo2')).toThrowError('Key does not exists');
  });

  test('try swap with non-exist', () => {
    expect(() => map.swap('foo2', 'bar')).toThrowError('Key does not exists');
    expect(() => map.swap('bar', 'foo2')).toThrowError('Key does not exists');
  });
});

describe('clear', () => {
  test('has no item', () => {
    const map = new VectorMap<string, number>();
    map.clear();
    expect(map.size).toEqual(0);
  });

  test('has items', () => {
    const map = new VectorMap<string, number>();
    map.set('foo', 1);
    map.clear();
    expect(map.size).toEqual(0);
  });
});

describe('pop', () => {
  const map = new VectorMap<string, number>();

  beforeEach(() => {
    map.clear();
    map.set('foo', 1);
    map.set('bar', 2);
    map.set('baz', 3);
  });

  test('pop one item', () => {
    const last = map.pop();
    expect(map.size).toEqual(2);
    expect(last).toEqual({
      key: 'baz',
      value: 3,
    });
  });

  test('pop all items', () => {
    let last;
    for (let i = 0, n = map.size; i < n; i += 1) {
      last = map.pop();
    }
    expect(map.size).toEqual(0);
    expect(last).toEqual({
      key: 'foo',
      value: 1,
    });
  });

  test('pop empty map', () => {
    for (let i = 0, n = map.size; i < n; i += 1) {
      map.pop();
    }
    expect(map.pop()).toEqual(undefined);

    const newMap = new VectorMap();

    expect(newMap.pop()).toEqual(undefined);
    expect(newMap.size).toEqual(0);
  });
});

describe('special situations', () => {
  test('try to make mangling pointer', () => {
    const map = new VectorMap<string, string>();
    map.set('foo', 'bar');
    map.set('bar', 'baz');
    map.set('baz', 'foo');

    map.delete('bar', (swapped) => {
      // source of baz indicates bar.
      swapped.key = 'bar';
    });
    // key of baz pointing at 1.

    // then swap again.
    map.delete('foo');

    // Because of swap Index, key of bar(the dangling pointer) pointing at 0 instead of baz(still pointing at 1).
    // baz -> 1 -> index error -> mangling pointer!
    expect(() => map.get('baz')).toThrowError('mangling pointer');
  });
});

describe('reverse', () => {
  const map = new VectorMap<string, number>();

  beforeEach(() => {
    map.clear();
    map.set('foo', 1);
    map.set('bar', 2);
    map.set('baz', 3);
  });

  test('reverse before init', () => {
    const initialized = new VectorMap<string, number>();
    expect(() => initialized.reverse()).not.toThrow();
  });

  test('reverse after init', () => {
    map.reverse();
    const reversedArray = map.map((value) => value);

    // check original key-value pairs.
    expect(map.get('foo')).toEqual(1);
    expect(map.get('bar')).toEqual(2);
    expect(map.get('baz')).toEqual(3);

    // check it reversed properly.
    for (let i = 0; i < 3; i += 1) {
      expect(reversedArray[i]).toEqual(3 - i);
    }
  });
});

describe('clone', () => {
  const map = new VectorMap<string, number>();

  beforeEach(() => {
    map.clear();
    map.set('foo', 1);
    map.set('bar', 2);
    map.set('baz', 3);
  });

  test('simple clone', () => {
    const cloned = map.clone();

    expect(cloned.size).toEqual(3);
    expect(cloned.get('foo')).toEqual(1);
    expect(cloned.get('bar')).toEqual(2);
    expect(cloned.get('baz')).toEqual(3);
    expect(cloned).not.toBe(map);
  });

  test('mutate after clone', () => {
    const cloned = map.clone();
    expect(cloned.size).toEqual(3);

    cloned.set('foo', 2);
    expect(cloned.get('foo')).toEqual(2);
    expect(map.get('foo')).toEqual(2);

    cloned.set('foo2', 1);
    expect(cloned.size).toEqual(4);
    expect(map.size).toEqual(4);
    expect(cloned.get('foo2')).toEqual(1);
    expect(map.get('foo2')).toEqual(1);

    cloned.delete('foo2');
    expect(cloned.size).toEqual(3);
    expect(map.size).toEqual(3);

    map.set('foo', 3);
    expect(cloned.get('foo')).toEqual(3);
    expect(map.get('foo')).toEqual(3);

    map.set('foo2', 1);
    expect(cloned.size).toEqual(4);
    expect(map.size).toEqual(4);
    expect(cloned.get('foo2')).toEqual(1);
    expect(map.get('foo2')).toEqual(1);

    map.delete('foo2');
    expect(cloned.size).toEqual(3);
    expect(map.size).toEqual(3);
  });
});

describe('insertInto', () => {
  const map = new VectorMap<string, number>();

  beforeEach(() => {
    map.clear();
    map.set('foo', 1);
    map.set('bar', 2);
    map.set('baz', 3);
  });

  test('simple insertInto', () => {
    const es6Map = new Map();
    map.insertInto(es6Map);

    expect(es6Map.size).toEqual(3);
    expect(es6Map.get('foo')).toEqual(1);
    expect(es6Map.get('bar')).toEqual(2);
    expect(es6Map.get('baz')).toEqual(3);
    expect(es6Map).not.toBe(map);
  });
});

describe('from', () => {
  const es6Map = new Map<string, number>();

  beforeEach(() => {
    es6Map.clear();
    es6Map.set('foo', 1);
    es6Map.set('bar', 2);
    es6Map.set('baz', 3);
  });

  test('simple from', () => {
    const map = new VectorMap();
    map.from(es6Map);

    expect(map.size).toEqual(3);
    expect(map.get('foo')).toEqual(1);
    expect(map.get('bar')).toEqual(2);
    expect(map.get('baz')).toEqual(3);
    expect(map).not.toBe(es6Map);
  });
});

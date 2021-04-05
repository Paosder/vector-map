/* eslint-disable no-restricted-syntax */
import { VectorMap, MapSource } from '../src/map';

describe('init', () => {
  test('init with no default object', () => {
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
    index: 0,
    data: {
      key: 'foo',
      value: 1,
    },
  }, {
    index: 1,
    data: {
      key: 'bar',
      value: 2,
    },
  }, {
    index: 2,
    data: {
      key: 'baz',
      value: 3,
    },
  }];

  beforeAll(() => {
    map.set('foo', 1);
    map.set('bar', 2);
    map.set('baz', 3);
  });

  test('with Symbol.iterator', () => {
    const resultKey = [];
    const resultValue = [];

    for (const t of map) {
      resultKey.push(t.key);
      resultValue.push(t.value);
    }

    expect(resultKey).toEqual(['foo', 'bar', 'baz']);
    expect(resultValue).toEqual([1, 2, 3]);
  });

  test('with forEach', () => {
    const result = [];
    map.forEach((data, index) => {
      result.push({
        index,
        data,
      });
    });
    expect(result).toEqual(expected);
  });

  test('with map', () => {
    const result = map.map((data, index) => ({
      index,
      data,
    }));
    expect(result).toEqual(expected);
  });

  test('with reduce', () => {
    const result = map.reduce((acc, data, index) => {
      acc.push({
        index,
        data,
      });
      return acc;
    }, []);
    expect(result).toEqual(expected);
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

    const resultKey: Array<string> = [];
    const resultValue: Array<number> = [];

    for (const t of map) {
      resultKey.push(t.key);
      resultValue.push(t.value);
    }

    expect(resultKey[0]).toEqual('bar');
    expect(resultKey[1]).toEqual('foo');
    expect(resultValue[0]).toEqual(2);
    expect(resultValue[1]).toEqual(1);
  });

  test('swapIndex with tail', () => {
    map.swapIndex('foo'); // baz

    expect(map.get('foo')).toEqual(1);
    expect(map.get('baz')).toEqual(3);

    const resultKey: Array<string> = [];
    const resultValue: Array<number> = [];

    for (const t of map) {
      resultKey.push(t.key);
      resultValue.push(t.value);
    }

    expect(resultKey[0]).toEqual('baz');
    expect(resultKey[2]).toEqual('foo');
    expect(resultValue[0]).toEqual(3);
    expect(resultValue[2]).toEqual(1);
  });

  test('swapPointer', () => {
    map.swapPointer('foo', 'bar');

    expect(map.get('foo')).toEqual(2);
    expect(map.get('bar')).toEqual(1);

    const resultKey: Array<string> = [];
    const resultValue: Array<number> = [];

    for (const t of map) {
      resultKey.push(t.key);
      resultValue.push(t.value);
    }

    expect(resultKey[0]).toEqual('bar');
    expect(resultKey[1]).toEqual('foo');
    expect(resultValue[0]).toEqual(1);
    expect(resultValue[1]).toEqual(2);
  });

  test('swap', () => {
    map.swap('foo', 'bar');

    expect(map.get('foo')).toEqual(2);
    expect(map.get('bar')).toEqual(1);

    const resultKey: Array<string> = [];
    const resultValue: Array<number> = [];

    for (const t of map) {
      resultKey.push(t.key);
      resultValue.push(t.value);
    }

    expect(resultKey[0]).toEqual('foo');
    expect(resultKey[1]).toEqual('bar');
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

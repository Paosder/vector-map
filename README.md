# VectorMap [![Build Status](https://travis-ci.com/Paosder/vector-map.svg?branch=master)](https://travis-ci.com/Paosder/vector-map)  [![codecov](https://codecov.io/gh/Paosder/vector-map/branch/master/graph/badge.svg?token=aBRZ07TSBg)](https://codecov.io/gh/Paosder/vector-map) [![npm version](https://badge.fury.io/js/%40paosder%2Fvector-map.svg)](https://badge.fury.io/js/%40paosder%2Fvector-map)

[![NPM](https://nodei.co/npm/@paosder/vector-map.png)](https://npmjs.org/package/@paosder/vector-map)

Vector like object using map with array.
# Why?
In ES6, Map is very useful key-value collection object.
It is very efficient to access value via specific key and easy to delete too.
However, sometimes we need to change item order for use like array or iterable.
ES6 map cannot swap or change its order before transform to array(ex. `map.entries().forEach(..)`).
One way to solve this, transform map to array, change its order, then re-transform into map.
It seems really fair and simple approach, but then real big problem comes: changing its order.
We cannot easily find where our item is in array, so we must traverse all items to find where it is and it consumes time complexity O(n).
Well, if all items were sorted, we can reduce its time complexity to O(logn). However we cannot determine the original map was sorted, and
we don't want to sort transformed array for just doing swap its order. It's "redundant" and "inefficient".
VectorMap resolves such, especially swap case. VectorMap is concatenated map(pointer)-array(source) object. Map contains source pointer(array index), and array contains its value and key. We can access or delete value with time complexity O(1) via map-array. Though delete operation is actually swap with tail and pop so that causes cracking its original order, it has great performance O(1) and its really great to use with webGL instancing.

# Usage
```ts
interface FooBar {
  foo: string;
  bar: number;
}

const vectorMap: VectorMap<string, FooBar> = new VectorMap();

// set item.
vectorMap.set('foo', {
  foo: 'foo',
  bar: 1,
});
vectorMap.set('bar', {
  foo: 'bar',
  bar: 2,
});

// get item.
vectorMap.get('foo');

// swap inner order. It does not affect to each item.
vectorMap.swapSource('foo','bar');

// vectorMap is iterable.
for (const v of vectorMap) {
  console.log(v.key, v.value);
}

// you can iterate item via forEach, map, reduce too.
vectorMap.forEach((el) => {
  console.log(el);
});

// delete item. It swaps with tail element then pop. This will change its order.
vectorMap.delete('foo');

// you can serve swap callback if deleting item is swapped with tail. Only called when swapped.
vectorMap.delete('bar', (swapped, deleted) => {
  console.log(swapped.key, swapped.value);
});
```

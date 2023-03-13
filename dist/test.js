(function () {
  'use strict';

  /**
   * Utility module to work with key-value stores.
   *
   * @module map
   */

  /**
   * Creates a new Map instance.
   *
   * @function
   * @return {Map<any, any>}
   *
   * @function
   */
  const create$8 = () => new Map();

  /**
   * Copy a Map object into a fresh Map object.
   *
   * @function
   * @template X,Y
   * @param {Map<X,Y>} m
   * @return {Map<X,Y>}
   */
  const copy$1 = m => {
    const r = create$8();
    m.forEach((v, k) => { r.set(k, v); });
    return r
  };

  /**
   * Get map property. Create T if property is undefined and set T on map.
   *
   * ```js
   * const listeners = map.setIfUndefined(events, 'eventName', set.create)
   * listeners.add(listener)
   * ```
   *
   * @function
   * @template V,K
   * @template {Map<K,V>} MAP
   * @param {MAP} map
   * @param {K} key
   * @param {function():V} createT
   * @return {V}
   */
  const setIfUndefined = (map, key, createT) => {
    let set = map.get(key);
    if (set === undefined) {
      map.set(key, set = createT());
    }
    return set
  };

  /**
   * Creates an Array and populates it with the content of all key-value pairs using the `f(value, key)` function.
   *
   * @function
   * @template K
   * @template V
   * @template R
   * @param {Map<K,V>} m
   * @param {function(V,K):R} f
   * @return {Array<R>}
   */
  const map$2 = (m, f) => {
    const res = [];
    for (const [key, value] of m) {
      res.push(f(value, key));
    }
    return res
  };

  /**
   * Tests whether any key-value pairs pass the test implemented by `f(value, key)`.
   *
   * @todo should rename to some - similarly to Array.some
   *
   * @function
   * @template K
   * @template V
   * @param {Map<K,V>} m
   * @param {function(V,K):boolean} f
   * @return {boolean}
   */
  const any = (m, f) => {
    for (const [key, value] of m) {
      if (f(value, key)) {
        return true
      }
    }
    return false
  };

  /**
   * Tests whether all key-value pairs pass the test implemented by `f(value, key)`.
   *
   * @function
   * @template K
   * @template V
   * @param {Map<K,V>} m
   * @param {function(V,K):boolean} f
   * @return {boolean}
   */
  const all$1 = (m, f) => {
    for (const [key, value] of m) {
      if (!f(value, key)) {
        return false
      }
    }
    return true
  };

  var map$3 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    create: create$8,
    copy: copy$1,
    setIfUndefined: setIfUndefined,
    map: map$2,
    any: any,
    all: all$1
  });

  /**
   * Utility module to work with strings.
   *
   * @module string
   */

  const fromCharCode = String.fromCharCode;

  /**
   * @param {string} s
   * @return {string}
   */
  const toLowerCase = s => s.toLowerCase();

  const trimLeftRegex = /^\s*/g;

  /**
   * @param {string} s
   * @return {string}
   */
  const trimLeft = s => s.replace(trimLeftRegex, '');

  const fromCamelCaseRegex = /([A-Z])/g;

  /**
   * @param {string} s
   * @param {string} separator
   * @return {string}
   */
  const fromCamelCase = (s, separator) => trimLeft(s.replace(fromCamelCaseRegex, match => `${separator}${toLowerCase(match)}`));

  /**
   * @param {string} str
   * @return {Uint8Array}
   */
  const _encodeUtf8Polyfill = str => {
    const encodedString = unescape(encodeURIComponent(str));
    const len = encodedString.length;
    const buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      buf[i] = /** @type {number} */ (encodedString.codePointAt(i));
    }
    return buf
  };

  /* c8 ignore next */
  const utf8TextEncoder = /** @type {TextEncoder} */ (typeof TextEncoder !== 'undefined' ? new TextEncoder() : null);

  /**
   * @param {string} str
   * @return {Uint8Array}
   */
  const _encodeUtf8Native = str => utf8TextEncoder.encode(str);

  /**
   * @param {string} str
   * @return {Uint8Array}
   */
  /* c8 ignore next */
  const encodeUtf8 = utf8TextEncoder ? _encodeUtf8Native : _encodeUtf8Polyfill;

  /* c8 ignore next */
  let utf8TextDecoder = typeof TextDecoder === 'undefined' ? null : new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });

  /* c8 ignore start */
  if (utf8TextDecoder && utf8TextDecoder.decode(new Uint8Array()).length === 1) {
    // Safari doesn't handle BOM correctly.
    // This fixes a bug in Safari 13.0.5 where it produces a BOM the first time it is called.
    // utf8TextDecoder.decode(new Uint8Array()).length === 1 on the first call and
    // utf8TextDecoder.decode(new Uint8Array()).length === 1 on the second call
    // Another issue is that from then on no BOM chars are recognized anymore
    /* c8 ignore next */
    utf8TextDecoder = null;
  }

  /**
   * Often used conditions.
   *
   * @module conditions
   */

  /**
   * @template T
   * @param {T|null|undefined} v
   * @return {T|null}
   */
  /* c8 ignore next */
  const undefinedToNull = v => v === undefined ? null : v;

  /* global localStorage, addEventListener */

  /**
   * Isomorphic variable storage.
   *
   * Uses LocalStorage in the browser and falls back to in-memory storage.
   *
   * @module storage
   */

  /* c8 ignore start */
  class VarStoragePolyfill {
    constructor () {
      this.map = new Map();
    }

    /**
     * @param {string} key
     * @param {any} newValue
     */
    setItem (key, newValue) {
      this.map.set(key, newValue);
    }

    /**
     * @param {string} key
     */
    getItem (key) {
      return this.map.get(key)
    }
  }
  /* c8 ignore stop */

  /**
   * @type {any}
   */
  let _localStorage = new VarStoragePolyfill();
  let usePolyfill = true;

  /* c8 ignore start */
  try {
    // if the same-origin rule is violated, accessing localStorage might thrown an error
    if (typeof localStorage !== 'undefined') {
      _localStorage = localStorage;
      usePolyfill = false;
    }
  } catch (e) { }
  /* c8 ignore stop */

  /**
   * This is basically localStorage in browser, or a polyfill in nodejs
   */
  /* c8 ignore next */
  const varStorage = _localStorage;

  /**
   * Utility module to work with sets.
   *
   * @module set
   */

  const create$7 = () => new Set();

  /**
   * @template T
   * @param {Set<T>} set
   * @return {Array<T>}
   */
  const toArray = set => Array.from(set);

  /**
   * @template T
   * @param {Set<T>} set
   * @return {T}
   */
  const first = set =>
    set.values().next().value || undefined;

  /**
   * @template T
   * @param {Iterable<T>} entries
   * @return {Set<T>}
   */
  const from$1 = entries => new Set(entries);

  var set$2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    create: create$7,
    toArray: toArray,
    first: first,
    from: from$1
  });

  /**
   * Utility module to work with Arrays.
   *
   * @module array
   */

  /**
   * Return the last element of an array. The element must exist
   *
   * @template L
   * @param {ArrayLike<L>} arr
   * @return {L}
   */
  const last = arr => arr[arr.length - 1];

  /**
   * @template C
   * @return {Array<C>}
   */
  const create$6 = () => /** @type {Array<C>} */ ([]);

  /**
   * @template D
   * @param {Array<D>} a
   * @return {Array<D>}
   */
  const copy = a => /** @type {Array<D>} */ (a.slice());

  /**
   * Append elements from src to dest
   *
   * @template M
   * @param {Array<M>} dest
   * @param {Array<M>} src
   */
  const appendTo = (dest, src) => {
    for (let i = 0; i < src.length; i++) {
      dest.push(src[i]);
    }
  };

  /**
   * Transforms something array-like to an actual Array.
   *
   * @function
   * @template T
   * @param {ArrayLike<T>|Iterable<T>} arraylike
   * @return {T}
   */
  const from = Array.from;

  /**
   * True iff condition holds on every element in the Array.
   *
   * @function
   * @template ITEM
   * @template {ArrayLike<ITEM>} ARR
   *
   * @param {ARR} arr
   * @param {function(ITEM, number, ARR):boolean} f
   * @return {boolean}
   */
  const every$1 = (arr, f) => {
    for (let i = 0; i < arr.length; i++) {
      if (!f(arr[i], i, arr)) {
        return false
      }
    }
    return true
  };

  /**
   * True iff condition holds on some element in the Array.
   *
   * @function
   * @template S
   * @template {ArrayLike<S>} ARR
   * @param {ARR} arr
   * @param {function(S, number, ARR):boolean} f
   * @return {boolean}
   */
  const some$1 = (arr, f) => {
    for (let i = 0; i < arr.length; i++) {
      if (f(arr[i], i, arr)) {
        return true
      }
    }
    return false
  };

  /**
   * @template ELEM
   *
   * @param {ArrayLike<ELEM>} a
   * @param {ArrayLike<ELEM>} b
   * @return {boolean}
   */
  const equalFlat$1 = (a, b) => a.length === b.length && every$1(a, (item, index) => item === b[index]);

  /**
   * @template ELEM
   * @param {Array<Array<ELEM>>} arr
   * @return {Array<ELEM>}
   */
  const flatten = arr => arr.reduce((acc, val) => acc.concat(val), []);

  const isArray = Array.isArray;

  /**
   * @template T
   * @param {Array<T>} arr
   * @return {Array<T>}
   */
  const unique = arr => from(from$1(arr));

  /**
   * @template T
   * @template M
   * @param {ArrayLike<T>} arr
   * @param {function(T):M} mapper
   * @return {Array<T>}
   */
  const uniqueBy = (arr, mapper) => {
    /**
     * @type {Set<M>}
     */
    const happened = create$7();
    /**
     * @type {Array<T>}
     */
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      const el = arr[i];
      const mapped = mapper(el);
      if (!happened.has(mapped)) {
        happened.add(mapped);
        result.push(el);
      }
    }
    return result
  };

  var array$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    last: last,
    create: create$6,
    copy: copy,
    appendTo: appendTo,
    from: from,
    every: every$1,
    some: some$1,
    equalFlat: equalFlat$1,
    flatten: flatten,
    isArray: isArray,
    unique: unique,
    uniqueBy: uniqueBy
  });

  /**
   * Utility functions for working with EcmaScript objects.
   *
   * @module object
   */

  /**
   * @return {Object<string,any>} obj
   */
  const create$5 = () => Object.create(null);

  /**
   * Object.assign
   */
  const assign = Object.assign;

  /**
   * @param {Object<string,any>} obj
   */
  const keys = Object.keys;

  /**
   * @template V
   * @param {{[k:string]:V}} obj
   * @param {function(V,string):any} f
   */
  const forEach$1 = (obj, f) => {
    for (const key in obj) {
      f(obj[key], key);
    }
  };

  /**
   * @todo implement mapToArray & map
   *
   * @template R
   * @param {Object<string,any>} obj
   * @param {function(any,string):R} f
   * @return {Array<R>}
   */
  const map$1 = (obj, f) => {
    const results = [];
    for (const key in obj) {
      results.push(f(obj[key], key));
    }
    return results
  };

  /**
   * @param {Object<string,any>} obj
   * @return {number}
   */
  const length$1 = obj => keys(obj).length;

  /**
   * @param {Object<string,any>} obj
   * @param {function(any,string):boolean} f
   * @return {boolean}
   */
  const some = (obj, f) => {
    for (const key in obj) {
      if (f(obj[key], key)) {
        return true
      }
    }
    return false
  };

  /**
   * @param {Object|undefined} obj
   */
  const isEmpty = obj => {
    for (const _k in obj) {
      return false
    }
    return true
  };

  /**
   * @param {Object<string,any>} obj
   * @param {function(any,string):boolean} f
   * @return {boolean}
   */
  const every = (obj, f) => {
    for (const key in obj) {
      if (!f(obj[key], key)) {
        return false
      }
    }
    return true
  };

  /**
   * Calls `Object.prototype.hasOwnProperty`.
   *
   * @param {any} obj
   * @param {string|symbol} key
   * @return {boolean}
   */
  const hasProperty = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

  /**
   * @param {Object<string,any>} a
   * @param {Object<string,any>} b
   * @return {boolean}
   */
  const equalFlat = (a, b) => a === b || (length$1(a) === length$1(b) && every(a, (val, key) => (val !== undefined || hasProperty(b, key)) && b[key] === val));

  var object$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    create: create$5,
    assign: assign,
    keys: keys,
    forEach: forEach$1,
    map: map$1,
    length: length$1,
    some: some,
    isEmpty: isEmpty,
    every: every,
    hasProperty: hasProperty,
    equalFlat: equalFlat
  });

  /**
   * Common functions and function call helpers.
   *
   * @module function
   */

  /**
   * Calls all functions in `fs` with args. Only throws after all functions were called.
   *
   * @param {Array<function>} fs
   * @param {Array<any>} args
   */
  const callAll = (fs, args, i = 0) => {
    try {
      for (; i < fs.length; i++) {
        fs[i](...args);
      }
    } finally {
      if (i < fs.length) {
        callAll(fs, args, i + 1);
      }
    }
  };

  const nop = () => {};

  /**
   * @template T
   * @param {function():T} f
   * @return {T}
   */
  const apply = f => f();

  /**
   * @template A
   *
   * @param {A} a
   * @return {A}
   */
  const id = a => a;

  /**
   * @template T
   *
   * @param {T} a
   * @param {T} b
   * @return {boolean}
   */
  const equalityStrict = (a, b) => a === b;

  /**
   * @template T
   *
   * @param {Array<T>|object} a
   * @param {Array<T>|object} b
   * @return {boolean}
   */
  const equalityFlat = (a, b) => a === b || (a != null && b != null && a.constructor === b.constructor && ((a instanceof Array && equalFlat$1(a, /** @type {Array<T>} */ (b))) || (typeof a === 'object' && equalFlat(a, b))));

  /* c8 ignore start */

  /**
   * @param {any} a
   * @param {any} b
   * @return {boolean}
   */
  const equalityDeep = (a, b) => {
    if (a == null || b == null) {
      return equalityStrict(a, b)
    }
    if (a.constructor !== b.constructor) {
      return false
    }
    if (a === b) {
      return true
    }
    switch (a.constructor) {
      case ArrayBuffer:
        a = new Uint8Array(a);
        b = new Uint8Array(b);
      // eslint-disable-next-line no-fallthrough
      case Uint8Array: {
        if (a.byteLength !== b.byteLength) {
          return false
        }
        for (let i = 0; i < a.length; i++) {
          if (a[i] !== b[i]) {
            return false
          }
        }
        break
      }
      case Set: {
        if (a.size !== b.size) {
          return false
        }
        for (const value of a) {
          if (!b.has(value)) {
            return false
          }
        }
        break
      }
      case Map: {
        if (a.size !== b.size) {
          return false
        }
        for (const key of a.keys()) {
          if (!b.has(key) || !equalityDeep(a.get(key), b.get(key))) {
            return false
          }
        }
        break
      }
      case Object:
        if (length$1(a) !== length$1(b)) {
          return false
        }
        for (const key in a) {
          if (!hasProperty(a, key) || !equalityDeep(a[key], b[key])) {
            return false
          }
        }
        break
      case Array:
        if (a.length !== b.length) {
          return false
        }
        for (let i = 0; i < a.length; i++) {
          if (!equalityDeep(a[i], b[i])) {
            return false
          }
        }
        break
      default:
        return false
    }
    return true
  };

  /**
   * @template V
   * @template {V} OPTS
   *
   * @param {V} value
   * @param {Array<OPTS>} options
   */
  // @ts-ignore
  const isOneOf = (value, options) => options.includes(value);
  /* c8 ignore stop */

  var _function = /*#__PURE__*/Object.freeze({
    __proto__: null,
    callAll: callAll,
    nop: nop,
    apply: apply,
    id: id,
    equalityStrict: equalityStrict,
    equalityFlat: equalityFlat,
    equalityDeep: equalityDeep,
    isOneOf: isOneOf
  });

  /**
   * Isomorphic module to work access the environment (query params, env variables).
   *
   * @module map
   */

  /* c8 ignore next */
  // @ts-ignore
  const isNode = typeof process !== 'undefined' && process.release &&
    /node|io\.js/.test(process.release.name);
  /* c8 ignore next */
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined' && !isNode;
  /* c8 ignore next 3 */
  typeof navigator !== 'undefined'
    ? /Mac/.test(navigator.platform)
    : false;

  /**
   * @type {Map<string,string>}
   */
  let params;

  /* c8 ignore start */
  const computeParams = () => {
    if (params === undefined) {
      if (isNode) {
        params = create$8();
        const pargs = process.argv;
        let currParamName = null;
        for (let i = 0; i < pargs.length; i++) {
          const parg = pargs[i];
          if (parg[0] === '-') {
            if (currParamName !== null) {
              params.set(currParamName, '');
            }
            currParamName = parg;
          } else {
            if (currParamName !== null) {
              params.set(currParamName, parg);
              currParamName = null;
            }
          }
        }
        if (currParamName !== null) {
          params.set(currParamName, '');
        }
        // in ReactNative for example this would not be true (unless connected to the Remote Debugger)
      } else if (typeof location === 'object') {
        params = create$8(); // eslint-disable-next-line no-undef
        (location.search || '?').slice(1).split('&').forEach((kv) => {
          if (kv.length !== 0) {
            const [key, value] = kv.split('=');
            params.set(`--${fromCamelCase(key, '-')}`, value);
            params.set(`-${fromCamelCase(key, '-')}`, value);
          }
        });
      } else {
        params = create$8();
      }
    }
    return params
  };
  /* c8 ignore stop */

  /**
   * @param {string} name
   * @return {boolean}
   */
  /* c8 ignore next */
  const hasParam = (name) => computeParams().has(name);

  /**
   * @param {string} name
   * @param {string} defaultVal
   * @return {string}
   */
  /* c8 ignore next 2 */
  const getParam = (name, defaultVal) =>
    computeParams().get(name) || defaultVal;

  /**
   * @param {string} name
   * @return {string|null}
   */
  /* c8 ignore next 4 */
  const getVariable = (name) =>
    isNode
      ? undefinedToNull(process.env[name.toUpperCase()])
      : undefinedToNull(varStorage.getItem(name));

  /**
   * @param {string} name
   * @return {boolean}
   */
  /* c8 ignore next 2 */
  const hasConf = (name) =>
    hasParam('--' + name) || getVariable(name) !== null;

  /* c8 ignore next */
  hasConf('production');

  /* c8 ignore next 2 */
  const forceColor = isNode &&
    isOneOf(process.env.FORCE_COLOR, ['true', '1', '2']);

  /* c8 ignore start */
  const supportsColor = !hasParam('no-colors') &&
    (!isNode || process.stdout.isTTY || forceColor) && (
    !isNode || hasParam('color') || forceColor ||
      getVariable('COLORTERM') !== null ||
      (getVariable('TERM') || '').includes('color')
  );
  /* c8 ignore stop */

  /**
   * Utility module to work with EcmaScript Symbols.
   *
   * @module symbol
   */

  /**
   * Return fresh symbol.
   *
   * @return {Symbol}
   */
  const create$4 = Symbol;

  /**
   * Working with value pairs.
   *
   * @module pair
   */

  /**
   * @template L,R
   */
  class Pair {
    /**
     * @param {L} left
     * @param {R} right
     */
    constructor (left, right) {
      this.left = left;
      this.right = right;
    }
  }

  /**
   * @template L,R
   * @param {L} left
   * @param {R} right
   * @return {Pair<L,R>}
   */
  const create$3 = (left, right) => new Pair(left, right);

  /**
   * @template L,R
   * @param {Array<Pair<L,R>>} arr
   * @param {function(L, R):any} f
   */
  const forEach = (arr, f) => arr.forEach(p => f(p.left, p.right));

  /* eslint-env browser */

  /* c8 ignore start */
  /**
   * @type {Document}
   */
  const doc = /** @type {Document} */ (typeof document !== 'undefined' ? document : {});

  /**
   * @param {string} name
   * @return {HTMLElement}
   */
  const createElement = name => doc.createElement(name);

  /**
   * @return {DocumentFragment}
   */
  const createDocumentFragment = () => doc.createDocumentFragment();

  /**
   * @param {string} text
   * @return {Text}
   */
  const createTextNode = text => doc.createTextNode(text);

  /** @type {DOMParser} */ (typeof DOMParser !== 'undefined' ? new DOMParser() : null);

  /**
   * @param {Element} el
   * @param {Array<pair.Pair<string,string|boolean>>} attrs Array of key-value pairs
   * @return {Element}
   */
  const setAttributes = (el, attrs) => {
    forEach(attrs, (key, value) => {
      if (value === false) {
        el.removeAttribute(key);
      } else if (value === true) {
        el.setAttribute(key, '');
      } else {
        // @ts-ignore
        el.setAttribute(key, value);
      }
    });
    return el
  };

  /**
   * @param {Array<Node>|HTMLCollection} children
   * @return {DocumentFragment}
   */
  const fragment = children => {
    const fragment = createDocumentFragment();
    for (let i = 0; i < children.length; i++) {
      appendChild(fragment, children[i]);
    }
    return fragment
  };

  /**
   * @param {Element} parent
   * @param {Array<Node>} nodes
   * @return {Element}
   */
  const append = (parent, nodes) => {
    appendChild(parent, fragment(nodes));
    return parent
  };

  /**
   * @param {EventTarget} el
   * @param {string} name
   * @param {EventListener} f
   */
  const addEventListener = (el, name, f) => el.addEventListener(name, f);

  /**
   * @param {string} name
   * @param {Array<pair.Pair<string,string>|pair.Pair<string,boolean>>} attrs Array of key-value pairs
   * @param {Array<Node>} children
   * @return {Element}
   */
  const element = (name, attrs = [], children = []) =>
    append(setAttributes(createElement(name), attrs), children);

  /**
   * @param {string} t
   * @return {Text}
   */
  const text = createTextNode;

  /**
   * @param {Map<string,string>} m
   * @return {string}
   */
  const mapToStyleString = m => map$2(m, (value, key) => `${key}:${value};`).join('');

  /**
   * @param {Node} parent
   * @param {Node} child
   * @return {Node}
   */
  const appendChild = (parent, child) => parent.appendChild(child);

  doc.ELEMENT_NODE;
  doc.TEXT_NODE;
  doc.CDATA_SECTION_NODE;
  doc.COMMENT_NODE;
  doc.DOCUMENT_NODE;
  doc.DOCUMENT_TYPE_NODE;
  doc.DOCUMENT_FRAGMENT_NODE;
  /* c8 ignore stop */

  /**
   * JSON utility functions.
   *
   * @module json
   */

  /**
   * Transform JavaScript object to JSON.
   *
   * @param {any} object
   * @return {string}
   */
  const stringify = JSON.stringify;

  /* global requestIdleCallback, requestAnimationFrame, cancelIdleCallback, cancelAnimationFrame */

  /**
   * Utility module to work with EcmaScript's event loop.
   *
   * @module eventloop
   */

  /**
   * @type {Array<function>}
   */
  let queue = [];

  const _runQueue = () => {
    for (let i = 0; i < queue.length; i++) {
      queue[i]();
    }
    queue = [];
  };

  /**
   * @param {function():void} f
   */
  const enqueue = f => {
    queue.push(f);
    if (queue.length === 1) {
      setTimeout(_runQueue, 0);
    }
  };

  /**
   * Common Math expressions.
   *
   * @module math
   */

  const floor = Math.floor;
  const ceil = Math.ceil;
  const abs = Math.abs;
  const imul = Math.imul;
  const round = Math.round;
  const log10 = Math.log10;
  const log2 = Math.log2;
  const log = Math.log;
  const sqrt = Math.sqrt;

  /**
   * @function
   * @param {number} a
   * @param {number} b
   * @return {number} The sum of a and b
   */
  const add = (a, b) => a + b;

  /**
   * @function
   * @param {number} a
   * @param {number} b
   * @return {number} The smaller element of a and b
   */
  const min = (a, b) => a < b ? a : b;

  /**
   * @function
   * @param {number} a
   * @param {number} b
   * @return {number} The bigger element of a and b
   */
  const max = (a, b) => a > b ? a : b;

  const isNaN = Number.isNaN;

  const pow = Math.pow;
  /**
   * Base 10 exponential function. Returns the value of 10 raised to the power of pow.
   *
   * @param {number} exp
   * @return {number}
   */
  const exp10 = exp => Math.pow(10, exp);

  const sign = Math.sign;

  /**
   * @param {number} n
   * @return {boolean} Wether n is negative. This function also differentiates between -0 and +0
   */
  const isNegativeZero = n => n !== 0 ? n < 0 : 1 / n < 0;

  var math$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    floor: floor,
    ceil: ceil,
    abs: abs,
    imul: imul,
    round: round,
    log10: log10,
    log2: log2,
    log: log,
    sqrt: sqrt,
    add: add,
    min: min,
    max: max,
    isNaN: isNaN,
    pow: pow,
    exp10: exp10,
    sign: sign,
    isNegativeZero: isNegativeZero
  });

  /**
   * Utility module to convert metric values.
   *
   * @module metric
   */

  const prefixUp = ['', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
  const prefixDown = ['', 'm', 'μ', 'n', 'p', 'f', 'a', 'z', 'y'];

  /**
   * Calculate the metric prefix for a number. Assumes E.g. `prefix(1000) = { n: 1, prefix: 'k' }`
   *
   * @param {number} n
   * @param {number} [baseMultiplier] Multiplier of the base (10^(3*baseMultiplier)). E.g. `convert(time, -3)` if time is already in milli seconds
   * @return {{n:number,prefix:string}}
   */
  const prefix = (n, baseMultiplier = 0) => {
    const nPow = n === 0 ? 0 : log10(n);
    let mult = 0;
    while (nPow < mult * 3 && baseMultiplier > -8) {
      baseMultiplier--;
      mult--;
    }
    while (nPow >= 3 + mult * 3 && baseMultiplier < 8) {
      baseMultiplier++;
      mult++;
    }
    const prefix = baseMultiplier < 0 ? prefixDown[-baseMultiplier] : prefixUp[baseMultiplier];
    return {
      n: round((mult > 0 ? n / exp10(mult * 3) : n * exp10(mult * -3)) * 1e12) / 1e12,
      prefix
    }
  };

  /**
   * Utility module to work with time.
   *
   * @module time
   */

  /**
   * Return current time.
   *
   * @return {Date}
   */
  const getDate = () => new Date();

  /**
   * Return current unix time.
   *
   * @return {number}
   */
  const getUnixTime = Date.now;

  /**
   * Transform time (in ms) to a human readable format. E.g. 1100 => 1.1s. 60s => 1min. .001 => 10μs.
   *
   * @param {number} d duration in milliseconds
   * @return {string} humanized approximation of time
   */
  const humanizeDuration = d => {
    if (d < 60000) {
      const p = prefix(d, -1);
      return round(p.n * 100) / 100 + p.prefix + 's'
    }
    d = floor(d / 1000);
    const seconds = d % 60;
    const minutes = floor(d / 60) % 60;
    const hours = floor(d / 3600) % 24;
    const days = floor(d / 86400);
    if (days > 0) {
      return days + 'd' + ((hours > 0 || minutes > 30) ? ' ' + (minutes > 30 ? hours + 1 : hours) + 'h' : '')
    }
    if (hours > 0) {
      /* c8 ignore next */
      return hours + 'h' + ((minutes > 0 || seconds > 30) ? ' ' + (seconds > 30 ? minutes + 1 : minutes) + 'min' : '')
    }
    return minutes + 'min' + (seconds > 0 ? ' ' + seconds + 's' : '')
  };

  var time$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getDate: getDate,
    getUnixTime: getUnixTime,
    humanizeDuration: humanizeDuration
  });

  /**
   * Isomorphic logging module with support for colors!
   *
   * @module logging
   */

  const BOLD = create$4();
  const UNBOLD = create$4();
  const BLUE = create$4();
  const GREY = create$4();
  const GREEN = create$4();
  const RED = create$4();
  const PURPLE = create$4();
  const ORANGE = create$4();
  const UNCOLOR = create$4();

  /**
   * @type {Object<Symbol,pair.Pair<string,string>>}
   */
  const _browserStyleMap = {
    [BOLD]: create$3('font-weight', 'bold'),
    [UNBOLD]: create$3('font-weight', 'normal'),
    [BLUE]: create$3('color', 'blue'),
    [GREEN]: create$3('color', 'green'),
    [GREY]: create$3('color', 'grey'),
    [RED]: create$3('color', 'red'),
    [PURPLE]: create$3('color', 'purple'),
    [ORANGE]: create$3('color', 'orange'), // not well supported in chrome when debugging node with inspector - TODO: deprecate
    [UNCOLOR]: create$3('color', 'black')
  };

  const _nodeStyleMap = {
    [BOLD]: '\u001b[1m',
    [UNBOLD]: '\u001b[2m',
    [BLUE]: '\x1b[34m',
    [GREEN]: '\x1b[32m',
    [GREY]: '\u001b[37m',
    [RED]: '\x1b[31m',
    [PURPLE]: '\x1b[35m',
    [ORANGE]: '\x1b[38;5;208m',
    [UNCOLOR]: '\x1b[0m'
  };

  /**
   * @param {Array<string|Symbol|Object|number>} args
   * @return {Array<string|object|number>}
   */
  /* c8 ignore start */
  const computeBrowserLoggingArgs = (args) => {
    const strBuilder = [];
    const styles = [];
    const currentStyle = create$8();
    /**
     * @type {Array<string|Object|number>}
     */
    let logArgs = [];
    // try with formatting until we find something unsupported
    let i = 0;
    for (; i < args.length; i++) {
      const arg = args[i];
      // @ts-ignore
      const style = _browserStyleMap[arg];
      if (style !== undefined) {
        currentStyle.set(style.left, style.right);
      } else {
        if (arg.constructor === String || arg.constructor === Number) {
          const style = mapToStyleString(currentStyle);
          if (i > 0 || style.length > 0) {
            strBuilder.push('%c' + arg);
            styles.push(style);
          } else {
            strBuilder.push(arg);
          }
        } else {
          break
        }
      }
    }
    if (i > 0) {
      // create logArgs with what we have so far
      logArgs = styles;
      logArgs.unshift(strBuilder.join(''));
    }
    // append the rest
    for (; i < args.length; i++) {
      const arg = args[i];
      if (!(arg instanceof Symbol)) {
        logArgs.push(arg);
      }
    }
    return logArgs
  };
  /* c8 ignore stop */

  /* c8 ignore start */
  /**
   * @param {Array<string|Symbol|Object|number>} args
   * @return {Array<string|object|number>}
   */
  const computeNoColorLoggingArgs = args => {
    const strBuilder = [];
    const logArgs = [];
    // try with formatting until we find something unsupported
    let i = 0;
    for (; i < args.length; i++) {
      const arg = args[i];
      // @ts-ignore
      const style = _nodeStyleMap[arg];
      if (style === undefined) {
        if (arg.constructor === String || arg.constructor === Number) {
          strBuilder.push(arg);
        } else {
          break
        }
      }
    }
    if (i > 0) {
      logArgs.push(strBuilder.join(''));
    }
    // append the rest
    for (; i < args.length; i++) {
      const arg = args[i];
      if (!(arg instanceof Symbol)) {
        if (arg.constructor === Object) {
          logArgs.push(JSON.stringify(arg));
        } else {
          logArgs.push(arg);
        }
      }
    }
    return logArgs
  };
  /* c8 ignore stop */

  /* c8 ignore start */
  /**
   * @param {Array<string|Symbol|Object|number>} args
   * @return {Array<string|object|number>}
   */
  const computeNodeLoggingArgs = (args) => {
    const strBuilder = [];
    const logArgs = [];
    // try with formatting until we find something unsupported
    let i = 0;
    for (; i < args.length; i++) {
      const arg = args[i];
      // @ts-ignore
      const style = _nodeStyleMap[arg];
      if (style !== undefined) {
        strBuilder.push(style);
      } else {
        if (arg.constructor === String || arg.constructor === Number) {
          strBuilder.push(arg);
        } else {
          break
        }
      }
    }
    if (i > 0) {
      // create logArgs with what we have so far
      strBuilder.push('\x1b[0m');
      logArgs.push(strBuilder.join(''));
    }
    // append the rest
    for (; i < args.length; i++) {
      const arg = args[i];
      if (!(arg instanceof Symbol)) {
        logArgs.push(arg);
      }
    }
    return logArgs
  };
  /* c8 ignore stop */

  /* c8 ignore start */
  const computeLoggingArgs = supportsColor
    ? (isNode ? computeNodeLoggingArgs : computeBrowserLoggingArgs)
    : computeNoColorLoggingArgs;
  /* c8 ignore stop */

  /**
   * @param {Array<string|Symbol|Object|number>} args
   */
  const print = (...args) => {
    console.log(...computeLoggingArgs(args));
    /* c8 ignore next */
    vconsoles.forEach((vc) => vc.print(args));
  };

  /* c8 ignore start */
  /**
   * @param {Array<string|Symbol|Object|number>} args
   */
  const warn = (...args) => {
    console.warn(...computeLoggingArgs(args));
    args.unshift(ORANGE);
    vconsoles.forEach((vc) => vc.print(args));
  };
  /* c8 ignore stop */

  /**
   * @param {Error} err
   */
  /* c8 ignore start */
  const printError = (err) => {
    console.error(err);
    vconsoles.forEach((vc) => vc.printError(err));
  };
  /* c8 ignore stop */

  /**
   * @param {string} url image location
   * @param {number} height height of the image in pixel
   */
  /* c8 ignore start */
  const printImg = (url, height) => {
    if (isBrowser) {
      console.log(
        '%c                      ',
        `font-size: ${height}px; background-size: contain; background-repeat: no-repeat; background-image: url(${url})`
      );
      // console.log('%c                ', `font-size: ${height}x; background: url(${url}) no-repeat;`)
    }
    vconsoles.forEach((vc) => vc.printImg(url, height));
  };
  /* c8 ignore stop */

  /**
   * @param {string} base64
   * @param {number} height
   */
  /* c8 ignore next 2 */
  const printImgBase64 = (base64, height) =>
    printImg(`data:image/gif;base64,${base64}`, height);

  /**
   * @param {Array<string|Symbol|Object|number>} args
   */
  const group = (...args) => {
    console.group(...computeLoggingArgs(args));
    /* c8 ignore next */
    vconsoles.forEach((vc) => vc.group(args));
  };

  /**
   * @param {Array<string|Symbol|Object|number>} args
   */
  const groupCollapsed = (...args) => {
    console.groupCollapsed(...computeLoggingArgs(args));
    /* c8 ignore next */
    vconsoles.forEach((vc) => vc.groupCollapsed(args));
  };

  const groupEnd = () => {
    console.groupEnd();
    /* c8 ignore next */
    vconsoles.forEach((vc) => vc.groupEnd());
  };

  /**
   * @param {function():Node} createNode
   */
  /* c8 ignore next 2 */
  const printDom = (createNode) =>
    vconsoles.forEach((vc) => vc.printDom(createNode()));

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {number} height
   */
  /* c8 ignore next 2 */
  const printCanvas = (canvas, height) =>
    printImg(canvas.toDataURL(), height);

  const vconsoles = create$7();

  /**
   * @param {Array<string|Symbol|Object|number>} args
   * @return {Array<Element>}
   */
  /* c8 ignore start */
  const _computeLineSpans = (args) => {
    const spans = [];
    const currentStyle = new Map();
    // try with formatting until we find something unsupported
    let i = 0;
    for (; i < args.length; i++) {
      const arg = args[i];
      // @ts-ignore
      const style = _browserStyleMap[arg];
      if (style !== undefined) {
        currentStyle.set(style.left, style.right);
      } else {
        if (arg.constructor === String || arg.constructor === Number) {
          // @ts-ignore
          const span = element('span', [
            create$3('style', mapToStyleString(currentStyle))
          ], [text(arg.toString())]);
          if (span.innerHTML === '') {
            span.innerHTML = '&nbsp;';
          }
          spans.push(span);
        } else {
          break
        }
      }
    }
    // append the rest
    for (; i < args.length; i++) {
      let content = args[i];
      if (!(content instanceof Symbol)) {
        if (content.constructor !== String && content.constructor !== Number) {
          content = ' ' + stringify(content) + ' ';
        }
        spans.push(
          element('span', [], [text(/** @type {string} */ (content))])
        );
      }
    }
    return spans
  };
  /* c8 ignore stop */

  const lineStyle =
    'font-family:monospace;border-bottom:1px solid #e2e2e2;padding:2px;';

  /* c8 ignore start */
  class VConsole {
    /**
     * @param {Element} dom
     */
    constructor (dom) {
      this.dom = dom;
      /**
       * @type {Element}
       */
      this.ccontainer = this.dom;
      this.depth = 0;
      vconsoles.add(this);
    }

    /**
     * @param {Array<string|Symbol|Object|number>} args
     * @param {boolean} collapsed
     */
    group (args, collapsed = false) {
      enqueue(() => {
        const triangleDown = element('span', [
          create$3('hidden', collapsed),
          create$3('style', 'color:grey;font-size:120%;')
        ], [text('▼')]);
        const triangleRight = element('span', [
          create$3('hidden', !collapsed),
          create$3('style', 'color:grey;font-size:125%;')
        ], [text('▶')]);
        const content = element(
          'div',
          [create$3(
            'style',
            `${lineStyle};padding-left:${this.depth * 10}px`
          )],
          [triangleDown, triangleRight, text(' ')].concat(
            _computeLineSpans(args)
          )
        );
        const nextContainer = element('div', [
          create$3('hidden', collapsed)
        ]);
        const nextLine = element('div', [], [content, nextContainer]);
        append(this.ccontainer, [nextLine]);
        this.ccontainer = nextContainer;
        this.depth++;
        // when header is clicked, collapse/uncollapse container
        addEventListener(content, 'click', (_event) => {
          nextContainer.toggleAttribute('hidden');
          triangleDown.toggleAttribute('hidden');
          triangleRight.toggleAttribute('hidden');
        });
      });
    }

    /**
     * @param {Array<string|Symbol|Object|number>} args
     */
    groupCollapsed (args) {
      this.group(args, true);
    }

    groupEnd () {
      enqueue(() => {
        if (this.depth > 0) {
          this.depth--;
          // @ts-ignore
          this.ccontainer = this.ccontainer.parentElement.parentElement;
        }
      });
    }

    /**
     * @param {Array<string|Symbol|Object|number>} args
     */
    print (args) {
      enqueue(() => {
        append(this.ccontainer, [
          element('div', [
            create$3(
              'style',
              `${lineStyle};padding-left:${this.depth * 10}px`
            )
          ], _computeLineSpans(args))
        ]);
      });
    }

    /**
     * @param {Error} err
     */
    printError (err) {
      this.print([RED, BOLD, err.toString()]);
    }

    /**
     * @param {string} url
     * @param {number} height
     */
    printImg (url, height) {
      enqueue(() => {
        append(this.ccontainer, [
          element('img', [
            create$3('src', url),
            create$3('height', `${round(height * 1.5)}px`)
          ])
        ]);
      });
    }

    /**
     * @param {Node} node
     */
    printDom (node) {
      enqueue(() => {
        append(this.ccontainer, [node]);
      });
    }

    destroy () {
      enqueue(() => {
        vconsoles.delete(this);
      });
    }
  }
  /* c8 ignore stop */

  /**
   * @param {Element} dom
   */
  /* c8 ignore next */
  const createVConsole = (dom) => new VConsole(dom);

  const loggingColors = [GREEN, PURPLE, ORANGE, BLUE];
  let nextColor = 0;
  let lastLoggingTime = getUnixTime();

  /* c8 ignore start */
  /**
   * @param {string} moduleName
   * @return {function(...any):void}
   */
  const createModuleLogger = (moduleName) => {
    const color = loggingColors[nextColor];
    const debugRegexVar = getVariable('log');
    const doLogging = debugRegexVar !== null &&
      (debugRegexVar === '*' || debugRegexVar === 'true' ||
        new RegExp(debugRegexVar, 'gi').test(moduleName));
    nextColor = (nextColor + 1) % loggingColors.length;
    moduleName += ': ';

    return !doLogging
      ? nop
      : (...args) => {
        const timeNow = getUnixTime();
        const timeDiff = timeNow - lastLoggingTime;
        lastLoggingTime = timeNow;
        print(
          color,
          moduleName,
          UNCOLOR,
          ...args.map((arg) =>
            (typeof arg === 'string' || typeof arg === 'symbol')
              ? arg
              : JSON.stringify(arg)
          ),
          color,
          ' +' + timeDiff + 'ms'
        );
      }
  };
  /* c8 ignore stop */

  var logging$2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    BOLD: BOLD,
    UNBOLD: UNBOLD,
    BLUE: BLUE,
    GREY: GREY,
    GREEN: GREEN,
    RED: RED,
    PURPLE: PURPLE,
    ORANGE: ORANGE,
    UNCOLOR: UNCOLOR,
    print: print,
    warn: warn,
    printError: printError,
    printImg: printImg,
    printImgBase64: printImgBase64,
    group: group,
    groupCollapsed: groupCollapsed,
    groupEnd: groupEnd,
    printDom: printDom,
    printCanvas: printCanvas,
    vconsoles: vconsoles,
    VConsole: VConsole,
    createVConsole: createVConsole,
    createModuleLogger: createModuleLogger
  });

  /* eslint-env browser */

  /**
   * Binary data constants.
   *
   * @module binary
   */

  /**
   * n-th bit activated.
   *
   * @type {number}
   */
  const BIT1 = 1;
  const BIT2 = 2;
  const BIT3 = 4;
  const BIT4 = 8;
  const BIT5 = 16;
  const BIT6 = 32;
  const BIT7 = 64;
  const BIT8 = 128;
  const BIT9 = 256;
  const BIT10 = 512;
  const BIT11 = 1024;
  const BIT12 = 2048;
  const BIT13 = 4096;
  const BIT14 = 8192;
  const BIT15 = 16384;
  const BIT16 = 32768;
  const BIT17 = 65536;
  const BIT18 = 1 << 17;
  const BIT19 = 1 << 18;
  const BIT20 = 1 << 19;
  const BIT21 = 1 << 20;
  const BIT22 = 1 << 21;
  const BIT23 = 1 << 22;
  const BIT24 = 1 << 23;
  const BIT25 = 1 << 24;
  const BIT26 = 1 << 25;
  const BIT27 = 1 << 26;
  const BIT28 = 1 << 27;
  const BIT29 = 1 << 28;
  const BIT30 = 1 << 29;
  const BIT31 = 1 << 30;
  const BIT32 = 1 << 31;

  /**
   * First n bits activated.
   *
   * @type {number}
   */
  const BITS0 = 0;
  const BITS1 = 1;
  const BITS2 = 3;
  const BITS3 = 7;
  const BITS4 = 15;
  const BITS5 = 31;
  const BITS6 = 63;
  const BITS7 = 127;
  const BITS8 = 255;
  const BITS9 = 511;
  const BITS10 = 1023;
  const BITS11 = 2047;
  const BITS12 = 4095;
  const BITS13 = 8191;
  const BITS14 = 16383;
  const BITS15 = 32767;
  const BITS16 = 65535;
  const BITS17 = BIT18 - 1;
  const BITS18 = BIT19 - 1;
  const BITS19 = BIT20 - 1;
  const BITS20 = BIT21 - 1;
  const BITS21 = BIT22 - 1;
  const BITS22 = BIT23 - 1;
  const BITS23 = BIT24 - 1;
  const BITS24 = BIT25 - 1;
  const BITS25 = BIT26 - 1;
  const BITS26 = BIT27 - 1;
  const BITS27 = BIT28 - 1;
  const BITS28 = BIT29 - 1;
  const BITS29 = BIT30 - 1;
  const BITS30 = BIT31 - 1;
  /**
   * @type {number}
   */
  const BITS31 = 0x7FFFFFFF;
  /**
   * @type {number}
   */
  const BITS32 = 0xFFFFFFFF;

  var binary$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    BIT1: BIT1,
    BIT2: BIT2,
    BIT3: BIT3,
    BIT4: BIT4,
    BIT5: BIT5,
    BIT6: BIT6,
    BIT7: BIT7,
    BIT8: BIT8,
    BIT9: BIT9,
    BIT10: BIT10,
    BIT11: BIT11,
    BIT12: BIT12,
    BIT13: BIT13,
    BIT14: BIT14,
    BIT15: BIT15,
    BIT16: BIT16,
    BIT17: BIT17,
    BIT18: BIT18,
    BIT19: BIT19,
    BIT20: BIT20,
    BIT21: BIT21,
    BIT22: BIT22,
    BIT23: BIT23,
    BIT24: BIT24,
    BIT25: BIT25,
    BIT26: BIT26,
    BIT27: BIT27,
    BIT28: BIT28,
    BIT29: BIT29,
    BIT30: BIT30,
    BIT31: BIT31,
    BIT32: BIT32,
    BITS0: BITS0,
    BITS1: BITS1,
    BITS2: BITS2,
    BITS3: BITS3,
    BITS4: BITS4,
    BITS5: BITS5,
    BITS6: BITS6,
    BITS7: BITS7,
    BITS8: BITS8,
    BITS9: BITS9,
    BITS10: BITS10,
    BITS11: BITS11,
    BITS12: BITS12,
    BITS13: BITS13,
    BITS14: BITS14,
    BITS15: BITS15,
    BITS16: BITS16,
    BITS17: BITS17,
    BITS18: BITS18,
    BITS19: BITS19,
    BITS20: BITS20,
    BITS21: BITS21,
    BITS22: BITS22,
    BITS23: BITS23,
    BITS24: BITS24,
    BITS25: BITS25,
    BITS26: BITS26,
    BITS27: BITS27,
    BITS28: BITS28,
    BITS29: BITS29,
    BITS30: BITS30,
    BITS31: BITS31,
    BITS32: BITS32
  });

  /* eslint-env browser */
  const performance = typeof window === 'undefined' ? null : (typeof window.performance !== 'undefined' && window.performance) || null;

  const isoCrypto = typeof crypto === 'undefined' ? null : crypto;

  /**
   * @type {function(number):ArrayBuffer}
   */
  const cryptoRandomBuffer = isoCrypto !== null
    ? len => {
      // browser
      const buf = new ArrayBuffer(len);
      const arr = new Uint8Array(buf);
      isoCrypto.getRandomValues(arr);
      return buf
    }
    : len => {
      // polyfill
      const buf = new ArrayBuffer(len);
      const arr = new Uint8Array(buf);
      for (let i = 0; i < len; i++) {
        arr[i] = Math.ceil((Math.random() * 0xFFFFFFFF) >>> 0);
      }
      return buf
    };

  const rand = Math.random;

  const uint32 = () => new Uint32Array(cryptoRandomBuffer(4))[0];

  const uint53 = () => {
    const arr = new Uint32Array(cryptoRandomBuffer(8));
    return (arr[0] & BITS21) * (BITS32 + 1) + (arr[1] >>> 0)
  };

  /**
   * @template T
   * @param {Array<T>} arr
   * @return {T}
   */
  const oneOf = arr => arr[floor(rand() * arr.length)];

  // @ts-ignore
  const uuidv4Template = [1e7] + -1e3 + -4e3 + -8e3 + -1e11;
  const uuidv4 = () => uuidv4Template.replace(/[018]/g, /** @param {number} c */ c =>
    (c ^ uint32() & 15 >> c / 4).toString(16)
  );

  var random$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    rand: rand,
    uint32: uint32,
    uint53: uint53,
    oneOf: oneOf,
    uuidv4: uuidv4
  });

  /**
   * @module prng
   */

  /**
   * Xorshift32 is a very simple but elegang PRNG with a period of `2^32-1`.
   */
  class Xorshift32 {
    /**
     * @param {number} seed Unsigned 32 bit number
     */
    constructor (seed) {
      this.seed = seed;
      /**
       * @type {number}
       */
      this._state = seed;
    }

    /**
     * Generate a random signed integer.
     *
     * @return {Number} A 32 bit signed integer.
     */
    next () {
      let x = this._state;
      x ^= x << 13;
      x ^= x >> 17;
      x ^= x << 5;
      this._state = x;
      return (x >>> 0) / (BITS32 + 1)
    }
  }

  /**
   * @module prng
   */

  /**
   * This is a variant of xoroshiro128plus - the fastest full-period generator passing BigCrush without systematic failures.
   *
   * This implementation follows the idea of the original xoroshiro128plus implementation,
   * but is optimized for the JavaScript runtime. I.e.
   * * The operations are performed on 32bit integers (the original implementation works with 64bit values).
   * * The initial 128bit state is computed based on a 32bit seed and Xorshift32.
   * * This implementation returns two 32bit values based on the 64bit value that is computed by xoroshiro128plus.
   *   Caution: The last addition step works slightly different than in the original implementation - the add carry of the
   *   first 32bit addition is not carried over to the last 32bit.
   *
   * [Reference implementation](http://vigna.di.unimi.it/xorshift/xoroshiro128plus.c)
   */
  class Xoroshiro128plus {
    /**
     * @param {number} seed Unsigned 32 bit number
     */
    constructor (seed) {
      this.seed = seed;
      // This is a variant of Xoroshiro128plus to fill the initial state
      const xorshift32 = new Xorshift32(seed);
      this.state = new Uint32Array(4);
      for (let i = 0; i < 4; i++) {
        this.state[i] = xorshift32.next() * BITS32;
      }
      this._fresh = true;
    }

    /**
     * @return {number} Float/Double in [0,1)
     */
    next () {
      const state = this.state;
      if (this._fresh) {
        this._fresh = false;
        return ((state[0] + state[2]) >>> 0) / (BITS32 + 1)
      } else {
        this._fresh = true;
        const s0 = state[0];
        const s1 = state[1];
        const s2 = state[2] ^ s0;
        const s3 = state[3] ^ s1;
        // function js_rotl (x, k) {
        //   k = k - 32
        //   const x1 = x[0]
        //   const x2 = x[1]
        //   x[0] = x2 << k | x1 >>> (32 - k)
        //   x[1] = x1 << k | x2 >>> (32 - k)
        // }
        // rotl(s0, 55) // k = 23 = 55 - 32; j = 9 =  32 - 23
        state[0] = (s1 << 23 | s0 >>> 9) ^ s2 ^ (s2 << 14 | s3 >>> 18);
        state[1] = (s0 << 23 | s1 >>> 9) ^ s3 ^ (s3 << 14);
        // rol(s1, 36) // k = 4 = 36 - 32; j = 23 = 32 - 9
        state[2] = s3 << 4 | s2 >>> 28;
        state[3] = s2 << 4 | s3 >>> 28;
        return (((state[1] + state[3]) >>> 0) / (BITS32 + 1))
      }
    }
  }

  /*
  // Reference implementation
  // Source: http://vigna.di.unimi.it/xorshift/xoroshiro128plus.c
  // By David Blackman and Sebastiano Vigna
  // Who published the reference implementation under Public Domain (CC0)

  #include <stdint.h>
  #include <stdio.h>

  uint64_t s[2];

  static inline uint64_t rotl(const uint64_t x, int k) {
      return (x << k) | (x >> (64 - k));
  }

  uint64_t next(void) {
      const uint64_t s0 = s[0];
      uint64_t s1 = s[1];
      s1 ^= s0;
      s[0] = rotl(s0, 55) ^ s1 ^ (s1 << 14); // a, b
      s[1] = rotl(s1, 36); // c
      return (s[0] + s[1]) & 0xFFFFFFFF;
  }

  int main(void)
  {
      int i;
      s[0] = 1111 | (1337ul << 32);
      s[1] = 1234 | (9999ul << 32);

      printf("1000 outputs of genrand_int31()\n");
      for (i=0; i<100; i++) {
          printf("%10lu ", i);
          printf("%10lu ", next());
          printf("- %10lu ", s[0] >> 32);
          printf("%10lu ", (s[0] << 32) >> 32);
          printf("%10lu ", s[1] >> 32);
          printf("%10lu ", (s[1] << 32) >> 32);
          printf("\n");
          // if (i%5==4) printf("\n");
      }
      return 0;
  }
  */

  /**
   * Utility helpers for working with numbers.
   *
   * @module number
   */

  const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

  /**
   * @module number
   */

  /* c8 ignore next */
  const isInteger = Number.isInteger || (num => typeof num === 'number' && isFinite(num) && floor(num) === num);

  /**
   * Efficient schema-less binary encoding with support for variable length encoding.
   *
   * Use [lib0/encoding] with [lib0/decoding]. Every encoding function has a corresponding decoding function.
   *
   * Encodes numbers in little-endian order (least to most significant byte order)
   * and is compatible with Golang's binary encoding (https://golang.org/pkg/encoding/binary/)
   * which is also used in Protocol Buffers.
   *
   * ```js
   * // encoding step
   * const encoder = new encoding.createEncoder()
   * encoding.writeVarUint(encoder, 256)
   * encoding.writeVarString(encoder, 'Hello world!')
   * const buf = encoding.toUint8Array(encoder)
   * ```
   *
   * ```js
   * // decoding step
   * const decoder = new decoding.createDecoder(buf)
   * decoding.readVarUint(decoder) // => 256
   * decoding.readVarString(decoder) // => 'Hello world!'
   * decoding.hasContent(decoder) // => false - all data is read
   * ```
   *
   * @module encoding
   */

  /**
   * A BinaryEncoder handles the encoding to an Uint8Array.
   */
  class Encoder {
    constructor () {
      this.cpos = 0;
      this.cbuf = new Uint8Array(100);
      /**
       * @type {Array<Uint8Array>}
       */
      this.bufs = [];
    }
  }

  /**
   * @function
   * @return {Encoder}
   */
  const createEncoder = () => new Encoder();

  /**
   * The current length of the encoded data.
   *
   * @function
   * @param {Encoder} encoder
   * @return {number}
   */
  const length = encoder => {
    let len = encoder.cpos;
    for (let i = 0; i < encoder.bufs.length; i++) {
      len += encoder.bufs[i].length;
    }
    return len
  };

  /**
   * Transform to Uint8Array.
   *
   * @function
   * @param {Encoder} encoder
   * @return {Uint8Array} The created ArrayBuffer.
   */
  const toUint8Array = encoder => {
    const uint8arr = new Uint8Array(length(encoder));
    let curPos = 0;
    for (let i = 0; i < encoder.bufs.length; i++) {
      const d = encoder.bufs[i];
      uint8arr.set(d, curPos);
      curPos += d.length;
    }
    uint8arr.set(createUint8ArrayViewFromArrayBuffer(encoder.cbuf.buffer, 0, encoder.cpos), curPos);
    return uint8arr
  };

  /**
   * Verify that it is possible to write `len` bytes wtihout checking. If
   * necessary, a new Buffer with the required length is attached.
   *
   * @param {Encoder} encoder
   * @param {number} len
   */
  const verifyLen = (encoder, len) => {
    const bufferLen = encoder.cbuf.length;
    if (bufferLen - encoder.cpos < len) {
      encoder.bufs.push(createUint8ArrayViewFromArrayBuffer(encoder.cbuf.buffer, 0, encoder.cpos));
      encoder.cbuf = new Uint8Array(max(bufferLen, len) * 2);
      encoder.cpos = 0;
    }
  };

  /**
   * Write one byte to the encoder.
   *
   * @function
   * @param {Encoder} encoder
   * @param {number} num The byte that is to be encoded.
   */
  const write = (encoder, num) => {
    const bufferLen = encoder.cbuf.length;
    if (encoder.cpos === bufferLen) {
      encoder.bufs.push(encoder.cbuf);
      encoder.cbuf = new Uint8Array(bufferLen * 2);
      encoder.cpos = 0;
    }
    encoder.cbuf[encoder.cpos++] = num;
  };

  /**
   * Write one byte at a specific position.
   * Position must already be written (i.e. encoder.length > pos)
   *
   * @function
   * @param {Encoder} encoder
   * @param {number} pos Position to which to write data
   * @param {number} num Unsigned 8-bit integer
   */
  const set$1 = (encoder, pos, num) => {
    let buffer = null;
    // iterate all buffers and adjust position
    for (let i = 0; i < encoder.bufs.length && buffer === null; i++) {
      const b = encoder.bufs[i];
      if (pos < b.length) {
        buffer = b; // found buffer
      } else {
        pos -= b.length;
      }
    }
    if (buffer === null) {
      // use current buffer
      buffer = encoder.cbuf;
    }
    buffer[pos] = num;
  };

  /**
   * Write one byte as an unsigned integer.
   *
   * @function
   * @param {Encoder} encoder
   * @param {number} num The number that is to be encoded.
   */
  const writeUint8 = write;

  /**
   * Write one byte as an unsigned Integer at a specific location.
   *
   * @function
   * @param {Encoder} encoder
   * @param {number} pos The location where the data will be written.
   * @param {number} num The number that is to be encoded.
   */
  const setUint8 = set$1;

  /**
   * Write two bytes as an unsigned integer.
   *
   * @function
   * @param {Encoder} encoder
   * @param {number} num The number that is to be encoded.
   */
  const writeUint16 = (encoder, num) => {
    write(encoder, num & BITS8);
    write(encoder, (num >>> 8) & BITS8);
  };
  /**
   * Write two bytes as an unsigned integer at a specific location.
   *
   * @function
   * @param {Encoder} encoder
   * @param {number} pos The location where the data will be written.
   * @param {number} num The number that is to be encoded.
   */
  const setUint16 = (encoder, pos, num) => {
    set$1(encoder, pos, num & BITS8);
    set$1(encoder, pos + 1, (num >>> 8) & BITS8);
  };

  /**
   * Write two bytes as an unsigned integer
   *
   * @function
   * @param {Encoder} encoder
   * @param {number} num The number that is to be encoded.
   */
  const writeUint32 = (encoder, num) => {
    for (let i = 0; i < 4; i++) {
      write(encoder, num & BITS8);
      num >>>= 8;
    }
  };

  /**
   * Write two bytes as an unsigned integer in big endian order.
   * (most significant byte first)
   *
   * @function
   * @param {Encoder} encoder
   * @param {number} num The number that is to be encoded.
   */
  const writeUint32BigEndian = (encoder, num) => {
    for (let i = 3; i >= 0; i--) {
      write(encoder, (num >>> (8 * i)) & BITS8);
    }
  };

  /**
   * Write two bytes as an unsigned integer at a specific location.
   *
   * @function
   * @param {Encoder} encoder
   * @param {number} pos The location where the data will be written.
   * @param {number} num The number that is to be encoded.
   */
  const setUint32 = (encoder, pos, num) => {
    for (let i = 0; i < 4; i++) {
      set$1(encoder, pos + i, num & BITS8);
      num >>>= 8;
    }
  };

  /**
   * Write a variable length unsigned integer. Max encodable integer is 2^53.
   *
   * @function
   * @param {Encoder} encoder
   * @param {number} num The number that is to be encoded.
   */
  const writeVarUint = (encoder, num) => {
    while (num > BITS7) {
      write(encoder, BIT8 | (BITS7 & num));
      num = floor(num / 128); // shift >>> 7
    }
    write(encoder, BITS7 & num);
  };

  /**
   * Write a variable length integer.
   *
   * We use the 7th bit instead for signaling that this is a negative number.
   *
   * @function
   * @param {Encoder} encoder
   * @param {number} num The number that is to be encoded.
   */
  const writeVarInt = (encoder, num) => {
    const isNegative = isNegativeZero(num);
    if (isNegative) {
      num = -num;
    }
    //             |- whether to continue reading         |- whether is negative     |- number
    write(encoder, (num > BITS6 ? BIT8 : 0) | (isNegative ? BIT7 : 0) | (BITS6 & num));
    num = floor(num / 64); // shift >>> 6
    // We don't need to consider the case of num === 0 so we can use a different
    // pattern here than above.
    while (num > 0) {
      write(encoder, (num > BITS7 ? BIT8 : 0) | (BITS7 & num));
      num = floor(num / 128); // shift >>> 7
    }
  };

  /**
   * A cache to store strings temporarily
   */
  const _strBuffer = new Uint8Array(30000);
  const _maxStrBSize = _strBuffer.length / 3;

  /**
   * Write a variable length string.
   *
   * @function
   * @param {Encoder} encoder
   * @param {String} str The string that is to be encoded.
   */
  const _writeVarStringNative = (encoder, str) => {
    if (str.length < _maxStrBSize) {
      // We can encode the string into the existing buffer
      /* c8 ignore next */
      const written = utf8TextEncoder.encodeInto(str, _strBuffer).written || 0;
      writeVarUint(encoder, written);
      for (let i = 0; i < written; i++) {
        write(encoder, _strBuffer[i]);
      }
    } else {
      writeVarUint8Array(encoder, encodeUtf8(str));
    }
  };

  /**
   * Write a variable length string.
   *
   * @function
   * @param {Encoder} encoder
   * @param {String} str The string that is to be encoded.
   */
  const _writeVarStringPolyfill = (encoder, str) => {
    const encodedString = unescape(encodeURIComponent(str));
    const len = encodedString.length;
    writeVarUint(encoder, len);
    for (let i = 0; i < len; i++) {
      write(encoder, /** @type {number} */ (encodedString.codePointAt(i)));
    }
  };

  /**
   * Write a variable length string.
   *
   * @function
   * @param {Encoder} encoder
   * @param {String} str The string that is to be encoded.
   */
  /* c8 ignore next */
  const writeVarString = (utf8TextEncoder && utf8TextEncoder.encodeInto) ? _writeVarStringNative : _writeVarStringPolyfill;

  /**
   * Write the content of another Encoder.
   *
   * @TODO: can be improved!
   *        - Note: Should consider that when appending a lot of small Encoders, we should rather clone than referencing the old structure.
   *                Encoders start with a rather big initial buffer.
   *
   * @function
   * @param {Encoder} encoder The enUint8Arr
   * @param {Encoder} append The BinaryEncoder to be written.
   */
  const writeBinaryEncoder = (encoder, append) => writeUint8Array(encoder, toUint8Array(append));

  /**
   * Append fixed-length Uint8Array to the encoder.
   *
   * @function
   * @param {Encoder} encoder
   * @param {Uint8Array} uint8Array
   */
  const writeUint8Array = (encoder, uint8Array) => {
    const bufferLen = encoder.cbuf.length;
    const cpos = encoder.cpos;
    const leftCopyLen = min(bufferLen - cpos, uint8Array.length);
    const rightCopyLen = uint8Array.length - leftCopyLen;
    encoder.cbuf.set(uint8Array.subarray(0, leftCopyLen), cpos);
    encoder.cpos += leftCopyLen;
    if (rightCopyLen > 0) {
      // Still something to write, write right half..
      // Append new buffer
      encoder.bufs.push(encoder.cbuf);
      // must have at least size of remaining buffer
      encoder.cbuf = new Uint8Array(max(bufferLen * 2, rightCopyLen));
      // copy array
      encoder.cbuf.set(uint8Array.subarray(leftCopyLen));
      encoder.cpos = rightCopyLen;
    }
  };

  /**
   * Append an Uint8Array to Encoder.
   *
   * @function
   * @param {Encoder} encoder
   * @param {Uint8Array} uint8Array
   */
  const writeVarUint8Array = (encoder, uint8Array) => {
    writeVarUint(encoder, uint8Array.byteLength);
    writeUint8Array(encoder, uint8Array);
  };

  /**
   * Create an DataView of the next `len` bytes. Use it to write data after
   * calling this function.
   *
   * ```js
   * // write float32 using DataView
   * const dv = writeOnDataView(encoder, 4)
   * dv.setFloat32(0, 1.1)
   * // read float32 using DataView
   * const dv = readFromDataView(encoder, 4)
   * dv.getFloat32(0) // => 1.100000023841858 (leaving it to the reader to find out why this is the correct result)
   * ```
   *
   * @param {Encoder} encoder
   * @param {number} len
   * @return {DataView}
   */
  const writeOnDataView = (encoder, len) => {
    verifyLen(encoder, len);
    const dview = new DataView(encoder.cbuf.buffer, encoder.cpos, len);
    encoder.cpos += len;
    return dview
  };

  /**
   * @param {Encoder} encoder
   * @param {number} num
   */
  const writeFloat32 = (encoder, num) => writeOnDataView(encoder, 4).setFloat32(0, num, false);

  /**
   * @param {Encoder} encoder
   * @param {number} num
   */
  const writeFloat64 = (encoder, num) => writeOnDataView(encoder, 8).setFloat64(0, num, false);

  /**
   * @param {Encoder} encoder
   * @param {bigint} num
   */
  const writeBigInt64 = (encoder, num) => /** @type {any} */ (writeOnDataView(encoder, 8)).setBigInt64(0, num, false);

  /**
   * @param {Encoder} encoder
   * @param {bigint} num
   */
  const writeBigUint64 = (encoder, num) => /** @type {any} */ (writeOnDataView(encoder, 8)).setBigUint64(0, num, false);

  const floatTestBed = new DataView(new ArrayBuffer(4));
  /**
   * Check if a number can be encoded as a 32 bit float.
   *
   * @param {number} num
   * @return {boolean}
   */
  const isFloat32 = num => {
    floatTestBed.setFloat32(0, num);
    return floatTestBed.getFloat32(0) === num
  };

  /**
   * Encode data with efficient binary format.
   *
   * Differences to JSON:
   * • Transforms data to a binary format (not to a string)
   * • Encodes undefined, NaN, and ArrayBuffer (these can't be represented in JSON)
   * • Numbers are efficiently encoded either as a variable length integer, as a
   *   32 bit float, as a 64 bit float, or as a 64 bit bigint.
   *
   * Encoding table:
   *
   * | Data Type           | Prefix   | Encoding Method    | Comment |
   * | ------------------- | -------- | ------------------ | ------- |
   * | undefined           | 127      |                    | Functions, symbol, and everything that cannot be identified is encoded as undefined |
   * | null                | 126      |                    | |
   * | integer             | 125      | writeVarInt        | Only encodes 32 bit signed integers |
   * | float32             | 124      | writeFloat32       | |
   * | float64             | 123      | writeFloat64       | |
   * | bigint              | 122      | writeBigInt64      | |
   * | boolean (false)     | 121      |                    | True and false are different data types so we save the following byte |
   * | boolean (true)      | 120      |                    | - 0b01111000 so the last bit determines whether true or false |
   * | string              | 119      | writeVarString     | |
   * | object<string,any>  | 118      | custom             | Writes {length} then {length} key-value pairs |
   * | array<any>          | 117      | custom             | Writes {length} then {length} json values |
   * | Uint8Array          | 116      | writeVarUint8Array | We use Uint8Array for any kind of binary data |
   *
   * Reasons for the decreasing prefix:
   * We need the first bit for extendability (later we may want to encode the
   * prefix with writeVarUint). The remaining 7 bits are divided as follows:
   * [0-30]   the beginning of the data range is used for custom purposes
   *          (defined by the function that uses this library)
   * [31-127] the end of the data range is used for data encoding by
   *          lib0/encoding.js
   *
   * @param {Encoder} encoder
   * @param {undefined|null|number|bigint|boolean|string|Object<string,any>|Array<any>|Uint8Array} data
   */
  const writeAny = (encoder, data) => {
    switch (typeof data) {
      case 'string':
        // TYPE 119: STRING
        write(encoder, 119);
        writeVarString(encoder, data);
        break
      case 'number':
        if (isInteger(data) && abs(data) <= BITS31) {
          // TYPE 125: INTEGER
          write(encoder, 125);
          writeVarInt(encoder, data);
        } else if (isFloat32(data)) {
          // TYPE 124: FLOAT32
          write(encoder, 124);
          writeFloat32(encoder, data);
        } else {
          // TYPE 123: FLOAT64
          write(encoder, 123);
          writeFloat64(encoder, data);
        }
        break
      case 'bigint':
        // TYPE 122: BigInt
        write(encoder, 122);
        writeBigInt64(encoder, data);
        break
      case 'object':
        if (data === null) {
          // TYPE 126: null
          write(encoder, 126);
        } else if (data instanceof Array) {
          // TYPE 117: Array
          write(encoder, 117);
          writeVarUint(encoder, data.length);
          for (let i = 0; i < data.length; i++) {
            writeAny(encoder, data[i]);
          }
        } else if (data instanceof Uint8Array) {
          // TYPE 116: ArrayBuffer
          write(encoder, 116);
          writeVarUint8Array(encoder, data);
        } else {
          // TYPE 118: Object
          write(encoder, 118);
          const keys = Object.keys(data);
          writeVarUint(encoder, keys.length);
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            writeVarString(encoder, key);
            writeAny(encoder, data[key]);
          }
        }
        break
      case 'boolean':
        // TYPE 120/121: boolean (true/false)
        write(encoder, data ? 120 : 121);
        break
      default:
        // TYPE 127: undefined
        write(encoder, 127);
    }
  };

  /**
   * Now come a few stateful encoder that have their own classes.
   */

  /**
   * Basic Run Length Encoder - a basic compression implementation.
   *
   * Encodes [1,1,1,7] to [1,3,7,1] (3 times 1, 1 time 7). This encoder might do more harm than good if there are a lot of values that are not repeated.
   *
   * It was originally used for image compression. Cool .. article http://csbruce.com/cbm/transactor/pdfs/trans_v7_i06.pdf
   *
   * @note T must not be null!
   *
   * @template T
   */
  class RleEncoder extends Encoder {
    /**
     * @param {function(Encoder, T):void} writer
     */
    constructor (writer) {
      super();
      /**
       * The writer
       */
      this.w = writer;
      /**
       * Current state
       * @type {T|null}
       */
      this.s = null;
      this.count = 0;
    }

    /**
     * @param {T} v
     */
    write (v) {
      if (this.s === v) {
        this.count++;
      } else {
        if (this.count > 0) {
          // flush counter, unless this is the first value (count = 0)
          writeVarUint(this, this.count - 1); // since count is always > 0, we can decrement by one. non-standard encoding ftw
        }
        this.count = 1;
        // write first value
        this.w(this, v);
        this.s = v;
      }
    }
  }

  /**
   * Basic diff decoder using variable length encoding.
   *
   * Encodes the values [3, 1100, 1101, 1050, 0] to [3, 1097, 1, -51, -1050] using writeVarInt.
   */
  class IntDiffEncoder extends Encoder {
    /**
     * @param {number} start
     */
    constructor (start) {
      super();
      /**
       * Current state
       * @type {number}
       */
      this.s = start;
    }

    /**
     * @param {number} v
     */
    write (v) {
      writeVarInt(this, v - this.s);
      this.s = v;
    }
  }

  /**
   * A combination of IntDiffEncoder and RleEncoder.
   *
   * Basically first writes the IntDiffEncoder and then counts duplicate diffs using RleEncoding.
   *
   * Encodes the values [1,1,1,2,3,4,5,6] as [1,1,0,2,1,5] (RLE([1,0,0,1,1,1,1,1]) ⇒ RleIntDiff[1,1,0,2,1,5])
   */
  class RleIntDiffEncoder extends Encoder {
    /**
     * @param {number} start
     */
    constructor (start) {
      super();
      /**
       * Current state
       * @type {number}
       */
      this.s = start;
      this.count = 0;
    }

    /**
     * @param {number} v
     */
    write (v) {
      if (this.s === v && this.count > 0) {
        this.count++;
      } else {
        if (this.count > 0) {
          // flush counter, unless this is the first value (count = 0)
          writeVarUint(this, this.count - 1); // since count is always > 0, we can decrement by one. non-standard encoding ftw
        }
        this.count = 1;
        // write first value
        writeVarInt(this, v - this.s);
        this.s = v;
      }
    }
  }

  /**
   * @param {UintOptRleEncoder} encoder
   */
  const flushUintOptRleEncoder = encoder => {
    if (encoder.count > 0) {
      // flush counter, unless this is the first value (count = 0)
      // case 1: just a single value. set sign to positive
      // case 2: write several values. set sign to negative to indicate that there is a length coming
      writeVarInt(encoder.encoder, encoder.count === 1 ? encoder.s : -encoder.s);
      if (encoder.count > 1) {
        writeVarUint(encoder.encoder, encoder.count - 2); // since count is always > 1, we can decrement by one. non-standard encoding ftw
      }
    }
  };

  /**
   * Optimized Rle encoder that does not suffer from the mentioned problem of the basic Rle encoder.
   *
   * Internally uses VarInt encoder to write unsigned integers. If the input occurs multiple times, we write
   * write it as a negative number. The UintOptRleDecoder then understands that it needs to read a count.
   *
   * Encodes [1,2,3,3,3] as [1,2,-3,3] (once 1, once 2, three times 3)
   */
  class UintOptRleEncoder {
    constructor () {
      this.encoder = new Encoder();
      /**
       * @type {number}
       */
      this.s = 0;
      this.count = 0;
    }

    /**
     * @param {number} v
     */
    write (v) {
      if (this.s === v) {
        this.count++;
      } else {
        flushUintOptRleEncoder(this);
        this.count = 1;
        this.s = v;
      }
    }

    toUint8Array () {
      flushUintOptRleEncoder(this);
      return toUint8Array(this.encoder)
    }
  }

  /**
   * Increasing Uint Optimized RLE Encoder
   *
   * The RLE encoder counts the number of same occurences of the same value.
   * The IncUintOptRle encoder counts if the value increases.
   * I.e. 7, 8, 9, 10 will be encoded as [-7, 4]. 1, 3, 5 will be encoded
   * as [1, 3, 5].
   */
  class IncUintOptRleEncoder {
    constructor () {
      this.encoder = new Encoder();
      /**
       * @type {number}
       */
      this.s = 0;
      this.count = 0;
    }

    /**
     * @param {number} v
     */
    write (v) {
      if (this.s + this.count === v) {
        this.count++;
      } else {
        flushUintOptRleEncoder(this);
        this.count = 1;
        this.s = v;
      }
    }

    toUint8Array () {
      flushUintOptRleEncoder(this);
      return toUint8Array(this.encoder)
    }
  }

  /**
   * @param {IntDiffOptRleEncoder} encoder
   */
  const flushIntDiffOptRleEncoder = encoder => {
    if (encoder.count > 0) {
      //          31 bit making up the diff | wether to write the counter
      // const encodedDiff = encoder.diff << 1 | (encoder.count === 1 ? 0 : 1)
      const encodedDiff = encoder.diff * 2 + (encoder.count === 1 ? 0 : 1);
      // flush counter, unless this is the first value (count = 0)
      // case 1: just a single value. set first bit to positive
      // case 2: write several values. set first bit to negative to indicate that there is a length coming
      writeVarInt(encoder.encoder, encodedDiff);
      if (encoder.count > 1) {
        writeVarUint(encoder.encoder, encoder.count - 2); // since count is always > 1, we can decrement by one. non-standard encoding ftw
      }
    }
  };

  /**
   * A combination of the IntDiffEncoder and the UintOptRleEncoder.
   *
   * The count approach is similar to the UintDiffOptRleEncoder, but instead of using the negative bitflag, it encodes
   * in the LSB whether a count is to be read. Therefore this Encoder only supports 31 bit integers!
   *
   * Encodes [1, 2, 3, 2] as [3, 1, 6, -1] (more specifically [(1 << 1) | 1, (3 << 0) | 0, -1])
   *
   * Internally uses variable length encoding. Contrary to normal UintVar encoding, the first byte contains:
   * * 1 bit that denotes whether the next value is a count (LSB)
   * * 1 bit that denotes whether this value is negative (MSB - 1)
   * * 1 bit that denotes whether to continue reading the variable length integer (MSB)
   *
   * Therefore, only five bits remain to encode diff ranges.
   *
   * Use this Encoder only when appropriate. In most cases, this is probably a bad idea.
   */
  class IntDiffOptRleEncoder {
    constructor () {
      this.encoder = new Encoder();
      /**
       * @type {number}
       */
      this.s = 0;
      this.count = 0;
      this.diff = 0;
    }

    /**
     * @param {number} v
     */
    write (v) {
      if (this.diff === v - this.s) {
        this.s = v;
        this.count++;
      } else {
        flushIntDiffOptRleEncoder(this);
        this.count = 1;
        this.diff = v - this.s;
        this.s = v;
      }
    }

    toUint8Array () {
      flushIntDiffOptRleEncoder(this);
      return toUint8Array(this.encoder)
    }
  }

  /**
   * Optimized String Encoder.
   *
   * Encoding many small strings in a simple Encoder is not very efficient. The function call to decode a string takes some time and creates references that must be eventually deleted.
   * In practice, when decoding several million small strings, the GC will kick in more and more often to collect orphaned string objects (or maybe there is another reason?).
   *
   * This string encoder solves the above problem. All strings are concatenated and written as a single string using a single encoding call.
   *
   * The lengths are encoded using a UintOptRleEncoder.
   */
  class StringEncoder {
    constructor () {
      /**
       * @type {Array<string>}
       */
      this.sarr = [];
      this.s = '';
      this.lensE = new UintOptRleEncoder();
    }

    /**
     * @param {string} string
     */
    write (string) {
      this.s += string;
      if (this.s.length > 19) {
        this.sarr.push(this.s);
        this.s = '';
      }
      this.lensE.write(string.length);
    }

    toUint8Array () {
      const encoder = new Encoder();
      this.sarr.push(this.s);
      this.s = '';
      writeVarString(encoder, this.sarr.join(''));
      writeUint8Array(encoder, this.lensE.toUint8Array());
      return toUint8Array(encoder)
    }
  }

  var encoding$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Encoder: Encoder,
    createEncoder: createEncoder,
    length: length,
    toUint8Array: toUint8Array,
    verifyLen: verifyLen,
    write: write,
    set: set$1,
    writeUint8: writeUint8,
    setUint8: setUint8,
    writeUint16: writeUint16,
    setUint16: setUint16,
    writeUint32: writeUint32,
    writeUint32BigEndian: writeUint32BigEndian,
    setUint32: setUint32,
    writeVarUint: writeVarUint,
    writeVarInt: writeVarInt,
    _writeVarStringNative: _writeVarStringNative,
    _writeVarStringPolyfill: _writeVarStringPolyfill,
    writeVarString: writeVarString,
    writeBinaryEncoder: writeBinaryEncoder,
    writeUint8Array: writeUint8Array,
    writeVarUint8Array: writeVarUint8Array,
    writeOnDataView: writeOnDataView,
    writeFloat32: writeFloat32,
    writeFloat64: writeFloat64,
    writeBigInt64: writeBigInt64,
    writeBigUint64: writeBigUint64,
    writeAny: writeAny,
    RleEncoder: RleEncoder,
    IntDiffEncoder: IntDiffEncoder,
    RleIntDiffEncoder: RleIntDiffEncoder,
    UintOptRleEncoder: UintOptRleEncoder,
    IncUintOptRleEncoder: IncUintOptRleEncoder,
    IntDiffOptRleEncoder: IntDiffOptRleEncoder,
    StringEncoder: StringEncoder
  });

  /**
   * Error helpers.
   *
   * @module error
   */

  /**
   * @param {string} s
   * @return {Error}
   */
  /* c8 ignore next */
  const create$2 = s => new Error(s);

  /**
   * @throws {Error}
   * @return {never}
   */
  /* c8 ignore next 3 */
  const methodUnimplemented = () => {
    throw create$2('Method unimplemented')
  };

  /**
   * @throws {Error}
   * @return {never}
   */
  /* c8 ignore next 3 */
  const unexpectedCase = () => {
    throw create$2('Unexpected case')
  };

  var error$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    create: create$2,
    methodUnimplemented: methodUnimplemented,
    unexpectedCase: unexpectedCase
  });

  /**
   * Efficient schema-less binary decoding with support for variable length encoding.
   *
   * Use [lib0/decoding] with [lib0/encoding]. Every encoding function has a corresponding decoding function.
   *
   * Encodes numbers in little-endian order (least to most significant byte order)
   * and is compatible with Golang's binary encoding (https://golang.org/pkg/encoding/binary/)
   * which is also used in Protocol Buffers.
   *
   * ```js
   * // encoding step
   * const encoder = new encoding.createEncoder()
   * encoding.writeVarUint(encoder, 256)
   * encoding.writeVarString(encoder, 'Hello world!')
   * const buf = encoding.toUint8Array(encoder)
   * ```
   *
   * ```js
   * // decoding step
   * const decoder = new decoding.createDecoder(buf)
   * decoding.readVarUint(decoder) // => 256
   * decoding.readVarString(decoder) // => 'Hello world!'
   * decoding.hasContent(decoder) // => false - all data is read
   * ```
   *
   * @module decoding
   */

  const errorUnexpectedEndOfArray = create$2('Unexpected end of array');
  const errorIntegerOutOfRange = create$2('Integer out of Range');

  /**
   * A Decoder handles the decoding of an Uint8Array.
   */
  class Decoder {
    /**
     * @param {Uint8Array} uint8Array Binary data to decode
     */
    constructor (uint8Array) {
      /**
       * Decoding target.
       *
       * @type {Uint8Array}
       */
      this.arr = uint8Array;
      /**
       * Current decoding position.
       *
       * @type {number}
       */
      this.pos = 0;
    }
  }

  /**
   * @function
   * @param {Uint8Array} uint8Array
   * @return {Decoder}
   */
  const createDecoder = uint8Array => new Decoder(uint8Array);

  /**
   * @function
   * @param {Decoder} decoder
   * @return {boolean}
   */
  const hasContent = decoder => decoder.pos !== decoder.arr.length;

  /**
   * Clone a decoder instance.
   * Optionally set a new position parameter.
   *
   * @function
   * @param {Decoder} decoder The decoder instance
   * @param {number} [newPos] Defaults to current position
   * @return {Decoder} A clone of `decoder`
   */
  const clone = (decoder, newPos = decoder.pos) => {
    const _decoder = createDecoder(decoder.arr);
    _decoder.pos = newPos;
    return _decoder
  };

  /**
   * Create an Uint8Array view of the next `len` bytes and advance the position by `len`.
   *
   * Important: The Uint8Array still points to the underlying ArrayBuffer. Make sure to discard the result as soon as possible to prevent any memory leaks.
   *            Use `buffer.copyUint8Array` to copy the result into a new Uint8Array.
   *
   * @function
   * @param {Decoder} decoder The decoder instance
   * @param {number} len The length of bytes to read
   * @return {Uint8Array}
   */
  const readUint8Array = (decoder, len) => {
    const view = createUint8ArrayViewFromArrayBuffer(decoder.arr.buffer, decoder.pos + decoder.arr.byteOffset, len);
    decoder.pos += len;
    return view
  };

  /**
   * Read variable length Uint8Array.
   *
   * Important: The Uint8Array still points to the underlying ArrayBuffer. Make sure to discard the result as soon as possible to prevent any memory leaks.
   *            Use `buffer.copyUint8Array` to copy the result into a new Uint8Array.
   *
   * @function
   * @param {Decoder} decoder
   * @return {Uint8Array}
   */
  const readVarUint8Array = decoder => readUint8Array(decoder, readVarUint(decoder));

  /**
   * Read the rest of the content as an ArrayBuffer
   * @function
   * @param {Decoder} decoder
   * @return {Uint8Array}
   */
  const readTailAsUint8Array = decoder => readUint8Array(decoder, decoder.arr.length - decoder.pos);

  /**
   * Skip one byte, jump to the next position.
   * @function
   * @param {Decoder} decoder The decoder instance
   * @return {number} The next position
   */
  const skip8 = decoder => decoder.pos++;

  /**
   * Read one byte as unsigned integer.
   * @function
   * @param {Decoder} decoder The decoder instance
   * @return {number} Unsigned 8-bit integer
   */
  const readUint8 = decoder => decoder.arr[decoder.pos++];

  /**
   * Read 2 bytes as unsigned integer.
   *
   * @function
   * @param {Decoder} decoder
   * @return {number} An unsigned integer.
   */
  const readUint16 = decoder => {
    const uint =
      decoder.arr[decoder.pos] +
      (decoder.arr[decoder.pos + 1] << 8);
    decoder.pos += 2;
    return uint
  };

  /**
   * Read 4 bytes as unsigned integer.
   *
   * @function
   * @param {Decoder} decoder
   * @return {number} An unsigned integer.
   */
  const readUint32 = decoder => {
    const uint =
      (decoder.arr[decoder.pos] +
      (decoder.arr[decoder.pos + 1] << 8) +
      (decoder.arr[decoder.pos + 2] << 16) +
      (decoder.arr[decoder.pos + 3] << 24)) >>> 0;
    decoder.pos += 4;
    return uint
  };

  /**
   * Read 4 bytes as unsigned integer in big endian order.
   * (most significant byte first)
   *
   * @function
   * @param {Decoder} decoder
   * @return {number} An unsigned integer.
   */
  const readUint32BigEndian = decoder => {
    const uint =
      (decoder.arr[decoder.pos + 3] +
      (decoder.arr[decoder.pos + 2] << 8) +
      (decoder.arr[decoder.pos + 1] << 16) +
      (decoder.arr[decoder.pos] << 24)) >>> 0;
    decoder.pos += 4;
    return uint
  };

  /**
   * Look ahead without incrementing the position
   * to the next byte and read it as unsigned integer.
   *
   * @function
   * @param {Decoder} decoder
   * @return {number} An unsigned integer.
   */
  const peekUint8 = decoder => decoder.arr[decoder.pos];

  /**
   * Look ahead without incrementing the position
   * to the next byte and read it as unsigned integer.
   *
   * @function
   * @param {Decoder} decoder
   * @return {number} An unsigned integer.
   */
  const peekUint16 = decoder =>
    decoder.arr[decoder.pos] +
    (decoder.arr[decoder.pos + 1] << 8);

  /**
   * Look ahead without incrementing the position
   * to the next byte and read it as unsigned integer.
   *
   * @function
   * @param {Decoder} decoder
   * @return {number} An unsigned integer.
   */
  const peekUint32 = decoder => (
    decoder.arr[decoder.pos] +
    (decoder.arr[decoder.pos + 1] << 8) +
    (decoder.arr[decoder.pos + 2] << 16) +
    (decoder.arr[decoder.pos + 3] << 24)
  ) >>> 0;

  /**
   * Read unsigned integer (32bit) with variable length.
   * 1/8th of the storage is used as encoding overhead.
   *  * numbers < 2^7 is stored in one bytlength
   *  * numbers < 2^14 is stored in two bylength
   *
   * @function
   * @param {Decoder} decoder
   * @return {number} An unsigned integer.length
   */
  const readVarUint = decoder => {
    let num = 0;
    let mult = 1;
    const len = decoder.arr.length;
    while (decoder.pos < len) {
      const r = decoder.arr[decoder.pos++];
      // num = num | ((r & binary.BITS7) << len)
      num = num + (r & BITS7) * mult; // shift $r << (7*#iterations) and add it to num
      mult *= 128; // next iteration, shift 7 "more" to the left
      if (r < BIT8) {
        return num
      }
      /* c8 ignore start */
      if (num > MAX_SAFE_INTEGER) {
        throw errorIntegerOutOfRange
      }
      /* c8 ignore stop */
    }
    throw errorUnexpectedEndOfArray
  };

  /**
   * Read signed integer (32bit) with variable length.
   * 1/8th of the storage is used as encoding overhead.
   *  * numbers < 2^7 is stored in one bytlength
   *  * numbers < 2^14 is stored in two bylength
   * @todo This should probably create the inverse ~num if number is negative - but this would be a breaking change.
   *
   * @function
   * @param {Decoder} decoder
   * @return {number} An unsigned integer.length
   */
  const readVarInt = decoder => {
    let r = decoder.arr[decoder.pos++];
    let num = r & BITS6;
    let mult = 64;
    const sign = (r & BIT7) > 0 ? -1 : 1;
    if ((r & BIT8) === 0) {
      // don't continue reading
      return sign * num
    }
    const len = decoder.arr.length;
    while (decoder.pos < len) {
      r = decoder.arr[decoder.pos++];
      // num = num | ((r & binary.BITS7) << len)
      num = num + (r & BITS7) * mult;
      mult *= 128;
      if (r < BIT8) {
        return sign * num
      }
      /* c8 ignore start */
      if (num > MAX_SAFE_INTEGER) {
        throw errorIntegerOutOfRange
      }
      /* c8 ignore stop */
    }
    throw errorUnexpectedEndOfArray
  };

  /**
   * Look ahead and read varUint without incrementing position
   *
   * @function
   * @param {Decoder} decoder
   * @return {number}
   */
  const peekVarUint = decoder => {
    const pos = decoder.pos;
    const s = readVarUint(decoder);
    decoder.pos = pos;
    return s
  };

  /**
   * Look ahead and read varUint without incrementing position
   *
   * @function
   * @param {Decoder} decoder
   * @return {number}
   */
  const peekVarInt = decoder => {
    const pos = decoder.pos;
    const s = readVarInt(decoder);
    decoder.pos = pos;
    return s
  };

  /**
   * We don't test this function anymore as we use native decoding/encoding by default now.
   * Better not modify this anymore..
   *
   * Transforming utf8 to a string is pretty expensive. The code performs 10x better
   * when String.fromCodePoint is fed with all characters as arguments.
   * But most environments have a maximum number of arguments per functions.
   * For effiency reasons we apply a maximum of 10000 characters at once.
   *
   * @function
   * @param {Decoder} decoder
   * @return {String} The read String.
   */
  /* c8 ignore start */
  const _readVarStringPolyfill = decoder => {
    let remainingLen = readVarUint(decoder);
    if (remainingLen === 0) {
      return ''
    } else {
      let encodedString = String.fromCodePoint(readUint8(decoder)); // remember to decrease remainingLen
      if (--remainingLen < 100) { // do not create a Uint8Array for small strings
        while (remainingLen--) {
          encodedString += String.fromCodePoint(readUint8(decoder));
        }
      } else {
        while (remainingLen > 0) {
          const nextLen = remainingLen < 10000 ? remainingLen : 10000;
          // this is dangerous, we create a fresh array view from the existing buffer
          const bytes = decoder.arr.subarray(decoder.pos, decoder.pos + nextLen);
          decoder.pos += nextLen;
          // Starting with ES5.1 we can supply a generic array-like object as arguments
          encodedString += String.fromCodePoint.apply(null, /** @type {any} */ (bytes));
          remainingLen -= nextLen;
        }
      }
      return decodeURIComponent(escape(encodedString))
    }
  };
  /* c8 ignore stop */

  /**
   * @function
   * @param {Decoder} decoder
   * @return {String} The read String
   */
  const _readVarStringNative = decoder =>
    /** @type any */ (utf8TextDecoder).decode(readVarUint8Array(decoder));

  /**
   * Read string of variable length
   * * varUint is used to store the length of the string
   *
   * @function
   * @param {Decoder} decoder
   * @return {String} The read String
   *
   */
  /* c8 ignore next */
  const readVarString = utf8TextDecoder ? _readVarStringNative : _readVarStringPolyfill;

  /**
   * Look ahead and read varString without incrementing position
   *
   * @function
   * @param {Decoder} decoder
   * @return {string}
   */
  const peekVarString = decoder => {
    const pos = decoder.pos;
    const s = readVarString(decoder);
    decoder.pos = pos;
    return s
  };

  /**
   * @param {Decoder} decoder
   * @param {number} len
   * @return {DataView}
   */
  const readFromDataView = (decoder, len) => {
    const dv = new DataView(decoder.arr.buffer, decoder.arr.byteOffset + decoder.pos, len);
    decoder.pos += len;
    return dv
  };

  /**
   * @param {Decoder} decoder
   */
  const readFloat32 = decoder => readFromDataView(decoder, 4).getFloat32(0, false);

  /**
   * @param {Decoder} decoder
   */
  const readFloat64 = decoder => readFromDataView(decoder, 8).getFloat64(0, false);

  /**
   * @param {Decoder} decoder
   */
  const readBigInt64 = decoder => /** @type {any} */ (readFromDataView(decoder, 8)).getBigInt64(0, false);

  /**
   * @param {Decoder} decoder
   */
  const readBigUint64 = decoder => /** @type {any} */ (readFromDataView(decoder, 8)).getBigUint64(0, false);

  /**
   * @type {Array<function(Decoder):any>}
   */
  const readAnyLookupTable = [
    decoder => undefined, // CASE 127: undefined
    decoder => null, // CASE 126: null
    readVarInt, // CASE 125: integer
    readFloat32, // CASE 124: float32
    readFloat64, // CASE 123: float64
    readBigInt64, // CASE 122: bigint
    decoder => false, // CASE 121: boolean (false)
    decoder => true, // CASE 120: boolean (true)
    readVarString, // CASE 119: string
    decoder => { // CASE 118: object<string,any>
      const len = readVarUint(decoder);
      /**
       * @type {Object<string,any>}
       */
      const obj = {};
      for (let i = 0; i < len; i++) {
        const key = readVarString(decoder);
        obj[key] = readAny(decoder);
      }
      return obj
    },
    decoder => { // CASE 117: array<any>
      const len = readVarUint(decoder);
      const arr = [];
      for (let i = 0; i < len; i++) {
        arr.push(readAny(decoder));
      }
      return arr
    },
    readVarUint8Array // CASE 116: Uint8Array
  ];

  /**
   * @param {Decoder} decoder
   */
  const readAny = decoder => readAnyLookupTable[127 - readUint8(decoder)](decoder);

  /**
   * T must not be null.
   *
   * @template T
   */
  class RleDecoder extends Decoder {
    /**
     * @param {Uint8Array} uint8Array
     * @param {function(Decoder):T} reader
     */
    constructor (uint8Array, reader) {
      super(uint8Array);
      /**
       * The reader
       */
      this.reader = reader;
      /**
       * Current state
       * @type {T|null}
       */
      this.s = null;
      this.count = 0;
    }

    read () {
      if (this.count === 0) {
        this.s = this.reader(this);
        if (hasContent(this)) {
          this.count = readVarUint(this) + 1; // see encoder implementation for the reason why this is incremented
        } else {
          this.count = -1; // read the current value forever
        }
      }
      this.count--;
      return /** @type {T} */ (this.s)
    }
  }

  class IntDiffDecoder extends Decoder {
    /**
     * @param {Uint8Array} uint8Array
     * @param {number} start
     */
    constructor (uint8Array, start) {
      super(uint8Array);
      /**
       * Current state
       * @type {number}
       */
      this.s = start;
    }

    /**
     * @return {number}
     */
    read () {
      this.s += readVarInt(this);
      return this.s
    }
  }

  class RleIntDiffDecoder extends Decoder {
    /**
     * @param {Uint8Array} uint8Array
     * @param {number} start
     */
    constructor (uint8Array, start) {
      super(uint8Array);
      /**
       * Current state
       * @type {number}
       */
      this.s = start;
      this.count = 0;
    }

    /**
     * @return {number}
     */
    read () {
      if (this.count === 0) {
        this.s += readVarInt(this);
        if (hasContent(this)) {
          this.count = readVarUint(this) + 1; // see encoder implementation for the reason why this is incremented
        } else {
          this.count = -1; // read the current value forever
        }
      }
      this.count--;
      return /** @type {number} */ (this.s)
    }
  }

  class UintOptRleDecoder extends Decoder {
    /**
     * @param {Uint8Array} uint8Array
     */
    constructor (uint8Array) {
      super(uint8Array);
      /**
       * @type {number}
       */
      this.s = 0;
      this.count = 0;
    }

    read () {
      if (this.count === 0) {
        this.s = readVarInt(this);
        // if the sign is negative, we read the count too, otherwise count is 1
        const isNegative = isNegativeZero(this.s);
        this.count = 1;
        if (isNegative) {
          this.s = -this.s;
          this.count = readVarUint(this) + 2;
        }
      }
      this.count--;
      return /** @type {number} */ (this.s)
    }
  }

  class IncUintOptRleDecoder extends Decoder {
    /**
     * @param {Uint8Array} uint8Array
     */
    constructor (uint8Array) {
      super(uint8Array);
      /**
       * @type {number}
       */
      this.s = 0;
      this.count = 0;
    }

    read () {
      if (this.count === 0) {
        this.s = readVarInt(this);
        // if the sign is negative, we read the count too, otherwise count is 1
        const isNegative = isNegativeZero(this.s);
        this.count = 1;
        if (isNegative) {
          this.s = -this.s;
          this.count = readVarUint(this) + 2;
        }
      }
      this.count--;
      return /** @type {number} */ (this.s++)
    }
  }

  class IntDiffOptRleDecoder extends Decoder {
    /**
     * @param {Uint8Array} uint8Array
     */
    constructor (uint8Array) {
      super(uint8Array);
      /**
       * @type {number}
       */
      this.s = 0;
      this.count = 0;
      this.diff = 0;
    }

    /**
     * @return {number}
     */
    read () {
      if (this.count === 0) {
        const diff = readVarInt(this);
        // if the first bit is set, we read more data
        const hasCount = diff & 1;
        this.diff = floor(diff / 2); // shift >> 1
        this.count = 1;
        if (hasCount) {
          this.count = readVarUint(this) + 2;
        }
      }
      this.s += this.diff;
      this.count--;
      return this.s
    }
  }

  class StringDecoder {
    /**
     * @param {Uint8Array} uint8Array
     */
    constructor (uint8Array) {
      this.decoder = new UintOptRleDecoder(uint8Array);
      this.str = readVarString(this.decoder);
      /**
       * @type {number}
       */
      this.spos = 0;
    }

    /**
     * @return {string}
     */
    read () {
      const end = this.spos + this.decoder.read();
      const res = this.str.slice(this.spos, end);
      this.spos = end;
      return res
    }
  }

  var decoding$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Decoder: Decoder,
    createDecoder: createDecoder,
    hasContent: hasContent,
    clone: clone,
    readUint8Array: readUint8Array,
    readVarUint8Array: readVarUint8Array,
    readTailAsUint8Array: readTailAsUint8Array,
    skip8: skip8,
    readUint8: readUint8,
    readUint16: readUint16,
    readUint32: readUint32,
    readUint32BigEndian: readUint32BigEndian,
    peekUint8: peekUint8,
    peekUint16: peekUint16,
    peekUint32: peekUint32,
    readVarUint: readVarUint,
    readVarInt: readVarInt,
    peekVarUint: peekVarUint,
    peekVarInt: peekVarInt,
    _readVarStringPolyfill: _readVarStringPolyfill,
    _readVarStringNative: _readVarStringNative,
    readVarString: readVarString,
    peekVarString: peekVarString,
    readFromDataView: readFromDataView,
    readFloat32: readFloat32,
    readFloat64: readFloat64,
    readBigInt64: readBigInt64,
    readBigUint64: readBigUint64,
    readAny: readAny,
    RleDecoder: RleDecoder,
    IntDiffDecoder: IntDiffDecoder,
    RleIntDiffDecoder: RleIntDiffDecoder,
    UintOptRleDecoder: UintOptRleDecoder,
    IncUintOptRleDecoder: IncUintOptRleDecoder,
    IntDiffOptRleDecoder: IntDiffOptRleDecoder,
    StringDecoder: StringDecoder
  });

  /**
   * Utility functions to work with buffers (Uint8Array).
   *
   * @module buffer
   */

  /**
   * @param {number} len
   */
  const createUint8ArrayFromLen = len => new Uint8Array(len);

  /**
   * Create Uint8Array with initial content from buffer
   *
   * @param {ArrayBuffer} buffer
   * @param {number} byteOffset
   * @param {number} length
   */
  const createUint8ArrayViewFromArrayBuffer = (buffer, byteOffset, length) => new Uint8Array(buffer, byteOffset, length);

  /**
   * Create Uint8Array with initial content from buffer
   *
   * @param {ArrayBuffer} buffer
   */
  const createUint8ArrayFromArrayBuffer = buffer => new Uint8Array(buffer);

  /* c8 ignore start */
  /**
   * @param {Uint8Array} bytes
   * @return {string}
   */
  const toBase64Browser = bytes => {
    let s = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      s += fromCharCode(bytes[i]);
    }
    // eslint-disable-next-line no-undef
    return btoa(s)
  };
  /* c8 ignore stop */

  /**
   * @param {Uint8Array} bytes
   * @return {string}
   */
  const toBase64Node = bytes => Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('base64');

  /* c8 ignore start */
  /**
   * @param {string} s
   * @return {Uint8Array}
   */
  const fromBase64Browser = s => {
    // eslint-disable-next-line no-undef
    const a = atob(s);
    const bytes = createUint8ArrayFromLen(a.length);
    for (let i = 0; i < a.length; i++) {
      bytes[i] = a.charCodeAt(i);
    }
    return bytes
  };
  /* c8 ignore stop */

  /**
   * @param {string} s
   */
  const fromBase64Node = s => {
    const buf = Buffer.from(s, 'base64');
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
  };

  /* c8 ignore next */
  const toBase64 = isBrowser ? toBase64Browser : toBase64Node;

  /* c8 ignore next */
  const fromBase64 = isBrowser ? fromBase64Browser : fromBase64Node;

  /**
   * Copy the content of an Uint8Array view to a new ArrayBuffer.
   *
   * @param {Uint8Array} uint8Array
   * @return {Uint8Array}
   */
  const copyUint8Array = uint8Array => {
    const newBuf = createUint8ArrayFromLen(uint8Array.byteLength);
    newBuf.set(uint8Array);
    return newBuf
  };

  /**
   * Encode anything as a UInt8Array. It's a pun on typescripts's `any` type.
   * See encoding.writeAny for more information.
   *
   * @param {any} data
   * @return {Uint8Array}
   */
  const encodeAny = data => {
    const encoder = createEncoder();
    writeAny(encoder, data);
    return toUint8Array(encoder)
  };

  /**
   * Decode an any-encoded value.
   *
   * @param {Uint8Array} buf
   * @return {any}
   */
  const decodeAny = buf => readAny(createDecoder(buf));

  var buffer$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createUint8ArrayFromLen: createUint8ArrayFromLen,
    createUint8ArrayViewFromArrayBuffer: createUint8ArrayViewFromArrayBuffer,
    createUint8ArrayFromArrayBuffer: createUint8ArrayFromArrayBuffer,
    toBase64: toBase64,
    fromBase64: fromBase64,
    copyUint8Array: copyUint8Array,
    encodeAny: encodeAny,
    decodeAny: decodeAny
  });

  /**
   * Fast Pseudo Random Number Generators.
   *
   * Given a seed a PRNG generates a sequence of numbers that cannot be reasonably predicted.
   * Two PRNGs must generate the same random sequence of numbers if  given the same seed.
   *
   * @module prng
   */

  /**
   * Description of the function
   *  @callback generatorNext
   *  @return {number} A random float in the cange of [0,1)
   */

  /**
   * A random type generator.
   *
   * @typedef {Object} PRNG
   * @property {generatorNext} next Generate new number
   */
  const DefaultPRNG = Xoroshiro128plus;

  /**
   * Create a Xoroshiro128plus Pseudo-Random-Number-Generator.
   * This is the fastest full-period generator passing BigCrush without systematic failures.
   * But there are more PRNGs available in ./PRNG/.
   *
   * @param {number} seed A positive 32bit integer. Do not use negative numbers.
   * @return {PRNG}
   */
  const create$1 = seed => new DefaultPRNG(seed);
  /* c8 ignore stop */

  /**
   * Utility helpers for generating statistics.
   *
   * @module statistics
   */

  /**
   * @param {Array<number>} arr Array of values
   * @return {number} Returns null if the array is empty
   */
  const median = arr => arr.length === 0 ? NaN : (arr.length % 2 === 1 ? arr[(arr.length - 1) / 2] : (arr[floor((arr.length - 1) / 2)] + arr[ceil((arr.length - 1) / 2)]) / 2);

  /**
   * @param {Array<number>} arr
   * @return {number}
   */
  const average = arr => arr.reduce(add, 0) / arr.length;

  /**
   * Utility helpers to work with promises.
   *
   * @module promise
   */

  /**
   * @template T
   * @callback PromiseResolve
   * @param {T|PromiseLike<T>} [result]
   */

  /**
   * @template T
   * @param {function(PromiseResolve<T>,function(Error):void):any} f
   * @return {Promise<T>}
   */
  const create = f => /** @type {Promise<T>} */ (new Promise(f));

  /**
   * @param {function(function():void,function(Error):void):void} f
   * @return {Promise<void>}
   */
  const createEmpty = f => new Promise(f);

  /**
   * `Promise.all` wait for all promises in the array to resolve and return the result
   * @template T
   * @param {Array<Promise<T>>} arrp
   * @return {Promise<Array<T>>}
   */
  const all = arrp => Promise.all(arrp);

  /**
   * @param {Error} [reason]
   * @return {Promise<never>}
   */
  const reject = reason => Promise.reject(reason);

  /**
   * @template T
   * @param {T|void} res
   * @return {Promise<T|void>}
   */
  const resolve = res => Promise.resolve(res);

  /**
   * @template T
   * @param {T} res
   * @return {Promise<T>}
   */
  const resolveWith = res => Promise.resolve(res);

  /**
   * @todo Next version, reorder parameters: check, [timeout, [intervalResolution]]
   *
   * @param {number} timeout
   * @param {function():boolean} check
   * @param {number} [intervalResolution]
   * @return {Promise<void>}
   */
  const until = (timeout, check, intervalResolution = 10) => create((resolve, reject) => {
    const startTime = getUnixTime();
    const hasTimeout = timeout > 0;
    const untilInterval = () => {
      if (check()) {
        clearInterval(intervalHandle);
        resolve();
      } else if (hasTimeout) {
        /* c8 ignore else */
        if (getUnixTime() - startTime > timeout) {
          clearInterval(intervalHandle);
          reject(new Error('Timeout'));
        }
      }
    };
    const intervalHandle = setInterval(untilInterval, intervalResolution);
  });

  /**
   * @param {number} timeout
   * @return {Promise<undefined>}
   */
  const wait = timeout => create((resolve, reject) => setTimeout(resolve, timeout));

  /**
   * Checks if an object is a promise using ducktyping.
   *
   * Promises are often polyfilled, so it makes sense to add some additional guarantees if the user of this
   * library has some insane environment where global Promise objects are overwritten.
   *
   * @param {any} p
   * @return {boolean}
   */
  const isPromise = p => p instanceof Promise || (p && p.then && p.catch && p.finally);

  var promise$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    create: create,
    createEmpty: createEmpty,
    all: all,
    reject: reject,
    resolve: resolve,
    resolveWith: resolveWith,
    until: until,
    wait: wait,
    isPromise: isPromise
  });

  /**
   * Testing framework with support for generating tests.
   *
   * ```js
   * // test.js template for creating a test executable
   * import { runTests } from 'lib0/testing'
   * import * as log from 'lib0/logging'
   * import * as mod1 from './mod1.test.js'
   * import * as mod2 from './mod2.test.js'

   * import { isBrowser, isNode } from 'lib0/environment.js'
   *
   * if (isBrowser) {
   *   // optional: if this is ran in the browser, attach a virtual console to the dom
   *   log.createVConsole(document.body)
   * }
   *
   * runTests({
   *  mod1,
   *  mod2,
   * }).then(success => {
   *   if (isNode) {
   *     process.exit(success ? 0 : 1)
   *   }
   * })
   * ```
   *
   * ```js
   * // mod1.test.js
   * /**
   *  * runTests automatically tests all exported functions that start with "test".
   *  * The name of the function should be in camelCase and is used for the logging output.
   *  *
   *  * @param {t.TestCase} tc
   *  *\/
   * export const testMyFirstTest = tc => {
   *   t.compare({ a: 4 }, { a: 4 }, 'objects are equal')
   * }
   * ```
   *
   * Now you can simply run `node test.js` to run your test or run test.js in the browser.
   *
   * @module testing
   */

  hasConf('extensive');

  /* c8 ignore next */
  const envSeed = hasParam('--seed') ? Number.parseInt(getParam('--seed', '0')) : null;

  class TestCase {
    /**
     * @param {string} moduleName
     * @param {string} testName
     */
    constructor (moduleName, testName) {
      /**
       * @type {string}
       */
      this.moduleName = moduleName;
      /**
       * @type {string}
       */
      this.testName = testName;
      this._seed = null;
      this._prng = null;
    }

    resetSeed () {
      this._seed = null;
      this._prng = null;
    }

    /**
     * @type {number}
     */
    /* c8 ignore next */
    get seed () {
      /* c8 ignore else */
      if (this._seed === null) {
        /* c8 ignore next */
        this._seed = envSeed === null ? uint32() : envSeed;
      }
      return this._seed
    }

    /**
     * A PRNG for this test case. Use only this PRNG for randomness to make the test case reproducible.
     *
     * @type {prng.PRNG}
     */
    get prng () {
      /* c8 ignore else */
      if (this._prng === null) {
        this._prng = create$1(this.seed);
      }
      return this._prng
    }
  }

  const repetitionTime = Number(getParam('--repetition-time', '50'));
  /* c8 ignore next */
  const testFilter = hasParam('--filter') ? getParam('--filter', '') : null;

  /* c8 ignore next */
  const testFilterRegExp = testFilter !== null ? new RegExp(testFilter) : new RegExp('.*');

  const repeatTestRegex = /^(repeat|repeating)\s/;

  /**
   * @param {string} moduleName
   * @param {string} name
   * @param {function(TestCase):void|Promise<any>} f
   * @param {number} i
   * @param {number} numberOfTests
   */
  const run = async (moduleName, name, f, i, numberOfTests) => {
    const uncamelized = fromCamelCase(name.slice(4), ' ');
    const filtered = !testFilterRegExp.test(`[${i + 1}/${numberOfTests}] ${moduleName}: ${uncamelized}`);
    /* c8 ignore next 3 */
    if (filtered) {
      return true
    }
    const tc = new TestCase(moduleName, name);
    const repeat = repeatTestRegex.test(uncamelized);
    const groupArgs = [GREY, `[${i + 1}/${numberOfTests}] `, PURPLE, `${moduleName}: `, BLUE, uncamelized];
    /* c8 ignore next 5 */
    if (testFilter === null) {
      groupCollapsed(...groupArgs);
    } else {
      group(...groupArgs);
    }
    const times = [];
    const start = performance.now();
    let lastTime = start;
    /**
     * @type {any}
     */
    let err = null;
    performance.mark(`${name}-start`);
    do {
      try {
        const p = f(tc);
        if (isPromise(p)) {
          await p;
        }
      } catch (_err) {
        err = _err;
      }
      const currTime = performance.now();
      times.push(currTime - lastTime);
      lastTime = currTime;
      if (repeat && err === null && (lastTime - start) < repetitionTime) {
        tc.resetSeed();
      } else {
        break
      }
    } while (err === null && (lastTime - start) < repetitionTime)
    performance.mark(`${name}-end`);
    /* c8 ignore next 3 */
    if (err !== null && err.constructor !== SkipError) {
      printError(err);
    }
    performance.measure(name, `${name}-start`, `${name}-end`);
    groupEnd();
    const duration = lastTime - start;
    let success = true;
    times.sort((a, b) => a - b);
    /* c8 ignore next 3 */
    const againMessage = isBrowser
      ? `     - ${window.location.host + window.location.pathname}?filter=\\[${i + 1}/${tc._seed === null ? '' : `&seed=${tc._seed}`}`
      : `\nrepeat: npm run test -- --filter "\\[${i + 1}/" ${tc._seed === null ? '' : `--seed ${tc._seed}`}`;
    const timeInfo = (repeat && err === null)
      ? ` - ${times.length} repetitions in ${humanizeDuration(duration)} (best: ${humanizeDuration(times[0])}, worst: ${humanizeDuration(last(times))}, median: ${humanizeDuration(median(times))}, average: ${humanizeDuration(average(times))})`
      : ` in ${humanizeDuration(duration)}`;
    if (err !== null) {
      /* c8 ignore start */
      if (err.constructor === SkipError) {
        print(GREY, BOLD, 'Skipped: ', UNBOLD, uncamelized);
      } else {
        success = false;
        print(RED, BOLD, 'Failure: ', UNBOLD, UNCOLOR, uncamelized, GREY, timeInfo, againMessage);
      }
      /* c8 ignore stop */
    } else {
      print(GREEN, BOLD, 'Success: ', UNBOLD, UNCOLOR, uncamelized, GREY, timeInfo, againMessage);
    }
    return success
  };

  /**
   * @param {any} _constructor
   * @param {any} a
   * @param {any} b
   * @param {string} path
   * @throws {TestError}
   */
  const compareValues = (_constructor, a, b, path) => {
    if (a !== b) {
      fail(`Values ${stringify(a)} and ${stringify(b)} don't match (${path})`);
    }
    return true
  };

  /**
   * @param {string?} message
   * @param {string} reason
   * @param {string} path
   * @throws {TestError}
   */
  const _failMessage = (message, reason, path) => fail(
    message === null
      ? `${reason} ${path}`
      : `${message} (${reason}) ${path}`
  );

  /**
   * @param {any} a
   * @param {any} b
   * @param {string} path
   * @param {string?} message
   * @param {function(any,any,any,string,any):boolean} customCompare
   */
  const _compare = (a, b, path, message, customCompare) => {
    // we don't use assert here because we want to test all branches (istanbul errors if one branch is not tested)
    if (a == null || b == null) {
      return compareValues(null, a, b, path)
    }
    if (a.constructor !== b.constructor) {
      _failMessage(message, 'Constructors don\'t match', path);
    }
    let success = true;
    switch (a.constructor) {
      case ArrayBuffer:
        a = new Uint8Array(a);
        b = new Uint8Array(b);
      // eslint-disable-next-line no-fallthrough
      case Uint8Array: {
        if (a.byteLength !== b.byteLength) {
          _failMessage(message, 'ArrayBuffer lengths match', path);
        }
        for (let i = 0; success && i < a.length; i++) {
          success = success && a[i] === b[i];
        }
        break
      }
      case Set: {
        if (a.size !== b.size) {
          _failMessage(message, 'Sets have different number of attributes', path);
        }
        // @ts-ignore
        a.forEach(value => {
          if (!b.has(value)) {
            _failMessage(message, `b.${path} does have ${value}`, path);
          }
        });
        break
      }
      case Map: {
        if (a.size !== b.size) {
          _failMessage(message, 'Maps have different number of attributes', path);
        }
        // @ts-ignore
        a.forEach((value, key) => {
          if (!b.has(key)) {
            _failMessage(message, `Property ${path}["${key}"] does not exist on second argument`, path);
          }
          _compare(value, b.get(key), `${path}["${key}"]`, message, customCompare);
        });
        break
      }
      case Object:
        if (length$1(a) !== length$1(b)) {
          _failMessage(message, 'Objects have a different number of attributes', path);
        }
        forEach$1(a, (value, key) => {
          if (!hasProperty(b, key)) {
            _failMessage(message, `Property ${path} does not exist on second argument`, path);
          }
          _compare(value, b[key], `${path}["${key}"]`, message, customCompare);
        });
        break
      case Array:
        if (a.length !== b.length) {
          _failMessage(message, 'Arrays have a different number of attributes', path);
        }
        // @ts-ignore
        a.forEach((value, i) => _compare(value, b[i], `${path}[${i}]`, message, customCompare));
        break
      /* c8 ignore next 4 */
      default:
        if (!customCompare(a.constructor, a, b, path, compareValues)) {
          _failMessage(message, `Values ${stringify(a)} and ${stringify(b)} don't match`, path);
        }
    }
    assert(success, message);
    return true
  };

  /**
   * @template T
   * @param {T} a
   * @param {T} b
   * @param {string?} [message]
   * @param {function(any,T,T,string,any):boolean} [customCompare]
   */
  const compare = (a, b, message = null, customCompare = compareValues) => _compare(a, b, 'obj', message, customCompare);

  /**
   * @template T
   * @param {T} property
   * @param {string?} [message]
   * @return {asserts property is NonNullable<T>}
   * @throws {TestError}
   */
  /* c8 ignore next */
  const assert = (property, message = null) => { property || fail(`Assertion failed${message !== null ? `: ${message}` : ''}`); };

  /**
   * @param {Object<string, Object<string, function(TestCase):void|Promise<any>>>} tests
   */
  const runTests = async tests => {
    /**
     * @param {string} testname
     */
    const filterTest = testname => testname.startsWith('test') || testname.startsWith('benchmark');
    const numberOfTests = map$1(tests, mod => map$1(mod, (f, fname) => /* c8 ignore next */ f && filterTest(fname) ? 1 : 0).reduce(add, 0)).reduce(add, 0);
    let successfulTests = 0;
    let testnumber = 0;
    const start = performance.now();
    for (const modName in tests) {
      const mod = tests[modName];
      for (const fname in mod) {
        const f = mod[fname];
        /* c8 ignore else */
        if (f && filterTest(fname)) {
          const repeatEachTest = 1;
          let success = true;
          for (let i = 0; success && i < repeatEachTest; i++) {
            success = await run(modName, fname, f, testnumber, numberOfTests);
          }
          testnumber++;
          /* c8 ignore else */
          if (success) {
            successfulTests++;
          }
        }
      }
    }
    const end = performance.now();
    print('');
    const success = successfulTests === numberOfTests;
    /* c8 ignore start */
    if (success) {
      print(GREEN, BOLD, 'All tests successful!', GREY, UNBOLD, ` in ${humanizeDuration(end - start)}`);
      printImgBase64(nyanCatImage, 50);
    } else {
      const failedTests = numberOfTests - successfulTests;
      print(RED, BOLD, `> ${failedTests} test${failedTests > 1 ? 's' : ''} failed`);
    }
    /* c8 ignore stop */
    return success
  };

  class TestError extends Error {}

  /**
   * @param {string} reason
   * @throws {TestError}
   */
  const fail = reason => {
    print(RED, BOLD, 'X ', UNBOLD, reason);
    throw new TestError('Test Failed')
  };

  class SkipError extends Error {}

  // eslint-disable-next-line
  const nyanCatImage = 'R0lGODlhjABMAPcAAMiSE0xMTEzMzUKJzjQ0NFsoKPc7//FM/9mH/z9x0HIiIoKCgmBHN+frGSkZLdDQ0LCwsDk71g0KCUzDdrQQEOFz/8yYdelmBdTiHFxcXDU2erR/mLrTHCgoKK5szBQUFNgSCTk6ymfpCB9VZS2Bl+cGBt2N8kWm0uDcGXhZRUvGq94NCFPhDiwsLGVlZTgqIPMDA1g3aEzS5D6xAURERDtG9JmBjJsZGWs2AD1W6Hp6eswyDeJ4CFNTU1LcEoJRmTMzSd14CTg5ser2GmDzBd17/xkZGUzMvoSMDiEhIfKruCwNAJaWlvRzA8kNDXDrCfi0pe1U/+GS6SZrAB4eHpZwVhoabsx9oiYmJt/TGHFxcYyMjOid0+Zl/0rF6j09PeRr/0zU9DxO6j+z0lXtBtp8qJhMAEssLGhoaPL/GVn/AAsWJ/9/AE3Z/zs9/3cAAOlf/+aa2RIyADo85uhh/0i84WtrazQ0UyMlmDMzPwUFBe16BTMmHau0E03X+g8pMEAoS1MBAf++kkzO8pBaqSZoe9uB/zE0BUQ3Sv///4WFheuiyzo880gzNDIyNissBNqF/8RiAOF2qG5ubj0vL1z6Avl5ASsgGkgUSy8vL/8n/z4zJy8lOv96uEssV1csAN5ZCDQ0Wz1a3tbEGHLeDdYKCg4PATE7PiMVFSoqU83eHEi43gUPAOZ8reGogeKU5dBBC8faHEez2lHYF4bQFMukFtl4CzY3kkzBVJfMGZkAAMfSFf27mP0t//g4/9R6Dfsy/1DRIUnSAPRD/0fMAFQ0Q+l7rnbaD0vEntCDD6rSGtO8GNpUCU/MK07LPNEfC7RaABUWWkgtOst+71v9AfD7GfDw8P19ATtA/NJpAONgB9yL+fm6jzIxMdnNGJxht1/2A9x//9jHGOSX3+5tBP27l35+fk5OTvZ9AhYgTjo0PUhGSDs9+LZjCFf2Aw0IDwcVAA8PD5lwg9+Q7YaChC0kJP8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpGNEM2MUEyMzE0QTRFMTExOUQzRkE3QTBCRDNBMjdBQyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpERjQ0NEY0QkI2MTcxMUUxOUJEQkUzNUNGQTkwRTU2MiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpERjQ0NEY0QUI2MTcxMUUxOUJEQkUzNUNGQTkwRTU2MiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1IFdpbmRvd3MiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1OEE3RTIwRjcyQTlFMTExOTQ1QkY2QTU5QzVCQjJBOSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpGNEM2MUEyMzE0QTRFMTExOUQzRkE3QTBCRDNBMjdBQyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PgH//v38+/r5+Pf29fTz8vHw7+7t7Ovq6ejn5uXk4+Lh4N/e3dzb2tnY19bV1NPS0dDPzs3My8rJyMfGxcTDwsHAv769vLu6ubi3trW0s7KxsK+urayrqqmop6alpKOioaCfnp2cm5qZmJeWlZSTkpGQj46NjIuKiYiHhoWEg4KBgH9+fXx7enl4d3Z1dHNycXBvbm1sa2ppaGdmZWRjYmFgX15dXFtaWVhXVlVUU1JRUE9OTUxLSklIR0ZFRENCQUA/Pj08Ozo5ODc2NTQzMjEwLy4tLCsqKSgnJiUkIyIhIB8eHRwbGhkYFxYVFBMSERAPDg0MCwoJCAcGBQQDAgEAACH5BAkKABEAIf4jUmVzaXplZCBvbiBodHRwczovL2V6Z2lmLmNvbS9yZXNpemUALAAAAACMAEwAAAj/ACMIHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXLkxEcuXMAm6jElTZaKZNXOOvOnyps6fInECHdpRKNGjSJMqXZrSKNOnC51CnUq1qtWrWLNC9GmQq9avYMOKHUs2aFmmUs8SlcC2rdu3cNWeTEG3rt27eBnIHflBj6C/gAMLHpxCz16QElJw+7tom+PHkCOP+8utiuHDHRP/5WICgefPkIYV8RAjxudtkwVZjqCnNeaMmheZqADm8+coHn5kyPBt2udFvKrc+7A7gITXFzV77hLF9ucYGRaYo+FhWhHPUKokobFgQYbjyCsq/3fuHHr3BV88HMBeZd357+HFpxBEvnz0961b3+8OP37DtgON5xxznpl3ng5aJKiFDud5B55/Ct3TQwY93COQgLZV0AUC39ihRYMggjhJDw9CeNA9kyygxT2G6TGfcxUY8pkeH3YHgTkMNrgFBJOYs8Akl5l4Yoor3mPki6BpUsGMNS6QiA772WjNPR8CSRAjWBI0B5ZYikGQGFwyMseVYWoZppcDhSkmmVyaySWaAqk5pkBbljnQlnNYEZ05fGaAJGieVQAMjd2ZY+R+X2Rgh5FVBhmBG5BGKumklFZq6aWYZqrpppTOIQQNNPjoJ31RbGibIRXQuIExrSSY4wI66P9gToJlGHOFo374MQg2vGLjRa65etErNoMA68ew2Bi7a6+/Aitsr8UCi6yywzYb7LDR5jotsMvyau0qJJCwGw0vdrEkeTRe0UknC7hQYwYMQrmAMZ2U4WgY+Lahbxt+4Ovvvm34i68fAAscBsD9+kvwvgYDHLDACAu8sL4NFwzxvgkP3EYhhYzw52dFhOPZD5Ns0Iok6PUwyaIuTJLBBwuUIckG8RCkhhrUHKHzEUTcfLM7Ox/hjs9qBH0E0ZUE3bPPQO9cCdFGIx300EwH/bTPUfuc9M5U30zEzhN87NkwcDyXgY/oxaP22vFQIR2JBT3xBDhEUyO33FffXMndT1D/QzTfdPts9915qwEO3377DHjdfBd++N2J47y44Ij7PMN85UgBxzCeQQKJbd9wFyKI6jgqUBqoD6G66qinvvoQ1bSexutDyF4N7bLTHnvruLd+++u5v76766vb3jvxM0wxnyBQxHEued8Y8cX01Fc/fQcHZaG97A1or30DsqPgfRbDpzF+FtyPD37r4ns/fDXnp+/9+qif//74KMj/fRp9TEIDAxb4ixIWQcACFrAMFkigAhPIAAmwyHQDYYMEJ0jBClrwghjMoAY3yMEOYhAdQaCBFtBAAD244oQoTKEKV5iCbizEHjCkoCVgCENLULAJNLTHNSZ4jRzaQ4Y5tOEE+X24Qwn2MIdApKEQJUhEHvowiTBkhh7QVqT8GOmKWHwgFiWghR5AkCA+DKMYx0jGMprxjGhMYw5XMEXvGAZF5piEhQyih1CZ4wt6kIARfORFhjwDBoCEQQkIUoJAwmAFBDEkDAhSCkMOciCFDCQiB6JIgoDAkYQ0JAgSaUhLYnIgFLjH9AggkHsQYHo1oyMVptcCgUjvCx34opAWkp/L1BIhtxxILmfJy17KxJcrSQswhykWYRLzI8Y8pjKXycxfNvOZMEkmNC0izWlSpJrWlAg2s8kQnkRgJt7kpja92ZNwivOcNdkmOqOyzoyos50IeSc850nPegIzIAAh+QQJCgARACwAAAAAjABMAAAI/wAjCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJcmKikihTZkx0UqXLlw5ZwpxJ02DLmjhz6twJkqVMnz55Ch1KtGhCmUaTYkSqtKnJm05rMl0aVefUqlhtFryatavXr2DDHoRKkKzYs2jTqpW61exani3jun0rlCvdrhLy6t3Lt+9dlykCCx5MuDCDvyU/6BHEuLHjx5BT6EEsUkIKbowXbdvMubPncYy5VZlM+aNlxlxMIFjNGtKwIggqDGO9DbSg0aVNpxC0yEQFMKxZRwmHoEiU4AgW8cKdu+Pp1V2OI6c9bdq2cLARQGEeIV7zjM+nT//3oEfPNDiztTOXoMf7d4vhxbP+ts6cORrfIK3efq+8FnN2kPbeRPEFF918NCywgBZafLNfFffEM4k5C0wi4IARFchaBV0gqGCFDX6zQQqZZPChhRgSuBtyFRiC3DcJfqgFDTTSYOKJF6boUIGQaFLBizF+KOSQKA7EyJEEzXHkkWIQJMaSjMxBEJSMJAllk0ZCKWWWS1q5JJYCUbllBEpC6SWTEehxzz0rBqdfbL1AEsONQ9b5oQ73DOTGnnz26eefgAYq6KCEFmoooCHccosdk5yzYhQdBmfIj3N++AAEdCqoiDU62LGAOXkK5Icfg2BjKjZejDqqF6diM4iqfrT/ig2spZ6aqqqsnvqqqrLS2uqtq7a666i9qlqrqbeeQEIGN2awYhc/ilepghAssM6JaCwAQQ8ufBpqBGGE28a4bfgR7rnktnFuuH6ku24Y6Zp7brvkvpuuuuvGuy6949rrbr7kmltHIS6Yw6AWjgoyXRHErTYnPRtskMEXdLrQgzlffKHDBjZ8q4Ya1Bwh8hFEfPyxOyMf4Y7JaqR8BMuVpFyyySiPXAnLLsOc8so0p3yzyTmbHPPIK8sxyYJr9tdmcMPAwdqcG3TSyQZ2fniF1N8+8QQ4LFOjtdY/f1zJ109QwzLZXJvs9ddhqwEO2WabjHbXZLf99tdxgzy32k8Y/70gK+5UMsNu5UiB3mqQvIkA1FJLfO0CFH8ajxZXd/JtGpgPobnmmGe++RDVdJ7G50OIXg3popMeeueod37656l/vrrnm5uOOgZIfJECBpr3sZsgUMQRLXLTEJJBxPRkkETGRmSS8T1a2CCPZANlYb3oDVhvfQOio6B9FrOn8X0W2H/Pfefeaz97NeOXr/35mI+//vcouJ9MO7V03gcDFjCmxCIADGAAr1CFG2mBWQhEoA600IMLseGBEIygBCdIwQpa8IIYzKAGMcgDaGTMFSAMoQhDaAE9HOyEKOyBewZijxZG0BItbKElItiEGNrjGhC8hg3t8UIbzhCCO8ThA+Z1aMMexvCHDwxiDndoRBk+8A03Slp/1CTFKpaHiv3JS9IMssMuevGLYAyjGMdIxjJ6EYoK0oNivmCfL+RIINAD0GT0YCI8rdAgz4CBHmFQAoKUYI8wWAFBAAkDgpQCkH0cyB/3KMiBEJIgIECkHwEJgkECEpKSVKQe39CCjH0gTUbIWAsQcg8CZMw78TDlF76lowxdUSBXfONArrhC9pSnlbjMpS7rssuZzKWXPQHKL4HZEWESMyXDPKZHkqnMZjrzLnZ5pjSnSc1qWmQuzLSmQrCpzW5685vfjCY4x0nOcprznB4JCAAh+QQJCgBIACwAAAAAjABMAAAI/wCRCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJcmGiRCVTqsyIcqXLlzBjypxJs6bNmzgPtjR4MqfPn0CDCh1KtKjNnkaTPtyptKlToEyfShUYderTqlaNnkSJNGvTrl6dYg1bdCzZs2jTqvUpoa3bt3DjrnWZoq7du3jzMphb8oMeQYADCx5MOIUeviIlpOAGeNG2x5AjSx4HmFuVw4g/KgbMxQSCz6AhDSuCoMIw0NsoC7qcWXMKQYtMVAADGnSUcAiKRKmNYBEv1q07bv7cZTfvz9OSfw5HGgEU1vHiBdc4/Djvb3refY5y2jlrPeCnY/+sbv1zjAzmzFGZBgnS5+f3PqTvIUG8RfK1i5vPsGDBpB8egPbcF5P0l0F99jV0z4ILCoQfaBV0sV9/C7jwwzcYblAFGhQemGBDX9BAAwH3HKbHa7xVYEht51FYoYgictghgh8iZMQ95vSnBYP3oBiaJhWwyJ+LRLrooUGlwKCkkgSVsCQMKxD0JAwEgfBkCU0+GeVAUxK0wpVZLrmlQF0O9OWSTpRY4ALp0dCjILy5Vxow72hR5J0U2oGZQPb06eefgAYq6KCEFmrooYj6CQMIICgAIw0unINiFBLWZkgFetjZnzU62EEkEw/QoIN/eyLh5zWoXmPJn5akek0TrLr/Cqirq/rZaqqw2ppqrX02QWusuAKr6p++7trnDtAka8o5NKDYRZDHZUohBBkMWaEWTEBwj52TlMrGt+CGK+645JZr7rnopquuuejU9YmPtRWBGwKZ2rCBDV98IeMCPaChRb7ybCBPqVkUnMbBaTRQcMENIJwGCgtnUY3DEWfhsMILN4wwxAtPfHA1EaNwccQaH8xxwR6nAfLCIiOMMcMI9wEvaMPA8VmmV3TSCZ4UGtNJGaV+PMTQQztMNNFGH+1wNUcPkbTSCDe9tNRRH51yGlQLDfXBR8ssSDlSwNFdezdrkfPOX7jAZjzcUrGAz0ATBA44lahhtxrUzD133XdX/6I3ONTcrcbf4Aiet96B9/134nb/zbfdh8/NuBp+I3535HQbvrjdM0zxmiBQxAFtbR74u8EGC3yRSb73qPMFAR8sYIM8KdCIBORH5H4EGYITofsR7gj++xGCV/I773f7rnvwdw9f/O9E9P7742o4f7c70AtOxhEzuEADAxYApsQi5JdPvgUb9udCteyzX2EAtiMRxvxt1N+GH/PP74f9beRPP//+CwP/8Je//dkvgPzrn/8G6D8D1g+BAFyg/QiYv1XQQAtoIIAeXMHBDnqQg1VQhxZGSMISjlCDBvGDHwaBjRZiwwsqVKEXXIiNQcTQDzWg4Q1Z6EIYxnCGLrRhDP9z6MId0tCHMqShEFVIxBYasYc3PIEecrSAHZUIPDzK4hV5pAcJ6IFBCHGDGMdIxjKa8YxoTKMa18jGNqJxDlNcQAYOc49JmGMS9ziIHr6Qni+Axwg56kGpDMKIQhIkAoUs5BwIIoZEMiICBHGkGAgyB0cuciCNTGRBJElJSzLSkZtM5CQHUslECuEe+SKAQO5BgHxJxyB6oEK+WiAQI+SrA4Os0UPAEx4k8DKXAvklQXQwR2DqMiVgOeZLkqnMlTCzmdCcy1aQwJVpRjMk06zmM6/pEbNwEyTb/OZHwinOjpCznNREJzaj4k11TiSZ7XSnPHESz3lW5JnntKc+94kTFnjyUyP1/OdSBErQghr0oB0JCAAh+QQFCgAjACwAAAAAjABMAAAI/wBHCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJkmCikihTWjw5giVLlTBjHkz0UmBNmThz6tzJs6fPkTRn3vxJtKjRo0iTbgxqUqlTiC5tPt05dOXUnkyval2YdatXg12/ih07lmZQs2bJql27NSzbqW7fOo0rN2nViBLy6t3Lt29dmfGqCB5MuLBhBvH+pmSQQpAgKJAjS54M2XEVBopLSmjseBGCz6BDi37lWFAVPZlHbnb8SvRnSL0qIKjQK/Q2y6hTh1z9ahuYKK4rGEJgSHboV1BO697d+HOFLq4/e/j2zTmYz8lR37u3vOPq6KGnEf/68mXaNjrAEWT/QL5b943fwX+OkWGBOT3TQie/92HBggwSvCeRHgQSKFB8osExzHz12UdDddhVQYM5/gEoYET3ZDBJBveghmBoRRhHn38LaKHFDyimYIcWJFp44UP39KCFDhno0WFzocERTmgjkrhhBkCy2GKALzq03Tk6LEADFffg+NowshU3jR1okGjllf658EWRMN7zhX80NCkIeLTpISSWaC4wSW4ElQLDm28SVAKcMKxAEJ0wEAQCnSXISaedA+FJ0Ap8+gknoAIJOhChcPYpUCAdUphBc8PAEZ2ZJCZC45UQWIPpmgTZI+qopJZq6qmopqrqqqy2eioMTtz/QwMNmTRXQRGXnqnIFw0u0EOVC9zDIqgDjXrNsddYQqolyF7TxLLNltqssqMyi+yz1SJLrahNTAvttd8mS2q32pJ6ATTQfCKma10YZ+YGV1wRJIkuzAgkvPKwOQIb/Pbr778AByzwwAQXbPDBBZvxSWNSbBMOrghEAR0CZl7RSSclJlkiheawaEwnZeibxchplJxGAyOP3IDJaaCQchbVsPxyFiyjnPLKJruccswlV/MyCjW/jHPJOo/Mcxo+pwy0yTarbHIfnL2ioGvvaGExxrzaJ+wCdvT3ccgE9TzE2GOzTDbZZp/NcjVnD5G22ia3vbbccZ99dBp0iw13yWdD/10aF5BERx899CzwhQTxxHMP4hL0R08GlxQEDjiVqGG5GtRMPnnll1eiOTjUXK7G5+CInrnmoXf+eeqWf8655adPzroanqN+eeyUm7665TNMsQlnUCgh/PDCu1JFD/6ZqPzyvhJgEOxHRH8EGaITIf0R7oh+/RGiV3I99ZdbL332l2/f/fVEVH/962qYf7k76ItOxhEzuABkBhbkr//++aeQyf0ADKDzDBKGArbhgG3wQwEL6AcEtmGBBnQgBMPgQAUusIEInKADHwjBCkIQgwfUoAQ7iEALMtAPa5iEfbTQIT0YgTxGKJAMvfSFDhDoHgT4AgE6hBA/+GEQ2AgiNvy84EMfekGI2BhEEf1QAyQuEYhCJGIRjyhEJRaxiUJ8IhKlaEQkWtGHWAyiFqO4RC/UIIUl2s4H9PAlw+lrBPHQQ4UCtDU7vJEgbsijHvfIxz768Y+ADKQgB0lIQGJjDdvZjkBstJ3EHCSRRLLRHQnCiEoSJAKVrOQcCCKGTDIiApTMpBgIMgdPbnIgncxkQTw5yoGUMpOnFEgqLRnKSrZSIK/U5Ag+kLjEDaSXCQGmQHzJpWIasyV3OaYyl8nMZi7nLsl0ZkagKc1qWvOa2JxLNLPJzW6+ZZvevAhdwrkStJCTI2gZ5zknos51shOc7oynPOdJz3ra857hDAgAOw==';

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function getAugmentedNamespace(n) {
  	if (n.__esModule) return n;
  	var a = Object.defineProperty({}, '__esModule', {value: true});
  	Object.keys(n).forEach(function (k) {
  		var d = Object.getOwnPropertyDescriptor(n, k);
  		Object.defineProperty(a, k, d.get ? d : {
  			enumerable: true,
  			get: function () {
  				return n[k];
  			}
  		});
  	});
  	return a;
  }

  function createCommonjsModule(fn) {
    var module = { exports: {} };
  	return fn(module, module.exports), module.exports;
  }

  /**
   * Observable class prototype.
   *
   * @module observable
   */

  /**
   * Handles named events.
   *
   * @template N
   */
  class Observable {
    constructor () {
      /**
       * Some desc.
       * @type {Map<N, any>}
       */
      this._observers = create$8();
    }

    /**
     * @param {N} name
     * @param {function} f
     */
    on (name, f) {
      setIfUndefined(this._observers, name, create$7).add(f);
    }

    /**
     * @param {N} name
     * @param {function} f
     */
    once (name, f) {
      /**
       * @param  {...any} args
       */
      const _f = (...args) => {
        this.off(name, _f);
        f(...args);
      };
      this.on(name, _f);
    }

    /**
     * @param {N} name
     * @param {function} f
     */
    off (name, f) {
      const observers = this._observers.get(name);
      if (observers !== undefined) {
        observers.delete(f);
        if (observers.size === 0) {
          this._observers.delete(name);
        }
      }
    }

    /**
     * Emit a named event. All registered event listeners that listen to the
     * specified name will receive the event.
     *
     * @todo This should catch exceptions
     *
     * @param {N} name The event name.
     * @param {Array<any>} args The arguments that are applied to the event listener.
     */
    emit (name, args) {
      // copy all listeners to an array first to make sure that no event is emitted to listeners that are subscribed while the event handler is called.
      return from((this._observers.get(name) || create$8()).values()).forEach(f => f(...args))
    }

    destroy () {
      this._observers = create$8();
    }
  }

  var observable = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Observable: Observable
  });

  var observable_1 = /*@__PURE__*/getAugmentedNamespace(observable);

  var AbstractConnector_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.AbstractConnector = void 0;

  /**
   * This is an abstract interface that all Connectors should implement to keep them interchangeable.
   *
   * @note This interface is experimental and it is not advised to actually inherit this class.
   *             It just serves as typing information.
   *
   * @extends {Observable<any>}
   */
  class AbstractConnector extends observable_1.Observable {
      constructor(ydoc, awareness) {
          super();
          this.doc = ydoc;
          this.awareness = awareness;
      }
  }
  exports.AbstractConnector = AbstractConnector;
  });

  var internals_js_1 = internals;

  var array = /*@__PURE__*/getAugmentedNamespace(array$1);

  var math = /*@__PURE__*/getAugmentedNamespace(math$1);

  var map = /*@__PURE__*/getAugmentedNamespace(map$3);

  var encoding = /*@__PURE__*/getAugmentedNamespace(encoding$1);

  var decoding = /*@__PURE__*/getAugmentedNamespace(decoding$1);

  var DeleteSet_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.readAndApplyDeleteSet = exports.readDeleteSet = exports.writeDeleteSet = exports.createDeleteSetFromStructStore = exports.createDeleteSet = exports.addToDeleteSet = exports.mergeDeleteSets = exports.sortAndMergeDeleteSet = exports.isDeleted = exports.findIndexDS = exports.iterateDeletedStructs = exports.DeleteSet = exports.DeleteItem = void 0;






  class DeleteItem {
      /**
       * @param {number} clock
       * @param {number} len
       */
      constructor(clock, len) {
          /**
           * @type {number}
           */
          this.clock = clock;
          /**
           * @type {number}
           */
          this.len = len;
      }
  }
  exports.DeleteItem = DeleteItem;
  /**
   * We no longer maintain a DeleteStore. DeleteSet is a temporary object that is created when needed.
   * - When created in a transaction, it must only be accessed after sorting, and merging
   *     - This DeleteSet is send to other clients
   * - We do not create a DeleteSet when we send a sync message. The DeleteSet message is created directly from StructStore
   * - We read a DeleteSet as part of a sync/update message. In this case the DeleteSet is already sorted and merged.
   */
  class DeleteSet {
      constructor() {
          /**
           * @type {Map<number,Array<DeleteItem>>}
           */
          this.clients = new Map();
      }
  }
  exports.DeleteSet = DeleteSet;
  /**
   * Iterate over all structs that the DeleteSet gc's.
   *
   * @param {Transaction} transaction
   * @param {DeleteSet} ds
   * @param {function(GC|Item):void} f
   *
   * @function
   */
  const iterateDeletedStructs = (transaction, ds, f) => ds.clients.forEach((deletes, clientid) => {
      const structs = (transaction.doc.store.clients.get(clientid));
      for (let i = 0; i < deletes.length; i++) {
          const del = deletes[i];
          (0, internals_js_1.iterateStructs)(transaction, structs, del.clock, del.len, f);
      }
  });
  exports.iterateDeletedStructs = iterateDeletedStructs;
  /**
   * @param {Array<DeleteItem>} dis
   * @param {number} clock
   * @return {number|null}
   *
   * @private
   * @function
   */
  const findIndexDS = (dis, clock) => {
      let left = 0;
      let right = dis.length - 1;
      while (left <= right) {
          const midindex = math.floor((left + right) / 2);
          const mid = dis[midindex];
          const midclock = mid.clock;
          if (midclock <= clock) {
              if (clock < midclock + mid.len) {
                  return midindex;
              }
              left = midindex + 1;
          }
          else {
              right = midindex - 1;
          }
      }
      return null;
  };
  exports.findIndexDS = findIndexDS;
  /**
   * @param {DeleteSet} ds
   * @param {ID} id
   * @return {boolean}
   *
   * @private
   * @function
   */
  const isDeleted = (ds, id) => {
      const dis = ds.clients.get(id.client);
      return dis !== undefined && (0, exports.findIndexDS)(dis, id.clock) !== null;
  };
  exports.isDeleted = isDeleted;
  /**
   * @param {DeleteSet} ds
   *
   * @private
   * @function
   */
  const sortAndMergeDeleteSet = (ds) => {
      ds.clients.forEach(dels => {
          dels.sort((a, b) => a.clock - b.clock);
          // merge items without filtering or splicing the array
          // i is the current pointer
          // j refers to the current insert position for the pointed item
          // try to merge dels[i] into dels[j-1] or set dels[j]=dels[i]
          let i, j;
          for (i = 1, j = 1; i < dels.length; i++) {
              const left = dels[j - 1];
              const right = dels[i];
              if (left.clock + left.len >= right.clock) {
                  left.len = math.max(left.len, right.clock + right.len - left.clock);
              }
              else {
                  if (j < i) {
                      dels[j] = right;
                  }
                  j++;
              }
          }
          dels.length = j;
      });
  };
  exports.sortAndMergeDeleteSet = sortAndMergeDeleteSet;
  /**
   * @param {Array<DeleteSet>} dss
   * @return {DeleteSet} A fresh DeleteSet
   */
  const mergeDeleteSets = (dss) => {
      const merged = new DeleteSet();
      for (let dssI = 0; dssI < dss.length; dssI++) {
          dss[dssI].clients.forEach((delsLeft, client) => {
              if (!merged.clients.has(client)) {
                  // Write all missing keys from current ds and all following.
                  // If merged already contains `client` current ds has already been added.
                  /**
                   * @type {Array<DeleteItem>}
                   */
                  const dels = delsLeft.slice();
                  for (let i = dssI + 1; i < dss.length; i++) {
                      array.appendTo(dels, dss[i].clients.get(client) || []);
                  }
                  merged.clients.set(client, dels);
              }
          });
      }
      (0, exports.sortAndMergeDeleteSet)(merged);
      return merged;
  };
  exports.mergeDeleteSets = mergeDeleteSets;
  /**
   * @param {DeleteSet} ds
   * @param {number} client
   * @param {number} clock
   * @param {number} length
   *
   * @private
   * @function
   */
  const addToDeleteSet = (ds, client, clock, length) => {
      map.setIfUndefined(ds.clients, client, () => [])
          .push(new DeleteItem(clock, length));
  };
  exports.addToDeleteSet = addToDeleteSet;
  const createDeleteSet = () => new DeleteSet();
  exports.createDeleteSet = createDeleteSet;
  /**
   * @param {StructStore} ss
   * @return {DeleteSet} Merged and sorted DeleteSet
   *
   * @private
   * @function
   */
  const createDeleteSetFromStructStore = (ss) => {
      const ds = (0, exports.createDeleteSet)();
      ss.clients.forEach((structs, client) => {
          /**
           * @type {Array<DeleteItem>}
           */
          const dsitems = [];
          for (let i = 0; i < structs.length; i++) {
              const struct = structs[i];
              if (struct.deleted) {
                  const clock = struct.id.clock;
                  let len = struct.length;
                  if (i + 1 < structs.length) {
                      for (let next = structs[i + 1]; i + 1 < structs.length && next.deleted; next = structs[++i + 1]) {
                          len += next.length;
                      }
                  }
                  dsitems.push(new DeleteItem(clock, len));
              }
          }
          if (dsitems.length > 0) {
              ds.clients.set(client, dsitems);
          }
      });
      return ds;
  };
  exports.createDeleteSetFromStructStore = createDeleteSetFromStructStore;
  /**
   * @param {DSEncoderV1 | DSEncoderV2} encoder
   * @param {DeleteSet} ds
   *
   * @private
   * @function
   */
  const writeDeleteSet = (encoder, ds) => {
      encoding.writeVarUint(encoder.restEncoder, ds.clients.size);
      // Ensure that the delete set is written in a deterministic order
      array.from(ds.clients.entries())
          .sort((a, b) => b[0] - a[0])
          .forEach(([client, dsitems]) => {
          encoder.resetDsCurVal();
          encoding.writeVarUint(encoder.restEncoder, client);
          const len = dsitems.length;
          encoding.writeVarUint(encoder.restEncoder, len);
          for (let i = 0; i < len; i++) {
              const item = dsitems[i];
              encoder.writeDsClock(item.clock);
              encoder.writeDsLen(item.len);
          }
      });
  };
  exports.writeDeleteSet = writeDeleteSet;
  /**
   * @param {DSDecoderV1 | DSDecoderV2} decoder
   * @return {DeleteSet}
   *
   * @private
   * @function
   */
  const readDeleteSet = (decoder) => {
      const ds = new DeleteSet();
      const numClients = decoding.readVarUint(decoder.restDecoder);
      for (let i = 0; i < numClients; i++) {
          decoder.resetDsCurVal();
          const client = decoding.readVarUint(decoder.restDecoder);
          const numberOfDeletes = decoding.readVarUint(decoder.restDecoder);
          if (numberOfDeletes > 0) {
              const dsField = map.setIfUndefined(ds.clients, client, () => []);
              for (let i = 0; i < numberOfDeletes; i++) {
                  dsField.push(new DeleteItem(decoder.readDsClock(), decoder.readDsLen()));
              }
          }
      }
      return ds;
  };
  exports.readDeleteSet = readDeleteSet;
  /**
   * @todo YDecoder also contains references to String and other Decoders. Would make sense to exchange YDecoder.toUint8Array for YDecoder.DsToUint8Array()..
   */
  /**
   * @param {DSDecoderV1 | DSDecoderV2} decoder
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @return {Uint8Array|null} Returns a v2 update containing all deletes that couldn't be applied yet; or null if all deletes were applied successfully.
   *
   * @private
   * @function
   */
  const readAndApplyDeleteSet = (decoder, transaction, store) => {
      const unappliedDS = new DeleteSet();
      const numClients = decoding.readVarUint(decoder.restDecoder);
      for (let i = 0; i < numClients; i++) {
          decoder.resetDsCurVal();
          const client = decoding.readVarUint(decoder.restDecoder);
          const numberOfDeletes = decoding.readVarUint(decoder.restDecoder);
          const structs = store.clients.get(client) || [];
          const state = (0, internals_js_1.getState)(store, client);
          for (let i = 0; i < numberOfDeletes; i++) {
              const clock = decoder.readDsClock();
              const clockEnd = clock + decoder.readDsLen();
              if (clock < state) {
                  if (state < clockEnd) {
                      (0, exports.addToDeleteSet)(unappliedDS, client, state, clockEnd - state);
                  }
                  let index = (0, internals_js_1.findIndexSS)(structs, clock);
                  /**
                   * We can ignore the case of GC and Delete structs, because we are going to skip them
                   * @type {Item}
                   */
                  // @ts-ignore
                  let struct = structs[index];
                  // split the first item if necessary
                  if (!struct.deleted && struct.id.clock < clock) {
                      structs.splice(index + 1, 0, (0, internals_js_1.splitItem)(transaction, struct, clock - struct.id.clock));
                      index++; // increase we now want to use the next struct
                  }
                  while (index < structs.length) {
                      // @ts-ignore
                      struct = structs[index++];
                      if (struct.id.clock < clockEnd) {
                          if (!struct.deleted) {
                              if (clockEnd < struct.id.clock + struct.length) {
                                  structs.splice(index, 0, (0, internals_js_1.splitItem)(transaction, struct, clockEnd - struct.id.clock));
                              }
                              struct.delete(transaction);
                          }
                      }
                      else {
                          break;
                      }
                  }
              }
              else {
                  (0, exports.addToDeleteSet)(unappliedDS, client, clock, clockEnd - clock);
              }
          }
      }
      if (unappliedDS.clients.size > 0) {
          const ds = new internals_js_1.UpdateEncoderV2();
          encoding.writeVarUint(ds.restEncoder, 0); // encode 0 structs
          (0, exports.writeDeleteSet)(ds, unappliedDS);
          return ds.toUint8Array();
      }
      return null;
  };
  exports.readAndApplyDeleteSet = readAndApplyDeleteSet;
  });

  var random = /*@__PURE__*/getAugmentedNamespace(random$1);

  var promise = /*@__PURE__*/getAugmentedNamespace(promise$1);

  var Doc_1 = createCommonjsModule(function (module, exports) {
  /**
   * @module Y
   */
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Doc = exports.generateNewClientId = void 0;






  exports.generateNewClientId = random.uint32;
  /**
   * A Yjs instance handles the state of shared data.
   * @extends Observable<string>
   */
  class Doc extends observable_1.Observable {
      /**
       * @param {DocOpts} opts configuration
       */
      constructor({ guid = random.uuidv4(), collectionid = null, gc = true, gcFilter = () => true, meta = null, autoLoad = false, shouldLoad = true } = {}) {
          super();
          this.gc = gc;
          this.gcFilter = gcFilter;
          this.clientID = (0, exports.generateNewClientId)();
          this.guid = guid;
          this.collectionid = collectionid;
          /**
           * @type {Map<string, AbstractType<YEvent<any>>>}
           */
          this.share = new Map();
          this.store = new internals_js_1.StructStore();
          /**
           * @type {Transaction | null}
           */
          this._transaction = null;
          /**
           * @type {Array<Transaction>}
           */
          this._transactionCleanups = [];
          /**
           * @type {Set<Doc>}
           */
          this.subdocs = new Set();
          /**
           * If this document is a subdocument - a document integrated into another document - then _item is defined.
           * @type {Item?}
           */
          this._item = null;
          this.shouldLoad = shouldLoad;
          this.autoLoad = autoLoad;
          this.meta = meta;
          /**
           * This is set to true when the persistence provider loaded the document from the database or when the `sync` event fires.
           * Note that not all providers implement this feature. Provider authors are encouraged to fire the `load` event when the doc content is loaded from the database.
           *
           * @type {boolean}
           */
          this.isLoaded = false;
          /**
           * This is set to true when the connection provider has successfully synced with a backend.
           * Note that when using peer-to-peer providers this event may not provide very useful.
           * Also note that not all providers implement this feature. Provider authors are encouraged to fire
           * the `sync` event when the doc has been synced (with `true` as a parameter) or if connection is
           * lost (with false as a parameter).
           */
          this.isSynced = false;
          /**
           * Promise that resolves once the document has been loaded from a presistence provider.
           */
          this.whenLoaded = promise.create(resolve => {
              this.on('load', () => {
                  this.isLoaded = true;
                  resolve(this);
              });
          });
          const provideSyncedPromise = () => new Promise(resolve => {
              /**
               * @param {boolean} isSynced
               */
              const eventHandler = (isSynced) => {
                  if (isSynced === undefined || isSynced === true) {
                      this.off('sync', eventHandler);
                      resolve();
                  }
              };
              this.on('sync', eventHandler);
          });
          this.on('sync', (isSynced) => {
              if (isSynced === false && this.isSynced) {
                  this.whenSynced = provideSyncedPromise();
              }
              this.isSynced = isSynced === undefined || isSynced === true;
              if (!this.isLoaded) {
                  this.emit('load', []);
              }
          });
          /**
           * Promise that resolves once the document has been synced with a backend.
           * This promise is recreated when the connection is lost.
           * Note the documentation about the `isSynced` property.
           */
          this.whenSynced = provideSyncedPromise();
      }
      /**
       * Notify the parent document that you request to load data into this subdocument (if it is a subdocument).
       *
       * `load()` might be used in the future to request any provider to load the most current data.
       *
       * It is safe to call `load()` multiple times.
       */
      load() {
          const item = this._item;
          if (item !== null && !this.shouldLoad) {
              (0, internals_js_1.transact)(item.parent.doc, transaction => {
                  transaction.subdocsLoaded.add(this);
              }, null, true);
          }
          this.shouldLoad = true;
      }
      getSubdocs() {
          return this.subdocs;
      }
      getSubdocGuids() {
          return new Set(array.from(this.subdocs).map(doc => doc.guid));
      }
      /**
       * Changes that happen inside of a transaction are bundled. This means that
       * the observer fires _after_ the transaction is finished and that all changes
       * that happened inside of the transaction are sent as one message to the
       * other peers.
       *
       * @param {function(Transaction):void} f The function that should be executed as a transaction
       * @param {any} [origin] Origin of who started the transaction. Will be stored on transaction.origin
       *
       * @public
       */
      transact(f, origin = null) {
          (0, internals_js_1.transact)(this, f, origin);
      }
      /**
       * Define a shared data type.
       *
       * Multiple calls of `y.get(name, TypeConstructor)` yield the same result
       * and do not overwrite each other. I.e.
       * `y.define(name, Y.Array) === y.define(name, Y.Array)`
       *
       * After this method is called, the type is also available on `y.share.get(name)`.
       *
       * *Best Practices:*
       * Define all types right after the Yjs instance is created and store them in a separate object.
       * Also use the typed methods `getText(name)`, `getArray(name)`, ..
       *
       * @example
       *     const y = new Y(..)
       *     const appState = {
       *         document: y.getText('document')
       *         comments: y.getArray('comments')
       *     }
       *
       * @param {string} name
       * @param {Function} TypeConstructor The constructor of the type definition. E.g. Y.Text, Y.Array, Y.Map, ...
       * @return {AbstractType<any>} The created type. Constructed with TypeConstructor
       *
       * @public
       */
      get(name, TypeConstructor = internals_js_1.AbstractType) {
          const type = map.setIfUndefined(this.share, name, () => {
              // @ts-ignore
              const t = new TypeConstructor();
              t._integrate(this, null);
              return t;
          });
          const Constr = type.constructor;
          if (TypeConstructor !== internals_js_1.AbstractType && Constr !== TypeConstructor) {
              if (Constr === internals_js_1.AbstractType) {
                  // @ts-ignore
                  const t = new TypeConstructor();
                  t._map = type._map;
                  type._map.forEach(/** @param {Item?} n */ (n) => {
                      for (; n !== null; n = n.left) {
                          // @ts-ignore
                          n.parent = t;
                      }
                  });
                  t._start = type._start;
                  for (let n = t._start; n !== null; n = n.right) {
                      n.parent = t;
                  }
                  t._length = type._length;
                  this.share.set(name, t);
                  t._integrate(this, null);
                  return t;
              }
              else {
                  throw new Error(`Type with the name ${name} has already been defined with a different constructor`);
              }
          }
          return type;
      }
      /**
       * @template T
       * @param {string} [name]
       * @return {YArray<T>}
       *
       * @public
       */
      getArray(name = '') {
          // @ts-ignore
          return this.get(name, internals_js_1.YArray);
      }
      /**
       * @param {string} [name]
       * @return {YText}
       *
       * @public
       */
      getText(name = '') {
          // @ts-ignore
          return this.get(name, internals_js_1.YText);
      }
      /**
       * @template T
       * @param {string} [name]
       * @return {YMap<T>}
       *
       * @public
       */
      getMap(name = '') {
          // @ts-ignore
          return this.get(name, internals_js_1.YMap);
      }
      /**
       * @param {string} [name]
       * @return {YXmlFragment}
       *
       * @public
       */
      getXmlFragment(name = '') {
          // @ts-ignore
          return this.get(name, internals_js_1.YXmlFragment);
      }
      /**
       * Converts the entire document into a js object, recursively traversing each yjs type
       * Doesn't log types that have not been defined (using ydoc.getType(..)).
       *
       * @deprecated Do not use this method and rather call toJSON directly on the shared types.
       *
       * @return {Object<string, any>}
       */
      toJSON() {
          /**
           * @type {Object<string, any>}
           */
          const doc = {};
          this.share.forEach((value, key) => {
              doc[key] = value.toJSON();
          });
          return doc;
      }
      /**
       * Emit `destroy` event and unregister all event handlers.
       */
      destroy() {
          array.from(this.subdocs).forEach(subdoc => subdoc.destroy());
          const item = this._item;
          if (item !== null) {
              this._item = null;
              const content = item.content;
              content.doc = new Doc(Object.assign(Object.assign({ guid: this.guid }, content.opts), { shouldLoad: false }));
              content.doc._item = item;
              (0, internals_js_1.transact)(item.parent.doc, transaction => {
                  const doc = content.doc;
                  if (!item.deleted) {
                      transaction.subdocsAdded.add(doc);
                  }
                  transaction.subdocsRemoved.add(this);
              }, null, true);
          }
          this.emit('destroyed', [true]);
          this.emit('destroy', [this]);
          super.destroy();
      }
      /**
       * @param {string} eventName
       * @param {function(...any):any} f
       */
      on(eventName, f) {
          super.on(eventName, f);
      }
      /**
       * @param {string} eventName
       * @param {function} f
       */
      off(eventName, f) {
          super.off(eventName, f);
      }
  }
  exports.Doc = Doc;
  });

  var buffer = /*@__PURE__*/getAugmentedNamespace(buffer$1);

  var UpdateDecoder = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.UpdateDecoderV2 = exports.DSDecoderV2 = exports.UpdateDecoderV1 = exports.DSDecoderV1 = void 0;



  class DSDecoderV1 {
      constructor(decoder) {
          this.restDecoder = decoder;
      }
      resetDsCurVal() { }
      readDsClock() {
          return decoding.readVarUint(this.restDecoder);
      }
      readDsLen() {
          return decoding.readVarUint(this.restDecoder);
      }
  }
  exports.DSDecoderV1 = DSDecoderV1;
  class UpdateDecoderV1 extends DSDecoderV1 {
      readLeftID() {
          return (0, internals_js_1.createID)(decoding.readVarUint(this.restDecoder), decoding.readVarUint(this.restDecoder));
      }
      readRightID() {
          return (0, internals_js_1.createID)(decoding.readVarUint(this.restDecoder), decoding.readVarUint(this.restDecoder));
      }
      /**
       * Read the next client id.
       * Use this in favor of readID whenever possible to reduce the number of objects created.
       */
      readClient() {
          return decoding.readVarUint(this.restDecoder);
      }
      /**
       * @return {number} info An unsigned 8-bit integer
       */
      readInfo() {
          return decoding.readUint8(this.restDecoder);
      }
      readString() {
          return decoding.readVarString(this.restDecoder);
      }
      readParentInfo() {
          return decoding.readVarUint(this.restDecoder) === 1;
      }
      readTypeRef() {
          return decoding.readVarUint(this.restDecoder);
      }
      /** Write len of a struct - well suited for Opt RLE encoder. */
      readLen() {
          return decoding.readVarUint(this.restDecoder);
      }
      readAny() {
          return decoding.readAny(this.restDecoder);
      }
      readBuf() {
          return buffer.copyUint8Array(decoding.readVarUint8Array(this.restDecoder));
      }
      /** Legacy implementation uses JSON parse. We use any-decoding in v2. */
      readJSON() {
          return JSON.parse(decoding.readVarString(this.restDecoder));
      }
      readKey() {
          return decoding.readVarString(this.restDecoder);
      }
  }
  exports.UpdateDecoderV1 = UpdateDecoderV1;
  class DSDecoderV2 {
      constructor(decoder) {
          this.dsCurrVal = 0;
          this.restDecoder = decoder;
      }
      resetDsCurVal() {
          this.dsCurrVal = 0;
      }
      readDsClock() {
          this.dsCurrVal += decoding.readVarUint(this.restDecoder);
          return this.dsCurrVal;
      }
      readDsLen() {
          const diff = decoding.readVarUint(this.restDecoder) + 1;
          this.dsCurrVal += diff;
          return diff;
      }
  }
  exports.DSDecoderV2 = DSDecoderV2;
  class UpdateDecoderV2 extends DSDecoderV2 {
      constructor(decoder) {
          super(decoder);
          /**
           * List of cached keys. If the keys[id] does not exist, we read a new key
           * from stringEncoder and push it to keys.
           */
          this.keys = [];
          decoding.readVarUint(decoder); // read feature flag - currently unused
          this.keyClockDecoder = new decoding.IntDiffOptRleDecoder(decoding.readVarUint8Array(decoder));
          this.clientDecoder = new decoding.UintOptRleDecoder(decoding.readVarUint8Array(decoder));
          this.leftClockDecoder = new decoding.IntDiffOptRleDecoder(decoding.readVarUint8Array(decoder));
          this.rightClockDecoder = new decoding.IntDiffOptRleDecoder(decoding.readVarUint8Array(decoder));
          this.infoDecoder = new decoding.RleDecoder(decoding.readVarUint8Array(decoder), decoding.readUint8);
          this.stringDecoder = new decoding.StringDecoder(decoding.readVarUint8Array(decoder));
          this.parentInfoDecoder = new decoding.RleDecoder(decoding.readVarUint8Array(decoder), decoding.readUint8);
          this.typeRefDecoder = new decoding.UintOptRleDecoder(decoding.readVarUint8Array(decoder));
          this.lenDecoder = new decoding.UintOptRleDecoder(decoding.readVarUint8Array(decoder));
      }
      readLeftID() {
          return new internals_js_1.ID(this.clientDecoder.read(), this.leftClockDecoder.read());
      }
      readRightID() {
          return new internals_js_1.ID(this.clientDecoder.read(), this.rightClockDecoder.read());
      }
      /**
       * Read the next client id.
       * Use this in favor of readID whenever possible to reduce the number of objects created.
       */
      readClient() {
          return this.clientDecoder.read();
      }
      /**
       * @return {number} info An unsigned 8-bit integer
       */
      readInfo() {
          return /** @type {number} */ (this.infoDecoder.read());
      }
      readString() {
          return this.stringDecoder.read();
      }
      readParentInfo() {
          return this.parentInfoDecoder.read() === 1;
      }
      /**
       * @return {number} An unsigned 8-bit integer
       */
      readTypeRef() {
          return this.typeRefDecoder.read();
      }
      /**
       * Write len of a struct - well suited for Opt RLE encoder.
       */
      readLen() {
          return this.lenDecoder.read();
      }
      readAny() {
          return decoding.readAny(this.restDecoder);
      }
      readBuf() {
          return decoding.readVarUint8Array(this.restDecoder);
      }
      /**
       * This is mainly here for legacy purposes.
       *
       * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
       */
      readJSON() {
          return decoding.readAny(this.restDecoder);
      }
      readKey() {
          const keyClock = this.keyClockDecoder.read();
          if (keyClock < this.keys.length) {
              return this.keys[keyClock];
          }
          else {
              const key = this.stringDecoder.read();
              this.keys.push(key);
              return key;
          }
      }
  }
  exports.UpdateDecoderV2 = UpdateDecoderV2;
  });

  var error = /*@__PURE__*/getAugmentedNamespace(error$1);

  var UpdateEncoder = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.UpdateEncoderV2 = exports.DSEncoderV2 = exports.UpdateEncoderV1 = exports.DSEncoderV1 = void 0;


  class DSEncoderV1 {
      constructor() {
          this.restEncoder = encoding.createEncoder();
      }
      toUint8Array() {
          return encoding.toUint8Array(this.restEncoder);
      }
      resetDsCurVal() {
          // nop
      }
      writeDsClock(clock) {
          encoding.writeVarUint(this.restEncoder, clock);
      }
      writeDsLen(len) {
          encoding.writeVarUint(this.restEncoder, len);
      }
  }
  exports.DSEncoderV1 = DSEncoderV1;
  class UpdateEncoderV1 extends DSEncoderV1 {
      writeLeftID(id) {
          encoding.writeVarUint(this.restEncoder, id.client);
          encoding.writeVarUint(this.restEncoder, id.clock);
      }
      writeRightID(id) {
          encoding.writeVarUint(this.restEncoder, id.client);
          encoding.writeVarUint(this.restEncoder, id.clock);
      }
      /** Use writeClient and writeClock instead of writeID if possible. */
      writeClient(client) {
          encoding.writeVarUint(this.restEncoder, client);
      }
      /**
       * @param {number} info An unsigned 8-bit integer
       */
      writeInfo(info) {
          encoding.writeUint8(this.restEncoder, info);
      }
      writeString(s) {
          encoding.writeVarString(this.restEncoder, s);
      }
      /**
       * @param {boolean} isYKey
       */
      writeParentInfo(isYKey) {
          encoding.writeVarUint(this.restEncoder, isYKey ? 1 : 0);
      }
      /**
       * @param {number} info An unsigned 8-bit integer
       */
      writeTypeRef(info) {
          encoding.writeVarUint(this.restEncoder, info);
      }
      /**
       * Write len of a struct - well suited for Opt RLE encoder.
       *
       * @param {number} len
       */
      writeLen(len) {
          encoding.writeVarUint(this.restEncoder, len);
      }
      /**
       * @param {any} any
       */
      writeAny(any) {
          encoding.writeAny(this.restEncoder, any);
      }
      /**
       * @param {Uint8Array} buf
       */
      writeBuf(buf) {
          encoding.writeVarUint8Array(this.restEncoder, buf);
      }
      /**
       * @param {any} embed
       */
      writeJSON(embed) {
          encoding.writeVarString(this.restEncoder, JSON.stringify(embed));
      }
      /**
       * @param {string} key
       */
      writeKey(key) {
          encoding.writeVarString(this.restEncoder, key);
      }
  }
  exports.UpdateEncoderV1 = UpdateEncoderV1;
  class DSEncoderV2 {
      constructor() {
          this.dsCurrVal = 0;
          this.restEncoder = encoding.createEncoder(); // encodes all the rest / non-optimized
      }
      toUint8Array() {
          return encoding.toUint8Array(this.restEncoder);
      }
      resetDsCurVal() {
          this.dsCurrVal = 0;
      }
      /**
       * @param {number} clock
       */
      writeDsClock(clock) {
          const diff = clock - this.dsCurrVal;
          this.dsCurrVal = clock;
          encoding.writeVarUint(this.restEncoder, diff);
      }
      /**
       * @param {number} len
       */
      writeDsLen(len) {
          if (len === 0) {
              error.unexpectedCase();
          }
          encoding.writeVarUint(this.restEncoder, len - 1);
          this.dsCurrVal += len;
      }
  }
  exports.DSEncoderV2 = DSEncoderV2;
  class UpdateEncoderV2 extends DSEncoderV2 {
      constructor() {
          super();
          this.keyMap = new Map();
          this.keyClock = 0;
          this.keyClockEncoder = new encoding.IntDiffOptRleEncoder();
          this.clientEncoder = new encoding.UintOptRleEncoder();
          this.leftClockEncoder = new encoding.IntDiffOptRleEncoder();
          this.rightClockEncoder = new encoding.IntDiffOptRleEncoder();
          this.infoEncoder = new encoding.RleEncoder(encoding.writeUint8);
          this.stringEncoder = new encoding.StringEncoder();
          this.parentInfoEncoder = new encoding.RleEncoder(encoding.writeUint8);
          this.typeRefEncoder = new encoding.UintOptRleEncoder();
          this.lenEncoder = new encoding.UintOptRleEncoder();
      }
      toUint8Array() {
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, 0); // this is a feature flag that we might use in the future
          encoding.writeVarUint8Array(encoder, this.keyClockEncoder.toUint8Array());
          encoding.writeVarUint8Array(encoder, this.clientEncoder.toUint8Array());
          encoding.writeVarUint8Array(encoder, this.leftClockEncoder.toUint8Array());
          encoding.writeVarUint8Array(encoder, this.rightClockEncoder.toUint8Array());
          encoding.writeVarUint8Array(encoder, encoding.toUint8Array(this.infoEncoder));
          encoding.writeVarUint8Array(encoder, this.stringEncoder.toUint8Array());
          encoding.writeVarUint8Array(encoder, encoding.toUint8Array(this.parentInfoEncoder));
          encoding.writeVarUint8Array(encoder, this.typeRefEncoder.toUint8Array());
          encoding.writeVarUint8Array(encoder, this.lenEncoder.toUint8Array());
          // @note The rest encoder is appended! (note the missing var)
          encoding.writeUint8Array(encoder, encoding.toUint8Array(this.restEncoder));
          return encoding.toUint8Array(encoder);
      }
      writeLeftID(id) {
          this.clientEncoder.write(id.client);
          this.leftClockEncoder.write(id.clock);
      }
      writeRightID(id) {
          this.clientEncoder.write(id.client);
          this.rightClockEncoder.write(id.clock);
      }
      writeClient(client) {
          this.clientEncoder.write(client);
      }
      /**
       * @param {number} info An unsigned 8-bit integer
       */
      writeInfo(info) {
          this.infoEncoder.write(info);
      }
      writeString(s) {
          this.stringEncoder.write(s);
      }
      writeParentInfo(isYKey) {
          this.parentInfoEncoder.write(isYKey ? 1 : 0);
      }
      /**
       * @param {number} info An unsigned 8-bit integer
       */
      writeTypeRef(info) {
          this.typeRefEncoder.write(info);
      }
      /** Write len of a struct - well suited for Opt RLE encoder. */
      writeLen(len) {
          this.lenEncoder.write(len);
      }
      writeAny(any) {
          encoding.writeAny(this.restEncoder, any);
      }
      writeBuf(buf) {
          encoding.writeVarUint8Array(this.restEncoder, buf);
      }
      /**
       * This is mainly here for legacy purposes.
       *
       * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
       */
      writeJSON(embed) {
          encoding.writeAny(this.restEncoder, embed);
      }
      /**
       * Property keys are often reused. For example, in y-prosemirror the key `bold` might
       * occur very often. For a 3d application, the key `position` might occur very often.
       *
       * We cache these keys in a Map and refer to them via a unique number.
       */
      writeKey(key) {
          const clock = this.keyMap.get(key);
          if (clock === undefined) {
              /**
               * @todo uncomment to introduce this feature finally
               *
               * Background. The ContentFormat object was always encoded using writeKey, but the decoder used to use readString.
               * Furthermore, I forgot to set the keyclock. So everything was working fine.
               *
               * However, this feature here is basically useless as it is not being used (it actually only consumes extra memory).
               *
               * I don't know yet how to reintroduce this feature..
               *
               * Older clients won't be able to read updates when we reintroduce this feature. So this should probably be done using a flag.
               *
               */
              // this.keyMap.set(key, this.keyClock)
              this.keyClockEncoder.write(this.keyClock++);
              this.stringEncoder.write(key);
          }
          else {
              this.keyClockEncoder.write(clock);
          }
      }
  }
  exports.UpdateEncoderV2 = UpdateEncoderV2;
  });

  var binary = /*@__PURE__*/getAugmentedNamespace(binary$1);

  var encoding_1 = createCommonjsModule(function (module, exports) {
  /**
   * @module encoding
   */
  /*
   * We use the first five bits in the info flag for determining the type of the struct.
   *
   * 0: GC
   * 1: Item with Deleted content
   * 2: Item with JSON content
   * 3: Item with Binary content
   * 4: Item with String content
   * 5: Item with Embed content (for richtext content)
   * 6: Item with Format content (a formatting marker for richtext content)
   * 7: Item with Type
   */
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.encodeStateVector = exports.encodeStateVectorV2 = exports.writeDocumentStateVector = exports.writeStateVector = exports.decodeStateVector = exports.readStateVector = exports.encodeStateAsUpdate = exports.encodeStateAsUpdateV2 = exports.writeStateAsUpdate = exports.applyUpdate = exports.applyUpdateV2 = exports.readUpdate = exports.readUpdateV2 = exports.writeStructsFromTransaction = exports.readClientsStructRefs = exports.writeClientsStructs = void 0;







  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {Array<GC|Item>} structs All structs by `client`
   * @param {number} client
   * @param {number} clock write structs starting with `ID(client,clock)`
   *
   * @function
   */
  const writeStructs = (encoder, structs, client, clock) => {
      // write first id
      clock = math.max(clock, structs[0].id.clock); // make sure the first id exists
      const startNewStructs = (0, internals_js_1.findIndexSS)(structs, clock);
      // write # encoded structs
      encoding.writeVarUint(encoder.restEncoder, structs.length - startNewStructs);
      encoder.writeClient(client);
      encoding.writeVarUint(encoder.restEncoder, clock);
      const firstStruct = structs[startNewStructs];
      // write first struct with an offset
      firstStruct.write(encoder, clock - firstStruct.id.clock);
      for (let i = startNewStructs + 1; i < structs.length; i++) {
          structs[i].write(encoder, 0);
      }
  };
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {StructStore} store
   * @param {Map<number,number>} _sm
   *
   * @private
   * @function
   */
  const writeClientsStructs = (encoder, store, _sm) => {
      // we filter all valid _sm entries into sm
      const sm = new Map();
      _sm.forEach((clock, client) => {
          // only write if new structs are available
          if ((0, internals_js_1.getState)(store, client) > clock) {
              sm.set(client, clock);
          }
      });
      (0, internals_js_1.getStateVector)(store).forEach((clock, client) => {
          if (!_sm.has(client)) {
              sm.set(client, 0);
          }
      });
      // write # states that were updated
      encoding.writeVarUint(encoder.restEncoder, sm.size);
      // Write items with higher client ids first
      // This heavily improves the conflict algorithm.
      array.from(sm.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, clock]) => {
          // @ts-ignore
          writeStructs(encoder, store.clients.get(client), client, clock);
      });
  };
  exports.writeClientsStructs = writeClientsStructs;
  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder The decoder object to read data from.
   * @param {Doc} doc
   * @return {Map<number, { i: number, refs: Array<Item | GC> }>}
   *
   * @private
   * @function
   */
  const readClientsStructRefs = (decoder, doc) => {
      /**
       * @type {Map<number, { i: number, refs: Array<Item | GC> }>}
       */
      const clientRefs = map.create();
      const numOfStateUpdates = decoding.readVarUint(decoder.restDecoder);
      for (let i = 0; i < numOfStateUpdates; i++) {
          const numberOfStructs = decoding.readVarUint(decoder.restDecoder);
          /**
           * @type {Array<GC|Item>}
           */
          const refs = new Array(numberOfStructs);
          const client = decoder.readClient();
          let clock = decoding.readVarUint(decoder.restDecoder);
          // const start = performance.now()
          clientRefs.set(client, { i: 0, refs });
          for (let i = 0; i < numberOfStructs; i++) {
              const info = decoder.readInfo();
              switch (binary.BITS5 & info) {
                  case 0: { // GC
                      const len = decoder.readLen();
                      refs[i] = new internals_js_1.GC((0, internals_js_1.createID)(client, clock), len);
                      clock += len;
                      break;
                  }
                  case 10: { // Skip Struct (nothing to apply)
                      // @todo we could reduce the amount of checks by adding Skip struct to clientRefs so we know that something is missing.
                      const len = decoding.readVarUint(decoder.restDecoder);
                      refs[i] = new internals_js_1.Skip((0, internals_js_1.createID)(client, clock), len);
                      clock += len;
                      break;
                  }
                  default: { // Item with content
                      /**
                       * The optimized implementation doesn't use any variables because inlining variables is faster.
                       * Below a non-optimized version is shown that implements the basic algorithm with
                       * a few comments
                       */
                      const cantCopyParentInfo = (info & (binary.BIT7 | binary.BIT8)) === 0;
                      // If parent = null and neither left nor right are defined, then we know that `parent` is child of `y`
                      // and we read the next string as parentYKey.
                      // It indicates how we store/retrieve parent from `y.share`
                      // @type {string|null}
                      const struct = new internals_js_1.Item((0, internals_js_1.createID)(client, clock), null, // leftd
                      (info & binary.BIT8) === binary.BIT8 ? decoder.readLeftID() : null, // origin
                      null, // right
                      (info & binary.BIT7) === binary.BIT7 ? decoder.readRightID() : null, // right origin
                      cantCopyParentInfo ? (decoder.readParentInfo() ? doc.get(decoder.readString()) : decoder.readLeftID()) : null, // parent
                      cantCopyParentInfo && (info & binary.BIT6) === binary.BIT6 ? decoder.readString() : null, // parentSub
                      (0, internals_js_1.readItemContent)(decoder, info) // item content
                      );
                      /* A non-optimized implementation of the above algorithm:

                      // The item that was originally to the left of this item.
                      const origin = (info & binary.BIT8) === binary.BIT8 ? decoder.readLeftID() : null
                      // The item that was originally to the right of this item.
                      const rightOrigin = (info & binary.BIT7) === binary.BIT7 ? decoder.readRightID() : null
                      const cantCopyParentInfo = (info & (binary.BIT7 | binary.BIT8)) === 0
                      const hasParentYKey = cantCopyParentInfo ? decoder.readParentInfo() : false
                      // If parent = null and neither left nor right are defined, then we know that `parent` is child of `y`
                      // and we read the next string as parentYKey.
                      // It indicates how we store/retrieve parent from `y.share`
                      // @type {string|null}
                      const parentYKey = cantCopyParentInfo && hasParentYKey ? decoder.readString() : null

                      const struct = new Item(
                          createID(client, clock),
                          null, // leftd
                          origin, // origin
                          null, // right
                          rightOrigin, // right origin
                          cantCopyParentInfo && !hasParentYKey ? decoder.readLeftID() : (parentYKey !== null ? doc.get(parentYKey) : null), // parent
                          cantCopyParentInfo && (info & binary.BIT6) === binary.BIT6 ? decoder.readString() : null, // parentSub
                          readItemContent(decoder, info) // item content
                      )
                      */
                      refs[i] = struct;
                      clock += struct.length;
                  }
              }
          }
          // console.log('time to read: ', performance.now() - start) // @todo remove
      }
      return clientRefs;
  };
  exports.readClientsStructRefs = readClientsStructRefs;
  /**
   * Resume computing structs generated by struct readers.
   *
   * While there is something to do, we integrate structs in this order
   * 1. top element on stack, if stack is not empty
   * 2. next element from current struct reader (if empty, use next struct reader)
   *
   * If struct causally depends on another struct (ref.missing), we put next reader of
   * `ref.id.client` on top of stack.
   *
   * At some point we find a struct that has no causal dependencies,
   * then we start emptying the stack.
   *
   * It is not possible to have circles: i.e. struct1 (from client1) depends on struct2 (from client2)
   * depends on struct3 (from client1). Therefore the max stack size is eqaul to `structReaders.length`.
   *
   * This method is implemented in a way so that we can resume computation if this update
   * causally depends on another update.
   *
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @param {Map<number, { i: number, refs: (GC | Item)[] }>} clientsStructRefs
   * @return { null | { update: Uint8Array, missing: Map<number,number> } }
   *
   * @private
   * @function
   */
  const integrateStructs = (transaction, store, clientsStructRefs) => {
      /**
       * @type {Array<Item | GC>}
       */
      const stack = [];
      // sort them so that we take the higher id first, in case of conflicts the lower id will probably not conflict with the id from the higher user.
      let clientsStructRefsIds = array.from(clientsStructRefs.keys()).sort((a, b) => a - b);
      if (clientsStructRefsIds.length === 0) {
          return null;
      }
      const getNextStructTarget = () => {
          if (clientsStructRefsIds.length === 0) {
              return null;
          }
          let nextStructsTarget = clientsStructRefs.get(clientsStructRefsIds[clientsStructRefsIds.length - 1]);
          while (nextStructsTarget.refs.length === nextStructsTarget.i) {
              clientsStructRefsIds.pop();
              if (clientsStructRefsIds.length > 0) {
                  nextStructsTarget = (clientsStructRefs.get(clientsStructRefsIds[clientsStructRefsIds.length - 1]));
              }
              else {
                  return null;
              }
          }
          return nextStructsTarget;
      };
      let curStructsTarget = getNextStructTarget();
      if (curStructsTarget === null && stack.length === 0) {
          return null;
      }
      /**
       * @type {StructStore}
       */
      const restStructs = new internals_js_1.StructStore();
      const missingSV = new Map();
      /**
       * @param {number} client
       * @param {number} clock
       */
      const updateMissingSv = (client, clock) => {
          const mclock = missingSV.get(client);
          if (mclock == null || mclock > clock) {
              missingSV.set(client, clock);
          }
      };
      /**
       * @type {GC|Item}
       */
      let stackHead = curStructsTarget.refs[curStructsTarget.i++];
      // caching the state because it is used very often
      const state = new Map();
      const addStackToRestSS = () => {
          for (const item of stack) {
              const client = item.id.client;
              const unapplicableItems = clientsStructRefs.get(client);
              if (unapplicableItems) {
                  // decrement because we weren't able to apply previous operation
                  unapplicableItems.i--;
                  restStructs.clients.set(client, unapplicableItems.refs.slice(unapplicableItems.i));
                  clientsStructRefs.delete(client);
                  unapplicableItems.i = 0;
                  unapplicableItems.refs = [];
              }
              else {
                  // item was the last item on clientsStructRefs and the field was already cleared. Add item to restStructs and continue
                  restStructs.clients.set(client, [item]);
              }
              // remove client from clientsStructRefsIds to prevent users from applying the same update again
              clientsStructRefsIds = clientsStructRefsIds.filter(c => c !== client);
          }
          stack.length = 0;
      };
      // iterate over all struct readers until we are done
      while (true) {
          if (stackHead.constructor !== internals_js_1.Skip) {
              const localClock = map.setIfUndefined(state, stackHead.id.client, () => (0, internals_js_1.getState)(store, stackHead.id.client));
              const offset = localClock - stackHead.id.clock;
              if (offset < 0) {
                  // update from the same client is missing
                  stack.push(stackHead);
                  updateMissingSv(stackHead.id.client, stackHead.id.clock - 1);
                  // hid a dead wall, add all items from stack to restSS
                  addStackToRestSS();
              }
              else {
                  const missing = stackHead.getMissing(transaction, store);
                  if (missing !== null) {
                      stack.push(stackHead);
                      // get the struct reader that has the missing struct
                      /**
                       * @type {{ refs: Array<GC|Item>, i: number }}
                       */
                      const structRefs = clientsStructRefs.get(/** @type {number} */ (missing)) || { refs: [], i: 0 };
                      if (structRefs.refs.length === structRefs.i) {
                          // This update message causally depends on another update message that doesn't exist yet
                          updateMissingSv(/** @type {number} */ (missing), (0, internals_js_1.getState)(store, missing));
                          addStackToRestSS();
                      }
                      else {
                          stackHead = structRefs.refs[structRefs.i++];
                          continue;
                      }
                  }
                  else if (offset === 0 || offset < stackHead.length) {
                      // all fine, apply the stackhead
                      stackHead.integrate(transaction, offset);
                      state.set(stackHead.id.client, stackHead.id.clock + stackHead.length);
                  }
              }
          }
          // iterate to next stackHead
          if (stack.length > 0) {
              stackHead = (stack.pop());
          }
          else if (curStructsTarget !== null && curStructsTarget.i < curStructsTarget.refs.length) {
              stackHead = (curStructsTarget.refs[curStructsTarget.i++]);
          }
          else {
              curStructsTarget = getNextStructTarget();
              if (curStructsTarget === null) {
                  // we are done!
                  break;
              }
              else {
                  stackHead = (curStructsTarget.refs[curStructsTarget.i++]);
              }
          }
      }
      if (restStructs.clients.size > 0) {
          const encoder = new internals_js_1.UpdateEncoderV2();
          (0, exports.writeClientsStructs)(encoder, restStructs, new Map());
          // write empty deleteset
          // writeDeleteSet(encoder, new DeleteSet())
          encoding.writeVarUint(encoder.restEncoder, 0); // => no need for an extra function call, just write 0 deletes
          return { missing: missingSV, update: encoder.toUint8Array() };
      }
      return null;
  };
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {Transaction} transaction
   *
   * @private
   * @function
   */
  const writeStructsFromTransaction = (encoder, transaction) => (0, exports.writeClientsStructs)(encoder, transaction.doc.store, transaction.beforeState);
  exports.writeStructsFromTransaction = writeStructsFromTransaction;
  /**
   * Read and apply a document update.
   *
   * This function has the same effect as `applyUpdate` but accepts an decoder.
   *
   * @param {decoding.Decoder} decoder
   * @param {Doc} ydoc
   * @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
   * @param {UpdateDecoderV1 | UpdateDecoderV2} [structDecoder]
   *
   * @function
   */
  const readUpdateV2 = (decoder, ydoc, transactionOrigin, structDecoder = new internals_js_1.UpdateDecoderV2(decoder)) => (0, internals_js_1.transact)(ydoc, transaction => {
      // force that transaction.local is set to non-local
      transaction.local = false;
      let retry = false;
      const doc = transaction.doc;
      const store = doc.store;
      // let start = performance.now()
      const ss = (0, exports.readClientsStructRefs)(structDecoder, doc);
      // console.log('time to read structs: ', performance.now() - start) // @todo remove
      // start = performance.now()
      // console.log('time to merge: ', performance.now() - start) // @todo remove
      // start = performance.now()
      const restStructs = integrateStructs(transaction, store, ss);
      const pending = store.pendingStructs;
      if (pending) {
          // check if we can apply something
          for (const [client, clock] of pending.missing) {
              if (clock < (0, internals_js_1.getState)(store, client)) {
                  retry = true;
                  break;
              }
          }
          if (restStructs) {
              // merge restStructs into store.pending
              for (const [client, clock] of restStructs.missing) {
                  const mclock = pending.missing.get(client);
                  if (mclock == null || mclock > clock) {
                      pending.missing.set(client, clock);
                  }
              }
              pending.update = (0, internals_js_1.mergeUpdatesV2)([pending.update, restStructs.update]);
          }
      }
      else {
          store.pendingStructs = restStructs;
      }
      // console.log('time to integrate: ', performance.now() - start) // @todo remove
      // start = performance.now()
      const dsRest = (0, internals_js_1.readAndApplyDeleteSet)(structDecoder, transaction, store);
      if (store.pendingDs) {
          // @todo we could make a lower-bound state-vector check as we do above
          const pendingDSUpdate = new internals_js_1.UpdateDecoderV2(decoding.createDecoder(store.pendingDs));
          decoding.readVarUint(pendingDSUpdate.restDecoder); // read 0 structs, because we only encode deletes in pendingdsupdate
          const dsRest2 = (0, internals_js_1.readAndApplyDeleteSet)(pendingDSUpdate, transaction, store);
          if (dsRest && dsRest2) {
              // case 1: ds1 != null && ds2 != null
              store.pendingDs = (0, internals_js_1.mergeUpdatesV2)([dsRest, dsRest2]);
          }
          else {
              // case 2: ds1 != null
              // case 3: ds2 != null
              // case 4: ds1 == null && ds2 == null
              store.pendingDs = dsRest || dsRest2;
          }
      }
      else {
          // Either dsRest == null && pendingDs == null OR dsRest != null
          store.pendingDs = dsRest;
      }
      // console.log('time to cleanup: ', performance.now() - start) // @todo remove
      // start = performance.now()
      // console.log('time to resume delete readers: ', performance.now() - start) // @todo remove
      // start = performance.now()
      if (retry) {
          const update = store.pendingStructs.update;
          store.pendingStructs = null;
          (0, exports.applyUpdateV2)(transaction.doc, update);
      }
  }, transactionOrigin, false);
  exports.readUpdateV2 = readUpdateV2;
  /**
   * Read and apply a document update.
   *
   * This function has the same effect as `applyUpdate` but accepts an decoder.
   *
   * @param {decoding.Decoder} decoder
   * @param {Doc} ydoc
   * @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
   *
   * @function
   */
  const readUpdate = (decoder, ydoc, transactionOrigin) => (0, exports.readUpdateV2)(decoder, ydoc, transactionOrigin, new internals_js_1.UpdateDecoderV1(decoder));
  exports.readUpdate = readUpdate;
  /**
   * Apply a document update created by, for example, `y.on('update', update => ..)` or `update = encodeStateAsUpdate()`.
   *
   * This function has the same effect as `readUpdate` but accepts an Uint8Array instead of a Decoder.
   *
   * @param {Doc} ydoc
   * @param {Uint8Array} update
   * @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
   * @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} [YDecoder]
   *
   * @function
   */
  const applyUpdateV2 = (ydoc, update, transactionOrigin, YDecoder = internals_js_1.UpdateDecoderV2) => {
      const decoder = decoding.createDecoder(update);
      (0, exports.readUpdateV2)(decoder, ydoc, transactionOrigin, new YDecoder(decoder));
  };
  exports.applyUpdateV2 = applyUpdateV2;
  /**
   * Apply a document update created by, for example, `y.on('update', update => ..)` or `update = encodeStateAsUpdate()`.
   *
   * This function has the same effect as `readUpdate` but accepts an Uint8Array instead of a Decoder.
   *
   * @param {Doc} ydoc
   * @param {Uint8Array} update
   * @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
   *
   * @function
   */
  const applyUpdate = (ydoc, update, transactionOrigin) => (0, exports.applyUpdateV2)(ydoc, update, transactionOrigin, internals_js_1.UpdateDecoderV1);
  exports.applyUpdate = applyUpdate;
  /**
   * Write all the document as a single update message. If you specify the state of the remote client (`targetStateVector`) it will
   * only write the operations that are missing.
   *
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {Doc} doc
   * @param {Map<number,number>} [targetStateVector] The state of the target that receives the update. Leave empty to write all known structs
   *
   * @function
   */
  const writeStateAsUpdate = (encoder, doc, targetStateVector = new Map()) => {
      (0, exports.writeClientsStructs)(encoder, doc.store, targetStateVector);
      (0, internals_js_1.writeDeleteSet)(encoder, (0, internals_js_1.createDeleteSetFromStructStore)(doc.store));
  };
  exports.writeStateAsUpdate = writeStateAsUpdate;
  /**
   * Write all the document as a single update message that can be applied on the remote document. If you specify the state of the remote client (`targetState`) it will
   * only write the operations that are missing.
   *
   * Use `writeStateAsUpdate` instead if you are working with lib0/encoding.js#Encoder
   *
   * @param {Doc} doc
   * @param {Uint8Array} [encodedTargetStateVector] The state of the target that receives the update. Leave empty to write all known structs
   * @param {UpdateEncoderV1 | UpdateEncoderV2} [encoder]
   * @return {Uint8Array}
   *
   * @function
   */
  const encodeStateAsUpdateV2 = (doc, encodedTargetStateVector = new Uint8Array([0]), encoder = new internals_js_1.UpdateEncoderV2()) => {
      const targetStateVector = (0, exports.decodeStateVector)(encodedTargetStateVector);
      (0, exports.writeStateAsUpdate)(encoder, doc, targetStateVector);
      const updates = [encoder.toUint8Array()];
      // also add the pending updates (if there are any)
      if (doc.store.pendingDs) {
          updates.push(doc.store.pendingDs);
      }
      if (doc.store.pendingStructs) {
          updates.push((0, internals_js_1.diffUpdateV2)(doc.store.pendingStructs.update, encodedTargetStateVector));
      }
      if (updates.length > 1) {
          if (encoder.constructor === internals_js_1.UpdateEncoderV1) {
              return (0, internals_js_1.mergeUpdates)(updates.map((update, i) => i === 0 ? update : (0, internals_js_1.convertUpdateFormatV2ToV1)(update)));
          }
          else if (encoder.constructor === internals_js_1.UpdateEncoderV2) {
              return (0, internals_js_1.mergeUpdatesV2)(updates);
          }
      }
      return updates[0];
  };
  exports.encodeStateAsUpdateV2 = encodeStateAsUpdateV2;
  /**
   * Write all the document as a single update message that can be applied on the remote document. If you specify the state of the remote client (`targetState`) it will
   * only write the operations that are missing.
   *
   * Use `writeStateAsUpdate` instead if you are working with lib0/encoding.js#Encoder
   *
   * @param {Doc} doc
   * @param {Uint8Array} [encodedTargetStateVector] The state of the target that receives the update. Leave empty to write all known structs
   * @return {Uint8Array}
   *
   * @function
   */
  const encodeStateAsUpdate = (doc, encodedTargetStateVector) => {
      return (0, exports.encodeStateAsUpdateV2)(doc, encodedTargetStateVector, new internals_js_1.UpdateEncoderV1());
  };
  exports.encodeStateAsUpdate = encodeStateAsUpdate;
  /**
   * Read state vector from Decoder and return as Map
   *
   * @param {DSDecoderV1 | DSDecoderV2} decoder
   * @return {Map<number,number>} Maps `client` to the number next expected `clock` from that client.
   *
   * @function
   */
  const readStateVector = (decoder) => {
      const ss = new Map();
      const ssLength = decoding.readVarUint(decoder.restDecoder);
      for (let i = 0; i < ssLength; i++) {
          const client = decoding.readVarUint(decoder.restDecoder);
          const clock = decoding.readVarUint(decoder.restDecoder);
          ss.set(client, clock);
      }
      return ss;
  };
  exports.readStateVector = readStateVector;
  /**
   * Read decodedState and return State as Map.
   *
   * @param {Uint8Array} decodedState
   * @return {Map<number,number>} Maps `client` to the number next expected `clock` from that client.
   *
   * @function
   */
  // export const decodeStateVectorV2 = decodedState => readStateVector(new DSDecoderV2(decoding.createDecoder(decodedState)))
  /**
   * Read decodedState and return State as Map.
   *
   * @param {Uint8Array} decodedState
   * @return {Map<number,number>} Maps `client` to the number next expected `clock` from that client.
   *
   * @function
   */
  const decodeStateVector = (decodedState) => (0, exports.readStateVector)(new internals_js_1.DSDecoderV1(decoding.createDecoder(decodedState)));
  exports.decodeStateVector = decodeStateVector;
  /**
   * @param {DSEncoderV1 | DSEncoderV2} encoder
   * @param {Map<number,number>} sv
   * @function
   */
  const writeStateVector = (encoder, sv) => {
      encoding.writeVarUint(encoder.restEncoder, sv.size);
      array.from(sv.entries()).sort((a, b) => b[0] - a[0]).forEach(([client, clock]) => {
          encoding.writeVarUint(encoder.restEncoder, client); // @todo use a special client decoder that is based on mapping
          encoding.writeVarUint(encoder.restEncoder, clock);
      });
      return encoder;
  };
  exports.writeStateVector = writeStateVector;
  /**
   * @param {DSEncoderV1 | DSEncoderV2} encoder
   * @param {Doc} doc
   *
   * @function
   */
  const writeDocumentStateVector = (encoder, doc) => (0, exports.writeStateVector)(encoder, (0, internals_js_1.getStateVector)(doc.store));
  exports.writeDocumentStateVector = writeDocumentStateVector;
  /**
   * Encode State as Uint8Array.
   *
   * @param {Doc|Map<number,number>} doc
   * @param {DSEncoderV1 | DSEncoderV2} [encoder]
   * @return {Uint8Array}
   *
   * @function
   */
  const encodeStateVectorV2 = (doc, encoder = new internals_js_1.DSEncoderV2()) => {
      if (doc instanceof Map) {
          (0, exports.writeStateVector)(encoder, doc);
      }
      else {
          (0, exports.writeDocumentStateVector)(encoder, doc);
      }
      return encoder.toUint8Array();
  };
  exports.encodeStateVectorV2 = encodeStateVectorV2;
  /**
   * Encode State as Uint8Array.
   *
   * @param {Doc|Map<number,number>} doc
   * @return {Uint8Array}
   *
   * @function
   */
  const encodeStateVector = (doc) => (0, exports.encodeStateVectorV2)(doc, new internals_js_1.DSEncoderV1());
  exports.encodeStateVector = encodeStateVector;
  });

  var function_1 = /*@__PURE__*/getAugmentedNamespace(_function);

  var EventHandler_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.callEventHandlerListeners = exports.removeAllEventHandlerListeners = exports.removeEventHandlerListener = exports.addEventHandlerListener = exports.createEventHandler = exports.EventHandler = void 0;

  /**
   * General event handler implementation.
   *
   * @template ARG0, ARG1
   *
   * @private
   */
  class EventHandler {
      constructor() {
          this.l = [];
          this.l = [];
      }
  }
  exports.EventHandler = EventHandler;
  /**
   * @template ARG0,ARG1
   * @returns {EventHandler<ARG0,ARG1>}
   *
   * @private
   * @function
   */
  const createEventHandler = () => new EventHandler();
  exports.createEventHandler = createEventHandler;
  /**
   * Adds an event listener that is called when
   * {@link EventHandler#callEventListeners} is called.
   *
   * @template ARG0,ARG1
   * @param {EventHandler<ARG0,ARG1>} eventHandler
   * @param {function(ARG0,ARG1):void} f The event handler.
   *
   * @private
   * @function
   */
  const addEventHandlerListener = (eventHandler, f) => eventHandler.l.push(f);
  exports.addEventHandlerListener = addEventHandlerListener;
  /**
   * Removes an event listener.
   *
   * @template ARG0,ARG1
   * @param {EventHandler<ARG0,ARG1>} eventHandler
   * @param {function(ARG0,ARG1):void} f The event handler that was added with
   *                                         {@link EventHandler#addEventListener}
   *
   * @private
   * @function
   */
  const removeEventHandlerListener = (eventHandler, f) => {
      const l = eventHandler.l;
      const len = l.length;
      eventHandler.l = l.filter(g => f !== g);
      if (len === eventHandler.l.length) {
          console.error('[yjs] Tried to remove event handler that doesn\'t exist.');
      }
  };
  exports.removeEventHandlerListener = removeEventHandlerListener;
  /**
   * Removes all event listeners.
   * @template ARG0,ARG1
   * @param {EventHandler<ARG0,ARG1>} eventHandler
   *
   * @private
   * @function
   */
  const removeAllEventHandlerListeners = (eventHandler) => {
      eventHandler.l.length = 0;
  };
  exports.removeAllEventHandlerListeners = removeAllEventHandlerListeners;
  /**
   * Call all event listeners that were added via
   * {@link EventHandler#addEventListener}.
   *
   * @template ARG0,ARG1
   * @param {EventHandler<ARG0,ARG1>} eventHandler
   * @param {ARG0} arg0
   * @param {ARG1} arg1
   *
   * @private
   * @function
   */
  const callEventHandlerListeners = (eventHandler, arg0, arg1) => {
      return function_1.callAll(eventHandler.l, [arg0, arg1]);
  };
  exports.callEventHandlerListeners = callEventHandlerListeners;
  });

  var ID_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.findRootTypeKey = exports.readID = exports.writeID = exports.createID = exports.compareIDs = exports.ID = void 0;



  class ID {
      /**
       * @param {number} client client id
       * @param {number} clock unique per client id, continuous number
       */
      constructor(client, clock) {
          this.client = client;
          this.clock = clock;
      }
  }
  exports.ID = ID;
  /**
   * @param {ID | null} a
   * @param {ID | null} b
   * @return {boolean}
   *
   * @function
   */
  const compareIDs = (a, b) => {
      return a === b || (a !== null && b !== null && a.client === b.client && a.clock === b.clock);
  };
  exports.compareIDs = compareIDs;
  /**
   * @param {number} client
   * @param {number} clock
   *
   * @private
   * @function
   */
  const createID = (client, clock) => {
      return new ID(client, clock);
  };
  exports.createID = createID;
  /**
   * @param {encoding.Encoder} encoder
   * @param {ID} id
   *
   * @private
   * @function
   */
  const writeID = (encoder, id) => {
      encoding.writeVarUint(encoder, id.client);
      encoding.writeVarUint(encoder, id.clock);
  };
  exports.writeID = writeID;
  /**
   * Read ID.
   * * If first varUint read is 0xFFFFFF a RootID is returned.
   * * Otherwise an ID is returned
   *
   * @param {decoding.Decoder} decoder
   * @return {ID}
   *
   * @private
   * @function
   */
  const readID = (decoder) => (0, exports.createID)(decoding.readVarUint(decoder), decoding.readVarUint(decoder));
  exports.readID = readID;
  /**
   * The top types are mapped from y.share.get(keyname) => type.
   * `type` does not store any information about the `keyname`.
   * This function finds the correct `keyname` for `type` and throws otherwise.
   *
   * @param {AbstractType<any>} type
   * @return {string}
   *
   * @private
   * @function
   */
  const findRootTypeKey = (type) => {
      // @ts-ignore _y must be defined, otherwise unexpected case
      for (const [key, value] of type.doc.share.entries()) {
          if (value === type) {
              return key;
          }
      }
      throw error.unexpectedCase();
  };
  exports.findRootTypeKey = findRootTypeKey;
  });

  var isParentOf_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.isParentOf = void 0;
  /**
   * Check if `parent` is a parent of `child`.
   *
   * @param {AbstractType<any>} parent
   * @param {Item|null} child
   * @return {Boolean} Whether `parent` is a parent of `child`.
   *
   * @private
   * @function
   */
  const isParentOf = (parent, child) => {
      while (child !== null) {
          if (child.parent === parent) {
              return true;
          }
          child = child.parent._item;
      }
      return false;
  };
  exports.isParentOf = isParentOf;
  });

  var logging$1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.logType = void 0;
  /**
   * Convenient helper to log type information.
   *
   * Do not use in productive systems as the output can be immense!
   *
   * @param {AbstractType<any>} type
   */
  const logType = (type) => {
      const res = [];
      let n = type._start;
      while (n) {
          res.push(n);
          n = n.right;
      }
      console.log('Children: ', res);
      console.log('Children content: ', res.filter(m => !m.deleted).map(m => m.content));
  };
  exports.logType = logType;
  });

  var PermanentUserData_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.PermanentUserData = void 0;


  class PermanentUserData {
      /**
       * @param {Doc} doc
       * @param {YMap<any>} [storeType]
       */
      constructor(doc, storeType = doc.getMap('users')) {
          const dss = new Map();
          this.yusers = storeType;
          this.doc = doc;
          this.clients = new Map();
          this.dss = dss;
          /**
           * @param {YMap<any>} user
           * @param {string} userDescription
           */
          const initUser = (user, userDescription) => {
              /**
               * @type {YArray<Uint8Array>}
               */
              const ds = user.get('ds');
              const ids = user.get('ids');
              const addClientId = (clientid) => this.clients.set(clientid, userDescription);
              ds.observe((event) => {
                  event.changes.added.forEach(item => {
                      item.content.getContent().forEach(encodedDs => {
                          if (encodedDs instanceof Uint8Array) {
                              this.dss.set(userDescription, (0, internals_js_1.mergeDeleteSets)([this.dss.get(userDescription) || (0, internals_js_1.createDeleteSet)(), (0, internals_js_1.readDeleteSet)(new internals_js_1.DSDecoderV1(decoding.createDecoder(encodedDs)))]));
                          }
                      });
                  });
              });
              this.dss.set(userDescription, (0, internals_js_1.mergeDeleteSets)(ds.map((encodedDs) => (0, internals_js_1.readDeleteSet)(new internals_js_1.DSDecoderV1(decoding.createDecoder(encodedDs))))));
              ids.observe((event) => event.changes.added.forEach(item => item.content.getContent().forEach(addClientId)));
              ids.forEach(addClientId);
          };
          // observe users
          storeType.observe(event => {
              event.keysChanged.forEach(userDescription => initUser(storeType.get(userDescription), userDescription));
          });
          // add intial data
          storeType.forEach(initUser);
      }
      /**
       * @param {Doc} doc
       * @param {number} clientid
       * @param {string} userDescription
       * @param {Object} conf
       * @param {function(Transaction, DeleteSet):boolean} [conf.filter]
       */
      setUserMapping(doc, clientid, userDescription, { filter = () => true } = {}) {
          const users = this.yusers;
          let user = users.get(userDescription);
          if (!user) {
              user = new internals_js_1.YMap();
              user.set('ids', new internals_js_1.YArray());
              user.set('ds', new internals_js_1.YArray());
              users.set(userDescription, user);
          }
          user.get('ids').push([clientid]);
          users.observe(_event => {
              setTimeout(() => {
                  const userOverwrite = users.get(userDescription);
                  if (userOverwrite !== user) {
                      // user was overwritten, port all data over to the next user object
                      // @todo Experiment with Y.Sets here
                      user = userOverwrite;
                      // @todo iterate over old type
                      this.clients.forEach((_userDescription, clientid) => {
                          if (userDescription === _userDescription) {
                              user.get('ids').push([clientid]);
                          }
                      });
                      const encoder = new internals_js_1.DSEncoderV1();
                      const ds = this.dss.get(userDescription);
                      if (ds) {
                          (0, internals_js_1.writeDeleteSet)(encoder, ds);
                          user.get('ds').push([encoder.toUint8Array()]);
                      }
                  }
              }, 0);
          });
          doc.on('afterTransaction', (transaction) => {
              setTimeout(() => {
                  const yds = user.get('ds');
                  const ds = transaction.deleteSet;
                  if (transaction.local && ds.clients.size > 0 && filter(transaction, ds)) {
                      const encoder = new internals_js_1.DSEncoderV1();
                      (0, internals_js_1.writeDeleteSet)(encoder, ds);
                      yds.push([encoder.toUint8Array()]);
                  }
              });
          });
      }
      /**
       * @param {number} clientid
       * @return {any}
       */
      getUserByClientId(clientid) {
          return this.clients.get(clientid) || null;
      }
      /**
       * @param {ID} id
       * @return {string | null}
       */
      getUserByDeletedId(id) {
          for (const [userDescription, ds] of this.dss.entries()) {
              if ((0, internals_js_1.isDeleted)(ds, id)) {
                  return userDescription;
              }
          }
          return null;
      }
  }
  exports.PermanentUserData = PermanentUserData;
  });

  var RelativePosition_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.compareRelativePositions = exports.createAbsolutePositionFromRelativePosition = exports.decodeRelativePosition = exports.readRelativePosition = exports.encodeRelativePosition = exports.writeRelativePosition = exports.createRelativePositionFromTypeIndex = exports.createRelativePosition = exports.createAbsolutePosition = exports.AbsolutePosition = exports.createRelativePositionFromJSON = exports.relativePositionToJSON = exports.RelativePosition = void 0;




  /**
   * A relative position is based on the Yjs model and is not affected by document changes.
   * E.g. If you place a relative position before a certain character, it will always point to this character.
   * If you place a relative position at the end of a type, it will always point to the end of the type.
   *
   * A numeric position is often unsuited for user selections, because it does not change when content is inserted
   * before or after.
   *
   * ```Insert(0, 'x')('a|bc') = 'xa|bc'``` Where | is the relative position.
   *
   * One of the properties must be defined.
   *
   * @example
   *     // Current cursor position is at position 10
   *     const relativePosition = createRelativePositionFromIndex(yText, 10)
   *     // modify yText
   *     yText.insert(0, 'abc')
   *     yText.delete(3, 10)
   *     // Compute the cursor position
   *     const absolutePosition = createAbsolutePositionFromRelativePosition(y, relativePosition)
   *     absolutePosition.type === yText // => true
   *     console.log('cursor location is ' + absolutePosition.index) // => cursor location is 3
   *
   */
  class RelativePosition {
      /**
       * @param {ID|null} type
       * @param {string|null} tname
       * @param {ID|null} item
       * @param {number} assoc
       */
      constructor(type, tname, item, assoc = 0) {
          this.type = type;
          this.tname = tname;
          this.item = item;
          /**
           * A relative position is associated to a specific character. By default
           * assoc >= 0, the relative position is associated to the character
           * after the meant position.
           * I.e. position 1 in 'ab' is associated to character 'b'.
           *
           * If assoc < 0, then the relative position is associated to the caharacter
           * before the meant position.
           */
          this.assoc = assoc;
      }
  }
  exports.RelativePosition = RelativePosition;
  /**
   * @param {RelativePosition} rpos
   * @return {any}
   */
  const relativePositionToJSON = (rpos) => {
      const json = {};
      if (rpos.type) {
          json.type = rpos.type;
      }
      if (rpos.tname) {
          json.tname = rpos.tname;
      }
      if (rpos.item) {
          json.item = rpos.item;
      }
      if (rpos.assoc != null) {
          json.assoc = rpos.assoc;
      }
      return json;
  };
  exports.relativePositionToJSON = relativePositionToJSON;
  /**
   * @param {any} json
   * @return {RelativePosition}
   *
   * @function
   */
  const createRelativePositionFromJSON = (json) => {
      return new RelativePosition(json.type == null ? null : (0, internals_js_1.createID)(json.type.client, json.type.clock), json.tname || null, json.item == null ? null : (0, internals_js_1.createID)(json.item.client, json.item.clock), json.assoc == null ? 0 : json.assoc);
  };
  exports.createRelativePositionFromJSON = createRelativePositionFromJSON;
  class AbsolutePosition {
      constructor(type, index, assoc = 0) {
          this.type = type;
          this.index = index;
          this.assoc = assoc;
      }
  }
  exports.AbsolutePosition = AbsolutePosition;
  /**
   * @param {AbstractType<any>} type
   * @param {number} index
   * @param {number} [assoc]
   *
   * @function
   */
  const createAbsolutePosition = (type, index, assoc = 0) => {
      return new AbsolutePosition(type, index, assoc);
  };
  exports.createAbsolutePosition = createAbsolutePosition;
  /**
   * @param {AbstractType<any>} type
   * @param {ID|null} item
   * @param {number} [assoc]
   *
   * @function
   */
  const createRelativePosition = (type, item, assoc) => {
      let typeid = null;
      let tname = null;
      if (type._item === null) {
          tname = (0, internals_js_1.findRootTypeKey)(type);
      }
      else {
          typeid = (0, internals_js_1.createID)(type._item.id.client, type._item.id.clock);
      }
      return new RelativePosition(typeid, tname, item, assoc);
  };
  exports.createRelativePosition = createRelativePosition;
  /**
   * Create a relativePosition based on a absolute position.
   *
   * @param {AbstractType<any>} type The base type (e.g. YText or YArray).
   * @param {number} index The absolute position.
   * @param {number} [assoc]
   * @return {RelativePosition}
   *
   * @function
   */
  const createRelativePositionFromTypeIndex = (type, index, assoc = 0) => {
      let t = type._start;
      if (assoc < 0) {
          // associated to the left character or the beginning of a type, increment index if possible.
          if (index === 0) {
              return (0, exports.createRelativePosition)(type, null, assoc);
          }
          index--;
      }
      while (t !== null) {
          if (!t.deleted && t.countable) {
              if (t.length > index) {
                  // case 1: found position somewhere in the linked list
                  return (0, exports.createRelativePosition)(type, (0, internals_js_1.createID)(t.id.client, t.id.clock + index), assoc);
              }
              index -= t.length;
          }
          if (t.right === null && assoc < 0) {
              // left-associated position, return last available id
              return (0, exports.createRelativePosition)(type, t.lastId, assoc);
          }
          t = t.right;
      }
      return (0, exports.createRelativePosition)(type, null, assoc);
  };
  exports.createRelativePositionFromTypeIndex = createRelativePositionFromTypeIndex;
  /**
   * @param {encoding.Encoder} encoder
   * @param {RelativePosition} rpos
   *
   * @function
   */
  const writeRelativePosition = (encoder, rpos) => {
      const { type, tname, item, assoc } = rpos;
      if (item !== null) {
          encoding.writeVarUint(encoder, 0);
          (0, internals_js_1.writeID)(encoder, item);
      }
      else if (tname !== null) {
          // case 2: found position at the end of the list and type is stored in y.share
          encoding.writeUint8(encoder, 1);
          encoding.writeVarString(encoder, tname);
      }
      else if (type !== null) {
          // case 3: found position at the end of the list and type is attached to an item
          encoding.writeUint8(encoder, 2);
          (0, internals_js_1.writeID)(encoder, type);
      }
      else {
          throw error.unexpectedCase();
      }
      encoding.writeVarInt(encoder, assoc);
      return encoder;
  };
  exports.writeRelativePosition = writeRelativePosition;
  /**
   * @param {RelativePosition} rpos
   * @return {Uint8Array}
   */
  const encodeRelativePosition = (rpos) => {
      const encoder = encoding.createEncoder();
      (0, exports.writeRelativePosition)(encoder, rpos);
      return encoding.toUint8Array(encoder);
  };
  exports.encodeRelativePosition = encodeRelativePosition;
  /**
   * @param {decoding.Decoder} decoder
   * @return {RelativePosition}
   *
   * @function
   */
  const readRelativePosition = (decoder) => {
      let type = null;
      let tname = null;
      let itemID = null;
      switch (decoding.readVarUint(decoder)) {
          case 0:
              // case 1: found position somewhere in the linked list
              itemID = (0, internals_js_1.readID)(decoder);
              break;
          case 1:
              // case 2: found position at the end of the list and type is stored in y.share
              tname = decoding.readVarString(decoder);
              break;
          case 2: {
              // case 3: found position at the end of the list and type is attached to an item
              type = (0, internals_js_1.readID)(decoder);
          }
      }
      const assoc = decoding.hasContent(decoder) ? decoding.readVarInt(decoder) : 0;
      return new RelativePosition(type, tname, itemID, assoc);
  };
  exports.readRelativePosition = readRelativePosition;
  /**
   * @param {Uint8Array} uint8Array
   * @return {RelativePosition}
   */
  const decodeRelativePosition = (uint8Array) => (0, exports.readRelativePosition)(decoding.createDecoder(uint8Array));
  exports.decodeRelativePosition = decodeRelativePosition;
  /**
   * @param {RelativePosition} rpos
   * @param {Doc} doc
   * @return {AbsolutePosition|null}
   *
   * @function
   */
  const createAbsolutePositionFromRelativePosition = (rpos, doc) => {
      const store = doc.store;
      const rightID = rpos.item;
      const typeID = rpos.type;
      const tname = rpos.tname;
      const assoc = rpos.assoc;
      let type = null;
      let index = 0;
      if (rightID !== null) {
          if ((0, internals_js_1.getState)(store, rightID.client) <= rightID.clock) {
              return null;
          }
          const res = (0, internals_js_1.followRedone)(store, rightID);
          const right = res.item;
          if (!(right instanceof internals_js_1.Item)) {
              return null;
          }
          type = right.parent;
          if (type._item === null || !type._item.deleted) {
              index = (right.deleted || !right.countable) ? 0 : (res.diff + (assoc >= 0 ? 0 : 1)); // adjust position based on left association if necessary
              let n = right.left;
              while (n !== null) {
                  if (!n.deleted && n.countable) {
                      index += n.length;
                  }
                  n = n.left;
              }
          }
      }
      else {
          if (tname !== null) {
              type = doc.get(tname);
          }
          else if (typeID !== null) {
              if ((0, internals_js_1.getState)(store, typeID.client) <= typeID.clock) {
                  // type does not exist yet
                  return null;
              }
              const { item } = (0, internals_js_1.followRedone)(store, typeID);
              if (item instanceof internals_js_1.Item && item.content instanceof internals_js_1.ContentType) {
                  type = item.content.type;
              }
              else {
                  // struct is garbage collected
                  return null;
              }
          }
          else {
              throw error.unexpectedCase();
          }
          if (assoc >= 0) {
              index = type._length;
          }
          else {
              index = 0;
          }
      }
      return (0, exports.createAbsolutePosition)(type, index, rpos.assoc);
  };
  exports.createAbsolutePositionFromRelativePosition = createAbsolutePositionFromRelativePosition;
  /**
   * @param {RelativePosition|null} a
   * @param {RelativePosition|null} b
   * @return {boolean}
   *
   * @function
   */
  const compareRelativePositions = (a, b) => a === b || (a !== null && b !== null && a.tname === b.tname && (0, internals_js_1.compareIDs)(a.item, b.item) && (0, internals_js_1.compareIDs)(a.type, b.type) && a.assoc === b.assoc);
  exports.compareRelativePositions = compareRelativePositions;
  });

  var set = /*@__PURE__*/getAugmentedNamespace(set$2);

  var Snapshot_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.createDocFromSnapshot = exports.splitSnapshotAffectedStructs = exports.isVisible = exports.snapshot = exports.emptySnapshot = exports.createSnapshot = exports.decodeSnapshot = exports.decodeSnapshotV2 = exports.encodeSnapshot = exports.encodeSnapshotV2 = exports.equalSnapshots = exports.Snapshot = void 0;





  class Snapshot {
      /**
       * @param {DeleteSet} ds
       * @param {Map<number,number>} sv state map
       */
      constructor(ds, sv) {
          this.ds = ds;
          this.sv = sv;
      }
  }
  exports.Snapshot = Snapshot;
  /**
   * @param {Snapshot} snap1
   * @param {Snapshot} snap2
   * @return {boolean}
   */
  const equalSnapshots = (snap1, snap2) => {
      const ds1 = snap1.ds.clients;
      const ds2 = snap2.ds.clients;
      const sv1 = snap1.sv;
      const sv2 = snap2.sv;
      if (sv1.size !== sv2.size || ds1.size !== ds2.size) {
          return false;
      }
      for (const [key, value] of sv1.entries()) {
          if (sv2.get(key) !== value) {
              return false;
          }
      }
      for (const [client, dsitems1] of ds1.entries()) {
          const dsitems2 = ds2.get(client) || [];
          if (dsitems1.length !== dsitems2.length) {
              return false;
          }
          for (let i = 0; i < dsitems1.length; i++) {
              const dsitem1 = dsitems1[i];
              const dsitem2 = dsitems2[i];
              if (dsitem1.clock !== dsitem2.clock || dsitem1.len !== dsitem2.len) {
                  return false;
              }
          }
      }
      return true;
  };
  exports.equalSnapshots = equalSnapshots;
  /**
   * @param {Snapshot} snapshot
   * @param {DSEncoderV1 | DSEncoderV2} [encoder]
   * @return {Uint8Array}
   */
  const encodeSnapshotV2 = (snapshot, encoder = new internals_js_1.DSEncoderV2()) => {
      (0, internals_js_1.writeDeleteSet)(encoder, snapshot.ds);
      (0, internals_js_1.writeStateVector)(encoder, snapshot.sv);
      return encoder.toUint8Array();
  };
  exports.encodeSnapshotV2 = encodeSnapshotV2;
  /**
   * @param {Snapshot} snapshot
   * @return {Uint8Array}
   */
  const encodeSnapshot = (snapshot) => (0, exports.encodeSnapshotV2)(snapshot, new internals_js_1.DSEncoderV1());
  exports.encodeSnapshot = encodeSnapshot;
  /**
   * @param {Uint8Array} buf
   * @param {DSDecoderV1 | DSDecoderV2} [decoder]
   * @return {Snapshot}
   */
  const decodeSnapshotV2 = (buf, decoder = new internals_js_1.DSDecoderV2(decoding.createDecoder(buf))) => {
      return new Snapshot((0, internals_js_1.readDeleteSet)(decoder), (0, internals_js_1.readStateVector)(decoder));
  };
  exports.decodeSnapshotV2 = decodeSnapshotV2;
  /**
   * @param {Uint8Array} buf
   * @return {Snapshot}
   */
  const decodeSnapshot = (buf) => (0, exports.decodeSnapshotV2)(buf, new internals_js_1.DSDecoderV1(decoding.createDecoder(buf)));
  exports.decodeSnapshot = decodeSnapshot;
  /**
   * @param {DeleteSet} ds
   * @param {Map<number,number>} sm
   * @return {Snapshot}
   */
  const createSnapshot = (ds, sm) => new Snapshot(ds, sm);
  exports.createSnapshot = createSnapshot;
  exports.emptySnapshot = (0, exports.createSnapshot)((0, internals_js_1.createDeleteSet)(), new Map());
  /**
   * @param {Doc} doc
   * @return {Snapshot}
   */
  const snapshot = (doc) => (0, exports.createSnapshot)((0, internals_js_1.createDeleteSetFromStructStore)(doc.store), (0, internals_js_1.getStateVector)(doc.store));
  exports.snapshot = snapshot;
  /**
   * @param {Item} item
   * @param {Snapshot|undefined} snapshot
   *
   * @protected
   * @function
   */
  const isVisible = (item, snapshot) => snapshot === undefined
      ? !item.deleted
      : snapshot.sv.has(item.id.client) && (snapshot.sv.get(item.id.client) || 0) > item.id.clock && !(0, internals_js_1.isDeleted)(snapshot.ds, item.id);
  exports.isVisible = isVisible;
  /**
   * @param {Transaction} transaction
   * @param {Snapshot} snapshot
   */
  const splitSnapshotAffectedStructs = (transaction, snapshot) => {
      const meta = map.setIfUndefined(transaction.meta, exports.splitSnapshotAffectedStructs, set.create);
      const store = transaction.doc.store;
      // check if we already split for this snapshot
      if (!meta.has(snapshot)) {
          snapshot.sv.forEach((clock, client) => {
              if (clock < (0, internals_js_1.getState)(store, client)) {
                  (0, internals_js_1.getItemCleanStart)(transaction, (0, internals_js_1.createID)(client, clock));
              }
          });
          (0, internals_js_1.iterateDeletedStructs)(transaction, snapshot.ds, item => { });
          meta.add(snapshot);
      }
  };
  exports.splitSnapshotAffectedStructs = splitSnapshotAffectedStructs;
  /**
   * @param {Doc} originDoc
   * @param {Snapshot} snapshot
   * @param {Doc} [newDoc] Optionally, you may define the Yjs document that receives the data from originDoc
   * @return {Doc}
   */
  const createDocFromSnapshot = (originDoc, snapshot, newDoc = new internals_js_1.Doc()) => {
      if (originDoc.gc) {
          // we should not try to restore a GC-ed document, because some of the restored items might have their content deleted
          throw new Error('originDoc must not be garbage collected');
      }
      const { sv, ds } = snapshot;
      const encoder = new internals_js_1.UpdateEncoderV2();
      originDoc.transact(transaction => {
          let size = 0;
          sv.forEach(clock => {
              if (clock > 0) {
                  size++;
              }
          });
          encoding.writeVarUint(encoder.restEncoder, size);
          // splitting the structs before writing them to the encoder
          for (const [client, clock] of sv) {
              if (clock === 0) {
                  continue;
              }
              if (clock < (0, internals_js_1.getState)(originDoc.store, client)) {
                  (0, internals_js_1.getItemCleanStart)(transaction, (0, internals_js_1.createID)(client, clock));
              }
              const structs = originDoc.store.clients.get(client) || [];
              const lastStructIndex = (0, internals_js_1.findIndexSS)(structs, clock - 1);
              // write # encoded structs
              encoding.writeVarUint(encoder.restEncoder, lastStructIndex + 1);
              encoder.writeClient(client);
              // first clock written is 0
              encoding.writeVarUint(encoder.restEncoder, 0);
              for (let i = 0; i <= lastStructIndex; i++) {
                  structs[i].write(encoder, 0);
              }
          }
          (0, internals_js_1.writeDeleteSet)(encoder, ds);
      });
      (0, internals_js_1.applyUpdateV2)(newDoc, encoder.toUint8Array(), 'snapshot');
      return newDoc;
  };
  exports.createDocFromSnapshot = createDocFromSnapshot;
  });

  var StructStore_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.iterateStructs = exports.replaceStruct = exports.getItemCleanEnd = exports.getItemCleanStart = exports.findIndexCleanStart = exports.getItem = exports.find = exports.findIndexSS = exports.addStruct = exports.integretyCheck = exports.getState = exports.getStateVector = exports.StructStore = void 0;



  class StructStore {
      constructor() {
          this.clients = new Map();
          this.pendingStructs = null;
          this.pendingDs = null;
      }
  }
  exports.StructStore = StructStore;
  /**
   * Return the states as a Map<client,clock>.
   * Note that clock refers to the next expected clock id.
   *
   * @param {StructStore} store
   * @return {Map<number,number>}
   *
   * @public
   * @function
   */
  const getStateVector = (store) => {
      const sm = new Map();
      store.clients.forEach((structs, client) => {
          const struct = structs[structs.length - 1];
          sm.set(client, struct.id.clock + struct.length);
      });
      return sm;
  };
  exports.getStateVector = getStateVector;
  /**
   * @param {StructStore} store
   * @param {number} client
   * @return {number}
   *
   * @public
   * @function
   */
  const getState = (store, client) => {
      const structs = store.clients.get(client);
      if (structs === undefined) {
          return 0;
      }
      const lastStruct = structs[structs.length - 1];
      return lastStruct.id.clock + lastStruct.length;
  };
  exports.getState = getState;
  /**
   * @param {StructStore} store
   *
   * @private
   * @function
   */
  const integretyCheck = (store) => {
      store.clients.forEach(structs => {
          for (let i = 1; i < structs.length; i++) {
              const l = structs[i - 1];
              const r = structs[i];
              if (l.id.clock + l.length !== r.id.clock) {
                  throw new Error('StructStore failed integrety check');
              }
          }
      });
  };
  exports.integretyCheck = integretyCheck;
  /**
   * @param {StructStore} store
   * @param {GC|Item} struct
   *
   * @private
   * @function
   */
  const addStruct = (store, struct) => {
      let structs = store.clients.get(struct.id.client);
      if (structs === undefined) {
          structs = [];
          store.clients.set(struct.id.client, structs);
      }
      else {
          const lastStruct = structs[structs.length - 1];
          if (lastStruct.id.clock + lastStruct.length !== struct.id.clock) {
              throw error.unexpectedCase();
          }
      }
      structs.push(struct);
  };
  exports.addStruct = addStruct;
  /**
   * Perform a binary search on a sorted array
   * @param {Array<Item|GC>} structs
   * @param {number} clock
   * @return {number}
   *
   * @private
   * @function
   */
  const findIndexSS = (structs, clock) => {
      let left = 0;
      let right = structs.length - 1;
      let mid = structs[right];
      let midclock = mid.id.clock;
      if (midclock === clock) {
          return right;
      }
      // @todo does it even make sense to pivot the search?
      // If a good split misses, it might actually increase the time to find the correct item.
      // Currently, the only advantage is that search with pivoting might find the item on the first try.
      let midindex = math.floor((clock / (midclock + mid.length - 1)) * right); // pivoting the search
      while (left <= right) {
          mid = structs[midindex];
          midclock = mid.id.clock;
          if (midclock <= clock) {
              if (clock < midclock + mid.length) {
                  return midindex;
              }
              left = midindex + 1;
          }
          else {
              right = midindex - 1;
          }
          midindex = math.floor((left + right) / 2);
      }
      // Always check state before looking for a struct in StructStore
      // Therefore the case of not finding a struct is unexpected
      throw error.unexpectedCase();
  };
  exports.findIndexSS = findIndexSS;
  /**
   * Expects that id is actually in store. This function throws or is an infinite loop otherwise.
   *
   * @param {StructStore} store
   * @param {ID} id
   * @return {GC|Item}
   *
   * @private
   * @function
   */
  const find = (store, id) => {
      const structs = store.clients.get(id.client);
      return structs[(0, exports.findIndexSS)(structs, id.clock)];
  };
  exports.find = find;
  /**
   * Expects that id is actually in store. This function throws or is an infinite loop otherwise.
   * @private
   * @function
   */
  const getItem = (store, id) => {
      return (0, exports.find)(store, id);
  };
  exports.getItem = getItem;
  /**
   * @param {Transaction} transaction
   * @param {Array<Item|GC>} structs
   * @param {number} clock
   */
  const findIndexCleanStart = (transaction, structs, clock) => {
      const index = (0, exports.findIndexSS)(structs, clock);
      const struct = structs[index];
      if (struct.id.clock < clock && struct instanceof internals_js_1.Item) {
          structs.splice(index + 1, 0, (0, internals_js_1.splitItem)(transaction, struct, clock - struct.id.clock));
          return index + 1;
      }
      return index;
  };
  exports.findIndexCleanStart = findIndexCleanStart;
  /**
   * Expects that id is actually in store. This function throws or is an infinite loop otherwise.
   *
   * @param {Transaction} transaction
   * @param {ID} id
   * @return {Item}
   *
   * @private
   * @function
   */
  const getItemCleanStart = (transaction, id) => {
      const structs = transaction.doc.store.clients.get(id.client);
      return structs[(0, exports.findIndexCleanStart)(transaction, structs, id.clock)];
  };
  exports.getItemCleanStart = getItemCleanStart;
  /**
   * Expects that id is actually in store. This function throws or is an infinite loop otherwise.
   *
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @param {ID} id
   * @return {Item}
   *
   * @private
   * @function
   */
  const getItemCleanEnd = (transaction, store, id) => {
      const structs = store.clients.get(id.client);
      const index = (0, exports.findIndexSS)(structs, id.clock);
      const struct = structs[index];
      if (id.clock !== struct.id.clock + struct.length - 1 && struct.constructor !== internals_js_1.GC) {
          structs.splice(index + 1, 0, (0, internals_js_1.splitItem)(transaction, struct, id.clock - struct.id.clock + 1));
      }
      return struct;
  };
  exports.getItemCleanEnd = getItemCleanEnd;
  /**
   * Replace `item` with `newitem` in store
   * @param {StructStore} store
   * @param {GC|Item} struct
   * @param {GC|Item} newStruct
   *
   * @private
   * @function
   */
  const replaceStruct = (store, struct, newStruct) => {
      const structs = store.clients.get(struct.id.client);
      structs[(0, exports.findIndexSS)(structs, struct.id.clock)] = newStruct;
  };
  exports.replaceStruct = replaceStruct;
  /**
   * Iterate over a range of structs
   *
   * @param {Transaction} transaction
   * @param {Array<Item|GC>} structs
   * @param {number} clockStart Inclusive start
   * @param {number} len
   * @param {function(GC|Item):void} f
   *
   * @function
   */
  const iterateStructs = (transaction, structs, clockStart, len, f) => {
      if (len === 0) {
          return;
      }
      const clockEnd = clockStart + len;
      let index = (0, exports.findIndexCleanStart)(transaction, structs, clockStart);
      let struct;
      do {
          struct = structs[index++];
          if (clockEnd < struct.id.clock + struct.length) {
              (0, exports.findIndexCleanStart)(transaction, structs, clockEnd);
          }
          f(struct);
      } while (index < structs.length && structs[index].id.clock < clockEnd);
  };
  exports.iterateStructs = iterateStructs;
  });

  var logging = /*@__PURE__*/getAugmentedNamespace(logging$2);

  var Transaction_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.transact = exports.tryGc = exports.addChangedTypeToTransaction = exports.nextID = exports.writeUpdateMessageFromTransaction = exports.Transaction = void 0;






  /**
   * A transaction is created for every change on the Yjs model. It is possible
   * to bundle changes on the Yjs model in a single transaction to
   * minimize the number on messages sent and the number of observer calls.
   * If possible the user of this library should bundle as many changes as
   * possible. Here is an example to illustrate the advantages of bundling:
   *
   * @example
   * const map = y.define('map', YMap)
   * // Log content when change is triggered
   * map.observe(() => {
   *     console.log('change triggered')
   * })
   * // Each change on the map type triggers a log message:
   * map.set('a', 0) // => "change triggered"
   * map.set('b', 0) // => "change triggered"
   * // When put in a transaction, it will trigger the log after the transaction:
   * y.transact(() => {
   *     map.set('a', 1)
   *     map.set('b', 1)
   * }) // => "change triggered"
   *
   * @public
   */
  class Transaction {
      constructor(doc, origin, local) {
          /** Describes the set of deleted items by ids */
          this.deleteSet = new internals_js_1.DeleteSet();
          /** Holds the state after the transaction. */
          this.afterState = new Map();
          /**
           * All types that were directly modified (property added or child
           * inserted/deleted). New types are not included in this Set.
           * Maps from type to parentSubs (`item.parentSub = null` for YArray)
           */
          this.changed = new Map();
          /**
           * Stores the events for the types that observe also child elements.
           * It is mainly used by `observeDeep`.
           */
          this.changedParentTypes = new Map();
          /** Stores meta information on the transaction */
          this.meta = new Map();
          this.subdocsAdded = new Set();
          this.subdocsRemoved = new Set();
          this.subdocsLoaded = new Set();
          this._mergeStructs = [];
          this.doc = doc;
          this.beforeState = (0, internals_js_1.getStateVector)(doc.store);
          this.origin = origin;
          this.local = local;
      }
  }
  exports.Transaction = Transaction;
  /**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {Transaction} transaction
   * @return {boolean} Whether data was written.
   */
  const writeUpdateMessageFromTransaction = (encoder, transaction) => {
      if (transaction.deleteSet.clients.size === 0 && !map.any(transaction.afterState, (clock, client) => transaction.beforeState.get(client) !== clock)) {
          return false;
      }
      (0, internals_js_1.sortAndMergeDeleteSet)(transaction.deleteSet);
      (0, internals_js_1.writeStructsFromTransaction)(encoder, transaction);
      (0, internals_js_1.writeDeleteSet)(encoder, transaction.deleteSet);
      return true;
  };
  exports.writeUpdateMessageFromTransaction = writeUpdateMessageFromTransaction;
  /**
   * @param {Transaction} transaction
   *
   * @private
   * @function
   */
  const nextID = (transaction) => {
      const y = transaction.doc;
      return (0, internals_js_1.createID)(y.clientID, (0, internals_js_1.getState)(y.store, y.clientID));
  };
  exports.nextID = nextID;
  /**
   * If `type.parent` was added in current transaction, `type` technically
   * did not change, it was just added and we should not fire events for `type`.
   *
   * @param {Transaction} transaction
   * @param {AbstractType<YEvent<any>>} type
   * @param {string|null} parentSub
   */
  const addChangedTypeToTransaction = (transaction, type, parentSub) => {
      const item = type._item;
      if (item === null || (item.id.clock < (transaction.beforeState.get(item.id.client) || 0) && !item.deleted)) {
          map.setIfUndefined(transaction.changed, type, set.create).add(parentSub);
      }
  };
  exports.addChangedTypeToTransaction = addChangedTypeToTransaction;
  /**
   * @param {Array<AbstractStruct>} structs
   * @param {number} pos
   */
  const tryToMergeWithLeft = (structs, pos) => {
      const left = structs[pos - 1];
      const right = structs[pos];
      if (left.deleted === right.deleted && left.constructor === right.constructor) {
          if (left.mergeWith(right)) {
              structs.splice(pos, 1);
              if (right instanceof internals_js_1.Item && right.parentSub !== null && right.parent._map.get(right.parentSub) === right) {
                  right.parent._map.set(right.parentSub, left);
              }
          }
      }
  };
  /**
   * @param {DeleteSet} ds
   * @param {StructStore} store
   * @param {function(Item):boolean} gcFilter
   */
  const tryGcDeleteSet = (ds, store, gcFilter) => {
      for (const [client, deleteItems] of ds.clients.entries()) {
          const structs = store.clients.get(client);
          for (let di = deleteItems.length - 1; di >= 0; di--) {
              const deleteItem = deleteItems[di];
              const endDeleteItemClock = deleteItem.clock + deleteItem.len;
              for (let si = (0, internals_js_1.findIndexSS)(structs, deleteItem.clock), struct = structs[si]; si < structs.length && struct.id.clock < endDeleteItemClock; struct = structs[++si]) {
                  const struct = structs[si];
                  if (deleteItem.clock + deleteItem.len <= struct.id.clock) {
                      break;
                  }
                  if (struct instanceof internals_js_1.Item && struct.deleted && !struct.keep && gcFilter(struct)) {
                      struct.gc(store, false);
                  }
              }
          }
      }
  };
  /**
   * @param {DeleteSet} ds
   * @param {StructStore} store
   */
  const tryMergeDeleteSet = (ds, store) => {
      // try to merge deleted / gc'd items
      // merge from right to left for better efficiecy and so we don't miss any merge targets
      ds.clients.forEach((deleteItems, client) => {
          const structs = store.clients.get(client);
          for (let di = deleteItems.length - 1; di >= 0; di--) {
              const deleteItem = deleteItems[di];
              // start with merging the item next to the last deleted item
              const mostRightIndexToCheck = math.min(structs.length - 1, 1 + (0, internals_js_1.findIndexSS)(structs, deleteItem.clock + deleteItem.len - 1));
              for (let si = mostRightIndexToCheck, struct = structs[si]; si > 0 && struct.id.clock >= deleteItem.clock; struct = structs[--si]) {
                  tryToMergeWithLeft(structs, si);
              }
          }
      });
  };
  /**
   * @param {DeleteSet} ds
   * @param {StructStore} store
   * @param {function(Item):boolean} gcFilter
   */
  const tryGc = (ds, store, gcFilter) => {
      tryGcDeleteSet(ds, store, gcFilter);
      tryMergeDeleteSet(ds, store);
  };
  exports.tryGc = tryGc;
  /**
   * @param {Array<Transaction>} transactionCleanups
   * @param {number} i
   */
  const cleanupTransactions = (transactionCleanups, i) => {
      if (i < transactionCleanups.length) {
          const transaction = transactionCleanups[i];
          const doc = transaction.doc;
          const store = doc.store;
          const ds = transaction.deleteSet;
          const mergeStructs = transaction._mergeStructs;
          try {
              (0, internals_js_1.sortAndMergeDeleteSet)(ds);
              transaction.afterState = (0, internals_js_1.getStateVector)(transaction.doc.store);
              doc.emit('beforeObserverCalls', [transaction, doc]);
              /**
               * An array of event callbacks.
               *
               * Each callback is called even if the other ones throw errors.
               *
               * @type {Array<function():void>}
               */
              const fs = [];
              // observe events on changed types
              transaction.changed.forEach((subs, itemtype) => fs.push(() => {
                  if (itemtype._item === null || !itemtype._item.deleted) {
                      itemtype._callObserver(transaction, subs);
                  }
              }));
              fs.push(() => {
                  // deep observe events
                  transaction.changedParentTypes.forEach((events, type) => fs.push(() => {
                      // We need to think about the possibility that the user transforms the
                      // Y.Doc in the event.
                      if (type._item === null || !type._item.deleted) {
                          events = events
                              .filter(event => event.target._item === null || !event.target._item.deleted);
                          events
                              .forEach(event => {
                              event.currentTarget = type;
                          });
                          // sort events by path length so that top-level events are fired first.
                          events
                              .sort((event1, event2) => event1.path.length - event2.path.length);
                          // We don't need to check for events.length
                          // because we know it has at least one element
                          (0, internals_js_1.callEventHandlerListeners)(type._dEH, events, transaction);
                      }
                  }));
                  fs.push(() => doc.emit('afterTransaction', [transaction, doc]));
              });
              (0, function_1.callAll)(fs, []);
          }
          finally {
              // Replace deleted items with ItemDeleted / GC.
              // This is where content is actually remove from the Yjs Doc.
              if (doc.gc) {
                  tryGcDeleteSet(ds, store, doc.gcFilter);
              }
              tryMergeDeleteSet(ds, store);
              // on all affected store.clients props, try to merge
              transaction.afterState.forEach((clock, client) => {
                  const beforeClock = transaction.beforeState.get(client) || 0;
                  if (beforeClock !== clock) {
                      const structs = store.clients.get(client);
                      // we iterate from right to left so we can safely remove entries
                      const firstChangePos = math.max((0, internals_js_1.findIndexSS)(structs, beforeClock), 1);
                      for (let i = structs.length - 1; i >= firstChangePos; i--) {
                          tryToMergeWithLeft(structs, i);
                      }
                  }
              });
              // try to merge mergeStructs
              // @todo: it makes more sense to transform mergeStructs to a DS, sort it, and merge from right to left
              //                but at the moment DS does not handle duplicates
              for (let i = 0; i < mergeStructs.length; i++) {
                  const { client, clock } = mergeStructs[i].id;
                  const structs = store.clients.get(client);
                  const replacedStructPos = (0, internals_js_1.findIndexSS)(structs, clock);
                  if (replacedStructPos + 1 < structs.length) {
                      tryToMergeWithLeft(structs, replacedStructPos + 1);
                  }
                  if (replacedStructPos > 0) {
                      tryToMergeWithLeft(structs, replacedStructPos);
                  }
              }
              if (!transaction.local && transaction.afterState.get(doc.clientID) !== transaction.beforeState.get(doc.clientID)) {
                  logging.print(logging.ORANGE, logging.BOLD, '[yjs] ', logging.UNBOLD, logging.RED, 'Changed the client-id because another client seems to be using it.');
                  doc.clientID = (0, internals_js_1.generateNewClientId)();
              }
              // @todo Merge all the transactions into one and provide send the data as a single update message
              doc.emit('afterTransactionCleanup', [transaction, doc]);
              if (doc._observers.has('update')) {
                  const encoder = new internals_js_1.UpdateEncoderV1();
                  const hasContent = (0, exports.writeUpdateMessageFromTransaction)(encoder, transaction);
                  if (hasContent) {
                      doc.emit('update', [encoder.toUint8Array(), transaction.origin, doc, transaction]);
                  }
              }
              if (doc._observers.has('updateV2')) {
                  const encoder = new internals_js_1.UpdateEncoderV2();
                  const hasContent = (0, exports.writeUpdateMessageFromTransaction)(encoder, transaction);
                  if (hasContent) {
                      doc.emit('updateV2', [encoder.toUint8Array(), transaction.origin, doc, transaction]);
                  }
              }
              const { subdocsAdded, subdocsLoaded, subdocsRemoved } = transaction;
              if (subdocsAdded.size > 0 || subdocsRemoved.size > 0 || subdocsLoaded.size > 0) {
                  subdocsAdded.forEach(subdoc => {
                      subdoc.clientID = doc.clientID;
                      if (subdoc.collectionid == null) {
                          subdoc.collectionid = doc.collectionid;
                      }
                      doc.subdocs.add(subdoc);
                  });
                  subdocsRemoved.forEach(subdoc => doc.subdocs.delete(subdoc));
                  doc.emit('subdocs', [{ loaded: subdocsLoaded, added: subdocsAdded, removed: subdocsRemoved }, doc, transaction]);
                  subdocsRemoved.forEach(subdoc => subdoc.destroy());
              }
              if (transactionCleanups.length <= i + 1) {
                  doc._transactionCleanups = [];
                  doc.emit('afterAllTransactions', [doc, transactionCleanups]);
              }
              else {
                  cleanupTransactions(transactionCleanups, i + 1);
              }
          }
      }
  };
  /**
   * Implements the functionality of `y.transact(()=>{..})`
   *
   * @param {Doc} doc
   * @param {function(Transaction):void} f
   * @param {any} [origin=true]
   *
   * @function
   */
  const transact = (doc, f, origin = null, local = true) => {
      const transactionCleanups = doc._transactionCleanups;
      let initialCall = false;
      if (doc._transaction === null) {
          initialCall = true;
          doc._transaction = new Transaction(doc, origin, local);
          transactionCleanups.push(doc._transaction);
          if (transactionCleanups.length === 1) {
              doc.emit('beforeAllTransactions', [doc]);
          }
          doc.emit('beforeTransaction', [doc._transaction, doc]);
      }
      try {
          f(doc._transaction);
      }
      finally {
          if (initialCall) {
              const finishCleanup = doc._transaction === transactionCleanups[0];
              doc._transaction = null;
              if (finishCleanup) {
                  // The first transaction ended, now process observer calls.
                  // Observer call may create new transactions for which we need to call the observers and do cleanup.
                  // We don't want to nest these calls, so we execute these calls one after
                  // another.
                  // Also we need to ensure that all cleanups are called, even if the
                  // observes throw errors.
                  // This file is full of hacky try {} finally {} blocks to ensure that an
                  // event can throw errors and also that the cleanup is called.
                  cleanupTransactions(transactionCleanups, 0);
              }
          }
      }
  };
  exports.transact = transact;
  });

  var time = /*@__PURE__*/getAugmentedNamespace(time$1);

  var UndoManager_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.UndoManager = void 0;




  class StackItem {
      constructor(deletions, insertions) {
          this.insertions = insertions;
          this.deletions = deletions;
          this.meta = new Map();
      }
  }
  const clearUndoManagerStackItem = (tr, um, stackItem) => {
      (0, internals_js_1.iterateDeletedStructs)(tr, stackItem.deletions, item => {
          if (item instanceof internals_js_1.Item && um.scope.some(type => (0, internals_js_1.isParentOf)(type, item))) {
              (0, internals_js_1.keepItem)(item, false);
          }
      });
  };
  const popStackItem = (undoManager, stack, eventType) => {
      /** Whether a change happened */
      let result = null;
      /** Keep a reference to the transaction so we can fire the event with the changedParentTypes */
      let _tr = null;
      const doc = undoManager.doc;
      const scope = undoManager.scope;
      (0, internals_js_1.transact)(doc, transaction => {
          while (stack.length > 0 && result === null) {
              const store = doc.store;
              const stackItem = stack.pop();
              const itemsToRedo = new Set();
              const itemsToDelete = [];
              let performedChange = false;
              (0, internals_js_1.iterateDeletedStructs)(transaction, stackItem.insertions, struct => {
                  if (struct instanceof internals_js_1.Item) {
                      if (struct.redone !== null) {
                          let { item, diff } = (0, internals_js_1.followRedone)(store, struct.id);
                          if (diff > 0) {
                              item = (0, internals_js_1.getItemCleanStart)(transaction, (0, internals_js_1.createID)(item.id.client, item.id.clock + diff));
                          }
                          struct = item;
                      }
                      if (!struct.deleted && scope.some(type => (0, internals_js_1.isParentOf)(type, struct))) {
                          itemsToDelete.push(struct);
                      }
                  }
              });
              (0, internals_js_1.iterateDeletedStructs)(transaction, stackItem.deletions, struct => {
                  if (struct instanceof internals_js_1.Item &&
                      scope.some(type => (0, internals_js_1.isParentOf)(type, struct)) &&
                      // Never redo structs in stackItem.insertions because they were created and deleted in the same capture interval.
                      !(0, internals_js_1.isDeleted)(stackItem.insertions, struct.id)) {
                      itemsToRedo.add(struct);
                  }
              });
              itemsToRedo.forEach(struct => {
                  performedChange = (0, internals_js_1.redoItem)(transaction, struct, itemsToRedo, stackItem.insertions, undoManager.ignoreRemoteMapChanges) !== null || performedChange;
              });
              // We want to delete in reverse order so that children are deleted before
              // parents, so we have more information available when items are filtered.
              for (let i = itemsToDelete.length - 1; i >= 0; i--) {
                  const item = itemsToDelete[i];
                  if (undoManager.deleteFilter(item)) {
                      item.delete(transaction);
                      performedChange = true;
                  }
              }
              result = performedChange ? stackItem : null;
          }
          transaction.changed.forEach((subProps, type) => {
              // destroy search marker if necessary
              if (subProps.has(null) && type._searchMarker) {
                  type._searchMarker.length = 0;
              }
          });
          _tr = transaction;
      }, undoManager);
      if (result != null) {
          const changedParentTypes = _tr.changedParentTypes;
          undoManager.emit('stack-item-popped', [{ stackItem: result, type: eventType, changedParentTypes }, undoManager]);
      }
      return result;
  };
  /**
   * Fires 'stack-item-added' event when a stack item was added to either the undo- or
   * the redo-stack. You may store additional stack information via the
   * metadata property on `event.stackItem.meta` (it is a `Map` of metadata properties).
   * Fires 'stack-item-popped' event when a stack item was popped from either the
   * undo- or the redo-stack. You may restore the saved stack information from `event.stackItem.meta`.
   *
   * @extends {Observable<'stack-item-added'|'stack-item-popped'|'stack-cleared'|'stack-item-updated'>}
   */
  class UndoManager extends observable_1.Observable {
      /**
       * @param {AbstractType<any>|Array<AbstractType<any>>} typeScope Accepts either a single type, or an array of types
       * @param {UndoManagerOptions} options
       */
      constructor(typeScope, { captureTimeout = 500, captureTransaction = tr => true, deleteFilter = () => true, trackedOrigins = new Set([null]), ignoreRemoteMapChanges = false, doc = (array.isArray(typeScope) ? typeScope[0].doc : typeScope.doc) } = {}) {
          super();
          this.scope = [];
          this.addToScope(typeScope);
          this.deleteFilter = deleteFilter;
          trackedOrigins.add(this);
          this.trackedOrigins = trackedOrigins;
          this.captureTransaction = captureTransaction;
          this.undoStack = [];
          this.redoStack = [];
          /**
           * Whether the client is currently undoing (calling UndoManager.undo)
           *
           * @type {boolean}
           */
          this.undoing = false;
          this.redoing = false;
          this.doc = doc;
          this.lastChange = 0;
          this.ignoreRemoteMapChanges = ignoreRemoteMapChanges;
          this.captureTimeout = captureTimeout;
          /**
           * @param {Transaction} transaction
           */
          this.afterTransactionHandler = (transaction) => {
              // Only track certain transactions
              if (!this.captureTransaction(transaction) ||
                  !this.scope.some(type => transaction.changedParentTypes.has(type)) ||
                  (!this.trackedOrigins.has(transaction.origin) && (!transaction.origin || !this.trackedOrigins.has(transaction.origin.constructor)))) {
                  return;
              }
              const undoing = this.undoing;
              const redoing = this.redoing;
              const stack = undoing ? this.redoStack : this.undoStack;
              if (undoing) {
                  this.stopCapturing(); // next undo should not be appended to last stack item
              }
              else if (!redoing) {
                  // neither undoing nor redoing: delete redoStack
                  this.clear(false, true);
              }
              const insertions = new internals_js_1.DeleteSet();
              transaction.afterState.forEach((endClock, client) => {
                  const startClock = transaction.beforeState.get(client) || 0;
                  const len = endClock - startClock;
                  if (len > 0) {
                      (0, internals_js_1.addToDeleteSet)(insertions, client, startClock, len);
                  }
              });
              const now = time.getUnixTime();
              let didAdd = false;
              if (this.lastChange > 0 && now - this.lastChange < this.captureTimeout && stack.length > 0 && !undoing && !redoing) {
                  // append change to last stack op
                  const lastOp = stack[stack.length - 1];
                  lastOp.deletions = (0, internals_js_1.mergeDeleteSets)([lastOp.deletions, transaction.deleteSet]);
                  lastOp.insertions = (0, internals_js_1.mergeDeleteSets)([lastOp.insertions, insertions]);
              }
              else {
                  // create a new stack op
                  stack.push(new StackItem(transaction.deleteSet, insertions));
                  didAdd = true;
              }
              if (!undoing && !redoing) {
                  this.lastChange = now;
              }
              // make sure that deleted structs are not gc'd
              (0, internals_js_1.iterateDeletedStructs)(transaction, transaction.deleteSet, /** @param {Item|GC} item */ /** @param {Item|GC} item */ item => {
                  if (item instanceof internals_js_1.Item && this.scope.some(type => (0, internals_js_1.isParentOf)(type, item))) {
                      (0, internals_js_1.keepItem)(item, true);
                  }
              });
              const changeEvent = [{ stackItem: stack[stack.length - 1], origin: transaction.origin, type: undoing ? 'redo' : 'undo', changedParentTypes: transaction.changedParentTypes }, this];
              if (didAdd) {
                  this.emit('stack-item-added', changeEvent);
              }
              else {
                  this.emit('stack-item-updated', changeEvent);
              }
          };
          this.doc.on('afterTransaction', this.afterTransactionHandler);
          this.doc.on('destroy', () => {
              this.destroy();
          });
      }
      addToScope(ytypes) {
          ytypes = array.isArray(ytypes) ? ytypes : [ytypes];
          ytypes.forEach(ytype => {
              if (this.scope.every(yt => yt !== ytype)) {
                  this.scope.push(ytype);
              }
          });
      }
      addTrackedOrigin(origin) {
          this.trackedOrigins.add(origin);
      }
      removeTrackedOrigin(origin) {
          this.trackedOrigins.delete(origin);
      }
      clear(clearUndoStack = true, clearRedoStack = true) {
          if ((clearUndoStack && this.canUndo()) || (clearRedoStack && this.canRedo())) {
              this.doc.transact(tr => {
                  if (clearUndoStack) {
                      this.undoStack.forEach(item => clearUndoManagerStackItem(tr, this, item));
                      this.undoStack = [];
                  }
                  if (clearRedoStack) {
                      this.redoStack.forEach(item => clearUndoManagerStackItem(tr, this, item));
                      this.redoStack = [];
                  }
                  this.emit('stack-cleared', [{ undoStackCleared: clearUndoStack, redoStackCleared: clearRedoStack }]);
              });
          }
      }
      /**
       * UndoManager merges Undo-StackItem if they are created within time-gap
       * smaller than `options.captureTimeout`. Call `um.stopCapturing()` so that the next
       * StackItem won't be merged.
       *
       *
       * @example
       *         // without stopCapturing
       *         ytext.insert(0, 'a')
       *         ytext.insert(1, 'b')
       *         um.undo()
       *         ytext.toString() // => '' (note that 'ab' was removed)
       *         // with stopCapturing
       *         ytext.insert(0, 'a')
       *         um.stopCapturing()
       *         ytext.insert(0, 'b')
       *         um.undo()
       *         ytext.toString() // => 'a' (note that only 'b' was removed)
       *
       */
      stopCapturing() {
          this.lastChange = 0;
      }
      /**
       * Undo last changes on type.
       *
       * @return {StackItem?} Returns StackItem if a change was applied
       */
      undo() {
          this.undoing = true;
          let res;
          try {
              res = popStackItem(this, this.undoStack, 'undo');
          }
          finally {
              this.undoing = false;
          }
          return res;
      }
      /**
       * Redo last undo operation.
       *
       * @return {StackItem?} Returns StackItem if a change was applied
       */
      redo() {
          this.redoing = true;
          let res;
          try {
              res = popStackItem(this, this.redoStack, 'redo');
          }
          finally {
              this.redoing = false;
          }
          return res;
      }
      /**
       * Are undo steps available?
       *
       * @return {boolean} `true` if undo is possible
       */
      canUndo() {
          return this.undoStack.length > 0;
      }
      /**
       * Are redo steps available?
       *
       * @return {boolean} `true` if redo is possible
       */
      canRedo() {
          return this.redoStack.length > 0;
      }
      destroy() {
          this.trackedOrigins.delete(this);
          this.doc.off('afterTransaction', this.afterTransactionHandler);
          super.destroy();
      }
  }
  exports.UndoManager = UndoManager;
  });

  var updates = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.convertUpdateFormatV2ToV1 = exports.convertUpdateFormatV1ToV2 = exports.convertUpdateFormat = exports.diffUpdate = exports.diffUpdateV2 = exports.mergeUpdatesV2 = exports.parseUpdateMeta = exports.parseUpdateMetaV2 = exports.encodeStateVectorFromUpdate = exports.encodeStateVectorFromUpdateV2 = exports.mergeUpdates = exports.LazyStructWriter = exports.decodeUpdateV2 = exports.decodeUpdate = exports.logUpdateV2 = exports.logUpdate = exports.LazyStructReader = void 0;






  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   */
  function* lazyStructReaderGenerator(decoder) {
      const numOfStateUpdates = decoding.readVarUint(decoder.restDecoder);
      for (let i = 0; i < numOfStateUpdates; i++) {
          const numberOfStructs = decoding.readVarUint(decoder.restDecoder);
          const client = decoder.readClient();
          let clock = decoding.readVarUint(decoder.restDecoder);
          for (let i = 0; i < numberOfStructs; i++) {
              const info = decoder.readInfo();
              // @todo use switch instead of ifs
              if (info === 10) {
                  const len = decoding.readVarUint(decoder.restDecoder);
                  yield new internals_js_1.Skip((0, internals_js_1.createID)(client, clock), len);
                  clock += len;
              }
              else if ((binary.BITS5 & info) !== 0) {
                  const cantCopyParentInfo = (info & (binary.BIT7 | binary.BIT8)) === 0;
                  // If parent = null and neither left nor right are defined, then we know that `parent` is child of `y`
                  // and we read the next string as parentYKey.
                  // It indicates how we store/retrieve parent from `y.share`
                  // @type {string|null}
                  const struct = new internals_js_1.Item((0, internals_js_1.createID)(client, clock), null, // left
                  (info & binary.BIT8) === binary.BIT8 ? decoder.readLeftID() : null, // origin
                  null, // right
                  (info & binary.BIT7) === binary.BIT7 ? decoder.readRightID() : null, // right origin
                  // @ts-ignore Force writing a string here.
                  cantCopyParentInfo ? (decoder.readParentInfo() ? decoder.readString() : decoder.readLeftID()) : null, // parent
                  cantCopyParentInfo && (info & binary.BIT6) === binary.BIT6 ? decoder.readString() : null, // parentSub
                  (0, internals_js_1.readItemContent)(decoder, info) // item content
                  );
                  yield struct;
                  clock += struct.length;
              }
              else {
                  const len = decoder.readLen();
                  yield new internals_js_1.GC((0, internals_js_1.createID)(client, clock), len);
                  clock += len;
              }
          }
      }
  }
  class LazyStructReader {
      /**
       * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
       * @param {boolean} filterSkips
       */
      constructor(decoder, filterSkips) {
          this.gen = lazyStructReaderGenerator(decoder);
          /**
           * @type {null | Item | Skip | GC}
           */
          this.curr = null;
          this.done = false;
          this.filterSkips = filterSkips;
          this.next();
      }
      /**
       * @return {Item | GC | Skip |null}
       */
      next() {
          // ignore "Skip" structs
          do {
              this.curr = this.gen.next().value || null;
          } while (this.filterSkips && this.curr !== null && this.curr.constructor === internals_js_1.Skip);
          return this.curr;
      }
  }
  exports.LazyStructReader = LazyStructReader;
  /**
   * @param {Uint8Array} update
   *
   */
  const logUpdate = (update) => (0, exports.logUpdateV2)(update, internals_js_1.UpdateDecoderV1);
  exports.logUpdate = logUpdate;
  /**
   * @param {Uint8Array} update
   * @param {typeof UpdateDecoderV2 | typeof UpdateDecoderV1} [YDecoder]
   *
   */
  const logUpdateV2 = (update, YDecoder = internals_js_1.UpdateDecoderV2) => {
      const structs = [];
      const updateDecoder = new YDecoder(decoding.createDecoder(update));
      const lazyDecoder = new LazyStructReader(updateDecoder, false);
      for (let curr = lazyDecoder.curr; curr !== null; curr = lazyDecoder.next()) {
          structs.push(curr);
      }
      logging.print('Structs: ', structs);
      const ds = (0, internals_js_1.readDeleteSet)(updateDecoder);
      logging.print('DeleteSet: ', ds);
  };
  exports.logUpdateV2 = logUpdateV2;
  /**
   * @param {Uint8Array} update
   *
   */
  const decodeUpdate = (update) => (0, exports.decodeUpdateV2)(update, internals_js_1.UpdateDecoderV1);
  exports.decodeUpdate = decodeUpdate;
  /**
   * @param {Uint8Array} update
   * @param {typeof UpdateDecoderV2 | typeof UpdateDecoderV1} [YDecoder]
   *
   */
  const decodeUpdateV2 = (update, YDecoder = internals_js_1.UpdateDecoderV2) => {
      const structs = [];
      const updateDecoder = new YDecoder(decoding.createDecoder(update));
      const lazyDecoder = new LazyStructReader(updateDecoder, false);
      for (let curr = lazyDecoder.curr; curr !== null; curr = lazyDecoder.next()) {
          structs.push(curr);
      }
      return {
          structs,
          ds: (0, internals_js_1.readDeleteSet)(updateDecoder)
      };
  };
  exports.decodeUpdateV2 = decodeUpdateV2;
  class LazyStructWriter {
      /**
       * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
       */
      constructor(encoder) {
          this.currClient = 0;
          this.startClock = 0;
          this.written = 0;
          this.encoder = encoder;
          /**
           * We want to write operations lazily, but also we need to know beforehand how many operations we want to write for each client.
           *
           * This kind of meta-information (#clients, #structs-per-client-written) is written to the restEncoder.
           *
           * We fragment the restEncoder and store a slice of it per-client until we know how many clients there are.
           * When we flush (toUint8Array) we write the restEncoder using the fragments and the meta-information.
           *
           * @type {Array<{ written: number, restEncoder: Uint8Array }>}
           */
          this.clientStructs = [];
      }
  }
  exports.LazyStructWriter = LazyStructWriter;
  /**
   * @param {Array<Uint8Array>} updates
   * @return {Uint8Array}
   */
  const mergeUpdates = (updates) => (0, exports.mergeUpdatesV2)(updates, internals_js_1.UpdateDecoderV1, internals_js_1.UpdateEncoderV1);
  exports.mergeUpdates = mergeUpdates;
  /**
   * @param {Uint8Array} update
   * @param {typeof DSEncoderV1 | typeof DSEncoderV2} YEncoder
   * @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} YDecoder
   * @return {Uint8Array}
   */
  const encodeStateVectorFromUpdateV2 = (update, YEncoder = internals_js_1.DSEncoderV2, YDecoder = internals_js_1.UpdateDecoderV2) => {
      const encoder = new YEncoder();
      const updateDecoder = new LazyStructReader(new YDecoder(decoding.createDecoder(update)), false);
      let curr = updateDecoder.curr;
      if (curr !== null) {
          let size = 0;
          let currClient = curr.id.client;
          let stopCounting = curr.id.clock !== 0; // must start at 0
          let currClock = stopCounting ? 0 : curr.id.clock + curr.length;
          for (; curr !== null; curr = updateDecoder.next()) {
              if (currClient !== curr.id.client) {
                  if (currClock !== 0) {
                      size++;
                      // We found a new client
                      // write what we have to the encoder
                      encoding.writeVarUint(encoder.restEncoder, currClient);
                      encoding.writeVarUint(encoder.restEncoder, currClock);
                  }
                  currClient = curr.id.client;
                  currClock = 0;
                  stopCounting = curr.id.clock !== 0;
              }
              // we ignore skips
              if (curr.constructor === internals_js_1.Skip) {
                  stopCounting = true;
              }
              if (!stopCounting) {
                  currClock = curr.id.clock + curr.length;
              }
          }
          // write what we have
          if (currClock !== 0) {
              size++;
              encoding.writeVarUint(encoder.restEncoder, currClient);
              encoding.writeVarUint(encoder.restEncoder, currClock);
          }
          // prepend the size of the state vector
          const enc = encoding.createEncoder();
          encoding.writeVarUint(enc, size);
          encoding.writeBinaryEncoder(enc, encoder.restEncoder);
          encoder.restEncoder = enc;
          return encoder.toUint8Array();
      }
      else {
          encoding.writeVarUint(encoder.restEncoder, 0);
          return encoder.toUint8Array();
      }
  };
  exports.encodeStateVectorFromUpdateV2 = encodeStateVectorFromUpdateV2;
  /**
   * @param {Uint8Array} update
   * @return {Uint8Array}
   */
  const encodeStateVectorFromUpdate = (update) => (0, exports.encodeStateVectorFromUpdateV2)(update, internals_js_1.DSEncoderV1, internals_js_1.UpdateDecoderV1);
  exports.encodeStateVectorFromUpdate = encodeStateVectorFromUpdate;
  /**
   * @param {Uint8Array} update
   * @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} YDecoder
   * @return {{ from: Map<number,number>, to: Map<number,number> }}
   */
  const parseUpdateMetaV2 = (update, YDecoder = internals_js_1.UpdateDecoderV2) => {
      /**
       * @type {Map<number, number>}
       */
      const from = new Map();
      /**
       * @type {Map<number, number>}
       */
      const to = new Map();
      const updateDecoder = new LazyStructReader(new YDecoder(decoding.createDecoder(update)), false);
      let curr = updateDecoder.curr;
      if (curr !== null) {
          let currClient = curr.id.client;
          let currClock = curr.id.clock;
          // write the beginning to `from`
          from.set(currClient, currClock);
          for (; curr !== null; curr = updateDecoder.next()) {
              if (currClient !== curr.id.client) {
                  // We found a new client
                  // write the end to `to`
                  to.set(currClient, currClock);
                  // write the beginning to `from`
                  from.set(curr.id.client, curr.id.clock);
                  // update currClient
                  currClient = curr.id.client;
              }
              currClock = curr.id.clock + curr.length;
          }
          // write the end to `to`
          to.set(currClient, currClock);
      }
      return { from, to };
  };
  exports.parseUpdateMetaV2 = parseUpdateMetaV2;
  /**
   * @param {Uint8Array} update
   * @return {{ from: Map<number,number>, to: Map<number,number> }}
   */
  const parseUpdateMeta = (update) => (0, exports.parseUpdateMetaV2)(update, internals_js_1.UpdateDecoderV1);
  exports.parseUpdateMeta = parseUpdateMeta;
  /**
   * This method is intended to slice any kind of struct and retrieve the right part.
   * It does not handle side-effects, so it should only be used by the lazy-encoder.
   *
   * @param {Item | GC | Skip} left
   * @param {number} diff
   * @return {Item | GC}
   */
  const sliceStruct = (left, diff) => {
      if (left.constructor === internals_js_1.GC) {
          const { client, clock } = left.id;
          return new internals_js_1.GC((0, internals_js_1.createID)(client, clock + diff), left.length - diff);
      }
      else if (left.constructor === internals_js_1.Skip) {
          const { client, clock } = left.id;
          return new internals_js_1.Skip((0, internals_js_1.createID)(client, clock + diff), left.length - diff);
      }
      else {
          const leftItem = left;
          const { client, clock } = leftItem.id;
          return new internals_js_1.Item((0, internals_js_1.createID)(client, clock + diff), null, (0, internals_js_1.createID)(client, clock + diff - 1), null, leftItem.rightOrigin, leftItem.parent, leftItem.parentSub, leftItem.content.splice(diff));
      }
  };
  /**
   *
   * This function works similarly to `readUpdateV2`.
   *
   * @param {Array<Uint8Array>} updates
   * @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} [YDecoder]
   * @param {typeof UpdateEncoderV1 | typeof UpdateEncoderV2} [YEncoder]
   * @return {Uint8Array}
   */
  const mergeUpdatesV2 = (updates, YDecoder = internals_js_1.UpdateDecoderV2, YEncoder = internals_js_1.UpdateEncoderV2) => {
      if (updates.length === 1) {
          return updates[0];
      }
      const updateDecoders = updates.map(update => new YDecoder(decoding.createDecoder(update)));
      let lazyStructDecoders = updateDecoders.map(decoder => new LazyStructReader(decoder, true));
      /**
       * @todo we don't need offset because we always slice before
       * @type {null | { struct: Item | GC | Skip, offset: number }}
       */
      let currWrite = null;
      const updateEncoder = new YEncoder();
      // write structs lazily
      const lazyStructEncoder = new LazyStructWriter(updateEncoder);
      // Note: We need to ensure that all lazyStructDecoders are fully consumed
      // Note: Should merge document updates whenever possible - even from different updates
      // Note: Should handle that some operations cannot be applied yet ()
      while (true) {
          // Write higher clients first ⇒ sort by clientID & clock and remove decoders without content
          lazyStructDecoders = lazyStructDecoders.filter(dec => dec.curr !== null);
          lazyStructDecoders.sort((dec1, dec2) => {
              if (dec1.curr.id.client === dec2.curr.id.client) {
                  const clockDiff = dec1.curr.id.clock - dec2.curr.id.clock;
                  if (clockDiff === 0) {
                      // @todo remove references to skip since the structDecoders must filter Skips.
                      return dec1.curr.constructor === dec2.curr.constructor
                          ? 0
                          : dec1.curr.constructor === internals_js_1.Skip ? 1 : -1; // we are filtering skips anyway.
                  }
                  else {
                      return clockDiff;
                  }
              }
              else {
                  return dec2.curr.id.client - dec1.curr.id.client;
              }
          });
          if (lazyStructDecoders.length === 0) {
              break;
          }
          const currDecoder = lazyStructDecoders[0];
          // write from currDecoder until the next operation is from another client or if filler-struct
          // then we need to reorder the decoders and find the next operation to write
          const firstClient = currDecoder.curr.id.client;
          if (currWrite !== null) {
              let curr = (currDecoder.curr);
              let iterated = false;
              // iterate until we find something that we haven't written already
              // remember: first the high client-ids are written
              while (curr !== null && curr.id.clock + curr.length <= currWrite.struct.id.clock + currWrite.struct.length && curr.id.client >= currWrite.struct.id.client) {
                  curr = currDecoder.next();
                  iterated = true;
              }
              if (curr === null || // current decoder is empty
                  curr.id.client !== firstClient || // check whether there is another decoder that has has updates from `firstClient`
                  (iterated && curr.id.clock > currWrite.struct.id.clock + currWrite.struct.length) // the above while loop was used and we are potentially missing updates
              ) {
                  continue;
              }
              if (firstClient !== currWrite.struct.id.client) {
                  writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
                  currWrite = { struct: curr, offset: 0 };
                  currDecoder.next();
              }
              else {
                  if (currWrite.struct.id.clock + currWrite.struct.length < curr.id.clock) {
                      // @todo write currStruct & set currStruct = Skip(clock = currStruct.id.clock + currStruct.length, length = curr.id.clock - self.clock)
                      if (currWrite.struct.constructor === internals_js_1.Skip) {
                          // extend existing skip
                          currWrite.struct.length = curr.id.clock + curr.length - currWrite.struct.id.clock;
                      }
                      else {
                          writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
                          const diff = curr.id.clock - currWrite.struct.id.clock - currWrite.struct.length;
                          /**
                           * @type {Skip}
                           */
                          const struct = new internals_js_1.Skip((0, internals_js_1.createID)(firstClient, currWrite.struct.id.clock + currWrite.struct.length), diff);
                          currWrite = { struct, offset: 0 };
                      }
                  }
                  else { // if (currWrite.struct.id.clock + currWrite.struct.length >= curr.id.clock) {
                      const diff = currWrite.struct.id.clock + currWrite.struct.length - curr.id.clock;
                      if (diff > 0) {
                          if (currWrite.struct.constructor === internals_js_1.Skip) {
                              // prefer to slice Skip because the other struct might contain more information
                              currWrite.struct.length -= diff;
                          }
                          else {
                              curr = sliceStruct(curr, diff);
                          }
                      }
                      if (!currWrite.struct.mergeWith(curr)) {
                          writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
                          currWrite = { struct: curr, offset: 0 };
                          currDecoder.next();
                      }
                  }
              }
          }
          else {
              currWrite = { struct: currDecoder.curr, offset: 0 };
              currDecoder.next();
          }
          for (let next = currDecoder.curr; next !== null && next.id.client === firstClient && next.id.clock === currWrite.struct.id.clock + currWrite.struct.length && next.constructor !== internals_js_1.Skip; next = currDecoder.next()) {
              writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
              currWrite = { struct: next, offset: 0 };
          }
      }
      if (currWrite !== null) {
          writeStructToLazyStructWriter(lazyStructEncoder, currWrite.struct, currWrite.offset);
          currWrite = null;
      }
      finishLazyStructWriting(lazyStructEncoder);
      const dss = updateDecoders.map(decoder => (0, internals_js_1.readDeleteSet)(decoder));
      const ds = (0, internals_js_1.mergeDeleteSets)(dss);
      (0, internals_js_1.writeDeleteSet)(updateEncoder, ds);
      return updateEncoder.toUint8Array();
  };
  exports.mergeUpdatesV2 = mergeUpdatesV2;
  /**
   * @param {Uint8Array} update
   * @param {Uint8Array} sv
   * @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} [YDecoder]
   * @param {typeof UpdateEncoderV1 | typeof UpdateEncoderV2} [YEncoder]
   */
  const diffUpdateV2 = (update, sv, YDecoder = internals_js_1.UpdateDecoderV2, YEncoder = internals_js_1.UpdateEncoderV2) => {
      const state = (0, internals_js_1.decodeStateVector)(sv);
      const encoder = new YEncoder();
      const lazyStructWriter = new LazyStructWriter(encoder);
      const decoder = new YDecoder(decoding.createDecoder(update));
      const reader = new LazyStructReader(decoder, false);
      while (reader.curr) {
          const curr = reader.curr;
          const currClient = curr.id.client;
          const svClock = state.get(currClient) || 0;
          if (reader.curr.constructor === internals_js_1.Skip) {
              // the first written struct shouldn't be a skip
              reader.next();
              continue;
          }
          if (curr.id.clock + curr.length > svClock) {
              writeStructToLazyStructWriter(lazyStructWriter, curr, math.max(svClock - curr.id.clock, 0));
              reader.next();
              while (reader.curr && reader.curr.id.client === currClient) {
                  writeStructToLazyStructWriter(lazyStructWriter, reader.curr, 0);
                  reader.next();
              }
          }
          else {
              // read until something new comes up
              while (reader.curr && reader.curr.id.client === currClient && reader.curr.id.clock + reader.curr.length <= svClock) {
                  reader.next();
              }
          }
      }
      finishLazyStructWriting(lazyStructWriter);
      // write ds
      const ds = (0, internals_js_1.readDeleteSet)(decoder);
      (0, internals_js_1.writeDeleteSet)(encoder, ds);
      return encoder.toUint8Array();
  };
  exports.diffUpdateV2 = diffUpdateV2;
  /**
   * @param {Uint8Array} update
   * @param {Uint8Array} sv
   */
  const diffUpdate = (update, sv) => (0, exports.diffUpdateV2)(update, sv, internals_js_1.UpdateDecoderV1, internals_js_1.UpdateEncoderV1);
  exports.diffUpdate = diffUpdate;
  /**
   * @param {LazyStructWriter} lazyWriter
   */
  const flushLazyStructWriter = (lazyWriter) => {
      if (lazyWriter.written > 0) {
          lazyWriter.clientStructs.push({ written: lazyWriter.written, restEncoder: encoding.toUint8Array(lazyWriter.encoder.restEncoder) });
          lazyWriter.encoder.restEncoder = encoding.createEncoder();
          lazyWriter.written = 0;
      }
  };
  /**
   * @param {LazyStructWriter} lazyWriter
   * @param {Item | GC} struct
   * @param {number} offset
   */
  const writeStructToLazyStructWriter = (lazyWriter, struct, offset) => {
      // flush curr if we start another client
      if (lazyWriter.written > 0 && lazyWriter.currClient !== struct.id.client) {
          flushLazyStructWriter(lazyWriter);
      }
      if (lazyWriter.written === 0) {
          lazyWriter.currClient = struct.id.client;
          // write next client
          lazyWriter.encoder.writeClient(struct.id.client);
          // write startClock
          encoding.writeVarUint(lazyWriter.encoder.restEncoder, struct.id.clock + offset);
      }
      struct.write(lazyWriter.encoder, offset);
      lazyWriter.written++;
  };
  /**
   * Call this function when we collected all parts and want to
   * put all the parts together. After calling this method,
   * you can continue using the UpdateEncoder.
   *
   * @param {LazyStructWriter} lazyWriter
   */
  const finishLazyStructWriting = (lazyWriter) => {
      flushLazyStructWriter(lazyWriter);
      // this is a fresh encoder because we called flushCurr
      const restEncoder = lazyWriter.encoder.restEncoder;
      /**
       * Now we put all the fragments together.
       * This works similarly to `writeClientsStructs`
       */
      // write # states that were updated - i.e. the clients
      encoding.writeVarUint(restEncoder, lazyWriter.clientStructs.length);
      for (let i = 0; i < lazyWriter.clientStructs.length; i++) {
          const partStructs = lazyWriter.clientStructs[i];
          /**
           * Works similarly to `writeStructs`
           */
          // write # encoded structs
          encoding.writeVarUint(restEncoder, partStructs.written);
          // write the rest of the fragment
          encoding.writeUint8Array(restEncoder, partStructs.restEncoder);
      }
  };
  /**
   * @param {Uint8Array} update
   * @param {typeof UpdateDecoderV2 | typeof UpdateDecoderV1} YDecoder
   * @param {typeof UpdateEncoderV2 | typeof UpdateEncoderV1 } YEncoder
   */
  const convertUpdateFormat = (update, YDecoder, YEncoder) => {
      const updateDecoder = new YDecoder(decoding.createDecoder(update));
      const lazyDecoder = new LazyStructReader(updateDecoder, false);
      const updateEncoder = new YEncoder();
      const lazyWriter = new LazyStructWriter(updateEncoder);
      for (let curr = lazyDecoder.curr; curr !== null; curr = lazyDecoder.next()) {
          writeStructToLazyStructWriter(lazyWriter, curr, 0);
      }
      finishLazyStructWriting(lazyWriter);
      const ds = (0, internals_js_1.readDeleteSet)(updateDecoder);
      (0, internals_js_1.writeDeleteSet)(updateEncoder, ds);
      return updateEncoder.toUint8Array();
  };
  exports.convertUpdateFormat = convertUpdateFormat;
  /**
   * @param {Uint8Array} update
   */
  const convertUpdateFormatV1ToV2 = (update) => (0, exports.convertUpdateFormat)(update, internals_js_1.UpdateDecoderV1, internals_js_1.UpdateEncoderV2);
  exports.convertUpdateFormatV1ToV2 = convertUpdateFormatV1ToV2;
  /**
   * @param {Uint8Array} update
   */
  const convertUpdateFormatV2ToV1 = (update) => (0, exports.convertUpdateFormat)(update, internals_js_1.UpdateDecoderV2, internals_js_1.UpdateEncoderV1);
  exports.convertUpdateFormatV2ToV1 = convertUpdateFormatV2ToV1;
  });

  var YEvent_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.YEvent = void 0;



  /** YEvent describes the changes on a YType. */
  class YEvent {
      /**
       * @param {T} target The changed type.
       * @param {Transaction} transaction
       */
      constructor(target, transaction) {
          this.target = target;
          this.currentTarget = target;
          this.transaction = transaction;
          this._changes = null;
          this._keys = null;
          this._delta = null;
      }
      /**
       * Computes the path from `y` to the changed type.
       *
       * @todo v14 should standardize on path: Array<{parent, index}> because that is easier to work with.
       *
       * The following property holds:
       * @example
       *     let type = y
       *     event.path.forEach(dir => {
       *         type = type.get(dir)
       *     })
       *     type === event.target // => true
       */
      get path() {
          // @ts-ignore _item is defined because target is integrated
          return getPathTo(this.currentTarget, this.target);
      }
      /**
       * Check if a struct is deleted by this event.
       *
       * In contrast to change.deleted, this method also returns true if the struct was added and then deleted.
       *
       * @param {AbstractStruct} struct
       * @return {boolean}
       */
      deletes(struct) {
          return (0, internals_js_1.isDeleted)(this.transaction.deleteSet, struct.id);
      }
      get keys() {
          if (this._keys === null) {
              const keys = new Map();
              const target = this.target;
              const changed = this.transaction.changed.get(target);
              changed.forEach(key => {
                  if (key !== null) {
                      const item = target._map.get(key);
                      let action;
                      let oldValue;
                      if (this.adds(item)) {
                          let prev = item.left;
                          while (prev !== null && this.adds(prev)) {
                              prev = prev.left;
                          }
                          if (this.deletes(item)) {
                              if (prev !== null && this.deletes(prev)) {
                                  action = 'delete';
                                  oldValue = array.last(prev.content.getContent());
                              }
                              else {
                                  return;
                              }
                          }
                          else {
                              if (prev !== null && this.deletes(prev)) {
                                  action = 'update';
                                  oldValue = array.last(prev.content.getContent());
                              }
                              else {
                                  action = 'add';
                                  oldValue = undefined;
                              }
                          }
                      }
                      else {
                          if (this.deletes(item)) {
                              action = 'delete';
                              oldValue = array.last(item.content.getContent());
                          }
                          else {
                              return; // nop
                          }
                      }
                      keys.set(key, { action, oldValue });
                  }
              });
              this._keys = keys;
          }
          return this._keys;
      }
      /**
       * @type {Array<{insert?: string | Array<any> | object | AbstractType<any>, retain?: number, delete?: number, attributes?: Object<string, any>}>}
       */
      get delta() {
          return this.changes.delta;
      }
      /**
       * Check if a struct is added by this event.
       *
       * In contrast to change.deleted, this method also returns true if the struct was added and then deleted.
       */
      adds(struct) {
          return struct.id.clock >= (this.transaction.beforeState.get(struct.id.client) || 0);
      }
      get changes() {
          let changes = this._changes;
          if (changes === null) {
              const target = this.target;
              const added = set.create();
              const deleted = set.create();
              const delta = [];
              changes = {
                  added,
                  deleted,
                  delta,
                  keys: this.keys
              };
              const changed = this.transaction.changed.get(target);
              if (changed.has(null)) {
                  let lastOp = null;
                  const packOp = () => {
                      if (lastOp) {
                          delta.push(lastOp);
                      }
                  };
                  for (let item = target._start; item !== null; item = item.right) {
                      if (item.deleted) {
                          if (this.deletes(item) && !this.adds(item)) {
                              if (lastOp === null || lastOp.delete === undefined) {
                                  packOp();
                                  lastOp = { delete: 0 };
                              }
                              lastOp.delete += item.length;
                              deleted.add(item);
                          } // else nop
                      }
                      else {
                          if (this.adds(item)) {
                              if (lastOp === null || lastOp.insert === undefined) {
                                  packOp();
                                  lastOp = { insert: [] };
                              }
                              lastOp.insert = lastOp.insert.concat(item.content.getContent());
                              added.add(item);
                          }
                          else {
                              if (lastOp === null || lastOp.retain === undefined) {
                                  packOp();
                                  lastOp = { retain: 0 };
                              }
                              lastOp.retain += item.length;
                          }
                      }
                  }
                  if (lastOp !== null && lastOp.retain === undefined) {
                      packOp();
                  }
              }
              this._changes = changes;
          }
          return changes;
      }
  }
  exports.YEvent = YEvent;
  /**
   * Compute the path from this type to the specified target.
   *
   * @example
   *     // `child` should be accessible via `type.get(path[0]).get(path[1])..`
   *     const path = type.getPathTo(child)
   *     // assuming `type instanceof YArray`
   *     console.log(path) // might look like => [2, 'key1']
   *     child === type.get(path[0]).get(path[1])
   *
   * @param {AbstractType<any>} parent
   * @param {AbstractType<any>} child target
   * @return {Array<string|number>} Path to the target
   *
   * @private
   * @function
   */
  const getPathTo = (parent, child) => {
      const path = [];
      while (child._item !== null && child !== parent) {
          if (child._item.parentSub !== null) {
              // parent is map-ish
              path.unshift(child._item.parentSub);
          }
          else {
              // parent is array-ish
              let i = 0;
              let c = child._item.parent._start;
              while (c !== child._item && c !== null) {
                  if (!c.deleted) {
                      i++;
                  }
                  c = c.right;
              }
              path.unshift(i);
          }
          child = child._item.parent;
      }
      return path;
  };
  });

  /**
   * Utility module to create and manipulate Iterators.
   *
   * @module iterator
   */

  /**
   * @template T,R
   * @param {Iterator<T>} iterator
   * @param {function(T):R} f
   * @return {IterableIterator<R>}
   */
  const mapIterator = (iterator, f) => ({
    [Symbol.iterator] () {
      return this
    },
    // @ts-ignore
    next () {
      const r = iterator.next();
      return { value: r.done ? undefined : f(r.value), done: r.done }
    }
  });

  /**
   * @template T
   * @param {function():IteratorResult<T>} next
   * @return {IterableIterator<T>}
   */
  const createIterator = next => ({
    /**
     * @return {IterableIterator<T>}
     */
    [Symbol.iterator] () {
      return this
    },
    // @ts-ignore
    next
  });

  /**
   * @template T
   * @param {Iterator<T>} iterator
   * @param {function(T):boolean} filter
   */
  const iteratorFilter = (iterator, filter) => createIterator(() => {
    let res;
    do {
      res = iterator.next();
    } while (!res.done && !filter(res.value))
    return res
  });

  /**
   * @template T,M
   * @param {Iterator<T>} iterator
   * @param {function(T):M} fmap
   */
  const iteratorMap = (iterator, fmap) => createIterator(() => {
    const { done, value } = iterator.next();
    return { done, value: done ? undefined : fmap(value) }
  });

  var iterator$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    mapIterator: mapIterator,
    createIterator: createIterator,
    iteratorFilter: iteratorFilter,
    iteratorMap: iteratorMap
  });

  var iterator = /*@__PURE__*/getAugmentedNamespace(iterator$1);

  var AbstractType_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.createMapIterator = exports.typeMapGetSnapshot = exports.typeMapHas = exports.typeMapGetAll = exports.typeMapGet = exports.typeMapSet = exports.typeMapDelete = exports.typeListDelete = exports.typeListPushGenerics = exports.typeListInsertGenerics = exports.typeListInsertGenericsAfter = exports.typeListGet = exports.typeListForEachSnapshot = exports.typeListCreateIterator = exports.typeListMap = exports.typeListForEach = exports.typeListToArraySnapshot = exports.typeListToArray = exports.typeListSlice = exports.AbstractType = exports.callTypeObservers = exports.getTypeChildren = exports.updateMarkerChanges = exports.findMarker = exports.ArraySearchMarker = void 0;





  const maxSearchMarker = 80;
  /**
   * A unique timestamp that identifies each marker.
   *
   * Time is relative,.. this is more like an ever-increasing clock.
   */
  let globalSearchMarkerTimestamp = 0;
  class ArraySearchMarker {
      constructor(p, index) {
          this.p = p;
          this.index = index;
          p.marker = true;
          this.timestamp = globalSearchMarkerTimestamp++;
      }
  }
  exports.ArraySearchMarker = ArraySearchMarker;
  const refreshMarkerTimestamp = (marker) => {
      marker.timestamp = globalSearchMarkerTimestamp++;
  };
  /**
   * This is rather complex so this function is the only thing that should overwrite a marker
   */
  const overwriteMarker = (marker, p, index) => {
      marker.p.marker = false;
      marker.p = p;
      p.marker = true;
      marker.index = index;
      marker.timestamp = globalSearchMarkerTimestamp++;
  };
  const markPosition = (searchMarker, p, index) => {
      if (searchMarker.length >= maxSearchMarker) {
          // override oldest marker (we don't want to create more objects)
          const marker = searchMarker.reduce((a, b) => a.timestamp < b.timestamp ? a : b);
          overwriteMarker(marker, p, index);
          return marker;
      }
      else {
          // create new marker
          const pm = new ArraySearchMarker(p, index);
          searchMarker.push(pm);
          return pm;
      }
  };
  /**
   * Search marker help us to find positions in the associative array faster.
   *
   * They speed up the process of finding a position without much bookkeeping.
   *
   * A maximum of `maxSearchMarker` objects are created.
   *
   * This function always returns a refreshed marker (updated timestamp)
   */
  const findMarker = (yarray, index) => {
      if (yarray._start === null || index === 0 || yarray._searchMarker === null) {
          return null;
      }
      const marker = yarray._searchMarker.length === 0 ? null : yarray._searchMarker.reduce((a, b) => math.abs(index - a.index) < math.abs(index - b.index) ? a : b);
      let p = yarray._start;
      let pindex = 0;
      if (marker !== null) {
          p = marker.p;
          pindex = marker.index;
          refreshMarkerTimestamp(marker); // we used it, we might need to use it again
      }
      // iterate to right if possible
      while (p.right !== null && pindex < index) {
          if (!p.deleted && p.countable) {
              if (index < pindex + p.length) {
                  break;
              }
              pindex += p.length;
          }
          p = p.right;
      }
      // iterate to left if necessary (might be that pindex > index)
      while (p.left !== null && pindex > index) {
          p = p.left;
          if (!p.deleted && p.countable) {
              pindex -= p.length;
          }
      }
      // we want to make sure that p can't be merged with left, because that would screw up everything
      // in that cas just return what we have (it is most likely the best marker anyway)
      // iterate to left until p can't be merged with left
      while (p.left !== null && p.left.id.client === p.id.client && p.left.id.clock + p.left.length === p.id.clock) {
          p = p.left;
          if (!p.deleted && p.countable) {
              pindex -= p.length;
          }
      }
      // @todo remove!
      // assure position
      // {
      //     let start = yarray._start
      //     let pos = 0
      //     while (start !== p) {
      //         if (!start.deleted && start.countable) {
      //             pos += start.length
      //         }
      //         start = /** @type {Item} */ (start.right)
      //     }
      //     if (pos !== pindex) {
      //         debugger
      //         throw new Error('Gotcha position fail!')
      //     }
      // }
      // if (marker) {
      //     if (window.lengthes == null) {
      //         window.lengthes = []
      //         window.getLengthes = () => window.lengthes.sort((a, b) => a - b)
      //     }
      //     window.lengthes.push(marker.index - pindex)
      //     console.log('distance', marker.index - pindex, 'len', p && p.parent.length)
      // }
      if (marker !== null && math.abs(marker.index - pindex) < p.parent.length / maxSearchMarker) {
          // adjust existing marker
          overwriteMarker(marker, p, pindex);
          return marker;
      }
      else {
          // create new marker
          return markPosition(yarray._searchMarker, p, pindex);
      }
  };
  exports.findMarker = findMarker;
  /**
   * Update markers when a change happened.
   *
   * This should be called before doing a deletion!
   */
  const updateMarkerChanges = (searchMarker, index, len) => {
      for (let i = searchMarker.length - 1; i >= 0; i--) {
          const m = searchMarker[i];
          if (len > 0) {
              let p = m.p;
              p.marker = false;
              // Ideally we just want to do a simple position comparison, but this will only work if
              // search markers don't point to deleted items for formats.
              // Iterate marker to prev undeleted countable position so we know what to do when updating a position
              while (p && (p.deleted || !p.countable)) {
                  p = p.left;
                  if (p && !p.deleted && p.countable) {
                      // adjust position. the loop should break now
                      m.index -= p.length;
                  }
              }
              if (p === null || p.marker === true) {
                  // remove search marker if updated position is null or if position is already marked
                  searchMarker.splice(i, 1);
                  continue;
              }
              m.p = p;
              p.marker = true;
          }
          if (index < m.index || (len > 0 && index === m.index)) { // a simple index <= m.index check would actually suffice
              m.index = math.max(index, m.index + len);
          }
      }
  };
  exports.updateMarkerChanges = updateMarkerChanges;
  /**
   * Accumulate all (list) children of a type and return them as an Array.
   */
  const getTypeChildren = (t) => {
      let s = t._start;
      const arr = [];
      while (s) {
          arr.push(s);
          s = s.right;
      }
      return arr;
  };
  exports.getTypeChildren = getTypeChildren;
  /**
   * Call event listeners with an event. This will also add an event to all
   * parents (for `.observeDeep` handlers).
   */
  const callTypeObservers = (type, transaction, event) => {
      const changedType = type;
      const changedParentTypes = transaction.changedParentTypes;
      while (true) {
          // @ts-ignore
          map.setIfUndefined(changedParentTypes, type, () => []).push(event);
          if (type._item === null) {
              break;
          }
          type = type._item.parent;
      }
      (0, internals_js_1.callEventHandlerListeners)(changedType._eH, event, transaction);
  };
  exports.callTypeObservers = callTypeObservers;
  /**
   * Abstract Yjs Type class
   */
  class AbstractType {
      constructor() {
          this.doc = null;
          this._item = null;
          this._map = new Map();
          this._start = null;
          this._length = 0;
          /** Event handlers */
          this._eH = (0, internals_js_1.createEventHandler)();
          /** Deep event handlers */
          this._dEH = (0, internals_js_1.createEventHandler)();
          this._searchMarker = null;
      }
      get parent() {
          return this._item ? this._item.parent : null;
      }
      /**
       * Integrate this type into the Yjs instance.
       *
       * * Save this struct in the os
       * * This type is sent to other client
       * * Observer functions are fired
       */
      _integrate(y, item) {
          this.doc = y;
          this._item = item;
      }
      _copy() { throw error.methodUnimplemented(); }
      clone() { throw error.methodUnimplemented(); }
      _write(_encoder) { }
      /** The first non-deleted item */
      get _first() {
          let n = this._start;
          while (n !== null && n.deleted) {
              n = n.right;
          }
          return n;
      }
      /**
       * Creates YEvent and calls all type observers.
       * Must be implemented by each type.
       *
       * @param {Transaction} transaction
       * @param {Set<null|string>} _parentSubs Keys changed on this type. `null` if list was modified.
       */
      _callObserver(transaction, _parentSubs) {
          if (!transaction.local && this._searchMarker) {
              this._searchMarker.length = 0;
          }
      }
      /** Observe all events that are created on this type. */
      observe(f) {
          (0, internals_js_1.addEventHandlerListener)(this._eH, f);
      }
      /** Observe all events that are created by this type and its children. */
      observeDeep(f) {
          (0, internals_js_1.addEventHandlerListener)(this._dEH, f);
      }
      /** Unregister an observer function. */
      unobserve(f) {
          (0, internals_js_1.removeEventHandlerListener)(this._eH, f);
      }
      /** Unregister an observer function. */
      unobserveDeep(f) {
          (0, internals_js_1.removeEventHandlerListener)(this._dEH, f);
      }
      toJSON() { }
  }
  exports.AbstractType = AbstractType;
  const typeListSlice = (type, start, end) => {
      if (start < 0) {
          start = type._length + start;
      }
      if (end < 0) {
          end = type._length + end;
      }
      let len = end - start;
      const cs = [];
      let n = type._start;
      while (n !== null && len > 0) {
          if (n.countable && !n.deleted) {
              const c = n.content.getContent();
              if (c.length <= start) {
                  start -= c.length;
              }
              else {
                  for (let i = start; i < c.length && len > 0; i++) {
                      cs.push(c[i]);
                      len--;
                  }
                  start = 0;
              }
          }
          n = n.right;
      }
      return cs;
  };
  exports.typeListSlice = typeListSlice;
  const typeListToArray = (type) => {
      const cs = [];
      let n = type._start;
      while (n !== null) {
          if (n.countable && !n.deleted) {
              const c = n.content.getContent();
              for (let i = 0; i < c.length; i++) {
                  cs.push(c[i]);
              }
          }
          n = n.right;
      }
      return cs;
  };
  exports.typeListToArray = typeListToArray;
  const typeListToArraySnapshot = (type, snapshot) => {
      const cs = [];
      let n = type._start;
      while (n !== null) {
          if (n.countable && (0, internals_js_1.isVisible)(n, snapshot)) {
              const c = n.content.getContent();
              for (let i = 0; i < c.length; i++) {
                  cs.push(c[i]);
              }
          }
          n = n.right;
      }
      return cs;
  };
  exports.typeListToArraySnapshot = typeListToArraySnapshot;
  /**
   * Executes a provided function on once on overy element of this YArray.
   *
   * @param {AbstractType<any>} type
   * @param {function(any,number,any):void} f A function to execute on every element of this YArray.
   */
  const typeListForEach = (type, f) => {
      let index = 0;
      let n = type._start;
      while (n !== null) {
          if (n.countable && !n.deleted) {
              const c = n.content.getContent();
              for (let i = 0; i < c.length; i++) {
                  f(c[i], index++, type);
              }
          }
          n = n.right;
      }
  };
  exports.typeListForEach = typeListForEach;
  const typeListMap = (type, f) => {
      const result = [];
      (0, exports.typeListForEach)(type, (c, i) => {
          result.push(f(c, i, type));
      });
      return result;
  };
  exports.typeListMap = typeListMap;
  const typeListCreateIterator = (type) => {
      let n = type._start;
      let currentContent = null;
      let currentContentIndex = 0;
      return {
          [Symbol.iterator]() {
              return this;
          },
          next: () => {
              // find some content
              if (currentContent === null) {
                  while (n !== null && n.deleted) {
                      n = n.right;
                  }
                  // check if we reached the end, no need to check currentContent, because it does not exist
                  if (n === null) {
                      return {
                          done: true,
                          value: undefined
                      };
                  }
                  // we found n, so we can set currentContent
                  currentContent = n.content.getContent();
                  currentContentIndex = 0;
                  n = n.right; // we used the content of n, now iterate to next
              }
              const value = currentContent[currentContentIndex++];
              // check if we need to empty currentContent
              if (currentContent.length <= currentContentIndex) {
                  currentContent = null;
              }
              return {
                  done: false,
                  value
              };
          }
      };
  };
  exports.typeListCreateIterator = typeListCreateIterator;
  /**
   * Executes a provided function on once on overy element of this YArray.
   * Operates on a snapshotted state of the document.
   *
   * @param {AbstractType<any>} type
   * @param {function(any,number,AbstractType<any>):void} f A function to execute on every element of this YArray.
   * @param {Snapshot} snapshot
   *
   * @private
   * @function
   */
  const typeListForEachSnapshot = (type, f, snapshot) => {
      let index = 0;
      let n = type._start;
      while (n !== null) {
          if (n.countable && (0, internals_js_1.isVisible)(n, snapshot)) {
              const c = n.content.getContent();
              for (let i = 0; i < c.length; i++) {
                  f(c[i], index++, type);
              }
          }
          n = n.right;
      }
  };
  exports.typeListForEachSnapshot = typeListForEachSnapshot;
  const typeListGet = (type, index) => {
      const marker = (0, exports.findMarker)(type, index);
      let n = type._start;
      if (marker !== null) {
          n = marker.p;
          index -= marker.index;
      }
      for (; n !== null; n = n.right) {
          if (!n.deleted && n.countable) {
              if (index < n.length) {
                  return n.content.getContent()[index];
              }
              index -= n.length;
          }
      }
  };
  exports.typeListGet = typeListGet;
  const typeListInsertGenericsAfter = (transaction, parent, referenceItem, content) => {
      let left = referenceItem;
      const doc = transaction.doc;
      const ownClientId = doc.clientID;
      const store = doc.store;
      const right = referenceItem === null ? parent._start : referenceItem.right;
      let jsonContent = [];
      const packJsonContent = () => {
          if (jsonContent.length > 0) {
              left = new internals_js_1.Item((0, internals_js_1.createID)(ownClientId, (0, internals_js_1.getState)(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new internals_js_1.ContentAny(jsonContent));
              left.integrate(transaction, 0);
              jsonContent = [];
          }
      };
      content.forEach(c => {
          if (c === null) {
              jsonContent.push(c);
          }
          else {
              switch (c.constructor) {
                  case Number:
                  case Object:
                  case Boolean:
                  case Array:
                  case String:
                      jsonContent.push(c);
                      break;
                  default:
                      packJsonContent();
                      switch (c.constructor) {
                          case Uint8Array:
                          case ArrayBuffer:
                              left = new internals_js_1.Item((0, internals_js_1.createID)(ownClientId, (0, internals_js_1.getState)(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new internals_js_1.ContentBinary(new Uint8Array(c)));
                              left.integrate(transaction, 0);
                              break;
                          case internals_js_1.Doc:
                              left = new internals_js_1.Item((0, internals_js_1.createID)(ownClientId, (0, internals_js_1.getState)(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new internals_js_1.ContentDoc(c));
                              left.integrate(transaction, 0);
                              break;
                          default:
                              if (c instanceof AbstractType) {
                                  left = new internals_js_1.Item((0, internals_js_1.createID)(ownClientId, (0, internals_js_1.getState)(store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new internals_js_1.ContentType(c));
                                  left.integrate(transaction, 0);
                              }
                              else {
                                  throw new Error('Unexpected content type in insert operation');
                              }
                      }
              }
          }
      });
      packJsonContent();
  };
  exports.typeListInsertGenericsAfter = typeListInsertGenericsAfter;
  const lengthExceeded = error.create('Length exceeded!');
  const typeListInsertGenerics = (transaction, parent, index, content) => {
      if (index > parent._length) {
          throw lengthExceeded;
      }
      if (index === 0) {
          if (parent._searchMarker) {
              (0, exports.updateMarkerChanges)(parent._searchMarker, index, content.length);
          }
          return (0, exports.typeListInsertGenericsAfter)(transaction, parent, null, content);
      }
      const startIndex = index;
      const marker = (0, exports.findMarker)(parent, index);
      let n = parent._start;
      if (marker !== null) {
          n = marker.p;
          index -= marker.index;
          // we need to iterate one to the left so that the algorithm works
          if (index === 0) {
              // @todo refactor this as it actually doesn't consider formats
              n = n.prev; // important! get the left undeleted item so that we can actually decrease index
              index += (n && n.countable && !n.deleted) ? n.length : 0;
          }
      }
      for (; n !== null; n = n.right) {
          if (!n.deleted && n.countable) {
              if (index <= n.length) {
                  if (index < n.length) {
                      // insert in-between
                      (0, internals_js_1.getItemCleanStart)(transaction, (0, internals_js_1.createID)(n.id.client, n.id.clock + index));
                  }
                  break;
              }
              index -= n.length;
          }
      }
      if (parent._searchMarker) {
          (0, exports.updateMarkerChanges)(parent._searchMarker, startIndex, content.length);
      }
      return (0, exports.typeListInsertGenericsAfter)(transaction, parent, n, content);
  };
  exports.typeListInsertGenerics = typeListInsertGenerics;
  /**
   * Pushing content is special as we generally want to push after the last item. So we don't have to update
   * the serach marker.
  */
  const typeListPushGenerics = (transaction, parent, content) => {
      // Use the marker with the highest index and iterate to the right.
      const marker = (parent._searchMarker || []).reduce((maxMarker, currMarker) => currMarker.index > maxMarker.index ? currMarker : maxMarker, { index: 0, p: parent._start });
      let n = marker.p;
      if (n) {
          while (n.right) {
              n = n.right;
          }
      }
      return (0, exports.typeListInsertGenericsAfter)(transaction, parent, n, content);
  };
  exports.typeListPushGenerics = typeListPushGenerics;
  const typeListDelete = (transaction, parent, index, length) => {
      if (length === 0) {
          return;
      }
      const startIndex = index;
      const startLength = length;
      const marker = (0, exports.findMarker)(parent, index);
      let n = parent._start;
      if (marker !== null) {
          n = marker.p;
          index -= marker.index;
      }
      // compute the first item to be deleted
      for (; n !== null && index > 0; n = n.right) {
          if (!n.deleted && n.countable) {
              if (index < n.length) {
                  (0, internals_js_1.getItemCleanStart)(transaction, (0, internals_js_1.createID)(n.id.client, n.id.clock + index));
              }
              index -= n.length;
          }
      }
      // delete all items until done
      while (length > 0 && n !== null) {
          if (!n.deleted) {
              if (length < n.length) {
                  (0, internals_js_1.getItemCleanStart)(transaction, (0, internals_js_1.createID)(n.id.client, n.id.clock + length));
              }
              n.delete(transaction);
              length -= n.length;
          }
          n = n.right;
      }
      if (length > 0) {
          throw lengthExceeded;
      }
      if (parent._searchMarker) {
          (0, exports.updateMarkerChanges)(parent._searchMarker, startIndex, -startLength + length /* in case we remove the above exception */);
      }
  };
  exports.typeListDelete = typeListDelete;
  const typeMapDelete = (transaction, parent, key) => {
      const c = parent._map.get(key);
      if (c !== undefined) {
          c.delete(transaction);
      }
  };
  exports.typeMapDelete = typeMapDelete;
  const typeMapSet = (transaction, parent, key, value) => {
      const left = parent._map.get(key) || null;
      const doc = transaction.doc;
      const ownClientId = doc.clientID;
      let content;
      if (value == null) {
          content = new internals_js_1.ContentAny([value]);
      }
      else {
          switch (value.constructor) {
              case Number:
              case Object:
              case Boolean:
              case Array:
              case String:
                  content = new internals_js_1.ContentAny([value]);
                  break;
              case Uint8Array:
                  content = new internals_js_1.ContentBinary(value);
                  break;
              case internals_js_1.Doc:
                  content = new internals_js_1.ContentDoc(value);
                  break;
              default:
                  if (value instanceof AbstractType) {
                      content = new internals_js_1.ContentType(value);
                  }
                  else {
                      throw new Error('Unexpected content type');
                  }
          }
      }
      new internals_js_1.Item((0, internals_js_1.createID)(ownClientId, (0, internals_js_1.getState)(doc.store, ownClientId)), left, left && left.lastId, null, null, parent, key, content).integrate(transaction, 0);
  };
  exports.typeMapSet = typeMapSet;
  const typeMapGet = (parent, key) => {
      const val = parent._map.get(key);
      return val !== undefined && !val.deleted ? val.content.getContent()[val.length - 1] : undefined;
  };
  exports.typeMapGet = typeMapGet;
  const typeMapGetAll = (parent) => {
      const res = {};
      parent._map.forEach((value, key) => {
          if (!value.deleted) {
              res[key] = value.content.getContent()[value.length - 1];
          }
      });
      return res;
  };
  exports.typeMapGetAll = typeMapGetAll;
  const typeMapHas = (parent, key) => {
      const val = parent._map.get(key);
      return val !== undefined && !val.deleted;
  };
  exports.typeMapHas = typeMapHas;
  const typeMapGetSnapshot = (parent, key, snapshot) => {
      let v = parent._map.get(key) || null;
      while (v !== null && (!snapshot.sv.has(v.id.client) || v.id.clock >= (snapshot.sv.get(v.id.client) || 0))) {
          v = v.left;
      }
      return v !== null && (0, internals_js_1.isVisible)(v, snapshot) ? v.content.getContent()[v.length - 1] : undefined;
  };
  exports.typeMapGetSnapshot = typeMapGetSnapshot;
  const createMapIterator = (map) => {
      return iterator.iteratorFilter(map.entries(), (entry) => !entry[1].deleted);
  };
  exports.createMapIterator = createMapIterator;
  });

  var YArray_1 = createCommonjsModule(function (module, exports) {
  /**
   * @module YArray
   */
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.readYArray = exports.YArray = exports.YArrayEvent = void 0;


  /** Event that describes the changes on a YArray */
  class YArrayEvent extends internals_js_1.YEvent {
      /**
       * @param {YArray<T>} yarray The changed type
       * @param {Transaction} transaction The transaction object
       */
      constructor(yarray, transaction) {
          super(yarray, transaction);
          this._transaction = transaction;
      }
  }
  exports.YArrayEvent = YArrayEvent;
  /** A shared Array implementation. */
  class YArray extends internals_js_1.AbstractType {
      constructor() {
          super();
          this._prelimContent = [];
          this._searchMarker = [];
      }
      /** Construct a new YArray containing the specified items. */
      static from(items) {
          const a = new YArray();
          a.push(items);
          return a;
      }
      /**
       * Integrate this type into the Yjs instance.
       *
       * * Save this struct in the os
       * * This type is sent to other client
       * * Observer functions are fired
       */
      _integrate(y, item) {
          super._integrate(y, item);
          this.insert(0, this._prelimContent);
          this._prelimContent = null;
      }
      _copy() { return new YArray(); }
      clone() {
          const arr = new YArray();
          arr.insert(0, this.toArray().map(el => el instanceof internals_js_1.AbstractType ? el.clone() : el));
          return arr;
      }
      get length() {
          return this._prelimContent === null ? this._length : this._prelimContent.length;
      }
      /**
       * Creates YArrayEvent and calls observers.
       *
       * @param {Transaction} transaction
       * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
       */
      _callObserver(transaction, parentSubs) {
          super._callObserver(transaction, parentSubs);
          (0, internals_js_1.callTypeObservers)(this, transaction, new YArrayEvent(this, transaction));
      }
      /**
       * Inserts new content at an index.
       *
       * Important: This function expects an array of content. Not just a content
       * object. The reason for this "weirdness" is that inserting several elements
       * is very efficient when it is done as a single operation.
       *
       * @example
       *    // Insert character 'a' at position 0
       *    yarray.insert(0, ['a'])
       *    // Insert numbers 1, 2 at position 1
       *    yarray.insert(1, [1, 2])
       *
       * @param {number} index The index to insert content at.
       * @param {Array<T>} content The array of content
       */
      insert(index, content) {
          if (this.doc !== null) {
              (0, internals_js_1.transact)(this.doc, transaction => {
                  (0, internals_js_1.typeListInsertGenerics)(transaction, this, index, content);
              });
          }
          else {
              this._prelimContent.splice(index, 0, ...content);
          }
      }
      /**
       * Appends content to this YArray.
       *
       * @param {Array<T>} content Array of content to append.
       *
       * @todo Use the following implementation in all types.
       */
      push(content) {
          if (this.doc !== null) {
              (0, internals_js_1.transact)(this.doc, transaction => {
                  (0, internals_js_1.typeListPushGenerics)(transaction, this, content);
              });
          }
          else {
              this._prelimContent.push(...content);
          }
      }
      /**
       * Preppends content to this YArray.
       *
       * @param {Array<T>} content Array of content to preppend.
       */
      unshift(content) {
          this.insert(0, content);
      }
      /**
       * Deletes elements starting from an index.
       *
       * @param {number} index Index at which to start deleting elements
       * @param {number} length The number of elements to remove. Defaults to 1.
       */
      delete(index, length = 1) {
          if (this.doc !== null) {
              (0, internals_js_1.transact)(this.doc, transaction => {
                  (0, internals_js_1.typeListDelete)(transaction, this, index, length);
              });
          }
          else {
              this._prelimContent.splice(index, length);
          }
      }
      /**
       * Returns the i-th element from a YArray.
       *
       * @param {number} index The index of the element to return from the YArray
       * @return {T}
       */
      get(index) {
          return (0, internals_js_1.typeListGet)(this, index);
      }
      /** Transforms this YArray to a JavaScript Array. */
      toArray() {
          return (0, internals_js_1.typeListToArray)(this);
      }
      /** Transforms this YArray to a JavaScript Array. */
      slice(start = 0, end = this.length) {
          return (0, AbstractType_1.typeListSlice)(this, start, end);
      }
      /**
       * Transforms this Shared Type to a JSON object.
       */
      toJSON() {
          return this.map((c) => c instanceof internals_js_1.AbstractType ? c.toJSON() : c);
      }
      /**
       * Returns an Array with the result of calling a provided function on every
       * element of this YArray.
       *
       * @template M
       * @param {function(T,number,YArray<T>):M} f Function that produces an element of the new Array
       * @return {Array<M>} A new array with each element being the result of the
       *                                 callback function
       */
      map(func) {
          return (0, internals_js_1.typeListMap)(this, func);
      }
      /**
       * Executes a provided function on once on overy element of this YArray.
       *
       * @param {function(T,number,YArray<T>):void} f A function to execute on every element of this YArray.
       */
      forEach(f) {
          (0, internals_js_1.typeListForEach)(this, f);
      }
      [Symbol.iterator]() {
          return (0, internals_js_1.typeListCreateIterator)(this);
      }
      _write(encoder) {
          encoder.writeTypeRef(internals_js_1.YArrayRefID);
      }
  }
  exports.YArray = YArray;
  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} _decoder
   *
   * @private
   * @function
   */
  const readYArray = (_decoder) => {
      return new YArray();
  };
  exports.readYArray = readYArray;
  });

  var YMap_1 = createCommonjsModule(function (module, exports) {
  /**
   * @module YMap
   */
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.readYMap = exports.YMap = exports.YMapEvent = void 0;



  /** Event that describes the changes on a YMap. */
  class YMapEvent extends internals_js_1.YEvent {
      /**
       * @param {YMap<T>} ymap The YArray that changed.
       * @param {Transaction} transaction
       * @param {Set<any>} subs The keys that changed.
       */
      constructor(ymap, transaction, subs) {
          super(ymap, transaction);
          this.keysChanged = subs;
      }
  }
  exports.YMapEvent = YMapEvent;
  /**
   * @template MapType
   * A shared Map implementation.
   *
   * @extends AbstractType<YMapEvent<MapType>>
   * @implements {Iterable<MapType>}
   */
  class YMap extends AbstractType_1.AbstractType {
      /**
       *
       * @param {Iterable<readonly [string, any]>=} entries - an optional iterable to initialize the YMap
       */
      constructor(entries = undefined) {
          super();
          this._prelimContent = null;
          if (entries === undefined) {
              this._prelimContent = new Map();
          }
          else {
              this._prelimContent = new Map(entries);
          }
      }
      /**
       * Integrate this type into the Yjs instance.
       *
       * * Save this struct in the os
       * * This type is sent to other client
       * * Observer functions are fired
       */
      _integrate(y, item) {
          super._integrate(y, item);
          this._prelimContent.forEach((value, key) => {
              this.set(key, value);
          });
          this._prelimContent = null;
      }
      _copy() {
          return new YMap();
      }
      clone() {
          const map = new YMap();
          this.forEach((value, key) => {
              map.set(key, value instanceof AbstractType_1.AbstractType ? value.clone() : value);
          });
          return map;
      }
      /**
       * Creates YMapEvent and calls observers.
       *
       * @param {Transaction} transaction
       * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
       */
      _callObserver(transaction, parentSubs) {
          (0, internals_js_1.callTypeObservers)(this, transaction, new YMapEvent(this, transaction, parentSubs));
      }
      /** Transforms this Shared Type to a JSON object. */
      toJSON() {
          const map = {};
          this._map.forEach((item, key) => {
              if (!item.deleted) {
                  const v = item.content.getContent()[item.length - 1];
                  map[key] = v instanceof AbstractType_1.AbstractType ? v.toJSON() : v;
              }
          });
          return map;
      }
      /** Returns the size of the YMap (count of key/value pairs) */
      get size() {
          return [...(0, internals_js_1.createMapIterator)(this._map)].length;
      }
      /** Returns the keys for each element in the YMap Type. */
      keys() {
          return iterator.iteratorMap((0, internals_js_1.createMapIterator)(this._map), (v) => v[0]);
      }
      /** Returns the values for each element in the YMap Type. */
      values() {
          return iterator.iteratorMap((0, internals_js_1.createMapIterator)(this._map), (v) => v[1].content.getContent()[v[1].length - 1]);
      }
      /** Returns an Iterator of [key, value] pairs */
      entries() {
          return iterator.iteratorMap((0, internals_js_1.createMapIterator)(this._map), (v) => [v[0], v[1].content.getContent()[v[1].length - 1]]);
      }
      /** Executes a provided function on once on every key-value pair. */
      forEach(f) {
          this._map.forEach((item, key) => {
              if (!item.deleted) {
                  f(item.content.getContent()[item.length - 1], key, this);
              }
          });
      }
      /** Returns an Iterator of [key, value] pairs */
      [Symbol.iterator]() {
          return this.entries();
      }
      /** Remove a specified element from this YMap. */
      delete(key) {
          if (this.doc !== null) {
              (0, internals_js_1.transact)(this.doc, transaction => {
                  (0, internals_js_1.typeMapDelete)(transaction, this, key);
              });
          }
          else {
              this._prelimContent.delete(key);
          }
      }
      /** Adds or updates an element with a specified key and value. */
      set(key, value) {
          if (this.doc !== null) {
              (0, internals_js_1.transact)(this.doc, transaction => {
                  (0, internals_js_1.typeMapSet)(transaction, this, key, value);
              });
          }
          else {
              this._prelimContent.set(key, value);
          }
          return value;
      }
      /** Returns a specified element from this YMap. */
      get(key) {
          return (0, internals_js_1.typeMapGet)(this, key);
      }
      /** Returns a boolean indicating whether the specified key exists or not. */
      has(key) {
          return (0, internals_js_1.typeMapHas)(this, key);
      }
      /** Removes all elements from this YMap. */
      clear() {
          if (this.doc !== null) {
              (0, internals_js_1.transact)(this.doc, transaction => {
                  this.forEach(function (_value, key, map) {
                      (0, internals_js_1.typeMapDelete)(transaction, map, key);
                  });
              });
          }
          else {
              this._prelimContent.clear();
          }
      }
      _write(encoder) {
          encoder.writeTypeRef(internals_js_1.YMapRefID);
      }
  }
  exports.YMap = YMap;
  const readYMap = (_decoder) => {
      return new YMap();
  };
  exports.readYMap = readYMap;
  });

  var object = /*@__PURE__*/getAugmentedNamespace(object$1);

  var YText_1 = createCommonjsModule(function (module, exports) {
  /**
   * @module YText
   */
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.readYText = exports.YText = exports.YTextEvent = exports.cleanupYTextFormatting = exports.ItemTextListPosition = void 0;




  const equalAttrs = (a, b) => {
      if (a === b)
          return true;
      if (typeof a === 'object' && typeof b === 'object') {
          return (a && b && object.equalFlat(a, b));
      }
      return false;
  };
  class ItemTextListPosition {
      constructor(left, right, index, currentAttributes) {
          this.left = left;
          this.right = right;
          this.index = index;
          this.currentAttributes = currentAttributes;
      }
      /** Only call this if you know that this.right is defined */
      forward() {
          if (this.right === null) {
              error.unexpectedCase();
          }
          switch (this.right.content.constructor) {
              case internals_js_1.ContentFormat:
                  if (!this.right.deleted) {
                      updateCurrentAttributes(this.currentAttributes, this.right.content);
                  }
                  break;
              default:
                  if (!this.right.deleted) {
                      this.index += this.right.length;
                  }
                  break;
          }
          this.left = this.right;
          this.right = this.right.right;
      }
  }
  exports.ItemTextListPosition = ItemTextListPosition;
  /**
   * @param {Transaction} transaction
   * @param {ItemTextListPosition} pos
   * @param {number} count steps to move forward
   * @return {ItemTextListPosition}
   *
   * @private
   * @function
   */
  const findNextPosition = (transaction, pos, count) => {
      while (pos.right !== null && count > 0) {
          switch (pos.right.content.constructor) {
              case internals_js_1.ContentFormat:
                  if (!pos.right.deleted) {
                      updateCurrentAttributes(pos.currentAttributes, pos.right.content);
                  }
                  break;
              default:
                  if (!pos.right.deleted) {
                      if (count < pos.right.length) {
                          // split right
                          (0, internals_js_1.getItemCleanStart)(transaction, (0, internals_js_1.createID)(pos.right.id.client, pos.right.id.clock + count));
                      }
                      pos.index += pos.right.length;
                      count -= pos.right.length;
                  }
                  break;
          }
          pos.left = pos.right;
          pos.right = pos.right.right;
          // pos.forward() - we don't forward because that would halve the performance because we already do the checks above
      }
      return pos;
  };
  const findPosition = (transaction, parent, index) => {
      const currentAttributes = new Map();
      const marker = (0, internals_js_1.findMarker)(parent, index);
      if (marker) {
          const pos = new ItemTextListPosition(marker.p.left, marker.p, marker.index, currentAttributes);
          return findNextPosition(transaction, pos, index - marker.index);
      }
      else {
          const pos = new ItemTextListPosition(null, parent._start, 0, currentAttributes);
          return findNextPosition(transaction, pos, index);
      }
  };
  /** Negate applied formats */
  const insertNegatedAttributes = (transaction, parent, currPos, negatedAttributes) => {
      // check if we really need to remove attributes
      while (currPos.right !== null && (currPos.right.deleted === true || (currPos.right.content.constructor === internals_js_1.ContentFormat &&
          equalAttrs(negatedAttributes.get(currPos.right.content.key), currPos.right.content.value)))) {
          if (!currPos.right.deleted) {
              negatedAttributes.delete(currPos.right.content.key);
          }
          currPos.forward();
      }
      const doc = transaction.doc;
      const ownClientId = doc.clientID;
      negatedAttributes.forEach((val, key) => {
          const left = currPos.left;
          const right = currPos.right;
          const nextFormat = new internals_js_1.Item((0, internals_js_1.createID)(ownClientId, (0, internals_js_1.getState)(doc.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new internals_js_1.ContentFormat(key, val));
          nextFormat.integrate(transaction, 0);
          currPos.right = nextFormat;
          currPos.forward();
      });
  };
  const updateCurrentAttributes = (currentAttributes, format) => {
      const { key, value } = format;
      if (value === null) {
          currentAttributes.delete(key);
      }
      else {
          currentAttributes.set(key, value);
      }
  };
  const minimizeAttributeChanges = (currPos, attributes) => {
      // go right while attributes[right.key] === right.value (or right is deleted)
      while (true) {
          if (currPos.right === null) {
              break;
          }
          else if (currPos.right.deleted || (currPos.right.content.constructor === internals_js_1.ContentFormat && equalAttrs(attributes[currPos.right.content.key] || null, currPos.right.content.value))) ;
          else {
              break;
          }
          currPos.forward();
      }
  };
  const insertAttributes = (transaction, parent, currPos, attributes) => {
      const doc = transaction.doc;
      const ownClientId = doc.clientID;
      const negatedAttributes = new Map();
      // insert format-start items
      for (const key in attributes) {
          const val = attributes[key];
          const currentVal = currPos.currentAttributes.get(key) || null;
          if (!equalAttrs(currentVal, val)) {
              // save negated attribute (set null if currentVal undefined)
              negatedAttributes.set(key, currentVal);
              const { left, right } = currPos;
              currPos.right = new internals_js_1.Item((0, internals_js_1.createID)(ownClientId, (0, internals_js_1.getState)(doc.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, new internals_js_1.ContentFormat(key, val));
              currPos.right.integrate(transaction, 0);
              currPos.forward();
          }
      }
      return negatedAttributes;
  };
  const insertText = (transaction, parent, currPos, text, attributes) => {
      currPos.currentAttributes.forEach((_val, key) => {
          if (attributes[key] === undefined) {
              attributes[key] = null;
          }
      });
      const doc = transaction.doc;
      const ownClientId = doc.clientID;
      minimizeAttributeChanges(currPos, attributes);
      const negatedAttributes = insertAttributes(transaction, parent, currPos, attributes);
      // insert content
      const content = text.constructor === String ? new internals_js_1.ContentString(text) : (text instanceof internals_js_1.AbstractType ? new internals_js_1.ContentType(text) : new internals_js_1.ContentEmbed(text));
      let { left, right, index } = currPos;
      if (parent._searchMarker) {
          (0, internals_js_1.updateMarkerChanges)(parent._searchMarker, currPos.index, content.getLength());
      }
      right = new internals_js_1.Item((0, internals_js_1.createID)(ownClientId, (0, internals_js_1.getState)(doc.store, ownClientId)), left, left && left.lastId, right, right && right.id, parent, null, content);
      right.integrate(transaction, 0);
      currPos.right = right;
      currPos.index = index;
      currPos.forward();
      insertNegatedAttributes(transaction, parent, currPos, negatedAttributes);
  };
  const formatText = (transaction, parent, currPos, length, attributes) => {
      const doc = transaction.doc;
      const ownClientId = doc.clientID;
      minimizeAttributeChanges(currPos, attributes);
      const negatedAttributes = insertAttributes(transaction, parent, currPos, attributes);
      // iterate until first non-format or null is found
      // delete all formats with attributes[format.key] != null
      // also check the attributes after the first non-format as we do not want to insert redundant negated attributes there
      // eslint-disable-next-line no-labels
      iterationLoop: while (currPos.right !== null &&
          (length > 0 ||
              (negatedAttributes.size > 0 &&
                  (currPos.right.deleted || currPos.right.content.constructor === internals_js_1.ContentFormat)))) {
          if (!currPos.right.deleted) {
              switch (currPos.right.content.constructor) {
                  case internals_js_1.ContentFormat: {
                      const { key, value } = currPos.right.content;
                      const attr = attributes[key];
                      if (attr !== undefined) {
                          if (equalAttrs(attr, value)) {
                              negatedAttributes.delete(key);
                          }
                          else {
                              if (length === 0) {
                                  // no need to further extend negatedAttributes
                                  // eslint-disable-next-line no-labels
                                  break iterationLoop;
                              }
                              negatedAttributes.set(key, value);
                          }
                          currPos.right.delete(transaction);
                      }
                      else {
                          currPos.currentAttributes.set(key, value);
                      }
                      break;
                  }
                  default:
                      if (length < currPos.right.length) {
                          (0, internals_js_1.getItemCleanStart)(transaction, (0, internals_js_1.createID)(currPos.right.id.client, currPos.right.id.clock + length));
                      }
                      length -= currPos.right.length;
                      break;
              }
          }
          currPos.forward();
      }
      // Quill just assumes that the editor starts with a newline and that it always
      // ends with a newline. We only insert that newline when a new newline is
      // inserted - i.e when length is bigger than type.length
      if (length > 0) {
          let newlines = '';
          for (; length > 0; length--) {
              newlines += '\n';
          }
          currPos.right = new internals_js_1.Item((0, internals_js_1.createID)(ownClientId, (0, internals_js_1.getState)(doc.store, ownClientId)), currPos.left, currPos.left && currPos.left.lastId, currPos.right, currPos.right && currPos.right.id, parent, null, new internals_js_1.ContentString(newlines));
          currPos.right.integrate(transaction, 0);
          currPos.forward();
      }
      insertNegatedAttributes(transaction, parent, currPos, negatedAttributes);
  };
  /**
   * Call this function after string content has been deleted in order to
   * clean up formatting Items.
   *
   * @param {Transaction} transaction
   * @param {Item} start
   * @param {Item|null} curr exclusive end, automatically iterates to the next Content Item
   * @param {Map<string,any>} startAttributes
   * @param {Map<string,any>} currAttributes
   * @return {number} The amount of formatting Items deleted.
   *
   * @function
   */
  const cleanupFormattingGap = (transaction, start, curr, startAttributes, currAttributes) => {
      let end = start;
      const endFormats = map.create();
      while (end && (!end.countable || end.deleted)) {
          if (!end.deleted && end.content.constructor === internals_js_1.ContentFormat) {
              const cf = end.content;
              endFormats.set(cf.key, cf);
          }
          end = end.right;
      }
      let cleanups = 0;
      let reachedCurr = false;
      while (start !== end) {
          if (curr === start) {
              reachedCurr = true;
          }
          if (!start.deleted) {
              const content = start.content;
              switch (content.constructor) {
                  case internals_js_1.ContentFormat: {
                      const { key, value } = content;
                      const startAttrValue = startAttributes.get(key) || null;
                      if (endFormats.get(key) !== content || startAttrValue === value) {
                          // Either this format is overwritten or it is not necessary because the attribute already existed.
                          start.delete(transaction);
                          cleanups++;
                          if (!reachedCurr && (currAttributes.get(key) || null) === value && startAttrValue !== value) {
                              if (startAttrValue === null) {
                                  currAttributes.delete(key);
                              }
                              else {
                                  currAttributes.set(key, startAttrValue);
                              }
                          }
                      }
                      if (!reachedCurr && !start.deleted) {
                          updateCurrentAttributes(currAttributes, content);
                      }
                      break;
                  }
              }
          }
          start = start.right;
      }
      return cleanups;
  };
  const cleanupContextlessFormattingGap = (transaction, item) => {
      // iterate until item.right is null or content
      while (item && item.right && (item.right.deleted || !item.right.countable)) {
          item = item.right;
      }
      const attrs = new Set();
      // iterate back until a content item is found
      while (item && (item.deleted || !item.countable)) {
          if (!item.deleted && item.content.constructor === internals_js_1.ContentFormat) {
              const key = item.content.key;
              if (attrs.has(key)) {
                  item.delete(transaction);
              }
              else {
                  attrs.add(key);
              }
          }
          item = item.left;
      }
  };
  /**
   * This function is experimental and subject to change / be removed.
   *
   * Ideally, we don't need this function at all. Formatting attributes should be cleaned up
   * automatically after each change. This function iterates twice over the complete YText type
   * and removes unnecessary formatting attributes. This is also helpful for testing.
   *
   * This function won't be exported anymore as soon as there is confidence that the YText type works as intended.
   *
   * @param {YText} type
   * @return {number} How many formatting attributes have been cleaned up.
   */
  const cleanupYTextFormatting = (type) => {
      let res = 0;
      (0, internals_js_1.transact)(type.doc, transaction => {
          let start = type._start;
          let end = type._start;
          let startAttributes = map.create();
          const currentAttributes = map.copy(startAttributes);
          while (end) {
              if (end.deleted === false) {
                  switch (end.content.constructor) {
                      case internals_js_1.ContentFormat:
                          updateCurrentAttributes(currentAttributes, end.content);
                          break;
                      default:
                          res += cleanupFormattingGap(transaction, start, end, startAttributes, currentAttributes);
                          startAttributes = map.copy(currentAttributes);
                          start = end;
                          break;
                  }
              }
              end = end.right;
          }
      });
      return res;
  };
  exports.cleanupYTextFormatting = cleanupYTextFormatting;
  const deleteText = (transaction, currPos, length) => {
      const startLength = length;
      const startAttrs = map.copy(currPos.currentAttributes);
      const start = currPos.right;
      while (length > 0 && currPos.right !== null) {
          if (currPos.right.deleted === false) {
              switch (currPos.right.content.constructor) {
                  case internals_js_1.ContentType:
                  case internals_js_1.ContentEmbed:
                  case internals_js_1.ContentString:
                      if (length < currPos.right.length) {
                          (0, internals_js_1.getItemCleanStart)(transaction, (0, internals_js_1.createID)(currPos.right.id.client, currPos.right.id.clock + length));
                      }
                      length -= currPos.right.length;
                      currPos.right.delete(transaction);
                      break;
              }
          }
          currPos.forward();
      }
      if (start) {
          cleanupFormattingGap(transaction, start, currPos.right, startAttrs, currPos.currentAttributes);
      }
      const parent = (currPos.left || currPos.right).parent;
      if (parent._searchMarker) {
          (0, internals_js_1.updateMarkerChanges)(parent._searchMarker, currPos.index, -startLength + length);
      }
      return currPos;
  };
  /** Event that describes the changes on a YText type. */
  class YTextEvent extends internals_js_1.YEvent {
      /**
       * @param {YText} ytext
       * @param {Transaction} transaction
       * @param {Set<any>} subs The keys that changed
       */
      constructor(ytext, transaction, subs) {
          super(ytext, transaction);
          this._delta = [];
          this._changes = null;
          this.childListChanged = false;
          this.keysChanged = new Set();
          subs.forEach((sub) => {
              if (sub === null) {
                  this.childListChanged = true;
              }
              else {
                  this.keysChanged.add(sub);
              }
          });
      }
      get changes() {
          if (this._changes === null) {
              this._changes = { keys: this.keys, delta: this.delta, added: new Set(), deleted: new Set() };
          }
          return this._changes;
      }
      /**
       * Compute the changes in the delta format.
       * A {@link https://quilljs.com/docs/delta/|Quill Delta}) that represents the changes on the document.
       */
      get delta() {
          if (this._delta === null) {
              const y = this.target.doc;
              const delta = [];
              (0, internals_js_1.transact)(y, transaction => {
                  const currentAttributes = new Map(); // saves all current attributes for insert
                  const oldAttributes = new Map();
                  let item = this.target._start;
                  let action = null;
                  const attributes = {}; // counts added or removed new attributes for retain
                  let insert = '';
                  let retain = 0;
                  let deleteLen = 0;
                  const addOp = () => {
                      if (action !== null) {
                          let op;
                          switch (action) {
                              case 'delete':
                                  op = { delete: deleteLen };
                                  deleteLen = 0;
                                  break;
                              case 'insert':
                                  op = { insert };
                                  if (currentAttributes.size > 0) {
                                      op.attributes = {};
                                      currentAttributes.forEach((value, key) => {
                                          if (value !== null) {
                                              op.attributes[key] = value;
                                          }
                                      });
                                  }
                                  insert = '';
                                  break;
                              case 'retain':
                                  op = { retain };
                                  if (Object.keys(attributes).length > 0) {
                                      op.attributes = {};
                                      for (const key in attributes) {
                                          op.attributes[key] = attributes[key];
                                      }
                                  }
                                  retain = 0;
                                  break;
                          }
                          delta.push(op);
                          action = null;
                      }
                  };
                  while (item !== null) {
                      switch (item.content.constructor) {
                          case internals_js_1.ContentType:
                          case internals_js_1.ContentEmbed:
                              if (this.adds(item)) {
                                  if (!this.deletes(item)) {
                                      addOp();
                                      action = 'insert';
                                      insert = item.content.getContent()[0];
                                      addOp();
                                  }
                              }
                              else if (this.deletes(item)) {
                                  if (action !== 'delete') {
                                      addOp();
                                      action = 'delete';
                                  }
                                  deleteLen += 1;
                              }
                              else if (!item.deleted) {
                                  if (action !== 'retain') {
                                      addOp();
                                      action = 'retain';
                                  }
                                  retain += 1;
                              }
                              break;
                          case internals_js_1.ContentString:
                              if (this.adds(item)) {
                                  if (!this.deletes(item)) {
                                      if (action !== 'insert') {
                                          addOp();
                                          action = 'insert';
                                      }
                                      insert += item.content.str;
                                  }
                              }
                              else if (this.deletes(item)) {
                                  if (action !== 'delete') {
                                      addOp();
                                      action = 'delete';
                                  }
                                  deleteLen += item.length;
                              }
                              else if (!item.deleted) {
                                  if (action !== 'retain') {
                                      addOp();
                                      action = 'retain';
                                  }
                                  retain += item.length;
                              }
                              break;
                          case internals_js_1.ContentFormat: {
                              const { key, value } = item.content;
                              if (this.adds(item)) {
                                  if (!this.deletes(item)) {
                                      const curVal = currentAttributes.get(key) || null;
                                      if (!equalAttrs(curVal, value)) {
                                          if (action === 'retain') {
                                              addOp();
                                          }
                                          if (equalAttrs(value, (oldAttributes.get(key) || null))) {
                                              delete attributes[key];
                                          }
                                          else {
                                              attributes[key] = value;
                                          }
                                      }
                                      else if (value !== null) {
                                          item.delete(transaction);
                                      }
                                  }
                              }
                              else if (this.deletes(item)) {
                                  oldAttributes.set(key, value);
                                  const curVal = currentAttributes.get(key) || null;
                                  if (!equalAttrs(curVal, value)) {
                                      if (action === 'retain') {
                                          addOp();
                                      }
                                      attributes[key] = curVal;
                                  }
                              }
                              else if (!item.deleted) {
                                  oldAttributes.set(key, value);
                                  const attr = attributes[key];
                                  if (attr !== undefined) {
                                      if (!equalAttrs(attr, value)) {
                                          if (action === 'retain') {
                                              addOp();
                                          }
                                          if (value === null) {
                                              delete attributes[key];
                                          }
                                          else {
                                              attributes[key] = value;
                                          }
                                      }
                                      else if (attr !== null) { // this will be cleaned up automatically by the contextless cleanup function
                                          item.delete(transaction);
                                      }
                                  }
                              }
                              if (!item.deleted) {
                                  if (action === 'insert') {
                                      addOp();
                                  }
                                  updateCurrentAttributes(currentAttributes, item.content);
                              }
                              break;
                          }
                      }
                      item = item.right;
                  }
                  addOp();
                  while (delta.length > 0) {
                      const lastOp = delta[delta.length - 1];
                      if (lastOp.retain !== undefined && lastOp.attributes === undefined) {
                          // retain delta's if they don't assign attributes
                          delta.pop();
                      }
                      else {
                          break;
                      }
                  }
              });
              this._delta = delta;
          }
          return /** @type {any} */ (this._delta);
      }
  }
  exports.YTextEvent = YTextEvent;
  /**
   * Type that represents text with formatting information.
   *
   * This type replaces y-richtext as this implementation is able to handle
   * block formats (format information on a paragraph), embeds (complex elements
   * like pictures and videos), and text formats (**bold**, *italic*).
   */
  class YText extends internals_js_1.AbstractType {
      /**
       * @param {String} [string] The initial value of the YText.
       */
      constructor(string) {
          super();
          this._pending = string !== undefined ? [() => this.insert(0, string)] : [];
          this._searchMarker = [];
      }
      /** Number of characters of this text type. */
      get length() { return this._length; }
      _integrate(y, item) {
          var _a;
          super._integrate(y, item);
          try {
              (_a = (this._pending)) === null || _a === void 0 ? void 0 : _a.forEach(f => f());
          }
          catch (e) {
              console.error(e);
          }
          this._pending = null;
      }
      _copy() {
          return new YText();
      }
      clone() {
          const text = new YText();
          text.applyDelta(this.toDelta());
          return text;
      }
      /**
       * Creates YTextEvent and calls observers.
       *
       * @param {Transaction} transaction
       * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
       */
      _callObserver(transaction, parentSubs) {
          super._callObserver(transaction, parentSubs);
          const event = new YTextEvent(this, transaction, parentSubs);
          const doc = transaction.doc;
          (0, internals_js_1.callTypeObservers)(this, transaction, event);
          // If a remote change happened, we try to cleanup potential formatting duplicates.
          if (!transaction.local) {
              // check if another formatting item was inserted
              let foundFormattingItem = false;
              for (const [client, afterClock] of transaction.afterState.entries()) {
                  const clock = transaction.beforeState.get(client) || 0;
                  if (afterClock === clock) {
                      continue;
                  }
                  (0, internals_js_1.iterateStructs)(transaction, doc.store.clients.get(client), clock, afterClock, item => {
                      if (!item.deleted && item.content.constructor === internals_js_1.ContentFormat) {
                          foundFormattingItem = true;
                      }
                  });
                  if (foundFormattingItem) {
                      break;
                  }
              }
              if (!foundFormattingItem) {
                  (0, internals_js_1.iterateDeletedStructs)(transaction, transaction.deleteSet, item => {
                      if (item instanceof internals_js_1.GC || foundFormattingItem) {
                          return;
                      }
                      if (item.parent === this && item.content.constructor === internals_js_1.ContentFormat) {
                          foundFormattingItem = true;
                      }
                  });
              }
              (0, internals_js_1.transact)(doc, (t) => {
                  if (foundFormattingItem) {
                      // If a formatting item was inserted, we simply clean the whole type.
                      // We need to compute currentAttributes for the current position anyway.
                      (0, exports.cleanupYTextFormatting)(this);
                  }
                  else {
                      // If no formatting attribute was inserted, we can make due with contextless
                      // formatting cleanups.
                      // Contextless: it is not necessary to compute currentAttributes for the affected position.
                      (0, internals_js_1.iterateDeletedStructs)(t, t.deleteSet, item => {
                          if (item instanceof internals_js_1.GC) {
                              return;
                          }
                          if (item.parent === this) {
                              cleanupContextlessFormattingGap(t, item);
                          }
                      });
                  }
              });
          }
      }
      /** Returns the unformatted string representation of this YText type. */
      toString() {
          let str = '';
          let n = this._start;
          while (n !== null) {
              if (!n.deleted && n.countable && n.content.constructor === internals_js_1.ContentString) {
                  str += n.content.str;
              }
              n = n.right;
          }
          return str;
      }
      /**Returns the unformatted string representation of this YText type. */
      toJSON() {
          return this.toString();
      }
      /**
       * Apply a {@link Delta} on this shared YText type.
       *
       * @param {any} delta The changes to apply on this element.
       * @param {object}    opts
       * @param {boolean} [opts.sanitize] Sanitize input delta. Removes ending newlines if set to true.
       *
       *
       * @public
       */
      applyDelta(delta, { sanitize = true } = {}) {
          var _a;
          if (this.doc !== null) {
              (0, internals_js_1.transact)(this.doc, transaction => {
                  const currPos = new ItemTextListPosition(null, this._start, 0, new Map());
                  for (let i = 0; i < delta.length; i++) {
                      const op = delta[i];
                      if (op.insert !== undefined) {
                          // Quill assumes that the content starts with an empty paragraph.
                          // Yjs/Y.Text assumes that it starts empty. We always hide that
                          // there is a newline at the end of the content.
                          // If we omit this step, clients will see a different number of
                          // paragraphs, but nothing bad will happen.
                          const ins = (!sanitize && typeof op.insert === 'string' && i === delta.length - 1 && currPos.right === null && op.insert.slice(-1) === '\n') ? op.insert.slice(0, -1) : op.insert;
                          if (typeof ins !== 'string' || ins.length > 0) {
                              insertText(transaction, this, currPos, ins, op.attributes || {});
                          }
                      }
                      else if (op.retain !== undefined) {
                          formatText(transaction, this, currPos, op.retain, op.attributes || {});
                      }
                      else if (op.delete !== undefined) {
                          deleteText(transaction, currPos, op.delete);
                      }
                  }
              });
          }
          else {
              (_a = this._pending) === null || _a === void 0 ? void 0 : _a.push(() => this.applyDelta(delta));
          }
      }
      /** Returns the Delta representation of this YText type. */
      toDelta(snapshot, prevSnapshot, computeYChange) {
          const ops = [];
          const currentAttributes = new Map();
          const doc = this.doc;
          let str = '';
          let n = this._start;
          function packStr() {
              if (str.length > 0) {
                  // pack str with attributes to ops
                  const attributes = {};
                  let addAttributes = false;
                  currentAttributes.forEach((value, key) => {
                      addAttributes = true;
                      attributes[key] = value;
                  });
                  /**
                   * @type {Object<string,any>}
                   */
                  const op = { insert: str };
                  if (addAttributes) {
                      op.attributes = attributes;
                  }
                  ops.push(op);
                  str = '';
              }
          }
          // snapshots are merged again after the transaction, so we need to keep the
          // transalive until we are done
          (0, internals_js_1.transact)(doc, transaction => {
              if (snapshot) {
                  (0, internals_js_1.splitSnapshotAffectedStructs)(transaction, snapshot);
              }
              if (prevSnapshot) {
                  (0, internals_js_1.splitSnapshotAffectedStructs)(transaction, prevSnapshot);
              }
              while (n !== null) {
                  if ((0, internals_js_1.isVisible)(n, snapshot) || (prevSnapshot !== undefined && (0, internals_js_1.isVisible)(n, prevSnapshot))) {
                      switch (n.content.constructor) {
                          case internals_js_1.ContentString: {
                              const cur = currentAttributes.get('ychange');
                              if (snapshot !== undefined && !(0, internals_js_1.isVisible)(n, snapshot)) {
                                  if (cur === undefined || cur.user !== n.id.client || cur.type !== 'removed') {
                                      packStr();
                                      currentAttributes.set('ychange', computeYChange ? computeYChange('removed', n.id) : { type: 'removed' });
                                  }
                              }
                              else if (prevSnapshot !== undefined && !(0, internals_js_1.isVisible)(n, prevSnapshot)) {
                                  if (cur === undefined || cur.user !== n.id.client || cur.type !== 'added') {
                                      packStr();
                                      currentAttributes.set('ychange', computeYChange ? computeYChange('added', n.id) : { type: 'added' });
                                  }
                              }
                              else if (cur !== undefined) {
                                  packStr();
                                  currentAttributes.delete('ychange');
                              }
                              str += n.content.str;
                              break;
                          }
                          case internals_js_1.ContentType:
                          case internals_js_1.ContentEmbed: {
                              packStr();
                              const op = {
                                  insert: n.content.getContent()[0]
                              };
                              if (currentAttributes.size > 0) {
                                  const attrs = ({});
                                  op.attributes = attrs;
                                  currentAttributes.forEach((value, key) => {
                                      attrs[key] = value;
                                  });
                              }
                              ops.push(op);
                              break;
                          }
                          case internals_js_1.ContentFormat:
                              if ((0, internals_js_1.isVisible)(n, snapshot)) {
                                  packStr();
                                  updateCurrentAttributes(currentAttributes, n.content);
                              }
                              break;
                      }
                  }
                  n = n.right;
              }
              packStr();
          }, 'cleanup');
          return ops;
      }
      /**
       * Insert text at a given index.
       *
       * @param {number} index The index at which to start inserting.
       * @param {String} text The text to insert at the specified position.
       * @param {TextAttributes} [attributes] Optionally define some formatting
       *                                                                        information to apply on the inserted
       *                                                                        Text.
       * @public
       */
      insert(index, text, attributes) {
          var _a;
          if (text.length <= 0) {
              return;
          }
          const y = this.doc;
          if (y !== null) {
              (0, internals_js_1.transact)(y, transaction => {
                  const pos = findPosition(transaction, this, index);
                  if (!attributes) {
                      attributes = {};
                      pos.currentAttributes.forEach((v, k) => { attributes[k] = v; });
                  }
                  insertText(transaction, this, pos, text, attributes);
              });
          }
          else {
              (_a = (this._pending)) === null || _a === void 0 ? void 0 : _a.push(() => this.insert(index, text, attributes));
          }
      }
      /**
       * Inserts an embed at a index.
       *
       * @param {number} index The index to insert the embed at.
       * @param {Object | AbstractType<any>} embed The Object that represents the embed.
       * @param {TextAttributes} attributes Attribute information to apply on the
       *                                                                        embed
       *
       * @public
       */
      insertEmbed(index, embed, attributes = {}) {
          var _a;
          const y = this.doc;
          if (y !== null) {
              (0, internals_js_1.transact)(y, transaction => {
                  const pos = findPosition(transaction, this, index);
                  insertText(transaction, this, pos, embed, attributes);
              });
          }
          else {
              (_a = (this._pending)) === null || _a === void 0 ? void 0 : _a.push(() => this.insertEmbed(index, embed, attributes));
          }
      }
      /**
       * Deletes text starting from an index.
       *
       * @param {number} index Index at which to start deleting.
       * @param {number} length The number of characters to remove. Defaults to 1.
       *
       * @public
       */
      delete(index, length) {
          var _a;
          if (length === 0) {
              return;
          }
          const y = this.doc;
          if (y !== null) {
              (0, internals_js_1.transact)(y, transaction => {
                  deleteText(transaction, findPosition(transaction, this, index), length);
              });
          }
          else {
              (_a = (this._pending)) === null || _a === void 0 ? void 0 : _a.push(() => this.delete(index, length));
          }
      }
      /**
       * Assigns properties to a range of text.
       *
       * @param {number} index The position where to start formatting.
       * @param {number} length The amount of characters to assign properties to.
       * @param {TextAttributes} attributes Attribute information to apply on the
       *                                                                        text.
       *
       * @public
       */
      format(index, length, attributes) {
          var _a;
          if (length === 0) {
              return;
          }
          const y = this.doc;
          if (y !== null) {
              (0, internals_js_1.transact)(y, transaction => {
                  const pos = findPosition(transaction, this, index);
                  if (pos.right === null) {
                      return;
                  }
                  formatText(transaction, this, pos, length, attributes);
              });
          }
          else {
              (_a = this._pending) === null || _a === void 0 ? void 0 : _a.push(() => this.format(index, length, attributes));
          }
      }
      /**
       * Removes an attribute.
       *
       * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
       *
       * @param {String} attributeName The attribute name that is to be removed.
       *
       * @public
       */
      removeAttribute(attributeName) {
          var _a;
          if (this.doc !== null) {
              (0, internals_js_1.transact)(this.doc, transaction => {
                  (0, internals_js_1.typeMapDelete)(transaction, this, attributeName);
              });
          }
          else {
              (_a = this._pending) === null || _a === void 0 ? void 0 : _a.push(() => this.removeAttribute(attributeName));
          }
      }
      /**
       * Sets or updates an attribute.
       *
       * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
       *
       * @param {String} attributeName The attribute name that is to be set.
       * @param {any} attributeValue The attribute value that is to be set.
       *
       * @public
       */
      setAttribute(attributeName, attributeValue) {
          var _a;
          if (this.doc !== null) {
              (0, internals_js_1.transact)(this.doc, transaction => {
                  (0, internals_js_1.typeMapSet)(transaction, this, attributeName, attributeValue);
              });
          }
          else {
              (_a = this._pending) === null || _a === void 0 ? void 0 : _a.push(() => this.setAttribute(attributeName, attributeValue));
          }
      }
      /**
       * Returns an attribute value that belongs to the attribute name.
       *
       * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
       *
       * @param {String} attributeName The attribute name that identifies the
       *                                                             queried value.
       * @return {any} The queried attribute value.
       *
       * @public
       */
      getAttribute(attributeName) {
          return /** @type {any} */ ((0, internals_js_1.typeMapGet)(this, attributeName));
      }
      /**
       * Returns all attribute name/value pairs in a JSON Object.
       *
       * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
       *
       * @return {Object<string, any>} A JSON Object that describes the attributes.
       *
       * @public
       */
      getAttributes() {
          return (0, internals_js_1.typeMapGetAll)(this);
      }
      /**
       * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
       */
      _write(encoder) {
          encoder.writeTypeRef(internals_js_1.YTextRefID);
      }
  }
  exports.YText = YText;
  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} _decoder
   * @return {YText}
   *
   * @private
   * @function
   */
  const readYText = (_decoder) => {
      return new YText();
  };
  exports.readYText = readYText;
  });

  var YXmlFragment_1 = createCommonjsModule(function (module, exports) {
  /**
   * @module YXml
   */
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.readYXmlFragment = exports.YXmlFragment = exports.YXmlTreeWalker = void 0;



  /**
   * Dom filter function.
   *
   * @callback domFilter
   * @param {string} nodeName The nodeName of the element
   * @param {Map} attributes The map of attributes.
   * @return {boolean} Whether to include the Dom node in the YXmlElement.
   */
  /**
   * Represents a subset of the nodes of a YXmlElement / YXmlFragment and a
   * position within them.
   *
   * Can be created with {@link YXmlFragment#createTreeWalker}
   *
   * @public
   * @implements {Iterable<YXmlElement|YXmlText|YXmlElement|YXmlHook>}
   */
  class YXmlTreeWalker {
      constructor(root, f = () => true) {
          this._filter = f;
          this._root = root;
          this._currentNode = root._start;
          this._firstCall = true;
      }
      [Symbol.iterator]() {
          return this;
      }
      /** Get the next node. */
      next() {
          let n = this._currentNode;
          let type = n && n.content && n.content.type;
          if (n !== null && (!this._firstCall || n.deleted || !this._filter(type))) { // if first call, we check if we can use the first item
              do {
                  type = n.content.type;
                  if (!n.deleted && (type.constructor === internals_js_1.YXmlElement || type.constructor === YXmlFragment) && type._start !== null) {
                      // walk down in the tree
                      n = type._start;
                  }
                  else {
                      // walk right or up in the tree
                      while (n !== null) {
                          if (n.right !== null) {
                              n = n.right;
                              break;
                          }
                          else if (n.parent === this._root) {
                              n = null;
                          }
                          else {
                              n = n.parent._item;
                          }
                      }
                  }
              } while (n !== null && (n.deleted || !this._filter(n.content.type)));
          }
          this._firstCall = false;
          if (n === null) {
              // @ts-ignore
              return { value: undefined, done: true };
          }
          this._currentNode = n;
          return { value: n.content.type, done: false };
      }
  }
  exports.YXmlTreeWalker = YXmlTreeWalker;
  /**
   * Represents a list of {@link YXmlElement}.and {@link YXmlText} types.
   * A YxmlFragment is similar to a {@link YXmlElement}, but it does not have a
   * nodeName and it does not have attributes. Though it can be bound to a DOM
   * element - in this case the attributes and the nodeName are not shared.
   *
   */
  class YXmlFragment extends internals_js_1.AbstractType {
      constructor() {
          super();
          this._prelimContent = [];
      }
      get firstChild() {
          const first = this._first;
          return first ? first.content.getContent()[0] : null;
      }
      /**
       * Integrate this type into the Yjs instance.
       *
       * * Save this struct in the os
       * * This type is sent to other client
       * * Observer functions are fired
       */
      _integrate(y, item) {
          super._integrate(y, item);
          this.insert(0, this._prelimContent);
          this._prelimContent = null;
      }
      _copy() {
          return new YXmlFragment();
      }
      clone() {
          const el = new YXmlFragment();
          // @ts-ignore
          el.insert(0, this.toArray().map(item => item instanceof internals_js_1.AbstractType ? item.clone() : item));
          return el;
      }
      get length() {
          return this._prelimContent === null ? this._length : this._prelimContent.length;
      }
      /**
       * Create a subtree of childNodes.
       *
       * @example
       * const walker = elem.createTreeWalker(dom => dom.nodeName === 'div')
       * for (let node in walker) {
       *     // `node` is a div node
       *     nop(node)
       * }
       *
       * @param {function(AbstractType<any>):boolean} filter Function that is called on each child element and
       *                                                    returns a Boolean indicating whether the child
       *                                                    is to be included in the subtree.
       * @return {YXmlTreeWalker} A subtree and a position within it.
       *
       * @public
       */
      createTreeWalker(filter) {
          return new YXmlTreeWalker(this, filter);
      }
      /**
       * Returns the first YXmlElement that matches the query.
       * Similar to DOM's {@link querySelector}.
       *
       * Query support:
       *     - tagname
       * TODO:
       *     - id
       *     - attribute
       *
       * @param {CSS_Selector} query The query on the children.
       * @return {YXmlElement|YXmlText|YXmlHook|null} The first element that matches the query or null.
       *
       * @public
       */
      querySelector(query) {
          query = query.toUpperCase();
          // @ts-ignore
          const iterator = new YXmlTreeWalker(this, element => element.nodeName && element.nodeName.toUpperCase() === query);
          const next = iterator.next();
          if (next.done) {
              return null;
          }
          else {
              return next.value;
          }
      }
      /**
       * Returns all YXmlElements that match the query.
       * Similar to Dom's {@link querySelectorAll}.
       *
       * @todo Does not yet support all queries. Currently only query by tagName.
       *
       * @param {CSS_Selector} query The query on the children
       * @return {Array<YXmlElement|YXmlText|YXmlHook|null>} The elements that match this query.
       *
       * @public
       */
      querySelectorAll(query) {
          query = query.toUpperCase();
          // @ts-ignore
          return array.from(new YXmlTreeWalker(this, element => element.nodeName && element.nodeName.toUpperCase() === query));
      }
      /**
       * Creates YXmlEvent and calls observers.
       *
       * @param {Transaction} transaction
       * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
       */
      _callObserver(transaction, parentSubs) {
          (0, internals_js_1.callTypeObservers)(this, transaction, new internals_js_1.YXmlEvent(this, parentSubs, transaction));
      }
      /**
       * Get the string representation of all the children of this YXmlFragment.
       *
       * @return {string} The string representation of all children.
       */
      toString() {
          return (0, internals_js_1.typeListMap)(this, xml => xml.toString()).join('');
      }
      /**
       * @return {string}
       */
      toJSON() {
          return this.toString();
      }
      /**
       * Creates a Dom Element that mirrors this YXmlElement.
       *
       * @param {Document} [_document=document] The document object (you must define
       *                                                                                this when calling this method in
       *                                                                                nodejs)
       * @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
       *                                                                                         are presented in the DOM
       * @param {any} [binding] You should not set this property. This is
       *                                                             used if DomBinding wants to create a
       *                                                             association to the created DOM type.
       * @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
       *
       * @public
       */
      toDOM(_document = document, hooks = {}, binding) {
          const fragment = _document.createDocumentFragment();
          if (binding !== undefined) {
              binding._createAssociation(fragment, this);
          }
          (0, internals_js_1.typeListForEach)(this, xmlType => {
              fragment.insertBefore(xmlType.toDOM(_document, hooks, binding), null);
          });
          return fragment;
      }
      /**
       * Inserts new content at an index.
       *
       * @example
       *    // Insert character 'a' at position 0
       *    xml.insert(0, [new Y.XmlText('text')])
       *
       * @param {number} index The index to insert content at
       * @param {Array<YXmlElement|YXmlText>} content The array of content
       */
      insert(index, content) {
          if (this.doc !== null) {
              (0, internals_js_1.transact)(this.doc, transaction => {
                  (0, internals_js_1.typeListInsertGenerics)(transaction, this, index, content);
              });
          }
          else {
              // @ts-ignore _prelimContent is defined because this is not yet integrated
              this._prelimContent.splice(index, 0, ...content);
          }
      }
      /**
       * Inserts new content at an index.
       *
       * @example
       *    // Insert character 'a' at position 0
       *    xml.insert(0, [new Y.XmlText('text')])
       *
       * @param {null|Item|YXmlElement|YXmlText} ref The index to insert content at
       * @param {Array<YXmlElement|YXmlText>} content The array of content
       */
      insertAfter(ref, content) {
          if (this.doc !== null) {
              (0, internals_js_1.transact)(this.doc, transaction => {
                  const refItem = (ref && ref instanceof internals_js_1.AbstractType) ? ref._item : ref;
                  (0, internals_js_1.typeListInsertGenericsAfter)(transaction, this, refItem, content);
              });
          }
          else {
              const pc = this._prelimContent;
              const index = ref === null ? 0 : pc.findIndex(el => el === ref) + 1;
              if (index === 0 && ref !== null) {
                  throw error.create('Reference item not found');
              }
              pc.splice(index, 0, ...content);
          }
      }
      /**
       * Deletes elements starting from an index.
       *
       * @param {number} index Index at which to start deleting elements
       * @param {number} [length=1] The number of elements to remove. Defaults to 1.
       */
      delete(index, length = 1) {
          if (this.doc !== null) {
              (0, internals_js_1.transact)(this.doc, transaction => {
                  (0, internals_js_1.typeListDelete)(transaction, this, index, length);
              });
          }
          else {
              // @ts-ignore _prelimContent is defined because this is not yet integrated
              this._prelimContent.splice(index, length);
          }
      }
      /**
       * Transforms this YArray to a JavaScript Array.
       *
       * @return {Array<YXmlElement|YXmlText|YXmlHook>}
       */
      toArray() {
          return (0, internals_js_1.typeListToArray)(this);
      }
      /**
       * Appends content to this YArray.
       *
       * @param {Array<YXmlElement|YXmlText>} content Array of content to append.
       */
      push(content) {
          this.insert(this.length, content);
      }
      /**
       * Preppends content to this YArray.
       *
       * @param {Array<YXmlElement|YXmlText>} content Array of content to preppend.
       */
      unshift(content) {
          this.insert(0, content);
      }
      /**
       * Returns the i-th element from a YArray.
       *
       * @param {number} index The index of the element to return from the YArray
       * @return {YXmlElement|YXmlText}
       */
      get(index) {
          return (0, internals_js_1.typeListGet)(this, index);
      }
      /**
       * Transforms this YArray to a JavaScript Array.
       *
       * @param {number} [start]
       * @param {number} [end]
       * @return {Array<YXmlElement|YXmlText>}
       */
      slice(start = 0, end = this.length) {
          return (0, internals_js_1.typeListSlice)(this, start, end);
      }
      /**
       * Executes a provided function on once on overy child element.
       *
       * @param {function(YXmlElement|YXmlText,number, typeof self):void} f A function to execute on every element of this YArray.
       */
      forEach(f) {
          (0, internals_js_1.typeListForEach)(this, f);
      }
      /**
       * Transform the properties of this type to binary and write it to an
       * BinaryEncoder.
       *
       * This is called when this Item is sent to a remote peer.
       *
       * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
       */
      _write(encoder) {
          encoder.writeTypeRef(internals_js_1.YXmlFragmentRefID);
      }
  }
  exports.YXmlFragment = YXmlFragment;
  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} _decoder
   * @return {YXmlFragment}
   *
   * @private
   * @function
   */
  const readYXmlFragment = (_decoder) => new YXmlFragment();
  exports.readYXmlFragment = readYXmlFragment;
  });

  var YXmlElement_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.readYXmlElement = exports.YXmlElement = void 0;

  /**
   * An YXmlElement imitates the behavior of a
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}.
   *
   * * An YXmlElement has attributes (key value pairs)
   * * An YXmlElement has childElements that must inherit from YXmlElement
   */
  class YXmlElement extends internals_js_1.YXmlFragment {
      constructor(nodeName = 'UNDEFINED') {
          super();
          this._prelimAttrs = new Map();
          this.nodeName = nodeName;
      }
      get nextSibling() {
          const n = this._item ? this._item.next : null;
          return n ? n.content.type : null;
      }
      get prevSibling() {
          const n = this._item ? this._item.prev : null;
          return n ? n.content.type : null;
      }
      /**
       * Integrate this type into the Yjs instance.
       *
       * * Save this struct in the os
       * * This type is sent to other client
       * * Observer functions are fired
       */
      _integrate(y, item) {
          var _a;
          super._integrate(y, item);
          (_a = this._prelimAttrs) === null || _a === void 0 ? void 0 : _a.forEach((value, key) => {
              this.setAttribute(key, value);
          });
          this._prelimAttrs = null;
      }
      /** Creates an Item with the same effect as this Item (without position effect) */
      _copy() {
          return new YXmlElement(this.nodeName);
      }
      clone() {
          const el = new YXmlElement(this.nodeName);
          const attrs = this.getAttributes();
          for (const key in attrs) {
              el.setAttribute(key, attrs[key]);
          }
          el.insert(0, this.toArray().map((item) => {
              return (item instanceof internals_js_1.AbstractType ? item.clone() : item);
          }));
          return el;
      }
      /**
       * Returns the XML serialization of this YXmlElement.
       * The attributes are ordered by attribute-name, so you can easily use this
       * method to compare YXmlElements
       *
       * @return {string} The string representation of this type.
       *
       * @public
       */
      toString() {
          const attrs = this.getAttributes();
          const stringBuilder = [];
          const keys = [];
          for (const key in attrs) {
              keys.push(key);
          }
          keys.sort();
          const keysLen = keys.length;
          for (let i = 0; i < keysLen; i++) {
              const key = keys[i];
              stringBuilder.push(key + '="' + attrs[key] + '"');
          }
          const nodeName = this.nodeName.toLocaleLowerCase();
          const attrsString = stringBuilder.length > 0 ? ' ' + stringBuilder.join(' ') : '';
          return `<${nodeName}${attrsString}>${super.toString()}</${nodeName}>`;
      }
      /**
       * Removes an attribute from this YXmlElement.
       *
       * @param {String} attributeName The attribute name that is to be removed.
       *
       * @public
       */
      removeAttribute(attributeName) {
          var _a;
          if (this.doc !== null) {
              (0, internals_js_1.transact)(this.doc, transaction => {
                  (0, internals_js_1.typeMapDelete)(transaction, this, attributeName);
              });
          }
          else {
              (_a = this._prelimAttrs) === null || _a === void 0 ? void 0 : _a.delete(attributeName);
          }
      }
      /**
       * Sets or updates an attribute.
       *
       * @param {String} attributeName The attribute name that is to be set.
       * @param {String} attributeValue The attribute value that is to be set.
       *
       * @public
       */
      setAttribute(attributeName, attributeValue) {
          var _a;
          if (this.doc !== null) {
              (0, internals_js_1.transact)(this.doc, transaction => {
                  (0, internals_js_1.typeMapSet)(transaction, this, attributeName, attributeValue);
              });
          }
          else {
              (_a = this._prelimAttrs) === null || _a === void 0 ? void 0 : _a.set(attributeName, attributeValue);
          }
      }
      /**
       * Returns an attribute value that belongs to the attribute name.
       *
       * @param {String} attributeName The attribute name that identifies the
       *                                                             queried value.
       * @return {String} The queried attribute value.
       *
       * @public
       */
      getAttribute(attributeName) {
          return (0, internals_js_1.typeMapGet)(this, attributeName);
      }
      /**
       * Returns whether an attribute exists
       *
       * @param {String} attributeName The attribute name to check for existence.
       * @return {boolean} whether the attribute exists.
       *
       * @public
       */
      hasAttribute(attributeName) {
          return /** @type {any} */ ((0, internals_js_1.typeMapHas)(this, attributeName));
      }
      /** Returns all attribute name/value pairs in a JSON Object. */
      getAttributes() {
          return (0, internals_js_1.typeMapGetAll)(this);
      }
      /**
       * Creates a Dom Element that mirrors this YXmlElement.
       *
       * @param {Document} [_document=document] The document object (you must define
       *                                                                                this when calling this method in
       *                                                                                nodejs)
       * @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
       *                                                                                         are presented in the DOM
       * @param {any} [binding] You should not set this property. This is
       *                                                             used if DomBinding wants to create a
       *                                                             association to the created DOM type.
       * @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
       *
       * @public
       */
      toDOM(_document = document, hooks = {}, binding) {
          const dom = _document.createElement(this.nodeName);
          const attrs = this.getAttributes();
          for (const key in attrs) {
              dom.setAttribute(key, attrs[key]);
          }
          (0, internals_js_1.typeListForEach)(this, yxml => {
              dom.appendChild(yxml.toDOM(_document, hooks, binding));
          });
          if (binding !== undefined) {
              binding._createAssociation(dom, this);
          }
          return dom;
      }
      /**
       * Transform the properties of this type to binary and write it to an
       * BinaryEncoder.
       *
       * This is called when this Item is sent to a remote peer.
       *
       * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
       */
      _write(encoder) {
          encoder.writeTypeRef(internals_js_1.YXmlElementRefID);
          encoder.writeKey(this.nodeName);
      }
  }
  exports.YXmlElement = YXmlElement;
  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @return {YXmlElement}
   *
   * @function
   */
  const readYXmlElement = (decoder) => {
      return new YXmlElement(decoder.readKey());
  };
  exports.readYXmlElement = readYXmlElement;
  });

  var YXmlEvent_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.YXmlEvent = void 0;

  /**
   * @extends YEvent<YXmlElement|YXmlText|YXmlFragment>
   * An Event that describes changes on a YXml Element or Yxml Fragment
   */
  class YXmlEvent extends internals_js_1.YEvent {
      /**
       * @param {YXmlElement|YXmlText|YXmlFragment} target The target on which the event is created.
       * @param {Set<string|null>} subs The set of changed attributes. `null` is included if the
       *                                     child list changed.
       * @param {Transaction} transaction The transaction instance with wich the
       *                                                                    change was created.
       */
      constructor(target, subs, transaction) {
          super(target, transaction);
          this.childListChanged = false;
          this.attributesChanged = new Set();
          subs.forEach((sub) => {
              if (sub === null) {
                  this.childListChanged = true;
              }
              else {
                  this.attributesChanged.add(sub);
              }
          });
      }
  }
  exports.YXmlEvent = YXmlEvent;
  });

  var YXmlHook_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.readYXmlHook = exports.YXmlHook = void 0;

  /**
   * You can manage binding to a custom type with YXmlHook.
   */
  class YXmlHook extends internals_js_1.YMap {
      /**
       * @param {string} hookName nodeName of the Dom Node.
       */
      constructor(hookName) {
          super();
          this.hookName = hookName;
      }
      /**
       * Creates an Item with the same effect as this Item (without position effect)
       */
      _copy() {
          return new YXmlHook(this.hookName);
      }
      clone() {
          const el = new YXmlHook(this.hookName);
          this.forEach((value, key) => {
              el.set(key, value);
          });
          return el;
      }
      /**
       * Creates a Dom Element that mirrors this YXmlElement.
       *
       * @param {Document} [_document=document] The document object (you must define
       *                                                                                this when calling this method in
       *                                                                                nodejs)
       * @param {Object.<string, any>} [hooks] Optional property to customize how hooks
       *                                                                                         are presented in the DOM
       * @param {any} [binding] You should not set this property. This is
       *                                                             used if DomBinding wants to create a
       *                                                             association to the created DOM type
       * @return {Element} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
       *
       * @public
       */
      toDOM(_document = document, hooks = {}, binding) {
          const hook = hooks[this.hookName];
          let dom;
          if (hook !== undefined) {
              dom = hook.createDom(this);
          }
          else {
              dom = document.createElement(this.hookName);
          }
          dom.setAttribute('data-yjs-hook', this.hookName);
          if (binding !== undefined) {
              binding._createAssociation(dom, this);
          }
          return dom;
      }
      /**
       * Transform the properties of this type to binary and write it to an
       * BinaryEncoder.
       *
       * This is called when this Item is sent to a remote peer.
       */
      _write(encoder) {
          encoder.writeTypeRef(internals_js_1.YXmlHookRefID);
          encoder.writeKey(this.hookName);
      }
  }
  exports.YXmlHook = YXmlHook;
  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @return {YXmlHook}
   *
   * @private
   * @function
   */
  const readYXmlHook = (decoder) => {
      return new YXmlHook(decoder.readKey());
  };
  exports.readYXmlHook = readYXmlHook;
  });

  var YXmlText_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.readYXmlText = exports.YXmlText = void 0;

  /**
   * Represents text in a Dom Element. In the future this type will also handle
   * simple formatting information like bold and italic.
   */
  class YXmlText extends internals_js_1.YText {
      get nextSibling() {
          const n = this._item ? this._item.next : null;
          return n ? n.content.type : null;
      }
      get prevSibling() {
          const n = this._item ? this._item.prev : null;
          return n ? n.content.type : null;
      }
      _copy() {
          return new YXmlText();
      }
      clone() {
          const text = new YXmlText();
          text.applyDelta(this.toDelta());
          return text;
      }
      /**
       * Creates a Dom Element that mirrors this YXmlText.
       *
       * @param {Document} [_document=document] The document object (you must define
       *                                                                                this when calling this method in
       *                                                                                nodejs)
       * @param {Object<string, any>} [hooks] Optional property to customize how hooks
       *                                                                                         are presented in the DOM
       * @param {any} [binding] You should not set this property. This is
       *                                                             used if DomBinding wants to create a
       *                                                             association to the created DOM type.
       * @return {Text} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
       *
       * @public
       */
      toDOM(_document = document, hooks, binding) {
          const dom = _document.createTextNode(this.toString());
          if (binding !== undefined) {
              binding._createAssociation(dom, this);
          }
          return dom;
      }
      toString() {
          // @ts-ignore
          return this.toDelta().map(delta => {
              const nestedNodes = [];
              for (const nodeName in delta.attributes) {
                  const attrs = [];
                  for (const key in delta.attributes[nodeName]) {
                      attrs.push({ key, value: delta.attributes[nodeName][key] });
                  }
                  // sort attributes to get a unique order
                  attrs.sort((a, b) => a.key < b.key ? -1 : 1);
                  nestedNodes.push({ nodeName, attrs });
              }
              // sort node order to get a unique order
              nestedNodes.sort((a, b) => a.nodeName < b.nodeName ? -1 : 1);
              // now convert to dom string
              let str = '';
              for (let i = 0; i < nestedNodes.length; i++) {
                  const node = nestedNodes[i];
                  str += `<${node.nodeName}`;
                  for (let j = 0; j < node.attrs.length; j++) {
                      const attr = node.attrs[j];
                      str += ` ${attr.key}="${attr.value}"`;
                  }
                  str += '>';
              }
              str += delta.insert;
              for (let i = nestedNodes.length - 1; i >= 0; i--) {
                  str += `</${nestedNodes[i].nodeName}>`;
              }
              return str;
          }).join('');
      }
      toJSON() {
          return this.toString();
      }
      _write(encoder) {
          encoder.writeTypeRef(internals_js_1.YXmlTextRefID);
      }
  }
  exports.YXmlText = YXmlText;
  /**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @return {YXmlText}
   *
   * @private
   * @function
   */
  const readYXmlText = (decoder) => {
      return new YXmlText();
  };
  exports.readYXmlText = readYXmlText;
  });

  var AbstractStruct_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.AbstractStruct = void 0;

  class AbstractStruct {
      constructor(id, length) {
          this.id = id;
          this.length = length;
      }
      get deleted() {
          throw error.methodUnimplemented();
      }
      /**
       * Merge this struct with the item to the right.
       * This method is already assuming that `this.id.clock + this.length === this.id.clock`.
       * Also this method does *not* remove right from StructStore!
       * @param {AbstractStruct} right
       * @return {boolean} wether this merged with right
       */
      mergeWith(right) {
          return false;
      }
      /**
       * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
       * @param {number} offset
       * @param {number} encodingRef
       */
      write(encoder, offset, encodingRef) {
          throw error.methodUnimplemented();
      }
      /**
       * @param {Transaction} transaction
       * @param {number} offset
       */
      integrate(transaction, offset) {
          throw error.methodUnimplemented();
      }
  }
  exports.AbstractStruct = AbstractStruct;
  });

  var GC_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.GC = exports.structGCRefNumber = void 0;

  exports.structGCRefNumber = 0;
  // AbstractStruct で constructor チェックをしている部分はないので、implements にして良い
  class GC {
      constructor(id, length) {
          this.id = id;
          this.length = length;
      }
      get deleted() { return true; }
      delete() { }
      mergeWith(right) {
          if (this.constructor !== right.constructor) {
              return false;
          }
          this.length += right.length;
          return true;
      }
      integrate(transaction, offset) {
          if (offset > 0) {
              this.id.clock += offset;
              this.length -= offset;
          }
          (0, internals_js_1.addStruct)(transaction.doc.store, this);
      }
      write(encoder, offset) {
          encoder.writeInfo(exports.structGCRefNumber);
          encoder.writeLen(this.length - offset);
      }
      getMissing(transaction, store) {
          return null;
      }
  }
  exports.GC = GC;
  });

  var ContentBinary_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.readContentBinary = exports.ContentBinary = void 0;

  class ContentBinary {
      constructor(content) {
          this.content = content;
      }
      getLength() { return 1; }
      getContent() { return [this.content]; }
      isCountable() { return true; }
      copy() { return new ContentBinary(this.content); }
      splice(offset) { throw error.methodUnimplemented(); }
      mergeWith(right) { return false; }
      integrate(transaction, item) { }
      delete(transaction) { }
      gc(store) { }
      write(encoder, offset) { encoder.writeBuf(this.content); }
      getRef() { return 3; }
  }
  exports.ContentBinary = ContentBinary;
  const readContentBinary = decoder => {
      return new ContentBinary(decoder.readBuf());
  };
  exports.readContentBinary = readContentBinary;
  });

  var ContentDeleted_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.readContentDeleted = exports.ContentDeleted = void 0;

  class ContentDeleted {
      constructor(len) {
          this.len = len;
      }
      getLength() { return this.len; }
      getContent() { return []; }
      isCountable() { return false; }
      copy() { return new ContentDeleted(this.len); }
      splice(offset) {
          const right = new ContentDeleted(this.len - offset);
          this.len = offset;
          return right;
      }
      mergeWith(right) {
          this.len += right.len;
          return true;
      }
      integrate(transaction, item) {
          (0, internals_js_1.addToDeleteSet)(transaction.deleteSet, item.id.client, item.id.clock, this.len);
          item.markDeleted();
      }
      delete(transaction) { }
      gc(store) { }
      write(encoder, offset) { encoder.writeLen(this.len - offset); }
      getRef() { return 1; }
  }
  exports.ContentDeleted = ContentDeleted;
  const readContentDeleted = decoder => {
      return new ContentDeleted(decoder.readLen());
  };
  exports.readContentDeleted = readContentDeleted;
  });

  var ContentDoc_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.readContentDoc = exports.ContentDoc = void 0;


  const createDocFromOpts = (guid, opts) => {
      return new internals_js_1.Doc(Object.assign(Object.assign({ guid }, opts), { shouldLoad: opts.shouldLoad || opts.autoLoad || false }));
  };
  class ContentDoc {
      constructor(doc) {
          if (doc._item) {
              console.error('This document was already integrated as a sub-document. You should create a second instance instead with the same guid.');
          }
          this.doc = doc;
          const opts = {};
          if (!doc.gc) {
              opts.gc = false;
          }
          if (doc.autoLoad) {
              opts.autoLoad = true;
          }
          if (doc.meta !== null) {
              opts.meta = doc.meta;
          }
          this.opts = opts;
      }
      getLength() { return 1; }
      getContent() { return [this.doc]; }
      isCountable() { return true; }
      copy() { return new ContentDoc(createDocFromOpts(this.doc.guid, this.opts)); }
      splice(offset) { throw error.methodUnimplemented(); }
      mergeWith(right) { return false; }
      integrate(transaction, item) {
          // this needs to be reflected in doc.destroy as well
          this.doc._item = item;
          transaction.subdocsAdded.add(this.doc);
          if (this.doc.shouldLoad) {
              transaction.subdocsLoaded.add(this.doc);
          }
      }
      delete(transaction) {
          if (transaction.subdocsAdded.has(this.doc)) {
              transaction.subdocsAdded.delete(this.doc);
          }
          else {
              transaction.subdocsRemoved.add(this.doc);
          }
      }
      gc(store) { }
      write(encoder, offset) {
          encoder.writeString(this.doc.guid);
          encoder.writeAny(this.opts);
      }
      getRef() { return 9; }
  }
  exports.ContentDoc = ContentDoc;
  const readContentDoc = decoder => {
      return new ContentDoc(createDocFromOpts(decoder.readString(), decoder.readAny()));
  };
  exports.readContentDoc = readContentDoc;
  });

  var ContentEmbed_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.readContentEmbed = exports.ContentEmbed = void 0;

  class ContentEmbed {
      constructor(embed) {
          this.embed = embed;
      }
      getLength() { return 1; }
      getContent() { return [this.embed]; }
      isCountable() { return true; }
      copy() { return new ContentEmbed(this.embed); }
      splice(offset) { throw error.methodUnimplemented(); }
      mergeWith(right) { return false; }
      integrate(transaction, item) { }
      delete(transaction) { }
      gc(store) { }
      write(encoder, offset) { encoder.writeJSON(this.embed); }
      getRef() { return 5; }
  }
  exports.ContentEmbed = ContentEmbed;
  const readContentEmbed = decoder => {
      return new ContentEmbed(decoder.readJSON());
  };
  exports.readContentEmbed = readContentEmbed;
  });

  var ContentFormat_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.readContentFormat = exports.ContentFormat = void 0;

  class ContentFormat {
      constructor(key, value) {
          this.key = key;
          this.value = value;
      }
      getLength() { return 1; }
      getContent() { return []; }
      isCountable() { return false; }
      copy() { return new ContentFormat(this.key, this.value); }
      splice(offset) { throw error.methodUnimplemented(); }
      mergeWith(right) { return false; }
      integrate(transaction, item) {
          // @todo searchmarker are currently unsupported for rich text documents
          item.parent._searchMarker = null;
      }
      delete(transaction) { }
      gc(store) { }
      write(encoder, offset) {
          encoder.writeKey(this.key);
          encoder.writeJSON(this.value);
      }
      getRef() { return 6; }
  }
  exports.ContentFormat = ContentFormat;
  const readContentFormat = decoder => {
      return new ContentFormat(decoder.readKey(), decoder.readJSON());
  };
  exports.readContentFormat = readContentFormat;
  });

  var ContentJSON_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.readContentJSON = exports.ContentJSON = void 0;
  /**
   * @private
   */
  class ContentJSON {
      constructor(arr) {
          this.arr = arr;
      }
      getLength() { return this.arr.length; }
      getContent() { return this.arr; }
      isCountable() { return true; }
      copy() { return new ContentJSON(this.arr); }
      splice(offset) {
          const right = new ContentJSON(this.arr.slice(offset));
          this.arr = this.arr.slice(0, offset);
          return right;
      }
      mergeWith(right) {
          this.arr = this.arr.concat(right.arr);
          return true;
      }
      integrate(transaction, item) { }
      delete(transaction) { }
      gc(store) { }
      write(encoder, offset) {
          const len = this.arr.length;
          encoder.writeLen(len - offset);
          for (let i = offset; i < len; i++) {
              const c = this.arr[i];
              encoder.writeString(c === undefined ? 'undefined' : JSON.stringify(c));
          }
      }
      getRef() { return 2; }
  }
  exports.ContentJSON = ContentJSON;
  const readContentJSON = decoder => {
      const len = decoder.readLen();
      const cs = [];
      for (let i = 0; i < len; i++) {
          const c = decoder.readString();
          if (c === 'undefined') {
              cs.push(undefined);
          }
          else {
              cs.push(JSON.parse(c));
          }
      }
      return new ContentJSON(cs);
  };
  exports.readContentJSON = readContentJSON;
  });

  var ContentAny_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.readContentAny = exports.ContentAny = void 0;
  class ContentAny {
      constructor(array) {
          this.array = array;
      }
      getLength() { return this.array.length; }
      getContent() { return this.array; }
      isCountable() { return true; }
      copy() { return new ContentAny(this.array); }
      splice(offset) {
          const right = new ContentAny(this.array.slice(offset));
          this.array = this.array.slice(0, offset);
          return right;
      }
      mergeWith(right) {
          this.array = this.array.concat(right.array);
          return true;
      }
      integrate(transaction, item) { }
      delete(transaction) { }
      gc(store) { }
      write(encoder, offset) {
          const len = this.array.length;
          encoder.writeLen(len - offset);
          for (let i = offset; i < len; i++) {
              const c = this.array[i];
              encoder.writeAny(c);
          }
      }
      getRef() { return 8; }
  }
  exports.ContentAny = ContentAny;
  const readContentAny = decoder => {
      const len = decoder.readLen();
      const cs = [];
      for (let i = 0; i < len; i++) {
          cs.push(decoder.readAny());
      }
      return new ContentAny(cs);
  };
  exports.readContentAny = readContentAny;
  });

  var ContentString_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.readContentString = exports.ContentString = void 0;
  class ContentString {
      constructor(str) {
          this.str = str;
      }
      getLength() { return this.str.length; }
      getContent() { return this.str.split(''); }
      isCountable() { return true; }
      copy() { return new ContentString(this.str); }
      splice(offset) {
          const right = new ContentString(this.str.slice(offset));
          this.str = this.str.slice(0, offset);
          // Prevent encoding invalid documents because of splitting of surrogate pairs: https://github.com/yjs/yjs/issues/248
          const firstCharCode = this.str.charCodeAt(offset - 1);
          if (firstCharCode >= 0xD800 && firstCharCode <= 0xDBFF) {
              // Last character of the left split is the start of a surrogate utf16/ucs2 pair.
              // We don't support splitting of surrogate pairs because this may lead to invalid documents.
              // Replace the invalid character with a unicode replacement character (� / U+FFFD)
              this.str = this.str.slice(0, offset - 1) + '�';
              // replace right as well
              right.str = '�' + right.str.slice(1);
          }
          return right;
      }
      mergeWith(right) {
          this.str += right.str;
          return true;
      }
      integrate(transaction, item) { }
      delete(transaction) { }
      gc(store) { }
      write(encoder, offset) {
          encoder.writeString(offset === 0 ? this.str : this.str.slice(offset));
      }
      getRef() { return 4; }
  }
  exports.ContentString = ContentString;
  const readContentString = decoder => {
      return new ContentString(decoder.readString());
  };
  exports.readContentString = readContentString;
  });

  var ContentType_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.readContentType = exports.ContentType = exports.YXmlTextRefID = exports.YXmlHookRefID = exports.YXmlFragmentRefID = exports.YXmlElementRefID = exports.YTextRefID = exports.YMapRefID = exports.YArrayRefID = exports.typeRefs = void 0;


  exports.typeRefs = [
      internals_js_1.readYArray,
      internals_js_1.readYMap,
      internals_js_1.readYText,
      internals_js_1.readYXmlElement,
      internals_js_1.readYXmlFragment,
      internals_js_1.readYXmlHook,
      internals_js_1.readYXmlText
  ];
  exports.YArrayRefID = 0;
  exports.YMapRefID = 1;
  exports.YTextRefID = 2;
  exports.YXmlElementRefID = 3;
  exports.YXmlFragmentRefID = 4;
  exports.YXmlHookRefID = 5;
  exports.YXmlTextRefID = 6;
  class ContentType {
      constructor(type) {
          this.type = type;
      }
      getLength() { return 1; }
      getContent() { return [this.type]; }
      isCountable() { return true; }
      copy() { return new ContentType(this.type._copy()); }
      splice(offset) { throw error.methodUnimplemented(); }
      mergeWith(right) { return false; }
      integrate(transaction, item) {
          this.type._integrate(transaction.doc, item);
      }
      delete(transaction) {
          let item = this.type._start;
          while (item !== null) {
              if (!item.deleted) {
                  item.delete(transaction);
              }
              else {
                  // This will be gc'd later and we want to merge it if possible
                  // We try to merge all deleted items after each transaction,
                  // but we have no knowledge about that this needs to be merged
                  // since it is not in transaction.ds. Hence we add it to transaction._mergeStructs
                  transaction._mergeStructs.push(item);
              }
              item = item.right;
          }
          this.type._map.forEach(item => {
              if (!item.deleted) {
                  item.delete(transaction);
              }
              else {
                  // same as above
                  transaction._mergeStructs.push(item);
              }
          });
          transaction.changed.delete(this.type);
      }
      gc(store) {
          let item = this.type._start;
          while (item !== null) {
              item.gc(store, true);
              item = item.right;
          }
          this.type._start = null;
          this.type._map.forEach((item) => {
              while (item !== null) {
                  item.gc(store, true);
                  item = item.left;
              }
          });
          this.type._map = new Map();
      }
      write(encoder, offset) {
          this.type._write(encoder);
      }
      getRef() { return 7; }
  }
  exports.ContentType = ContentType;
  const readContentType = decoder => {
      return new ContentType(exports.typeRefs[decoder.readTypeRef()](decoder));
  };
  exports.readContentType = readContentType;
  });

  var Item_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.AbstractContent = exports.contentRefs = exports.readItemContent = exports.Item = exports.redoItem = exports.splitItem = exports.keepItem = exports.followRedone = void 0;



  const followRedone = (store, id) => {
      let nextID = id;
      let diff = 0;
      let item;
      do {
          if (diff > 0) {
              nextID = (0, internals_js_1.createID)(nextID.client, nextID.clock + diff);
          }
          item = (0, internals_js_1.getItem)(store, nextID);
          diff = nextID.clock - item.id.clock;
          nextID = item.redone;
      } while (nextID !== null && item instanceof Item);
      return { item, diff };
  };
  exports.followRedone = followRedone;
  /**
   * Make sure that neither item nor any of its parents is ever deleted.
   *
   * This property does not persist when storing it into a database or when
   * sending it to other peers
   */
  const keepItem = (item, keep) => {
      while (item !== null && item.keep !== keep) {
          item.keep = keep;
          item = item.parent._item;
      }
  };
  exports.keepItem = keepItem;
  /**
   * Split leftItem into two items
   */
  const splitItem = (transaction, leftItem, diff) => {
      // create rightItem
      const { client, clock } = leftItem.id;
      const rightItem = new Item((0, internals_js_1.createID)(client, clock + diff), leftItem, (0, internals_js_1.createID)(client, clock + diff - 1), leftItem.right, leftItem.rightOrigin, leftItem.parent, leftItem.parentSub, leftItem.content.splice(diff));
      if (leftItem.deleted) {
          rightItem.markDeleted();
      }
      if (leftItem.keep) {
          rightItem.keep = true;
      }
      if (leftItem.redone !== null) {
          rightItem.redone = (0, internals_js_1.createID)(leftItem.redone.client, leftItem.redone.clock + diff);
      }
      // update left (do not set leftItem.rightOrigin as it will lead to problems when syncing)
      leftItem.right = rightItem;
      // update right
      if (rightItem.right !== null) {
          rightItem.right.left = rightItem;
      }
      // right is more specific.
      transaction._mergeStructs.push(rightItem);
      // update parent._map
      if (rightItem.parentSub !== null && rightItem.right === null) {
          rightItem.parent._map.set(rightItem.parentSub, rightItem);
      }
      leftItem.length = diff;
      return rightItem;
  };
  exports.splitItem = splitItem;
  /**
   * Redoes the effect of this operation.
   */
  const redoItem = (transaction, item, redoitems, itemsToDelete, ignoreRemoteMapChanges) => {
      const doc = transaction.doc;
      const store = doc.store;
      const ownClientID = doc.clientID;
      const redone = item.redone;
      if (redone !== null) {
          return (0, internals_js_1.getItemCleanStart)(transaction, redone);
      }
      let parentItem = item.parent._item;
      /**
       * @type {Item|null}
       */
      let left = null;
      /**
       * @type {Item|null}
       */
      let right;
      // make sure that parent is redone
      if (parentItem !== null && parentItem.deleted === true) {
          // try to undo parent if it will be undone anyway
          if (parentItem.redone === null && (!redoitems.has(parentItem) || (0, exports.redoItem)(transaction, parentItem, redoitems, itemsToDelete, ignoreRemoteMapChanges) === null)) {
              return null;
          }
          while (parentItem.redone !== null) {
              parentItem = (0, internals_js_1.getItemCleanStart)(transaction, parentItem.redone);
          }
      }
      const parentType = parentItem === null ? item.parent : parentItem.content.type;
      if (item.parentSub === null) {
          // Is an array item. Insert at the old position
          left = item.left;
          right = item;
          // find next cloned_redo items
          while (left !== null) {
              let leftTrace = left;
              // trace redone until parent matches
              while (leftTrace !== null && leftTrace.parent._item !== parentItem) {
                  leftTrace = leftTrace.redone === null ? null : (0, internals_js_1.getItemCleanStart)(transaction, leftTrace.redone);
              }
              if (leftTrace !== null && leftTrace.parent._item === parentItem) {
                  left = leftTrace;
                  break;
              }
              left = left.left;
          }
          while (right !== null) {
              let rightTrace = right;
              // trace redone until parent matches
              while (rightTrace !== null && rightTrace.parent._item !== parentItem) {
                  rightTrace = rightTrace.redone === null ? null : (0, internals_js_1.getItemCleanStart)(transaction, rightTrace.redone);
              }
              if (rightTrace !== null && rightTrace.parent._item === parentItem) {
                  right = rightTrace;
                  break;
              }
              right = right.right;
          }
      }
      else {
          right = null;
          if (item.right && !ignoreRemoteMapChanges) {
              left = item;
              // Iterate right while right is in itemsToDelete
              // If it is intended to delete right while item is redone, we can expect that item should replace right.
              while (left !== null && left.right !== null && (0, internals_js_1.isDeleted)(itemsToDelete, left.right.id)) {
                  left = left.right;
              }
              // follow redone
              // trace redone until parent matches
              while (left !== null && left.redone !== null) {
                  left = (0, internals_js_1.getItemCleanStart)(transaction, left.redone);
              }
              if (left && left.right !== null) {
                  // It is not possible to redo this item because it conflicts with a
                  // change from another client
                  return null;
              }
          }
          else {
              left = parentType._map.get(item.parentSub) || null;
          }
      }
      const nextClock = (0, internals_js_1.getState)(store, ownClientID);
      const nextId = (0, internals_js_1.createID)(ownClientID, nextClock);
      const redoneItem = new Item(nextId, left, left && left.lastId, right, right && right.id, parentType, item.parentSub, item.content.copy());
      item.redone = nextId;
      (0, exports.keepItem)(redoneItem, true);
      redoneItem.integrate(transaction, 0);
      return redoneItem;
  };
  exports.redoItem = redoItem;
  /**
   * Abstract class that represents any content.
   */
  class Item extends internals_js_1.AbstractStruct {
      /**
       * @param {ID} id
       * @param {Item | null} left
       * @param {ID | null} origin
       * @param {Item | null} right
       * @param {ID | null} rightOrigin
       * @param {AbstractType<any>|ID|null} parent Is a type if integrated, is null if it is possible to copy parent from left or right, is ID before integration to search for it.
       * @param {string | null} parentSub
       * @param {AbstractContent} content
       */
      constructor(id, left, origin, right, rightOrigin, parent, parentSub, content) {
          super(id, content.getLength());
          this.origin = origin;
          this.left = left;
          this.right = right;
          this.rightOrigin = rightOrigin;
          this.parent = parent;
          this.parentSub = parentSub;
          this.redone = null;
          this.content = content;
          this.info = this.content.isCountable() ? binary.BIT2 : 0;
      }
      /**
       * This is used to mark the item as an indexed fast-search marker
       */
      set marker(isMarked) {
          if (((this.info & binary.BIT4) > 0) !== isMarked) {
              this.info ^= binary.BIT4;
          }
      }
      get marker() { return (this.info & binary.BIT4) > 0; }
      /** If true, do not garbage collect this Item. */
      get keep() { return (this.info & binary.BIT1) > 0; }
      set keep(doKeep) { if (this.keep !== doKeep) {
          this.info ^= binary.BIT1;
      } }
      get countable() { return (this.info & binary.BIT2) > 0; }
      /** Whether this item was deleted or not. */
      get deleted() {
          return (this.info & binary.BIT3) > 0;
      }
      set deleted(doDelete) {
          if (this.deleted !== doDelete) {
              this.info ^= binary.BIT3;
          }
      }
      markDeleted() { this.info |= binary.BIT3; }
      /**
       * Return the creator clientID of the missing op or define missing items and return null.
       */
      getMissing(transaction, store) {
          if (this.origin && this.origin.client !== this.id.client && this.origin.clock >= (0, internals_js_1.getState)(store, this.origin.client)) {
              return this.origin.client;
          }
          if (this.rightOrigin && this.rightOrigin.client !== this.id.client && this.rightOrigin.clock >= (0, internals_js_1.getState)(store, this.rightOrigin.client)) {
              return this.rightOrigin.client;
          }
          if (this.parent && this.parent.constructor === internals_js_1.ID && this.id.client !== this.parent.client && this.parent.clock >= (0, internals_js_1.getState)(store, this.parent.client)) {
              return this.parent.client;
          }
          // We have all missing ids, now find the items
          if (this.origin) {
              this.left = (0, internals_js_1.getItemCleanEnd)(transaction, store, this.origin);
              this.origin = this.left.lastId;
          }
          if (this.rightOrigin) {
              this.right = (0, internals_js_1.getItemCleanStart)(transaction, this.rightOrigin);
              this.rightOrigin = this.right.id;
          }
          if ((this.left && this.left.constructor === internals_js_1.GC) || (this.right && this.right.constructor === internals_js_1.GC)) {
              this.parent = null;
          }
          // only set parent if this shouldn't be garbage collected
          if (!this.parent) {
              if (this.left && this.left.constructor === Item) {
                  this.parent = this.left.parent;
                  this.parentSub = this.left.parentSub;
              }
              if (this.right && this.right.constructor === Item) {
                  this.parent = this.right.parent;
                  this.parentSub = this.right.parentSub;
              }
          }
          else if (this.parent.constructor === internals_js_1.ID) {
              const parentItem = (0, internals_js_1.getItem)(store, this.parent);
              if (parentItem.constructor === internals_js_1.GC) {
                  this.parent = null;
              }
              else {
                  this.parent = parentItem.content.type;
              }
          }
          return null;
      }
      integrate(transaction, offset) {
          if (offset > 0) {
              this.id.clock += offset;
              this.left = (0, internals_js_1.getItemCleanEnd)(transaction, transaction.doc.store, (0, internals_js_1.createID)(this.id.client, this.id.clock - 1));
              this.origin = this.left.lastId;
              this.content = this.content.splice(offset);
              this.length -= offset;
          }
          if (this.parent) {
              if ((!this.left && (!this.right || this.right.left !== null)) || (this.left && this.left.right !== this.right)) {
                  let left = this.left;
                  let o;
                  // set o to the first conflicting item
                  if (left !== null) {
                      o = left.right;
                  }
                  else if (this.parentSub !== null) {
                      o = this.parent._map.get(this.parentSub) || null;
                      while (o !== null && o.left !== null) {
                          o = o.left;
                      }
                  }
                  else {
                      o = this.parent._start;
                  }
                  // TODO: use something like DeleteSet here (a tree implementation would be best)
                  // @todo use global set definitions
                  const conflictingItems = new Set();
                  const itemsBeforeOrigin = new Set();
                  // Let c in conflictingItems, b in itemsBeforeOrigin
                  // ***{origin}bbbb{this}{c,b}{c,b}{o}***
                  // Note that conflictingItems is a subset of itemsBeforeOrigin
                  while (o !== null && o !== this.right) {
                      itemsBeforeOrigin.add(o);
                      conflictingItems.add(o);
                      if ((0, internals_js_1.compareIDs)(this.origin, o.origin)) {
                          // case 1
                          if (o.id.client < this.id.client) {
                              left = o;
                              conflictingItems.clear();
                          }
                          else if ((0, internals_js_1.compareIDs)(this.rightOrigin, o.rightOrigin)) {
                              // this and o are conflicting and point to the same integration points. The id decides which item comes first.
                              // Since this is to the left of o, we can break here
                              break;
                          } // else, o might be integrated before an item that this conflicts with. If so, we will find it in the next iterations
                      }
                      else if (o.origin !== null && itemsBeforeOrigin.has((0, internals_js_1.getItem)(transaction.doc.store, o.origin))) { // use getItem instead of getItemCleanEnd because we don't want / need to split items.
                          // case 2
                          if (!conflictingItems.has((0, internals_js_1.getItem)(transaction.doc.store, o.origin))) {
                              left = o;
                              conflictingItems.clear();
                          }
                      }
                      else {
                          break;
                      }
                      o = o.right;
                  }
                  this.left = left;
              }
              // reconnect left/right + update parent map/start if necessary
              if (this.left !== null) {
                  const right = this.left.right;
                  this.right = right;
                  this.left.right = this;
              }
              else {
                  let r;
                  if (this.parentSub !== null) {
                      r = this.parent._map.get(this.parentSub) || null;
                      while (r !== null && r.left !== null) {
                          r = r.left;
                      }
                  }
                  else {
                      r = this.parent._start;
                      this.parent._start = this;
                  }
                  this.right = r;
              }
              if (this.right !== null) {
                  this.right.left = this;
              }
              else if (this.parentSub !== null) {
                  // set as current parent value if right === null and this is parentSub
                  this.parent._map.set(this.parentSub, this);
                  if (this.left !== null) {
                      // this is the current attribute value of parent. delete right
                      this.left.delete(transaction);
                  }
              }
              // adjust length of parent
              if (this.parentSub === null && this.countable && !this.deleted) {
                  this.parent._length += this.length;
              }
              (0, internals_js_1.addStruct)(transaction.doc.store, this);
              this.content.integrate(transaction, this);
              // add parent to transaction.changed
              (0, internals_js_1.addChangedTypeToTransaction)(transaction, this.parent, this.parentSub);
              if ((this.parent._item !== null && this.parent._item.deleted) || (this.parentSub !== null && this.right !== null)) {
                  // delete if parent is deleted or if this is not the current attribute value of parent
                  this.delete(transaction);
              }
          }
          else {
              // parent is not defined. Integrate GC struct instead
              new internals_js_1.GC(this.id, this.length).integrate(transaction, 0);
          }
      }
      /** Returns the next non-deleted item */
      get next() {
          let n = this.right;
          while (n !== null && n.deleted) {
              n = n.right;
          }
          return n;
      }
      /** Returns the previous non-deleted item */
      get prev() {
          let n = this.left;
          while (n !== null && n.deleted) {
              n = n.left;
          }
          return n;
      }
      /**
       * Computes the last content address of this Item.
       */
      get lastId() {
          // allocating ids is pretty costly because of the amount of ids created, so we try to reuse whenever possible
          return this.length === 1 ? this.id : (0, internals_js_1.createID)(this.id.client, this.id.clock + this.length - 1);
      }
      /** Try to merge two items */
      mergeWith(right) {
          if (this.constructor === right.constructor &&
              (0, internals_js_1.compareIDs)(right.origin, this.lastId) &&
              this.right === right &&
              (0, internals_js_1.compareIDs)(this.rightOrigin, right.rightOrigin) &&
              this.id.client === right.id.client &&
              this.id.clock + this.length === right.id.clock &&
              this.deleted === right.deleted &&
              this.redone === null &&
              right.redone === null &&
              this.content.constructor === right.content.constructor &&
              this.content.mergeWith(right.content)) {
              const searchMarker = this.parent._searchMarker;
              if (searchMarker) {
                  searchMarker.forEach(marker => {
                      if (marker.p === right) {
                          // right is going to be "forgotten" so we need to update the marker
                          marker.p = this;
                          // adjust marker index
                          if (!this.deleted && this.countable) {
                              marker.index -= this.length;
                          }
                      }
                  });
              }
              if (right.keep) {
                  this.keep = true;
              }
              this.right = right.right;
              if (this.right !== null) {
                  this.right.left = this;
              }
              this.length += right.length;
              return true;
          }
          return false;
      }
      /** Mark this Item as deleted. */
      delete(transaction) {
          if (!this.deleted) {
              const parent = this.parent;
              // adjust the length of parent
              if (this.countable && this.parentSub === null) {
                  parent._length -= this.length;
              }
              this.markDeleted();
              (0, internals_js_1.addToDeleteSet)(transaction.deleteSet, this.id.client, this.id.clock, this.length);
              (0, internals_js_1.addChangedTypeToTransaction)(transaction, parent, this.parentSub);
              this.content.delete(transaction);
          }
      }
      gc(store, parentGCd) {
          if (!this.deleted) {
              throw error.unexpectedCase();
          }
          this.content.gc(store);
          if (parentGCd) {
              (0, internals_js_1.replaceStruct)(store, this, new internals_js_1.GC(this.id, this.length));
          }
          else {
              this.content = new internals_js_1.ContentDeleted(this.length);
          }
      }
      /**
       * Transform the properties of this type to binary and write it to an
       * BinaryEncoder.
       *
       * This is called when this Item is sent to a remote peer.
       */
      write(encoder, offset) {
          const origin = offset > 0 ? (0, internals_js_1.createID)(this.id.client, this.id.clock + offset - 1) : this.origin;
          const rightOrigin = this.rightOrigin;
          const parentSub = this.parentSub;
          const info = (this.content.getRef() & binary.BITS5) |
              (origin === null ? 0 : binary.BIT8) | // origin is defined
              (rightOrigin === null ? 0 : binary.BIT7) | // right origin is defined
              (parentSub === null ? 0 : binary.BIT6); // parentSub is non-null
          encoder.writeInfo(info);
          if (origin !== null) {
              encoder.writeLeftID(origin);
          }
          if (rightOrigin !== null) {
              encoder.writeRightID(rightOrigin);
          }
          if (origin === null && rightOrigin === null) {
              const parent = this.parent;
              if (parent._item !== undefined) {
                  const parentItem = parent._item;
                  if (parentItem === null) {
                      // parent type on y._map
                      // find the correct key
                      const ykey = (0, internals_js_1.findRootTypeKey)(parent);
                      encoder.writeParentInfo(true); // write parentYKey
                      encoder.writeString(ykey);
                  }
                  else {
                      encoder.writeParentInfo(false); // write parent id
                      encoder.writeLeftID(parentItem.id);
                  }
              }
              else if (parent.constructor === String) { // this edge case was added by differential updates
                  encoder.writeParentInfo(true); // write parentYKey
                  encoder.writeString(parent);
              }
              else if (parent.constructor === internals_js_1.ID) {
                  encoder.writeParentInfo(false); // write parent id
                  encoder.writeLeftID(parent);
              }
              else {
                  error.unexpectedCase();
              }
              if (parentSub !== null) {
                  encoder.writeString(parentSub);
              }
          }
          this.content.write(encoder, offset);
      }
  }
  exports.Item = Item;
  const readItemContent = (decoder, info) => {
      return exports.contentRefs[info & binary.BITS5](decoder);
  };
  exports.readItemContent = readItemContent;
  /**
   * A lookup map for reading Item content.
   */
  exports.contentRefs = [
      () => { error.unexpectedCase(); },
      internals_js_1.readContentDeleted,
      internals_js_1.readContentJSON,
      internals_js_1.readContentBinary,
      internals_js_1.readContentString,
      internals_js_1.readContentEmbed,
      internals_js_1.readContentFormat,
      internals_js_1.readContentType,
      internals_js_1.readContentAny,
      internals_js_1.readContentDoc,
      () => { error.unexpectedCase(); } // 10 - Skip is not ItemContent
  ];
  /**
   * Do not implement this class!
   */
  class AbstractContent {
      getLength() { throw error.methodUnimplemented(); }
      getContent() { throw error.methodUnimplemented(); }
      /**
       * Should return false if this Item is some kind of meta information
       * (e.g. format information).
       *
       * * Whether this Item should be addressable via `yarray.get(i)`
       * * Whether this Item should be counted when computing yarray.length
       */
      isCountable() { throw error.methodUnimplemented(); }
      copy() { throw error.methodUnimplemented(); }
      splice(offset) { throw error.methodUnimplemented(); }
      mergeWith(right) { throw error.methodUnimplemented(); }
      integrate(transaction, item) { throw error.methodUnimplemented(); }
      delete(transaction) { throw error.methodUnimplemented(); }
      gc(store) { throw error.methodUnimplemented(); }
      write(encoder, offset) { throw error.methodUnimplemented(); }
      getRef() { throw error.methodUnimplemented(); }
  }
  exports.AbstractContent = AbstractContent;
  });

  var Skip_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Skip = exports.structSkipRefNumber = void 0;


  exports.structSkipRefNumber = 10;
  class Skip {
      constructor(id, length) {
          this.id = id;
          this.length = length;
      }
      get deleted() { return true; }
      delete() { }
      mergeWith(right) {
          if (this.constructor !== right.constructor) {
              return false;
          }
          this.length += right.length;
          return true;
      }
      integrate(transaction, offset) {
          // skip structs cannot be integrated
          error.unexpectedCase();
      }
      write(encoder, offset) {
          encoder.writeInfo(exports.structSkipRefNumber);
          // write as VarUint because Skips can't make use of predictable length-encoding
          encoding.writeVarUint(encoder.restEncoder, this.length - offset);
      }
      getMissing(transaction, store) {
          return null;
      }
  }
  exports.Skip = Skip;
  });

  Object.defineProperty(exports, "__esModule", { value: true });

  var AbstractType_ = /*#__PURE__*/Object.freeze({
    __proto__: null
  });

  Object.defineProperty(exports, "__esModule", { value: true });

  var AbstractContent_ = /*#__PURE__*/Object.freeze({
    __proto__: null
  });

  Object.defineProperty(exports, "__esModule", { value: true });

  var AbstractStruct_ = /*#__PURE__*/Object.freeze({
    __proto__: null
  });

  var require$$40 = /*@__PURE__*/getAugmentedNamespace(AbstractType_);

  var require$$41 = /*@__PURE__*/getAugmentedNamespace(AbstractContent_);

  var require$$42 = /*@__PURE__*/getAugmentedNamespace(AbstractStruct_);

  var internals = createCommonjsModule(function (module, exports) {
  var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() { return m[k]; } };
      }
      Object.defineProperty(o, k2, desc);
  }) : (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      o[k2] = m[k];
  }));
  var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  __exportStar(AbstractConnector_1, exports);
  __exportStar(DeleteSet_1, exports);
  __exportStar(Doc_1, exports);
  __exportStar(UpdateDecoder, exports);
  __exportStar(UpdateEncoder, exports);
  __exportStar(encoding_1, exports);
  __exportStar(EventHandler_1, exports);
  __exportStar(ID_1, exports);
  __exportStar(isParentOf_1, exports);
  __exportStar(logging$1, exports);
  __exportStar(PermanentUserData_1, exports);
  __exportStar(RelativePosition_1, exports);
  __exportStar(Snapshot_1, exports);
  __exportStar(StructStore_1, exports);
  __exportStar(Transaction_1, exports);
  __exportStar(UndoManager_1, exports);
  __exportStar(updates, exports);
  __exportStar(YEvent_1, exports);
  __exportStar(AbstractType_1, exports);
  __exportStar(YArray_1, exports);
  __exportStar(YMap_1, exports);
  __exportStar(YText_1, exports);
  __exportStar(YXmlFragment_1, exports);
  __exportStar(YXmlElement_1, exports);
  __exportStar(YXmlEvent_1, exports);
  __exportStar(YXmlHook_1, exports);
  __exportStar(YXmlText_1, exports);
  __exportStar(AbstractStruct_1, exports);
  __exportStar(GC_1, exports);
  __exportStar(ContentBinary_1, exports);
  __exportStar(ContentDeleted_1, exports);
  __exportStar(ContentDoc_1, exports);
  __exportStar(ContentEmbed_1, exports);
  __exportStar(ContentFormat_1, exports);
  __exportStar(ContentJSON_1, exports);
  __exportStar(ContentAny_1, exports);
  __exportStar(ContentString_1, exports);
  __exportStar(ContentType_1, exports);
  __exportStar(Item_1, exports);
  __exportStar(Skip_1, exports);
  // ======================================================================================== //
  __exportStar(require$$40, exports);
  __exportStar(require$$41, exports);
  __exportStar(require$$42, exports);
  });

  var dist = createCommonjsModule(function (module, exports) {
  /** eslint-env browser */
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.createDocFromSnapshot = exports.typeMapGetSnapshot = exports.typeListToArraySnapshot = exports.getItem = exports.findIndexSS = exports.findRootTypeKey = exports.emptySnapshot = exports.snapshot = exports.cleanupYTextFormatting = exports.createDeleteSetFromStructStore = exports.createDeleteSet = exports.createSnapshot = exports.Snapshot = exports.getState = exports.compareIDs = exports.createID = exports.ID = exports.RelativePosition = exports.AbsolutePosition = exports.compareRelativePositions = exports.createAbsolutePositionFromRelativePosition = exports.createRelativePositionFromJSON = exports.createRelativePositionFromTypeIndex = exports.getTypeChildren = exports.AbstractType = exports.ContentType = exports.ContentString = exports.ContentAny = exports.ContentJSON = exports.ContentFormat = exports.ContentEmbed = exports.ContentDeleted = exports.ContentBinary = exports.GC = exports.AbstractStruct = exports.Item = exports.YEvent = exports.YTextEvent = exports.YArrayEvent = exports.YMapEvent = exports.YXmlEvent = exports.XmlFragment = exports.XmlElement = exports.XmlHook = exports.XmlText = exports.Text = exports.Map = exports.Array = exports.Transaction = exports.Doc = void 0;
  exports.UpdateEncoderV1 = exports.convertUpdateFormatV2ToV1 = exports.convertUpdateFormatV1ToV2 = exports.diffUpdateV2 = exports.diffUpdate = exports.decodeRelativePosition = exports.encodeRelativePosition = exports.encodeStateVectorFromUpdateV2 = exports.encodeStateVectorFromUpdate = exports.parseUpdateMetaV2 = exports.parseUpdateMeta = exports.mergeUpdatesV2 = exports.mergeUpdates = exports.logType = exports.AbstractConnector = exports.transact = exports.tryGc = exports.PermanentUserData = exports.equalSnapshots = exports.isParentOf = exports.isDeleted = exports.relativePositionToJSON = exports.decodeUpdateV2 = exports.decodeUpdate = exports.logUpdateV2 = exports.logUpdate = exports.decodeStateVector = exports.encodeSnapshotV2 = exports.decodeSnapshotV2 = exports.encodeSnapshot = exports.decodeSnapshot = exports.UndoManager = exports.encodeStateVector = exports.encodeStateAsUpdateV2 = exports.encodeStateAsUpdate = exports.readUpdateV2 = exports.readUpdate = exports.applyUpdateV2 = exports.applyUpdate = exports.iterateDeletedStructs = void 0;

  Object.defineProperty(exports, "Doc", { enumerable: true, get: function () { return internals_js_1.Doc; } });
  Object.defineProperty(exports, "Transaction", { enumerable: true, get: function () { return internals_js_1.Transaction; } });
  Object.defineProperty(exports, "Array", { enumerable: true, get: function () { return internals_js_1.YArray; } });
  Object.defineProperty(exports, "Map", { enumerable: true, get: function () { return internals_js_1.YMap; } });
  Object.defineProperty(exports, "Text", { enumerable: true, get: function () { return internals_js_1.YText; } });
  Object.defineProperty(exports, "XmlText", { enumerable: true, get: function () { return internals_js_1.YXmlText; } });
  Object.defineProperty(exports, "XmlHook", { enumerable: true, get: function () { return internals_js_1.YXmlHook; } });
  Object.defineProperty(exports, "XmlElement", { enumerable: true, get: function () { return internals_js_1.YXmlElement; } });
  Object.defineProperty(exports, "XmlFragment", { enumerable: true, get: function () { return internals_js_1.YXmlFragment; } });
  Object.defineProperty(exports, "YXmlEvent", { enumerable: true, get: function () { return internals_js_1.YXmlEvent; } });
  Object.defineProperty(exports, "YMapEvent", { enumerable: true, get: function () { return internals_js_1.YMapEvent; } });
  Object.defineProperty(exports, "YArrayEvent", { enumerable: true, get: function () { return internals_js_1.YArrayEvent; } });
  Object.defineProperty(exports, "YTextEvent", { enumerable: true, get: function () { return internals_js_1.YTextEvent; } });
  Object.defineProperty(exports, "YEvent", { enumerable: true, get: function () { return internals_js_1.YEvent; } });
  Object.defineProperty(exports, "Item", { enumerable: true, get: function () { return internals_js_1.Item; } });
  Object.defineProperty(exports, "AbstractStruct", { enumerable: true, get: function () { return internals_js_1.AbstractStruct; } });
  Object.defineProperty(exports, "GC", { enumerable: true, get: function () { return internals_js_1.GC; } });
  Object.defineProperty(exports, "ContentBinary", { enumerable: true, get: function () { return internals_js_1.ContentBinary; } });
  Object.defineProperty(exports, "ContentDeleted", { enumerable: true, get: function () { return internals_js_1.ContentDeleted; } });
  Object.defineProperty(exports, "ContentEmbed", { enumerable: true, get: function () { return internals_js_1.ContentEmbed; } });
  Object.defineProperty(exports, "ContentFormat", { enumerable: true, get: function () { return internals_js_1.ContentFormat; } });
  Object.defineProperty(exports, "ContentJSON", { enumerable: true, get: function () { return internals_js_1.ContentJSON; } });
  Object.defineProperty(exports, "ContentAny", { enumerable: true, get: function () { return internals_js_1.ContentAny; } });
  Object.defineProperty(exports, "ContentString", { enumerable: true, get: function () { return internals_js_1.ContentString; } });
  Object.defineProperty(exports, "ContentType", { enumerable: true, get: function () { return internals_js_1.ContentType; } });
  Object.defineProperty(exports, "AbstractType", { enumerable: true, get: function () { return internals_js_1.AbstractType; } });
  Object.defineProperty(exports, "getTypeChildren", { enumerable: true, get: function () { return internals_js_1.getTypeChildren; } });
  Object.defineProperty(exports, "createRelativePositionFromTypeIndex", { enumerable: true, get: function () { return internals_js_1.createRelativePositionFromTypeIndex; } });
  Object.defineProperty(exports, "createRelativePositionFromJSON", { enumerable: true, get: function () { return internals_js_1.createRelativePositionFromJSON; } });
  Object.defineProperty(exports, "createAbsolutePositionFromRelativePosition", { enumerable: true, get: function () { return internals_js_1.createAbsolutePositionFromRelativePosition; } });
  Object.defineProperty(exports, "compareRelativePositions", { enumerable: true, get: function () { return internals_js_1.compareRelativePositions; } });
  Object.defineProperty(exports, "AbsolutePosition", { enumerable: true, get: function () { return internals_js_1.AbsolutePosition; } });
  Object.defineProperty(exports, "RelativePosition", { enumerable: true, get: function () { return internals_js_1.RelativePosition; } });
  Object.defineProperty(exports, "ID", { enumerable: true, get: function () { return internals_js_1.ID; } });
  Object.defineProperty(exports, "createID", { enumerable: true, get: function () { return internals_js_1.createID; } });
  Object.defineProperty(exports, "compareIDs", { enumerable: true, get: function () { return internals_js_1.compareIDs; } });
  Object.defineProperty(exports, "getState", { enumerable: true, get: function () { return internals_js_1.getState; } });
  Object.defineProperty(exports, "Snapshot", { enumerable: true, get: function () { return internals_js_1.Snapshot; } });
  Object.defineProperty(exports, "createSnapshot", { enumerable: true, get: function () { return internals_js_1.createSnapshot; } });
  Object.defineProperty(exports, "createDeleteSet", { enumerable: true, get: function () { return internals_js_1.createDeleteSet; } });
  Object.defineProperty(exports, "createDeleteSetFromStructStore", { enumerable: true, get: function () { return internals_js_1.createDeleteSetFromStructStore; } });
  Object.defineProperty(exports, "cleanupYTextFormatting", { enumerable: true, get: function () { return internals_js_1.cleanupYTextFormatting; } });
  Object.defineProperty(exports, "snapshot", { enumerable: true, get: function () { return internals_js_1.snapshot; } });
  Object.defineProperty(exports, "emptySnapshot", { enumerable: true, get: function () { return internals_js_1.emptySnapshot; } });
  Object.defineProperty(exports, "findRootTypeKey", { enumerable: true, get: function () { return internals_js_1.findRootTypeKey; } });
  Object.defineProperty(exports, "findIndexSS", { enumerable: true, get: function () { return internals_js_1.findIndexSS; } });
  Object.defineProperty(exports, "getItem", { enumerable: true, get: function () { return internals_js_1.getItem; } });
  Object.defineProperty(exports, "typeListToArraySnapshot", { enumerable: true, get: function () { return internals_js_1.typeListToArraySnapshot; } });
  Object.defineProperty(exports, "typeMapGetSnapshot", { enumerable: true, get: function () { return internals_js_1.typeMapGetSnapshot; } });
  Object.defineProperty(exports, "createDocFromSnapshot", { enumerable: true, get: function () { return internals_js_1.createDocFromSnapshot; } });
  Object.defineProperty(exports, "iterateDeletedStructs", { enumerable: true, get: function () { return internals_js_1.iterateDeletedStructs; } });
  Object.defineProperty(exports, "applyUpdate", { enumerable: true, get: function () { return internals_js_1.applyUpdate; } });
  Object.defineProperty(exports, "applyUpdateV2", { enumerable: true, get: function () { return internals_js_1.applyUpdateV2; } });
  Object.defineProperty(exports, "readUpdate", { enumerable: true, get: function () { return internals_js_1.readUpdate; } });
  Object.defineProperty(exports, "readUpdateV2", { enumerable: true, get: function () { return internals_js_1.readUpdateV2; } });
  Object.defineProperty(exports, "encodeStateAsUpdate", { enumerable: true, get: function () { return internals_js_1.encodeStateAsUpdate; } });
  Object.defineProperty(exports, "encodeStateAsUpdateV2", { enumerable: true, get: function () { return internals_js_1.encodeStateAsUpdateV2; } });
  Object.defineProperty(exports, "encodeStateVector", { enumerable: true, get: function () { return internals_js_1.encodeStateVector; } });
  Object.defineProperty(exports, "UndoManager", { enumerable: true, get: function () { return internals_js_1.UndoManager; } });
  Object.defineProperty(exports, "decodeSnapshot", { enumerable: true, get: function () { return internals_js_1.decodeSnapshot; } });
  Object.defineProperty(exports, "encodeSnapshot", { enumerable: true, get: function () { return internals_js_1.encodeSnapshot; } });
  Object.defineProperty(exports, "decodeSnapshotV2", { enumerable: true, get: function () { return internals_js_1.decodeSnapshotV2; } });
  Object.defineProperty(exports, "encodeSnapshotV2", { enumerable: true, get: function () { return internals_js_1.encodeSnapshotV2; } });
  Object.defineProperty(exports, "decodeStateVector", { enumerable: true, get: function () { return internals_js_1.decodeStateVector; } });
  Object.defineProperty(exports, "logUpdate", { enumerable: true, get: function () { return internals_js_1.logUpdate; } });
  Object.defineProperty(exports, "logUpdateV2", { enumerable: true, get: function () { return internals_js_1.logUpdateV2; } });
  Object.defineProperty(exports, "decodeUpdate", { enumerable: true, get: function () { return internals_js_1.decodeUpdate; } });
  Object.defineProperty(exports, "decodeUpdateV2", { enumerable: true, get: function () { return internals_js_1.decodeUpdateV2; } });
  Object.defineProperty(exports, "relativePositionToJSON", { enumerable: true, get: function () { return internals_js_1.relativePositionToJSON; } });
  Object.defineProperty(exports, "isDeleted", { enumerable: true, get: function () { return internals_js_1.isDeleted; } });
  Object.defineProperty(exports, "isParentOf", { enumerable: true, get: function () { return internals_js_1.isParentOf; } });
  Object.defineProperty(exports, "equalSnapshots", { enumerable: true, get: function () { return internals_js_1.equalSnapshots; } });
  Object.defineProperty(exports, "PermanentUserData", { enumerable: true, get: function () { return internals_js_1.PermanentUserData; } });
  Object.defineProperty(exports, "tryGc", { enumerable: true, get: function () { return internals_js_1.tryGc; } });
  Object.defineProperty(exports, "transact", { enumerable: true, get: function () { return internals_js_1.transact; } });
  Object.defineProperty(exports, "AbstractConnector", { enumerable: true, get: function () { return internals_js_1.AbstractConnector; } });
  Object.defineProperty(exports, "logType", { enumerable: true, get: function () { return internals_js_1.logType; } });
  Object.defineProperty(exports, "mergeUpdates", { enumerable: true, get: function () { return internals_js_1.mergeUpdates; } });
  Object.defineProperty(exports, "mergeUpdatesV2", { enumerable: true, get: function () { return internals_js_1.mergeUpdatesV2; } });
  Object.defineProperty(exports, "parseUpdateMeta", { enumerable: true, get: function () { return internals_js_1.parseUpdateMeta; } });
  Object.defineProperty(exports, "parseUpdateMetaV2", { enumerable: true, get: function () { return internals_js_1.parseUpdateMetaV2; } });
  Object.defineProperty(exports, "encodeStateVectorFromUpdate", { enumerable: true, get: function () { return internals_js_1.encodeStateVectorFromUpdate; } });
  Object.defineProperty(exports, "encodeStateVectorFromUpdateV2", { enumerable: true, get: function () { return internals_js_1.encodeStateVectorFromUpdateV2; } });
  Object.defineProperty(exports, "encodeRelativePosition", { enumerable: true, get: function () { return internals_js_1.encodeRelativePosition; } });
  Object.defineProperty(exports, "decodeRelativePosition", { enumerable: true, get: function () { return internals_js_1.decodeRelativePosition; } });
  Object.defineProperty(exports, "diffUpdate", { enumerable: true, get: function () { return internals_js_1.diffUpdate; } });
  Object.defineProperty(exports, "diffUpdateV2", { enumerable: true, get: function () { return internals_js_1.diffUpdateV2; } });
  Object.defineProperty(exports, "convertUpdateFormatV1ToV2", { enumerable: true, get: function () { return internals_js_1.convertUpdateFormatV1ToV2; } });
  Object.defineProperty(exports, "convertUpdateFormatV2ToV1", { enumerable: true, get: function () { return internals_js_1.convertUpdateFormatV2ToV1; } });
  Object.defineProperty(exports, "UpdateEncoderV1", { enumerable: true, get: function () { return internals_js_1.UpdateEncoderV1; } });
  const glo = /** @type {any} */ (typeof globalThis !== 'undefined'
      ? globalThis
      : typeof window !== 'undefined'
          ? window
          // @ts-ignore
          : typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : {});
  const importIdentifier = '__ $YJS$ __';
  if (glo[importIdentifier] === true) {
      /**
       * Dear reader of this message. Please take this seriously.
       *
       * If you see this message, make sure that you only import one version of Yjs. In many cases,
       * your package manager installs two versions of Yjs that are used by different packages within your project.
       * Another reason for this message is that some parts of your project use the commonjs version of Yjs
       * and others use the EcmaScript version of Yjs.
       *
       * This often leads to issues that are hard to debug. We often need to perform constructor checks,
       * e.g. `struct instanceof GC`. If you imported different versions of Yjs, it is impossible for us to
       * do the constructor checks anymore - which might break the CRDT algorithm.
       *
       * https://github.com/yjs/yjs/issues/438
       */
      console.error('Yjs was already imported. This breaks constructor checks and will lead to issues! - https://github.com/yjs/yjs/issues/438');
  }
  glo[importIdentifier] = true;
  });

  /**
   * @module awareness-protocol
   */

  const outdatedTimeout = 30000;

  /**
   * @typedef {Object} MetaClientState
   * @property {number} MetaClientState.clock
   * @property {number} MetaClientState.lastUpdated unix timestamp
   */

  /**
   * The Awareness class implements a simple shared state protocol that can be used for non-persistent data like awareness information
   * (cursor, username, status, ..). Each client can update its own local state and listen to state changes of
   * remote clients. Every client may set a state of a remote peer to `null` to mark the client as offline.
   *
   * Each client is identified by a unique client id (something we borrow from `doc.clientID`). A client can override
   * its own state by propagating a message with an increasing timestamp (`clock`). If such a message is received, it is
   * applied if the known state of that client is older than the new state (`clock < newClock`). If a client thinks that
   * a remote client is offline, it may propagate a message with
   * `{ clock: currentClientClock, state: null, client: remoteClient }`. If such a
   * message is received, and the known clock of that client equals the received clock, it will override the state with `null`.
   *
   * Before a client disconnects, it should propagate a `null` state with an updated clock.
   *
   * Awareness states must be updated every 30 seconds. Otherwise the Awareness instance will delete the client state.
   *
   * @extends {Observable<string>}
   */
  class Awareness extends Observable {
    /**
     * @param {Y.Doc} doc
     */
    constructor (doc) {
      super();
      this.doc = doc;
      /**
       * @type {number}
       */
      this.clientID = doc.clientID;
      /**
       * Maps from client id to client state
       * @type {Map<number, Object<string, any>>}
       */
      this.states = new Map();
      /**
       * @type {Map<number, MetaClientState>}
       */
      this.meta = new Map();
      this._checkInterval = /** @type {any} */ (setInterval(() => {
        const now = getUnixTime();
        if (this.getLocalState() !== null && (outdatedTimeout / 2 <= now - /** @type {{lastUpdated:number}} */ (this.meta.get(this.clientID)).lastUpdated)) {
          // renew local clock
          this.setLocalState(this.getLocalState());
        }
        /**
         * @type {Array<number>}
         */
        const remove = [];
        this.meta.forEach((meta, clientid) => {
          if (clientid !== this.clientID && outdatedTimeout <= now - meta.lastUpdated && this.states.has(clientid)) {
            remove.push(clientid);
          }
        });
        if (remove.length > 0) {
          removeAwarenessStates(this, remove, 'timeout');
        }
      }, floor(outdatedTimeout / 10)));
      doc.on('destroy', () => {
        this.destroy();
      });
      this.setLocalState({});
    }

    destroy () {
      this.emit('destroy', [this]);
      this.setLocalState(null);
      super.destroy();
      clearInterval(this._checkInterval);
    }

    /**
     * @return {Object<string,any>|null}
     */
    getLocalState () {
      return this.states.get(this.clientID) || null
    }

    /**
     * @param {Object<string,any>|null} state
     */
    setLocalState (state) {
      const clientID = this.clientID;
      const currLocalMeta = this.meta.get(clientID);
      const clock = currLocalMeta === undefined ? 0 : currLocalMeta.clock + 1;
      const prevState = this.states.get(clientID);
      if (state === null) {
        this.states.delete(clientID);
      } else {
        this.states.set(clientID, state);
      }
      this.meta.set(clientID, {
        clock,
        lastUpdated: getUnixTime()
      });
      const added = [];
      const updated = [];
      const filteredUpdated = [];
      const removed = [];
      if (state === null) {
        removed.push(clientID);
      } else if (prevState == null) {
        if (state != null) {
          added.push(clientID);
        }
      } else {
        updated.push(clientID);
        if (!equalityDeep(prevState, state)) {
          filteredUpdated.push(clientID);
        }
      }
      if (added.length > 0 || filteredUpdated.length > 0 || removed.length > 0) {
        this.emit('change', [{ added, updated: filteredUpdated, removed }, 'local']);
      }
      this.emit('update', [{ added, updated, removed }, 'local']);
    }

    /**
     * @param {string} field
     * @param {any} value
     */
    setLocalStateField (field, value) {
      const state = this.getLocalState();
      if (state !== null) {
        this.setLocalState({
          ...state,
          [field]: value
        });
      }
    }

    /**
     * @return {Map<number,Object<string,any>>}
     */
    getStates () {
      return this.states
    }
  }

  /**
   * Mark (remote) clients as inactive and remove them from the list of active peers.
   * This change will be propagated to remote clients.
   *
   * @param {Awareness} awareness
   * @param {Array<number>} clients
   * @param {any} origin
   */
  const removeAwarenessStates = (awareness, clients, origin) => {
    const removed = [];
    for (let i = 0; i < clients.length; i++) {
      const clientID = clients[i];
      if (awareness.states.has(clientID)) {
        awareness.states.delete(clientID);
        if (clientID === awareness.clientID) {
          const curMeta = /** @type {MetaClientState} */ (awareness.meta.get(clientID));
          awareness.meta.set(clientID, {
            clock: curMeta.clock + 1,
            lastUpdated: getUnixTime()
          });
        }
        removed.push(clientID);
      }
    }
    if (removed.length > 0) {
      awareness.emit('change', [{ added: [], updated: [], removed }, origin]);
      awareness.emit('update', [{ added: [], updated: [], removed }, origin]);
    }
  };

  /**
   * @param {Awareness} awareness
   * @param {Array<number>} clients
   * @return {Uint8Array}
   */
  const encodeAwarenessUpdate = (awareness, clients, states = awareness.states) => {
    const len = clients.length;
    const encoder = createEncoder();
    writeVarUint(encoder, len);
    for (let i = 0; i < len; i++) {
      const clientID = clients[i];
      const state = states.get(clientID) || null;
      const clock = /** @type {MetaClientState} */ (awareness.meta.get(clientID)).clock;
      writeVarUint(encoder, clientID);
      writeVarUint(encoder, clock);
      writeVarString(encoder, JSON.stringify(state));
    }
    return toUint8Array(encoder)
  };

  /**
   * @param {Awareness} awareness
   * @param {Uint8Array} update
   * @param {any} origin This will be added to the emitted change event
   */
  const applyAwarenessUpdate = (awareness, update, origin) => {
    const decoder = createDecoder(update);
    const timestamp = getUnixTime();
    const added = [];
    const updated = [];
    const filteredUpdated = [];
    const removed = [];
    const len = readVarUint(decoder);
    for (let i = 0; i < len; i++) {
      const clientID = readVarUint(decoder);
      let clock = readVarUint(decoder);
      const state = JSON.parse(readVarString(decoder));
      const clientMeta = awareness.meta.get(clientID);
      const prevState = awareness.states.get(clientID);
      const currClock = clientMeta === undefined ? 0 : clientMeta.clock;
      if (currClock < clock || (currClock === clock && state === null && awareness.states.has(clientID))) {
        if (state === null) {
          // never let a remote client remove this local state
          if (clientID === awareness.clientID && awareness.getLocalState() != null) {
            // remote client removed the local state. Do not remote state. Broadcast a message indicating
            // that this client still exists by increasing the clock
            clock++;
          } else {
            awareness.states.delete(clientID);
          }
        } else {
          awareness.states.set(clientID, state);
        }
        awareness.meta.set(clientID, {
          clock,
          lastUpdated: timestamp
        });
        if (clientMeta === undefined && state !== null) {
          added.push(clientID);
        } else if (clientMeta !== undefined && state === null) {
          removed.push(clientID);
        } else if (state !== null) {
          if (!equalityDeep(state, prevState)) {
            filteredUpdated.push(clientID);
          }
          updated.push(clientID);
        }
      }
    }
    if (added.length > 0 || filteredUpdated.length > 0 || removed.length > 0) {
      awareness.emit('change', [{
        added, updated: filteredUpdated, removed
      }, origin]);
    }
    if (added.length > 0 || updated.length > 0 || removed.length > 0) {
      awareness.emit('update', [{
        added, updated, removed
      }, origin]);
    }
  };

  /**
   * @param {t.TestCase} tc
   */
  const testAwareness = tc => {
    const doc1 = new dist.Doc();
    doc1.clientID = 0;
    const doc2 = new dist.Doc();
    doc2.clientID = 1;
    const aw1 = new Awareness(doc1);
    const aw2 = new Awareness(doc2);
    aw1.on('update', /** @param {any} p */ ({ added, updated, removed }) => {
      const enc = encodeAwarenessUpdate(aw1, added.concat(updated).concat(removed));
      applyAwarenessUpdate(aw2, enc, 'custom');
    });
    let lastChangeLocal = /** @type {any} */ (null);
    aw1.on('change', /** @param {any} change */ change => {
      lastChangeLocal = change;
    });
    let lastChange = /** @type {any} */ (null);
    aw2.on('change', /** @param {any} change */ change => {
      lastChange = change;
    });
    aw1.setLocalState({ x: 3 });
    compare(aw2.getStates().get(0), { x: 3 });
    assert(/** @type {any} */ (aw2.meta.get(0)).clock === 1);
    compare(lastChange.added, [0]);
    // When creating an Awareness instance, the the local client is already marked as available, so it is not updated.
    compare(lastChangeLocal, { added: [], updated: [0], removed: [] });

    // update state
    lastChange = null;
    lastChangeLocal = null;
    aw1.setLocalState({ x: 4 });
    compare(aw2.getStates().get(0), { x: 4 });
    compare(lastChangeLocal, { added: [], updated: [0], removed: [] });
    compare(lastChangeLocal, lastChange);

    lastChange = null;
    lastChangeLocal = null;
    aw1.setLocalState({ x: 4 });
    assert(lastChange === null);
    assert(/** @type {any} */ (aw2.meta.get(0)).clock === 3);
    compare(lastChangeLocal, lastChange);
    aw1.setLocalState(null);
    assert(lastChange.removed.length === 1);
    compare(aw1.getStates().get(0), undefined);
    compare(lastChangeLocal, lastChange);
  };

  var awareness = /*#__PURE__*/Object.freeze({
    __proto__: null,
    testAwareness: testAwareness
  });

  /* istanbul ignore if */
  if (isBrowser) {
    createVConsole(document.body);
  }

  runTests({
    awareness
  }).then(success => {
    /* istanbul ignore next */
    if (isNode) {
      process.exit(success ? 0 : 1);
    }
  });

})();
//# sourceMappingURL=test.js.map

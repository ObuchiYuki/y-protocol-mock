'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Y = require('yjs-typescript');
var encoding = require('lib0/dist/encoding.cjs');
var decoding = require('lib0/dist/decoding.cjs');
var time = require('lib0/dist/time.cjs');
var math = require('lib0/dist/math.cjs');
var observable = require('lib0/dist/observable.cjs');
var f = require('lib0/dist/function.cjs');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var Y__namespace = /*#__PURE__*/_interopNamespace(Y);
var encoding__namespace = /*#__PURE__*/_interopNamespace(encoding);
var decoding__namespace = /*#__PURE__*/_interopNamespace(decoding);
var time__namespace = /*#__PURE__*/_interopNamespace(time);
var math__namespace = /*#__PURE__*/_interopNamespace(math);
var f__namespace = /*#__PURE__*/_interopNamespace(f);

const messagePermissionDenied = 0;

/**
 * @param {encoding.Encoder} encoder
 * @param {string} reason
 */
const writePermissionDenied = (encoder, reason) => {
  encoding__namespace.writeVarUint(encoder, messagePermissionDenied);
  encoding__namespace.writeVarString(encoder, reason);
};

/**
 * @callback PermissionDeniedHandler
 * @param {any} y
 * @param {string} reason
 */

/**
 *
 * @param {decoding.Decoder} decoder
 * @param {Y.Doc} y
 * @param {PermissionDeniedHandler} permissionDeniedHandler
 */
const readAuthMessage = (decoder, y, permissionDeniedHandler) => {
  switch (decoding__namespace.readVarUint(decoder)) {
    case messagePermissionDenied: permissionDeniedHandler(y, decoding__namespace.readVarString(decoder));
  }
};

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
class Awareness extends observable.Observable {
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
      const now = time__namespace.getUnixTime();
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
    }, math__namespace.floor(outdatedTimeout / 10)));
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
      lastUpdated: time__namespace.getUnixTime()
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
      if (!f__namespace.equalityDeep(prevState, state)) {
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
          lastUpdated: time__namespace.getUnixTime()
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
  const encoder = encoding__namespace.createEncoder();
  encoding__namespace.writeVarUint(encoder, len);
  for (let i = 0; i < len; i++) {
    const clientID = clients[i];
    const state = states.get(clientID) || null;
    const clock = /** @type {MetaClientState} */ (awareness.meta.get(clientID)).clock;
    encoding__namespace.writeVarUint(encoder, clientID);
    encoding__namespace.writeVarUint(encoder, clock);
    encoding__namespace.writeVarString(encoder, JSON.stringify(state));
  }
  return encoding__namespace.toUint8Array(encoder)
};

/**
 * Modify the content of an awareness update before re-encoding it to an awareness update.
 *
 * This might be useful when you have a central server that wants to ensure that clients
 * cant hijack somebody elses identity.
 *
 * @param {Uint8Array} update
 * @param {function(any):any} modify
 * @return {Uint8Array}
 */
const modifyAwarenessUpdate = (update, modify) => {
  const decoder = decoding__namespace.createDecoder(update);
  const encoder = encoding__namespace.createEncoder();
  const len = decoding__namespace.readVarUint(decoder);
  encoding__namespace.writeVarUint(encoder, len);
  for (let i = 0; i < len; i++) {
    const clientID = decoding__namespace.readVarUint(decoder);
    const clock = decoding__namespace.readVarUint(decoder);
    const state = JSON.parse(decoding__namespace.readVarString(decoder));
    const modifiedState = modify(state);
    encoding__namespace.writeVarUint(encoder, clientID);
    encoding__namespace.writeVarUint(encoder, clock);
    encoding__namespace.writeVarString(encoder, JSON.stringify(modifiedState));
  }
  return encoding__namespace.toUint8Array(encoder)
};

/**
 * @param {Awareness} awareness
 * @param {Uint8Array} update
 * @param {any} origin This will be added to the emitted change event
 */
const applyAwarenessUpdate = (awareness, update, origin) => {
  const decoder = decoding__namespace.createDecoder(update);
  const timestamp = time__namespace.getUnixTime();
  const added = [];
  const updated = [];
  const filteredUpdated = [];
  const removed = [];
  const len = decoding__namespace.readVarUint(decoder);
  for (let i = 0; i < len; i++) {
    const clientID = decoding__namespace.readVarUint(decoder);
    let clock = decoding__namespace.readVarUint(decoder);
    const state = JSON.parse(decoding__namespace.readVarString(decoder));
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
        if (!f__namespace.equalityDeep(state, prevState)) {
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
 * @module sync-protocol
 */

/**
 * @typedef {Map<number, number>} StateMap
 */

/**
 * Core Yjs defines two message types:
 * • YjsSyncStep1: Includes the State Set of the sending client. When received, the client should reply with YjsSyncStep2.
 * • YjsSyncStep2: Includes all missing structs and the complete delete set. When received, the client is assured that it
 *   received all information from the remote client.
 *
 * In a peer-to-peer network, you may want to introduce a SyncDone message type. Both parties should initiate the connection
 * with SyncStep1. When a client received SyncStep2, it should reply with SyncDone. When the local client received both
 * SyncStep2 and SyncDone, it is assured that it is synced to the remote client.
 *
 * In a client-server model, you want to handle this differently: The client should initiate the connection with SyncStep1.
 * When the server receives SyncStep1, it should reply with SyncStep2 immediately followed by SyncStep1. The client replies
 * with SyncStep2 when it receives SyncStep1. Optionally the server may send a SyncDone after it received SyncStep2, so the
 * client knows that the sync is finished.  There are two reasons for this more elaborated sync model: 1. This protocol can
 * easily be implemented on top of http and websockets. 2. The server should only reply to requests, and not initiate them.
 * Therefore it is necessary that the client initiates the sync.
 *
 * Construction of a message:
 * [messageType : varUint, message definition..]
 *
 * Note: A message does not include information about the room name. This must to be handled by the upper layer protocol!
 *
 * stringify[messageType] stringifies a message definition (messageType is already read from the bufffer)
 */

const messageYjsSyncStep1 = 0;
const messageYjsSyncStep2 = 1;
const messageYjsUpdate = 2;

/**
 * Create a sync step 1 message based on the state of the current shared document.
 *
 * @param {encoding.Encoder} encoder
 * @param {Y.Doc} doc
 */
const writeSyncStep1 = (encoder, doc) => {
  encoding__namespace.writeVarUint(encoder, messageYjsSyncStep1);
  const sv = Y__namespace.encodeStateVector(doc);
  encoding__namespace.writeVarUint8Array(encoder, sv);
};

/**
 * @param {encoding.Encoder} encoder
 * @param {Y.Doc} doc
 * @param {Uint8Array} [encodedStateVector]
 */
const writeSyncStep2 = (encoder, doc, encodedStateVector) => {
  encoding__namespace.writeVarUint(encoder, messageYjsSyncStep2);
  encoding__namespace.writeVarUint8Array(encoder, Y__namespace.encodeStateAsUpdate(doc, encodedStateVector));
};

/**
 * Read SyncStep1 message and reply with SyncStep2.
 *
 * @param {decoding.Decoder} decoder The reply to the received message
 * @param {encoding.Encoder} encoder The received message
 * @param {Y.Doc} doc
 */
const readSyncStep1 = (decoder, encoder, doc) =>
  writeSyncStep2(encoder, doc, decoding__namespace.readVarUint8Array(decoder));

/**
 * Read and apply Structs and then DeleteStore to a y instance.
 *
 * @param {decoding.Decoder} decoder
 * @param {Y.Doc} doc
 * @param {any} transactionOrigin
 */
const readSyncStep2 = (decoder, doc, transactionOrigin) => {
  try {
    Y__namespace.applyUpdate(doc, decoding__namespace.readVarUint8Array(decoder), transactionOrigin);
  } catch (error) {
    // This catches errors that are thrown by event handlers
    console.error('Caught error while handling a Yjs update', error);
  }
};

/**
 * @param {encoding.Encoder} encoder
 * @param {Uint8Array} update
 */
const writeUpdate = (encoder, update) => {
  encoding__namespace.writeVarUint(encoder, messageYjsUpdate);
  encoding__namespace.writeVarUint8Array(encoder, update);
};

/**
 * Read and apply Structs and then DeleteStore to a y instance.
 *
 * @param {decoding.Decoder} decoder
 * @param {Y.Doc} doc
 * @param {any} transactionOrigin
 */
const readUpdate = readSyncStep2;

/**
 * @param {decoding.Decoder} decoder A message received from another client
 * @param {encoding.Encoder} encoder The reply message. Does not need to be sent if empty.
 * @param {Y.Doc} doc
 * @param {any} transactionOrigin
 */
const readSyncMessage = (decoder, encoder, doc, transactionOrigin) => {
  const messageType = decoding__namespace.readVarUint(decoder);
  switch (messageType) {
    case messageYjsSyncStep1:
      readSyncStep1(decoder, encoder, doc);
      break
    case messageYjsSyncStep2:
      readSyncStep2(decoder, doc, transactionOrigin);
      break
    case messageYjsUpdate:
      readUpdate(decoder, doc, transactionOrigin);
      break
    default:
      throw new Error('Unknown message type')
  }
  return messageType
};

exports.Awareness = Awareness;
exports.applyAwarenessUpdate = applyAwarenessUpdate;
exports.encodeAwarenessUpdate = encodeAwarenessUpdate;
exports.messagePermissionDenied = messagePermissionDenied;
exports.messageYjsSyncStep1 = messageYjsSyncStep1;
exports.messageYjsSyncStep2 = messageYjsSyncStep2;
exports.messageYjsUpdate = messageYjsUpdate;
exports.modifyAwarenessUpdate = modifyAwarenessUpdate;
exports.outdatedTimeout = outdatedTimeout;
exports.readAuthMessage = readAuthMessage;
exports.readSyncMessage = readSyncMessage;
exports.readSyncStep1 = readSyncStep1;
exports.readSyncStep2 = readSyncStep2;
exports.readUpdate = readUpdate;
exports.removeAwarenessStates = removeAwarenessStates;
exports.writePermissionDenied = writePermissionDenied;
exports.writeSyncStep1 = writeSyncStep1;
exports.writeSyncStep2 = writeSyncStep2;
exports.writeUpdate = writeUpdate;
//# sourceMappingURL=index.cjs.map

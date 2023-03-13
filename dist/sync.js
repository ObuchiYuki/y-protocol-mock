"use strict";
/**
 * @module sync-protocol
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.readSyncMessage = exports.readUpdate = exports.writeUpdate = exports.readSyncStep2 = exports.readSyncStep1 = exports.writeSyncStep2 = exports.writeSyncStep1 = exports.messageYjsUpdate = exports.messageYjsSyncStep2 = exports.messageYjsSyncStep1 = void 0;
const encoding = require("lib0/encoding");
const decoding = require("lib0/decoding");
const Y = require("yjs-typescript");
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
exports.messageYjsSyncStep1 = 0;
exports.messageYjsSyncStep2 = 1;
exports.messageYjsUpdate = 2;
/**
 * Create a sync step 1 message based on the state of the current shared document.
 *
 * @param {encoding.Encoder} encoder
 * @param {Y.Doc} doc
 */
const writeSyncStep1 = (encoder, doc) => {
    encoding.writeVarUint(encoder, exports.messageYjsSyncStep1);
    const sv = Y.encodeStateVector(doc);
    encoding.writeVarUint8Array(encoder, sv);
};
exports.writeSyncStep1 = writeSyncStep1;
/**
 * @param {encoding.Encoder} encoder
 * @param {Y.Doc} doc
 * @param {Uint8Array} [encodedStateVector]
 */
const writeSyncStep2 = (encoder, doc, encodedStateVector) => {
    encoding.writeVarUint(encoder, exports.messageYjsSyncStep2);
    encoding.writeVarUint8Array(encoder, Y.encodeStateAsUpdate(doc, encodedStateVector));
};
exports.writeSyncStep2 = writeSyncStep2;
/**
 * Read SyncStep1 message and reply with SyncStep2.
 *
 * @param {decoding.Decoder} decoder The reply to the received message
 * @param {encoding.Encoder} encoder The received message
 * @param {Y.Doc} doc
 */
const readSyncStep1 = (decoder, encoder, doc) => (0, exports.writeSyncStep2)(encoder, doc, decoding.readVarUint8Array(decoder));
exports.readSyncStep1 = readSyncStep1;
/**
 * Read and apply Structs and then DeleteStore to a y instance.
 *
 * @param {decoding.Decoder} decoder
 * @param {Y.Doc} doc
 * @param {any} transactionOrigin
 */
const readSyncStep2 = (decoder, doc, transactionOrigin) => {
    try {
        Y.applyUpdate(doc, decoding.readVarUint8Array(decoder), transactionOrigin);
    }
    catch (error) {
        // This catches errors that are thrown by event handlers
        console.error('Caught error while handling a Yjs update', error);
    }
};
exports.readSyncStep2 = readSyncStep2;
/**
 * @param {encoding.Encoder} encoder
 * @param {Uint8Array} update
 */
const writeUpdate = (encoder, update) => {
    encoding.writeVarUint(encoder, exports.messageYjsUpdate);
    encoding.writeVarUint8Array(encoder, update);
};
exports.writeUpdate = writeUpdate;
/**
 * Read and apply Structs and then DeleteStore to a y instance.
 *
 * @param {decoding.Decoder} decoder
 * @param {Y.Doc} doc
 * @param {any} transactionOrigin
 */
exports.readUpdate = exports.readSyncStep2;
/**
 * @param {decoding.Decoder} decoder A message received from another client
 * @param {encoding.Encoder} encoder The reply message. Does not need to be sent if empty.
 * @param {Y.Doc} doc
 * @param {any} transactionOrigin
 */
const readSyncMessage = (decoder, encoder, doc, transactionOrigin) => {
    const messageType = decoding.readVarUint(decoder);
    switch (messageType) {
        case exports.messageYjsSyncStep1:
            (0, exports.readSyncStep1)(decoder, encoder, doc);
            break;
        case exports.messageYjsSyncStep2:
            (0, exports.readSyncStep2)(decoder, doc, transactionOrigin);
            break;
        case exports.messageYjsUpdate:
            (0, exports.readUpdate)(decoder, doc, transactionOrigin);
            break;
        default:
            throw new Error('Unknown message type');
    }
    return messageType;
};
exports.readSyncMessage = readSyncMessage;

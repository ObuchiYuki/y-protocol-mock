"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readAuthMessage = exports.writePermissionDenied = exports.messagePermissionDenied = void 0;
const Y = require("yjs-typescript"); // eslint-disable-line
const encoding = require("lib0/encoding");
const decoding = require("lib0/decoding");
exports.messagePermissionDenied = 0;
/**
 * @param {encoding.Encoder} encoder
 * @param {string} reason
 */
const writePermissionDenied = (encoder, reason) => {
    encoding.writeVarUint(encoder, exports.messagePermissionDenied);
    encoding.writeVarString(encoder, reason);
};
exports.writePermissionDenied = writePermissionDenied;
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
    switch (decoding.readVarUint(decoder)) {
        case exports.messagePermissionDenied: permissionDeniedHandler(y, decoding.readVarString(decoder));
    }
};
exports.readAuthMessage = readAuthMessage;

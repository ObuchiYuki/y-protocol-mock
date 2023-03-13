"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("lib0/testing");
const log = require("lib0/logging");
const awareness = require("./awareness.test.js");
const environment_1 = require("lib0/environment");
/* istanbul ignore if */
if (environment_1.isBrowser) {
    log.createVConsole(document.body);
}
(0, testing_1.runTests)({
    awareness
}).then(success => {
    /* istanbul ignore next */
    if (environment_1.isNode) {
        process.exit(success ? 0 : 1);
    }
});

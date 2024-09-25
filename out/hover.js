"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCLHoverProvider = void 0;
const hoverRegex = /(0x[\da-fA-F][_\da-fA-F]*)|(0b[01][_01]*)|(\d[_\d]*(\.\d+)?)|(\.?[A-Za-z_]\w*(\\@|:*))/g;
const InstructionRegex = /^[\\s]*[A-Z][A-Z]*/;
class CCLHoverProvider {
    constructor() {
    }
    provideHover(document, position, token) {
        const range = document.getWordRangeAtPosition(position, hoverRegex);
        if (range) {
            const text = document.getText(range);
        }
        return null;
    }
}
exports.CCLHoverProvider = CCLHoverProvider;

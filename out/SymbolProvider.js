"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CCLDocumentSymbolProvider = void 0;
const vscode = __importStar(require("vscode"));
const GlobalVariabels_1 = require("./GlobalVariabels");
let symbols = [];
class CCLDocumentSymbolProvider {
    constructor() {
    }
    provideDocumentSymbols(document, token) {
        symbols = [];
        let text = document.getText();
        let lines = text.split(GlobalVariabels_1.NewLine);
        for (let index = 0; index < lines.length; index++) {
            const line = lines[index].split("\\\\")[0].split(':')[1];
            const lineTokens = line.split('.');
            for (let tokenIndex = 0; tokenIndex < lineTokens.length; tokenIndex++) {
                const token = lineTokens[tokenIndex];
                const tokens = token.split(' ');
                if (tokens.length == 0) {
                    continue;
                }
                if (tokens.length == 1) {
                    continue;
                }
                if (tokens[0] == "func" || tokens[0] == "function") {
                    let charIndex = line.indexOf(tokens[1]) + 8;
                    let name = tokens[1].split('(')[0];
                    NewSymbol(name, "function", vscode.SymbolKind.Function, new vscode.Range(index, charIndex, index, charIndex + name.length));
                }
            }
        }
        return symbols;
    }
}
exports.CCLDocumentSymbolProvider = CCLDocumentSymbolProvider;
function NewSymbol(name, detail, symbolKind, symbolPostion) {
    let symbol = new vscode.DocumentSymbol(name, detail, symbolKind, symbolPostion, symbolPostion);
    symbols.push(symbol);
}

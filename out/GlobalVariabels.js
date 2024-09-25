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
exports.GetSymbols = exports.CompletionItemOutput = exports.NewLine = exports.LangId = exports.URIS = exports.FilePaths = exports.GlobalLabels = exports.Labels = exports.Variabels = exports.RegisterTooltipFilePath = exports.InstructionTooltipFilePath = void 0;
const vscode = __importStar(require("vscode"));
let basePath = "C:/Users/bjorn/Desktop/VideoProjects/GamingCPU_Project/languages/assembly/bcg-assembly-language";
exports.InstructionTooltipFilePath = basePath + "/files/Tooltips.md";
exports.RegisterTooltipFilePath = basePath + "/files/TooltipsRegister.md";
exports.Variabels = [];
exports.Labels = [];
exports.GlobalLabels = [];
exports.FilePaths = [];
exports.URIS = new Set();
exports.LangId = "ccl";
exports.NewLine = vscode.window.activeTextEditor?.document.eol === vscode.EndOfLine.LF ? "\n" : "\r\n";
exports.CompletionItemOutput = [];
function GetSymbols(document) {
    exports.Variabels = [];
    exports.Labels = [];
    exports.GlobalLabels = [];
    for (let docIndex = 0; docIndex < exports.FilePaths.length; docIndex++) {
        const doc = exports.FilePaths[docIndex];
        for (let i = 0; i < doc.lineCount; i++) {
            const line = doc.lineAt(i).text.replace(/[\s]*\;\s/, "");
            if (line.trim().startsWith('$') && doc.uri === document.uri) {
                if (exports.Variabels.includes(line) === false) {
                    exports.Variabels.push(line.replace('$', '').split(' ', 2)[0]);
                }
            }
            if (line.trim().endsWith(':') && line.trim().toLowerCase().startsWith(".global")) {
                if (exports.GlobalLabels.includes(line.trim()) === false) {
                    exports.GlobalLabels.push(line.split(' ')[1].replace(":", ""));
                }
            }
            else if (line.trim().endsWith(':') && doc.uri === document.uri) {
                if (exports.Labels.includes(line.trim()) === false) {
                    exports.Labels.push(line.replace(':', '').split(' ')[0].trimStart());
                }
            }
        }
    }
}
exports.GetSymbols = GetSymbols;

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
exports.provideError = void 0;
const vscode = __importStar(require("vscode"));
const GlobalShit = __importStar(require("./GlobalVariabels"));
const GlobalVariabels_1 = require("./GlobalVariabels");
let LineNumbers = [];
let diagnostic = [];
let KeywordsInProgram = [
    "func",
    "function"
];
const diagnosticCollection = vscode.languages.createDiagnosticCollection(GlobalShit.LangId);
function provideError(document) {
    GlobalShit.GetSymbols(document);
    diagnostic = [];
    LineNumbers = [];
    if (document.languageId == GlobalShit.LangId) {
        const Text = document.getText().split(GlobalShit.NewLine);
        for (let index = 0; index < Text.length; index++) {
            const element = Text[index];
            let Linenumber = element.split(':')[0];
            let line = element.replace(Linenumber + ":", "").split("\\\\")[0];
            if (element == "") {
                continue;
            }
            if (element.startsWith("@")) {
                continue;
            }
            else if (element.startsWith("#")) {
                continue;
            }
            if (Linenumber == "SECTION") {
                if (line == "TEXT") {
                    GlobalVariabels_1.GlobalState.inTextSection = true;
                    GlobalVariabels_1.GlobalState.inDataSection = false;
                }
                else if (line == "DATA") {
                    GlobalVariabels_1.GlobalState.inDataSection = true;
                    GlobalVariabels_1.GlobalState.inTextSection = false;
                }
                if (element[7] != ':') {
                    let range = new vscode.Range(index, 0, index, 7);
                    diagnostic.push(new vscode.Diagnostic(range, "needs ':' like this SECTION:", vscode.DiagnosticSeverity.Error));
                }
                if (line == "") {
                    let range = new vscode.Range(index, 8, index, 70);
                    diagnostic.push(new vscode.Diagnostic(range, "Line needs to have a section name like TEXT or DATA", vscode.DiagnosticSeverity.Error));
                }
            }
            else {
                if (GlobalVariabels_1.GlobalState.inTextSection) {
                    if (element[7] != ':') {
                        let range = new vscode.Range(index, 0, index, 7);
                        diagnostic.push(new vscode.Diagnostic(range, "needs ':' like this 0000000:", vscode.DiagnosticSeverity.Error));
                    }
                    if (line.length != 64) {
                        let range = new vscode.Range(index, 8, index, 70);
                        diagnostic.push(new vscode.Diagnostic(range, "Line needs to be 64 characters long with spaces", vscode.DiagnosticSeverity.Error));
                    }
                    if (LineNumbers.includes(Linenumber)) {
                        let range = new vscode.Range(index, 0, index, 7);
                        diagnostic.push(new vscode.Diagnostic(range, "two lines can't have the same line number", vscode.DiagnosticSeverity.Error));
                    }
                    if (element[72] != '\\' || element[73] != '\\') {
                        let range = new vscode.Range(index, 72, index, 73);
                        diagnostic.push(new vscode.Diagnostic(range, "need '\\\\' at the end of the line", vscode.DiagnosticSeverity.Error));
                    }
                    if (!line.trim().endsWith('.')) {
                        let range = new vscode.Range(index, 8, index, 70);
                        diagnostic.push(new vscode.Diagnostic(range, "the line needs to end with a '.'", vscode.DiagnosticSeverity.Error));
                    }
                }
                else if (GlobalVariabels_1.GlobalState.inDataSection) {
                    if (!Linenumber.startsWith("       ")) {
                        let range = new vscode.Range(index, 0, index, 7);
                        diagnostic.push(new vscode.Diagnostic(range, "DATA section needs 7 spaces", vscode.DiagnosticSeverity.Error));
                    }
                }
                else {
                }
                LineNumbers.push(Linenumber);
                let InProgram = GlobalShit.InProgramTag(document, index);
                if (InProgram) {
                    let segment = line.split('.');
                    for (let i = 0; i < segment.length; i++) {
                        const element = segment[i];
                        let a = element.split(' ');
                        if (!KeywordsInProgram.includes(a[0])) {
                        }
                    }
                }
            }
            //debugger;
        }
        diagnosticCollection.set(document.uri, diagnostic);
    }
}
exports.provideError = provideError;

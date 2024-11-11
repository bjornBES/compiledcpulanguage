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
exports.InFunction = exports.InProgramTag = exports.GetSymbols = exports.Update = exports.CompletionItemOutput = exports.NewLine = exports.LangId = exports.URIS = exports.FilePaths = exports.GlobalState = exports.functions = exports.RegisterTooltipFilePath = exports.InstructionTooltipFilePath = void 0;
const vscode = __importStar(require("vscode"));
let basePath = "C:/Users/bjorn/Desktop/VideoProjects/GamingCPU_Project/languages/assembly/bcg-assembly-language";
exports.InstructionTooltipFilePath = basePath + "/files/Tooltips.md";
exports.RegisterTooltipFilePath = basePath + "/files/TooltipsRegister.md";
exports.functions = [];
exports.GlobalState = {
    inTextSection: false,
    inDataSection: false
};
exports.FilePaths = [];
exports.URIS = new Set();
exports.LangId = "ccl";
exports.NewLine = vscode.window.activeTextEditor?.document.eol === vscode.EndOfLine.LF ? "\n" : "\r\n";
exports.CompletionItemOutput = [];
function Update(document, position) {
    for (let line = position.line; line > -1; line--) {
        const element = document.lineAt(line).text;
        if (element.startsWith("SECTION")) {
            let sectionName = element.split(':')[1];
            if (sectionName == "TEXT") {
                exports.GlobalState.inTextSection = true;
                exports.GlobalState.inDataSection = false;
                break;
            }
            else if (sectionName == "DATA") {
                exports.GlobalState.inDataSection = true;
                exports.GlobalState.inTextSection = false;
                break;
            }
        }
    }
}
exports.Update = Update;
function GetSymbols(document) {
    for (let docIndex = 0; docIndex < exports.FilePaths.length; docIndex++) {
        const doc = exports.FilePaths[docIndex];
        for (let i = 0; i < doc.lineCount; i++) {
            const element = doc.lineAt(i);
            if (element == undefined) {
            }
            if (element.text == '') {
                continue;
            }
            else if (element.text.startsWith("@")) {
                continue;
            }
            const line = element.text.split(':')[1].split('\\\\')[0];
            const tokens = line.split('.');
            for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
                const token = tokens[tokenIndex];
                if (token.startsWith("function") || token.startsWith("func")) {
                    let functionLine = token.replace(token.split(' ')[0] + " ", "");
                    let functionName = token.split(' ')[1].split('(')[0];
                    //debugger;
                }
            }
            /*
            if (line.trim().startsWith('$') && doc.uri === document.uri) {
                if (Variabels.includes(line) === false) {
                    Variabels.push(line.replace('$', '').split(' ', 2)[0]);
                }
            }
            if (line.trim().endsWith(':') && line.trim().toLowerCase().startsWith(".global")) {
                if (GlobalLabels.includes(line.trim()) === false) {
                    GlobalLabels.push(line.split(' ')[1].replace(":", ""));
                }
            }
            else if (line.trim().endsWith(':') && doc.uri === document.uri) {
                if (Labels.includes(line.trim()) === false) {
                    Labels.push(line.replace(':', '').split(' ')[0].trimStart());
                }
            }
            */
        }
    }
}
exports.GetSymbols = GetSymbols;
function InProgramTag(document, CurrentLineNumber) {
    let Textdocument = document.getText().split(exports.NewLine);
    for (let index = CurrentLineNumber; index < Textdocument.length; index--) {
        if (index < 0) {
            break;
        }
        const element = Textdocument[index];
        if (element == undefined) {
            debugger;
            continue;
        }
        if (element == '') {
            continue;
        }
        if (element.includes("endprogram") || element.includes("end program")) {
            return false;
        }
        else if (element.includes("program ")) {
            return true;
        }
    }
    return false;
}
exports.InProgramTag = InProgramTag;
function InFunction(document, CurrentLineNumber) {
    let Textdocument = document.getText().split(exports.NewLine);
    for (let index = CurrentLineNumber; index < Textdocument.length; index--) {
        if (index < 0) {
            break;
        }
        const element = Textdocument[index];
        if (element == undefined) {
            continue;
        }
        if (element == '') {
            continue;
        }
        if (element.includes("endfunc") || element.includes("end func")) {
            return false;
        }
        else if (element.includes("func ")) {
            return true;
        }
    }
    return false;
}
exports.InFunction = InFunction;

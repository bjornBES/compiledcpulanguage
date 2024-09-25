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
exports.CCLCompletionProposer = void 0;
const vscode = __importStar(require("vscode"));
const GlobalVariabels_1 = require("./GlobalVariabels");
const GlobalVariabels_2 = require("./GlobalVariabels");
class CCLCompletionProposer {
    constructor() {
        vscode.workspace.findFiles("**/*.{" + GlobalVariabels_2.LangId + "}", null, undefined).then((files) => {
            files.forEach((fileURI) => {
                GlobalVariabels_1.URIS.add(fileURI);
                const textDocuments = vscode.workspace.textDocuments;
                for (let index = 0; index < textDocuments.length; index++) {
                    const element = textDocuments[index];
                    if (element.languageId !== GlobalVariabels_2.LangId)
                        return;
                    if (GlobalVariabels_1.FilePaths.includes(element)) {
                        return;
                    }
                    else if (element.uri.path === fileURI.path) {
                        if (!GlobalVariabels_1.FilePaths.includes(element)) {
                            GlobalVariabels_1.FilePaths.push(element);
                        }
                    }
                }
            });
        });
        const watcher = vscode.workspace.createFileSystemWatcher("**/*.{" + GlobalVariabels_2.LangId + "}");
        watcher.onDidCreate((uri) => {
            GlobalVariabels_1.URIS.add(uri);
            vscode.workspace.textDocuments.forEach(document => {
                if (document.languageId !== GlobalVariabels_2.LangId)
                    return;
                if (GlobalVariabels_1.FilePaths.includes(document)) {
                    return;
                }
                else if (document.uri == uri) {
                    if (!GlobalVariabels_1.FilePaths.includes(document)) {
                        GlobalVariabels_1.FilePaths.push(document);
                    }
                }
            });
        });
        watcher.onDidDelete((uri) => {
            GlobalVariabels_1.URIS.delete(uri);
            let TempFilePaths = GlobalVariabels_1.FilePaths;
            for (let index = 0; index < GlobalVariabels_1.FilePaths.length; index++) {
                GlobalVariabels_1.FilePaths.pop();
            }
            TempFilePaths.forEach(document => {
                if (document.uri === uri) {
                    for (let index = 0; index < TempFilePaths.length; index++) {
                        const element = TempFilePaths[index];
                        if (TempFilePaths[index].uri !== uri) {
                            GlobalVariabels_1.FilePaths.push(element);
                        }
                    }
                }
            });
        });
    }
    provideCompletionItems(document, position, token, context) {
        while (GlobalVariabels_1.CompletionItemOutput.length != 0) {
            GlobalVariabels_1.CompletionItemOutput.pop();
        }
        const Line = document.lineAt(position.line).text;
        const CurrentLine = Line.trim();
        const LastLine = document.lineAt(position.line - 1).text;
        const LastLineNumber = LastLine.trim().split(':')[0];
        if (position.character <= 7) {
            let lastNumberDec = Number(LastLineNumber);
            let CurrentLineNumberStr = (lastNumberDec + 5).toString().padStart(7, '0');
            NewItem(CurrentLineNumberStr, vscode.CompletionItemKind.Property, "", CurrentLineNumberStr);
        }
        else if (CurrentLine.includes(":")) {
            let InProgram = InProgramTag(document, position.line);
            if (InProgram) {
                let InFunc = InFunction(document, position.line);
                if (InFunc) {
                }
                else {
                    NewItem("func", vscode.CompletionItemKind.Class, "", "func ");
                    NewSnippet("func", "", "func ${1:name}.$2");
                }
            }
            else {
                NewItem("program", vscode.CompletionItemKind.Class, "", "program ");
                NewSnippet("program", "", "program ${1:name}.$2");
            }
        }
        return GlobalVariabels_1.CompletionItemOutput;
    }
}
exports.CCLCompletionProposer = CCLCompletionProposer;
function CodeCompletionLabels() {
    for (let index = 0; index < GlobalVariabels_1.Labels.length; index++) {
        const element = GlobalVariabels_1.Labels[index];
        NewItem(element, vscode.CompletionItemKind.Field, "", element);
    }
    for (let index = 0; index < GlobalVariabels_1.Variabels.length; index++) {
        const element = GlobalVariabels_1.Variabels[index];
        NewItem(element, vscode.CompletionItemKind.Field, "", element);
    }
    for (let index = 0; index < GlobalVariabels_1.GlobalLabels.length; index++) {
        const element = GlobalVariabels_1.GlobalLabels[index];
        NewItem(element, vscode.CompletionItemKind.Field, "", element);
    }
}
function NewItem(triggerCharacter, triggerKind, detail = "", insertText = "") {
    let BufferItem = new vscode.CompletionItem(triggerCharacter, triggerKind);
    let MarkDownText = new vscode.MarkdownString(detail);
    MarkDownText.supportHtml = true;
    BufferItem.documentation = MarkDownText;
    BufferItem.insertText = insertText;
    GlobalVariabels_1.CompletionItemOutput.push(BufferItem);
}
function NewSnippet(triggerCharacter, detail = "", insertText = "") {
    let BufferItem = new vscode.CompletionItem(triggerCharacter, vscode.CompletionItemKind.Snippet);
    let MarkDownText = new vscode.MarkdownString(detail);
    let Snippet = new vscode.SnippetString(insertText);
    MarkDownText.supportHtml = true;
    BufferItem.documentation = MarkDownText;
    BufferItem.insertText = Snippet;
    GlobalVariabels_1.CompletionItemOutput.push(BufferItem);
}
function InProgramTag(document, CurrentLineNumber) {
    let Textdocument = document.getText().split(GlobalVariabels_2.NewLine);
    for (let index = CurrentLineNumber; index < Textdocument.length; index--) {
        const element = Textdocument[index];
        if (element.includes("endprogram") || element.includes("end program")) {
            return false;
        }
        else if (element.includes("program ")) {
            return true;
        }
    }
    return false;
}
function InFunction(document, CurrentLineNumber) {
    let Textdocument = document.getText().split(GlobalVariabels_2.NewLine);
    for (let index = CurrentLineNumber; index < Textdocument.length; index--) {
        const element = Textdocument[index];
        if (element.includes("endfunc") || element.includes("end func")) {
            return false;
        }
        else if (element.includes("func ")) {
            return true;
        }
    }
    return false;
}

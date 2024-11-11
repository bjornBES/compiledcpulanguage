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
        GlobalVariabels_1.Update(document, position);
        if (position.character == 1) {
            NewItem("Section", vscode.CompletionItemKind.Property, "", "SECTION:");
            NewSnippet("Section text", "makes a text section", "SECTION:TEXT");
            NewSnippet("Section data", "makes a data section", "SECTION:DATA");
        }
        if (CurrentLine.startsWith("SECTION:")) {
            NewItem("String section", vscode.CompletionItemKind.Property, "", "STRING");
            NewItem("Code section", vscode.CompletionItemKind.Property, "", "TEXT");
            NewItem("Data section", vscode.CompletionItemKind.Property, "", "DATA");
        }
        if (position.character <= 7) {
            if (GlobalVariabels_1.GlobalState.inTextSection) {
                let LastLine;
                let CurrentLineNumberStr;
                if (position.line >= 2) {
                    if (document.lineAt(position.line - 1).text.startsWith("SECTION")) {
                        return GlobalVariabels_1.CompletionItemOutput;
                    }
                    LastLine = Number(document.lineAt(position.line - 1).text.trim().split(':')[0]);
                    let LastLastLine = Number(document.lineAt(position.line - 2).text.trim().split(':')[0]);
                    CurrentLineNumberStr = (LastLine + (LastLine - LastLastLine)).toString().padStart(7, '0');
                }
                else {
                    if (document.lineAt(position.line - 1).text.startsWith("SECTION")) {
                        return GlobalVariabels_1.CompletionItemOutput;
                    }
                    LastLine = Number(document.lineAt(position.line - 1).text.trim().split(':')[0]);
                    CurrentLineNumberStr = (LastLine + 5).toString().padStart(7, '0');
                }
                NewItem(CurrentLineNumberStr, vscode.CompletionItemKind.Property, "", CurrentLineNumberStr + ":");
            }
            else if (GlobalVariabels_1.GlobalState.inDataSection) {
            }
            else {
                NewSnippet("Section text", "", "SECTION:TEXT");
                NewSnippet("Section text", "", "SECTION:DATA");
            }
        }
        else if (CurrentLine.includes(":")) {
            if (GlobalVariabels_1.GlobalState.inTextSection) {
                let InProgram = GlobalVariabels_1.InProgramTag(document, position.line);
                if (InProgram) {
                    let InFunc = GlobalVariabels_1.InFunction(document, position.line);
                    if (InFunc) {
                        CreateSnippet("unsigned variabel", "Creates an unsigned variabel", "${1|byte,ushort,uint|} ${2:name} = ${3:value}.", "Makes a variabel that is unsigned");
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
            else if (GlobalVariabels_1.GlobalState.inDataSection) {
                NewSnippet("Reserve data", "Reserves a byte array", "${1:name} RES ${2:Size}");
            }
            else {
            }
        }
        return GlobalVariabels_1.CompletionItemOutput;
    }
}
exports.CCLCompletionProposer = CCLCompletionProposer;
function NewItem(triggerCharacter, triggerKind, detail = "", insertText = "") {
    let BufferItem = new vscode.CompletionItem(triggerCharacter, triggerKind);
    let MarkDownText = new vscode.MarkdownString(detail);
    MarkDownText.supportHtml = true;
    BufferItem.documentation = MarkDownText;
    BufferItem.insertText = insertText;
    GlobalVariabels_1.CompletionItemOutput.push(BufferItem);
}
function NewSnippet(name, detail = "", insertText = "") {
    let BufferItem = new vscode.CompletionItem(name, vscode.CompletionItemKind.Snippet);
    let MarkDownText = new vscode.MarkdownString(detail);
    let Snippet = new vscode.SnippetString(insertText);
    MarkDownText.supportHtml = true;
    BufferItem.documentation = MarkDownText;
    BufferItem.insertText = Snippet;
    GlobalVariabels_1.CompletionItemOutput.push(BufferItem);
}
function CreateSnippet(name, detail, code, description) {
    const snippet = new vscode.CompletionItem(name, vscode.CompletionItemKind.Snippet);
    snippet.insertText = new vscode.SnippetString(code);
    snippet.documentation = new vscode.MarkdownString(description);
    snippet.detail = detail;
    GlobalVariabels_1.CompletionItemOutput.push(snippet);
}

"use strict";

import * as vscode from 'vscode';
import * as path from 'path';
import { FilePaths, URIS, CompletionItemOutput, InProgramTag, InFunction, Update, GlobalState } from './GlobalVariabels';
import { stringify } from 'querystring';
import { env } from 'process';
import { NewLine, LangId } from './GlobalVariabels';

export class CCLCompletionProposer implements vscode.CompletionItemProvider {
    constructor() {

        vscode.workspace.findFiles("**/*.{" + LangId + "}", null, undefined).then((files) => {
            files.forEach((fileURI) => {
                URIS.add(fileURI);
                const textDocuments = vscode.workspace.textDocuments;

                for (let index = 0; index < textDocuments.length; index++) {
                    const element: vscode.TextDocument = textDocuments[index];
                    if (element.languageId !== LangId) return;
                    if (FilePaths.includes(element)) {
                        return
                    }
                    else if (element.uri.path === fileURI.path) {
                        if (!FilePaths.includes(element)) {
                            FilePaths.push(element);
                        }
                    }
                }
            });
        });

        const watcher = vscode.workspace.createFileSystemWatcher("**/*.{" + LangId + "}");
        watcher.onDidCreate((uri) => {
            URIS.add(uri);
            vscode.workspace.textDocuments.forEach(document => {
                if (document.languageId !== LangId) return;
                if (FilePaths.includes(document)) {
                    return
                }
                else if (document.uri == uri) {
                    if (!FilePaths.includes(document)) {
                        FilePaths.push(document);
                    }
                }
            });
        });

        watcher.onDidDelete((uri) => {
            URIS.delete(uri);
            let TempFilePaths = FilePaths;
            for (let index = 0; index < FilePaths.length; index++) {
                FilePaths.pop();
            }
            TempFilePaths.forEach(document => {
                if (document.uri === uri) {
                    for (let index = 0; index < TempFilePaths.length; index++) {
                        const element = TempFilePaths[index];
                        if (TempFilePaths[index].uri !== uri) {
                            FilePaths.push(element);
                        }
                    }
                }
            });
        });
    }

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
        while (CompletionItemOutput.length != 0) {
            CompletionItemOutput.pop();
        }
        const Line: string = document.lineAt(position.line).text;
        const CurrentLine: string = Line.trim();

        Update(document, position);

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
            if (GlobalState.inTextSection) {
                let LastLine: number;
                let CurrentLineNumberStr: string;
                if (position.line >= 2) {
                    if (document.lineAt(position.line - 1).text.startsWith("SECTION")) {
                        return CompletionItemOutput;
                    }
                    LastLine = Number(document.lineAt(position.line - 1).text.trim().split(':')[0]);
                    let LastLastLine = Number(document.lineAt(position.line - 2).text.trim().split(':')[0]);
                    CurrentLineNumberStr = (LastLine + (LastLine - LastLastLine)).toString().padStart(7, '0');
                }
                else {
                    if (document.lineAt(position.line - 1).text.startsWith("SECTION")) {
                        return CompletionItemOutput;
                    }
                    LastLine = Number(document.lineAt(position.line - 1).text.trim().split(':')[0]);
                    CurrentLineNumberStr = (LastLine + 5).toString().padStart(7, '0');
                }
                NewItem(CurrentLineNumberStr, vscode.CompletionItemKind.Property, "", CurrentLineNumberStr + ":");
            }
            else if (GlobalState.inDataSection) {
            }
            else {
                NewSnippet("Section text", "", "SECTION:TEXT");
                NewSnippet("Section text", "", "SECTION:DATA");
            }
        }
        else if (CurrentLine.includes(":")) {
            if (GlobalState.inTextSection) {
                let InProgram: boolean = InProgramTag(document, position.line);
                if (InProgram) {
                    let InFunc = InFunction(document, position.line);
                    if (InFunc) {

                        CreateSnippet("unsigned variabel", "Creates an unsigned variabel", "${1|byte,ushort,uint|} ${2:name} = ${3:value}.", "Makes a variabel that is unsigned");
                    }
                    else {
                        NewItem("func", vscode.CompletionItemKind.Class, "", "func ");
                        NewSnippet("func", "", "func ${1:name}.$2");
                    }
                }
                else {
                    NewItem("program", vscode.CompletionItemKind.Class, "", "program ")
                    NewSnippet("program", "", "program ${1:name}.$2");
                }
            }
            else if (GlobalState.inDataSection) {
                NewSnippet("Reserve data", "Reserves a byte array", "${1:name} RES ${2:Size}");
            }
            else {

            }
        }

        return CompletionItemOutput;
    }
}

function NewItem(triggerCharacter: string, triggerKind: vscode.CompletionItemKind, detail = "", insertText = "") {
    let BufferItem = new vscode.CompletionItem(triggerCharacter, triggerKind);
    let MarkDownText = new vscode.MarkdownString(detail);
    MarkDownText.supportHtml = true;
    BufferItem.documentation = MarkDownText;
    BufferItem.insertText = insertText;
    CompletionItemOutput.push(BufferItem);
}
function NewSnippet(name: string, detail = "", insertText = "") {
    let BufferItem = new vscode.CompletionItem(name, vscode.CompletionItemKind.Snippet);
    let MarkDownText = new vscode.MarkdownString(detail);
    let Snippet: vscode.SnippetString = new vscode.SnippetString(insertText);
    MarkDownText.supportHtml = true;
    BufferItem.documentation = MarkDownText;
    BufferItem.insertText = Snippet;
    CompletionItemOutput.push(BufferItem);
}
function CreateSnippet(name: string, detail: string, code: string, description: string) {
    const snippet = new vscode.CompletionItem(name, vscode.CompletionItemKind.Snippet);
    snippet.insertText = new vscode.SnippetString(code);
    snippet.documentation = new vscode.MarkdownString(description);
    snippet.detail = detail;
    CompletionItemOutput.push(snippet);
}

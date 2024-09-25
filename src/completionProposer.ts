"use strict";

import * as vscode from 'vscode';
import * as path from 'path';
import { FilePaths, GlobalLabels, Labels, Variabels, URIS, CompletionItemOutput } from './GlobalVariabels';
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
        const LastLine: string = document.lineAt(position.line - 1).text

        const LastLineNumber = LastLine.trim().split(':')[0]

        if (position.character <= 7) {
            let lastNumberDec: number = Number(LastLineNumber);
            let CurrentLineNumberStr = (lastNumberDec + 5).toString().padStart(7, '0');
            NewItem(CurrentLineNumberStr, vscode.CompletionItemKind.Property, "", CurrentLineNumberStr);
        }
        else if (CurrentLine.includes(":")) {
            let InProgram: boolean = InProgramTag(document, position.line);
            if (InProgram) {
                let InFunc = InFunction(document, position.line);
                if (InFunc)
                {

                }
                else
                {
                    NewItem("func", vscode.CompletionItemKind.Class, "", "func ");
                    NewSnippet("func", "", "func ${1:name}.$2");
                }
            }
            else {
                NewItem("program", vscode.CompletionItemKind.Class, "", "program ")
                NewSnippet("program", "", "program ${1:name}.$2");
            }
        }

        return CompletionItemOutput;
    }
}

function CodeCompletionLabels() {
    for (let index = 0; index < Labels.length; index++) {
        const element = Labels[index];
        NewItem(element, vscode.CompletionItemKind.Field, "", element);
    }
    for (let index = 0; index < Variabels.length; index++) {
        const element = Variabels[index];
        NewItem(element, vscode.CompletionItemKind.Field, "", element);
    }
    for (let index = 0; index < GlobalLabels.length; index++) {
        const element = GlobalLabels[index];
        NewItem(element, vscode.CompletionItemKind.Field, "", element);
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
function NewSnippet(triggerCharacter: string, detail = "", insertText = "") {
    let BufferItem = new vscode.CompletionItem(triggerCharacter, vscode.CompletionItemKind.Snippet);
    let MarkDownText = new vscode.MarkdownString(detail);
    let Snippet : vscode.SnippetString = new vscode.SnippetString(insertText);
    MarkDownText.supportHtml = true;
    BufferItem.documentation = MarkDownText;
    BufferItem.insertText = Snippet;
    CompletionItemOutput.push(BufferItem);
}

function InProgramTag(document: vscode.TextDocument, CurrentLineNumber: number): boolean {
    let Textdocument = document.getText().split(NewLine);
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
function InFunction(document: vscode.TextDocument, CurrentLineNumber: number): boolean {
    let Textdocument = document.getText().split(NewLine);
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
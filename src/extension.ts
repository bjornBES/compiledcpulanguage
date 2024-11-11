import * as vscode from 'vscode';
import { CCLHoverProvider } from './hover';
import { CCLCompletionProposer } from './completionProposer';
import { provideError } from './Error';
import {CCLDocumentSymbolProvider} from './SymbolProvider'
import * as GlobalShit from './GlobalVariabels';
import path from 'node:path';
import * as glob from 'glob';

const selector = { language: GlobalShit.LangId, scheme: 'file' };

export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(document => {
        if (document.languageId !== GlobalShit.LangId) return;
        if (GlobalShit.FilePaths.includes(document)) return;
        GlobalShit.URIS.forEach(uri => {
            if (document.uri.path == uri.path) {
                //vscode.window.showInformationMessage("Adding " + document.fileName);
                GlobalShit.FilePaths.push(document);
            }
        });
    }))
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        const document = event.document;
        provideError(document)
    }));

    context.subscriptions.push(vscode.languages.registerHoverProvider(selector, new CCLHoverProvider()));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(selector, new CCLCompletionProposer(), '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', ':'))
    //context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider(selector, new CCLDocumentSymbolProvider()))
    
}

export function deactivate() {
}
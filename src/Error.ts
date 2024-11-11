import * as vscode from 'vscode';
import * as GlobalShit from './GlobalVariabels';
import { GlobalState } from './GlobalVariabels';
let LineNumbers: string[] = [];
let diagnostic: vscode.Diagnostic[] = [];
let KeywordsInProgram = [
    "func",
    "function"
];
const diagnosticCollection = vscode.languages.createDiagnosticCollection(GlobalShit.LangId);
export function provideError(document: vscode.TextDocument) {
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
                    GlobalState.inTextSection = true;
                    GlobalState.inDataSection = false;
                }
                else if (line == "DATA") {
                    GlobalState.inDataSection = true;
                    GlobalState.inTextSection = false;
                }

                if (element[7] != ':') {
                    let range: vscode.Range = new vscode.Range(index, 0, index, 7);
                    diagnostic.push(new vscode.Diagnostic(range, "needs ':' like this SECTION:", vscode.DiagnosticSeverity.Error));

                }
                if (line == "") {
                    let range: vscode.Range = new vscode.Range(index, 8, index, 70);
                    diagnostic.push(new vscode.Diagnostic(range, "Line needs to have a section name like TEXT or DATA", vscode.DiagnosticSeverity.Error));
                }
            }
            else {
                if (GlobalState.inTextSection) {
                    if (element[7] != ':') {
                        let range: vscode.Range = new vscode.Range(index, 0, index, 7);
                        diagnostic.push(new vscode.Diagnostic(range, "needs ':' like this 0000000:", vscode.DiagnosticSeverity.Error));

                    }
                    if (line.length != 64) {
                        let range: vscode.Range = new vscode.Range(index, 8, index, 70);
                        diagnostic.push(new vscode.Diagnostic(range, "Line needs to be 64 characters long with spaces", vscode.DiagnosticSeverity.Error));
                    }
                    if (LineNumbers.includes(Linenumber)) {
                        let range: vscode.Range = new vscode.Range(index, 0, index, 7);
                        diagnostic.push(new vscode.Diagnostic(range, "two lines can't have the same line number", vscode.DiagnosticSeverity.Error));
                    }
                    if (element[72] != '\\' || element[73] != '\\') {
                        let range: vscode.Range = new vscode.Range(index, 72, index, 73);
                        diagnostic.push(new vscode.Diagnostic(range, "need '\\\\' at the end of the line", vscode.DiagnosticSeverity.Error));
                    }
                    if (!line.trim().endsWith('.')) {
                        let range: vscode.Range = new vscode.Range(index, 8, index, 70);
                        diagnostic.push(new vscode.Diagnostic(range, "the line needs to end with a '.'", vscode.DiagnosticSeverity.Error));
                    }
                }
                else if (GlobalState.inDataSection) {
                    if (!Linenumber.startsWith("       ")) {
                        let range: vscode.Range = new vscode.Range(index, 0, index, 7);
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
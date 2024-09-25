import * as vscode from 'vscode';
import * as GlobalShit from './GlobalVariabels';
let LineNumbers: string[] = [];
let diagnostic: vscode.Diagnostic[] = [];
const diagnosticCollection = vscode.languages.createDiagnosticCollection(GlobalShit.LangId);
export function provideError(document: vscode.TextDocument, position: vscode.Position) {
    diagnostic = [];
    LineNumbers = [];
    if (document.languageId == GlobalShit.LangId) {
        const Text = document.getText().split(GlobalShit.NewLine);
        for (let index = 0; index < Text.length; index++) {
            const element = Text[index];
            let Linenumber = element.split(':')[0];
            let line = element.replace(Linenumber + ":", "").split("\\\\")[0];

            if (element == "")
            {
                continue;
            }

            if (line.length != 32) {
                let range: vscode.Range = new vscode.Range(index, 8, index, 40);
                diagnostic.push(new vscode.Diagnostic(range, "Line needs to be 32 characters long with spaces", vscode.DiagnosticSeverity.Error));
            }

            if (LineNumbers.includes(Linenumber)) {
                let range: vscode.Range = new vscode.Range(index, 0, index, 7);
                diagnostic.push(new vscode.Diagnostic(range, "two lines can't have the same line number", vscode.DiagnosticSeverity.Error));
            }
            if (element[7] != ':') {
                let range: vscode.Range = new vscode.Range(index, 0, index, 7);
                diagnostic.push(new vscode.Diagnostic(range, "needs ':' like this 0000000:", vscode.DiagnosticSeverity.Error));

            }
            if (element[40] != '\\' || element[41] != '\\') {
                let range: vscode.Range = new vscode.Range(index, 40, index, 42);
                diagnostic.push(new vscode.Diagnostic(range, "need '\\\\' at the end of the line", vscode.DiagnosticSeverity.Error));

            }
            if (!line.trim().endsWith('.')) {
                let range: vscode.Range = new vscode.Range(index, 8, index, 40);
                diagnostic.push(new vscode.Diagnostic(range, "the line needs to end with a '.'", vscode.DiagnosticSeverity.Error));

            }
            //debugger;
            LineNumbers.push(Linenumber);
        }

        diagnosticCollection.set(document.uri, diagnostic);
    }
}
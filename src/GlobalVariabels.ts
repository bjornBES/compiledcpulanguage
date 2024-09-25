import * as vscode from 'vscode';
import * as fs from 'node:fs';

let basePath = "C:/Users/bjorn/Desktop/VideoProjects/GamingCPU_Project/languages/assembly/bcg-assembly-language"
export let InstructionTooltipFilePath = basePath + "/files/Tooltips.md";
export let RegisterTooltipFilePath = basePath + "/files/TooltipsRegister.md";

export let Variabels: string[] = [];
export let Labels: string[] = [];
export let GlobalLabels: string[] = [];

export let FilePaths: vscode.TextDocument[] = []
export let URIS: Set<vscode.Uri> = new Set<vscode.Uri>();

export const LangId = "ccl";
export let NewLine = vscode.window.activeTextEditor?.document.eol === vscode.EndOfLine.LF ? "\n" : "\r\n"; 

export let CompletionItemOutput : vscode.CompletionItem[] = [];

export function GetSymbols(document: vscode.TextDocument) {
    Variabels = [];
    Labels = [];
    GlobalLabels = [];
    for (let docIndex = 0; docIndex < FilePaths.length; docIndex++) {
        const doc = FilePaths[docIndex];
        for (let i = 0; i < doc.lineCount; i++) {
            const line = doc.lineAt(i).text.replace(/[\s]*\;\s/, "");
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
        }
    }
}

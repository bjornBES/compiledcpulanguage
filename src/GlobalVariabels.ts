import * as vscode from 'vscode';
import * as fs from 'node:fs';

let basePath = "C:/Users/bjorn/Desktop/VideoProjects/GamingCPU_Project/languages/assembly/bcg-assembly-language"
export let InstructionTooltipFilePath = basePath + "/files/Tooltips.md";
export let RegisterTooltipFilePath = basePath + "/files/TooltipsRegister.md";

export let functions: Function[] = [];

export const GlobalState = {
    inTextSection: false,
    inDataSection: false
};

export let FilePaths: vscode.TextDocument[] = []
export let URIS: Set<vscode.Uri> = new Set<vscode.Uri>();

export const LangId = "ccl";
export let NewLine = vscode.window.activeTextEditor?.document.eol === vscode.EndOfLine.LF ? "\n" : "\r\n";

export let CompletionItemOutput: vscode.CompletionItem[] = [];

export function Update(document: vscode.TextDocument, position: vscode.Position) {
    for (let line = position.line; line > -1; line--) {
        const element = document.lineAt(line).text;
        if (element.startsWith("SECTION")) {
            let sectionName = element.split(':')[1];
            if (sectionName == "TEXT") {
                GlobalState.inTextSection = true;
                GlobalState.inDataSection = false;
                break;
            }
            else if (sectionName == "DATA") {
                GlobalState.inDataSection = true;
                GlobalState.inTextSection = false;
                break;
            }
        }
    }
}

export function GetSymbols(document: vscode.TextDocument) {

    for (let docIndex = 0; docIndex < FilePaths.length; docIndex++) {
        const doc: vscode.TextDocument = FilePaths[docIndex];
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
export function InProgramTag(document: vscode.TextDocument, CurrentLineNumber: number): boolean {
    let Textdocument = document.getText().split(NewLine);
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
export function InFunction(document: vscode.TextDocument, CurrentLineNumber: number): boolean {
    let Textdocument = document.getText().split(NewLine);
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

type Function = {
    linenumber: number;
    name: string;
    arguments: Argument[];
}

type Argument = {
    name: string;
    type: string;
    activeParameter: number
}
import * as vscode from 'vscode';
import {NewLine} from './GlobalVariabels'

let symbols: vscode.DocumentSymbol[] = [];
export class CCLDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    
    constructor() {
        
    }

    provideDocumentSymbols(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
        symbols = [];

        let text = document.getText();
        let lines : string[] = text.split(NewLine);
        for (let index = 0; index < lines.length; index++) {
            const line : string = lines[index].split("\\\\")[0].split(':')[1];
            const lineTokens : string[] = line.split('.');
            for (let tokenIndex = 0; tokenIndex < lineTokens.length; tokenIndex++) {
                const token = lineTokens[tokenIndex];
                const tokens = token.split(' ');
                
                if (tokens.length == 0)
                {
                    continue;
                }

                if (tokens.length == 1)
                {
                    continue;
                }

                if (tokens[0] == "func" || tokens[0] == "function")
                {
                    let charIndex = line.indexOf(tokens[1]) + 8;
                    let name : string =tokens[1].split('(')[0]; 
                    NewSymbol(name, "function", vscode.SymbolKind.Function, new vscode.Range(index, charIndex, index, charIndex + name.length));
                }
            }
        }
        return symbols;
    }
}

function NewSymbol(name : string, detail : string, symbolKind : vscode.SymbolKind, symbolPostion : vscode.Range)
{
    let symbol : vscode.DocumentSymbol = new vscode.DocumentSymbol(name, detail, symbolKind, symbolPostion, symbolPostion);
    symbols.push(symbol);
}
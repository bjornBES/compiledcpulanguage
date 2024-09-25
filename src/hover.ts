
import * as vscode from 'vscode';
import * as GlobalVar from './GlobalVariabels';

import * as fs from 'node:fs';

const hoverRegex = /(0x[\da-fA-F][_\da-fA-F]*)|(0b[01][_01]*)|(\d[_\d]*(\.\d+)?)|(\.?[A-Za-z_]\w*(\\@|:*))/g;
const InstructionRegex = /^[\\s]*[A-Z][A-Z]*/

export class CCLHoverProvider implements vscode.HoverProvider {

  constructor() {

  }

  provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
    const range = document.getWordRangeAtPosition(position, hoverRegex);
    if (range) {
      const text = document.getText(range);

      
    }

    return null;
  }
}

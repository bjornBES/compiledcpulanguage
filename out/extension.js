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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const hover_1 = require("./hover");
const completionProposer_1 = require("./completionProposer");
const Error_1 = require("./Error");
const GlobalShit = __importStar(require("./GlobalVariabels"));
const selector = { language: GlobalShit.LangId, scheme: 'file' };
function activate(context) {
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(document => {
        if (document.languageId !== GlobalShit.LangId)
            return;
        if (GlobalShit.FilePaths.includes(document))
            return;
        GlobalShit.URIS.forEach(uri => {
            if (document.uri.path == uri.path) {
                //vscode.window.showInformationMessage("Adding " + document.fileName);
                GlobalShit.FilePaths.push(document);
            }
        });
    }));
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(event => {
        const document = event.document;
        const position = event.contentChanges[0].range.start;
        Error_1.provideError(document, position);
    }));
    context.subscriptions.push(vscode.languages.registerHoverProvider(selector, new hover_1.CCLHoverProvider()));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(selector, new completionProposer_1.CCLCompletionProposer(), '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', ':'));
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;

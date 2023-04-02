"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
async function activate(context) {
    const lang = getActiveDocumentLanguageId();
    if (lang === "go") {
        await handleGoLanguage();
    }
    else if (lang === "javascript" || lang === "typescript") {
        await handleUnsupportedLanguage();
    }
    else {
        // 未対応の言語
        await handleUnsupportedLanguage();
    }
}
exports.activate = activate;
async function askForOutputFormat() {
    const compositeOutput = await vscode.window.showQuickPick(["Yes", "No"], {
        placeHolder: "Do you want to use composite (recursively expanded) output?",
    });
    if (compositeOutput === "Yes") {
        const outputFieldNames = await vscode.window.showQuickPick(["Yes", "No"], {
            placeHolder: "Do you want to include output field names?",
        });
        if (outputFieldNames === "Yes") {
            return "%+v";
        }
        else {
            return "%v";
        }
    }
    else {
        const useDefaultOutput = await vscode.window.showQuickPick(["Yes", "No"], {
            placeHolder: "Do you want to use the default output format?",
        });
        if (useDefaultOutput === "Yes") {
            return "%v";
        }
        else {
            return "";
        }
    }
}
async function handleGoLanguage() {
    const defaultOutput = await askForOutputFormat();
    // TODO: 選択された出力フォーマットでGo言語ロジックを扱う
}
async function handleUnsupportedLanguage() {
    await vscode.window.showInformationMessage("This language is not currently supported.", "この言語は現在サポートされていません。");
}
function getActiveDocumentLanguageId() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        return editor.document.languageId;
    }
    return undefined;
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map
import * as vscode from "vscode";

async function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand("format-string-helper.helpFormatString", async () => {
		let lang = await getActiveDocumentLanguageId();
		let insertCode = "";// 挿入されるコードを予約
		if (lang) {
			vscode.window.showInformationMessage(`Running language: ${lang}`);
		}
		// -------------------------
		// 言語に応じた処理
		if (lang === "go" || lang === "c") {
			insertCode = await handleGoLanguage();
		} else if (lang === "javascript" || lang === "typescript") {
			await handleUnsupportedLanguage();
		} else {
			// 未対応の言語
			await handleUnsupportedLanguage();
		}
		// -------------------------
		if (insertCode === "Cancel") {// 処理のキャンセルを行う
			return;
		} else {
			// 成形
			insertCode = getEnclosedString(insertCode);
			// 書き込み
			editInsert(insertCode);
		}
	});
	context.subscriptions.push(disposable);
}

async function selectLanguage(): Promise<string> {
	const languages = await vscode.languages.getLanguages();
	const selectedLanguage = await vscode.window.showQuickPick(languages);
	return selectedLanguage || '';
}

async function handleGoLanguage(): Promise<string> {
	let response = {
		symbol: Object.freeze("%"),	// 0
		flag: "",	// 1
		width: "",	// 2
		precision: "",	// 3
		verb: ""	// 4
	};
	const singleAnswerType = Object.freeze({
		// eslint-disable-next-line @typescript-eslint/naming-convention
		Y: "YES",
		// eslint-disable-next-line @typescript-eslint/naming-convention
		N: "No",
		// eslint-disable-next-line @typescript-eslint/naming-convention
		C: "Cancel"
	});
	const singleAnswerList = Object.freeze(Object.values(singleAnswerType));
	interface VerbDictionary {
		[key: string]: { [key: string]: string };
	}
	const verbDict: VerbDictionary = Object.freeze({
		// ? 成形のためからのコメント
		// eslint-disable-next-line @typescript-eslint/naming-convention
		DEFAULT_VERB: Object.freeze(/*			*/{ "v": "%v", "plus_v": "%+v", "sharp_v": "%#v", "T": "%T" }),	// eslint-disable-next-line @typescript-eslint/naming-convention
		BOOLEAN: Object.freeze(/*				*/{ "t": "%t" }),												// eslint-disable-next-line @typescript-eslint/naming-convention
		INT: Object.freeze(/*					*/{ "d": "%d", "b": "%b", "o": "%o", "x": "%x", "X": "%X", "c": "%c", "q": "%q" }),// eslint-disable-next-line @typescript-eslint/naming-convention
		FLOAT_AND_COMPLEX: Object.freeze(/*		*/{ "b": "%b", "e": "%e", "E": "%E", "f": "%f", "F": "%F", "g": "%g", "G": "%G" }),// eslint-disable-next-line @typescript-eslint/naming-convention
		STRING_AND_BYTE_ARRAY: Object.freeze(/*	*/{ "s": "%s", "q": "%q", "x": "%x", "X": "%X" }),				// eslint-disable-next-line @typescript-eslint/naming-convention
		FLAG: Object.freeze(/*					*/{ "plus": "+", "sharp": "#", "space": " ", "zero": "0", "minus": "-", }),
	});
	/**
	 * YES/NOで答えられる質問を実行し真偽値を返す
	 * @param question 質問したいメッセージ
	 * @returns "Yes" "No" "Cancel"のいずれか
	 */
	async function yesNoPrompt(question: string): Promise<string> {
		const userResponse = await vscode.window.showQuickPick(singleAnswerList, {
			placeHolder: question
		});
		if (userResponse === undefined || userResponse === singleAnswerType.C) {
			vscode.window.showWarningMessage("実行をキャンセル");
			return singleAnswerType.C;
		} else {
			return userResponse;
		}
	}

	/**
	 * 選択式の質問を実行し回答を返す
	 * @param question 質問文
	 * @param optionData 回答選択肢
	 * @returns 回答文字列
	 * @note `Cancel`がデフォルトで設定されている
	 */
	async function quickPickPrompt(question: string, optionData: { label: string, description: string, value: string }[]): Promise<string | undefined> {
		// Cancelを追加
		optionData.push({ label: "Cancel", description: "", value: "Cancel" });
		const response = await vscode.window.showQuickPick(optionData, { placeHolder: question });
		if (response) {
			return response.value;
		} else {
			return undefined;
		}
	}
	function isAnswerInvalid(answer: string | undefined): boolean {
		return answer === undefined || answer === singleAnswerType.C;
	}

	// TODO: 選択された出力フォーマットでGo言語ロジックを扱う
	// 基本型
	const isDefaultUseUserAnswer = await quickPickPrompt("書式指定子を選べ", [
		{ label: "デフォルトの表現", description: verbDict.DEFAULT_VERB.v, value: verbDict.DEFAULT_VERB.v },
		{ label: "構造体の場合にフィールド名出力", description: verbDict.DEFAULT_VERB.plus_v, value: verbDict.DEFAULT_VERB.plus_v },
		{ label: "Goの文法表現出力", description: verbDict.DEFAULT_VERB.sharp_v, value: verbDict.DEFAULT_VERB.sharp_v },
		{ label: "データ型を出力", description: verbDict.DEFAULT_VERB.T, value: verbDict.DEFAULT_VERB.T },
		{ label: "データ型別で選ぶ", description: "データ型の種類から選択", value: "other" },

	]);
	if (isAnswerInvalid(isDefaultUseUserAnswer)) {
		return singleAnswerType.C;
	} else if (Object.values(verbDict.DEFAULT_VERB).includes(isDefaultUseUserAnswer as string)) {
		// 回答と値の集合と照合
		response.verb += isDefaultUseUserAnswer!.replace("%", ""); // %は最後に付けるので消す
	}
	if (isDefaultUseUserAnswer === "other") {
		// 詳細選択
		const dataTypeQuestionUserAnswer = await quickPickPrompt("データ型を選べ", [
			{ label: "bool", description: "論理値/Boolean", value: "bool" },
			{ label: "int", description: "整数", value: "int" },
			{ label: "float*", description: "浮動小数点数", value: "float" },
			{ label: "complex*", description: "複素数", value: "complex" },
			{ label: "string", description: "文字列", value: "string" },
			{ label: "[]byte", description: "バイト配列", value: "[]byte" }
		]);
		if (isAnswerInvalid(dataTypeQuestionUserAnswer)) {
			return singleAnswerType.C;
		} else {
			if (dataTypeQuestionUserAnswer === "bool") {
				response.verb += "t";// %は最後に付けるので消す
			}
			if (dataTypeQuestionUserAnswer === "int") {
				const answerUserNotation = await quickPickPrompt("表現方法を選べ", [
					{ label: "10進数", description: verbDict.INT.d, value: verbDict.INT.d },
					{ label: "2進数", description: verbDict.INT.b, value: verbDict.INT.b },
					{ label: "8進数", description: verbDict.INT.o, value: verbDict.INT.o },
					{ label: "16進数(small)", description: verbDict.INT.x, value: verbDict.INT.x },
					{ label: "16進数(capital)", description: verbDict.INT.X, value: verbDict.INT.X },
					{ label: "ユニコードコードポイントに対応する文字", description: verbDict.INT.c, value: verbDict.INT.c },
					{ label: "対応する文字を''で囲んだ文字", description: verbDict.INT.q, value: verbDict.INT.q },
				]);
				if (isAnswerInvalid(dataTypeQuestionUserAnswer)) { return singleAnswerType.C; }
				response.verb += answerUserNotation!.replace("%", ""); // %は最後に付けるので消す
			}
			if (dataTypeQuestionUserAnswer === "float" || dataTypeQuestionUserAnswer === "complex") {
				const answerUserNotation = await quickPickPrompt("表現方法を選べ", [
					{ label: "小数なしの2の累乗指数表記", description: verbDict.FLOAT_AND_COMPLEX.b, value: verbDict.FLOAT_AND_COMPLEX.b },
					{ label: "指数表記(e)", description: verbDict.FLOAT_AND_COMPLEX.e, value: verbDict.FLOAT_AND_COMPLEX.e },
					{ label: "指数表記(E)", description: verbDict.FLOAT_AND_COMPLEX.E, value: verbDict.FLOAT_AND_COMPLEX.E },
					{ label: "指数を使わない", description: verbDict.FLOAT_AND_COMPLEX.F, value: verbDict.FLOAT_AND_COMPLEX.F },
					{ label: "指数を使わない", description: verbDict.FLOAT_AND_COMPLEX.f, value: verbDict.FLOAT_AND_COMPLEX.f },
					{ label: "巨大指数時 指数省略(e)", description: verbDict.FLOAT_AND_COMPLEX.g, value: verbDict.FLOAT_AND_COMPLEX.g },
					{ label: "巨大指数時 指数省略(E)", description: verbDict.FLOAT_AND_COMPLEX.G, value: verbDict.FLOAT_AND_COMPLEX.G },
				]);
				if (isAnswerInvalid(dataTypeQuestionUserAnswer)) { return singleAnswerType.C; }
				response.verb += answerUserNotation!.replace("%", ""); // %は最後に付けるので消す
			}
			if (dataTypeQuestionUserAnswer === "string" || dataTypeQuestionUserAnswer === "[]byte") {
				const answerUserNotation = await quickPickPrompt("表現方法を選べ", [
					{ label: "デフォルト", description: verbDict.STRING_AND_BYTE_ARRAY.s, value: verbDict.STRING_AND_BYTE_ARRAY.s },
					{ label: "エスケープされた文字列", description: verbDict.STRING_AND_BYTE_ARRAY.q, value: verbDict.STRING_AND_BYTE_ARRAY.q },
					{ label: "16進数バイト(small)", description: verbDict.STRING_AND_BYTE_ARRAY.x, value: verbDict.STRING_AND_BYTE_ARRAY.x },
					{ label: "16進数バイト(capital)", description: verbDict.STRING_AND_BYTE_ARRAY.X, value: verbDict.STRING_AND_BYTE_ARRAY.X },
				]);
				if (isAnswerInvalid(dataTypeQuestionUserAnswer)) { return singleAnswerType.C; }
				response.verb += answerUserNotation!.replace("%", ""); // %は最後に付けるので消す;
			}
		}// ? 残りはフラグ 特殊表現


		// フラグ、幅、精度のオプションをユーザーに促す
		const selectedFlagsAnswer = await vscode.window.showQuickPick([
			{ label: verbDict.FLAG.plus, description: "符号付強制 / `%q` ASCII文字のみ出力", value: verbDict.FLAG.plus },
			{ label: verbDict.FLAG.minus, description: "左詰め", value: verbDict.FLAG.minus },
			{ label: verbDict.FLAG.sharp, description: "デフォルトとは異なるフォーマット", value: verbDict.FLAG.sharp },
			{ label: verbDict.FLAG.space, description: "", value: verbDict.FLAG.space },
			{ label: verbDict.FLAG.zero, description: "", value: verbDict.FLAG.zero },
		], {
			placeHolder: "フラグを選択 または Escキー を押してスキップ",
			canPickMany: true // 複数選択可
		});
		let selectedFlags: string | undefined;
		if (selectedFlagsAnswer) {
			// 結合
			selectedFlags = selectedFlagsAnswer.map(flag => flag.value).join("");
		}

		const width = await vscode.window.showInputBox({
			prompt: "幅を入力する または Escキー を押してスキップ"
		});

		const precision = await vscode.window.showInputBox({
			prompt: "精度を入力する または Escキー を押してスキップ"
		});

		// ユーザーのオプションに基づき、適切な動詞を決定する
		response.flag = `${selectedFlags ?? ""}`;
		response.width = `${width ? `${width}` : ""}`;
		response.precision = `${precision ? `.${precision}` : ""}`;
	}

	// TODO : 設定
	// 最後の仕上げ
	const isInsertNewLine = await yesNoPrompt("改行しますか?");
	if (isInsertNewLine === singleAnswerType.Y) {
		response.verb += "\\n";
	} else if (isInsertNewLine === singleAnswerType.C) {
		return singleAnswerType.C;
	}
	return response.symbol + response.flag + response.width + response.precision + response.verb;
}

async function handleUnsupportedLanguage(): Promise<void> {
	await vscode.window.showInformationMessage("この言語は現在サポートされていません。");
}


async function getActiveDocumentLanguageId(): Promise<string | undefined> {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		let languageId = editor.document.languageId;
		if (languageId === "plaintext" || languageId === "markdown") {
			// 言語を尋ねる
			languageId = await selectLanguage();
		}
		return languageId;
	}
	return undefined;
}

function getBeforeAndAfterCharacter(): [string | undefined, string | undefined] {
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		const document = editor.document;
		const position = editor.selection.active;
		const line = document.lineAt(position.line).text;
		const charBefore = line.charAt(position.character - 1);
		const charAfter = line.charAt(position.character);
		// const selectionText = editor.document.getText(editor.selection);
		// const textBeforeCursor = line.slice(0, position.character);
		// const textAfterCursor = line.slice(position.character);

		return [charBefore, charAfter];
	}
	return [undefined, undefined];
}

function getEnclosedString(str: string): string {
	let [charB4, charAfter] = getBeforeAndAfterCharacter();
	if (
		charB4 === "'" && charAfter === "'" ||
		charB4 === '"' && charAfter === '"'
	) {
		return `${str}`;
	} else {
		return `"${str}"`;
	}
}

function editInsert(insertStr: String): void {
	// 書き込み
	const editor = vscode.window.activeTextEditor;
	if (editor) {
		editor.edit(editBuilder => {
			/* @ts-ignore */// ? エラー黙殺
			editBuilder.insert(editor.selection.active, insertStr);
		});
	}
}

function deactivate() { }

export { activate, deactivate };
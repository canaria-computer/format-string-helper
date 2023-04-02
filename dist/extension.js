(()=>{"use strict";var e={496:e=>{e.exports=require("vscode")}},a={};function t(i){var l=a[i];if(void 0!==l)return l.exports;var n=a[i]={exports:{}};return e[i](n,n.exports,t),n.exports}var i={};(()=>{var e=i;Object.defineProperty(e,"__esModule",{value:!0}),e.deactivate=e.activate=void 0;const a=t(496);e.activate=async function(e){const t=a.commands.registerCommand("format-string-helper.helpFormatString",(async()=>{let e=await async function(){const e=a.window.activeTextEditor;if(e){let t=e.document.languageId;return"plaintext"!==t&&"markdown"!==t||(t=await async function(){const e=await a.languages.getLanguages();return await a.window.showQuickPick(e)||""}()),t}}(),t="";e&&a.window.showInformationMessage(`Running language: ${e}`),"go"===e||"c"===e?t=await async function(){let e={symbol:Object.freeze("%"),flag:"",width:"",precision:"",verb:""};const t=Object.freeze({Y:"YES",N:"No",C:"Cancel"}),i=Object.freeze(Object.values(t)),l=Object.freeze({DEFAULT_VERB:Object.freeze({v:"%v",plus_v:"%+v",sharp_v:"%#v",T:"%T"}),BOOLEAN:Object.freeze({t:"%t"}),INT:Object.freeze({d:"%d",b:"%b",o:"%o",x:"%x",X:"%X",c:"%c",q:"%q"}),FLOAT_AND_COMPLEX:Object.freeze({b:"%b",e:"%e",E:"%E",f:"%f",F:"%F",g:"%g",G:"%G"}),STRING_AND_BYTE_ARRAY:Object.freeze({s:"%s",q:"%q",x:"%x",X:"%X"}),FLAG:Object.freeze({plus:"+",sharp:"#",space:" ",zero:"0",minus:"-"})});async function n(e,t){t.push({label:"Cancel",description:"",value:"Cancel"});const i=await a.window.showQuickPick(t,{placeHolder:e});return i?i.value:void 0}function o(e){return void 0===e||e===t.C}const c=await n("書式指定子を選べ",[{label:"デフォルトの表現",description:l.DEFAULT_VERB.v,value:l.DEFAULT_VERB.v},{label:"構造体の場合にフィールド名出力",description:l.DEFAULT_VERB.plus_v,value:l.DEFAULT_VERB.plus_v},{label:"Goの文法表現出力",description:l.DEFAULT_VERB.sharp_v,value:l.DEFAULT_VERB.sharp_v},{label:"データ型を出力",description:l.DEFAULT_VERB.T,value:l.DEFAULT_VERB.T},{label:"データ型別で選ぶ",description:"データ型の種類から選択",value:"other"}]);if(o(c))return t.C;if(Object.values(l.DEFAULT_VERB).includes(c)&&(e.verb+=c.replace("%","")),"other"===c){const i=await n("データ型を選べ",[{label:"bool",description:"論理値/Boolean",value:"bool"},{label:"int",description:"整数",value:"int"},{label:"float*",description:"浮動小数点数",value:"float"},{label:"complex*",description:"複素数",value:"complex"},{label:"string",description:"文字列",value:"string"},{label:"[]byte",description:"バイト配列",value:"[]byte"}]);if(o(i))return t.C;if("bool"===i&&(e.verb+="t"),"int"===i){const a=await n("表現方法を選べ",[{label:"10進数",description:l.INT.d,value:l.INT.d},{label:"2進数",description:l.INT.b,value:l.INT.b},{label:"8進数",description:l.INT.o,value:l.INT.o},{label:"16進数(small)",description:l.INT.x,value:l.INT.x},{label:"16進数(capital)",description:l.INT.X,value:l.INT.X},{label:"ユニコードコードポイントに対応する文字",description:l.INT.c,value:l.INT.c},{label:"対応する文字を''で囲んだ文字",description:l.INT.q,value:l.INT.q}]);if(o(i))return t.C;e.verb+=a.replace("%","")}if("float"===i||"complex"===i){const a=await n("表現方法を選べ",[{label:"小数なしの2の累乗指数表記",description:l.FLOAT_AND_COMPLEX.b,value:l.FLOAT_AND_COMPLEX.b},{label:"指数表記(e)",description:l.FLOAT_AND_COMPLEX.e,value:l.FLOAT_AND_COMPLEX.e},{label:"指数表記(E)",description:l.FLOAT_AND_COMPLEX.E,value:l.FLOAT_AND_COMPLEX.E},{label:"指数を使わない",description:l.FLOAT_AND_COMPLEX.F,value:l.FLOAT_AND_COMPLEX.F},{label:"指数を使わない",description:l.FLOAT_AND_COMPLEX.f,value:l.FLOAT_AND_COMPLEX.f},{label:"巨大指数時 指数省略(e)",description:l.FLOAT_AND_COMPLEX.g,value:l.FLOAT_AND_COMPLEX.g},{label:"巨大指数時 指数省略(E)",description:l.FLOAT_AND_COMPLEX.G,value:l.FLOAT_AND_COMPLEX.G}]);if(o(i))return t.C;e.verb+=a.replace("%","")}if("string"===i||"[]byte"===i){const a=await n("表現方法を選べ",[{label:"デフォルト",description:l.STRING_AND_BYTE_ARRAY.s,value:l.STRING_AND_BYTE_ARRAY.s},{label:"エスケープされた文字列",description:l.STRING_AND_BYTE_ARRAY.q,value:l.STRING_AND_BYTE_ARRAY.q},{label:"16進数バイト(small)",description:l.STRING_AND_BYTE_ARRAY.x,value:l.STRING_AND_BYTE_ARRAY.x},{label:"16進数バイト(capital)",description:l.STRING_AND_BYTE_ARRAY.X,value:l.STRING_AND_BYTE_ARRAY.X}]);if(o(i))return t.C;e.verb+=a.replace("%","")}const c=await a.window.showQuickPick([{label:l.FLAG.plus,description:"符号付強制 / `%q` ASCII文字のみ出力",value:l.FLAG.plus},{label:l.FLAG.minus,description:"左詰め",value:l.FLAG.minus},{label:l.FLAG.sharp,description:"デフォルトとは異なるフォーマット",value:l.FLAG.sharp},{label:l.FLAG.space,description:"",value:l.FLAG.space},{label:l.FLAG.zero,description:"",value:l.FLAG.zero}],{placeHolder:"フラグを選択 または Escキー を押してスキップ",canPickMany:!0});let r;c&&(r=c.map((e=>e.value)).join(""));const s=await a.window.showInputBox({prompt:"幅を入力する または Escキー を押してスキップ"}),u=await a.window.showInputBox({prompt:"精度を入力する または Escキー を押してスキップ"});e.flag=`${r??""}`,e.width=s?`${s}`:"",e.precision=u?`.${u}`:""}const r=await async function(e){const l=await a.window.showQuickPick(i,{placeHolder:e});return void 0===l||l===t.C?(a.window.showWarningMessage("実行をキャンセル"),t.C):l}("改行しますか?");if(r===t.Y)e.verb+="\\n";else if(r===t.C)return t.C;return e.symbol+e.flag+e.width+e.precision+e.verb}():await async function(){await a.window.showInformationMessage("この言語は現在サポートされていません。")}(),"Cancel"!==t&&(t=function(e){let[t,i]=function(){const e=a.window.activeTextEditor;if(e){const a=e.document,t=e.selection.active,i=a.lineAt(t.line).text;return[i.charAt(t.character-1),i.charAt(t.character)]}return[void 0,void 0]}();return"'"===t&&"'"===i||'"'===t&&'"'===i?`${e}`:`"${e}"`}(t),function(e){const t=a.window.activeTextEditor;t&&t.edit((a=>{a.insert(t.selection.active,e)}))}(t))}));e.subscriptions.push(t)},e.deactivate=function(){}})(),module.exports=i})();
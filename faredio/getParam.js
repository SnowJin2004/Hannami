/*************************

Faredio 2.0 Program "getParam.js"
このファイルは、Faredio 2.0のシステムを構成する必須ファイルです。
編集しないでください。
Copyright(C) tamantrain

*************************/

/*受け取った情報を整理*/
var paramFull = location.search.substring(1, location.search.length);
var paramSep = paramFull.split("&");
var keys = new Object();
var nameBuf = "", cntBuf = "";
var paramBuf = new Array();

for (var i = 0; i < paramSep.length; i++)
{
	paramBuf = paramSep[i].split("=");
	nameBuf = paramBuf[0];
	cntBuf = paramBuf[1];
	keys[nameBuf] = cntBuf;
}

//整理した情報を格納]
var faredioDirG = decodeURI(keys["dir"]).replace(/%2F/g, "\/");
var fileName = decodeURI(keys["fn"]);
var strLineR = parseInt(keys["vl"]), golLineR = parseInt(keys["gl"]), levR = parseInt(keys["lev"]), arvR = parseInt(keys["arv"]);

//JavaScript を読み込む
window.document.write('<script type="text/javascript" src="' + (faredioDirG + 'datas\/' + fileName) + '"><\/script>');
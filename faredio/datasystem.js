/*************************

Faredio 2.0 Program "datasystem.js"
このファイルは、Faredio 2.0のシステムを構成する必須ファイルです。
編集しないでください。
Copyright(C) tamantrain

*************************/

//変数定義部(1)
var MAXSTACT = 100;	//1路線に最大設置できる駅数
var MAXFIND = 50;	//一回のsearch関数が見つける経路数
var MAXLINE = 5;	//一つの経路につき何路線まで許容するか
var DEFAULTCOLOR = "#a2a9b1";	//既定のラインカラー
var ERR = -1;	//エラー定数

/***************************************/

//1駅に関するクラス: Station(駅名, ローマ字表記, 駅ナンバリング)
Station = function(_name, _roman, _numberling) {
	this.name = _name;
	this.roman = _roman;
	this.numberling = _numberling;
}

/***************************************/

//駅全てを管理するクラス: StationList
StationList = function() {
	this.staList = new Array();
}
//駅リストに駅を追加するメソッド: addToStaList(引数はStation型)
StationList.prototype.addToStaList = function(_station) {
	this.staList.push(_station);
}

//駅名から駅番号を検索して返す関数
StationList.prototype.searchFromName = function(_name) {
	var maxCnt = this.staList.length;
	var result = ERR;

	for (var i=0; i<maxCnt; i++) {
		if (this.staList[i].name == _name) {
			result = i; break;
		}
	}

	return result;
}

//ローマ字表記から駅番号を検索して返す関数
StationList.prototype.searchFromRoman = function(_roman) {
	var maxCnt = this.staList.length;
	var result = ERR;

	for (var i=0; i<maxCnt; i++) {
		if (this.staList[i].roman == _roman) {
			result = i; break;
		}
	}

	return result;
}

//駅ナンバリングから駅番号を検索して返す関数
StationList.prototype.searchFromNumberling = function(_numberling) {
	var maxCnt = this.staList.length;
	var result = ERR;

	for (var i=0; i<maxCnt; i++) {
		if (this.staList[i].numberling == _numberling) {
			result = i; break;
		}
	}

	return result;
}

/***************************************/
//乗り換え禁止の規定
//_staNum: 駅番号
//_lineNum: 乗り換え先の路線

BanTransfer = function(_staNum, _lineNum) {
	this.staNum = _staNum;
	this.lineNum = _lineNum;
}

/***************************************/

//路線に関するクラス: Line
Line = function(_name, _fareRule, _walk, _color,  _icon) {
	this.name = _name;
	this.staNum = new Array();	//設置される駅番号の対応表
	this.roadK = new Array();	//i番目から(i+1)番目までの駅間キロ
	this.fareRule = _fareRule;	//適用する運賃規定の番号
	this.walk = false;
	if (_walk!=undefined) this.walk = _walk;	//徒歩連絡ならtrue
	this.banUse = new Array();	//乗降禁止駅
	this.banTrans = new Array();	//乗り換え禁止駅
	this.color = DEFAULTCOLOR;
	if (_color != undefined) this.color = _color;	//路線カラー
	this.icon = _icon;
}

Line.prototype.setSta = function(_staNum, _roadK) {
	for (var i=0; i<_staNum.length; i++) {
		this.staNum[i] = _staNum[i];
		if (i<_roadK.length) this.roadK[i] = _roadK[i];
	}
}

//その路線上にその駅があるかどうかを判定し、あればその路線における駅番号を、なければエラー値で返すメソッド
Line.prototype.exsist = function(_staNum) {
	var result = ERR;

	for (var i=0; i<this.staNum.length; i++) {
		if (this.staNum[i] == _staNum) { result = i; break; }
	}

	return result;
}

//路線内の二駅間のキロ程を返すメソッド
//sta1, sta2は駅番号で指定：両駅ともその路線上にあることが前提
Line.prototype.distance = function(sta1, sta2) {
	var sta1IL = this.exsist(sta1);
	var sta2IL = this.exsist(sta2);
	var sta12buf = 0;
	var killo = 0;

	if (sta1IL > sta2IL) {
		sta12buf = sta2IL;
		sta2IL = sta1IL;
		sta1IL = sta12buf;
	}

	for (var i=sta1IL; i<sta2IL; i++) {
		killo += this.roadK[i];
	}

	return killo;
}

//路線内の二駅間のキロ程を返すメソッド
//sta1, sta2はその路線における駅番号で指定：両駅ともその路線上にあることが前提
Line.prototype.distanceOL = function(sta1, sta2) {
	var sta1IL = sta1;
	var sta2IL = sta2;
	var sta12buf = 0;
	var killo = 0;

	if (sta1IL > sta2IL) {
		sta12buf = sta2IL;
		sta2IL = sta1IL;
		sta1IL = sta12buf;
	}

	for (var i=sta1IL; i<sta2IL; i++) {
		killo += this.roadK[i];
	}

	return killo;
}

//乗り換え禁止駅の指定
Line.prototype.addBanTrans = function(_staNum, _lineNum) {
	this.banTrans.push(new BanTransfer(_staNum, _lineNum));
}

//その駅が乗降禁止駅かどうかを判定
Line.prototype.banUseSta = function(_staNumOnLine) {
	var result = false;

	for (var i=0; i<this.banUse.length; i++) {
		if (this.banUse[i]==this.staNum[_staNumOnLine]) { result = true; break; }
	}

	return result;
}

//乗り換え禁止かどうかを判定
Line.prototype.banTransSta = function(_staNumOnLine, _lineNum) {
	var result = false;

	//乗降禁止駅の場合乗り換え禁止駅と判定
	result = this.banUseSta(_staNumOnLine);

	if (!result) for (var i=0; i<this.banTrans.length; i++) {
		if (this.banTrans[i].staNum==this.staNum[_staNumOnLine] && this.banTrans[i].lineNum==_lineNum) {
			result = true; break;
		}
	}

	return result;
}

/***************************************/

//運賃項目の1つ1つ: FareRow(運賃はICカードの運賃で指定)
FareRow = function(_minK, _maxK, _fare) {
	this.minK = _minK;
	this.maxK = _maxK;
	this.fare = _fare;
}

//きっぷの時の運賃を取得するメソッド
// FareRow.prototype.getTicketFare = function(_ICmode) {
// 	//_ICmode
// 	//0: きっぷの場合ICカードの運賃の円単位切り捨て
// 	//1: きっぷの場合ICカードの運賃の円単位切り上げ
// 	//2: きっぷの場合ICカードの運賃の円単位四捨五入
// 	//それ以外: きっぷとICカードの運賃は同一

// 	var baseFare = this.fare;	//基準の運賃(IC大人)
// 	var adultFare = baseFare;	//きっぷの大人運賃

// 	switch (_ICmode) {
// 	  case 0: adultFare = 10*Math.floor(baseFare*0.1); break;
// 	  case 1: adultFare = 10*Math.ceil(baseFare*0.1); break;
// 	  case 2: adultFare = 10*Math.round(baseFare*0.1); break;
// 	}

// 	return adultFare;
// }

FareRow.prototype.getTicketFare = function(_ICmode) {
	//ICFare	←生存模式票价（baseFare）
	//TicketFare←创造模式票价（1/2 baseFare)

	var baseFare = this.fare;	//基準の運賃(IC大人)
	var adultFare = baseFare;	//きっぷの大人運賃

	adultFare = baseFare/2;

	return adultFare;
}

/***************************************/

//運賃規定を定めるクラス: FareTable
FareTable = function(_ICmode) {
	this.fareRows = new Array();
	this.ICmode = _ICmode;
}

FareTable.prototype.addFareTable = function(_minK, _maxK, _fare) {
	var fareRowBuf = new FareRow(_minK, _maxK, _fare);
	this.fareRows.push(fareRowBuf);
}
//テーブルからIC運賃を返すメソッド
FareTable.prototype.findFareIC = function(_killo) {
	var foundFare = 0;

	for (var i=0; i<this.fareRows.length; i++) {
		if ((this.fareRows[i].minK-1)<_killo && _killo<=this.fareRows[i].maxK) {
			foundFare = this.fareRows[i].fare;
			break;
		}
	}

	return foundFare;
}

//テーブルから乗車券の運賃を返すメソッド
FareTable.prototype.findFareTicket = function(_killo) {
	var foundFare = 0;

	for (var i=0; i<this.fareRows.length; i++) {
		if ((this.fareRows[i].minK-1)<_killo && _killo<=this.fareRows[i].maxK) {
			foundFare = this.fareRows[i].getTicketFare(this.ICmode);
			break;
		}
	}

	return foundFare;
}

/***************************************/

//特定運賃のテーブル

SpcFare = function(_fareIC, _fareTicket, _via) {
	//this.sta1 = _sta1;
	//this.sta2 = _sta2;
	this.fareIC = _fareIC;
	this.fareTicket = _fareTicket;
	this.via = _via;
}

/***************************************/

//変数定義部(2)

var stationList = new StationList();
var lines = new Array();
var fareRule = new Array();	//標準の運賃規定
var dataName = "";		//データの名前(鉄道会社名など)
var dataFileName = "";	//データファイル名
var specificFare = new Array();	//特定運賃
var userCalc ="";		//ユーザー指定スクリプトのファイル名

/***************************************/

//徒歩連絡登録クラス
//staGrp: 相互に徒歩連絡可能な駅番号(array as integer)
//※コンストラクタにより自動で新路線が登録される
WalkTransfer = function(_staGrp) {
	for (var i=0; i<_staGrp.length; i++)
	 for (var j=i+1; j<_staGrp.length; j++) {
		var walkRoute = new Line("徒歩連絡",ERR,true);
		var d = new Array(1);
		d[0]=0;
		walkRoute.setSta(new Array(_staGrp[i], _staGrp[j]), d);
		lines.push(walkRoute);
	}
}
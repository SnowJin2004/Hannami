/*************************

Faredio 2.0 Program "core.js"
このファイルは、Faredio 2.0のシステムを構成する必須ファイルです。
編集しないでください。
Copyright(C) tamantrain

*************************/

//バージョン番号
var version = "2.0.24";

//var searchCnt = 0;	//search関数が実行された回数

//既に通った駅であるかを判定する関数
//_sta: 駅番号(idx)
//_pastRoute: これまでの経路(array as integer)
function pastSta(_sta, _pastRoute) {
	var result = false;
	var staNumOnLineBuf = 0;
	var sta1=0, sta2=0, staBuf=0;

	for (var i=1; i<=(_pastRoute.length-1)/2; i++) {
		//徒歩連絡の場合は処理をせず次の処理に進む
		if (lines[_pastRoute[2*i-1]].walk) continue;

		staNumOnLineBuf = lines[_pastRoute[2*i-1]].exsist(_sta);
		//駅が調べる路線上にない場合は続行
		//if (staNumOnLineBuf == ERR) continue;

		sta1 = lines[_pastRoute[2*i-1]].exsist(_pastRoute[2*i-2]);
		sta2 = lines[_pastRoute[2*i-1]].exsist(_pastRoute[2*i]);

		//_pastRouteの末尾の駅はpastStaに含まない
		if (2*i==(_pastRoute.length-1)) {
			if (sta1 < sta2) --sta2;
			else if (sta1 > sta2) ++sta2;
		}

		if (sta1 > sta2) {
			staBuf = sta1;
			sta1 = sta2;
			sta2 = staBuf;
		}
		if (sta1<=staNumOnLineBuf && staNumOnLineBuf<=sta2) {
			result = true; break;
		}
	}

	return result;
}

//2駅の間に既に通った駅が存在するかを調べる関数
//_lineIdx: 路線番号
//_sta1, _sta2: その路線の上での駅番号(idx)
//_pastRoute: これまでの経路
function exsistPastSta(_lineIdx, _sta1, _sta2, _pastRoute) {
	var sta1=_sta1, sta2=_sta2, staBuf=0;
	var result = false;

	if (sta1>sta2) {
		staBuf = sta1;
		sta1 = sta2;
		sta2 = staBuf;
	}

	for (i=sta1; i<=sta2; i++) {
		if (pastSta(lines[_lineIdx].staNum[i], _pastRoute)) {
			result = true; break;
		}
	}

	return result;
}

//startSta: 検索開始駅(idx)
//goalSta: 検索終了駅(idx)
//startLine: 利用開始路線(idx)
//pastRoute: これまでの経路(array as integer)
//tree: 何階層目の再帰か(0: 最初の呼び出し)
//戻り値は見つかった経路を表すinteger配列(偶数番目が通った駅、奇数番目が乗車路線)全てを集めた配列
function search(startSta, goalSta, startLine, _pastRoute, tree) {
	var pastRoute = _pastRoute;	//startStaまでに通った経路(buffer)
	//var pastRoute2;			//pastRouteの退避用バッファ
	var foundRoutes = new Array(MAXFIND);	//見つかった経路
	var foundCnt = 0;	//見つかった経路の個数を数える
	var newFoundRoutes = new Array();	//新たに見つかった経路(buffer)
	var failed = true;	//検索失敗フラグ
	var startStaOnLine = lines[startLine].exsist(startSta);
	var goalStaOnLine = lines[startLine].exsist(goalSta);	//出発駅、到着駅のstartLine上での位置
	var s1 = 0;	//乗換駅の検索開始位置
	var s2 = lines[startLine].staNum.length - 1;	//乗換駅の検索終了位置
	//var testStrings = "";	//テスト用アラート
	var x1 = 0, x2 = 0;		//次の乗換検索駅(x1: スタート駅より番号の小さい側; x2: スタート駅より番号の大きい側)

	//startStaでは別路線への乗り換えを行うことはない

	//本関数では実行回数を制限
	//startLine上でstartStaが使用禁止駅のときは検索を行わない
	if (_pastRoute.length <= 2*MAXLINE-1 && !lines[startLine].banUseSta(startStaOnLine)) {

	//foundRoutes配列を初期化
	for (var i=0; i<MAXFIND; i++) foundRoutes[i] = new Array();

	//startLine上にgoalStaがあるとき
	//既に通った駅が区間内に存在するならこの操作はスキップ
	if (goalStaOnLine != ERR && !exsistPastSta(startLine, lines[startLine].exsist(startSta), lines[startLine].exsist(goalSta), _pastRoute)) {
		//乗降禁止駅なら処理をしない
		if (!lines[startLine].banUseSta(goalStaOnLine)) {
			pastRoute.push(startLine);
			pastRoute.push(goalSta);
			//foundRoutes[foundCnt++] = pastRoute;	//見つかった経路に登録
			//見つかった経路に登録
			for (var i=0; i<pastRoute.length; i++) {
				foundRoutes[foundCnt][i] = pastRoute[i];
			}
			foundCnt++;
			//foundRoutes[0] = pastRoute;
			failed = false;	//検索成功

			//バッファをリセット(2回実行する必要あり)
			pastRoute.pop(); pastRoute.pop();
		}
	}

	//乗り換え有りの経路検索(※先の過程で経路が見つかった場合でも行う)

	//乗換駅を検索
	
	//startLine上にgoalStaがあるときは、乗換駅の検索範囲を絞る
	if (goalStaOnLine != ERR) {
		if (startStaOnLine < goalStaOnLine) s2 = goalStaOnLine - 1;
		else s1 = goalStaOnLine + 1;
	}
	x1 = s1; x2 = s2;

	while(x1<=startStaOnLine && startStaOnLine<=x2) {
		var i = 0;	//乗換検索駅
		//検索開始駅より距離の遠い駅から順に検索する
		if ( lines[startLine].distanceOL(x1, startStaOnLine) >= lines[startLine].distanceOL(x2, startStaOnLine) ) {
			i = x1; x1++;
		} else {
			i = x2; x2--;
		}
		//lines[startLine].staNum[i]が検索開始駅でない場合のみ乗り換えを調べる
		//ただし検索開始駅がユーザーにより指定された乗車駅の時であってtree=0時のみ乗り換えを認める
		//乗換駅までの道程に過去に通過した駅がある場合は乗り換えを認めない
		if (!lines[startLine].banUseSta(lines[startLine].staNum[i]) && ((lines[startLine].staNum[i]!=startSta && !exsistPastSta(startLine, lines[startLine].exsist(startSta), i, _pastRoute)) || (tree==0 && lines[startLine].staNum[i]==startSta))) {
			for (var j=0; j<lines.length; j++) {
				if (j != startLine) {
					var changedBuf = false;	//バッファ更新フラグ
					//路線番号jに駅lines[startLine].staNum[i]が存在するなら、startStaを変更して再検索
					//乗り換え禁止ならスキップ
					if (lines[j].exsist(lines[startLine].staNum[i]) != ERR && (!lines[startLine].banTransSta(i, j) || (tree==0 && lines[startLine].staNum[i]==startSta))) {
						//バッファをリセット
						newFoundRoutes = new Array();

						//バッファの更新
						//※ユーザー指定の乗車駅で最初に乗り換え(路線変更)を行った場合はバッファを更新しない
						if (lines[startLine].staNum[i] != startSta) {
							pastRoute.push(startLine);
							pastRoute.push(lines[startLine].staNum[i]);
							changedBuf = true;
						}
						//出発駅を乗り換える駅に変更し、路線も変更して再検索
						newFoundRoutes = search(lines[startLine].staNum[i], goalSta, j, pastRoute, tree+1);

						//バッファをリセット(2回実行する必要あり)
						if (changedBuf) {
							pastRoute.pop(); pastRoute.pop();
						}
						//再検索で見つかった経路を追加(空配列でない場合のみ)
						for (var k=0; k<newFoundRoutes.length && foundCnt<MAXFIND; k++) {
							if (newFoundRoutes[k].length>0) {
								for (var m=0; m<newFoundRoutes[k].length; m++)
									foundRoutes[foundCnt][m] = newFoundRoutes[k][m];
								foundCnt++;
							}
						}
						//検索成功
						failed = false;
						}
					}
				}
			}
		}
	}

	//結果を返す。検索失敗の場合は空の配列でリターン
	if (failed) foundRoutes = new Array();
	return foundRoutes;
}

//特定運賃の適用が可能かを判定する関数
//不可能なら空配列、可能ならその特定運賃([0]IC運賃、[1]乗車券運賃)を返す

function enableSpcFare(_via) {
	var result = new Array();

	for (var i=0; i<specificFare.length; i++) {
		var ableApply = true;

		for (var j=0; j<_via.length; j++)
			if (specificFare[i].via[j]==undefined || specificFare[i].via[j]!=_via[j]) {
				ableApply=false;	break;
			}

		if (!ableApply) {
		ableApply = true;
		for (var j=0; j<_via.length; j++)
			if (specificFare[i].via[j]==undefined || specificFare[i].via[_via.length-1-j]!=_via[j]) {
				ableApply=false;	break;
			}
		}

		if (ableApply) {
			result.push(specificFare[i].fareIC);
			result.push(specificFare[i].fareTicket);
			break;
		}
	}

	return result;
}

//見つかった経路から運賃を計算して保持するオブジェクト
CalcFares = function(_route) {
	var sum_killo_Buf = 0.0;
	var ruleNumBuf = lines[_route[1]].fareRule;
	var sta1 = _route[0];
	var sta2 = 0;
	var viaBuf = new Array();

	this.killo = new Array();
	this.ICFare = new Array();
	this.TicketFare = new Array();

	//通算キロ・運賃を初期化
	this.killo[0] = 0.0;
	this.ICFare[0] = 0;
	this.TicketFare[0] = 0;

	//もし最初の経路が徒歩連絡ならバッファを変更
	if (lines[_route[1]].walk && _route.length>3) {
		ruleNumBuf = lines[_route[3]].fareRule;
		sta1 = _route[2];
	}

	viaBuf[0] = sta1;

	for (var i=1; i<_route.length; i+=2) {
		viaBuf.push(_route[i], _route[i+1]);
		//if (!lines[_route[i]].walk)
			sum_killo_Buf += lines[_route[i]].distance(_route[i-1], _route[i+1]);

		//直前から運賃規定が変化したとき
		//else {
		if (i+2>=_route.length || (!lines[_route[i+2]].walk && lines[_route[i+2]].fareRule!=ruleNumBuf)) {
			var spcFareApld = enableSpcFare(viaBuf);
			if (spcFareApld.length>0) {
				//alert("specific Fare applied");
				//特定運賃が適用される場合
				this.killo.push(ERR);	//特定運賃なら規定番号はERR
				this.ICFare[0] += spcFareApld[0];
				this.ICFare.push(ERR);
				this.ICFare.push(spcFareApld[0]);
				this.TicketFare[0] += spcFareApld[1];
				this.TicketFare.push(ERR);
				this.TicketFare.push(spcFareApld[1]);
			} else {
				if (ruleNumBuf==ERR) {
					this.killo.push(0);
					this.ICFare.push(ruleNumBuf);
					this.ICFare.push(0);
					this.TicketFare.push(ruleNumBuf);
					this.TicketFare.push(0);
				} else {
					this.killo.push(ruleNumBuf);
					var fIC = fareRule[ruleNumBuf].findFareIC(sum_killo_Buf);
					var fTicket = fareRule[ruleNumBuf].findFareTicket(sum_killo_Buf);
					this.ICFare[0] += fIC;
					this.ICFare.push(ruleNumBuf);
					this.ICFare.push(fIC);
					this.TicketFare[0] += fTicket;
					this.TicketFare.push(ruleNumBuf);
					this.TicketFare.push(fTicket);
				}
			}
			this.killo[0] += sum_killo_Buf;
			this.killo.push(sum_killo_Buf);

			if (i+2<_route.length) {
				ruleNumBuf = lines[_route[i+2]].fareRule;
				sum_killo_Buf = 0.0;
				sta1 = _route[i+1];
				viaBuf = new Array();
				viaBuf[0] = sta1;
			}
		}
	}

	//浮動小数点誤差を補正
	for (var i=0; i<this.killo.length; i++) {
		var buf = this.killo[i] * 10.0;
		this.killo[i] = Math.round(buf) / 10.0;
	}
}

/***ソートアルゴリズムの実装[マージソート,結果を値の小さい順に返す]***/

SortItem = function(_idx, _data) {
	this.idx = _idx;
	this.data = _data;
}

//ソートされた2つの配列をマージ
//戻り値はマージした配列

function marge1(_array1, _array2) {
	var result = new Array();
	var j=0, k=0;

	while (j<_array1.length || k<_array2.length) {
		if (j<_array1.length && k<_array2.length) {
			if (_array1[j].data <= _array2[k].data) result.push(_array1[j++]);
			else result.push(_array2[k++]);
		}
		else if (j>=_array1.length && k<_array2.length)
			result.push(_array2[k++]);
		else
			result.push(_array1[j++]);
	}

	return result;
}

function marge2(_arrays) {
	var margedArrays = new Array();
	var i=0;
	var result = new Array();

	for (i=0; i<=_arrays.length-2; i+=2) {
		margedArrays.push(marge1(_arrays[i], _arrays[i+1]));
	}
	//末尾にまだデータが残っている場合
	if (i<_arrays.length) margedArrays.push(_arrays[i]);

	//マージ続行の場合
	if (margedArrays.length >= 2) result = marge2(margedArrays);
	//マージ終了の場合
	else result = margedArrays;

	return result;
}

//任意の配列を値の小さい順にソートする関数(マージソート)
//戻り値はソートした場合の配列番号
//_array={3,1,5,6,4,2,8}なら戻り値は{1,5,0,4,2,3,6}
function margeSort(_array) {
	var margeItems = new Array(_array.length);
	var sortedDatas = new Array();
	var result = new Array;

	for (var i=0; i<_array.length; i++) {
		margeItems[i] = new Array();
		margeItems[i][0] = new SortItem(i, _array[i]);
	}

	sortedDatas = marge2(margeItems);

	for (var i=0; i<sortedDatas[0].length; i++) {
		result[i] = sortedDatas[0][i].idx;
	}

	return result;
}
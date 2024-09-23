/*************************

Faredio 2.0 Program "routesel.js"
このファイルは、Faredio 2.0のシステムを構成する必須ファイルです。
編集しないでください。
Copyright(C) tamantrain

*************************/

/****************************************/
//FoundRoute class

//_route: 経路データ
//_inv: 逆経路=true
FoundRoute = function(_route, _inv) {
	this.route = new Array();
	this.fare = new CalcFares(_route);
	this.lineAndSta = new Array();	//通った駅名,路線番号を名称に変換して格納(配列長さはrouteと同じ)
	this.aprBranch = true;	//分岐点を通らないか、通るが経路として適切な場合true

	//逆経路の場合反転
	if (_inv) {
		for (var i=0; i<_route.length; i++) {
			this.route[i] = _route[_route.length-1-i];
		}
	} else {
		this.route = _route;
	}

	//lineAndSta 配列の設定
	for (var i=0; i<this.route.length; i++) {
		//奇数番目なら路線名に変換
		if (i%2) {
			if (lines[this.route[i]].walk)
				this.lineAndSta[i] = "步行";
			else
				this.lineAndSta[i] = lines[this.route[i]].name;
		}
		//偶数番目なら駅名に変換
		else {
			//分岐点の設定
			if (stationList.staList[this.route[i]].name.indexOf("BRH_")==0) {
				this.lineAndSta[i] = stationList.staList[this.route[i]].name.substr(4);
				//経路適切性の判定(分岐点の基準駅を通る場合は不適切と判断)
				if (this.aprBranch) {
					var brhSta = stationList.searchFromNumberling(stationList.staList[this.route[i]].numberling.substr(4));
					if (pastSta(brhSta, this.route)) this.aprBranch = false;
				}
			}
			else	this.lineAndSta[i] = stationList.staList[this.route[i]].name;
		}
	}
	
	//鉄道に固有な特殊な運賃体系を適用
	this.scFare();
}

FoundRoute.prototype.scFare = function() {}

/****************************************/
//RouteSet class

RouteSet = function(_startSta, _goalSta, _startLine, _goalLine) {
	var sortData = new Array();
	var allRoutes = new Array();
	var allRoutesInv = new Array();
	var sortIdxBuf = new Array();
	var sortedDataBuf = new Array();

	//検索
	allRoutes = search(_startSta, _goalSta, _startLine, [_startSta], 0);
	//逆ルート検索
	allRoutesInv = search(_goalSta, _startSta, _goalLine, [_goalSta], 0);

	this.foundRoutes = new Array();	//見つかった経路
	this.routeCnt = 0;	//見つかった経路数

	for (var i=0; i<MAXFIND; i++) {
		if (allRoutes[i]!=undefined && allRoutes[i].length > 0) {
			this.foundRoutes.push(new FoundRoute(allRoutes[i], false));
			this.routeCnt++;
		}
		if (allRoutesInv[i]!=undefined && allRoutesInv[i].length > 0) {
			this.foundRoutes.push(new FoundRoute(allRoutesInv[i], true));
			this.routeCnt++;
		}
	}

	if (this.routeCnt) {
		/**検索されたデータを運賃順にソート**/
		for (var i=0; i<this.foundRoutes.length; i++) {
			sortData[i] = this.foundRoutes[i].fare.ICFare[0];
		}
		sortIdxBuf = margeSort(sortData);
		for (var i=0; i<sortIdxBuf.length; i++) {
			sortedDataBuf[i] = this.foundRoutes[sortIdxBuf[i]];
		}
		for (var i=0; i<sortedDataBuf.length; i++) {
			this.foundRoutes[i] = sortedDataBuf[i];
		}
		//最小運賃
		this.minFare = this.foundRoutes[0].fare.ICFare[0];

		/**検索されたデータを経路数順にソート**/
		for (var i=0; i<this.foundRoutes.length; i++) {
			sortData[i] = this.foundRoutes[i].route.length;
		}
		sortIdxBuf = margeSort(sortData);
		for (var i=0; i<sortIdxBuf.length; i++) {
			sortedDataBuf[i] = this.foundRoutes[sortIdxBuf[i]];
		}
		for (var i=0; i<sortedDataBuf.length; i++) {
			this.foundRoutes[i] = sortedDataBuf[i];
		}
		//最小経路数
		this.minLine = this.foundRoutes[0].route.length;

		/**検索されたデータを通算キロ程順にソート**/
		for (var i=0; i<this.foundRoutes.length; i++) {
			sortData[i] = this.foundRoutes[i].fare.killo[0];
		}
		sortIdxBuf = margeSort(sortData);
		for (var i=0; i<sortIdxBuf.length; i++) {
			sortedDataBuf[i] = this.foundRoutes[sortIdxBuf[i]];
		}
		for (var i=0; i<sortedDataBuf.length; i++) {
			this.foundRoutes[i] = sortedDataBuf[i];
		}
		//最小通算キロ
		this.minKilloSum = this.foundRoutes[0].fare.killo[0];

		//以上の過程でキロ程順にソートされる(キロ程、運賃、経路数の順に優先される)
	}
}
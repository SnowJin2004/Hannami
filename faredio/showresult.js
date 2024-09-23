/*************************

Faredio 2.0 Program "showresult.js"
Copyright(C) tamantrain
※このファイルは編集いただけます。
  本ファイルの更新を伴うバージョンアップにご注意ください。

*************************/

var D = window.document;
var imgStart = faredioDirG + "faredio-from.svg";
var imgEnd = faredioDirG + "faredio-to.svg";
var imgChange = faredioDirG + "faredio-transfer.svg";
var imgThru = faredioDirG + "faredio-thru.svg";

function doSomethingIfMatched(arr, j) {
    if (j > 0 && j < arr.length - 1) {
        // Extract the substrings up to the character "（"
        const str1 = arr[j - 1].split("（")[0];
        const str2 = arr[j + 1].split("（")[0];

        // Compare the substrings
        if (str1 === str2) {
            return true;
        } else {
			return false;
		}
    }
}

//発駅：着駅が同一のとき
if (levR == arvR) {
	D.writeln("<p>起点站与终点站不能是同一车站。<\/p>");
} else if (levR>=0 && arvR>=0) {
	var foundRouteSet = new RouteSet(levR, arvR, strLineR, golLineR);
	var paretoIdx = new Array();

	//検索結果タイトル
	D.write("<h3 class=\"faredioResHeader\">搜索结果：");
	D.write(stationList.staList[levR].name + " → " + stationList.staList[arvR].name + "<\/h3>");

	if (foundRouteSet.routeCnt<1)
		D.writeln("<p>未找到路径，请重新选择车站。<\/p>");
	else {
		D.writeln("<section class=\"flex\">")
		var visibleRouteCnt = 0;
		for (var i=0; i<foundRouteSet.routeCnt; i++) {
			
			//分岐点適切性の判定
			if (!foundRouteSet.foundRoutes[i].aprBranch) continue;
			
			//経路がパレート的に優位な解かどうかを判定(パレート解のみ表示する)
			var paretoRoute = true;
			for (var j=0; j<paretoIdx.length; j++) {
				if (foundRouteSet.foundRoutes[paretoIdx[j]].fare.ICFare[0] <= foundRouteSet.foundRoutes[i].fare.ICFare[0]
					&& foundRouteSet.foundRoutes[paretoIdx[j]].route.length <= foundRouteSet.foundRoutes[i].route.length
					&& foundRouteSet.foundRoutes[paretoIdx[j]].fare.killo[0] <= foundRouteSet.foundRoutes[i].fare.killo[0])
				{
					paretoRoute = false;
					break;
				}
			}
			if (paretoRoute) paretoIdx.push(i);
			else continue;
			
			//運賃が高い場合は距離が最小の経路のみ許可
			if (foundRouteSet.foundRoutes[i].fare.ICFare[0] > foundRouteSet.minFare)
				if (foundRouteSet.foundRoutes[i].fare.killo[0] > foundRouteSet.minKilloSum) continue;

			//経路表示
			var p = 1;

			D.writeln("<section class=\"faredioRt\"><section class=\"faredioRtHeader\"><tr>");
			D.writeln("<header>路径" + (++visibleRouteCnt) + "<\/header>");
			D.writeln("<div>");
			D.writeln("计价里程：" + foundRouteSet.foundRoutes[i].fare.killo[0] + "km<br>");
			D.writeln("生存模式：<strong>" + foundRouteSet.foundRoutes[i].fare.ICFare[0] + "元<\/strong>");
			D.writeln("；创造模式：<strong>" + foundRouteSet.foundRoutes[i].fare.TicketFare[0] + "元<\/strong>");
			D.writeln("<\/div><\/section>");

			D.writeln("<section class=\"faredioRtBody\">");
			for (var j=0; j<foundRouteSet.foundRoutes[i].lineAndSta.length; j++) {
				
				if (j%2) {
					//路線表示
					D.write("<div style=\"--line-colour:" + lines[foundRouteSet.foundRoutes[i].route[j]].color + "\">");
					D.write("<div class=\"faredioRtBodyLine\">");
					// if (lines[foundRouteSet.foundRoutes[i].route[j]].walk)
					// 	D.write("\"faredioRtLineWlk\"");
					// else {
					// 	D.write("\"faredioRtLineClr\" ");
					// 	D.write("style=\"--line-colour:" + lines[foundRouteSet.foundRoutes[i].route[j]].color + "\">");
					// }
					if (lines[foundRouteSet.foundRoutes[i].route[j]].icon != null) {
						D.write("<img class=\"faredioRtBodyLineIcon\" src=\"" + lines[foundRouteSet.foundRoutes[i].route[j]].icon + "\">");
					}
					D.write("<\/div>");
					// D.write("<\/div>");
					D.write("<div class=\"faredioRtBodyLineTxt\">");
					D.write(foundRouteSet.foundRoutes[i].lineAndSta[j]);
					D.write("<\/div><div class=\"faredioRtBodyLineFC\">");
					if (j<foundRouteSet.foundRoutes[i].lineAndSta.length-2 &&
						lines[foundRouteSet.foundRoutes[i].route[j+2]].walk) {
						D.write("↓");
					} else if (j<foundRouteSet.foundRoutes[i].lineAndSta.length-2 &&
						lines[foundRouteSet.foundRoutes[i].route[j+2]].fareRule==foundRouteSet.foundRoutes[i].fare.killo[p]) {
						D.write("↓");
					} else {
						D.write(foundRouteSet.foundRoutes[i].fare.killo[p+1] + "km | ");
						D.write(foundRouteSet.foundRoutes[i].fare.ICFare[p+1] + "元");
						p+=2;
					}
					D.write("<\/div>");
				} else {
					//駅表示
					var imgURI = ""; var altText = "";
					if (j==0) { imgURI = imgStart; altText="上车站"; }
					else if (j==foundRouteSet.foundRoutes[i].lineAndSta.length-1) { imgURI = imgEnd; altText="下车站"; }
					// else { imgURI = imgChange; altText="换乘站"; }
					else if (doSomethingIfMatched(foundRouteSet.foundRoutes[i].lineAndSta, j)) {
						imgURI = imgThru; altText="换乘站";
					} else {
						imgURI = imgChange; altText="换乘站";
					}
					D.write("<div>");
					D.write("<div class=\"faredioRtBodyImg ")
					if (j==0) {
						D.write("from")
					} else if (j==foundRouteSet.foundRoutes[i].lineAndSta.length-1) {
						D.write("to")
					}
					D.write("\">")
					D.write("<img src=\"" + imgURI + "\" width=\"18px\" height=\"18px\" alt=\"" + altText + "\">");
					D.write("<\/div>");
					D.write("<div class=\"faredioRtBodySta\">" + foundRouteSet.foundRoutes[i].lineAndSta[j])
					D.write("<\/div>");
				}
				D.write("<\/div>");
			}
			D.writeln("<\/section><\/section>");
		}
		D.writeln("<\/section>");
	}
} else {
	D.writeln("<p>请选择上车站与下车站。<\/p>");
}

//以下の記述は消さないで下さい。
D.writeln("<div class=\"faredioSign\">Powered by <a href=\"http://akukuanother.akazunoma.com/\">Faredio " + version + "<\/a><\/div>");
dataName = "半浪";
dataFileName = "hannami.js";
//userCalc = "keikyu_kasan.js";	//ユーザー指定の計算スクリプトがある場合は指定

//***駅の設定***
//半浪エクスプレス
stationList.addToStaList(new Station("半浪东村", "Hannami East Vill.", "HX01"));
stationList.addToStaList(new Station("谢那村", "Xiena Vill.", "HX02"));
stationList.addToStaList(new Station("半浪西村", "Hannami West Vill.", "HX03"));
stationList.addToStaList(new Station("心岛·神岛", "Xindao Is. & Shendao Is.", "HX04"));
stationList.addToStaList(new Station("新宝岛", "Shin-Takarajima Is.", "HX05"));

//***路線の設定***
//半浪エクスプレス
var HX1 = new Line("半浪特快", 0, false, "#993333", "..\/HX-icon.svg");
var HX1StaList = new Array();
var HX1BS = new Array();

HX1StaList.push(stationList.searchFromNumberling("HX01"));
HX1BS.push(0.805);
HX1StaList.push(stationList.searchFromNumberling("HX02"));
HX1BS.push(1.247);
HX1StaList.push(stationList.searchFromNumberling("HX03"));
HX1BS.push(1.177);
HX1StaList.push(stationList.searchFromNumberling("HX04"));
//データベースに追加
HX1.setSta(HX1StaList, HX1BS);
lines.push(HX1);

// //半浪エクスプレス（二期）
// var HX2 = new Line("半浪特快（二期）", 0, false, "#993333", "..\/HX-icon.svg");
// var HX2StaList = new Array();
// var HX2BS = new Array();

// HX2StaList.push(stationList.searchFromNumberling("HX04"));
// HX2BS.push(0);
// HX2StaList.push(stationList.searchFromNumberling("HX05"));
// HX2BS.push(0);
// HX2StaList.push(stationList.searchFromNumberling("HX01"));
// //データベースに追加
// HX2.setSta(HX2StaList, HX2BS);
// lines.push(HX2);

//***運賃規定***

//通常の運賃規定
var normRule = new FareTable(1);
normRule.fareRows[0] = new FareRow(0, 5, 2);
fareRule[0] = normRule;
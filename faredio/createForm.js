/*************************

Faredio 2.0 Program "createForm.js"
このファイルは、Faredio 2.0のシステムを構成する重要なファイルです。
編集しないでください。
Copyright(C) tamantrain

*************************/

var staLinks1 = new Array(lines.length);
var staLinks2 = new Array(lines.length);

document.writeln("<form id=\"faredioForm\" action=\"" + resultScr + "\" method=\"get\">");

document.writeln("<ul class=\"Search-Station-List\">");

// 上车站 section
document.writeln("<li class=\"Search-Station-Item\">");
document.writeln("<dl>");
document.writeln("<dt>上车站<\/dt>");
document.writeln("<dd>");
document.writeln("<input name=\"staName1\" id=\"staName1\" type=\"text\" placeholder=\"请选择车站\" readonly=\"readonly\" \/>");
document.writeln("<input name=\"lev\" id=\"lev\" type=\"hidden\" value=\"\" \/>");
document.writeln("<input name=\"vl\" id=\"vl\" type=\"hidden\" value=\"\" \/>");
document.writeln("<input name=\"dir\" type=\"hidden\" value=\"" + faredioDir + "\" \/>");
document.writeln("<input name=\"fn\" type=\"hidden\" value=\"" + dataFileName + "\" \/>");
document.writeln("<div class=\"faredioFormPulldown\" id=\"staName1Box\" style=\"display: none;\">");

// 駅名一覧1の作成
for (var i = 0; i < lines.length; i++) {
    if (!lines[i].walk) {
        document.write("<div class=\"faredioFormLine\" style=\"--line-colour:" + lines[i].color + "\">");
        document.write("<h4>" + lines[i].name + "<\/h4>");
        document.write("<ul>");
        for (var j = 0; j < lines[i].staNum.length; j++) {
            if (!(lines[i].banUseSta(lines[i].staNum[j]) || stationList.staList[lines[i].staNum[j]].name.indexOf("BRH_") == 0)) {
                document.write("<li><a href=\"#faredioFTop\" class=\"faredioFormListItem\" onClick=\"javascript:setSta(" + lines[i].staNum[j] + "," + i + ",true);\">");
                document.write(stationList.staList[lines[i].staNum[j]].name);
                document.writeln("<\/a><\/li>");
            }
        }
        document.writeln("<\/ul><\/div>");
    }
}
document.writeln("<\/div>"); // Close faredioFormPulldown
document.writeln("<\/dd>");
document.writeln("<\/dl>");
document.writeln("<\/li>");

// 下车站 section
document.writeln("<li class=\"Search-Station-Item\">");
document.writeln("<dl>");
document.writeln("<dt>下车站<\/dt>");
document.writeln("<dd>");
document.writeln("<input name=\"staName2\" id=\"staName2\" type=\"text\" placeholder=\"请选择车站\" readonly=\"readonly\" \/>");
document.writeln("<input name=\"arv\" id=\"arv\" type=\"hidden\" value=\"\" \/>");
document.writeln("<input name=\"gl\" id=\"gl\" type=\"hidden\" value=\"\" \/>");
document.writeln("<div class=\"faredioFormPulldown\" id=\"staName2Box\" style=\"display: none;\">");

// 駅名一覧2の作成
for (var i = 0; i < lines.length; i++) {
    if (!lines[i].walk) {
        document.write("<div class=\"faredioFormLine\" style=\"--line-colour:" + lines[i].color + "\">");
        document.write("<h4>" + lines[i].name + "<\/h4>");
        document.write("<ul>");
        for (var j = 0; j < lines[i].staNum.length; j++) {
            if (!(lines[i].banUseSta(lines[i].staNum[j]) || stationList.staList[lines[i].staNum[j]].name.indexOf("BRH_") == 0)) {
                document.write("<li><a href=\"#faredioFTop\" class=\"faredioFormListItem\" onClick=\"javascript:setSta(" + lines[i].staNum[j] + "," + i + ",false);\">");
                document.write(stationList.staList[lines[i].staNum[j]].name);
                document.writeln("<\/a><\/li>");
            }
        }
        document.writeln("<\/ul><\/div>");
    }
}
document.writeln("<\/div>"); // Close faredioFormPulldown
document.writeln("<\/dd>");
document.writeln("<\/dl>");
document.writeln("<\/li>");

document.writeln("<\/ul>"); // Close Search-Station-List

// Submit button
document.writeln("<div class=\"button-div\">");
document.writeln("<a href=\"#\" onClick=\"submitForm(event);\"><span>搜索<\/span><\/a>");
document.writeln("<\/div>");

document.writeln("<\/form>");


// Event handler setup and function definitions

var staName1 = document.getElementById("staName1");
var lev = document.getElementById("lev");
var staName2 = document.getElementById("staName2");
var arv = document.getElementById("arv");
var staName1Box = document.getElementById("staName1Box");
var staName2Box = document.getElementById("staName2Box");
var vl = document.getElementById("vl");
var gl = document.getElementById("gl");

function setSta(staIdx, lineIdx, setLev) {
    if (setLev) {
        staName1.value = stationList.staList[staIdx].name;
        lev.value = staIdx;
        vl.value = lineIdx;
        staName1Box.style.display = "none";
    } else {
        staName2.value = stationList.staList[staIdx].name;
        arv.value = staIdx;
        gl.value = lineIdx;
        staName2Box.style.display = "none";
    }
}

staName1.addEventListener("focus", function(){ 
    staName1Box.style.display = "block"; 
    staName2Box.style.display = "none"; 
}, false);

staName2.addEventListener("focus", function(){ 
    staName2Box.style.display = "block"; 
    staName1Box.style.display = "none"; 
}, false);

// Close the pop-up if clicked outside
document.addEventListener("click", function(event) {
    if (!staName1Box.contains(event.target) && event.target !== staName1) {
        staName1Box.style.display = "none";
    }
    if (!staName2Box.contains(event.target) && event.target !== staName2) {
        staName2Box.style.display = "none";
    }
});

function submitForm(event) {
    event.preventDefault(); // Prevent default link behavior
    document.getElementById("faredioForm").submit(); // Submit the form
}

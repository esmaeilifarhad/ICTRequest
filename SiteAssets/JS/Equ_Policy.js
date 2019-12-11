var _CurrentIdDetail = 0
var CurrentCID = 0;
var CurrentPID = 0;
var CurrentName = ""
var CurrentDep = ""
var CurrentPLoginName = ""
var today = "";
var _exchangeRate = 0

var Kala = []
var _checkedItem = []
var _usersInConfirm = []
/*
List Name :

GIG_equ_Details
GIG_equ_Request 
GIG_Equ_Confirm 
GIG_Equ_Log
GIG_equ_Policy
Equ_GenLookUp 
*/
$(document).ready(function () {
    //-----npm initial header Request
    $pnp.setup({
        headers: {
            "Accept": "application/json; odata=verbose"
        }
    });
    //-------------
    CurrentCID = sessionStorage.getItem("CID");
    CurrentPID = sessionStorage.getItem("PID");
    CurrentName = sessionStorage.getItem("PFName");
    CurrentDep = sessionStorage.getItem("DName");
    CurrentPLoginName = sessionStorage.getItem("CurrentPLoginName");


    const m = moment();
    today = moment().format('jYYYY/jM/jD');//Today

    var todayarray = today.split("/")
    mounth = (parseInt(todayarray[1]) <= 9) ? "0" + parseInt(todayarray[1]) : parseInt(todayarray[1])
    rooz = (parseInt(todayarray[2]) <= 9) ? "0" + parseInt(todayarray[2]) : parseInt(todayarray[2])
    year = todayarray[0].substring(2, 4)
    today = year + "" + mounth + "" + rooz


    showKalaPolicy();

});

//-------------------------------------------------------

function showMessage(message) {
    $("#message p").remove()
    // setTimeout(function () { $("#message p").remove() }, 5000);
    $("#message").append("<p class='message'>" + message + "</p>");
}
async function showKalaPolicy() {
    $("#tablePolicy table  .rowData").remove()
    //---------------------
    var KalaFilter = await serviceIctKalaFilter();
    var Policy = await Get_Policy(5, 50);
    debugger
    var GenLookUp = await Get_GenLookUpById(1)
    for (let index = 0; index < KalaFilter.length; index++) {
        var res = Policy.find(x => x.KalaValue == KalaFilter[index].KalaValue);
        if (res == undefined) {
            Kala.push({ type: "create",KalaValue: KalaFilter[index].KalaValue, KalaName: KalaFilter[index].KalaName, CID: 50 })
        }
        else {
            Kala.push({ type: "update", Id: res.Id, KalaValue: KalaFilter[index].KalaValue, KalaName: KalaFilter[index].KalaName, IsBelong: res.IsBelong, Price: res.Price, CID: 50 })
        }
    }
    var table = ""
    $.LoadingOverlay("show");
    for (let index = 0; index < Kala.length; index++) {
        table += "<tr  class='rowData' Title="+Kala[index].Title+" KalaValue="+Kala[index].KalaValue+" type=" + Kala[index].type + " Data_Id=" + Kala[index].Id + ">"
        table += "<td col='pdpDark'>"
        table += (index + 1)
        table += "</td>"
        table += "<td >"
        table += Kala[index].KalaName
        table += "</td>"
        table += "<td>"
        if (Kala[index].IsBelong == true) {
            table += "<input  class='KalaValue' type=checkbox Data_Id=" + Kala[index].KalaValue + " checked/>"
        }
        else {
            table += "<input  class='KalaValue' type=checkbox Data_Id=" + Kala[index].KalaValue + " />"
        }
        table += "</td>"
        table += "<td>"
        table += "<input class='Price'  type=number value='" + Kala[index].Price + "' />"
        table += "</td>"
        table += "<td>"
        table += "<span>" + SeparateThreeDigits(Kala[index].Price * GenLookUp.value) + "</span>"
        table += "</td>"
        table += "</tr>"
    }
    $.LoadingOverlay("hide");
    $("#tablePolicy table").append(table);

    // _spPageContextInfo.userId
}
//-------------------------------------------------------CRUD
//Update
function updatePolicy(Id, Price, IsBelong) {
    return new Promise(resolve => {
        var list = $pnp.sp.web.lists.getByTitle("GIG_equ_Policy");
        list.items.getById(Id).update({
            Price: parseInt(Price),
            IsBelong: IsBelong
        }).then(function (item) {
            resolve(item);
        });
    });

}
//Create 
function createPolicy(Price, IsBelong,KalaValue) {
    debugger

    return new Promise(resolve => {
        $pnp.sp.web.lists.getByTitle("GIG_equ_Policy").items.add({
            Price: parseInt(Price),
            IsBelong: IsBelong,
            KalaValue:KalaValue,
            SemathaValue:"5",
            GenId:2,
            Title:"feru"
        }).then(function (item) {
debugger
        });
    });
    
}
//Get 
function Get_Policy(SemathaValue, CID) {
    return new Promise(resolve => {
        $pnp.sp.web.lists.getByTitle("GIG_equ_Policy").
            items.
            select("Gen/CID,KalaValue,SemathaValue,Price,IsBelong,Id,Title").
            filter("(SemathaValue eq " + SemathaValue + ") and (Gen/CID eq " + CID + ")").
            expand("Gen").
            orderBy("Id", false).
            get().
            then(function (item) {
                resolve(item)
            });
    })
}
function Get_GenLookUpById(id) {
    return new Promise(resolve => {
        $pnp.sp.web.lists.getByTitle("Equ_GenLookUp").
            items.
            getById(id).get().then(function (item) {
                resolve(item)
            });
    })
}
//-----------------------------
 function Save() {
    $.LoadingOverlay("show");
    $("#tablePolicy table tr").each(async function () {
        
        var IsBelong = false
        var Id = $(this).attr("data_id")
        var KalaValue = $(this).attr("KalaValue")
        var type = $(this).attr("type")
        var Price = $(this).find(".Price").val()
        if ($(this).find('.KalaValue').is(":checked")) {
            IsBelong = true;
        }
        else {
            IsBelong = false;
        }

        if (type != undefined) {
            if (type == "update") {
                var resPolicy = await updatePolicy(Id,Price,IsBelong)
            }
            if (type == "create") {
                var resPolicy2 = await createPolicy(Price, IsBelong,KalaValue)
            }
        }
        else {

        }
    })

    $.LoadingOverlay("hide");
}

//-------------------------------------------web services
//create record header master in Tadarokat
function serviceICTRequestTadarokat(myDate, PortalReqHeaderID, Kalasn, BuyStock) {
    return new Promise(resolve => {
        var serviceURL = "https://portal.golrang.com/_vti_bin/SPService.svc/ICTRequestTadarokat"
        var request = { CID: CurrentCID, Date: myDate, PortalReqHeaderID: PortalReqHeaderID, Kalasn: Kalasn, BuyStock: BuyStock }
        // {"CID":"50","Date":"980917","PortalReqHeaderID":"68","Kalasn":"7.1","BuyStock":2}
        $.ajax({
            type: "POST",
            url: serviceURL,
            contentType: "application/json; charset=utf-8",
            xhrFields: {
                'withCredentials': true
            },
            dataType: "json",
            data: JSON.stringify(request),
            //processData: false,
            success: function (data) {

                if ($.isNumeric(data.DarkhastSN)) {
                    resolve(data);
                }
                else {
                    alert(data.DarkhastSN)
                    alert("لطفا با واحد پرتال تماس بگیرید" + "\n" + "کد مقابل را جهت پیگیری ارائه دهید" + _CurrentIdDetail)
                    $.LoadingOverlay("hide");
                }
            },
            error: function (a) {
                console.log(a);
            }
        });
    })
}
//show amval personel
function serviceShowAmvalPersonel(CID, PID) {
    return new Promise(resolve => {
        var serviceURL = "https://portal.golrang.com/_vti_bin/SPService.svc/ShowAmvalPersonel"
        var request = { CID: CID, PID: PID }
        // {"CID":"50","Date":"980919","PortalReqHeaderID":"984"}
        $.ajax({
            type: "POST",
            url: serviceURL,
            contentType: "application/json; charset=utf-8",
            xhrFields: {
                'withCredentials': true
            },
            dataType: "json",
            data: JSON.stringify(request),
            //processData: false,
            success: function (data) {
                resolve(data);

            },
            error: function (a) {
                console.log(a);
            }
        });
    })
}
function serviceIctKalaFilter() {
    return new Promise(resolve => {
        var serviceURL = "https://portal.golrang.com/_vti_bin/SPService.svc/ictkalafilter";
        var request = { CID: CurrentCID }
        $.ajax({
            type: "POST",
            url: serviceURL,
            contentType: "application/json; charset=utf-8",
            xhrFields: {
                'withCredentials': true
            },
            dataType: "json",
            data: JSON.stringify(request),
            //processData: false,
            success: function (data) {
                resolve(data);
                // console.log(data);

            },
            error: function (a) {
                console.log(a);
            }
        });
    })
}
//-----------------------------Utility
function calDayOfWeek(date) {
    var mounth = ""
    var rooz = ""
    var arrayDate = date.split("/")
    mounth = (parseInt(arrayDate[1]) <= 9) ? "0" + parseInt(arrayDate[1]) : parseInt(arrayDate[1])
    rooz = (parseInt(arrayDate[2]) <= 9) ? "0" + parseInt(arrayDate[2]) : parseInt(arrayDate[2])

    date = arrayDate[0] + mounth + rooz;

    //date = date.replace(/\//g, '');
    date = date.substr(date.length - 6); // 13980203=> 980203

    const m = moment();
    const numberWeek = moment(date, 'jYYjMMjDD').weekday();
    let day;
    switch (numberWeek) {
        case 0:
            day = "یکشنبه";
            break;
        case 1:
            day = "دوشنبه";
            break;
        case 2:
            day = "سه شنبه";
            break;
        case 3:
            day = "چهارشنبه";
            break;
        case 4:
            day = "پنج شنبه";
            break;
        case 5:
            day = "جمعه";
            break;
        case 6:
            day = "شنبه";
    }
    return day;
}
//980809  input parameter
function foramtDate(str) {
    if (str.length == 6) {
        return "13" + str.slice(0, 2) + "/" + str.slice(2, 4) + "/" + str.slice(4, 6)
    }

}
function splitString(str) {
    if (str == null) return ""
    return str.split(";#")
}
//سه رقم سه رقم جدا کنه برای پول   SeparateThreeDigits
function SeparateThreeDigits(str) {
    var x = parseInt(str);
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // return parseInt(str);

}

//-----------------------
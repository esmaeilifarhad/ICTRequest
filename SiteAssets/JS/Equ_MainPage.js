var _CurrentIdDetail = 0
var CurrentCID = 0;
var CurrentPID = 0;
var CurrentName = ""
var CurrentDep = ""
var CurrentPLoginName = ""
var today = "";
var _exchangeRate = 0
var _Mojoodi_AnbarICT = 0;

var _UserInGroupos = []
var _checkedItem = []
var _usersInConfirm = []
var _MojoodiAnbarICT = []
var _MojoodyAnbarInPap = 0;
var _MojoodyAnbarInPortal = 0;
/*
List Name :

GIG_equ_Details
GIG_equ_Request 
GIG_Equ_Confirm 
GIG_Equ_Log
GIG_equ_Policy
Equ_GenLookUp 
GIG_equ_Links
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
    var _usersInConfirm = []


    const m = moment();
    today = moment().format('jYYYY/jM/jD');//Today
    $(".today").append("<span>تاریخ امروز : </span><span>   "+today+"</span>")

    var todayarray = today.split("/")
    mounth = (parseInt(todayarray[1]) <= 9) ? "0" + parseInt(todayarray[1]) : parseInt(todayarray[1])
    rooz = (parseInt(todayarray[2]) <= 9) ? "0" + parseInt(todayarray[2]) : parseInt(todayarray[2])
    year = todayarray[0].substring(2, 4)
    today = year + "" + mounth + "" + rooz



    showCartabl();

});
//-------------------------------------------------------

async function showCartabl() {
    $("#tableres2 table  .rowData").remove()
    //---------------------
    var Links = await Get_Links();
    var myRequest = await Get_Details()
    //-------------------------

    var Confirm = await Get_Confirm();
    _spPageContextInfo.userId

    for (let index = 0; index < Confirm.length; index++) {
        if (_spPageContextInfo.userId == Confirm[index].ConfirmationId) {
            _usersInConfirm.push({ CompanyId: Confirm[index].CompanyId, Step: Confirm[index].Step, DepId: Confirm[index].DepId, ConfirmationId: Confirm[index].ConfirmationId })
        }
    }

    var DetailsTask = await Get_DetailsTask(_usersInConfirm);

    //----------------------------------------------


    var MyLinks = ""

    MyLinks += "<div class='animated swing infinite' style='height: 50px;  animation-duration: 2.5s; text-decoration: none;'>"
    for (let index = 0; index < Links.length; index++) {

        if (Links[index].BackgroundImageLocation == null || Links[index].LinkLocation == null) continue

        MyLinks += "<a target='_blank' class='navbar-brand' href='" + Links[index].LinkLocation.Url + "'>"
        MyLinks += "<img style='margin: 0 auto;max-width: 90px;' class='img-circle' src='" + Links[index].BackgroundImageLocation.Url + "' height='65' alt='mdb logo'>"

        MyLinks += "<p   style='background-color: white;padding: 5px;border-radius: 5px;'>"
        MyLinks += "<span >" + Links[index].Title + "</span>"
        if (Links[index].LinkLocation.Description == "Equ_MyRequest") {
            MyLinks += "<span  style='color: red'> (" + myRequest.toString() + ") </span>"
        }
        if (Links[index].LinkLocation.Description == "Equ_Task") {
            MyLinks += "<span style='color: red'> (" + DetailsTask.toString() + ") </span>"
        }
        MyLinks += "</p>"
        MyLinks += "</a>"

    }
    MyLinks += "</div>"

    $("#showLinks .navbar").append(MyLinks);
    //console.log(MyLinks)





}
//-------------------------------------------------------CRUD

function Get_Links() {
    return new Promise(resolve => {
        $pnp.sp.web.lists.
            getByTitle("GIG_equ_Links").
            items.select().
            // expand("MasterId").
            //filter("(StatusWF eq 'درگردش')").
            orderBy("TileOrder", true).
            get().
            then(function (items) {
                resolve(items);
            });
    });
}
function Get_Details() {

    return new Promise(resolve => {
        $pnp.sp.web.lists.
            getByTitle("GIG_equ_Details").
            items.select("ConfirmId/Title,MasterId/Id,MasterId/Semat,MasterId/PersonelId,DarkhastSN,MasterId/Title,MasterId/CID,MasterId/PersonelId,MasterId/DepName,MasterId/RequestDate,Id,BuyStock,Title,PlackNo,step,NameKalaValue,Tozihat,StatusWF,NameKala,MasterId/RR_ID").
            expand("MasterId,ConfirmId").
            // filter("(StatusWF eq 'درگردش') and (((MasterId/DepId eq 289) and (step eq 1)) or ((MasterId/DepId eq null) and (step eq 2)) or ((MasterId/DepId eq null) and (step eq 3)) or ((MasterId/DepId eq null) and (step eq 4)) or ((MasterId/DepId eq null) and (step eq 5)) or ((MasterId/DepId eq null) and (step eq 6)))")
            filter("MasterId/PersonelId eq " + CurrentPID + "").
            get().
            then(function (items) {

                if (items.length == 0) {
                    resolve(0)
                }
                else {
                    resolve(items.length);
                }
            });


    });
}
function Get_Confirm() {
    return new Promise(resolve => {
        $pnp.sp.web.lists.
            getByTitle("GIG_Equ_Confirm").
            items.select().
            // expand("MasterId").
            //filter("(StatusWF eq 'درگردش')").
            // orderBy("Modified", true).
            get().
            then(function (items) {
                resolve(items);
            });
    });
}
function Get_DetailsTask(usersInConfirm) {
    return new Promise(resolve => {
        var filter = ""
        var filterStatusWF = ""
        var filterMyRequester = ""

        for (let index = 0; index < usersInConfirm.length; index++) {
            if (usersInConfirm[index].Step == 1) {
                filter += "((MasterId/DepId eq " + usersInConfirm[index].DepId + ") and (step eq " + usersInConfirm[index].Step + ")) or ";
            }
            else {
                filter += "((step eq " + usersInConfirm[index].Step + ")) or ";
            }
        }

        if (filter.length != 0) {
            filter = "(" + filter.substring(0, filter.length - 4) + ")";
        }
        filterMyRequester = "((AuthorId eq " + _spPageContextInfo.userId + ") and (Role eq 'REQ'))"
        if (filter.length != 0) {
            filterStatusWF = "(StatusWF eq 'درگردش')" + " and " + filter + " or " + filterMyRequester
        }
        else {
            filterStatusWF = "(StatusWF eq 'درگردش')" + " and " + filterMyRequester
        }

        // }

        // console.log(filterStatusWF);
        $pnp.sp.web.lists.
            getByTitle("GIG_equ_Details").
            items.select("IsAmvaly,exchangeRate,MasterId/Id,MasterId/Semat,DarkhastSN,MasterId/Title,MasterId/CID,MasterId/PersonelId,MasterId/DepName,MasterId/RequestDate,Id,BuyStock,Title,PlackNo,step,NameKalaValue,Tozihat,StatusWF,NameKala,MasterId/RR_ID,MasterId/Semat,MasterId/UserId").
            expand("MasterId").
            // filter("(StatusWF eq 'درگردش') and (((MasterId/DepId eq 289) and (step eq 1)) or ((MasterId/DepId eq null) and (step eq 2)) or ((MasterId/DepId eq null) and (step eq 3)) or ((MasterId/DepId eq null) and (step eq 4)) or ((MasterId/DepId eq null) and (step eq 5)) or ((MasterId/DepId eq null) and (step eq 6)))")
            filter(filterStatusWF).
            get().
            then(function (items) {
                if (items.length == 0) {
                    resolve(0)
                }
                else {
                    resolve(items.length);
                }
            });
    });
}

//-----------------------------

//----------------------------



//------------------------Modal Dialog Form

//----------------------------------------------------web services

//---------------------------------------------------------Utility
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
function removeComma(str) {
    var noCommas = str.replace(/,/g, ''),
        asANumber = +noCommas;
    return asANumber
}
function removeLastChar(str) {
    return str.slice(0, -1)
}
//-----------------------

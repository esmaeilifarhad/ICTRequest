var _CurrentIdDetail = 0
var CurrentCID = 0;
var CurrentPID = 0;
var CurrentName = ""
var CurrentDep = ""
var CurrentPLoginName = ""

var _UserInGroupos = []
var _checkedItem = []
var _usersInConfirm = []
/*
List Name :

GIG_equ_Details
GIG_equ_Request 
GIG_Equ_Confirm 
GIG_Equ_Log
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

    /*
    for (let index = 1300; index < 1370; index++) {
        deleteRecord(index);
       
    }
    */

    showCartabl();

});

//-------------------------------------------------------

function showMessage(message) {
    $("#message p").remove()
    // setTimeout(function () { $("#message p").remove() }, 5000);
    $("#message").append("<p class='message'>" + message + "</p>");
}
async function showCartabl() {

    $("#tableres2 table  .rowData").remove()
    //---------------------
    var Confirm = await Get_Confirm();
    _spPageContextInfo.userId

    for (let index = 0; index < Confirm.length; index++) {
        if (_spPageContextInfo.userId == Confirm[index].ConfirmationId) {
            _usersInConfirm.push({ CompanyId: Confirm[index].CompanyId, Step: Confirm[index].Step, DepId: Confirm[index].DepId, ConfirmationId: Confirm[index].ConfirmationId })
        }
    }

    var Details = await Get_Details(_usersInConfirm);

    //---------------------

    if (Details == "null") {
        $("#tableres2 table").append("<tr class='rowData'><td colspan=9>موردی برای مشاهده وجود ندارد</td></tr>");
    }
    else {
        var table = ""
        for (let index = 0; index < Details.length; index++) {
            table += "<tr class='rowData' Data_Id=" + Details[index].ID + ">"

            table += "<td col='pdpDark'>"
            table += (index + 1)
            table += "</td>"
            table += "<td >"
            table += Details[index].step
            table += "</td>"
            table += "<td col='pdpDark'>"
            table += Details[index].MasterId.Title
            table += "</td>"
            table += "<td col='pdpDark'>"
            table += Details[index].MasterId.DepName
            table += "</td>"
            table += "<td col='pdpDark'>"
            table += splitString(Details[index].NameKala)[1]
            table += "</td>"
            table += "<td col='DayOfWeek'>"
            table += foramtDate(Details[index].MasterId.RequestDate)
            table += "</td>"
            table += "<td col='DayOfWeek'>"
            table += calDayOfWeek(foramtDate(Details[index].MasterId.RequestDate))
            table += "</td>"
            table += "<td col='description'>"
            table += Details[index].Tozihat
            table += "</td>"
            table += "<td >"
            table += "<input value='نمایش' type=button style='background-color: #97161b!important;' onclick='Show(" + Details[index].ID + ")'></input>"
            table += "</td>"
            table += "<td>"
            table += "<input type=checkbox Data_Id=" + Details[index].ID + " />"
            table += "</td>"
            // table += "<td col='remove'><span style='color:mediumvioletred' class='fa fa-remove RemoveWord pointer' onclick='removeRow(this," + _Id + ")'></span></td>"
            table += "</tr>"
        }
        $("#tableres2 table").append(table);
    }

}
//-------------------------------------------------------

function Get_Details(usersInConfirm) {
    // debugger
    return new Promise(resolve => {
        var filter = ""
        var filterStatusWF = ""
        if (usersInConfirm.length == 0) {
            resolve("null");
            return
        }
        // else if (filterGIG_MTH_Details == "admin") {
        //     filterStatusWF = "(StatusWF eq 'درگردش')";
        // }

        else {
            for (let index = 0; index < usersInConfirm.length; index++) {
                if (usersInConfirm[index].Step == 1) {
                    filter += "((MasterId/DepId eq " + usersInConfirm[index].DepId + ") and (step eq " + usersInConfirm[index].Step + ")) or ";
                }
                else {
                    filter += "((step eq " + usersInConfirm[index].Step + ")) or ";
                }
            }

            filter = "(" + filter.substring(0, filter.length - 4) + ")";
            filterStatusWF = "(StatusWF eq 'درگردش')" + " and " + filter
        }
        //console.log(filterStatusWF);
        $pnp.sp.web.lists.
            getByTitle("GIG_equ_Details").
            items.select("MasterId/Id,MasterId/Title,MasterId/CID,MasterId/PersonelId,MasterId/DepName,MasterId/RequestDate,Id,Title,step,NameKalaValue,Tozihat,StatusWF,NameKala").
            expand("MasterId").
            // filter("(StatusWF eq 'درگردش') and (((MasterId/DepId eq 289) and (step eq 1)) or ((MasterId/DepId eq null) and (step eq 2)) or ((MasterId/DepId eq null) and (step eq 3)) or ((MasterId/DepId eq null) and (step eq 4)) or ((MasterId/DepId eq null) and (step eq 5)) or ((MasterId/DepId eq null) and (step eq 6)))")
            filter(filterStatusWF).
            get().
            then(function (items) {
                if (items.length == 0) {
                    resolve("null")
                }
                else {
                    resolve(items);
                }
            });
    });
}
function Create_Log(Detail,confirm) {
    
    debugger
    /*
    return new Promise(resolve => {
        $pnp.sp.web.lists.getByTitle("GIG_Equ_Log").items.add({
            Result:CurrentSematId,
            Title: CurrentName,
            Dsc: CurrentPID,
            DateConfirm:today,
            DetailIdId: sessionStorage.getItem("UID")

            
        }).then(function (item) {
            resolve(item);
        });
        
    });
    */
}
function Get_DetailsById(id) {
    return new Promise(resolve => {
        $pnp.sp.web.lists.getByTitle("GIG_equ_Details").
            items.
            getById(id).
            select("MasterId/Id,MasterId/Title,MasterId/PersonelId,MasterId/CID,MasterId/DepName,MasterId/RequestDate,Id,Title,step,NameKalaValue,Tozihat,StatusWF,NameKala").
            expand("MasterId").
            get().
            then(function (item) {
                resolve(item)
            });
    })
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
function Get_ConfirmByStep(step, CID) {
    return new Promise(resolve => {
        $pnp.sp.web.lists.
            getByTitle("GIG_Equ_Confirm").
            items.select().
            // expand("MasterId").
            filter("(Step eq " + step + ") and (CompanyId eq " + CID + ")").
            // orderBy("Modified", true).
            get().
            then(function (items) {
                resolve(items);
            });
    });
}
function getCurrentUserinGroups() {
    return new Promise(resolve => {
        var endpointUrl = _spPageContextInfo.webServerRelativeUrl + '/_api/web/currentuser/?$expand=groups';
        return $.ajax({
            url: endpointUrl,
            method: "GET",
            contentType: "application/json;odata=verbose",
            headers: { "Accept": "application/json;odata=verbose" },
            success: function (data) {

                for (let index = 0; index < data.d.Groups.results.length; index++) {
                    _UserInGroupos.push({ ID: data.d.Groups.results[index].Id, Title: data.d.Groups.results[index].Title })
                    // resolve(userGroups)
                    // console.log(userGroups[index].Title+" - "+userGroups[index].Id);
                    //  console.log("***********************");
                }
                resolve(_UserInGroupos)
            },
            error: function (data) {
                console.log(JSON.stringify(data));
            }

        });
    })
}
async function update_Details(_CurrentIdDetail, result, description, actionUser, Detail) {
    var StatusWF = Detail.StatusWF
    var varStep = Detail.step
    var DarkhastSN = Detail.DarkhastSN

    var confirm = await Get_ConfirmByStep(Detail.step, Detail.MasterId.CID)

    var Detail = await Create_Log(Detail,confirm)

    if (result == "تایید") {
        if (confirm[0].IsFinish == true) {
            StatusWF = "خاتمه یافته"
            varStep = Detail.step + 1
            var DarkhastSN = await serviceICTRequestTadarokat(Detail.MasterId.RequestDate, _CurrentIdDetail);
        }
        else {
            varStep = Detail.step + 1
        }
    }
    else if (result == "عدم تایید") {
        // StatusWF = "تایید نشده"
        varStep = Detail.step - 1
    }
    else {
        alert("call to IT")
    }


    if (varStep == 0) {
        StatusWF = "تایید نشده";
    }
    else {
        //  StatusWF = "درگردش";
    }

    return new Promise(resolve => {
        var list = $pnp.sp.web.lists.getByTitle("GIG_equ_Details");
        list.items.getById(_CurrentIdDetail).update({
            step: varStep,
            StatusWF: StatusWF,
            DarkhastSN: DarkhastSN
        }).then(function (item) {
            resolve(item)

        });

    })

}
function getGIG_MTH_DetailsById(id) {
    return new Promise(resolve => {
        $pnp.sp.web.lists.getByTitle("GIG_MTH_Details").items.getById(id).get().then(function (item) {
            resolve(item);
        });
    });
}
//Delete
function deleteRecord(id) {
    return new Promise(resolve => {
        var list = $pnp.sp.web.lists.getByTitle("GIG_MTH_Request");

        list.items.
            // top(20).
            getById(id).
            delete().
            then(function (item) {
                // Console.log("item has been deleted");
            }, function (data) {
                //Console.log("error: " + data);
            });
    });
}

//-----------------------------
async function confirm() {
    $(this).prop('disabled', true);
    $.LoadingOverlay("show");

    $("#tableres2 table tr td input").each(function () {
        if ($(this).context.checked == true) {
            _checkedItem.push({ ID: $(this).attr("data_id") })
        }
    })
    for (let index = 0; index < _checkedItem.length; index++) {
        debugger
        var GIG_MTH_Detail = await getGIG_MTH_DetailsById(_checkedItem[index].ID);
        var res = await updateGIG_MTH_Details(_checkedItem[index].ID, "yes", GIG_MTH_Detail.step)
    }
    _checkedItem = [];
    showCartabl();

    $(this).prop('disabled', false);
    $.LoadingOverlay("hide");

}
async function reject() {
    $("#tableres2 table tr td input").each(function () {
        if ($(this).context.checked == true) {
            _checkedItem.push({ ID: $(this).attr("data_id") })
        }
    })
    for (let index = 0; index < _checkedItem.length; index++) {
        var GIG_MTH_Detail = await getGIG_MTH_DetailsById(_checkedItem[index].ID);
        var res = await updateGIG_MTH_Details(_checkedItem[index].ID, "no", GIG_MTH_Detail.step)
    }
    _checkedItem = [];
    showCartabl();
}
async function save() {
    var description = $("#description").val();
    var result = $("input[name='decide']:checked").val();
    var actionUser = _spPageContextInfo.userId;

    if (result == undefined) {
        alert("لطفا نتیجه را مشخص نمایید");
        return
    }
    else {
        $.LoadingOverlay("show");

        var Detail = await Get_DetailsById(_CurrentIdDetail)
        var DetailRes = await update_Details(_CurrentIdDetail, result, description, actionUser, Detail)

        // var res=await serviceICTRequestTadarokat("980905","254");


        showCartabl();
        $("#window").data("kendoWindow").close();
        $.LoadingOverlay("hide");

    }

    //alert("Save")
}
async function selectAllchk(s) {
    var res = $(s)[0].checked;
    if (res == true) {
        $("#tableres2 table tr td input").each(function () {
            $(this).context.checked = true
        })

    }
    else {
        $("#tableres2 table tr td input").each(function () {
            $(this).context.checked = false
        })
    }

}
async function Show(id) {

    _CurrentIdDetail = id
    var Detail = await Get_DetailsById(id)
    var confirm = await Get_ConfirmByStep(Detail.step, Detail.MasterId.CID)


    $(".PersonelId span").remove();
    $(".NamePersonel span").remove();
    $(".DepName span").remove();
    $(".RequestDate span").remove();
    $(".Tozihat span").remove();
    $(".NameKala span").remove();


    $(".PersonelId").append("<span>" + Detail.MasterId.PersonelId + "</span>");
    $(".NamePersonel").append("<span>" + Detail.MasterId.Title + "</span>");
    $(".DepName").append("<span>" + Detail.MasterId.DepName + "</span>");
    $(".RequestDate").append("<span>" + foramtDate(Detail.MasterId.RequestDate) + " " + calDayOfWeek(foramtDate(Detail.MasterId.RequestDate)) + "</span>");
    $(".Tozihat").append("<span>" + Detail.Tozihat + "</span>");
    $(".NameKala").append("<span>" + splitString(Detail.NameKala)[1] + "</span>");


    if (confirm[0].Role == "ICT") {
        showWindowsICT()
    }
    else {
        showWindows();
    }

}
//----------------------------Modal Dialog Form
function showWindows() {
    var myWindow = $("#window"),
        undo = $("#newRecord");
    myWindow.kendoWindow({
        width: "1200px",
        title: "فرم تایید کالا",
        visible: false,
        actions: [
            // "Pin",
            // "Minimize",
            //"Maximize",
            "Close"
        ],
        close: function () {
            undo.fadeIn();
        }
    }).data("kendoWindow").center().open();
}
function showWindowsICT() {
    var myWindow = $("#windowICT"),
        undo = $("#newRecord");
    myWindow.kendoWindow({
        width: "1200px",
        title: "فرم تایید کالا",
        visible: false,
        actions: [
            // "Pin",
            // "Minimize",
            //"Maximize",
            "Close"
        ],
        close: function () {
            undo.fadeIn();
        }
    }).data("kendoWindow").center().open();
}
//-------------------------------------------web services
//header master
function serviceICTRequestTadarokat(myDate, PortalReqHeaderID) {
    debugger
    return new Promise(resolve => {
        var serviceURL = "https://portal.golrang.com/_vti_bin/SPService.svc/ICTRequestTadarokat"
        var request = { CID: CurrentCID, Date: myDate, PortalReqHeaderID: PortalReqHeaderID }
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
                if ($.isNumeric(data)) {
                    resolve(data);
                }
                else {
                    alert(data)
                }
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
function foramtDate(str) {
    return str.slice(0, 2) + "/" + str.slice(2, 4) + "/" + str.slice(4, 6)
}
function splitString(str) {
    return str.split(";#")
}
//-----------------------

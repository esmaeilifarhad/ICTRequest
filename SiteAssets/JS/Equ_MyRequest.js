var _Id = 0
var CurrentCID = 0;
var CurrentPID = 0;
var CurrentName = ""
var CurrentDep = ""
var CurrentPLoginName = ""

var _UserInGroupos = []
var _checkedItem = []
/*
List Name :
GIG_MTH_Request
GIG_MTH_Details
GIG_MTH_Confirm
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
    
    var Details = await Get_Details();
    // console.log(GIG_MTH_Details)
    // $("#Pname").append("<p>"+Details[0].MasterId.Title+"</p>");
    // $("#Pname").append("<p>"+Details[0].MasterId.DepName+"</p>");
    //---------------------


    
        var table = ""
        for (let index = 0; index < Details.length; index++) {
            table += "<tr class='rowData' Data_Id=" + Details[index].id + ">"
            // table += "<td >"
            // table += GIG_MTH_Details[index].step
            // table += "</td>"
            table += "<td col='pdpDark'>"
            table += (index + 1)
            table += "</td>"
            // table += "<td col='pdpDark'>"
            // table += GIG_MTH_Details[index].MasterId.Title
            // table += "</td>"
            // table += "<td col='pdpDark'>"
            // table += GIG_MTH_Details[index].MasterId.DepName
            // table += "</td>"
            table += "<td col='DayOfWeek'>"
            table += Details[index].PlackNo
            table += "</td>"
            // table += "<td col='DayOfWeek'>"
            // table += calDayOfWeek(Details[index].Date)
            // table += "</td>"
            table += "<td col='description'>"
            table += splitString(Details[index].NameKala)[1]
            table += "</td>"
            // table += "<td col='isFood'>"
            // table += (Details[index].IsFood == true) ? "<span style='color:green' class='fa fa-check  pointer'></span>" : "<span style='color:red' class='fa fa-remove  pointer'></span>"
            // table += "</td>"
             table += "<td >"
            table += Details[index].StatusWF
            table += "</td>"
            table += "</tr>"
        }
        $("#tableres2 table").append(table);
    
}
//-------------------------------------------------------

function Get_Details() {
    return new Promise(resolve => {
     
        $pnp.sp.web.lists.
        getByTitle("GIG_equ_Details").
        items.select("MasterId/Id,MasterId/Semat,MasterId/PersonelId,DarkhastSN,MasterId/Title,MasterId/CID,MasterId/PersonelId,MasterId/DepName,MasterId/RequestDate,Id,BuyStock,Title,PlackNo,step,NameKalaValue,Tozihat,StatusWF,NameKala,MasterId/RR_ID").
        expand("MasterId").
        // filter("(StatusWF eq 'درگردش') and (((MasterId/DepId eq 289) and (step eq 1)) or ((MasterId/DepId eq null) and (step eq 2)) or ((MasterId/DepId eq null) and (step eq 3)) or ((MasterId/DepId eq null) and (step eq 4)) or ((MasterId/DepId eq null) and (step eq 5)) or ((MasterId/DepId eq null) and (step eq 6)))")
        filter("MasterId/PersonelId eq "+CurrentPID+"").
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

//--------------------------
function calDayOfWeek(date) {
 
        debugger
    
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

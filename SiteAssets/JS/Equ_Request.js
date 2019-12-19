var _Id = 0
var CurrentCID = 0;
var CurrentPID = 0;
var CurrentName = ""
var CurrentDep = ""
var CurrentPLoginName = ""
var _PersonelInfo;
var _IctKalaFilter;
var CurrentSematId;
var today = "";
var portalAddress = _spPageContextInfo.webAbsoluteUrl;
var InfoPersonelCompany;

var _DetailsObjects = []

var person = {};
/*
List Name :
GIG_equ_Request
GIG_equ_Details
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



    ShowSuccessor();
    ShowIndividualprofile();

});
//----------------------

function removeRow(ss, Id) {
    //remove Item in Array
    for (var i = 0; i < _DetailsObjects.length; i++) {
        if (_DetailsObjects[i].ID === Id) {
            _DetailsObjects.splice(i, 1);
            i--;
        }
    }
    //remove tr element
    $($(ss).closest("tr")).remove();
}
function calDayOfWeek(date) {
    var year = ""
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
async function save() {
    $("#message .tblRow").remove()
    if (_DetailsObjects.length == 0) {
        showMessage("هیچ رکوردی برای ذخیره پیدا نشد.")
        return;
    }

    // save
    $('#btnSave').prop('disabled', true);
    $.LoadingOverlay("show");


    var GIG_equ_Request = await CreateGIG_equ_Request();
    for (let index = 0; index < _DetailsObjects.length; index++) {
        var GIG_MTH_Detail = await CreateGIG_equ_Details(GIG_equ_Request, _DetailsObjects[index]);
    }

    $("#message .tblRow").remove()
    $("#message table").append("<tr class='tblRow'><td>درخواست شما با موفقیت ذخیره شد</td></tr>");
    $("#message table").append("<tr class='tblRow'><td><a target='_blank' href='https://portal.golrang.com/ictrequests/Pages/Equ_MyRequest.aspx'>برای مشاهده درخواست های خود کلیک نمایید</a></td></tr>");


    $.LoadingOverlay("hide");
    const Toast = Swal.mixin({
        toast: true,
       // position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        onOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      })
      
      Toast.fire({
        icon: 'success',
        title: 'درخواست شما با موفقیت ذخیره شد'
      })
    // $('#btnSave').prop('disabled', true);
}
async function addDetail() {
    $("#message .tblRow").remove()
    const m = moment();
    today = moment().format('jYYYY/jM/jD');//Today
    // console.log(pdpDark);
    // console.log(today);


    var todayarray = today.split("/")
    mounth = (parseInt(todayarray[1]) <= 9) ? "0" + parseInt(todayarray[1]) : parseInt(todayarray[1])
    rooz = (parseInt(todayarray[2]) <= 9) ? "0" + parseInt(todayarray[2]) : parseInt(todayarray[2])
    year = todayarray[0].substring(2, 4)
    today = year + "" + mounth + "" + rooz


    _Id += 1;

    var description = $("#description").val()
    var KalaId = $("#Kala option:selected").val();
    var KalaText = $("#Kala option:selected").text();



    $("#message p").remove();
    _DetailsObjects.push({ ID: _Id, KalaId: KalaId, KalaText: KalaText, description: description })
    var table = ""
    table += "<tr Data_Id=" + _Id + ">"
    table += "<td col='pdpDark'>"
    table += _Id
    table += "</td>"
    table += "<td col='pdpDark'>"
    table += KalaText
    table += "</td>"
    table += "<td col='description'>"
    table += description
    table += "</td>"
    table += "<td col='remove'><span style='color:mediumvioletred' class='fa fa-remove RemoveWord pointer' onclick='removeRow(this," + _Id + ")'></span></td>"
    table += "</tr>"
    $("#tableres2 table").append(table);

}
//-------------------------------------------------------Show
async function ShowSuccessor() {
    var IsUserSuccessor = await IsCurrentUserMemberOfGroup(104);
    if (IsUserSuccessor == true) {
        $("#tableres .divSuccessor .IsForSuccessor").remove()
        $("#tableres .divSuccessor").prepend("<tr class='IsForSuccessor'><td>انتخاب برای پرسنل</td><td><input id='IsForSuccessor' onchange='checkedcheckboxIsForSuccessor(this)'  type='checkbox'  value='true'></td></tr>")
    }
}
async function ShowIndividualprofile() {
    var Kala = []

    InfoPersonelCompany = await serviceInfoPersonelCompany();

    if ($("#IsForSuccessor").is(':checked')) {
        var ResPersonelId = $("#personPickerId option:selected").val();
        var res = InfoPersonelCompany.find(x => x.Personelid == ResPersonelId);
        CurrentSematId = res.SematId
        person.DepId = res.DepId
        person.Depname = res.Depname
        person.Gender = res.Gender
        person.PersonelFamily = res.PersonelFamily
        person.PersonelName = res.PersonelName
        person.Personelid = res.Personelid
        person.SectionName = res.SectionName
        person.SematId = res.SematId
        person.SematTitle = res.SematTitle
        person.userid = res.userid
    }
    else {
        var res = InfoPersonelCompany.find(x => x.Personelid == sessionStorage.getItem("PID"));
        // _PersonelInfo = await servicePersonelInfo();
        CurrentSematId = res.SematId;
        person.DepId = res.DepId
        person.Depname = res.Depname
        person.Gender = res.Gender
        person.PersonelFamily = res.PersonelFamily
        person.PersonelName = res.PersonelName
        person.Personelid = res.Personelid
        person.SectionName = res.SectionName
        person.SematId = res.SematId
        person.SematTitle = res.SematTitle
        person.userid = sessionStorage.getItem("UID");
    }

    _IctKalaFilter = await serviceIctKalaFilter();

    //-----------------------------------------تجهیزات - مجاز به انتخاب همه تجهیزات ------کاربر در این گروه مجاز است همه ی کالا ها را انتخاب کند   
    debugger
    var IsCanSelectAllICT = await IsCurrentUserMemberOfGroup(105);
    debugger
    if (IsCanSelectAllICT == true) {
        for (let index = 0; index < _IctKalaFilter.length; index++) {
            Kala.push({ KalaValue: _IctKalaFilter[index].KalaValue, KalaName: _IctKalaFilter[index].KalaName, IsAmvaly: _IctKalaFilter[index].IsAmvaly, GroohKala: _IctKalaFilter[index].DSCGrooKala })
        }
    }
    else {
        var Policy = await Get_Policy()
        for (let index = 0; index < _IctKalaFilter.length; index++) {
            var res = Policy.find(x => x.KalaValue == _IctKalaFilter[index].KalaValue);
            if (res == undefined) {
                // Kala.push({ type: "create", KalaValue: KalaFilter[index].KalaValue, KalaName: KalaFilter[index].KalaName, CID: 50 })
            }
            else {
                if (res.IsBelong == true || res.IsUnlimited == true) {
                    Kala.push({ KalaValue: _IctKalaFilter[index].KalaValue, KalaName: _IctKalaFilter[index].KalaName, IsAmvaly: _IctKalaFilter[index].IsAmvaly, GroohKala: _IctKalaFilter[index].DSCGrooKala })
                }
            }
        }
    }
    //-------------------------------------------
    $("#Kala select").remove()
    var selectOption = "<select>"
    var flagCheck = ""

    for (let index = 0; index < Kala.length; index++) {
        debugger
        if (flagCheck == "") {

            selectOption += "<optgroup label='" + Kala[index].GroohKala + "'>"
        }

        if (flagCheck != "" && flagCheck != Kala[index].GroohKala) {

            selectOption += "</optgroup>"
            selectOption += "<optgroup label='" + Kala[index].GroohKala + "'>"

        }
        flagCheck = Kala[index].GroohKala

        selectOption += "<option value=" + Kala[index].KalaValue + ">" + Kala[index].KalaName + "</option>"
    }
    selectOption += "</optgroup>"
    selectOption += "</select>"
    $("#Kala").append(selectOption)
    //---------------------------------------------

    $("#NameUser").next().remove();
    $("#PID").next().remove();
    $("#Department").next().remove();
    $("#Semat").next().remove();

    $("#NameUser").after("<span>" + (person.Gender == "False" ? "آقای" : "خانم") + " " + person.PersonelName + " " + person.PersonelFamily + "</span>");
    $("#PID").after("<span>" + person.Personelid + "</span>");
    $("#Semat").after("<span>" + person.SematTitle + "</span>");
    $("#Department").after("<span>" + person.Depname + "</span>");

}
function showMessage(message) {

    $("#message table").append("<tr class='tblRow'><td>" + message + "</td></tr>");
}
//-------------------------------------------------------
function checkedcheckboxIsForSuccessor(thiss) {

    if ($("#IsForSuccessor").is(':checked')) {
        // checked
        var createSelectOption = "<tr class='Successor'><td>پرسنل</td><td><select id='personPickerId' onchange='personPick()'>"

        for (let index = 0; index < InfoPersonelCompany.length; index++) {

            var element = InfoPersonelCompany[index];
            // console.log(element)
            createSelectOption += "<option value=" + InfoPersonelCompany[index].Personelid + ">" + InfoPersonelCompany[index].PersonelName + " " + InfoPersonelCompany[index].PersonelFamily + "</option>"
        }
        createSelectOption += "</select></td></tr>"
        $("#tableres .table .Successor").remove()
        $("#tableres .table").prepend(createSelectOption)
    }
    else {
        // unchecked
        $("#tableres .table .Successor").remove()

    }
}
function personPick() {
    ShowIndividualprofile();
}
function CreateGIG_equ_Request() {
    // console.log(person)

    return new Promise(resolve => {
        $pnp.sp.web.lists.getByTitle("GIG_equ_Request").items.add({
            RR_ID: person.SematId,
            Semat: person.SematTitle,
            Title: person.PersonelName + " " + person.PersonelFamily,
            PersonelId: person.Personelid,
            RequestDate: today,
            // Description: description,
            UserId: person.userid,
            DepName: person.Depname,
            DepId: person.DepId,
            CID: CurrentCID
            // IsFinish: "درگردش"
            // confirmUserId: 641/*MTH_Confirm => group
        }).then(function (item) {
            console.log(item);
            resolve(item);
        });
    });

}
async function CreateGIG_equ_Details(GIG_equ_Request, GIG_equ_Details) {
    var Confirm = await Get_Confirm();
    //IsAmvaly
    var res = _IctKalaFilter.find(x => x.KalaValue == GIG_equ_Details.KalaId);
    return new Promise(resolve => {
        $pnp.sp.web.lists.getByTitle("GIG_equ_Details").items.add({
            Title: person.PersonelName + " " + person.PersonelFamily,
            StatusWF: "درگردش",
            NameKala: GIG_equ_Details.KalaId + ";#" + GIG_equ_Details.KalaText,
            NameKalaValue: GIG_equ_Details.KalaId,
            // Semat: GIG_MTH_Details.pdpDark,
            Tozihat: GIG_equ_Details.description,
            MasterIdId: GIG_equ_Request.data.Id,
            step: 1,
            IsAmvaly: res.IsAmvaly,
            Role: Confirm[0].Role,
            ConfirmIdId: Confirm[0].Id
        }).then(function (item) {
            //console.log(item);
            resolve(item);
        });
    });
}
function GetGIG_MTH_Details(_Date) {

    return new Promise(resolve => {
        $pnp.sp.web.lists.
            getByTitle("GIG_equ_Details").
            items.select("Date,MasterId/Personelid").
            expand("MasterId").
            filter("(Date eq '" + _Date + "') and (MasterId/Personelid eq  " + CurrentPID + ")").
            // orderBy("Modified", true).
            get().
            then(function (items) {
                resolve(items);
            });
    });
}
function Get_Policy() {
    return new Promise(resolve => {
        $pnp.sp.web.lists.getByTitle("GIG_equ_Policy").
            items.
            select("Gen/CID,KalaValue,SemathaValue,Price,IsBelong,IsUnlimited,Id,Title").
            filter("(SemathaValue eq " + CurrentSematId + ") and (Gen/CID eq " + CurrentCID + ")").
            expand("Gen").
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
            filter("(Step eq 1) and (CompanyId eq '" + CurrentCID + "')").
            // orderBy("Modified", true).
            get().
            then(function (items) {
                resolve(items);
            });
    });
}
//--------------------------------------------check user in group
function IsUserInGroup(id) {
    // تجهیزات - انتخاب جانشین    104
    return new Promise(resolve => {
        $.ajax({
            url: portalAddress + "/_api/web/sitegroups/getbyId(" + id + ")/CanCurrentUserViewMembership",
            method: "GET",
            asyn: true,
            crossDomain: true,
            headers: { "Accept": "application/json; odata=verbose" },
            success: function (data) {

                var IsExist = data.d.CanCurrentUserViewMembership
                debugger
                resolve(IsExist)
            },
            error: function (data) {

            }
        });
    });
}
function IsCurrentUserMemberOfGroup(id) {
    /*
    تجهیزات - انتخاب جانشین    104 
    105   تجهیزات - مجاز به انتخاب همه تجهیزات   
    */
    return new Promise(resolve => {
        var grpName = [id];
        var isUserInGroups = false;
        var url = _spPageContextInfo.webAbsoluteUrl + "/_api/web/currentuser/groups?$select=Id";
        $.ajax({
            url: url,
            type: "GET",
            async: false,
            headers: {
                "Accept": "application/json;odata=verbose",
            },
            success: function (data) {

                for (var i = 0; i < grpName.length; i++) {
                    for (var j = 0; j < data.d.results.length; j++) {
                        if (grpName[i] == data.d.results[j].Id) {
                            isUserInGroups = true;
                        }
                        else {

                        }
                    }
                }
                resolve(isUserInGroups)
            },
            error: function (error) {

                //console.log(JSON.stringify(error));  
            }
        });
    });

}
//-------------------------------------------web services
// function servicePersonelInfo() {
//     return new Promise(resolve => {
//         var serviceURL = "https://portal.golrang.com/_vti_bin/SPService.svc/InformationPersonel"
//         var request = { PersonelId: CurrentPID, CID: CurrentCID }
//         $.ajax({
//             type: "POST",
//             url: serviceURL,
//             contentType: "application/json; charset=utf-8",
//             xhrFields: {
//                 'withCredentials': true
//             },
//             dataType: "json",
//             data: JSON.stringify(request),
//             success: function (data) {
//                 resolve(data);
//             },
//             error: function (a) {
//                 console.log(a);
//             }
//         });
//     })
// }
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
function serviceInfoPersonelCompany() {
    return new Promise(resolve => {
        var serviceURL = "https://portal.golrang.com/_vti_bin/SPService.svc/InfoPersonelCompany"
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
//-------------------------------------------------------
function foramtDate(str) {
    return str.slice(0, 2) + "/" + str.slice(2, 4) + "/" + str.slice(4, 6)
}
function splitString(str) {
    return str.split(";#")
}
/*
Pass you dates to this function like this:  showDays('1/1/2014','12/25/2014')
پارامتر وردی تابع شمسی میباشد
1367/07/09
*/
function numberDaysTwoDate(firstDate, secondDate) {

    var firstDate = moment(firstDate, 'jYYYY/jM/jD ').format('M/D/YYYY')//'1/1/2014'
    var secondDate = moment(secondDate, 'jYYYY/jM/jD ').format('M/D/YYYY')//'1/1/2014'


    var startDay = new Date(firstDate);
    var endDay = new Date(secondDate);
    var millisecondsPerDay = 1000 * 60 * 60 * 24;

    var millisBetween = startDay.getTime() - endDay.getTime();
    var days = millisBetween / millisecondsPerDay;

    // Round down.
    return (Math.floor(days));

}

//-----------------------

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


    showCartabl();

});

//-------------------------------------------------------

// function showMessage(message) {
//     $("#message p").remove()
//     $("#message").append("<p class='message'>" + message + "</p>");
// }
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
        $("#tableres2 table").append("<tr class='rowData'><td colspan=10>موردی برای مشاهده وجود ندارد</td></tr>");
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
            // table += "<td>"
            // table += "<input type=checkbox Data_Id=" + Details[index].ID + " />"
            // table += "</td>"
            // table += "<td col='remove'><span style='color:mediumvioletred' class='fa fa-remove RemoveWord pointer' onclick='removeRow(this," + _Id + ")'></span></td>"
            table += "</tr>"
        }
        $("#tableres2 table").append(table);
    }
    //-------update exchangeRate 
    var ER = await exchangeRate();
    Update_GenLookUp(1, ER.sell_usd.price)

}
//-------------------------------------------------------CRUD

function Get_Details(usersInConfirm) {
    return new Promise(resolve => {
        var filter = ""
        var filterStatusWF = ""
        var filterMyRequester = ""
        // if (usersInConfirm.length == 0) {
        //     resolve("null");
        //     return
        // }
        //  else {
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
                    resolve("null")
                }
                else {
                    resolve(items);
                }
            });
    });
}
function Get_DetailsMojoodyAnbar(Detail) {
    return new Promise(resolve => {
        $pnp.sp.web.lists.
            getByTitle("GIG_equ_Details").
            items.select("IsAmvaly,BuyStockTitle,exchangeRate,MasterId/Id,MasterId/Semat,DarkhastSN,MasterId/Title,MasterId/CID,MasterId/PersonelId,MasterId/DepName,MasterId/RequestDate,Role,Id,BuyStock,Title,PlackNo,step,NameKalaValue,Tozihat,StatusWF,NameKala,MasterId/RR_ID,MasterId/Semat").
            expand("MasterId").
            //filter("(StatusWF eq 'درگردش') and (NameKalaValue eq '" + splitString(Detail.NameKala)[0] + "') and (DarkhastSN ne null) and (MasterId/CID eq " + CurrentCID + ") and (BuyStockTitle eq 'انبار') ").
            // DarkhastSN بدون در نظر گرفته شدن 
            filter("(StatusWF eq 'درگردش') and (NameKalaValue eq '" + splitString(Detail.NameKala)[0] + "') and (MasterId/CID eq " + CurrentCID + ") and (BuyStockTitle eq 'انبار') and (Role ne 'ICT') ").
            get().
            then(function (items) {
                resolve(items);
            }).catch(error => { console.log(error) });
    });
}
function Get_DetailsById(id) {
    return new Promise(resolve => {
        $pnp.sp.web.lists.getByTitle("GIG_equ_Details").
            items.
            getById(id).
            select("IsAmvaly,MasterId/UserId,exchangeRate,BuyStock,MasterId/Id,MasterId/Semat,DarkhastSN,MasterId/Title,MasterId/RR_ID,MasterId/PersonelId,MasterId/CID,MasterId/DepName,MasterId/RequestDate,Id,Title,step,NameKalaValue,Tozihat,PlackNo,StatusWF,NameKala,EstelamGheymat").
            expand("MasterId").
            get().
            then(function (item) {
                resolve(item)
            });
    })
}
function Create_Log(Detail, confirm, result, description) {
    return new Promise(resolve => {
        $pnp.sp.web.lists.getByTitle("GIG_Equ_Log").items.add({
            Result: result,
            Title: CurrentName,
            Dsc: description,
            DateConfirm: foramtDate(today),
            DetailIdId: Detail.Id,
            ConfirmIdId: confirm[0].Id,
            UserSubmitterId: _spPageContextInfo.userId,
            USERID: sessionStorage.getItem("UID")

        }).then(function (item) {
            resolve(item);
        });

    });

}
function Get_Log(id) {
    return new Promise(resolve => {
        $pnp.sp.web.lists.getByTitle("GIG_Equ_Log").
            items.
            select("ConfirmId/Id,ConfirmId/Title,DetailId/Id,DetailId/Title,Result,Dsc,DateConfirm,Id,UserSubmitter/Title,UserSubmitter/Id").
            expand("ConfirmId,DetailId,UserSubmitter").
            filter("DetailId/Id eq " + id + "").
            orderBy("Id", false).
            get().
            then(function (item) {
                resolve(item)
            });
    })
}
function Get_LogTopOne(id) {
    return new Promise(resolve => {
        $pnp.sp.web.lists.getByTitle("GIG_Equ_Log").
            items.
            select("USERID,ConfirmId/Id,ConfirmId/Title,DetailId/Id,DetailId/Title,Result,Dsc,DateConfirm,Id,UserSubmitter/Title,UserSubmitter/Id").
            expand("ConfirmId,DetailId,UserSubmitter").
            filter("DetailId/Id eq " + id + "").
            orderBy("Id", false).
            top(1).
            get().
            then(function (item) {
                debugger
                resolve(item)
            });
    })
}
function Get_Policy(Detail) {
    return new Promise(resolve => {
        $pnp.sp.web.lists.getByTitle("GIG_equ_Policy").
            items.
            select("Gen/Id,Gen/CID,KalaValue,SemathaValue,Price,IsBelong,Id,Title,IsUnlimited").
            filter("(KalaValue eq " + splitString(Detail.NameKala)[0] + ") and (SemathaValue eq " + Detail.MasterId.RR_ID + ") and (Gen/CID eq " + Detail.MasterId.CID + ")").
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


    /*
    return new Promise(resolve => {
        $pnp.sp.web.lists.getById("4BB186CE-0D88-49DA-A252-A3295A60CFE3").items.get().
            then(function (item) {
                debugger
                resolve(item)
            });
    })*/

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
async function update_Details(_CurrentIdDetail, result, description, varStep, Detail, Confirm, EstelamGheymat, PlackNo, BuyStock, StatusWF, DarkhastSN, nextConfirm) {

    var nextConfirmRes = nextConfirm.length == 0 ? "Finish" : nextConfirm[0].Role

    if (nextConfirm.length == 0) {
        return new Promise(resolve => {
            var list = $pnp.sp.web.lists.getByTitle("GIG_equ_Details");
            list.items.getById(_CurrentIdDetail).update({
                step: varStep,
                StatusWF: StatusWF,
                DarkhastSN: DarkhastSN,
                EstelamGheymat: EstelamGheymat,
                Role: nextConfirmRes,
                PlackNo: PlackNo,
                BuyStock: BuyStock,
                BuyStockTitle: splitString(BuyStock)[0],
                exchangeRate: _exchangeRate,
                ConfirmIdId: null
            }).then(async function (item) {
                var Log = await Create_Log(Detail, Confirm, result, description)
                resolve(item)
            });
        })
    }
    else {
        return new Promise(resolve => {
            var list = $pnp.sp.web.lists.getByTitle("GIG_equ_Details");
            list.items.getById(_CurrentIdDetail).update({
                step: varStep,
                StatusWF: StatusWF,
                DarkhastSN: DarkhastSN,
                EstelamGheymat: EstelamGheymat,
                Role: nextConfirmRes,
                PlackNo: PlackNo,
                BuyStock: BuyStock,
                BuyStockTitle: splitString(BuyStock)[0],
                exchangeRate: _exchangeRate,
                ConfirmIdId: nextConfirm[0].Id
            }).then(async function (item) {
                var Log = await Create_Log(Detail, Confirm, result, description)
                resolve(item)
            });
        })

    }



}
function Update_GenLookUp(Id, price) {
    var price = removeComma(price).toString()
    price = removeLastChar(price)
    return new Promise(resolve => {
        var list = $pnp.sp.web.lists.getByTitle("Equ_GenLookUp");
        list.items.getById(Id).update({
            value: price
        }).then(function (item) {
            resolve(item);
        }).catch((error => {
            resolve(item);
        }));
    })
}

//-----------------------------

async function save() {
    $("#myModal .modal-body p").remove()
    //-----------------------------get value from fields
    var description = ""
    description += $("#window .table .description textarea").val()
    description += $("#windowJAM .table .description textarea").val()
    description += $("#windowAML .table .description textarea").val()
    description += $("#windowREQ .table .description textarea").val()
    description += $("#windowICT .table .description textarea").val()
    var result = $("input[name='decide']:checked").val()
    //-----------------------------
    var BuyStock = $("input[name='BuyStock']:checked").val()
    var actionUser = _spPageContextInfo.userId;
    var EstelamGheymat = $("#EstelamGheymat").val()
    var PlackNo = $("#selectOptionAmval option:selected").text();
    //---------------------------get data from list
    var Detail = await Get_DetailsById(_CurrentIdDetail)
    var Confirm = await Get_ConfirmByStep(Detail.step, Detail.MasterId.CID)
    var Policy = await Get_Policy(Detail)
    //-------------------------------validation

    if (Confirm[0].Role == "ICT") {

        if (EstelamGheymat == "" && result == "تایید") {
            // $("#myModal .modal-body p").remove()
            $("#myModal .modal-body").append("<p>لطفا قیمت فعلی کالا را مشخص نمایید</p>")
            $("#myModal").modal();

            //alert("لطفا قیمت فعلی کالا را مشخص نمایید");
            return
        }

        if ((BuyStock == "" || BuyStock == undefined) && result == "تایید") {
            // $("#myModal .modal-body p").remove()
            $("#myModal .modal-body").append("<p>لطفا مشخص نمایید کالا را قصد دارید از انبار تهیه نمایید و یا خرید نمایید.</p>")
            $("#myModal").modal();
            // alert("لطفا مشخص نمایید کالا را قصد دارید از انبار تهیه نمایید و یا خرید نمایید.");
            return
        }

        var CurrentMojoody = _MojoodyAnbarInPap - _MojoodyAnbarInPortal
        if (CurrentMojoody < 1 && splitString(BuyStock)[0] == 'انبار' && result == "تایید") {
            // $("#myModal .modal-body p").remove()
            $("#myModal .modal-body").append("<p>در حال حاضر کالایی در انبار وجود ندارد</p>")
            $("#myModal .modal-body").append("<p>موجودی انبار در پپ " + _MojoodyAnbarInPap.toString() + "</p>")
            $("#myModal .modal-body").append("<p> کالاهای در گردش " + _MojoodyAnbarInPortal.toString() + "</p>")
            $("#myModal .modal-body").append("<p>" + _MojoodyAnbarInPap.toString() + "-" + _MojoodyAnbarInPortal.toString() + "=" + (_MojoodyAnbarInPap - _MojoodyAnbarInPortal).toString() + "</p>")

            $("#myModal").modal();
            // alert("در حال حاضر کالایی در انبار وجود ندارد" + "\n" + " موجودی انبار در پپ " + _MojoodyAnbarInPap.toString() + "\n" + " کالاهای در گردش " + _MojoodyAnbarInPortal.toString() + "\n" + _MojoodyAnbarInPap.toString() + "-" + _MojoodyAnbarInPortal.toString() + "=" + (_MojoodyAnbarInPap - _MojoodyAnbarInPortal).toString());
            return
        }
        if (Policy[0].Price == null && result == "تایید" && Policy[0].IsUnlimited == false) {
            // $("#myModal .modal-body p").remove()
            $("#myModal .modal-body").append("<p>لطفا برای کالا " + splitString(Detail.NameKala)[1] + " و سمت " + Detail.MasterId.Semat + " محدوده قیمت مشخص نمایید</p>")
            $("#myModal .modal-body").append("<p><a target='_blanck' href=https://portal.golrang.com/ictrequests/Pages/Equ_policy.aspx>لینک تعریف محدودیدت ها</a></p>")
            $("#myModal").modal();
            //alert("لطفا برای کالا " + splitString(Detail.NameKala)[1] + " و سمت " + Detail.MasterId.Semat + " محدوده قیمت مشخص نمایید")
            $.LoadingOverlay("hide");
            return;
        }

    }
    if (result == undefined && Confirm[0].Role != "JAM") {
        $("#myModal .modal-body").append("<p>لطفا نتیجه را مشخص نمایید</p>")
        $("#myModal").modal();
        //alert("لطفا نتیجه را مشخص نمایید");
        return
    }
    if (result == "عدم تایید" && description.trim() == "") {
        $("#myModal .modal-body").append("<p>لطفا در صورت عدم تایید توضیحات را پر نمایید.</p>")
        $("#myModal").modal();
        //alert("لطفا در صورت عدم تایید توضیحات را پر نمایید.");
        return
    }
    else {
        $.LoadingOverlay("show");

        if (EstelamGheymat == null || EstelamGheymat == "") {
            EstelamGheymat = Detail.EstelamGheymat
        }
        if (PlackNo == null || PlackNo == "") {
            PlackNo = Detail.PlackNo
        }
        if (BuyStock == null || BuyStock == "") {
            BuyStock = Detail.BuyStock
        }
        /*به علت اینکه جمعدار دکمه تایید و عدم تایید نداره همیشه آنرا تایید در نظر میگیریم*/
        if (Confirm[0].Role == "JAM") {
            result = "تایید"
        }
        //-----------------------------**************

        var StatusWF = Detail.StatusWF
        var varStep = Detail.step
        var DarkhastSN = Detail.DarkhastSN

        var ResDarkhastSN = ""

        if (Policy.length > 0) {
            var PriceKala = _exchangeRate * Policy[0].Price
        }
        if (result == "تایید") {
            if (Confirm[0].Role == "ICT") {
                if (parseInt(EstelamGheymat) > PriceKala && Policy[0].IsUnlimited == false) {
                    // $.LoadingOverlay("hide");
                    var res = confirm("با توجه به اینکه قیمت کالا از محدوده درخواست کاربر بیشتر میباشد مدیر عامل باید تصمیم بگیرند")
                    if (res == true) {
                        varStep = Detail.step + 1
                    }
                    else {
                        $.LoadingOverlay("hide");
                        return;
                    }
                }
                else {
                    /*
                    +2 جمع میشود که مرحله مدیر عامل رد شود
                    */
                    var Log = await Get_LogTopOne(Detail.Id)

                    varStep = Detail.step + 2
                    ResDarkhastSN = await serviceICTRequestTadarokat(Detail.MasterId.RequestDate, _CurrentIdDetail, splitString(Detail.NameKala)[0], splitString(BuyStock)[1], Detail.MasterId.UserId, Log[0].USERID, sessionStorage.getItem("UID"),Detail.Tozihat);
                }
            }
            else if (Confirm[0].Role == "AML") {
                var Log = await Get_LogTopOne(Detail.Id)
                varStep = Detail.step + 1
                ResDarkhastSN = await serviceICTRequestTadarokat(Detail.MasterId.RequestDate, _CurrentIdDetail, splitString(Detail.NameKala)[0], splitString(BuyStock)[1], Detail.MasterId.UserId, Log[0].USERID, sessionStorage.getItem("UID"),Detail.Tozihat);
            }
            else if (Confirm[0].IsFinish == true) {
                StatusWF = "خاتمه یافته"
                varStep = Detail.step + 1
            }
            else {
                varStep = Detail.step + 1
            }
        }
        else if (result == "عدم تایید") {
            varStep = Detail.step - 1
        }
        else {
            alert("call to IT")
            return;
        }
        if (varStep == 0) {
            StatusWF = "تایید نشده";
        }
        else {

        }

        /*پیدا کردن تایید کننده بعدی */

        var nextConfirm = await Get_ConfirmByStep(varStep, Detail.MasterId.CID)



        var DarkhastSN2 = ""
        if (ResDarkhastSN == null || ResDarkhastSN == "") {
            DarkhastSN2 = Detail.DarkhastSN
        }
        else {
            DarkhastSN2 = ResDarkhastSN.DarkhastSN
        }
        if (_exchangeRate == 0) {
            _exchangeRate = Detail.exchangeRate;
        }

        //-----------------------------**************update Detail and create Log

        var DetailRes = await update_Details(_CurrentIdDetail, result, description, varStep, Detail, Confirm, EstelamGheymat, PlackNo, BuyStock, StatusWF, DarkhastSN2, nextConfirm)


        //------------------------------------------
        showCartabl();
        if (Confirm[0].Role == "ICT") {
            $("#windowICT").data("kendoWindow").close();
        }
        else if (Confirm[0].Role == "JAM") {
            $("#windowJAM").data("kendoWindow").close();
        }
        else if (Confirm[0].Role == "AML") {
            $("#windowAML").data("kendoWindow").close();
        }
        else if (Confirm[0].Role == "REQ") {
            $("#windowREQ").data("kendoWindow").close();
        }
        else {
            $("#window").data("kendoWindow").close();
        }
        $.LoadingOverlay("hide");
    }



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
    var Log = await Get_Log(_CurrentIdDetail)

    var Policy = await Get_Policy(Detail)
    var GenLookUp = await Get_GenLookUpById(1)

    if (confirm[0].Role == "ICT") {
        //------------------------update exchange rate
        //  var ER = await exchangeRate();
        // Update_GenLookUp(1, ER.sell_usd.price)

        _MojoodiAnbarICT = [];
        _MojoodiAnbarICT = await Mojoodi_AnbarICT(CurrentCID);

        resultGet_DetailsMojoodyAnbar = await Get_DetailsMojoodyAnbar(Detail)
        _MojoodyAnbarInPortal = resultGet_DetailsMojoodyAnbar.length
        $(".DetailsMojoodyAnbar span").remove();
        $(".DetailsMojoodyAnbar").append("<span>" + _MojoodyAnbarInPortal + "</span>");

        var res = _MojoodiAnbarICT.find(x => x.KalaID == splitString(Detail.NameKala)[0]);

        if (res == undefined) {
            _Mojoodi_AnbarICT = null
        }
        else {
            _Mojoodi_AnbarICT = parseInt(res.mojoodi)
            _MojoodyAnbarInPap = parseInt(res.mojoodi)
        }

    }
    //-----------------------------------------------create log strart
    var table = "<table class='table'>"
    table += "<tr><th>واحد</th><th>تاریخ</th><th>نتیجه</th><th>توضیحات</th></tr>"
    for (let index = 0; index < Log.length; index++) {
        table += "<tr>"

        table += "<td>" + Log[index].ConfirmId.Title + " - (" + Log[index].UserSubmitter.Title + ")</td>"
        table += "<td>" + Log[index].DateConfirm + "</td>"
        table += "<td>" + Log[index].Result + "</td>"
        table += "<td>" + Log[index].Dsc + "</td>"
        table += "</tr>"
    }
    table += "</table>"
    $("#FolderLog table").remove();
    $("#FolderLogICT table").remove();
    $("#FolderLogJAM table").remove();
    $("#FolderLogAML table").remove();
    $("#FolderLogREQ table").remove();

    $("#FolderLog").append(table);
    $("#FolderLogICT").append(table);
    $("#FolderLogJAM").append(table);
    $("#FolderLogAML").append(table);
    $("#FolderLogREQ").append(table);
    //--------------------------------------------------create log end
    $(".Price span").remove();
    $(".Confirm span").remove();
    $(".PersonelId span").remove();
    $(".Semat span").remove();
    $(".NamePersonel span").remove();
    $(".DepName span").remove();
    $(".RequestDate span").remove();
    $(".Tozihat span").remove();
    $(".NameKala span").remove();
    $(".EstelamGheymated span").remove();
    $(".PlackNo span").remove();
    $(".BuyStock span").remove();
    $(".AmvalPersonel select").remove();
    $(".Mojoodi_AnbarICT span").remove();
    $(".description textarea").remove();
    $(".rdbConfirm div").remove();





    $("#EstelamGheymat").val(Detail.EstelamGheymat);

    if (splitString(Detail.BuyStock)[0] == "خرید") {
        $("#Buy").prop("checked", true);
    }
    if (splitString(Detail.BuyStock)[0] == "انبار") {
        $("#Stock").prop("checked", true);
    }
    if (Policy.length > 0) {
        $(".Price").append((Policy[0].IsUnlimited == true) ? "<span>نامحدود</span>" : "<span>" + SeparateThreeDigits(parseInt(GenLookUp.value) * parseInt(Policy[0].Price)) + "</span>");
    }

    $(".description").append("<textarea  name='comment' form='usrform'    placeholder='توضیحات ...'></textarea>");
    $(".rdbConfirm").append("<div><input type='radio' name='decide' value='تایید' />تایید  <input type='radio' name='decide' value='عدم تایید' />عدم تایید</td></div>");
    $(".EstelamGheymated").append("<span>" + SeparateThreeDigits(Detail.EstelamGheymat) + "</span>");
    $(".Confirm").append("<span>" + confirm[0].Title + "</span>");
    $(".Mojoodi_AnbarICT").append((_Mojoodi_AnbarICT == null) ? "<span>در انبار چنین کالایی تعریف نشده است</span>" : "<span>" + _Mojoodi_AnbarICT + "</span>");
    $(".PersonelId").append("<span>" + Detail.MasterId.PersonelId + "</span>");
    $(".Semat").append("<span>" + Detail.MasterId.Semat + "</span>");
    $(".NamePersonel").append("<span>" + Detail.MasterId.Title + "</span>");
    $(".DepName").append("<span>" + Detail.MasterId.DepName + "</span>");
    $(".RequestDate").append("<span>" + foramtDate(Detail.MasterId.RequestDate) + " " + calDayOfWeek(foramtDate(Detail.MasterId.RequestDate)) + "</span>");
    $(".Tozihat").append("<span>" + Detail.Tozihat + "</span>");
    $(".PlackNo").append("<span>" + Detail.PlackNo + "</span>");
    $(".BuyStock").append("<span>" + splitString(Detail.BuyStock)[0] + "</span>");
    $(".NameKala").append("<span>" + splitString(Detail.NameKala)[1] + "</span>");

    //----------------------------------------------show windows
    if (confirm[0].Role == "ICT") {
        _exchangeRate = parseInt(GenLookUp.value)
        showWindowsICT()
    }
    else if (confirm[0].Role == "JAM") {
        debugger
        var ShowAmvalPersonel = await serviceShowAmvalPersonel(Detail.MasterId.CID, Detail.MasterId.PersonelId);
        if (Detail.IsAmvaly == 1) {
            var AmvalPersonelSelect = "<select id='selectOptionAmval'>"
            // AmvalPersonelSelect += "<option value='1'>این کالا اموالی نمیباشد</option>"
            for (let index = 0; index < ShowAmvalPersonel.length; index++) {

                AmvalPersonelSelect += "<option value=" + ShowAmvalPersonel[index].PlackNo + ">" + ShowAmvalPersonel[index].MoshakhasatKala + " - " + ShowAmvalPersonel[index].PlackNo + "</option>"
            }
            AmvalPersonelSelect += "</select>"
        }
        else {
            var AmvalPersonelSelect = "<select id='selectOptionAmval'>"
            AmvalPersonelSelect += "<option value='1' selected>این کالا اموالی نمیباشد</option>"
            // for (let index = 0; index < ShowAmvalPersonel.length; index++) {

            //     AmvalPersonelSelect += "<option value=" + ShowAmvalPersonel[index].PlackNo + ">" + ShowAmvalPersonel[index].MoshakhasatKala + " - " + ShowAmvalPersonel[index].PlackNo + "</option>"
            // }
            AmvalPersonelSelect += "</select>"
        }


        $(".AmvalPersonel").append(AmvalPersonelSelect);
        showWindowsJAM()
    }
    else if (confirm[0].Role == "AML") {
        showWindowsAML()
    }
    else if (confirm[0].Role == "REQ") {
        showWindowsREQ()
    }
    else {
        showWindows();
    }

}
async function ShowModalConfirm(res) {
    debugger
    return new Promise(resolve => {

        $("#ModalConfirm .modal-body").append("<p>با توجه به اینکه قیمت کالا از محدوده درخواست کاربر بیشتر میباشد مدیر عامل باید تصمیم بگیرند</p>")
        $("#ModalConfirm").modal();
        if (res == true) {

            resolve(true);
        }

    });
}
//----------------------------
function ConfirmMethod() {
    resolve(true);
}
//------------------------Modal Dialog Form
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
function showWindowsJAM() {
    var myWindow = $("#windowJAM"),
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
function showWindowsAML() {
    var myWindow = $("#windowAML"),
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
function showWindowsREQ() {
    var myWindow = $("#windowREQ"),
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
//----------------------------------------------------web services
//create record header master in Tadarokat
function serviceICTRequestTadarokat(myDate, PortalReqHeaderID, Kalasn, BuyStock, DarkhastKonandehID,TaeedKonandehID,TasvibKonandehID,Tozih) {

    return new Promise(resolve => {
        var serviceURL = "https://portal.golrang.com/_vti_bin/SPService.svc/ICTRequestTadarokat"
        var request = { CID: CurrentCID, Date: myDate, PortalReqHeaderID: PortalReqHeaderID, Kalasn: Kalasn, BuyStock: BuyStock, DarkhastKonandehID: DarkhastKonandehID,TaeedKonandehID:TaeedKonandehID,TasvibKonandehID:TasvibKonandehID,Tozih:Tozih }
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
function exchangeRate() {
    return new Promise(resolve => {
        var serviceURL = "https://portal.golrang.com/_vti_bin/SPService.svc/callOutWebService";
        // var request = { CID: CurrentCID }
        $.ajax({
            type: "POST",
            url: serviceURL,
            contentType: "application/json; charset=utf-8",
            xhrFields: {
                'withCredentials': true
            },
            dataType: "json",
            success: function (data) {
                resolve(data);
            },
            error: function (a) {
                resolve(0);
                // console.log(a);
            }
        });
    })
}
//گرفتن موجودی از انبار پپ
function Mojoodi_AnbarICT(CID) {
    return new Promise(resolve => {
        var serviceURL = "https://portal.golrang.com/_vti_bin/SPService.svc/Mojoodi_AnbarICT"
        var request = { CID: CID }
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

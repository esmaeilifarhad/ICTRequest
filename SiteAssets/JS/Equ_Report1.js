$(document).ready(function () {
    ShowReport()
    var oldId = null;

    $('.tabs-controls__link').click(function (e) {
        e.preventDefault();

        if ($(this).hasClass('tabs-controls__link--active')) {
            return false;
        }

        var currentId = parseInt($(this).data('id'), 10);
        $('.tabs-controls__link--active').removeClass('tabs-controls__link--active');
        $(this).addClass('tabs-controls__link--active');

        if (currentId < oldId) { // item is hidden
            var timing = $('.card.hidden').length * 100;
            $('.card').each(function (index) {
                if (index > (currentId - 1) || index == (currentId - 1)) {
                    window.setTimeout(function () {
                        $('.card').eq(index).removeClass('hidden');
                    }, timing - (index * 100));
                }
            });
        } else {
            $('.card').each(function (index) {
                if (index < (currentId - 1)) {
                    window.setTimeout(function () {
                        $('.card').eq(index).addClass('hidden');
                    }, index * 100);
                }
            });
        }

        oldId = currentId;
    });
});
async function ShowReport() {
    var DetailAll = await Get_DetailAll()
    var arrayReport = ReportKalaCount(DetailAll)
    var tbl = "<h1>تعداد کالاهای درخواستی</h1>"
    tbl += "<table class='table'>"
    for (let i = 0; i < arrayReport.length; i++) {
        tbl += "<tr>"
        tbl += "<td>" + arrayReport[i].group + "</td>"
        tbl += "<td>" + arrayReport[i].types.length + "</td>"
        tbl += "</tr>"
    }
    tbl += "</table>"
    $("#1").append(tbl)
    //------------------------------تعداد درخواست پرسنل
    arrayReport = []
    arrayReport = ReportPersonCount(DetailAll)
    var tbl = "<h1>تعداد درخواست های پرسنل</h1>"
    tbl += "<table class='table'>"
    for (let i = 0; i < arrayReport.length; i++) {
        tbl += "<tr>"
        tbl += "<td>" + arrayReport[i].group + "</td>"
        tbl += "<td>" + arrayReport[i].types.length + "</td>"
        tbl += "</tr>"
    }
    tbl += "</table>"
    $("#2").append(tbl)
    //-----------------------------------------تعداد سفارش بر اساس سمت
    arrayReport = []
    arrayReport = ReporSematCount(DetailAll)
    var tbl = "<h1>تعداد سفارش بر اساس سمت</h1>"
    tbl += "<table class='table'>"
    for (let i = 0; i < arrayReport.length; i++) {
        tbl += "<tr>"
        tbl += "<td>" + arrayReport[i].group + "</td>"
        tbl += "<td>" + arrayReport[i].types.length + "</td>"
        tbl += "</tr>"
    }
    tbl += "</table>"
    $("#3").append(tbl)
    //---------------------------------------------
    arrayReport = []
    arrayReport = ReporCompanyCount(DetailAll)
    var tbl = "<h1>تعداد سفارش بر اساس شرکت</h1>"
    tbl += "<table class='table'>"
    for (let i = 0; i < arrayReport.length; i++) {
        tbl += "<tr>"
        tbl += "<td>" + arrayReport[i].group + "</td>"
        tbl += "<td>" + arrayReport[i].types.length + "</td>"
        tbl += "</tr>"
    }
    tbl += "</table>"
    $("#4").append(tbl)
    //-----------------------------------
    arrayReport = []
    arrayReport = ReporTajmyCount(DetailAll)
    var tbl = "<h1>تعداد سفارش بر اساس شرکت</h1>"
    tbl += "<ol>"
    for (var groupName in arrayReport) {
        debugger
        tbl += "<li><span>" + groupName + "</span><span class='countRequestInCompany'>("+arrayReport[groupName].length+")</span></li>" 
        tbl += "<ol>"
        for (let index = 0; index < arrayReport[groupName].length; index++) {        
            tbl += "<li><span>" + arrayReport[groupName][index].DepName + "</span><span> ("+arrayReport[groupName][index].dep.length+") </span>" + "<span class='showdetail' onclick=ShowToggle2('"+ arrayReport[groupName][index].dep[0].Id+"')>+</span></li>"
            //--------
            tbl += "<ul class='s" + arrayReport[groupName][index].dep[0].Id + "' hidden>"
            for (let index2 = 0; index2 < arrayReport[groupName][index].dep.length; index2++) {
                tbl += "<li>"
                tbl += arrayReport[groupName][index].dep[index2].PersonelName + "  :  " + arrayReport[groupName][index].dep[index2].NameKala
                tbl += "</li>"
            }
            tbl += "</ul>"
        }
        tbl += "</ol>"
    }

    tbl += "</ol>"
    $("#5").append(tbl)

}
//-------------------
function Get_DetailAll() {
    return new Promise(resolve => {
        $pnp.sp.web.lists.
            getByTitle("GIG_equ_Details").
            items.select("ConfirmId/Title,MasterId/Id,MasterId/CName,MasterId/Semat,MasterId/PersonelId,DarkhastSN,MasterId/Title,MasterId/CID,MasterId/PersonelId,MasterId/DepName,MasterId/RequestDate,Id,BuyStock,Title,PlackNo,step,NameKalaValue,Tozihat,StatusWF,NameKala,MasterId/RR_ID").
            expand("MasterId,ConfirmId").
            // filter("(StatusWF eq 'درگردش') and (((MasterId/DepId eq 289) and (step eq 1)) or ((MasterId/DepId eq null) and (step eq 2)) or ((MasterId/DepId eq null) and (step eq 3)) or ((MasterId/DepId eq null) and (step eq 4)) or ((MasterId/DepId eq null) and (step eq 5)) or ((MasterId/DepId eq null) and (step eq 6)))")
            //filter("MasterId/PersonelId eq " + CurrentPID + "").
            get().
            then(function (items) {
                resolve(items)
                /*
                                if (items.length == 0) {
                                    resolve(0)
                                }
                                else {
                                    resolve(items.length);
                                }
                                */
            });


    });
}
function ReportKalaCount(DetailAll) {

    var types = {};
    for (var i = 0; i < DetailAll.length; i++) {
        var groupName = splitString(DetailAll[i].NameKala)[1];

        if (!types[groupName]) {
            types[groupName] = [];
        }

        types[groupName].push({ NameKala: splitString(DetailAll[i].NameKala)[1] });
    }

    myArray = [];
    for (var groupName in types) {
        myArray.push({ group: groupName, types: types[groupName] });
    }
    return myArray
}
function ReportPersonCount(DetailAll) {
    var types = {};
    for (var i = 0; i < DetailAll.length; i++) {

        var groupName = DetailAll[i].Title;

        if (!types[groupName]) {
            types[groupName] = [];
        }

        types[groupName].push({ NameKala: splitString(DetailAll[i].NameKala)[1] });
    }

    myArray = [];
    for (var groupName in types) {
        myArray.push({ group: groupName, types: types[groupName] });
    }
    return myArray
}
function ReporSematCount(DetailAll) {
    var types = {};
    for (var i = 0; i < DetailAll.length; i++) {

        var groupName = DetailAll[i].MasterId.Semat;

        if (!types[groupName]) {
            types[groupName] = [];
        }

        types[groupName].push({ NameKala: splitString(DetailAll[i].NameKala)[1] });
    }

    myArray = [];
    for (var groupName in types) {
        myArray.push({ group: groupName, types: types[groupName] });
    }
    return myArray
}
function ReporCompanyCount(DetailAll) {
    var types = {};
    for (var i = 0; i < DetailAll.length; i++) {

        var groupName = DetailAll[i].MasterId.CName;

        if (!types[groupName]) {
            types[groupName] = [];
        }

        types[groupName].push({ NameKala: splitString(DetailAll[i].NameKala)[1] });
    }

    myArray = [];
    for (var groupName in types) {
        myArray.push({ group: groupName, types: types[groupName] });
    }

    return myArray
}
function ReporTajmyCount(DetailAll) {
    var types = {};
    var DepArray = {};
    for (var i = 0; i < DetailAll.length; i++) {

        var CName = DetailAll[i].MasterId.CName;
        var DepName = DetailAll[i].MasterId.DepName;
        if (!DepArray[DepName + "-" + CName]) {
            DepArray[DepName + "-" + CName] = [];
        }
        DepArray[DepName + "-" + CName].push({ Id: DetailAll[i].Id, DepName: DepName, CName: DetailAll[i].MasterId.CName, NameKala: splitString(DetailAll[i].NameKala)[1], PersonelName: DetailAll[i].Title });
        // DepArray.CName=CName
    }


    myArray = [];
    for (var groupName in DepArray) {

        for (let index = 0; index < DepArray[groupName].length; index++) {

            if (!types[DepArray[groupName][index].CName]) {
                types[DepArray[groupName][index].CName] = [];
            }
            
            types[DepArray[groupName][index].CName].push({ dep: DepArray[groupName], DepName: DepArray[groupName][index].DepName })
            break

        }

        // myArray.push({ group: groupName, DepName: DepArray });
    }

    return types
}

function splitString(str) {
    if (str == null) return ""
    return str.split(";#")
}

function ShowToggle2(id) {
    debugger
    var res = $(".s"+id).attr("hidden");
    if (res == "hidden") {
        $(".s"+id).attr("hidden", false);
    }
    else {
        $(".s"+id).attr("hidden", true);
    }


}



var foreignKey = 0;
var CurrentCID = 0;
// SP.SOD.executeFunc('sp.js', 'SP.ClientContext' );

$(document).ready(function () {
    //-----npm initial header Request
    $pnp.setup({
        headers: {
            "Accept": "application/json; odata=verbose"
        }
    });
    CurrentCID = sessionStorage.getItem("CID");
    //Grid
    showGrid();


});

/*Show Windows*/

/*
undo.click(function () {
    myWindow.data("kendoWindow").open();
    undo.fadeOut();
});

*/
function showWindows() {

    var myWindow = $("#window"),
        undo = $("#newRecord");
    myWindow.kendoWindow({
        width: "600px",
        title: "فرم ثبت دیتا",
        visible: false,
        actions: [
            "Pin",
            "Minimize",
            "Maximize",
            "Close"
        ],
        close: function () {
            undo.fadeIn();
        }
    }).data("kendoWindow").center().open();
}


// Retrieving Lookup Fields    foreign
/*
function lookUp() {

    $pnp.sp.web.lists.getByTitle("GIG_equ_Details").items.select("Title", "MastreId/Title", "MastreId/ID").expand("MastreId").get().then(function (items) {

        console.log(items);
    });

}
*/
//ُShow Grid
function showGrid() {
    // lookUp()

    $("#Grid1").kendoGrid({
        dataSource: {
            type: "odata",
            transport: {
                read: {
                    url: "https://portal.golrang.com/ictrequests/_api/lists/getByTitle('GIG_equ_Details')/items?$select=MasterId/RequestDate,MasterId/CID,MasterId/NameRequester,IsDoneBuy,MasterId/DepName,Id,NameKala,MasterId/Title&$expand=MasterId&$filter=(MasterId/CID eq " + CurrentCID.toString() + ") and (IsDoneAmval eq 0) and (IsSaveInPap eq 1)&$orderby=(Id)",
                    contentType: "application/json; charset=utf-8",
                    headers: {
                        "accept": "application/json;odata=verbose"
                    },
                    dataType: "json"
                }
            },
            pageSize: 20
        },
        height: 300,
        // groupable: true,
        sortable: true,
        pageable: {
            refresh: true,
            pageSizes: true,
            buttonCount: 5
        },
        filterable: true,
        columns: [
            {
                field: "Id",
                title: "Id",
                width: 30,
                filterable: false
            }

            ,
            {
                field: "MasterId.NameRequester",
                title: "نام درخواست دهنده",
                width: 200
            }
            ,
            {
                field: "MasterId.DepName",
                title: "واحد",
                width: 200
            }
            ,
            {
                field: "NameKala",
                title: "نام کالا",
                width: 230
            }

            ,
            {
                // MasterId.RequestDate.slice(0,2).concat(str2)
                template: "#= createTemplate(MasterId.RequestDate) #",
                title: "تاریخ",
                width: 70
            }
            ,
            {
                template: '<div><input type="checkbox" class="chkDone" value="#=Id#" style="cursor:pointer" onclick="EditForm(#=Id#)"></input></div>'
                ,

                title: "اموال انجام شد",
                width: 70
            }
            ,
            {
                template: '<div><a class="fa fa-info" style="cursor:pointer" onclick="DetailForm(#=Id#)"></a></div>'
                ,

                title: "جزئیات",
                width: 60
            }

        ]
    });
}
function DetailForm(id) {
    //alert(id)

    $pnp.sp.web.lists.getByTitle("GIG_equ_Details").items.getById(id).select("NameKala", "MasterId/DepName", "MasterId/PersonelId").expand("MasterId").get().then(function (item) {
        $('#NameKala span').remove();
        $('#Departman span').remove();
        $('#PersonelId span').remove();

        $("#NameKala").append("<span>" + item.NameKala + "</span>")
        $("#Departman").append("<span>" + item.MasterId.DepName + "</span>")
        $("#PersonelId").append("<span>" + item.MasterId.PersonelId + "</span>")
       // console.log(item)
        // console.log(items)
        // alert(item.NameKala)
        showWindows();
        // $(".webTitle").append("<li>" + item.Title + "</li>");
    });


}


function checkedDone() {
    $(".chkDone").each(function () {
        if ($(this).is(":checked")) {
            UpdateDetailRecord($(this).val())
           // console.log($(this).val())
        }

    })
}
function UpdateDetailRecord(myId) {
    var list = $pnp.sp.web.lists.getByTitle("GIG_equ_Details");
    list.items.getById(myId).update({
        IsDoneAmval: '1',
    }).then(function (item) {
        console.log(item);
        showGrid();
    }).catch(function (error) {
        console.log(error)
    });
}

function createTemplate(str) {
    return str.slice(0, 2) + "/" + str.slice(2, 4) + "/" + str.slice(4, 6)
}
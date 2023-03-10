const csrf = document.querySelector('[name="_token"]').value;

const thisDate = new Date();
const thisMonth = thisDate.getMonth() + 1;
const thisYear = thisDate.getFullYear();
const alertToRecharge = document.querySelector('#alertToRecharge');

const selectMonth = document.querySelector('#month');
const selectYear = document.querySelector('#year');
const getDataBtn = document.querySelector('#getData');
let searchData = false;

const spanSpin = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...`;

const revenue = document.querySelector('#revenue');
const expenses = document.querySelector('#expenses');
const lastRevenue = document.querySelector('#lastRevenue');
const lastExpenses = document.querySelector('#lastExpenses');
const earnings = document.querySelector('#earnings');
const clearInputs = document.querySelector('#clearInputs');


const tbody = document.querySelector('#tbody');
const btnToEdit = document.querySelectorAll('.btnToEdit');
const btnUpdate = document.querySelector('#btnUpdate');

function index() {

    const params = {
        type: "get",
        month: selectMonth.value || thisMonth,
        year: selectYear.value || thisYear,
        _token: csrf,
    };
    $.ajax({
            url: "statistics/request",
            method: "POST",
            data: params,
            beforeSend: function () {
                getDataBtn.innerHTML    = spanSpin;
                revenue.innerHTML       = spanSpin;
                expenses.innerHTML      = spanSpin;
                lastRevenue.innerHTML   = spanSpin;
                lastExpenses.innerHTML  = spanSpin;
                earnings.innerHTML      = spanSpin;
                lastEarnings.innerHTML  = spanSpin;
                tbody.innerHTML         = spanSpin;
            },
            statusCode: {
                404: () => {
                    msgSweetAlert("404");
                },
                500: () => {
                    msgSweetAlert("500");
                },
            },
        })
        .done(function (response) {
            searchData = true;
            if (response.success) {
                tbody.innerHTML = ``;
                const data = response.items;

                if (data.length == 0) {

                    changeDataCard(0, 0, 0, 0);

                    const tr = document.createElement("tr");
                    const td = document.createElement("td");
                    td.innerText = `No data for this search`;
                    tr.append(td);
                    tbody.append(tr);

                } else {

                    data.reverse();
                    data.forEach((element, index) => {
                        appendTableStructure(index + 1, element.links || 0, element.referals || 0, element.pop_ads || 0, element.other_ads || 0, 'create', element.id);
                    });

                    const thisRevenue = data.reduce((acc, item) => acc + item.pop_ads, 0) + data.reduce((acc, item) => acc + item.other_ads, 0);

                    const thisExpenses = data.reduce((acc, item) => acc + item.links, 0) + data.reduce((acc, item) => acc + item.referals, 0);
                    
                    changeDataCard(thisRevenue || 0, thisExpenses || 0, response.lastItems.lastRevenue || 0, response.lastItems.lastExpenses || 0);
                    
                }
            } else {
                msgSweetAlert("error");
            }
        })
        .then(() => {
            getDataBtn.innerHTML = `Get Data`;
        });
}

function add() {
    const links = document.querySelector('#links');
    const referals = document.querySelector('#referals');
    const pop_ads = document.querySelector('#pop_ads');
    const other_ads = document.querySelector('#other_ads');
    const dataToSend = thisMonth < 10 ? '0' + thisMonth : thisMonth;
    const params = {
        type: "post",
        links: links.value || 0,
        referals: referals.value || 0,
        pop_ads: pop_ads.value || 0,
        other_ads: other_ads.value || 0,
        info_date: dataToSend + '-' + thisYear,
        _token: csrf,
    };
    $.ajax({
            url: "statistics/request",
            method: "POST",
            data: params,
            beforeSend: function () {},
            statusCode: {
                404: () => {
                    msgSweetAlert("404");
                },
                500: () => {
                    msgSweetAlert("500");
                },
            },
        })
        .done(function (response) {
            if (response.success) {

                msgSweetAlert("success");
                /**
                 * countItems gets of the view statistics and get the number of items in the table.
                 * and if searchData is false (why the btn getData dont have a click)
                 */
                if (!searchData) {
                    countItems++;
                    appendTableStructure(countItems, links.value || 0, referals.value || 0, pop_ads.value || 0, other_ads.value || 0,  'create', response.id);
                    rechargeDataCard('create', [0], links.value || 0, referals.value || 0, pop_ads.value || 0, other_ads.value || 0);

                }else{
                    alertToRecharge.style.display = 'block';
                }

                if(clearInputs.checked == true){
                    links.value = '';
                    referals.value = '';
                    pop_ads.value = '';
                    other_ads.value = '';
                }

            } else {
                msgSweetAlert("error");
            }
        })
        .then(() => {});
}

function show(value){
    const id        = typeof value == 'number' ? value : value.target.getAttribute('collection');
    const links     = typeof value == 'number' ? value :  value.target.getAttribute('links');
    const referals  = typeof value == 'number' ? value :  value.target.getAttribute('referals');
    const pop_ads   = typeof value == 'number' ? value :  value.target.getAttribute('pop_ads');
    const other_ads = typeof value == 'number' ? value :  value.target.getAttribute('other_ads');
    const day       = typeof value == 'number' ? value :  value.target.getAttribute('day');
    
    const modalTitle = document.querySelector('#modalTitle');
    const editDay = document.querySelector('#editDay');

    const editId = document.querySelector('#editId');
    const editLinks = document.querySelector('#editLinks');
    const editReferals = document.querySelector('#editReferals');
    const editPop_ads = document.querySelector('#editPop_ads');
    const editOther_ads = document.querySelector('#editOther_ads');

    const oldEditLinks = document.querySelector('#oldEditLinks');
    const oldEditReferals = document.querySelector('#oldEditReferals');
    const oldEditPop_ads = document.querySelector('#oldEditPop_ads');
    const oldEditOther_ads = document.querySelector('#oldEditOther_ads');


    editId.value = id;

    editLinks.value = links;
    oldEditLinks.value = links;

    editReferals.value = referals;
    oldEditReferals.value = referals;

    editPop_ads.value = pop_ads;
    oldEditPop_ads.value = pop_ads;

    editOther_ads.value = other_ads;
    oldEditOther_ads.value = other_ads;

    editDay.value = day;
    modalTitle.innerText = `Update day ${day}`;

    $("#editModal").modal("show");

}

function update(){

    const editId = document.querySelector('#editId');
    const editLinks = document.querySelector('#editLinks');
    const editReferals = document.querySelector('#editReferals');
    const editPop_ads = document.querySelector('#editPop_ads');
    const editOther_ads = document.querySelector('#editOther_ads');

    const oldEditLinks = document.querySelector('#oldEditLinks');
    const oldEditReferals = document.querySelector('#oldEditReferals');
    const oldEditPop_ads = document.querySelector('#oldEditPop_ads');
    const oldEditOther_ads = document.querySelector('#oldEditOther_ads');


    const editDay = document.querySelector('#editDay');

    const params = {
        type: "put",
        id: editId.value,
        links: editLinks.value || 0,
        referals: editReferals.value || 0,
        pop_ads: editPop_ads.value || 0,
        other_ads: editOther_ads.value || 0,
        _token: csrf,
    };
    $.ajax({
            url: "statistics/request",
            method: "POST",
            data: params,
            beforeSend: function () {},
            statusCode: {
                404: () => {
                    msgSweetAlert("404");
                },
                500: () => {
                    msgSweetAlert("500");
                },
            },
        })
        .done(function (response) {
            if (response.success) {
                msgSweetAlert("success");

                const oldData = {   'oldEditLinks' : oldEditLinks.value || 0,
                                    'oldEditReferals' : oldEditReferals.value || 0,
                                    'oldEditPop_ads' : oldEditPop_ads.value || 0,
                                    'oldEditOther_ads' : oldEditOther_ads.value || 0,
                                };

                appendTableStructure(editDay.value, editLinks.value || 0, editReferals.value || 0, editPop_ads.value || 0, editOther_ads.value || 0,  'update', `tr-${editId.value}`);
                rechargeDataCard('update', oldData, editLinks.value || 0, editReferals.value || 0, editPop_ads.value || 0, editOther_ads.value || 0);

                $("#editModal").modal("hide");

                

            } else {
                msgSweetAlert("error");
            }
        })
        .then(() => {});
}

function rechargeDataCard(type, old, links, referals, pop_ads, other_ads){
    const expenses = document.querySelector('#expenses');
    const revenue = document.querySelector('#revenue');
    const lastExpenses = expenses.getAttribute('val');
    const lastRevenue = revenue.getAttribute('val');

    let newExpenses = 0;
    let newRevenue = 0;
    let newEarnings = 0;
    if(type == 'create'){

        newExpenses   = parseInt(lastExpenses)+parseInt(links)+parseInt(referals);
        newRevenue    = parseInt(lastRevenue)+parseInt(pop_ads)+parseInt(other_ads);
        newEarnings   = parseInt(newRevenue-newExpenses);

    }else if(type == 'update'){
        newExpenses   = parseInt(lastExpenses)+parseInt(links)+parseInt(referals);
        newExpenses = newExpenses-old.oldEditLinks-old.oldEditReferals;
        newRevenue    = parseInt(lastRevenue)+parseInt(pop_ads)+parseInt(other_ads)-old.oldEditPop_ads-old.oldEditOther_ads;
        newEarnings   = parseInt(newRevenue-newExpenses);

    }

    /**
     * remove the val attribute from the span element and next set the same attribute with the new value
     */
    expenses.removeAttribute('val');
    revenue.removeAttribute('val');
    earnings.removeAttribute('val');

    expenses.setAttribute('val', newExpenses);
    revenue.setAttribute('val', newRevenue);
    earnings.setAttribute('val', newEarnings);
    
    expenses.innerHTML  = newExpenses;
    revenue.innerHTML   = newRevenue;
    earnings.innerHTML  = newEarnings;

    return;
}

function appendTableStructure(countItems, links, referals, pop_ads, other_ads, type, id) {
    let tr;
    if(type == 'update'){
        tr = document.querySelector(`#${id}`);
        tr.innerHTML = '';
        id = id.replace('tr-', '');
    }else if(type == 'create'){
        tr = document.createElement("tr");
        tr.id = `tr-${id}`;
        editId.value = id;
    }


    const tdDay = document.createElement("td");
    tdDay.innerText = `${countItems}`;

    const tdLinks = document.createElement("td");
    tdLinks.innerText = `$${links}`;

    const tdReferals = document.createElement("td");
    tdReferals.innerText = `$${referals}`;

    const tdPop_ads = document.createElement("td");
    tdPop_ads.innerText = `$${pop_ads}`;

    const tdOhter_ads = document.createElement("td");
    tdOhter_ads.innerText = `$${other_ads}`;

    const tdButton = document.createElement("td");

    tdButton.innerHTML = `                                
    <button class="btn btn-primary btnToEdit" 
    collection="${id}"
    links="${links}"
    referals="${referals}"
    pop_ads="${pop_ads}"
    other_ads="${other_ads}"
    day="${countItems}"
    onClick="show(${id})"
    >Edit</button>`;


    tr.append(tdDay);
    tr.append(tdLinks);
    tr.append(tdReferals);
    tr.append(tdPop_ads);
    tr.append(tdOhter_ads);
    tr.append(tdButton);

    if(type == 'update'){
    }else if(type == 'create'){
        tbody.prepend(tr);
    }

    const btnToEdit = document.querySelectorAll('.btnToEdit');
    btnToEdit.forEach(element => {
        element.addEventListener('click', show);
    });
    
    return;

}

function changeDataCard(valRevenue, valExpenses, valLastRevenue, valLastExpenses){

    /**
     * Only when we search new data
     */

    revenue.value       = valRevenue.toFixed(2);
    expenses.value      = valExpenses.toFixed(2);
    lastRevenue.value   = valLastRevenue.toFixed(2);
    lastExpenses.value  = valLastExpenses.toFixed(2);
    earnings.value      = (valRevenue-valExpenses).toFixed(2);
    lastEarnings.value  = (valLastRevenue-valLastExpenses).toFixed(2);

    revenue.innerText       = valRevenue.toFixed(2);
    expenses.innerText      = valExpenses.toFixed(2);
    lastRevenue.innerText   = valLastRevenue.toFixed(2);
    lastExpenses.innerText  = valLastExpenses.toFixed(2);
    earnings.innerHTML      = (valRevenue-valExpenses).toFixed(2);
    lastEarnings.innerHTML  = (valLastRevenue-valLastExpenses).toFixed(2);

}

function infoDates() {
    /**
     * This is only for fill selects for dates
     */
    const month = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    month.forEach(element => {
        const option = document.createElement('option');
        let indexItem = month.indexOf(element) + 1;
        option.value = indexItem < 10 ? `0${indexItem}` : indexItem;
        option.innerText = element[0].toUpperCase() + element.substring(1);
        if(indexItem == thisMonth){
            option.setAttribute('selected', 'true');
        }

        selectMonth.appendChild(option);
    });



}

function msgSweetAlert(value) {
    switch (value) {
        case "500":
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Internal Server Error (500)",
            });
            break;
        case "404":
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Not Found (404)",
            });
            break;
        case "422":
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Unprocessable Content (422)",
            });
            break;
        case "success":
            Swal.fire("Good job!", "Success!", "success");
            break;
        case "deleted":
            Swal.fire("Deleted!", "Your file has been deleted.", "success");
            break;
        case "error":
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong!",
            });
            break;
        default:
            break;
    }
}

infoDates();
clearInputs.checked = true;

btnUpdate.addEventListener('click', update);

btnToEdit.forEach(element => {
    element.addEventListener('click', show);
});


saveData.addEventListener('click', add);
getDataBtn.addEventListener('click', index);

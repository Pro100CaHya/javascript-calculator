const historyWindow = document.querySelector(".history");
const historyTable = document.querySelector(".table__body");

function popupHistory(arg) {

    if (arg) {
        
        historyWindow.classList.remove("history_closed");
        let i = 1;

        for (let key in localStorage) {

            if (!localStorage.hasOwnProperty(key)) {
                continue; 
            }

            historyTable.insertAdjacentHTML("beforeend", 
                                            `<tr class="table__row">
                                                <td class="table__cell">${i}</td>
                                                <td class="table__cell">${key}</td>
                                                <td class="table__cell">` + localStorage.getItem(key) + `</td>
                                            </tr>`);
            i++;

        }

    }
    else {

        historyWindow.classList.add("history_closed");
        clearTableHistory();

    }

}

function clearLocalStorage() {

    localStorage.clear();
    clearTableHistory();

}

function clearTableHistory() {

    while (historyTable.firstChild) {
        historyTable.removeChild(historyTable.firstChild);
    }

}

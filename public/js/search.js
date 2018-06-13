
function searchShows(state) {
    let xhr = new XMLHttpRequest();
    let page = parseInt(document.getElementById('inputDiv').childNodes[1].value);
    if (state === 'next') page++;
    if (state === 'prev') page--;
    document.getElementById('inputDiv').childNodes[1].value = `${page}`;
    let params = `page=${encodeURIComponent(page)}&search=` + encodeURIComponent(document.getElementById('inputDiv').childNodes[5].value);
    xhr.open("GET", '/api/v1/shows?' + params, true);
    xhr.send();

    let showListEle = document.getElementById('showList');
    showListEle.innerHTML = "";

    xhr.onreadystatechange = function() { // (3)
        if (xhr.readyState !== 4) return;
        if (xhr.status === 200) {
            let response = JSON.parse(xhr.responseText);
            response.shows.forEach(it => {
                let showListDiv = document.createElement('div');
                showListDiv.className = 'showsList item animated bounceInUp';
                let div = document.createElement('div');
                div.className = 'd-flex justify-content-between';
                let infoDiv = document.createElement('div');
                infoDiv.className = 'p-2';
                let buttonInfo = document.createElement('button');
                buttonInfo.type = 'button';
                buttonInfo.className = 'btn btn-info btn-md';
                buttonInfo.style.width = '38px';
                let iInfo = document.createElement('i');
                iInfo.className = 'fa fa-pencil-square-o';
                buttonInfo.appendChild(iInfo);
                infoDiv.appendChild(buttonInfo);
                div.appendChild(infoDiv);

                let nameDiv = document.createElement('div');
                nameDiv.className = 'p-2';
                let nameA = document.createElement('a');
                nameA.setAttribute('href', `/shows/${it._id}`);
                let nameH3 = document.createElement('h3');
                nameH3.setAttribute('align', 'center');
                nameH3.innerText = it.name;
                nameA.appendChild(nameH3);
                nameDiv.appendChild(nameA);
                div.appendChild(nameDiv);

                let delDiv = document.createElement('div');
                delDiv.className = 'p-2';
                let buttonDel = document.createElement('button');
                buttonDel.type = 'button';
                buttonDel.className = 'btn btn-search btn-md';
                buttonDel.setAttribute("data-toggle", "modal");
                buttonDel.setAttribute("data-target", "#confirmDelete");
                buttonDel.setAttribute('onclick','setIdToModal(this.value)');
                buttonDel.value = `${it._id}`;
                let iDel = document.createElement('i');
                iDel.className = 'fa fa-trash-o';
                buttonDel.appendChild(iDel);
                delDiv.appendChild(buttonDel);
                div.appendChild(delDiv);

                let imageA = document.createElement('a');
                imageA.setAttribute('href', `/shows/${it._id}`);
                let img = document.createElement('img');
                img.setAttribute('src', it.image);
                img.style.borderRadius = '30%';
                img.style.width = '100%';
                imageA.appendChild(img);

                let pDescr = document.createElement('p');
                pDescr.className = 'description';
                pDescr.innerText = it.description;

                showListDiv.appendChild(div);
                showListDiv.appendChild(imageA);
                showListDiv.appendChild(pDescr);
                showListEle.appendChild(showListDiv);
            });
            let paginDiv = document.createElement('div');
            paginDiv.className = 'pagination item animated bounceInUp';

            if (response.prev) {
                let prevDiv = document.createElement('div');
                prevDiv.className = 'prev';

                let prevButton = document.createElement('button');
                prevButton.className = 'btn btn-search';
                prevButton.type = 'button';
                prevButton.setAttribute('onclick', 'searchShows(\'prev\')');
                prevButton.innerHTML = '&larr;Previous';
                
                prevDiv.appendChild(prevButton);
                paginDiv.appendChild(prevDiv);
            }
            
            if (response.next) {
                let nextDiv = document.createElement('div');
                nextDiv.className = 'next';
                nextDiv.style.position = 'absolute';
                nextDiv.style.right = '0';

                let nextButton = document.createElement('button');
                nextButton.className = 'btn btn-search';
                nextButton.type = 'button';
                nextButton.setAttribute('onclick', 'searchShows(\'next\')');
                nextButton.innerHTML = 'Next &rarr;';

                nextDiv.appendChild(nextButton);
                paginDiv.appendChild(nextDiv);
            }
            showListEle.appendChild(paginDiv);

        }else if (xhr.status === 404) {
            let h3 = document.createElement('h3');
            h3.className = 'notFound item animated bounceInUp';
            h3.innerText = 'NOT FOUND';
            showListEle.appendChild(h3);
        }
    }
}

function setIdToModal(id) {
    document.getElementById('deleteButton').value = id;
    document.getElementById('userDeleteButton').value = id;
}

function deleteShow(id) {
    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", '/api/v1/shows/' + id, true);
    xhr.send();

    xhr.onreadystatechange = function() { // (3)
        if (xhr.readyState !== 4) return;
        if (xhr.status === 200) {
            searchShows();
        }
    }
}

function saveToUserList(show_id) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", '/users/profile/' + show_id, true);
    xhr.send();
    xhr.onreadystatechange = function() { // (3)
        if (xhr.readyState !== 4) return;
        if (xhr.status === 200) {
            let inputDiv = document.getElementById(`buttons-${show_id}`);
            inputDiv.innerHTML = "";

            let buttonDelFromList = document.createElement('button');
            buttonDelFromList.type = 'button';
            buttonDelFromList.className = 'btn btn-danger btn-md';
            buttonDelFromList.value = `${show_id}`,
                buttonDelFromList.setAttribute('onclick', `deleteFromUserList(this.value)`);
            let iDelFromList = document.createElement('i');
            iDelFromList.className = 'fa fa-times';
            buttonDelFromList.appendChild(iDelFromList);
            inputDiv.appendChild(buttonDelFromList);
        }
    }
}

function deleteFromUserList(show_id) {
    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", '/users/profile/' + show_id, true);
    xhr.send();
    xhr.onreadystatechange = function() { // (3)
        if (xhr.readyState !== 4) return;
        if (xhr.status === 200) {
            let inputDiv = document.getElementById(`buttons-${show_id}`);
            inputDiv.innerHTML = "";

            let buttonAddToList = document.createElement('button');
            buttonAddToList.type = 'button';
            buttonAddToList.className = 'btn btn-warning btn-md';
            buttonAddToList.value = `${show_id}`;
            buttonAddToList.setAttribute('onclick', `saveToUserList(this.value)`);
            let iDelFromList = document.createElement('i');
            iDelFromList.className = 'fa fa-star-o';
            buttonAddToList.appendChild(iDelFromList);
            inputDiv.appendChild(buttonAddToList);
        }
    }
}

$(document).ready(() => {
    $('#deleteButton').click(function () {
        let number = $(this).val();
        $.ajax({
            url: '/api/v1/shows/' + number,
            type: "DELETE",
            success: function () {
                $("#shows #" + number).empty();
            }
        })
    });
    $('#userDeleteButton').click(function () {
        let number = $(this).val();
        $.ajax({
            url: '/api/v1/users/' + number,
            type: "DELETE",
            success: function () {
                console.log($("#" + number));
                $("#users #" + number).empty();
            }
        })
    });
})

function deleteFromList(id) {

}
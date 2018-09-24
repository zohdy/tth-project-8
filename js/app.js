class Employee {
    constructor(first, last, email, city, state, street, postcode, cell, dob, picture){
        this.first = first;
        this.last = last;
        this.email = email;
        this.city = city;
        this.state = state;
        this.street = street;
        this.postcode = postcode;
        this.cell = cell;
        this.dob = dob;
        this.picture = picture;
    }
    get fullName(){
        return this.first + ' ' + this.last;
    }
    get detailedAddress(){
        return this.street + ', ' + this.state + ' ' + this.postcode;
    }
    capitalize(){
        this.first = toTitleCase(this.first);
        this.last = toTitleCase(this.last);
        this.street = toTitleCase(this.street);
        this.state = toTitleCase(this.state);
        this.city = toTitleCase(this.city);
    }
    formatDateOfBirth(){
        let currentDob = new Date(this.dob);

        let date = currentDob.getDate();
        let month = currentDob.getMonth() + 1;
        let year = currentDob.getFullYear();

        // Month and day Pad
        if(month < 10) { month = '0' + month; }
        if(date < 10) { date = '0' + date; }

        // Formats to MM/DD/YY
        this.dob = date + "/" + month + "/" + year.toString().slice(2);
    }
}

/************************************************
                    FETCH
 ************************************************/
const numOfEmployees = 12;
const app = [];

fetchData(`https://randomuser.me/api/?results=${numOfEmployees}&nat=us&inc=name,email,location,picture,cell,dob`)
    .then(data => generateEmployees(data.results))
    .then(() => formatEmployeeData())
    .then(() => createDOMElements())
    .then(() => setupEventListeners());


function fetchData(url) {
    return fetch(url)
        .then(checkStatus)
        .then(res => res.json())
        .catch(error => console.log(error));
}

function checkStatus(response){
    if(response.ok){
        return Promise.resolve(response);
    } else {
        return Promise.reject(new Error(response.statusText));
    }
}

function generateEmployees(results){
    results.forEach(result => {
        app.push(new Employee(
            result.name.first,
            result.name.last,
            result.email,
            result.location.city,
            result.location.state,
            result.location.street,
            result.location.postcode,
            result.cell,
            result.dob.date,
            result.picture.large
        ));
    });
}
function formatEmployeeData() {
    app.forEach(employee => {
        employee.capitalize();
        employee.formatDateOfBirth();
    });
}

/************************************************
                    HELPERS
 ************************************************/
// Returns first letter as Capitalized for each word
function toTitleCase(str) {
    str = str.toLowerCase()
        .split(' ')
        .map((str) => str.charAt(0).toUpperCase() + str.substring(1))
        .join(' ');
    return str;
}

/************************************************
                        DOM
 ************************************************/
function createDOMElements() {
    const cardUl = document.querySelector('.employee-cards');
    for(let i = 0; i < app.length; i++){
        let li = document.createElement('li');
        let card = document.createElement('div');
        card.setAttribute('class', 'card-item');
        card.setAttribute('data-index', [i]);
        li.appendChild(card);
        cardUl.appendChild(li);

        addMarkup(i);
        card.innerHTML = addMarkup(i);
    }
}

function addMarkup(index) {
        return `
            <img src="${app[index].picture}">
            <div class="info">
                <p class="name info-text">${app[index].fullName}</p>
                <p class="email info-text">${app[index].email}</p>
                <p class="city info-text">${app[index].city}</p>
            </div>
            <div class="detailed-info">
                <p class="detailed-address">${app[index].detailedAddress}</p>
                <p class="phone">${app[index].cell}</p>
                <p class="dob">Birthday: ${app[index].dob}</p>
            </div>
        `;
}

function displayModal(index) {
    const modal = document.querySelector('.modal');
    const modalContent = document.querySelector('.modal-content');

    modalContent.innerHTML = addMarkup(index);
    modal.style.display = 'block';
}

/************************************************
                     SEARCH
 ************************************************/
function filterEmployees(userInput) {
    let cardList = document.querySelectorAll('.employee-cards li');

    for(let i = 0; i < cardList.length; i++){
        if(app[i].fullName.toLowerCase().includes(userInput)){
            cardList[i].style.display ='block';
        } else {
            cardList[i].style.display ='none';
        }
    }
}


/************************************************
                    EVENTS
 ************************************************/
function setupEventListeners(){
    let index;
    let maxIndex = document.querySelectorAll('.card-item').length - 1;

    // TODO Find to make the LI itself clickable and ignore its nested elements
    document.querySelector('.employee-cards').addEventListener('click', (e) => {
        console.log(e.target);
        if(e.target.className === 'card-item') {
            index = e.target.dataset.index;
            displayModal(index);
        } else if (e.target.tagName === 'IMG' || e.target.className === 'info') {
            index = e.target.parentElement.dataset.index;
            displayModal(index);
        } else if (e.target.classList.contains('info-text')) {
            index = e.target.parentElement.parentElement.dataset.index;
            displayModal(index);
        }
    });

    // Left/Right buttons wraps around
    document.querySelector('.right-arrow').addEventListener('click', () => {
        index++;
        if(index > maxIndex){
            index = 0;
        }
        displayModal(index);
    });
    document.querySelector('.left-arrow').addEventListener('click', () => {
        index--;
        if(index < 0){
            index = maxIndex;
        }
        displayModal(index);
    });

    // Click anywhere outside of Modal content to close it
    window.addEventListener('click', e => {
        if(e.target === document.querySelector('.modal')) {
            e.target.style.display = 'none';
        }
    });
    document.querySelector('.search-field').addEventListener('keyup', (e) => {
        let userInput = e.target.value.toLowerCase();
        filterEmployees(userInput);
    });
}

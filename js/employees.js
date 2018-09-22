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
const employees = [];

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
        employees.push(new Employee(
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
    employees.forEach(employee => {
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
    const container = document.querySelector('.container');
    const ul = document.createElement('ul');

    container.appendChild(ul);
    for(let i = 0; i < employees.length; i++){
        let div = document.createElement('div');
        let li = document.createElement('li');

        div.setAttribute('class', 'employee-card');
        div.setAttribute('data-index', [i]);
        li.appendChild(div);
        ul.appendChild(li);

        addMarkup(i);
        div.innerHTML = addMarkup(i);
    }
}

function addMarkup(index) {
        return `
            <img src="${employees[index].picture}">
            <h3 class="name">${employees[index].fullName}</h3>
            <p class="email">${employees[index].email}</p>
            <p class="city">${employees[index].city}</p>
            <div class="detailed-info">
                <hr />
                <p class="detailed-address">${employees[index].detailedAddress}</p>
                <p class="phone">${employees[index].cell}</p>
                <p class="dob">Birthday:${employees[index].dob}</p>
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
    let listOfCards = document.querySelectorAll('ul li');

    for(let i = 0; i < listOfCards.length; i++){
        if(employees[i].fullName.toLowerCase().includes(userInput)){
            listOfCards[i].style.display ='block';
        } else {
            listOfCards[i].style.display ='none';
        }
    }
}


/************************************************
                    EVENTS
 ************************************************/
function setupEventListeners(){
    let index;
    let maxIndex = employees.length - 1;

    document.querySelector('ul').addEventListener('click', (e) => {
        if(e.target.tagName === 'DIV'){
            index = e.target.dataset.index;
            displayModal(index);
        } else if(
            e.target.tagName === 'IMG' ||
            e.target.tagName === 'H3' ||
            e.target.tagName === 'P') {
            index = e.target.parentElement.dataset.index;
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

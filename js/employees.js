class Employee {
    constructor(first, last, email, city, phone, street, dob, picture){
        this.first = first;
        this.last = last;
        this.email = email;
        this.city = city;
        this.phone = phone;
        this.street = street;
        this.dob = dob;
        this.picture = picture;
    }
    get fullName(){
        return this.first + ' ' + this.last;
    }
    formatName(){
        this.first = toTitleCase(this.first);
        this.last = toTitleCase(this.last);
    }
    formatCity(){
        this.city = toTitleCase(this.city);
    }
    formatDob(){
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
const numOfEmployees = 12;
const employees = [];

/************************
    FETCH FUNCTIONS
 ***********************/
function fetchData(url) {
    return fetch(url)
        .then(checkStatus)
        .then(res => res.json())
        .catch(error => console.log(error));
}
fetchData(`https://randomuser.me/api/?results=${numOfEmployees}&nat=us&inc=name,email,location,picture,phone,dob`)
    .then(data => generateEmployees(data.results))
    .then(() => formatEmployeeData())
    .then(() => createDOMElements())
    .then(() => addEmployeeToDOM())
    .then(() => setupEventListeners());


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
            result.phone,
            result.location.street,
            result.dob.date,
            result.picture.large
        ));
    });
}

/************************
     HELPER FUNCTIONS
 ***********************/

function formatEmployeeData() {
    employees.forEach(employee => {
        employee.formatName();
        employee.formatDob();
        employee.formatCity();
    });
}

// Returns first letter as Capitalized for each word
function toTitleCase(str) {
    str = str.toLowerCase()
        .split(' ')
        .map((str) => str.charAt(0).toUpperCase() + str.substring(1))
        .join(' ');
    return str;
}

/************************
    DOM FUNCTIONS
 ***********************/
const container = document.querySelector('.container');
const ul = document.createElement('ul');
const modal = document.querySelector('.modal');
const modalContent = document.querySelector('.modal-content');


function createDOMElements() {
    container.appendChild(ul);
    employees.forEach(() => {
        let div = document.createElement('div');
        let li = document.createElement('li');
        div.setAttribute('class', 'item-container');
        li.appendChild(div);
        ul.appendChild(li);
    });
}
function addEmployeeToDOM() {
    const div = document.querySelectorAll('.item-container');
    let img, name, email, city, phone, street, dob;

    for (let i = 0; i < employees.length; i++) {
        img = document.createElement('img');
        name = document.createElement('h3');
        email = document.createElement('a');
        city = document.createElement('p');
        phone = document.createElement('a');
        street = document.createElement('a');
        dob = document.createElement('p');

        img.setAttribute('src', employees[i].picture);

        name.setAttribute('class', 'name');
        name.innerHTML = employees[i].fullName;

        email.setAttribute('class', 'email');
        email.innerHTML = employees[i].email;

        city.setAttribute('class', 'city');
        city.innerHTML = employees[i].city;

        div[i].append(img, name, email, city);

        // Only display these in the Modal popup
        const extraInfo = document.createElement('div');
        extraInfo.setAttribute('class', 'extra-info');
        extraInfo.style.display = 'none';

        phone.setAttribute('class', 'phone');
        phone.innerHTML = employees[i].phone;

        street.setAttribute('class', 'street');
        street.innerHTML = employees[i].street;

        dob.setAttribute('class', 'dob');
        dob.innerHTML = employees[i].dob;

        extraInfo.append(phone, street, dob);

        div[i].append(extraInfo);
    }
}


function displayModal(content) {

    modal.style.display = 'block';

    // Inherit the html elements from the 'item-container' div
    modalContent.innerHTML = content;

    // Display the extra info when modal is active
    modalContent.childNodes[4].style.display = 'block'; // 'extra-info' class

    // Show the modal overlay
    document.querySelector('.modal').style.display = 'block';
}

/************************
 EVENT LISTENERS
 ***********************/
let clicked;
let next;
let previous;

function setupEventListeners(){
    ul.addEventListener('click', (e) => {
        if (e.target.tagName === 'DIV') {
            clicked = e.target.innerHTML;
            if(e.target.parentElement.nextSibling !== null){
                next = e.target.parentElement.nextSibling.childNodes[0].innerHTML;
            }
            if(e.target.parentElement.previousSibling !== null){
                previous = e.target.parentElement.previousSibling.childNodes[0].innerHTML;
            }
        } else if(
            e.target.tagName === 'IMG' ||
            e.target.tagName === 'P' ||
            e.target.tagName === 'H3') {
            clicked = e.target.parentElement.innerHTML;
                if(e.target.parentElement.parentElement.nextSibling !== null){
                    next = e.target.parentElement.parentElement.nextSibling.childNodes[0].innerHTML;
                }
                if(e.target.parentElement.parentElement.previousSibling !== null){
                    previous = e.target.parentElement.parentElement.previousSibling.childNodes[0].innerHTML;
                }
        }
        displayModal(clicked);
    });

    // Modal Navigation
    document.querySelector('.right-arrow').addEventListener('click',(e) => {
        displayModal(next);
    });

    document.querySelector('.left-arrow').addEventListener('click',(e) => {
        displayModal(previous);
    });


    // Click anywhere outside of Modal content to close it
    window.addEventListener('click', e => {
        if(e.target === document.querySelector('.modal')) {
            e.target.style.display = 'none';
        }
    });
}

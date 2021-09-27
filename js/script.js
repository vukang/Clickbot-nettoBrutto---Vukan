'use strict';

// status helperVariable
let rowCreatedStatus = false;

const headerEl = document.querySelector('header');
const orderedList = document.querySelector('ol');

// Country data loading logic
const datalistSet = document.getElementById('countries');

const allCountriesCodes = [];
const euroCountries = [];
async function getAllCountriesAndPopulate() {
  fetch('https://restcountries.eu/rest/v2/regionalbloc/eu')
    .then((res) => res.json())
    .then((data) =>
      data.forEach((country) => {
        euroCountries.push(country.alpha2Code);
      })
    )
    .finally(() => {
      // show countries loaded
      const infoMsg = `<p class="centering">Fetched resources for ${
        euroCountries.length - 1
      } EU countries</p>`;
      headerEl.insertAdjacentHTML('afterend', infoMsg);
    });
  // incl. USA
  euroCountries.push('US');

  fetch('https://restcountries.eu/rest/v2/all')
    .then((resp) => resp.json())
    .then((data) => {
      console.log(data.length);
      data.forEach((country) => {
        allCountriesCodes.push(country.alpha2Code);
      });

      const htmlOptionTagsArray = allCountriesCodes.sort().map((countryCode) => {
        return `<option value="${countryCode}">${countryCode}</option>`;
      });

      htmlOptionTagsArray.forEach((tag) => {
        datalistSet.insertAdjacentHTML('beforeend', tag);
      });
    })
    .finally(() => {
      // show countries loaded
      const infoMsg = `<p class="centering">Fetched resources for ${allCountriesCodes.length} World countries</p>`;
      headerEl.insertAdjacentHTML('afterend', infoMsg);
    });
}
getAllCountriesAndPopulate();

// ------------------------------------------

// set All eventHandlers
function queryAllAndSetHandlers() {
  // get all li rows
  const liNodes = document.querySelectorAll('li');
  liNodes.forEach((li) => {
    // set handler for netto2brutto
    li.children[3].addEventListener('keyup', nettoHandler);

    // set handler for brutto2netto
    li.children[4].addEventListener('keyup', bruttoHandler);

    // set handler for country (calcSteuer, creates new row and sets markierung)
    li.children[1].addEventListener('keyup', kundeHandler);

    // set handler for removeRow click
    li.children[5].addEventListener('click', delItemHandler);
  });
}
queryAllAndSetHandlers();

// Handlers & their logic
function nettoHandler(event) {
  const target = event.target;
  // get nettoInput
  const netto = Math.abs(Number(target.value));

  // get steuer
  const steuer = parseFloat(target.parentElement.previousElementSibling.textContent);
  console.log(steuer);

  const percentage = steuer / 100 + 1;

  // calc and set brutto
  target.parentElement.nextElementSibling.childNodes[1].value =
    (netto * percentage).toFixed(2) * 1;
}

function bruttoHandler(event) {
  rowCreatedStatus = false;
  const target = event.target;
  // get bruttoInput
  const brutto = Math.abs(Number(target.value));

  // get steuer
  const steuerNum = parseFloat(
    target.parentElement.previousElementSibling.previousElementSibling.textContent
  );

  const percentage = steuerNum / 100 + 1;

  // calc set netto
  target.parentElement.previousElementSibling.childNodes[1].value =
    (brutto / percentage).toFixed(2) * 1;
}

function kundeHandler(event) {
  //   KundeFeld
  const target = event.target;
  //   countryFeld divParent
  const parent = target.parentElement;

  // get Lager Standort
  const lagerOrt = parent.previousElementSibling.childNodes[1].value;

  //   get KundeLand
  const inputKundeAlphaStr = target.value.toUpperCase();

  // get steuer
  const steuerFeld = parent.nextElementSibling;

  //   get markierung
  const mark =
    steuerFeld.nextElementSibling.nextElementSibling.nextElementSibling.childNodes[1];

  if (!allCountriesCodes.includes(inputKundeAlphaStr)) {
    steuerFeld.nextElementSibling.childNodes[1].setAttribute('disabled', 'true');
    steuerFeld.nextElementSibling.nextElementSibling.childNodes[1].setAttribute(
      'disabled',
      'true'
    );
    return;
  }
  steuerFeld.nextElementSibling.childNodes[1].removeAttribute('disabled', 'true');
  steuerFeld.nextElementSibling.nextElementSibling.childNodes[1].removeAttribute(
    'disabled',
    'true'
  );

  switch (lagerOrt) {
    case 'de':
      if (inputKundeAlphaStr === 'DE') {
        steuerFeld.textContent = 19;
        mark.textContent = 'DE zu DE';
        break;
      }
      if (euroCountries.includes(inputKundeAlphaStr)) {
        inputKundeAlphaStr === 'US'
          ? (mark.textContent = '☑️ in USA')
          : (mark.textContent = '☑️ in EU');
        steuerFeld.textContent = 0;
      } else {
        mark.textContent = '';
        steuerFeld.textContent = 19;
      }
      break;
    case 'ch':
      steuerFeld.textContent = 7.7;
      break;
    default:
  }

  createNewRow();
}

function delItemHandler(event) {
  if (event.target.classList.contains('delBtn')) {
    event.target.parentElement.parentElement.remove();
  }
}

function createNewRow() {
  if (rowCreatedStatus) return;

  const rowTemplate = `
          <li> 
              <div class="item">
                  <select name='Lager' tabindex="0" autofocus >
                      <option value="de">DE</option>
                      <option value="ch">CH</option>
                  </select></div>
              <div class="item">
                  <input list="countries" class="cntryLst"  maxlength="2"  title="max. 2 chars = alpha2code">
                  <datalist id="countries">
  
                  </datalist>
  
              </div>
              <div class="item">
                  <div class="outputBox steuerField" >%</div>
              </div>
              <div class="item">
                  <input type="number" placeholder="netto (€)" class="inputField nettoField" disabled >
              </div>
              <div class="item">
                  <input type="number" placeholder="brutto (€)"  class="inputField bruttoField" disabled>
              </div>
              <div class="item">
                  <div class=" markierungsField"></div>
              <div class="delBtn" onclick="delItemHandler">❎</div>
          </li>   
      `;
  orderedList.insertAdjacentHTML('beforeend', rowTemplate);

  rowCreatedStatus = true;
  queryAllAndSetHandlers();
}

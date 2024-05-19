import axios from 'axios';

// TODO: Correct keyboard focus, and focus trap

//----------------------------------------------------------------------
// STATE
//----------------------------------------------------------------------

const API_KEY = 'fca_live_9yWcaJ8XzcMUnwWXMLF0GHVLBVAnl3ROKuSUdu4Q';
// const API_LATEST = 'https://api.freecurrencyapi.com/v1/latest';
const API_CURRENCIES = `https://api.freecurrencyapi.com/v1/currencies?apikey=`;

const state = {
    openedDrawer: null,
    currencies: [],
    filteredCurrencies: [],
};

//----------------------------------------------------------------------
// DOM SELECTORS
//----------------------------------------------------------------------

const ui = {
    controls: document.getElementById('controls'),
    drawer: document.getElementById('drawer'),
    dismissBtn: document.getElementById('dismiss-btn'),
    currencyList: document.getElementById('currency-list'),
};

//----------------------------------------------------------------------
// EVENT LISTENERS
//----------------------------------------------------------------------

const setupEventListeners = () => {
    document.addEventListener('DOMContentLoaded', initApp);
    ui.controls.addEventListener('click', showDrawer);
    ui.dismissBtn.addEventListener('click', hideDrawer);
};

//----------------------------------------------------------------------
// EVENT HANDLERS
//----------------------------------------------------------------------

const initApp = () => {
    setupEventListeners();
    fetchCurrencies();
};

const showDrawer = event => {
    // Checks if the clicked element has the data-drawer attribute
    // isolates the button inside the controls as the clickable elements
    if (event.target.hasAttribute('data-drawer')) {
        // Sets the openedDrawer state to the id of the clicked button
        // This is either 'base' or 'target'
        state.openedDrawer = event.target.id;
        ui.drawer.classList.add('show');
    }
};
const hideDrawer = event => {
    // Resets the openedDrawer state to null
    state.openedDrawer = null;
    ui.drawer.classList.remove('show');
};

//----------------------------------------------------------------------
// RENDER FUNCTIONS
//----------------------------------------------------------------------

const renderCurrencies = () => {
    // map over the currencies array and create a list item for each currency
    // destructuring the code and name from each currency object
    ui.currencyList.innerHTML = state.currencies
        .map(({ code, name }) => {
            return `
            <li data-code="${code}">
                <img src="${getImageURL(code)}" alt="${name}" />
                <div>
                    <h4>${code}</h4>
                    <p>${name}</p>
                </div>
            </li>`;
        })
        .join('');
};

//----------------------------------------------------------------------
// HELPER FUNCTIONS
//----------------------------------------------------------------------

const getImageURL = code => {
    const flag =
        'https://wise.com/public-resources/assets/flags/rectangle/{code}.png';
    // replace the {code} placeholder in the URL with the lowercase currency code
    return flag.replace('{code}', code.toLowerCase());
};

//----------------------------------------------------------------------
// API FUNCTIONS
//----------------------------------------------------------------------

const fetchCurrencies = async () => {
    try {
        // 1 - Wait for fetch call (which is a promise)
        let response = await fetch(`${API_CURRENCIES}${API_KEY}`);
        // 2 - Check for HTTP errors
        if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
        // 3 - Wait for the conversion of the response to JSON
        // and destructure the data object from the response
        const { data } = await response.json();
        // 4 - Do something with the data
        // add the values of the data object to the currencies array in the state
        state.currencies = Object.values(data);
        console.log(state.currencies);
        renderCurrencies();
    } catch (error) {
        console.error(error);
    }
};

//----------------------------------------------------------------------
// INITIALIZATION
//----------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

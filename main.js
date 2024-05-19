// TODO: Correct keyboard focus, and focus trap

//----------------------------------------------------------------------
// STATE
//----------------------------------------------------------------------

const API_KEY = 'fca_live_9yWcaJ8XzcMUnwWXMLF0GHVLBVAnl3ROKuSUdu4Q';
const API_LATEST = `https://api.freecurrencyapi.com/v1/latest?apikey=`;
const API_CURRENCIES = `https://api.freecurrencyapi.com/v1/currencies?apikey=`;

const state = {
    openedDrawer: null,
    currencies: [],
    filteredCurrencies: [],
    base: 'USD',
    target: 'EUR',
    rates: {},
};

//----------------------------------------------------------------------
// DOM SELECTORS
//----------------------------------------------------------------------

const ui = {
    controls: document.getElementById('controls'),
    drawer: document.getElementById('drawer'),
    dismissBtn: document.getElementById('dismiss-btn'),
    currencyList: document.getElementById('currency-list'),
    searchInput: document.getElementById('search'),
    baseBtn: document.getElementById('base'),
    targetBtn: document.getElementById('target'),
    exchangeRate: document.getElementById('exchange-rate'),
};

//----------------------------------------------------------------------
// EVENT LISTENERS
//----------------------------------------------------------------------

const setupEventListeners = () => {
    document.addEventListener('DOMContentLoaded', initApp);
    ui.controls.addEventListener('click', showDrawer);
    ui.dismissBtn.addEventListener('click', hideDrawer);
    ui.searchInput.addEventListener('input', filterCurrencies);
    ui.currencyList.addEventListener('click', selectPair);
};

//----------------------------------------------------------------------
// EVENT HANDLERS
//----------------------------------------------------------------------

const initApp = () => {
    setupEventListeners();
    fetchCurrencies();
    fetchExchangeRate();
};

// **** Currencies list related functions

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
    // Clears the search input when the drawer is closed
    clearSearchInput();
    // Resets the openedDrawer state to null
    state.openedDrawer = null;
    ui.drawer.classList.remove('show');
};

const filterCurrencies = () => {
    // get the value of the search input and remove any leading or trailing whitespace
    const keyword = ui.searchInput.value.trim().toLowerCase();
    // filter the available currencies array (minus base and target) based on the keyword
    // and add the filtered currencies to the filteredCurrencies array in the state
    state.filteredCurrencies = getAvailableCurrencies().filter(
        ({ code, name }) => {
            return (
                // check if the currency code or name includes the keyword
                code.toLowerCase().includes(keyword) ||
                name.toLowerCase().includes(keyword)
            );
        },
    );
    // render the filtered currencies
    renderCurrencies();
};

const selectPair = event => {
    // Click on currency in list
    // CSS removes pointer events from child elements (img, h, p, div)
    // check if the clicked element is an li element with the data-code attribute
    if (event.target.hasAttribute('data-code')) {
        // destructure the openedDrawer state from the state object
        const { openedDrawer } = state;
        // Update openedDrawer state with the selected currency code
        // This is either 'base' or 'target' based on the button clicked
        state[openedDrawer] = event.target.dataset.code;
        // Update corresponding button with the selected currency code
        [ui.baseBtn, ui.targetBtn].forEach(btn => {
            // btn.id is either 'base' or 'target'
            const code = state[btn.id];
            // Set the text content and background image of the button
            // The one selected will be updated (base or target)
            // The other will remain the same
            btn.textContent = code;
            btn.style.setProperty('--image', `url(${getImageURL(code)})`);
        });
        // close the drawer after selecting a currency
        hideDrawer();
    }
};

//----------------------------------------------------------------------
// RENDER FUNCTIONS
//----------------------------------------------------------------------

// **** Currencies list related functions

const renderCurrencies = () => {
    // map over the filteredCurrencies array and create a list item for each currency
    // destructuring the code and name from each currency object
    ui.currencyList.innerHTML = state.filteredCurrencies
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

const updateExchangeRate = () => {
    const { base, target, rates } = state;
    console.log(rates);
    const rate = rates[base][target].toFixed(4);
    console.log(rate);
    ui.exchangeRate.textContent = `1 ${base} = ${rate} ${target}`;
};

// **** Currencies list related functions

const getAvailableCurrencies = () => {
    // filter the currencies array to exclude the base and target currencies
    return state.currencies.filter(({ code }) => {
        // return currencies that are not the base or target currency
        return state.base !== code && state.target !== code;
    });
};

// FN: Used to clear the search input when the drawer is closed
const clearSearchInput = () => {
    ui.searchInput.value = '';
    // Use dispatchEvent because the input event is not triggered by the value property
    ui.searchInput.dispatchEvent(new Event('input'));
};

// FN: Used to get the image URL for the currency flag when ren
const getImageURL = code => {
    const flag =
        'https://wise.com/public-resources/assets/flags/rectangle/{code}.png';
    // replace the {code} placeholder in the URL with the lowercase currency code
    return flag.replace('{code}', code.toLowerCase());
};

//----------------------------------------------------------------------
// API FUNCTIONS
//----------------------------------------------------------------------

// **** Currencies list related functions

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
        // Add the currencies (not including base and target) to the filteredCurrencies array
        // because initially, the filteredCurrencies array is empty
        state.filteredCurrencies = getAvailableCurrencies();
        // render the currencies
        renderCurrencies();
    } catch (error) {
        console.error(error);
    }
};

const fetchExchangeRate = async () => {
    // destructure the base currency from the state
    const { base } = state;
    try {
        // fetch the latest exchange rates for the base currency
        let response = await fetch(
            `${API_LATEST}${API_KEY}&base_currency=${base}`,
        );
        if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
        const { data } = await response.json();
        // Add the exchange rates to the rates object in the state
        // Creates an object with the base currency as the key
        // i.e. { USD: { EUR: 0.85, GBP: 0.75, ... } }
        state.rates[base] = data;
        // update the exchange rate text
        updateExchangeRate();
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

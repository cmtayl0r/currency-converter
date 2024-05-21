// TODO: Restructure HTML and CSS for control currency button/dropdown to have hover/active states
// TODO: Correct keyboard focus, and focus trap
// TODO: Add ARIA attributes for accessibility
// TODO: Convert into ES6 classes and modules (branch)
// TODO: Convert structure into a MVC pattern (branch)

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
    baseValue: 1,
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
    baseInput: document.getElementById('base-input'),
    targetInput: document.getElementById('target-input'),
    swapBtn: document.getElementById('swap-btn'),
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
    ui.baseInput.addEventListener('change', convertInput); // input and press enter
    ui.swapBtn.addEventListener('click', switchPair);
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

// FN: Show drawer when button is clicked
// Used by: controls.addEventListener('click', showDrawer)
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

// FN: Hide drawer when button is clicked
// Used by: dismissBtn.addEventListener('click', hideDrawer)
const hideDrawer = event => {
    // Clears the search input when the drawer is closed
    clearSearchInput();
    // Resets the openedDrawer state to null
    state.openedDrawer = null;
    ui.drawer.classList.remove('show');
};

// FN: Filter currencies based on search input (in drawer view)
// Used by: searchInput.addEventListener('input', filterCurrencies)
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

// FN: Select currency pair from the drawer
// Used by: currencyList.addEventListener('click', selectPair)
const selectPair = event => {
    // Click on currency in selection list
    // CSS removes pointer events from child elements (img, h, p, div)
    // check if the clicked element is an li element with the data-code attribute
    if (event.target.hasAttribute('data-code')) {
        //01 - destructure the openedDrawer state from the state object
        const { openedDrawer } = state;

        // 02 - Update openedDrawer state with the selected currency code
        // This is either 'base' or 'target' based on the button clicked
        state[openedDrawer] = event.target.dataset.code;

        // 03 - Load the exchange rate from selection then update the buttons
        loadExchangeRate();
        // loadExchangeRate() > displayConversion() > updateButtons() > updateInputs() > updateExchangeRate()

        // 04 - close the drawer after selecting a currency
        hideDrawer();
    }
};

// **** Main conversion related functions

// FN: Change base value number via base input
const convertInput = () => {
    // update the base value in the state with the base input value
    state.baseValue = parseFloat(ui.baseInput.value) || 1;
    // update the exchange rate display in the UI
    loadExchangeRate();
    // loadExchangeRate() > displayConversion() > updateButtons() > updateInputs() > updateExchangeRate()
};

// FN: Switch base and target currencies
// Used by: swapBtn.addEventListener('click', switchPair)
const switchPair = () => {
    // swap the base and target currencies in the state
    const { base, target } = state;
    // set the base currency to the target currency
    state.base = target;
    // set the target currency to the base currency
    state.target = base;
    // update the base value in the state with the new base input value
    state.baseValue = parseFloat(ui.targetInput.value) || 1;
    // update the exchange rate display in the UI
    loadExchangeRate();
    // loadExchangeRate() > displayConversion() > updateButtons() > updateInputs() > updateExchangeRate()
};

//----------------------------------------------------------------------
// RENDER FUNCTIONS
//----------------------------------------------------------------------

// **** Currencies list related functions

// FN: Render the currencies in the drawer
// Used by: fetchCurrencies(), filterCurrencies()
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

// **** Main conversion and exchange rate related functions

// FN: Display the conversion in the UI
// Used by: loadExchangeRate(), convertInput(), switchPair()
const displayConversion = () => {
    updateButtons();
    updateInputs();
    updateExchangeRate();
};

const showLoading = () => {
    ui.controls.classList.add('skeleton');
    ui.exchangeRate.classList.add('skeleton');
};

const hideLoading = () => {
    ui.controls.classList.remove('skeleton');
    ui.exchangeRate.classList.remove('skeleton');
};

//----------------------------------------------------------------------
// HELPER FUNCTIONS
//----------------------------------------------------------------------

// **** Exchange rate related functions

// FN: Update the buttons (base and target) with the selected currency code
// Used by: displayConversion()
const updateButtons = () => {
    // Update buttons with the selected currency code
    [ui.baseBtn, ui.targetBtn].forEach(btn => {
        // btn.id is either 'base' or 'target'
        const code = state[btn.id];
        // Set the text content and background image of the button
        // The one selected will be updated (base or target)
        // The other will remain the same
        btn.textContent = code;
        btn.style.setProperty('--image', `url(${getImageURL(code)})`);
    });
};

// FN: Update the input fields with the base and target values
// Used by: displayConversion()
const updateInputs = () => {
    // destructure the baseValue, base, target, and rates from the state
    const { baseValue, base, target, rates } = state;
    // calculate the target value by multiplying the base value by the exchange rate
    const result = baseValue * rates[base][target];
    // update the value of the target input with the result
    ui.targetInput.value = result.toFixed(4);
    // update the value of the base input with the base value
    ui.baseInput.value = baseValue;
};

// FN: Update the exchange rate display in the UI
// Used by: displayConversion()
const updateExchangeRate = () => {
    // destructure the base, target, and rates from the state
    const { base, target, rates } = state;
    // get the exchange rate from the rates object
    // i.e. { USD: { EUR: 0.85, GBP: 0.75, ... }
    const rate = rates[base][target].toFixed(4);
    // update the exchange rate display in the UI
    ui.exchangeRate.textContent = `1 ${base} = ${rate} ${target}`;
};

// FN: Load the exchange rate from the state or fetch it if not available
// This function is called when the base or target currency is changed
// Used by: selectPair(), convertInput(), switchPair()
const loadExchangeRate = () => {
    const { base, rates } = state;
    if (typeof rates[base] !== 'undefined') {
        // If the base rates are in state, then show it
        displayConversion();
        // displayConversion() > updateButtons() > updateInputs() > updateExchangeRate()
    } else {
        // else fetch the exchange rate
        fetchExchangeRate();
        // fetchExchangeRate() > displayConversion() > updateButtons() > updateInputs() > updateExchangeRate()
    }
};

// **** Currencies list related functions

// FN: Get the available currencies (not including the base and target currencies)
// Used by: filterCurrencies()
const getAvailableCurrencies = () => {
    // filter the currencies array to exclude the base and target currencies
    return state.currencies.filter(({ code }) => {
        // return currencies that are not the base or target currency
        return state.base !== code && state.target !== code;
    });
};

// FN: Used to clear the search input when the drawer is closed
// Used by: hideDrawer()
const clearSearchInput = () => {
    ui.searchInput.value = '';
    // Use dispatchEvent because the input event is not triggered by the value property
    ui.searchInput.dispatchEvent(new Event('input'));
};

// FN: Used to get the image URL for the currency flag when rendering the currencies
// Used by: renderCurrencies()
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

// **** Exchange rate related functions

const fetchExchangeRate = async () => {
    // destructure the base currency from the state
    const { base } = state;

    // Show loading state skeleton
    showLoading();

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
        // Update the exchange rate display in the UI
        displayConversion();

        // Hide loading state skeleton
        hideLoading();
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

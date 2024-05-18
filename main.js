import axios from 'axios';

// fca_live_9yWcaJ8XzcMUnwWXMLF0GHVLBVAnl3ROKuSUdu4Q

const state = {
    openedDrawer: null,
};

// -----------------------------------------------------------------------------
// DOM SELECTORS
// -----------------------------------------------------------------------------

const ui = {
    controls: document.getElementById('controls'),
    drawer: document.getElementById('drawer'),
    dismissBtn: document.getElementById('dismiss-btn'),
};

// -----------------------------------------------------------------------------
// EVENT LISTENERS
// -----------------------------------------------------------------------------

const setupEventListeners = () => {
    ui.controls.addEventListener('click', showDrawer);
    ui.dismissBtn.addEventListener('click', hideDrawer);
};

// -----------------------------------------------------------------------------
// EVENT HANDLERS
// -----------------------------------------------------------------------------
const showDrawer = event => {
    // Checks if the clicked element has the data-drawer attribute
    // isolates the button inside the controls as the clickable elements
    if (event.target.hasAttribute('data-drawer')) {
        // Sets the openedDrawer state to the id of the clicked button
        // This is either 'base' or 'target'
        state.openedDrawer = event.target.id;
        console.log(state.openedDrawer);
        ui.drawer.classList.add('show');
    }
};
const hideDrawer = event => {
    // Resets the openedDrawer state to null
    state.openedDrawer = null;
    ui.drawer.classList.remove('show');
    console.log(state.openedDrawer);
};

// -----------------------------------------------------------------------------
// RENDER FUNCTIONS
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// HELPER FUNCTIONS
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// API FUNCTIONS
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// INITIALIZATION
// -----------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

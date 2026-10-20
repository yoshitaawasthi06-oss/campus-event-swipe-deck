// app.js — all the logic lives here.

// ---------------------------------------------------------------
// STEP 1: Saved data (this is what survives closing the browser)
// ---------------------------------------------------------------
// We save one object in localStorage:
//   swipes:  { eventId: "in" or "skip" }   <- what you decided for each event
//   history: [eventId, eventId, ...]        <- order of swipes, used for Undo
const STORAGE_KEY = "campusEventSwipeDeck";

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.swipes && saved.history) return saved;
  } catch (error) {
    // ignore broken data and start fresh
  }
  return { swipes: {}, history: [] };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();
let currentCategory = "All";

// Grab the HTML elements we need to change
const filtersEl = document.getElementById("filters");
const deckEl = document.getElementById("deck");
const rsvpListEl = document.getElementById("rsvpList");

// ---------------------------------------------------------------
// STEP 2: Category filter
// ---------------------------------------------------------------
function renderFilters() {
  // Collect every category from the events, e.g. ["All", "Tech", "Cultural", ...]
  const categories = ["All"];
  EVENTS.forEach(function (event) {
    if (!categories.includes(event.category)) categories.push(event.category);
  });

  filtersEl.innerHTML = "";
  categories.forEach(function (category) {
    const button = document.createElement("button");
    button.className = "chip" + (category === currentCategory ? " active" : "");
    button.textContent = category;
    button.addEventListener("click", function () {
      currentCategory = category;
      renderFilters();
      renderDeck();
    });
    filtersEl.appendChild(button);
  });
}

// ---------------------------------------------------------------
// STEP 3: Work out which cards are still in the deck
// ---------------------------------------------------------------
// A card is in the deck if you haven't swiped it yet AND it matches the filter.
function getDeck() {
  return EVENTS.filter(function (event) {
    const notSwipedYet = !(event.id in state.swipes);
    const matchesFilter = currentCategory === "All" || event.category === currentCategory;
    return notSwipedYet && matchesFilter;
  });
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString([], {
    weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit"
  });
}

function makeCard(event, isTop) {
  const card = document.createElement("div");
  card.className = "card" + (isTop ? "" : " behind");
  card.innerHTML =
    '<div class="stamp in">I\'M IN</div>' +
    '<div class="stamp skip">SKIP</div>' +
    '<span class="tag">' + event.category + "</span>" +
    "<h3>" + event.title + "</h3>" +
    "<p>📅 " + formatDate(event.date) + "</p>" +
    "<p>📍 " + event.location + "</p>";
  return card;
}

function renderDeck() {
  const deck = getDeck();
  deckEl.innerHTML = "";

  if (deck.length === 0) {
    deckEl.innerHTML = '<div class="empty">No more events here! Try another category, or press Undo.</div>';
    return;
  }

  // Show the top 2 cards. We add the one behind first so the top card ends up on top.
  if (deck.length > 1) deckEl.appendChild(makeCard(deck[1], false));
  const topCard = makeCard(deck[0], true);
  deckEl.appendChild(topCard);
  enableDragging(topCard);
}

// ---------------------------------------------------------------
// STEP 4: Swiping
// ---------------------------------------------------------------
// direction is "right" (I'm in) or "left" (skip)
function swipe(direction) {
  const deck = getDeck();
  if (deck.length === 0) return;

  const event = deck[0];
  const topCard = deckEl.lastElementChild;

  // Fly the card off the screen...
  const flyX = direction === "right" ? 600 : -600;
  topCard.style.transition = "transform 0.25s, opacity 0.25s";
  topCard.style.transform = "translateX(" + flyX + "px) rotate(" + flyX / 15 + "deg)";
  topCard.style.opacity = "0";

  // ...then, once it has flown away, save the choice and show the next card.
  setTimeout(function () {
    state.swipes[event.id] = direction === "right" ? "in" : "skip";
    state.history.push(event.id);
    saveState();
    renderDeck();
    renderRsvps();
  }, 250);
}

// Dragging with finger or mouse
function enableDragging(card) {
  let startX = 0;
  let dx = 0;
  let dragging = false;
  const inStamp = card.querySelector(".stamp.in");
  const skipStamp = card.querySelector(".stamp.skip");

  card.addEventListener("pointerdown", function (e) {
    dragging = true;
    startX = e.clientX;
    card.setPointerCapture(e.pointerId);
    card.style.transition = "none";
  });

  card.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    dx = e.clientX - startX;
    card.style.transform = "translateX(" + dx + "px) rotate(" + dx / 15 + "deg)";
    inStamp.style.opacity = Math.max(0, Math.min(1, dx / 100));
    skipStamp.style.opacity = Math.max(0, Math.min(1, -dx / 100));
  });

  card.addEventListener("pointerup", function () {
    if (!dragging) return;
    dragging = false;

    if (dx > 100) {
      swipe("right");          // dragged far enough right
    } else if (dx < -100) {
      swipe("left");           // dragged far enough left
    } else {
      // not far enough: spring back to the middle
      card.style.transition = "transform 0.2s";
      card.style.transform = "";
      inStamp.style.opacity = 0;
      skipStamp.style.opacity = 0;
    }
    dx = 0;
  });
}

// ---------------------------------------------------------------
// STEP 5 (Bonus): Undo last swipe
// ---------------------------------------------------------------
function undo() {
  if (state.history.length === 0) return;
  const lastId = state.history.pop();   // take the last swiped event off the list
  delete state.swipes[lastId];          // forget the decision
  saveState();

  // If the restored card is hidden by the current filter, switch to "All"
  const event = EVENTS.find(function (e) { return e.id === lastId; });
  if (currentCategory !== "All" && event.category !== currentCategory) {
    currentCategory = "All";
    renderFilters();
  }
  renderDeck();
  renderRsvps();
}

// ---------------------------------------------------------------
// STEP 6 (Bonus): RSVP list with countdown badges
// ---------------------------------------------------------------
function countdownText(dateString) {
  const diff = new Date(dateString) - new Date();   // milliseconds until the event
  if (diff <= 0) return "Started";

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days >= 1) return "in " + days + (days === 1 ? " day" : " days");
  if (hours >= 1) return "in " + hours + "h";
  return "in " + Math.max(1, minutes) + "m";
}

function renderRsvps() {
  const going = EVENTS.filter(function (event) {
    return state.swipes[event.id] === "in";
  });

  // soonest first
  going.sort(function (a, b) { return new Date(a.date) - new Date(b.date); });

  rsvpListEl.innerHTML = "";
  if (going.length === 0) {
    rsvpListEl.innerHTML = "<li><small>Nothing yet. Swipe right on something!</small></li>";
    return;
  }

  going.forEach(function (event) {
    const text = countdownText(event.date);
    const li = document.createElement("li");
    li.innerHTML =
      "<div><strong>" + event.title + "</strong><br><small>" +
      formatDate(event.date) + " · " + event.location + "</small></div>" +
      '<span class="badge' + (text === "Started" ? " done" : "") + '">' + text + "</span>";
    rsvpListEl.appendChild(li);
  });
}

// ---------------------------------------------------------------
// STEP 7: Wire up the buttons and start the app
// ---------------------------------------------------------------
document.getElementById("inBtn").addEventListener("click", function () { swipe("right"); });
document.getElementById("skipBtn").addEventListener("click", function () { swipe("left"); });
document.getElementById("undoBtn").addEventListener("click", undo);

document.getElementById("resetBtn").addEventListener("click", function () {
  if (confirm("Clear all your swipes and RSVPs?")) {
    state = { swipes: {}, history: [] };
    saveState();
    renderDeck();
    renderRsvps();
  }
});

// Keyboard shortcuts for desktop: ← skip, → I'm in, Backspace undo
document.addEventListener("keydown", function (e) {
  if (e.key === "ArrowRight") swipe("right");
  if (e.key === "ArrowLeft") swipe("left");
  if (e.key === "Backspace") undo();
});

renderFilters();
renderDeck();
renderRsvps();

// Refresh the countdown badges every minute
setInterval(renderRsvps, 60000);

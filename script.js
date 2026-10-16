const DATES = [
  { id: "2026-10-19", day: "Mon", num: "19", month: "Oct", label: "Oct 19, 2026" },
  { id: "2026-10-20", day: "Tue", num: "20", month: "Oct", label: "Oct 20, 2026" },
  { id: "2026-10-21", day: "Wed", num: "21", month: "Oct", label: "Oct 21, 2026" },
  { id: "2026-10-22", day: "Thu", num: "22", month: "Oct", label: "Oct 22, 2026" },
  { id: "2026-10-23", day: "Fri", num: "23", month: "Oct", label: "Oct 23, 2026" }
];

const TIME_SLOTS = [
  "09:00 AM - 09:30 AM",
  "10:00 AM - 10:30 AM",
  "11:00 AM - 11:30 AM",
  "01:30 PM - 02:00 PM",
  "02:30 PM - 03:00 PM",
  "03:30 PM - 04:00 PM"
];

const F2F_ROOMS = [
  "Academic Hall — Room 304 (Defense Suite A)",
  "Computing Center — Room 210 (Conference Lab)",
  "Innovation Hub — Glass Pod 102"
];

const ONLINE_PLATFORMS = [
  "AuraMeet WebRTC Portal (Browser Built-in)",
  "Zoom Academic Room (Auto-Generated Passcode)",
  "Google Meet Institutional Link"
];

let state = {
  mode: "f2f",
  selectedDate: DATES[0].id,
  selectedSlot: "10:00 AM - 10:30 AM",
  filter: "all",
  bookings: [
    {
      id: "BK-8921",
      studentName: "Sophia Chen",
      studentId: "2026-08411",
      course: "CS 401 — Capstone Thesis Defense",
      examiner: "Dr. Elena Vance (Panel Chair)",
      mode: "f2f",
      dateId: "2026-10-19",
      dateLabel: "Oct 19, 2026",
      slot: "09:00 AM - 09:30 AM",
      locationDetail: "Academic Hall — Room 304 (Defense Suite A)",
      accessCode: "GATE-304A"
    },
    {
      id: "BK-9044",
      studentName: "Liam Navarro",
      studentId: "2026-11932",
      course: "CS 305 — Algorithms & Complexity Viva",
      examiner: "Dr. Kenji Takahashi",
      mode: "online",
      dateId: "2026-10-20",
      dateLabel: "Oct 20, 2026",
      slot: "01:30 PM - 02:00 PM",
      locationDetail: "AuraMeet WebRTC Portal (Browser Built-in)",
      accessCode: "meet.auraexam.edu/viva-9044"
    }
  ]
};

const modeF2FBtn = document.getElementById("modeF2F");
const modeOnlineBtn = document.getElementById("modeOnline");
const modeBannerTitle = document.getElementById("modeBannerTitle");
const modeBannerDesc = document.getElementById("modeBannerDesc");
const modeBannerBadge = document.getElementById("modeBannerBadge");
const locationLabel = document.getElementById("locationLabel");
const locationOption = document.getElementById("locationOption");
const dateStrip = document.getElementById("dateStrip");
const slotsGrid = document.getElementById("slotsGrid");
const bookingForm = document.getElementById("bookingForm");
const bookingsList = document.getElementById("bookingsList");
const activeBookingsCount = document.getElementById("activeBookingsCount");
const filterTabs = document.getElementById("filterTabs");
const toastBox = document.getElementById("toastBox");
const detailModal = document.getElementById("detailModal");
const modalTitle = document.getElementById("modalTitle");
const modalSubtitle = document.getElementById("modalSubtitle");
const modalContent = document.getElementById("modalContent");
const closeModalBtn = document.getElementById("closeModalBtn");

function init() {
  renderModeUI();
  renderDates();
  renderSlots();
  renderBookings();
  setupListeners();
}

function renderModeUI() {
  const isF2F = state.mode === "f2f";
  modeF2FBtn.classList.toggle("active", isF2F);
  modeOnlineBtn.classList.toggle("active", !isF2F);

  if (isF2F) {
    modeBannerTitle.textContent = "On-Campus Examination Room";
    modeBannerDesc.textContent = "Arrive 15 minutes early with your university ID and printed rubric sheet.";
    modeBannerBadge.textContent = "In-Person";
    modeBannerBadge.className = "mode-badge badge-f2f";
    locationLabel.textContent = "Preferred Campus Room";
    populateSelect(locationOption, F2F_ROOMS);
  } else {
    modeBannerTitle.textContent = "Encrypted Virtual Oral Defense Room";
    modeBannerDesc.textContent = "Instant meeting link generated upon booking with camera & microphone check.";
    modeBannerBadge.textContent = "Online Live";
    modeBannerBadge.className = "mode-badge badge-online";
    locationLabel.textContent = "Virtual Conferencing Platform";
    populateSelect(locationOption, ONLINE_PLATFORMS);
  }
}

function populateSelect(selectEl, items) {
  selectEl.innerHTML = items
    .map(item => `<option value="${item}">${item}</option>`)
    .join("");
}

function renderDates() {
  dateStrip.innerHTML = DATES.map(d => {
    const isSelected = d.id === state.selectedDate;
    return `
      <div class="date-card ${isSelected ? "selected" : ""}" data-date="${d.id}">
        <div class="date-day">${d.day}</div>
        <div class="date-num">${d.num}</div>
        <div class="date-month">${d.month}</div>
      </div>
    `;
  }).join("");
}

function isSlotTaken(dateId, slot) {
  return state.bookings.some(b => b.dateId === dateId && b.slot === slot);
}

function renderSlots() {
  const availableSlots = TIME_SLOTS.filter(s => !isSlotTaken(state.selectedDate, s));
  if ( isSlotTaken(state.selectedDate, state.selectedSlot) ) {
    state.selectedSlot = availableSlots[0] || "";
  }

  slotsGrid.innerHTML = TIME_SLOTS.map(slot => {
    const taken = isSlotTaken(state.selectedDate, slot);
    const selected = !taken && state.selectedSlot === slot;
    return `
      <button
        type="button"
        class="slot-pill ${selected ? "selected" : ""}"
        data-slot="${slot}"
        ${taken ? "disabled" : ""}
      >
        ${slot}
      </button>
    `;
  }).join("");
}

function renderBookings() {
  activeBookingsCount.textContent = `${state.bookings.length} Active ${state.bookings.length === 1 ? "Slot" : "Slots"}`;

  const filtered = state.bookings.filter(b => {
    if (state.filter === "all") return true;
    return b.mode === state.filter;
  });

  if (filtered.length === 0) {
    bookingsList.innerHTML = `<div class="empty-state">No oral exam bookings match this filter.</div>`;
    return;
  }

  bookingsList.innerHTML = filtered.map(b => {
    const isF2F = b.mode === "f2f";
    return `
      <div class="booking-card">
        <div class="booking-top">
          <div>
            <div class="booking-course">${b.course}</div>
            <div class="booking-student">${b.studentName} • ID: ${b.studentId}</div>
          </div>
          <span class="mode-badge ${isF2F ? "badge-f2f" : "badge-online"}">
            ${isF2F ? "Face-to-Face" : "Online"}
          </span>
        </div>

        <div class="booking-meta">
          <div class="meta-item">
            <span>Date & Time</span>
            <strong>${b.dateLabel} • ${b.slot.split(" - ")[0]}</strong>
          </div>
          <div class="meta-item">
            <span>Examiner</span>
            <strong>${b.examiner}</strong>
          </div>
          <div class="meta-item" style="grid-column: 1 / -1;">
            <span>${isF2F ? "Assigned Room" : "Virtual Platform"}</span>
            <strong>${b.locationDetail}</strong>
          </div>
        </div>

        <div class="booking-actions">
          <button type="button" class="secondary-btn" data-action="details" data-id="${b.id}">
            ${isF2F ? "📍 Room Pass" : "🎥 Launch / Test Room"}
          </button>
          <button type="button" class="danger-btn" data-action="cancel" data-id="${b.id}">
            Cancel Slot
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function showToast(message) {
  toastBox.textContent = message;
  toastBox.classList.add("show");
  setTimeout(() => {
    toastBox.classList.remove("show");
  }, 3400);
}

function openSessionModal(booking) {
  const isF2F = booking.mode === "f2f";
  modalTitle.textContent = isF2F ? "Face-to-Face Check-In Pass" : "Online Virtual Oral Room";
  modalSubtitle.textContent = `${booking.course} (${booking.dateLabel})`;

  if (isF2F) {
    modalContent.innerHTML = `
      <div><strong>Candidate:</strong> ${booking.studentName} (${booking.studentId})</div>
      <div><strong>Location:</strong> ${booking.locationDetail}</div>
      <div><strong>Time Slot:</strong> ${booking.slot}</div>
      <div><strong>Door Check-In Code:</strong> <span style="color:#fde68a;font-weight:700;">${booking.accessCode}</span></div>
      <div style="margin-top:0.6rem;color:rgba(255,255,255,0.65);">Present this pass to the proctor outside the examination room 15 minutes before your slot.</div>
    `;
  } else {
    modalContent.innerHTML = `
      <div><strong>Candidate:</strong> ${booking.studentName} (${booking.studentId})</div>
      <div><strong>Platform:</strong> ${booking.locationDetail}</div>
      <div><strong>Time Slot:</strong> ${booking.slot}</div>
      <div><strong>Direct Room URL:</strong> <span style="color:#38bdf8;font-weight:700;">https://${booking.accessCode}</span></div>
      <div style="margin-top:0.6rem;color:#34d399;">✓ Simulated Camera &amp; Microphone Check: Ready (48kHz Audio / HD Video)</div>
    `;
  }

  detailModal.classList.add("open");
}

function setupListeners() {
  [modeF2FBtn, modeOnlineBtn].forEach(btn => {
    btn.addEventListener("click", () => {
      state.mode = btn.dataset.mode;
      renderModeUI();
    });
  });

  dateStrip.addEventListener("click", e => {
    const card = e.target.closest(".date-card");
    if (!card) return;
    state.selectedDate = card.dataset.date;
    renderDates();
    renderSlots();
  });

  slotsGrid.addEventListener("click", e => {
    const pill = e.target.closest(".slot-pill");
    if (!pill || pill.disabled) return;
    state.selectedSlot = pill.dataset.slot;
    renderSlots();
  });

  filterTabs.addEventListener("click", e => {
    const tab = e.target.closest(".filter-tab");
    if (!tab) return;
    state.filter = tab.dataset.filter;
    document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    renderBookings();
  });

  bookingForm.addEventListener("submit", e => {
    e.preventDefault();

    if (!state.selectedSlot) {
      showToast("Please select an available time slot.");
      return;
    }

    const studentName = document.getElementById("studentName").value.trim();
    const studentId = document.getElementById("studentId").value.trim();
    const course = document.getElementById("courseSelect").value;
    const examiner = document.getElementById("examinerSelect").value;
    const locationDetail = locationOption.value;
    const dateObj = DATES.find(d => d.id === state.selectedDate);
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    const newBooking = {
      id: `BK-${randomNum}`,
      studentName,
      studentId,
      course,
      examiner,
      mode: state.mode,
      dateId: state.selectedDate,
      dateLabel: dateObj.label,
      slot: state.selectedSlot,
      locationDetail,
      accessCode: state.mode === "f2f" ? `GATE-${randomNum}` : `meet.auraexam.edu/viva-${randomNum}`
    };

    state.bookings.unshift(newBooking);
    bookingForm.reset();
    renderModeUI();
    renderSlots();
    renderBookings();
    showToast(`Booked ${state.mode === "f2f" ? "Face-to-Face" : "Online"} slot for ${dateObj.label}!`);
  });

  bookingsList.addEventListener("click", e => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;

    if (action === "cancel") {
      state.bookings = state.bookings.filter(b => b.id !== id);
      renderSlots();
      renderBookings();
      showToast("Oral examination slot cancelled.");
    } else if (action === "details") {
      const booking = state.bookings.find(b => b.id === id);
      if (booking) openSessionModal(booking);
    }
  });

  closeModalBtn.addEventListener("click", () => {
    detailModal.classList.remove("open");
  });

  detailModal.addEventListener("click", e => {
    if (e.target === detailModal) {
      detailModal.classList.remove("open");
    }
  });
}

init();

/**
 * ============================================================
 *  OCBC DIGITAL BANKING — STEP-BY-STEP TUTORIAL SYSTEM
 * ============================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("tutorial-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const path = window.location.pathname;

    if (path === "/dashboard") return showDashboardMenu();
    if (path === "/transfer") return startTransferTutorial();
    if (path === "/profile") return startProfileTutorial();

    alert("Tutorial is not available for this page.");
  });
});

/* ============================================================
   SHARED STATE & UI
   ============================================================ */

const tut = {
  overlay: null,
  highlight: null,
  tooltip: null,
  blocker: null,
  steps: [],
  index: 0
};

function createTutorialUI() {
  if (!tut.overlay) {
    tut.overlay = document.createElement("div");
    Object.assign(tut.overlay.style, {
      position: "fixed",
      inset: "0",
      background: "rgba(0,0,0,0.45)",
      zIndex: "9997",
      display: "none"
    });
    document.body.appendChild(tut.overlay);
  }

  if (!tut.highlight) {
    tut.highlight = document.createElement("div");
    Object.assign(tut.highlight.style, {
      position: "absolute",
      border: "3px solid #facc15",
      borderRadius: "14px",
      background: "transparent",
      boxShadow: "0 0 0 4px rgba(250,204,21,0.4)",
      zIndex: "9999",
      pointerEvents: "none",
      display: "none"
    });
    document.body.appendChild(tut.highlight);
  }

  if (!tut.tooltip) {
    tut.tooltip = document.createElement("div");
    Object.assign(tut.tooltip.style, {
      position: "absolute",
      background: "#fff",
      padding: "16px",
      borderRadius: "12px",
      maxWidth: "260px",
      boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
      zIndex: "10000",
      fontSize: "0.95rem",
      lineHeight: "1.5",
      display: "none"
    });
    document.body.appendChild(tut.tooltip);
  }
}

function blockAllExceptTooltip() {
  if (tut.blocker) return;

  tut.blocker = function (e) {
    if (tut.tooltip.contains(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
  };

  document.addEventListener("click", tut.blocker, true);
}

function removeBlocker() {
  if (!tut.blocker) return;
  document.removeEventListener("click", tut.blocker, true);
  tut.blocker = null;
}

function endTutorial() {
  if (tut.overlay) tut.overlay.style.display = "none";
  if (tut.highlight) tut.highlight.style.display = "none";
  if (tut.tooltip) tut.tooltip.style.display = "none";

  removeBlocker();
  tut.steps = [];
  tut.index = 0;
}

/* ============================================================
   STEP ENGINE
   ============================================================ */

function startSteps(steps) {
  createTutorialUI();
  tut.steps = steps;
  tut.index = 0;

  if (!steps.length) return;

  tut.overlay.style.display = "block";
  blockAllExceptTooltip();
  showStep(0);
}

function showStep(i) {
  if (i >= tut.steps.length) return endTutorial();

  tut.index = i;
  const step = tut.steps[i];

  const el = document.querySelector(step.selector);

  if (!el) return showStep(i + 1);

  const rect = el.getBoundingClientRect();
  const top = rect.top + window.scrollY;
  const left = rect.left + window.scrollX;

  tut.highlight.style.display = "block";
  tut.highlight.style.top = `${top - 8}px`;
  tut.highlight.style.left = `${left - 8}px`;
  tut.highlight.style.width = `${rect.width + 16}px`;
  tut.highlight.style.height = `${rect.height + 16}px`;

  const isLast = i === tut.steps.length - 1;
  const nextLabel = isLast ? "Finish" : "Next";

  tut.tooltip.innerHTML = `
    <div style="position:relative;">
      <button id="tut-close-btn"
        style="position:absolute;top:2px;right:4px;border:none;background:transparent;cursor:pointer;">
        x
      </button>

      <div style="margin-top:10px;">${step.text}</div>

      <div style="margin-top:12px;text-align:right;">
        <button id="tut-next-btn"
          style="background:#2563eb;color:#fff;border:none;border-radius:999px;padding:6px 14px;">
          ${nextLabel}
        </button>
      </div>
    </div>
  `;

  let tooltipTop = top + rect.height + 12;
  const tooltipHeight = 120;

  if (tooltipTop + tooltipHeight > window.scrollY + window.innerHeight) {
    tooltipTop = top - tooltipHeight - 12;
  }

  tut.tooltip.style.display = "block";
  tut.tooltip.style.top = tooltipTop + "px";
  tut.tooltip.style.left = left + "px";

  el.scrollIntoView({ behavior: "smooth", block: "center" });

  document.getElementById("tut-close-btn").onclick = endTutorial;

  document.getElementById("tut-next-btn").onclick = () => {
    if (isLast) endTutorial();
    else showStep(i + 1);
  };
}

/* ============================================================
   DASHBOARD POPUP
   ============================================================ */

function showDashboardMenu() {
  endTutorial();

  const existing = document.getElementById("tut-dashboard-menu");
  if (existing) existing.remove();

  const popup = document.createElement("div");
  popup.id = "tut-dashboard-menu";

  Object.assign(popup.style, {
    position: "fixed",
    top: "80px",
    right: "20px",
    background: "#fff",
    padding: "18px 16px",
    borderRadius: "14px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    width: "260px",
    zIndex: "9999"
  });

  popup.innerHTML = `
    <div style="position:relative;">
      <button id="tut-menu-close"
        style="position:absolute;top:4px;right:4px;border:none;background:transparent;cursor:pointer;">
        x
      </button>

      <div style="font-weight:600;margin-bottom:8px;">Tutorial Menu</div>
      <p style="margin-bottom:12px;">What would you like to learn?</p>

      <button class="tut-menu-option" data-target="transfer">💸 Transfer Money</button>
      <button class="tut-menu-option" data-target="profile">👤 Edit Profile</button>
      <button class="tut-menu-option" data-target="bills">🧾 Pay Bills</button>
    </div>
  `;

  document.body.appendChild(popup);

  document.getElementById("tut-menu-close").onclick = () => popup.remove();

  popup.querySelectorAll(".tut-menu-option").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const target = e.currentTarget.getAttribute("data-target");
      popup.remove();

      if (target === "transfer") return startDashboardTransferSteps();
      if (target === "profile") return startDashboardProfileSteps();
      if (target === "bills") return startDashboardBillsSteps();
    });
  });
}

/* ============================================================
   DASHBOARD FLOWS
   ============================================================ */

function startDashboardTransferSteps() {
  startSteps([
    {
      selector: ".qa-item[href='/transfer']",
      text: "Tap here to go to the Transfer page."
    }
  ]);
}

function startDashboardProfileSteps() {
  startSteps([
    {
      selector: "a.nav-link[href='/profile']",
      text: "Tap here to access your profile settings."
    }
  ]);
}

function startDashboardBillsSteps() {
  startSteps([
    {
      selector: ".quick-actions-row .qa-item:nth-child(2)",
      text: "Tap here to go to Bill Payments."
    }
  ]);
}

/* ============================================================
   PROFILE PAGE UPDATED TUTORIAL (AFTER UI REDESIGN)
   ============================================================ */

function startProfileTutorial() {
  startSteps([
    {
      selector: "input#name",
      text: "This is your full name. You can edit it here."
    },
    {
      selector: "input#username",
      text: "This is your username. You can change it anytime."
    },
    {
      selector: "input#email",
      text: "Here you can update your email address."
    },
    {
      selector: "button.red",
      text: "Tap this button to save your updated profile details."
    }
  ]);
}

/* ============================================================
   TRANSFER PAGE TUTORIAL (unchanged)
   ============================================================ */

function startTransferTutorial() {
  startSteps([
    {
      selector: ".transfer-tabs .tab:nth-of-type(1)",
      text: "Local transfers stay within the same currency."
    },
    {
      selector: ".transfer-tabs .tab:nth-of-type(2)",
      text: "Use Overseas transfer to send money internationally."
    },
    {
      selector: "input[name='recipient']",
      text: "Enter the receiver's account number here."
    },
    {
      selector: "input[name='amount']",
      text: "Enter the amount you want to send."
    },
    {
      selector: ".button.red.full",
      text: "Tap here to complete your transfer."
    }
  ]);
}

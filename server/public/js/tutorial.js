/**
 * ============================================================
 *  OCBC DIGITAL BANKING — STEP-BY-STEP TUTORIAL SYSTEM
 * ============================================================
 *  Behaviour:
 *  ✔ One step at a time
 *  ✔ "x" to end tutorial
 *  ✔ "Next" to go to next step
 *  ✔ No mouse / cursor emoji
 *  ✔ Only "x" and "Next" are clickable during a step
 *  ✔ Dashboard: popup menu (Transfer / Profile / Pay Bills)
 *  ✔ Dashboard -> Transfer tutorial
 *  ✔ Transfer page tutorial (multi-step)
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
   SHARED TUTORIAL STATE & UI
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
  // Dim overlay
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

  // Highlight box
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

  // Tooltip
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
    if (tut.tooltip && tut.tooltip.contains(e.target)) {
      return; // allow clicks inside tooltip (x / Next)
    }
    // block everything else
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
   STEP ENGINE: ONE STEP AT A TIME
   ============================================================ */

function startSteps(steps) {
  createTutorialUI();
  tut.steps = steps || [];
  tut.index = 0;

  if (!tut.steps.length) return;

  tut.overlay.style.display = "block";
  blockAllExceptTooltip();
  showStep(0);
}

function showStep(i) {
  if (i >= tut.steps.length) {
    endTutorial();
    return;
  }

  tut.index = i;
  const step = tut.steps[i];
  const el = document.querySelector(step.selector);

  if (!el) {
    // If element not found, skip to next step
    showStep(i + 1);
    return;
  }

  // Position highlight
  const rect = el.getBoundingClientRect();
  const top = rect.top + window.scrollY;
  const left = rect.left + window.scrollX;

  tut.highlight.style.display = "block";
  tut.highlight.style.top = (top - 8) + "px";
  tut.highlight.style.left = (left - 8) + "px";
  tut.highlight.style.width = (rect.width + 16) + "px";
  tut.highlight.style.height = (rect.height + 16) + "px";

  // Tooltip content
  const isLast = i === tut.steps.length - 1;
  const nextLabel = isLast ? "Finish" : "Next";

  tut.tooltip.innerHTML = `
    <div style="position:relative;">
      <button id="tut-close-btn" style="
        position:absolute;top:2px;right:4px;
        border:none;background:transparent;
        cursor:pointer;font-size:0.9rem;
      ">x</button>

      <div style="margin-top:10px;">
        ${step.text}
      </div>

      <div style="margin-top:12px;text-align:right;">
        <button id="tut-next-btn" style="
          border:none;
          background:#2563eb;
          color:white;
          border-radius:999px;
          padding:6px 14px;
          font-size:0.9rem;
          cursor:pointer;
        ">${nextLabel}</button>
      </div>
    </div>
  `;

  // Position tooltip below the element (or above if not enough space)
  let tooltipTop = top + rect.height + 12;
  const tooltipHeight = 120; // rough estimate
  if (tooltipTop + tooltipHeight > window.scrollY + window.innerHeight) {
    tooltipTop = top - tooltipHeight - 12;
  }

  tut.tooltip.style.display = "block";
  tut.tooltip.style.top = tooltipTop + "px";
  tut.tooltip.style.left = left + "px";

  el.scrollIntoView({ behavior: "smooth", block: "center" });

  // Hook buttons
  const closeBtn = document.getElementById("tut-close-btn");
  const nextBtn = document.getElementById("tut-next-btn");

  if (closeBtn) {
    closeBtn.onclick = () => {
      endTutorial();
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      if (isLast) {
        endTutorial();
      } else {
        showStep(i + 1);
      }
    };
  }
}

/* ============================================================
   DASHBOARD: TUTORIAL MENU POPUP
   ============================================================ */

function showDashboardMenu() {
  // Close any running tutorial
  endTutorial();

  // Remove old popup if exists
  const existing = document.getElementById("tut-dashboard-menu");
  if (existing) existing.remove();

  const popup = document.createElement("div");
  popup.id = "tut-dashboard-menu";

  Object.assign(popup.style, {
    position: "fixed",
    top: "80px",
    right: "20px",
    background: "#ffffff",
    padding: "18px 16px",
    borderRadius: "14px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    width: "260px",
    zIndex: "9999",
    fontSize: "0.95rem",
    lineHeight: "1.5"
  });

  popup.innerHTML = `
    <div style="position:relative;">
      <button id="tut-menu-close" style="
        position:absolute;top:4px;right:4px;
        border:none;background:transparent;
        cursor:pointer;font-size:0.9rem;
      ">x</button>

      <div style="font-weight:600;margin-bottom:8px;">
        Tutorial Menu
      </div>
      <p style="margin-bottom:12px;">
        What would you like to learn?
      </p>

      <button class="tut-menu-option" data-target="transfer" style="
        width:100%;text-align:left;cursor:pointer;
        padding:8px 10px;margin-bottom:6px;
        border-radius:8px;border:1px solid #e5e7eb;
        background:#f9fafb;
      ">💸 How to transfer money</button>

      <button class="tut-menu-option" data-target="profile" style="
        width:100%;text-align:left;cursor:pointer;
        padding:8px 10px;margin-bottom:6px;
        border-radius:8px;border:1px solid #e5e7eb;
        background:#f9fafb;
      ">👤 How to view / edit profile</button>

      <button class="tut-menu-option" data-target="bills" style="
        width:100%;text-align:left;cursor:pointer;
        padding:8px 10px;
        border-radius:8px;border:1px solid #e5e7eb;
        background:#f9fafb;
      ">🧾 How to pay bills</button>
    </div>
  `;

  document.body.appendChild(popup);

  const closeBtn = document.getElementById("tut-menu-close");
  if (closeBtn) closeBtn.onclick = () => popup.remove();

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
   DASHBOARD TUTORIAL FLOWS
   ============================================================ */

function startDashboardTransferSteps() {
  startSteps([
    {
      selector: ".qa-item[href='/transfer']",
      text: "This button opens the Transfer Money page. Tap it whenever you want to send money."
    }
  ]);
}

function startDashboardProfileSteps() {
  startSteps([
    {
      selector: "a.nav-link[href='/profile']",
      text: "Tap this Profile button to see your personal details."
    }
  ]);
}

function startDashboardBillsSteps() {
  startSteps([
    {
      selector: ".quick-actions-row .qa-item:nth-child(2)",
      text: "Tap here to go to the Pay Bills section."
    }
  ]);
}

/* ============================================================
   TRANSFER PAGE: MULTI-STEP TUTORIAL
   ============================================================ */

function startTransferTutorial() {
  startSteps([
    {
      selector: ".transfer-tabs .tab:nth-of-type(1)",
      text: "Use this Local Transfer tab to send money within the same currency and country."
    },
    {
      selector: ".transfer-tabs .tab:nth-of-type(2)",
      text: "Use this Overseas Transfer tab if you want to send money to another country with a different currency."
    },
    {
      selector: "input[name='recipient']",
      text: "Type the account number of the person or account you want to send money to."
    },
    {
      selector: "input[name='amount']",
      text: "Enter the amount you want to send. Make sure you check the amount carefully."
    },
    {
      selector: ".button.red.full",
      text: "When everything looks correct, tap this button to confirm and send your transfer."
    }
  ]);
}

/* ============================================================
   PROFILE PAGE TUTORIAL
   ============================================================ */

function startProfileTutorial() {
  startSteps([
    {
      selector: ".card.auth-card, .profile-details",
      text: "This area shows your profile information such as your name and username."
    }
  ]);
}

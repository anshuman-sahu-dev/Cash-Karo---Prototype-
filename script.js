/* ==========================================================================
   CashKaro - Cashback Autopilot Prototype
   script.js - vanilla JS, modular by tab. Comments reference PRD FR numbers.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  /* ------------------------------------------------------------------
     MODULE: Tab Navigation
  ------------------------------------------------------------------ */
  const TabNav = (function () {
    function init() {
      document.querySelectorAll(".tabbtn").forEach((btn) => {
        btn.addEventListener("click", function () {
          activate(btn.dataset.tab);
        });
      });
    }
    function activate(tabId) {
      document.querySelectorAll(".tabbtn").forEach((b) => {
        const isActive = b.dataset.tab === tabId;
        b.classList.toggle("active", isActive);
        b.setAttribute("aria-selected", isActive ? "true" : "false");
      });
      document.querySelectorAll(".tabpane").forEach((p) => {
        p.classList.add("d-none");
      });
      document.getElementById("pane-" + tabId).classList.remove("d-none");
    }
    return { init: init, activate: activate };
  })();

  /* ------------------------------------------------------------------
     MODULE: Step Engine (shared helper for the two guided phone flows)
  ------------------------------------------------------------------ */
  function buildTrack(containerId, count) {
    const el = document.getElementById(containerId);
    el.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const d = document.createElement("div");
      d.className = "step-dot";
      d.innerHTML = "<i></i>";
      el.appendChild(d);
    }
  }
  function updateTrack(containerId, current, count) {
    const dots = document.querySelectorAll("#" + containerId + " .step-dot");
    dots.forEach((d, i) => {
      d.classList.remove("done", "current");
      if (i < current) d.classList.add("done");
      else if (i === current) d.classList.add("current");
    });
  }

  /* ------------------------------------------------------------------
     MODULE: Tab 1 - Share-to-Activate (guided flow: FR1, FR5, FR6, FR7)
  ------------------------------------------------------------------ */
  const ShareToActivate = (function () {
    const STEPS = 6;
    let cur = 0;
    let successTimer = null;
    const rationale = [
      "A shopper on any retailer app finds a product. Today, converting them means asking them to leave, remember, and research inside CashKaro three drop off points before the value is delivered.",
      "CashKaro is registered as a native Android/iOS Share Target (FR1). It shows up in the OS share sheet automatically no separate app-open required to discover it.",
      "FR2/FR3 - the eligibility resolver matches the shared URL against the merchant table in real time. Target: under 800ms, shown here as a brief skeleton state rather than a spinner.",
      "A short confirmation removes the user's biggest anxiety - 'did this actually get tracked?' - before they're even back in the retailer app (FR5).",
      "The user lands exactly where they left off in Urban Threads. The persistent pill (FR6) is the only ongoing footprint CashKaro has on their screen.",
      "Once the retailer's postback lands (24-48h typical), the order is confirmed via the existing attribution pipeline (FR7) - this event also feeds the ledger in tab 3.",
    ];

    function render() {
      document.querySelectorAll("#t1-screen .scr").forEach((s) => {
        s.classList.toggle("active", parseInt(s.dataset.step, 10) === cur);
      });
      updateTrack("t1-track", cur, STEPS);
      document.getElementById("t1-rationale").innerHTML =
        '<span class="lbl">Why this screen</span>' + rationale[cur];
      const nextBtn = document.getElementById("t1-next");
      nextBtn.disabled = cur >= STEPS - 1;
      nextBtn.textContent =
        cur === 0
          ? "Start the guided flow →"
          : cur >= STEPS - 1
            ? "Flow complete"
            : "Next step →";

      if (cur === 2) loadActivationCard();
      if (cur === 4) showPlacedToastLater();
    }

    async function loadActivationCard() {
      const body = document.getElementById("ac-body");
      body.innerHTML = `
        <div class="sheet-handle"></div>
        <div style="text-align: center; padding: 20px 0;">
          <div style="margin-bottom:12px;"><img src="assets/Cashkaro Logo.png" style="height: 36px;" alt="CashKaro"></div>
          <div style="display:flex;justify-content:center;gap:6px;margin-bottom:16px;">
            <div class="pulse-dot" style="animation-delay:0s;"></div>
            <div class="pulse-dot" style="animation-delay:0.2s;"></div>
            <div class="pulse-dot" style="animation-delay:0.4s;"></div>
          </div>
          <div style="font-size: 0.9rem; color: var(--slate); font-weight: 600;">Hold on, activating your cashback...</div>
        </div>
      `;
      
      await sleep(650);
      if (cur !== 2) return; // user navigated away before load finished
      
      body.innerHTML = `
        <div class="sheet-handle"></div>
        <div class="ac-row">
          <div class="ac-logo">UT</div>
          <div>
            <div style="font-family:'Sora',sans-serif;font-weight:700;font-size:.9rem;">Urban Threads</div>
            <div style="font-size:.72rem;color:var(--slate);">Aero Trail Runner · ₹2,849</div>
          </div>
        </div>
        <div class="ac-rate">₹142<small>Estimated cashback · 5% rate</small></div>
        <div style="background: rgba(39, 201, 63, 0.1); border: 1px dashed rgba(39, 201, 63, 0.4); border-radius: 8px; padding: 10px; margin: 12px 0; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <span style="font-size: 1rem;">🎟️</span>
          <span style="color: #1e9d30; font-weight: 600; font-size: 0.85rem;">Coupon <span style="background: #fff; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(39, 201, 63, 0.3); color: var(--ink); font-family: monospace;">SAVE20</span> copied!</span>
        </div>
        <div class="ac-note">Store-level rate shown exact product cashback may vary (FR3).</div>
        <div class="icon-btn primary" style="text-align:center;margin-top:10px;cursor:pointer;" id="btn-activate">Activate &amp; Continue →</div>
      `;
      
      const activateBtn = document.getElementById("btn-activate");
      if (activateBtn) {
        activateBtn.addEventListener("click", async function () {
          const isLoggedOut =
            document.getElementById("otp-toggle") &&
            document.getElementById("otp-toggle").checked;
            
          if (isLoggedOut) {
            document.getElementById("otp-overlay").classList.remove("d-none");
            await simulateOtp();
          }
          
          cur = 3;
          render();
          
          clearTimeout(successTimer);
          successTimer = setTimeout(() => {
            if (cur === 3) {
              cur = 4;
              render();
            }
          }, 2500);
        });
      }
    }

    async function simulateOtp() {
      const boxes = [
        document.getElementById("ob1"),
        document.getElementById("ob2"),
        document.getElementById("ob3"),
        document.getElementById("ob4"),
      ];
      const btn = document.getElementById("btn-otp-verify");
      boxes.forEach((b) => {
        b.textContent = "";
        b.classList.remove("filled");
      });
      btn.textContent = "Verifying...";
      btn.style.background = "";
      btn.style.opacity = "0.5";

      for (let i = 0; i < 4; i++) {
        await sleep(250);
        boxes[i].textContent = Math.floor(Math.random() * 10);
        boxes[i].classList.add("filled");
      }
      
      await sleep(250);
      btn.textContent = "Verified!";
      btn.style.background = "var(--mint)";
      btn.style.borderColor = "var(--mint)";
      btn.style.opacity = "1";
      
      await sleep(600);
      document.getElementById("otp-overlay").classList.add("d-none");
    }

    function showPlacedToastLater() {
      setTimeout(() => {
        const scr = document.querySelector('#t1-screen .scr[data-step="4"]');
        if (!scr || !scr.classList.contains("active")) return;
        if (!document.getElementById("t1-toast")) {
          const t = document.createElement("div");
          t.className = "toast";
          t.id = "t1-toast";
          t.innerHTML =
            "🛎️ &nbsp; Order placed! Tracking confirmed within 48 hrs.";
          scr.appendChild(t);
        }
      }, 500);
    }

    function next() {
      if (cur < STEPS - 1) {
        cur++;
        render();
      }
    }
    function reset() {
      cur = 0;
      render();
    }

    function init() {
      buildTrack("t1-track", STEPS);
      document.getElementById("t1-next").addEventListener("click", next);
      document.getElementById("t1-reset").addEventListener("click", reset);
      document
        .getElementById("btn-share")
        .addEventListener("click", function () {
          cur = 1;
          render();
        });
      document
        .getElementById("btn-proceed-success")
        .addEventListener("click", function () {
          if (cur === 3) {
            clearTimeout(successTimer);
            cur = 4;
            render();
          }
        });
      document
        .getElementById("btn-ck-icon")
        .addEventListener("click", function () {
          cur = 2;
          render();
        });
      document
        .getElementById("btn-place-order")
        .addEventListener("click", function () {
          cur = 5;
          render();
          Ledger.addEntry({
            merchant: "Urban Threads - Aero Trail Runner",
            icon: '<img src="https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.urbanthreads.com&size=128" style="width: 24px; height: 24px; object-fit: contain; border-radius: 6px;">',
            source: "share",
            amount: 142,
            status: "pending",
            when: "Just now",
          });
        });
      document
        .getElementById("track-pill")
        .querySelector("button")
        .addEventListener("click", function () {
          document.getElementById("track-pill").style.display = "none";
        });
      render();
    }

    return {
      init: init,
      gotoStart: function () {
        reset();
      },
    };
  })();

  /* ------------------------------------------------------------------
     MODULE: Link Eligibility Checker (FR2, FR3, FR4, FR15 + Section 7.3
     loading / error / ineligible states, and edge cases from Section 12:
     shortened links, non-partner domains)
  ------------------------------------------------------------------ */
  const LinkChecker = (function () {
    // Curated top-merchant table (PRD 6.1 - top 15–20 partners for v1)
    const PARTNERS = [
      { domain: "myntra.com", name: "Myntra", rate: 4, logo: "MY" },
      { domain: "amazon.in", name: "Amazon India", rate: 3, logo: "AZ" },
      { domain: "flipkart.com", name: "Flipkart", rate: 2.5, logo: "FK" },
      { domain: "nykaa.com", name: "Nykaa", rate: 6, logo: "NY" },
      { domain: "croma.com", name: "Croma", rate: 2, logo: "CR" },
      { domain: "ajio.com", name: "Ajio", rate: 5, logo: "AJ" },
      {
        domain: "urbanthreads.com",
        name: "Urban Threads",
        rate: 5,
        logo: "UT",
      },
    ];
    const SHORTENERS = ["bit.ly", "tinyurl.com", "cutt.ly", "is.gd"];

    function extractDomain(raw) {
      let value = raw.trim();
      if (!/^https?:\/\//i.test(value)) value = "https://" + value;
      try {
        const u = new URL(value);
        return u.hostname.replace(/^www\./, "").toLowerCase();
      } catch (e) {
        return null;
      }
    }

    function findPartner(domain) {
      return PARTNERS.find((p) => {
        return domain === p.domain || domain.endsWith("." + p.domain);
      });
    }

    function showError(msg) {
      const input = document.getElementById("link-input");
      const err = document.getElementById("link-error");
      input.classList.add("is-invalid");
      err.textContent = msg;
      err.classList.add("show");
      document.getElementById("link-result").innerHTML = "";
    }
    function clearError() {
      document.getElementById("link-input").classList.remove("is-invalid");
      const err = document.getElementById("link-error");
      err.classList.remove("show");
      err.textContent = "";
    }

    function renderLoading(note) {
      document.getElementById("link-result").innerHTML = `
        <div class="result-card loading">
          <div class="rc-logo skeleton" style="background:transparent;"></div>
          <div class="rc-text">
            <strong>${note}</strong>
            <span>Resolving against the merchant eligibility table…</span>
          </div>
        </div>
      `;
    }

    function renderOk(partner, domain) {
      const basePrice = Math.round(999 + Math.random() * 3000);
      const amount = Math.round(basePrice * (partner.rate / 100));
      
      let html = `
        <div class="result-card ok">
          <div class="rc-logo">${partner.logo}</div>
          <div class="rc-text">
            <strong>${partner.name} - eligible</strong>
            <span>${domain} - store-level rate</span>
          </div>
          <div class="rc-amt">
            ₹${amount}
            <small>${partner.rate}% est.</small>
          </div>
        </div>
      `;

      // Show better deal 70% of the time for prototype demonstration
      if (Math.random() > 0.3) {
        const competitors = PARTNERS.filter(p => p.domain !== partner.domain);
        const comp = competitors[Math.floor(Math.random() * competitors.length)];
        const compPrice = Math.round(basePrice * 0.9); // 10% cheaper
        const compCb = Math.round(compPrice * (comp.rate / 100));
        const netPrice = compPrice - compCb;

        html += `
          <div class="better-deal-card">
            <div class="better-deal-badge">Smart Compare</div>
            <div style="display: flex; gap: 12px; align-items: center;">
              <div class="rc-logo" style="width: 32px; height: 32px; font-size: 0.8rem; background: #fff;">${comp.logo}</div>
              <div style="flex: 1;">
                <div style="font-family: 'Sora', sans-serif; font-weight: 700; font-size: 0.9rem; color: var(--ink);">Better Deal Found!</div>
                <div style="font-size: 0.75rem; color: var(--slate);">Identical item is cheaper on ${comp.name}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-family: 'Space Mono', monospace; font-weight: 700; font-size: 1rem; color: var(--green);">₹${netPrice}</div>
                <div style="font-size: 0.65rem; color: var(--slate);">Net Effective</div>
              </div>
            </div>
            <div class="icon-btn primary" style="width: 100%; padding: 8px; font-size: 0.85rem; margin-top: 10px; cursor: pointer; text-align: center;">
              Switch to ${comp.name} →
            </div>
          </div>
        `;
      }

      document.getElementById("link-result").innerHTML = html;
    }

    function renderIneligible(domain) {
      const suggestion = PARTNERS[Math.floor(Math.random() * PARTNERS.length)];
      document.getElementById("link-result").innerHTML = `
        <div class="result-card bad">
          <div class="rc-logo" style="background:var(--red);">!</div>
          <div class="rc-text">
            <strong>Oops! We don't offer cashback for this store yet.</strong>
            <span>Try Amazon, Myntra, etc. or a similar store like <b>${suggestion.name}</b> (${suggestion.rate}% cashback).</span>
          </div>
        </div>
      `;
    }

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    async function simulateConsoleLogs(domain, isOk, cb) {
      const vizContainer = document.getElementById("engine-viz-container");
      if (!vizContainer) {
        await sleep(700);
        cb();
        return;
      }

      // Reset badges for animation sequence
      const badges = [
        document.getElementById("badge-intent"),
        document.getElementById("badge-session"),
        document.getElementById("badge-edge"),
        document.getElementById("badge-nudge")
      ];
      badges.forEach(b => { if (b) b.classList.remove("active"); });

      // Animate sequentially
      await sleep(200);
      if(badges[0]) badges[0].classList.add("active");
      await sleep(400);
      if(badges[1]) badges[1].classList.add("active");
      await sleep(400);
      if(badges[2]) badges[2].classList.add("active");
      await sleep(400);
      if(badges[3]) badges[3].classList.add("active");

      // Proceed after animation
      await sleep(600);
      cb();
    }

    function handleSubmit(e) {
      e.preventDefault();
      const raw = document.getElementById("link-input").value;

      // Validation: empty
      if (!raw.trim()) {
        showError("Paste a product link to check cashback eligibility.");
        return;
      }

      const domain = extractDomain(raw);
      // Validation: unparsable
      if (!domain || domain.indexOf(".") === -1) {
        showError(
          "This doesn't look like a valid product link. Please check and try again.",
        );
        return;
      }
      clearError();

      const isShortener = SHORTENERS.indexOf(domain) !== -1;

      if (isShortener) {
        renderLoading("Following shortened link…");
        setTimeout(() => {
          const resolved =
            PARTNERS[Math.floor(Math.random() * PARTNERS.length)];
          renderLoading("Checking " + resolved.domain + "…");
          simulateConsoleLogs(resolved.domain, true, function () {
            renderOk(resolved, resolved.domain);
          });
        }, 600);
        return;
      }

      renderLoading("Checking " + domain + "…");
      const partner = findPartner(domain);
      simulateConsoleLogs(domain, !!partner, function () {
        if (partner) renderOk(partner, domain);
        else renderIneligible(domain);
      });
    }

    function init() {
      document
        .getElementById("link-form")
        .addEventListener("submit", handleSubmit);
      document
        .getElementById("link-input")
        .addEventListener("input", clearError);
      document.querySelectorAll(".chip").forEach((chip) => {
        chip.addEventListener("click", function () {
          document.getElementById("link-input").value = chip.dataset.fill;
          document
            .getElementById("link-form")
            .dispatchEvent(new Event("submit", { cancelable: true }));
        });
      });
    }
    return { init: init };
  })();

  /* ------------------------------------------------------------------
     MODULE: Tab 2 - Smart Session Nudge guided flow (Section 4.2)
  ------------------------------------------------------------------ */
  const SmartNudgeFlow = (function () {
    const STEPS = 4;
    let cur = 0;
    const rationale = [
      "This trigger only starts counting once a user has opened a specific store's offer page inside CashKaro not on generic app open (FR8).",
      "No click-out was generated in this session. This is the exact narrow signal the nudge is gated on not time-since-last-open.",
      "Exactly one notification, after a fixed window, naming the store and rate specifically (FR9). Frequency caps below stop further sends for that store today (FR10).",
      "The deep link resumes the same offers page (FR11) the user isn't asked to re-find anything same principle as Share-to-Activate.",
    ];
    function render() {
      document.querySelectorAll("#t2-screen .scr").forEach((s) => {
        s.classList.toggle("active", parseInt(s.dataset.step, 10) === cur);
      });
      updateTrack("t2-track", cur, STEPS);
      document.getElementById("t2-rationale").innerHTML =
        '<span class="lbl">Guardrail built in</span>' + rationale[cur];
      const nextBtn = document.getElementById("t2-next");
      nextBtn.disabled = cur >= STEPS - 1;
      nextBtn.textContent =
        cur === 0
          ? "Start the guided flow →"
          : cur >= STEPS - 1
            ? "Flow complete"
            : "Next step →";
    }
    function next() {
      if (cur < STEPS - 1) {
        cur++;
        render();
      }
    }
    function reset() {
      cur = 0;
      render();
    }
    function init() {
      buildTrack("t2-track", STEPS);
      document.getElementById("t2-next").addEventListener("click", next);
      document.getElementById("t2-reset").addEventListener("click", reset);
      document
        .getElementById("btn-open-store")
        .addEventListener("click", function () {
          cur = 1;
          render();
        });

      const btn1 = document.getElementById("btn-clickout-1");
      if (btn1) {
        btn1.addEventListener("click", function () {
          const scr = document.querySelector('#t2-screen .scr[data-step="1"]');
          if (!scr.querySelector(".toast")) {
            const t = document.createElement("div");
            t.className = "toast";
            t.innerHTML = "💡 To test this flow, use the 'Simulate store view, no click-out' button on the right.";
            scr.appendChild(t);
            setTimeout(() => t.remove(), 3000);
          }
        });
      }

      const btn3 = document.getElementById("btn-clickout-3");
      if (btn3) {
        btn3.addEventListener("click", function () {
          const scr = document.querySelector('#t2-screen .scr[data-step="3"]');
          if (!scr.querySelector(".toast")) {
            const t = document.createElement("div");
            t.className = "toast";
            t.innerHTML = "✅ Click-out recorded! Nudge successful.";
            scr.appendChild(t);
            setTimeout(() => t.remove(), 3000);
            
            // Wait a moment and then log it to the ledger if it exists
            setTimeout(() => {
              if (typeof Ledger !== "undefined") {
                Ledger.addEntry({
                  merchant: "Nykaa Beauty",
                  icon: '<img src="https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.nykaa.com&size=128" style="width: 24px; height: 24px; object-fit: contain; border-radius: 6px;">',
                  source: "nudge",
                  amount: 85,
                  status: "pending",
                  when: "Just now",
                });
              }
            }, 500);
          }
        });
      }

      const intentSlider = document.getElementById("intent-slider");
      if (intentSlider) {
        intentSlider.addEventListener("input", function (e) {
          const val = parseInt(e.target.value, 10);
          const timeEl = document.querySelector(
            '#t2-screen .scr[data-step="2"] .time',
          );
          const dateEl = document.querySelector(
            '#t2-screen .scr[data-step="2"] .date',
          );

          if (val === 1) {
            // Low
            timeEl.textContent = "6:02";
            dateEl.textContent = "24 hrs later · no click-out, no order";
          } else if (val === 2) {
            // Med
            timeEl.textContent = "9:05";
            dateEl.textContent = "3 hrs later · no click-out, no order";
          } else if (val === 3) {
            // High
            timeEl.textContent = "6:32";
            dateEl.textContent = "30 mins later · abandoned cart";
          }
        });
      }
      render();
    }
    return { init: init };
  })();

  /* ------------------------------------------------------------------
     MODULE: Nudge Guardrail Panel (FR9, FR10, FR12, FR14 - fully
     functional cap counters, notification toggle, and activity log)
  ------------------------------------------------------------------ */
  const GuardrailPanel = (function () {
    let state = { storeCap: 0, userCap: 0, streak: 0, notifsOn: true };
    const STORE_CAP_MAX = 1,
      USER_CAP_MAX = 2,
      STREAK_MAX = 3;

    function log(msg, type) {
      const el = document.getElementById("activity-log");
      const row = document.createElement("div");
      row.className = "log-entry";
      const now = new Date();
      const ts = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      row.innerHTML =
        '<span class="dot ' +
        type +
        '"></span><span class="txt">' +
        msg +
        '</span><span class="ts">' +
        ts +
        "</span>";
      el.prepend(row);
    }

    function updateCounters() {
      const sBox = document.getElementById("cap-store");
      const uBox = document.getElementById("cap-user");
      const kBox = document.getElementById("cap-streak");
      sBox.querySelector(".n").textContent =
        state.storeCap + "/" + STORE_CAP_MAX;
      uBox.querySelector(".n").textContent = state.userCap + "/" + USER_CAP_MAX;
      kBox.querySelector(".n").textContent = state.streak + "/" + STREAK_MAX;
      sBox.classList.toggle("full", state.storeCap >= STORE_CAP_MAX);
      uBox.classList.toggle("full", state.userCap >= USER_CAP_MAX);
      kBox.classList.toggle("full", state.streak >= STREAK_MAX);
    }

    function simulateAbandon() {
      log(
        "Session logged: store offer page viewed, no click-out (FR8).",
        "warn",
      );

      if (!state.notifsOn) {
        log(
          "Nudge suppressed - notifications disabled by user (FR14 no-op).",
          "mute",
        );
        return;
      }
      if (state.streak >= STREAK_MAX) {
        log(
          "Nudge suppressed - auto-mute after 3 non-converting sends (FR10 backoff).",
          "mute",
        );
        return;
      }
      if (state.storeCap >= STORE_CAP_MAX) {
        log(
          "Nudge suppressed - store-level daily cap already reached (FR10).",
          "mute",
        );
        return;
      }
      if (state.userCap >= USER_CAP_MAX) {
        log(
          "Nudge suppressed - user-level daily cap already reached (FR10).",
          "mute",
        );
        return;
      }

      state.storeCap++;
      state.userCap++;
      state.streak++;
      updateCounters();
      log(
        'Nudge sent: "Your 6% cashback on Nykaa Beauty is still active." (FR9)',
        "ok",
      );
      log("Outcome logged for guardrail metrics: pending (FR12).", "ok");
    }

    function resetCaps() {
      state = {
        storeCap: 0,
        userCap: 0,
        streak: 0,
        notifsOn: document.getElementById("notif-toggle").checked,
      };
      updateCounters();
      document.getElementById("activity-log").innerHTML = "";
      log("Guardrail counters reset for a new day.", "ok");
    }

    function init() {
      updateCounters();
      log(
        "Ready - simulate a session to see the trigger and caps in action.",
        "ok",
      );
      document
        .getElementById("btn-simulate-abandon")
        .addEventListener("click", simulateAbandon);
      document
        .getElementById("btn-reset-caps")
        .addEventListener("click", resetCaps);
      document
        .getElementById("notif-toggle")
        .addEventListener("change", function (e) {
          state.notifsOn = e.target.checked;
          log(
            state.notifsOn
              ? "Notifications re-enabled."
              : "Notifications disabled - nudges will no-op silently (FR14).",
            state.notifsOn ? "ok" : "mute",
          );
        });
    }
    return { init: init };
  })();

  /* ------------------------------------------------------------------
     MODULE: Ledger (FR13) - data, render, filter, search, empty state
  ------------------------------------------------------------------ */
  const Ledger = (function () {
    let entries = [
      {
        merchant: "Nykaa Beauty - Order #48213",
        icon: '<img src="https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.nykaa.com&size=128" style="width: 24px; height: 24px; object-fit: contain; border-radius: 6px;">',
        source: "nudge",
        amount: 96,
        status: "confirmed",
        when: "Yesterday, 9:12 PM",
      },
      {
        merchant: "Myntra - Order #40021",
        icon: '<img src="https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.myntra.com&size=128" style="width: 24px; height: 24px; object-fit: contain; border-radius: 6px;">',
        source: "inapp",
        amount: 211,
        status: "credited",
        when: "4 days ago",
      },
      {
        merchant: "Croma - Order #39880",
        icon: '<img src="https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://www.croma.com&size=128" style="width: 24px; height: 24px; object-fit: contain; border-radius: 6px;">',
        source: "share",
        amount: 380,
        status: "credited",
        when: "9 days ago",
      },
    ];
    let filters = { status: "all", source: "all", q: "" };

    function addEntry(entry) {
      entries.unshift(entry);
      render();
    }

    function srcLabel(s) {
      return {
        share: "Share-to-Activate",
        nudge: "Nudge-recovered",
        inapp: "In-app click",
      }[s];
    }
    function srcClass(s) {
      return { share: "src-share", nudge: "src-nudge", inapp: "src-inapp" }[s];
    }

    function filtered() {
      return entries.filter((e) => {
        if (filters.status !== "all" && e.status !== filters.status)
          return false;
        if (filters.source !== "all" && e.source !== filters.source)
          return false;
        if (
          filters.q &&
          e.merchant.toLowerCase().indexOf(filters.q.toLowerCase()) === -1
        )
          return false;
        return true;
      });
    }

    function render() {
      const list = document.getElementById("ledger-list");
      const empty = document.getElementById("ledger-empty");
      if (!empty.classList.contains("d-none")) return; // hard empty-state preview is showing; don't overwrite

      const rows = filtered();
      if (rows.length === 0) {
        list.innerHTML = `<div class="no-results">No cashback entries match this filter - try clearing search or filters.</div>`;
        return;
      }
      list.innerHTML = rows
        .map((e) => `
          <div class="ledger-card">
            <div class="li">${e.icon}</div>
            <div class="lmeta">
              <h6>${e.merchant}</h6>
              <span class="src ${srcClass(e.source)}">${srcLabel(e.source)}</span>
              <span class="fs-xs text-slate">${e.when}</span>
            </div>
            <div class="lamt">
              ₹${e.amount}
              <span class="status status-${e.status}">${e.status}</span>
            </div>
          </div>
        `)
        .join("");
    }

    function toggleEmptyPreview() {
      const list = document.getElementById("ledger-list");
      const empty = document.getElementById("ledger-empty");
      const btn = document.getElementById("t3-toggle-empty");
      const showingEmpty = !empty.classList.contains("d-none");
      if (showingEmpty) {
        empty.classList.add("d-none");
        list.classList.remove("d-none");
        btn.textContent = "Preview first-time empty state";
        render();
      } else {
        empty.classList.remove("d-none");
        list.classList.add("d-none");
        btn.textContent = "Back to populated ledger";
      }
    }

    function init() {
      render();
      document
        .getElementById("ledger-search")
        .addEventListener("input", function (e) {
          filters.q = e.target.value;
          render();
        });
      document
        .querySelectorAll("#filter-status [data-filter-status]")
        .forEach((btn) => {
          btn.addEventListener("click", function () {
            document
              .querySelectorAll("#filter-status [data-filter-status]")
              .forEach((b) => {
                b.classList.remove("active");
              });
            btn.classList.add("active");
            filters.status = btn.dataset.filterStatus;
            render();
          });
        });
      document
        .querySelectorAll("#filter-source [data-filter-source]")
        .forEach((btn) => {
          btn.addEventListener("click", function () {
            document
              .querySelectorAll("#filter-source [data-filter-source]")
              .forEach((b) => {
                b.classList.remove("active");
              });
            btn.classList.add("active");
            filters.source = btn.dataset.filterSource;
            render();
          });
        });
      document
        .getElementById("t3-toggle-empty")
        .addEventListener("click", toggleEmptyPreview);
      document
        .getElementById("empty-try-btn")
        .addEventListener("click", function () {
          toggleEmptyPreview();
          TabNav.activate("t1");
          ShareToActivate.gotoStart();
        });
    }

    return { init: init, addEntry: addEntry };
  })();

  /* ------------------------------------------------------------------
     MODULE: Metrics guardrail breach simulation (Section 8, guardrails)
  ------------------------------------------------------------------ */
  const MetricsPanel = (function () {
    function setHealthy() {
      document.getElementById("guardrail-val").textContent = "6.2%";
      document.getElementById("guardrail-delta").textContent =
        "↔ within guardrail band";
      document.getElementById("guardrail-delta").className = "delta up";
      const box = document.getElementById("guardrail-box");
      box.className = "guardrail-box fine";
      box.innerHTML =
        "<strong style=\"font-family:'Sora',sans-serif;\">Guardrail we're watching hardest:</strong> app-opens-without-conversion after a nudge. Currently healthy - click-out rate is holding steady alongside it.";
    }
    function setBreach() {
      document.getElementById("guardrail-val").textContent = "18.9%";
      document.getElementById("guardrail-delta").textContent =
        "↑ opens rising, orders flat";
      document.getElementById("guardrail-delta").className = "delta warn";
      const box = document.getElementById("guardrail-box");
      box.className = "guardrail-box breach";
      box.innerHTML =
        "<strong style=\"font-family:'Sora',sans-serif;\">Guardrail breached:</strong> app-opens-without-conversion has climbed while click-out rate stayed flat - a sign the nudge trigger has drifted into noise. Per the PRD, this pauses further merchant/segment expansion and triggers a review of the trigger logic before it shows up as a notification opt-out spike.";
    }
    function init() {
      document
        .getElementById("btn-simulate-breach")
        .addEventListener("click", setBreach);
      document
        .getElementById("btn-reset-breach")
        .addEventListener("click", setHealthy);
    }
    return { init: init };
  })();

  /* ------------------------------------------------------------------
     MODULE: GTM Stepper (Section 11)
  ------------------------------------------------------------------ */
  const GtmPanel = (function () {
    const details = [
      {
        h: "Stage 1 - A/B Holdout (Weeks 1–4)",
        p: "50% of eligible Repeat Mobile Shoppers get Share-to-Activate + Smart Nudge live; 50% are held out. This isolates causal lift on the north-star metric rather than measuring reallocation of orders that would have happened anyway.",
      },
      {
        h: "Stage 2 - Segment rollout",
        p: "If incremental lift is positive and guardrails (opens-without-conversion, opt-out rate) hold through the holdout, expand to 100% of the Repeat Mobile Shopper segment before touching any other segment.",
      },
      {
        h: "Stage 3 - Merchant expansion",
        p: "Grow beyond the initial top 15–20 partner merchants using v1 conversion data to prioritize which merchants earn integration effort next not by GMV alone, but by activation → order conversion observed in v1.",
      },
      {
        h: "Stage 4 - Full rollout",
        p: "Extend to the Lapsed-but-active Installer segment as a re-activation lever, once the mechanism is proven on the higher-intent Repeat Mobile Shopper base. Kill/change trigger: if activation → tracked order conversion isn't meaningfully above baseline in app click-out conversion after the holdout, we don't scale we revisit whether re-navigation friction was really the binding constraint.",
      },
    ];
    function show(i) {
      document.querySelectorAll(".gtm-step").forEach((s) => {
        s.classList.toggle("active", parseInt(s.dataset.step, 10) === i);
      });
      document.getElementById("gtm-detail").innerHTML =
        "<h5>" +
        details[i].h +
        '</h5><p style="margin:0;">' +
        details[i].p +
        "</p>";
    }
    function init() {
      document.querySelectorAll(".gtm-step").forEach((step) => {
        step.addEventListener("click", function () {
          show(parseInt(step.dataset.step, 10));
        });
      });
      show(0);
    }
    return { init: init };
  })();

  /* ------------------------------------------------------------------
     BOOT
  ------------------------------------------------------------------ */
  TabNav.init();
  ShareToActivate.init();
  LinkChecker.init();
  SmartNudgeFlow.init();
  GuardrailPanel.init();
  Ledger.init();
  MetricsPanel.init();
  GtmPanel.init();
});

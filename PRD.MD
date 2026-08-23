# CashKaro Product Requirements Document (PRD): Cashback Autopilot (Share-to-Activate & Smart Nudge)

## 1. Problem Space & Framing

**The Framing & Underlying Problem:**
Existing CashKaro users understand the value of cashback, yet they still miss out on eligible purchases. While forgetfulness is a factor, the core issue is **Friction and the Habit Loop**. 
In a mobile-first market like India, users have ingrained muscle memory to start their shopping journeys directly on native retailer apps (Amazon, Flipkart, Myntra). By the time they discover a product and decide to buy, remembering CashKaro introduces massive friction: they must leave the retailer app, open CashKaro, search for the retailer, click-out to restart the retailer app, and manually find the product again to complete the purchase. 
Most users simply abandon the cashback to save time and effort.

**Why this problem?**
Breaking a deeply ingrained habit (opening Amazon directly) is incredibly difficult. Instead of trying to force users to start at CashKaro, we must intercept them where they are. 

**Target Users:**
High-intent existing CashKaro users who shop primarily via mobile apps.

## 2. Business Objective & Success Metrics

**Core Outcome (As per Assessment):**
*Tracked orders per existing user per quarter, on a fixed cohort.*

**How this solution ladders up:**
By drastically reducing the friction for a user who has already found a product, we increase the conversion rate of "intent to earn cashback" into a "tracked order". This prevents missed opportunities, directly driving up the tracked orders per existing user.

**Success Metrics:**
*   **Primary Metric:** Number of "Shared Links" converted to "Tracked Orders" per user per quarter.
*   **Secondary Metric:** Feature Adoption Rate (% of fixed cohort users who initiate at least one Link & Earn session).
*   **Guardrail Metric:** Time-to-Redirect (must be < 3 seconds to prevent user drop-off).
*   **Guardrail Metric:** App uninstall rate or notification opt-out rate (to ensure the feature isn't perceived as intrusive).

## 3. The Solution: "Link & Earn" (QuickShare)

**Concept:**
We bring CashKaro into the user's existing shopping flow rather than forcing them into ours. When a user finds a product on a retailer app, they simply use the OS-level "Share" button to send the product link to CashKaro. CashKaro instantly parses the link, applies the affiliate tracking, and deep-links the user back to the retailer to complete the purchase. 

**Why this over alternatives?**
*   *Vs. Browser Extension:* Indian e-commerce is overwhelmingly mobile-app-driven. Desktop extensions move the needle too little.
*   *Vs. Home-screen widget:* A widget still requires the user to change their starting habit. It doesn't help the user who is already deep inside the Amazon app.
*   *Vs. Contextual Reminders:* Relying on push notifications based on screen scraping (Accessibility APIs) is invasive, drains battery, and often faces OS-level restrictions.

## 4. User Journey

1.  **Discovery:** User is browsing the Amazon/Myntra app and finds a product they want to buy.
2.  **Intent:** User remembers CashKaro but doesn't want to restart the search.
3.  **Action:** User taps the native "Share" icon in the retailer app and selects the "CashKaro" app icon from the share sheet.
4.  **Processing (The Intercept):** The CashKaro app opens a lightweight, fast modal. It shows an "Activating Cashback..." animation.
5.  **Redirection:** Within 2 seconds, the modal transforms into a "Success" state and automatically deep-links the user back into the retailer app with the CashKaro affiliate tracking appended.
6.  **Completion:** User completes the purchase in the retailer app.

## 5. Features & Functional Requirements

*   **OS Share Sheet Integration (Native):** CashKaro registers as a share target for HTTP/HTTPS URLs.
*   **In-App Manual Input (Fallback):** A dedicated section in the CashKaro app where users can manually paste a copied link.
*   **URL Parsing Engine & Console (Technical Transparency):** 
    *   Strips existing UTM tracking parameters from the shared URL in real-time.
    *   Queries the merchant graph to match root domains and calculates dynamic rewards.
    *   Visualized via a toggleable backend console in the prototype.
*   **Affiliate Link Generation:** Dynamically generates the encoded Click-Out URL based on the user's ID and the destination product URL.
*   **Smart Nudge AI Timing Simulator:** 
    *   Monitors session context to dynamically calculate notification timing based on intent (e.g., Scrolled vs. Added to Cart pulls the nudge forward).
    *   Gated by strict frequency caps (1 per store/day) and requires an unfulfilled click-out.
*   **Deep-Linking:** Triggers an intent to open the destination URL directly in the respective retailer app (bypassing the mobile browser if the app is installed).

### Advanced User-Centric Solutions (New V2 Features)
*   **Smart Price Compare (Cross-Merchant Routing):** When a user shares a link from Retailer A, the engine instantly queries Retailer B & C for the exact SKU. If a better net price (Price - Cashback) exists elsewhere, it intercepts the user with a "Better Deal Found" card, allowing them to switch retailers with one tap.
*   **Auto-Coupon Clipboard Injection:** During the 2-second processing phase, the engine fetches the best working promo code for that specific retailer and automatically copies it to the user's OS clipboard. A toast notifies the user: *"Coupon 'SAVE20' copied! Paste at checkout."* This eliminates the need for users to hunt for coupons.

## 6. UI/UX Requirements & Page Structure (Prototype Scope)

Since the actual OS Share Sheet is native, the prototype will be a **Mobile Web Simulation** demonstrating the flow.

**Pages/Sections in Prototype:**
1.  **Simulated Retailer App (Home/Context):** A mockup of a product page with a prominent "Share" button.
2.  **Simulated OS Share Sheet:** A bottom-sheet modal simulating the iOS/Android share experience.
3.  **CashKaro Processing Screen:** 
    *   *Visuals:* CashKaro branding, dynamic progress indicator (pulsing rings or a loading bar).
    *   *Copy:* "Hold on, activating your cashback..."
4.  **Success/Redirect Screen:**
    *   *Visuals:* Green checkmark, clear CTA to proceed.
    *   *Copy:* "Cashback Activated! Taking you back to the store..."
5.  **CashKaro Hub (Paste Link UI):** A clean dashboard where users can manually paste links and view recent activity.

**Design Aesthetics (Premium & Modern):**
*   Use smooth bottom-sheet animations.
*   Implement glassmorphism for overlays to feel native and modern.
*   Typography: Inter or Roboto for clean legibility.
*   Colors: CashKaro's signature Orange (#F47920) and deep Navy Blue (#0F172A for a premium dark-mode feel).

## 7. Interactions & Edge Cases

*   **Interaction 1: The Share Action.** Tapping share must instantly bring up the bottom sheet without lag.
*   **Interaction 2: Processing State.** Must never appear stuck. Needs micro-animations to indicate backend activity.
*   **Edge Case: Unsupported Retailer Link.** 
    *   *Handling:* The processing screen gracefully fails to a state saying, "Oops! We don't offer cashback for this store yet. Try Amazon, Myntra, etc."
*   **Edge Case: Invalid URL (Not a shopping link).**
    *   *Handling:* "This doesn't look like a valid product link. Please check and try again."
*   **Edge Case: User Logged Out (Seamless OTP Handoff).**
    *   *Handling:* Instead of breaking the flow and kicking the user to a standalone login page, the system pauses the redirect, slides up a seamless inline OTP verification bottom-sheet (simulating auto-fill), and instantly resumes the deep-link redirection upon success.

## 8. Acceptance Criteria

*   **AC1:** The prototype accurately simulates the user flow from a mock retailer page to the CashKaro processing screen.
*   **AC2:** The UI is fully responsive, optimized for mobile dimensions (max-width: 480px wrapper).
*   **AC3:** The "Paste Link" manual input validates URLs to ensure they are valid HTTP/HTTPS formats before simulating processing.
*   **AC4:** The design utilizes Bootstrap 5 alongside custom CSS to achieve a premium, modern aesthetic with micro-animations.
*   **AC5:** All error states (invalid URL, unsupported store simulation) are visually represented in the prototype.

## 9. GTM (Go-To-Market) Strategy

*   **Target Audience for V1:** Roll out to the top 20% of high-frequency transacting users who already trust the platform.
*   **Discovery:** Use an in-app bottom sheet tutorial explaining the "QuickShare" method.
*   **Activation Incentive:** "Try Link & Earn and get ₹20 bonus cashback on your first tracked order."
*   **Scale/Kill Decision:** If the adoption rate is < 5% after 4 weeks, investigate if the OS share sheet placement is too hidden. If > 15%, scale to all users.

# CashKaro - Cashback Autopilot Prototype

![CashKaro Prototype](assets/Cashkaro%20Logo.png)

This project is an interactive mobile web simulation of the **Cashback Autopilot** feature, designed for the CashKaro APM Product Assignment. It demonstrates two core functionalities aimed at intercepting user shopping intent and reducing friction in earning cashback: **Share-to-Activate** and **Smart Session Nudge**.

## 🚀 Overview

Existing users often miss out on cashback because starting their journey on the CashKaro app breaks their ingrained habit of opening native retailer apps (like Amazon or Myntra) directly. 

This prototype tackles that friction by:
1. **Bringing CashKaro to the user:** Allowing users to activate cashback via the OS Share Sheet directly from the retailer app.
2. **Recovering intent:** Smartly nudging users who viewed a store on CashKaro but abandoned their session without clicking out.

## ✨ Key Features Demonstrated

The prototype features a tabbed interface demonstrating the following flows:

*   **Tab 1: Share-to-Activate (QuickShare)**
    *   Simulates a user sharing a product link from a retailer app to CashKaro.
    *   Validates the merchant link in real-time (includes a live link checker).
    *   Demonstrates **Smart Price Compare** (suggesting better deals if found) and **Auto-Coupon Clipboard Injection**.
    *   Deep-links the user back to the retailer app seamlessly.
*   **Tab 2: Smart Session Nudge**
    *   Triggers when a user views a store offer inside CashKaro but leaves without a click-out.
    *   Interactive guardrail testing panel to simulate frequency caps (Store Cap, User Cap, Non-converting streak).
    *   Notification deep-links directly back to the store page, not the CashKaro home screen.
*   **Tab 3: My Cashback Ledger**
    *   A simulated dashboard showing cashback history filtered by source (Share-to-Activate, Nudge-recovered, In-app).
*   **Tab 4 & 5: Metrics, Guardrails & GTM**
    *   Details the core success metrics, guardrails, and rollout strategy for the feature.

## 🛠️ Tech Stack

This is a lightweight, frontend-only prototype requiring no build tools.

*   **HTML5**
*   **CSS3 (Vanilla):** Custom design tokens, glassmorphism effects, responsive phone frames, and micro-animations for a premium, native feel.
*   **JavaScript (Vanilla):** Modular JS handling the tab navigation, step-by-step interactive flows, state management, and real-time form validation.
*   **Bootstrap 5:** Used strictly for layout grids and basic utilities.

## 📂 Project Structure

```
├── index.html       # The main entry point and prototype UI
├── style.css        # All styling, animations, and design system tokens
├── script.js        # Logic for interactive flows, validation, and guardrails
├── PRD.MD           # The complete Product Requirements Document
└── assets/          # Directory containing images and mockups
```

## 🏃 How to Run

1. Clone or download this repository.
2. Simply double-click on `index.html` to open it in your preferred modern web browser. 
3. **Note:** Since this simulates a mobile app experience, it is best viewed on a mobile device or by opening your browser's Developer Tools (F12) and enabling **Device Toolbar / Responsive Design Mode** (Ctrl+Shift+M).

## 📖 Documentation

For a deep dive into the problem space, success metrics, user journeys, and acceptance criteria, please read the included [`PRD.MD`](./PRD.MD) file.

## Bill Splitter Web App Documentation

## Overview

The **Bill  splitter** is a web-based application that allows groups of
people to track and split expenses during shared activities (e.g.,
trips, parties, events). It provides:

-   **User Authentication** (Login, Registration, Logout)\
-   **Activity Management** (create separate events like "Swimming",
    "Snacks", etc.)\
-   **Participants Management** (add/remove participants per activity)\
-   **Bill Recording** (add/remove bills with descriptions and selected
    participants)\
-   **Automatic Settlement Calculation** (who owes whom, how much)\
-   **Persistent Data** (all records saved in `localStorage`)

------------------------------------------------------------------------

##  Features

###  Authentication

-   Users must **register** with a username and password.\
-   Existing users can **login**.\
-   **Logout** returns the user to the login screen.\
-   Each user has their **own separate activities, participants, and
    bills** stored under their account.

###  Activities

-   A user can create multiple **activities** (e.g., "Trip to Nairobi",
    "Movie Night").\
-   Each activity has its **own participants, bills, and settlements**.\
-   Activities can be reset (all participants and bills cleared).

###  Participants

-   Add new participants to an activity.\
-   Participants are selectable for each bill (so only involved people
    split that expense).

### Bills

-   Add bills with:
    -   Name (who paid)\
    -   Amount\
    -   Description\
    -   Selected participants who share the cost\

### Settlements

-   The app automatically calculates settlements:
    -   Who owes money\
    -   Who should be paid\
    -   The exact amount\
-   If all contributions are equal → **"No settlements needed."**

### Persistence

-   All data (users, activities, participants, bills) is stored in
    `localStorage`.\
-   Data persists across refreshes and browser restarts.

------------------------------------------------------------------------

##  File Structure

    project/
    │── index.html      # Main webpage (Login + Bill Tracker UI)
    │── style.css       # Styling for the app
    │── script.js       # JavaScript logic (login, activities, bills, settlements)
    │── README.md       # Documentation

------------------------------------------------------------------------

##  Usage Instructions

1.  **Open index.html in your browser.**\
2.  **Register** if you're a new user → you will be logged in
    automatically.\
3.  **Login** if you already have an account.\
4.  Create a new **activity** (e.g., "Swimming").\
5.  Add **participants** (e.g., Peter, John, Mary).\
6.  Add **bills**:
    -   Enter who paid, the amount, and a description.\
    -   Select the participants who shared in that expense.\
7.  View **settlements** → the app tells you who owes money to whom.\
8.  **Delete participants or bills** if needed.\
9.  **Logout** when done (returns you to login screen).

------------------------------------------------------------------------

##  Key Functions in `script.js`

-   **Authentication Functions**
    -   `loginForm.addEventListener("submit")` → Handles login.\
    -   `registerForm.addEventListener("submit")` → Handles
        registration.\
    -   `logoutBtn.addEventListener("click")` → Logs out user.
-   **Activity Functions**
    -   `loadActivities()` → Loads user's activities into dropdown.\
    -   `newActivityBtn.addEventListener("click")` → Creates a new
        activity.
-   **Participants Functions**
    -   `addParticipantForm.addEventListener("submit")` → Adds a
        participant.\
    -   Delete button inside `renderActivity()` → Removes a participant.
-   **Bill Functions**
    -   `billForm.addEventListener("submit")` → Adds a bill.\
    -   Delete button inside `renderActivity()` → Removes a bill.
-   **Settlement Calculation**
    -   `calculateSettlements(activity)` → Balances totals and
        determines who owes what.
-   **Persistence**
    -   `saveData()` → Saves all users and activities to
        `localStorage`.\
    -   Data automatically restored on page reload via
        `window.addEventListener("load")`.

------------------------------------------------------------------------

## Technologies Used

-   **HTML5** → Structure of the app\
-   **CSS3** → Styling and responsiveness\
-   **JavaScript ** → App logic (login, bills, settlements)\
-   **localStorage** → Persistent storage

------------------------------------------------------------------------

## Future Improvements

-   Edit participant/bill names instead of just deleting.\
-   Export settlements as a PDF or CSV.\
-   Multi-user collaboration on the same activity.\
-   Cloud database (Firebase/MongoDB) instead of localStorage.\
-   Mobile-first optimized UI.
# GraphQL Profile Viewer

This project is a web-based profile viewer that fetches and displays user data from the Zone01 Kisumu GraphQL API. It provides a dashboard with key metrics, XP progression over time, audit ratios, and a skills summary.

## Features

- **Login**: Secure authentication against the Zone01 API.
- **Profile Dashboard**: Displays user information, including ID, username, and total XP.
- **XP Over Time**: A line graph visualizing XP progression for different categories (Module, Piscine Go, JS, UX, UI, Rust).
- **Audit Ratios**: A pie chart showing the ratio of XP earned vs. XP given in audits.
- **Skills**: A grid displaying the user's skills and their proficiency levels.
- **GraphiQL Integration**: A link to the GraphiQL interface for exploring the API.

## Getting Started

### Prerequisites

- A modern web browser.
- An internet connection.

### Running the Project

1.  Clone the repository.
2.  Open the `public/index.html` file in your web browser.

Alternatively, you can use the provided `Makefile` to run the project:

```bash
make run
```

This will start a simple Python HTTP server and open the project in your default browser.

## Project Structure

- **`public/`**: Contains the frontend files.
  - **`css/`**: Stylesheets for the application.
  - **`js/`**: JavaScript files for handling logic.
    - **`script.js`**: Handles the login functionality.
    - **`profile.js`**: Fetches and displays the profile data.
  - **`index.html`**: The login page.
  - **`profile.html`**: The main profile dashboard.
- **`README.md`**: This file.
- **`Makefile`**: Automation for running the project.

# Jewelry Store

A jewelry e-commerce storefront built with **HTML, CSS, and vanilla JavaScript**, using **Firebase (Firestore & Authentication)** for data and user accounts.

## Features

- **Product catalog** — browse jewelry across categories: necklaces, rings, bracelets, and earrings
- **Product details** — each item includes images, price, description, stock quantity, and rating
- **User authentication** — sign up / log in via Firebase Authentication
- **Cloud data** — product and user data stored and synced through Firebase Firestore
- **Responsive UI** — built with plain CSS, no frontend framework dependency

## Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 |
| Logic | Vanilla JavaScript |
| Backend / Data | Firebase Firestore |
| Auth | Firebase Authentication |

## Project Structure

```
jewelry-store/
├── html/       # Page markup
├── css/        # Stylesheets
├── js/         # App logic, Firebase integration
├── images/     # Product images (necklaces, rings, bracelets, earrings)
└── file.json   # Sample product catalog data
```

## Getting Started

### Prerequisites
- A Firebase project with Firestore and Authentication enabled
- A modern web browser
- (Optional) a local static server, e.g. the VS Code Live Server extension

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/BasmallaMabrouk/jewelry-store.git
   ```
2. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com), enable **Firestore Database** and **Authentication**, and add your Firebase config (`apiKey`, `authDomain`, `projectId`, etc.) to the JS Firebase initialization file in `js/`.
3. Open `html/index.html` in your browser, or serve the project with a local static server.

## License

This project is for educational/portfolio purposes.

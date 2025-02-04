# Sal7ly Application

Sal7ly is a web application designed to connect users with skilled craftspeople and freelancers such as carpenters, blacksmiths, and more. Users can easily find professionals, book their services, track their projects, and provide feedback on the services received.

## Features

- **User Registration and Login**: Secure user authentication and authorization.
- **Craftsperson and Freelancer Search**: Users can search for verified craftspeople and freelancers based on location and rating.
- **Custom Requests**: Users can create custom requests for services or creations.
- **Feedback System**: Provide feedback and rate the services received.
- **Admin Dashboard**: Manage users, services, and track overall application performance.

## Technologies Used

- **Frontend**: React, Vite
- **Backend**: PHP
- **Database**: MySQL
- **Styling**: CSS

## Getting Started

To get a local copy up and running, follow these steps:

### Prerequisites

- Node.js and npm installed
- MySQL instance running

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/Sal7ly.git
    ```
2. Navigate to the project directory:
    ```sh
    cd Sal7ly
    ```
3. Install dependencies:
    ```sh
    npm install
    ```

### Running the Application

Start the frontend development server:
```sh
npm run dev
```

Ensure that the MySQL server is running with the database configured as specified in `sal7ly.php`.

### Usage

- Register or log in to your account.
- Find verified craftspeople and freelancers based on location and rating.
- Browse available services or create custom requests.
- Book a service or request a custom creation.
- Provide feedback and rating after the service is completed.

### Additional Information

- **Weighted Rating System**: The rating system is based on Bayesian average to ensure fair and balanced ratings.
- **MySQL Server**: Ensure that the MySQL server is running with the database configured as specified in `sal7ly.php`.
- **Craftsperson Profiles**: Craftspeople can create custom profiles showcasing their work samples, information, and bio.
- **Client Requests**: Craftspeople can also find clients by browsing and responding to custom requests.
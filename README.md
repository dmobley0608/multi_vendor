# Helen Underground

Helen Underground is a full-stack web application that uses React for the frontend and Django REST Framework for the backend. This project aims to provide a seamless and efficient user experience by leveraging modern web technologies.

## Table of Contents
- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)


## Features
- User authentication and authorization
- CRUD operations for managing data
- Responsive design for mobile and desktop
- RESTful API for backend communication
- State management with Redux

## Technologies
### Frontend
- React
- Redux
- React Router

### Backend
- Django
- Django REST Framework
- PostgreSQL

## Installation

### Prerequisites
- Node.js
- Python 3.x
- PostgreSQL

### Backend Setup
1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/helen_underground.git
    cd helen_underground/backend
    ```
2. Create a virtual environment and activate it:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```
3. Install the required packages:
    ```bash
    pip install -r requirements.txt
    ```
4. Set up the database:
    ```bash
    python manage.py migrate
    python manage.py createsuperuser
    ```
5. Run the development server:
    ```bash
    python manage.py runserver
    ```

### Frontend Setup
1. Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2. Install the required packages:
    ```bash
    npm install
    ```
3. Start the development server:
    ```bash
    npm run dev
    ```

## Usage
1. Open your browser and navigate to `http://localhost:5173` for the frontend.
2. Access the backend API at `http://localhost:8000/api/`.

## Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes.



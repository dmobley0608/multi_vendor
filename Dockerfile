# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    nodejs \
    npm

# Copy the server requirements file into the container
COPY ./server/requirements.txt /app/server/requirements.txt

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r /app/server/requirements.txt

# Copy the server code into the container
COPY ./server /app/server

# Set the working directory for the client
WORKDIR /app/client

# Copy the client package.json and package-lock.json into the container
COPY ./client/package*.json ./

# Copy the rest of the client code into the container
COPY ./client .

# Install client dependencies
RUN npm install

# Build the client
RUN npm run build

# Copy the built client files to the server static directory
RUN cp -r dist/assets/* /app/server/core/static/
RUN mv /app/server/core/static/*.js /app/server/core/static/index.js
RUN mv /app/server/core/static/*.css /app/server/core/static/index.css

# Set the working directory back to the server
WORKDIR /app/server

# Run Django collectstatic, makemigrations, and migrate commands
RUN python manage.py collectstatic --noinput
RUN python manage.py makemigrations
RUN python manage.py migrate

# Create a superuser
RUN echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser(email='admin@admin.com', password='Password123!', name='Admin')" | python manage.py shell

# Expose port 8000
EXPOSE 8000

# Run the server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

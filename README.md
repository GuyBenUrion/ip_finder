# IP Address Finder

A simple web application that performs the following:

1. **Display the host's internal & public IP address.**  
2. **Resolve and display the IP address(es) for a given domain.**

Whenever a new domain is requested, the previously requested domains and their IP addresses remain on the screen. This project is built using a **FastAPI** backend (in Python) and a **React** frontend, and both are containerized using **Docker** and orchestrated with **Docker Compose**.

---


## Installation & Running

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine.
- [Docker Compose](https://docs.docker.com/compose/install/) installed.

# Setup

### Clone the repository to your local machine
git clone ip_finder

### Navigate into the project directory
cd ip_finder

### Build and start all containers using Docker Compose
docker-compose up --build


---



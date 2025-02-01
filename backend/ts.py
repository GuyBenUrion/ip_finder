

# getting the host IP address
export HOST_IP=$(hostname -I | awk '{print $1}')

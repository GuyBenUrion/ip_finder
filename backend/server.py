import socket
import requests
import dns.resolver
from datetime import datetime
from urllib.parse import urlparse
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# create fastapi app
app = FastAPI()

# were accesing the server from a different origin (localhost:3000) so we need to enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# store resolved domains and their IPs in memory
resolved_ips = {}

def get_sorted_resolved_ips():
    # returns all resolved IPs sorted by the latest timestamp
    return dict(sorted(resolved_ips.items(), key=lambda item: item[1]["timestamp"], reverse=True))

@app.post("/api/resolve/{domain}")  
def resolve_domain(domain: str):
    # access global var
    global resolved_ips

    # return all resolved IPs
    if domain == '__fetch_all__':
        return get_sorted_resolved_ips()

    # parse domain
    parsed_domain = urlparse(domain).netloc if "://" in domain else domain

    # check if domain is already resolved, return as latest
    if parsed_domain in resolved_ips:
        resolved_ips[parsed_domain]["timestamp"] = datetime.utcnow().isoformat()
        return get_sorted_resolved_ips()

    # get IP address for domain
    try:
        answers = dns.resolver.resolve(parsed_domain, 'A')
        ipv4_addresses = [answer.to_text() for answer in answers]
    except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN):
        return get_sorted_resolved_ips()

    resolved_ips[parsed_domain] = {
        "ip_addresses": ipv4_addresses,
        "timestamp": datetime.utcnow().isoformat()  # Store timestamp in ISO format
    }

    return get_sorted_resolved_ips()


@app.get("/api/get_local_ip")
def get_local_ip():
    try:
        # get local IP
        local_ipv4 = socket.gethostbyname(socket.gethostname())

    except socket.gaierror:
        raise HTTPException(status_code=500, detail="Failed to get local IP address")

    try:
        # get public IP
        response_public_ipv4 = requests.get("https://api.ipify.org/?format=json")
        public_ipv4 = response_public_ipv4.json()['ip']

    except requests.exceptions.RequestException:
        raise HTTPException(status_code=500, detail="Failed to get public IP address")

    return local_ipv4, public_ipv4
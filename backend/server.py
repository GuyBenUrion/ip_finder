import socket
import requests
import dns.resolver
from fastapi import FastAPI
from urllib.parse import urlparse
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

@app.get("/api/resolve/{domain}")  
def resolve_domain(domain: str):
    # access global var
    global resolved_ips

    # parse domain
    parsed_domain = urlparse(domain).netloc if "://" in domain else domain

    # check if domain is already resolved, if so dont do anything
    if parsed_domain in resolved_ips:
        return

    ipv4_addresses = []

    # get IP address for domain
    try:
        answers = dns.resolver.resolve(parsed_domain, 'A')
        ipv4_addresses = [answer.to_text() for answer in answers]
    except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN):
        pass

    # save to global var
    resolved_ips[parsed_domain] = [ipv4_addresses]

    return [ipv4_addresses]

@app.get("/api/all_resolved")
def get_all_resolved():
    # send all stored domains and IPs
    return resolved_ips 

@app.get("/api/get_local_ip")
def get_local_ip():
    # get local IP
    local_ipv4 = socket.gethostbyname(socket.gethostname())

    # get public IP
    response_public_ipv4 = requests.get("https://api.ipify.org/?format=json")
    public_ipv4 = response_public_ipv4.json()['ip']

    return local_ipv4, public_ipv4
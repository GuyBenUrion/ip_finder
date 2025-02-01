import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
    const [localIp, setLocalIp] = useState(null);
    const [domain, setDomain] = useState("");
    const [resolvedIp, setResolvedIp] = useState([]);

    // fetch all stored IPs when the app loads
    useEffect(() => {
        const fetchStoredIps = async () => {
            try {
                const response = await axios.get("http://localhost:8000/api/all_resolved");
                const storedData = response.data;

                // extract domains and IPs from response
                const formattedData = Object.keys(storedData).map(domain => ({
                    domain,
                    domainIp: storedData[domain][0].length > 0 ? storedData[domain][0].join(", ") : "N/A",
                }));

                setResolvedIp(formattedData);
            } catch (error) {
                console.error("Error fetching stored IPs:", error);
            }
        };

        fetchStoredIps();
    }, []);

    // get domain IP address
    const resolveDomain = async () => {
        if (!domain) return;

        // prevent duplicate domains
        if (resolvedIp.some(entry => entry.domain === domain)) {
            alert(`The domain "${domain}" has already been resolved.`);
            return;
        }

        try {
            const response = await axios.get(`http://localhost:8000/api/resolve/${domain}`);
            const domainIp = response.data[0].length > 0 ? response.data[0].join(", ") : "N/A";

            setResolvedIp(prevDomainIps => [...prevDomainIps, { domain, domainIp}]);

        } catch (error) {
            console.error("Error resolving domain:", error);
        }
    };
    
    // get local privet and public IP addresses
    const getLocalIp = async () => {
        try {
            const response = await axios.get("http://localhost:8000/api/get_local_ip");
            setLocalIp(response.data);
        } catch (error) {
            console.error("Error fetching local IP:", error);
        }
    }

    return (
        <div style={{padding: "20px"}}>
            <h1>IP Address Finder</h1>
            <button onClick={getLocalIp}>Get Local IP</button>
            {localIp && (
              <div>
                <h2>Local IP Address</h2>
                <p>Internal IP: {localIp[0]}</p>
                <p>Public IP: {localIp[1]}</p>
              </div>
            )}
            <h2>Resolve Domain</h2>
            <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter domain (e.g., google.com)"
            />
            <button onClick={resolveDomain}>Resolve</button>

            {resolvedIp.length > 0 && (
                <div>
                    <h3>Resolved Domains:</h3>
                    {resolvedIp.map((entry, index) => (
                        <div key={index}>
                            <strong>{entry.domain}</strong>
                            <ul>
                                <li>IP Address: {entry.domainIp}</li>
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default App;

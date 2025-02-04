import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

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
    
                // Convert storedData object into an array with domain, IP, and timestamp
                const formattedData = Object.entries(storedData)
                    .map(([domain, data]) => {
                        const ipList = data.ip_addresses; // Extract the IP list
                        const timestamp = data.timestamp;
    
                        // Ensure it has valid data before saving
                        if (ipList.length > 0 && ipList[0].trim() !== "") {
                            return {
                                domain,
                                domainIp: ipList.join(", "),
                                timestamp
                            };
                        }
                        return null; // Exclude invalid entries
                    })
                    .filter(entry => entry !== null) // Remove null values
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Ensure sorting by latest timestamp
    
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
    
        try {
            const response = await axios.get(`http://localhost:8000/api/resolve/${domain}`);
            const resolvedData = response.data; // API now returns all resolved domains sorted

            // Convert response object to an array and process it
            const formattedData = Object.entries(resolvedData).map(([domain, data]) => ({
                domain,
                domainIp: data.ip_addresses.length > 0 ? data.ip_addresses.join(", ") : "N/A",
                timestamp: data.timestamp
            }));
    
            // If IP is "N/A", show alert and do not add to the list
            if (formattedData.some(entry => entry.domainIp === "N/A")) {
                alert(`IP not found for domain: ${domain}`);
                return;
            }
    
            // Update state with new sorted data
            setResolvedIp(formattedData);
    
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
        <div className="container">
            {/* Fixed Top Section */}
            <div className="fixed-header">
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
                <br />
                <button onClick={resolveDomain}>Resolve</button>
                <h3>Resolved Domains:</h3>
            </div>
    
            {/* Scrollable List Section */}
            <div className="scrollable-content">
                {resolvedIp.length > 0 && (
                    <div>
                        {resolvedIp.map((entry, index) => (
                            <div key={index} className="resolved-item">
                                <strong>{entry.domain}</strong>
                                <ul>
                                    <li>IP Address: {entry.domainIp}</li>
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
    
}

export default App;

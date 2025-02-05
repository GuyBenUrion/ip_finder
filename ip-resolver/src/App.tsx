import "./App.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { useQuery, useMutation, QueryClient, QueryClientProvider } from "@tanstack/react-query";


function App() {
    // const [domain, setDomain] = useState("");
    // const [resolvedIp, setResolvedIp] = useState([]);

    // fetch all stored IPs when the app loads
    // useEffect(() => {
    //     const fetchStoredIps = async () => {
    //         try {
    //             const response = await axios.get("http://localhost:8000/api/resolve");
    //             const storedData = response.data;

    //             // convert storedData object into an array with domain, IP, and timestamp
    //             const formattedData = Object.entries(storedData)
    //             .reduce((acc,[domain, data]) => {
    //                 const ipList = data.ip_addresses; // Extract the IP list
    //                 const timestamp = data.timestamp;

    //                 // Ensure it has valid data before saving
    //                 if (ipList.length > 0 && ipList[0].trim() !== "") {
    //                     acc.push({
    //                         domain,
    //                         domainIp: ipList.join(", "),
    //                         timestamp
    //                     });
    //                 }
    //                 return acc;
    //             }, []);

    //             setResolvedIp(formattedData);
    //         } catch (error) {
    //             console.error("Error fetching stored IPs:", error);
    //         }
    //     };
    
    //     fetchStoredIps();
    // }, []);


    
    const {data: resolvedIps, isPending: pendingResolvedlIps, error: resolvedIpsError, mutate} = useMutation({
        mutationFn: async (domain) => {
            const response = await axios.post(`http://localhost:8000/api/resolve/${domain}`);
            const storedData = response.data;

            // convert storedData object into an array with domain, IP, and timestamp
            return Object.entries(storedData)
            .reduce((acc,[domain, data]:[any, any]) => {
                const ipList = data.ip_addresses; // Extract the IP list
                const timestamp = data.timestamp;

                // Ensure it has valid data before saving
                if (ipList.length > 0 && ipList[0].trim() !== "") {
                    acc.push({
                        domain,
                        domainIp: ipList.join(", "),
                        timestamp
                    });
                }
                return acc;
            }, [] as any);
        },
        onError: (err, variables, context) => {
            // Roll back to the previous value
            console.error("Error fetching stored IPs:", err);
        },
    });

    // get domain IP address
    // const resolveDomain = async () => {
    //     if (!domain) return;

    //     try {
    //         const response = await axios.post(`http://localhost:8000/api/resolve/${domain}`);
    //         const resolvedData = response.data; // API now returns all resolved domains sorted


    //         // Convert response object to an array and process it
    //         const formattedData = Object.entries(resolvedData).map(([domain, data]) => ({
    //             domain,
    //             domainIp: data.ip_addresses.length > 0 ? data.ip_addresses.join(", ") : "N/A",
    //             timestamp: data.timestamp
    //         }));
    
    //         // If IP is "N/A", show alert and do not add to the list
    //         if (formattedData.some(entry => entry.domainIp === "N/A")) {
    //             alert(`IP not found for domain: ${domain}`);
    //             return;
    //         }

    //         // Update state with new sorted data
    //         setResolvedIp(formattedData);
    
    //     } catch (error) {
    //         console.error("Error resolving domain:", error);
    //     }
    // };
    
    // get local privet and public IP addresses
      const { data: localIp, isLoading: loadingLocalIp, error: localIpError, refetch: refetchLocalIp } = useQuery({
        queryKey: ["localIp"],
        queryFn: async () => {
            const response = await axios.get("http://localhost:8000/api/get_local_ip");
            return response.data;
        },
        enabled: false, 
    });

    useEffect(() => {
      mutate("all");
    }, []);

    return (
        <div className="container">
            {/* Fixed Top Section */}
            <div className="fixed-header">
                <h1>IP Address Finder</h1>
                
                <button onClick={() => refetchLocalIp()}>Get Local IP</button>
                {loadingLocalIp && <p>Loading local IP...</p>}
                {localIpError && <p className="error">Error: {localIpError.message}</p>}
                {localIp && (
                    <div>
                        <h2>Local IP Address</h2>
                        <p>Internal IP: {localIp[0]}</p>
                        <p>Public IP: {localIp[1]}</p>
                    </div>
                )}
               
                <form onSubmit={(e) => e.preventDefault()}>
                  <input
                    type="text"
                    name="domainInput"
                    placeholder="Enter domain (e.g., www.google.com)"
                />
                <br />
                <button onClick={(e)=> mutate(e.target.form.domainInput.value)}>Resolve</button>
                
                </form>
                <h2>Resolve Domain</h2>

                <h3>Resolved Domains:</h3>
            </div>
    
            <div className="scrollable-content">
                {resolvedIps &&(
                    <div>
                        {resolvedIps.map((entry, index) => (
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

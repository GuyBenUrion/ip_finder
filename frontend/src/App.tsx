import "./App.css";
import axios from "axios";
import { useEffect } from "react";
import { useQuery, useMutation} from "@tanstack/react-query";


function App() {
    // get stored IP addresses
    const {data: resolvedIps, mutate} = useMutation({
        mutationFn: async (domain) => {
            const response = await axios.post(`http://localhost:8000/api/resolve/${domain}`);
            const storedData = response.data;

            // convert storedData object into an array with domain, IP, and timestamp
            return Object.entries(storedData)
            .reduce((acc,[domain, domainData]:[any, any]) => {
                const ipList = domainData.ip_addresses; // Extract the IP list
                const timestamp = domainData.timestamp;

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
        onError: (err) => {
            // Roll back to the previous value
            console.error("Error fetching stored IPs:", err);
        },
    });

    // get local privet and public IP addresses
      const { data: localIp, isLoading: loadingLocalIp, error: localIpError, refetch: refetchLocalIp } = useQuery({
        queryKey: ["localIp"],
        queryFn: async () => {
            const response = await axios.get("http://localhost:8000/api/get_local_ip");
            return response.data;
        },
  
        // making sure that the query is not refetched on every render
        enabled: false, 
    });

    useEffect(() => {
      mutate("__fetch_all__");
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
                <button onClick={(e)=> mutate(e.currentTarget.form?.domainInput.value)}>Resolve</button>
                
                </form>

            </div>
    
            <div className="scrollable-content">
                {resolvedIps &&(
                  <div>
                      <h3>Resolved Domains:</h3>
                        {resolvedIps.map((entry) => (
                            <div key={entry.domain} className="resolved-item">
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

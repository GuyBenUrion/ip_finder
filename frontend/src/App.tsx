import "./App.css";
import axios from "axios";
import { useQuery, useMutation, useQueryClient} from "@tanstack/react-query";

const ALL_IPS='all_resolved_ip';

interface ResolvedIp {
    domain: string;
    domainIp: string;
    timestamp: string;
};

interface ResolvedIPs {
    [domain: string]: {
    ip_addresses: string[];
    timestamp: string;
    };
}

const arrangeDomin=(resolvedIPs:ResolvedIPs)=>{
    return Object.entries(resolvedIPs)
    .reduce((acc,[domain, domainData]) => {
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
    }, [] as ResolvedIp[]);
}

function App() {
    const queryClient = useQueryClient()
    
    // get stored IP addresses
    const { mutate } = useMutation({
        mutationFn: async (domain: string) => {
            const response = await axios.post(`http://localhost:8000/api/resolve/${domain}`);
            return arrangeDomin( response.data as ResolvedIPs);            
        },
        onSuccess:(data)=> {
            queryClient.setQueryData([ALL_IPS],data)
        },
        onError: (err) => {
            console.error("Error fetching stored IPs:", err);
        },
    });
    
    
    const {  data :resolvedIps } = useQuery({
        queryKey: [ALL_IPS],
        queryFn: async ()=>{
            const response = await axios.get(`http://localhost:8000/api/all_resolved`);
            return arrangeDomin(response.data as ResolvedIPs);
        },
      })


    // get local privet and public IP addresses
      const { data: localIp, isLoading: loadingLocalIp, error: localIpError, refetch: refetchLocalIp } = useQuery({
        queryKey: ["localIp"],
        queryFn: async () => {
            const response = await axios.get("http://localhost:8000/api/get_local_ip");
            return response.data;
        },
        enabled: false, 
    });

  

    return (
        <div className="container">
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
                {resolvedIps ? (
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
                ) : null}
            </div>
        </div>

    );
    
}

export default App;
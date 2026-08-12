import dns from "dns";

dns.setServers(["8.8.8.8"]);

dns.resolveSrv(
    "_mongodb._tcp.cluster0.mz1cqci.mongodb.net",
    (err, addresses) => {
        console.log(err || addresses);
    }
);
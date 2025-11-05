export async function handler(req, context) {
    const validAdtHostSuffixes = ["digitaltwins.azure.net"];

    const xAdtHostHeader = req.headers["x-adt-host"];
    if (!xAdtHostHeader) {
        return {
            status: 400,
            body: "Missing x-adt-host header"
        };
    }

    const adtUrl = `https://${xAdtHostHeader.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
    const adtUrlObject = new URL(adtUrl);

    if (!validAdtHostSuffixes.some((suffix) => adtUrlObject.host.endsWith(suffix))) {
        return {
            status: 400,
            body: "Invalid ADT Environment URL"
        };
    }

    // Extract the path from the original URL
    const originalUrl = new URL(req.url);
    const path = originalUrl.pathname.replace('/api/adt', '');
    const targetUrl = adtUrl + path + originalUrl.search;

    try {
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                Authorization: req.headers["authorization"],
                "Content-Type": req.headers["content-type"] || "application/json",
            },
            body: ["POST", "PUT", "PATCH"].includes(req.method) && req.body
                ? JSON.stringify(req.body)
                : undefined,
        });

        const data = await response.text();

        return {
            status: response.status,
            headers: {
                "Content-Type": response.headers.get("content-type"),
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "x-adt-host, authorization, content-type"
            },
            body: data
        };
    } catch (error) {
        console.error("Proxy error:", error);
        return {
            status: 500,
            body: `Proxy request failed: ${error.message}`
        };
    }
}

// Handle CORS preflight requests
export async function options() {
    return {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "x-adt-host, authorization, content-type"
        }
    };
}
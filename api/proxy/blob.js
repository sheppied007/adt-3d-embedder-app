export async function handler(req, context) {
    try {
        const blobHost = req.headers["x-blob-host"];

        if (!blobHost) {
            return {
                status: 400,
                body: "Missing x-blob-host header"
            };
        }

        const originalUrl = new URL(req.url);
        const path = originalUrl.pathname.replace('/api/blob', '');
        const blobUrl = `https://${blobHost}${path}${originalUrl.search}`;

        const response = await fetch(blobUrl);
        const buffer = await response.arrayBuffer();

        const contentType = response.headers.get("content-type") || "application/octet-stream";

        return {
            status: response.status,
            headers: {
                "Content-Type": contentType,
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "x-blob-host"
            },
            body: Buffer.from(buffer).toString('base64'),
            isBase64Encoded: true
        };
    } catch (err) {
        console.error("Proxy error:", err);
        return {
            status: 500,
            body: `Proxy error: ${err.message}`
        };
    }
}

// Handle CORS preflight requests
export async function options() {
    return {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "x-blob-host"
        }
    };
}
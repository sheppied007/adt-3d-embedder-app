// api/proxy/blob.js
const fetch = require("node-fetch");

module.exports = async function (context, req) {
    try {
        const blobHost = req.headers["x-blob-host"];

        if (!blobHost) {
            context.res = { status: 400, body: "Missing x-blob-host header" };
            return;
        }

        const urlPath = req.url.replace(/^\/api\/proxy\/blob/, "");
        const blobUrl = `https://${blobHost}${urlPath}`;

        const response = await fetch(blobUrl);
        const buffer = await response.arrayBuffer();

        // Determine content type
        const contentType = response.headers.get("content-type") || "application/octet-stream";

        context.res = {
            status: response.status,
            headers: { "Content-Type": contentType },
            body: Buffer.from(buffer),
        };
    } catch (err) {
        context.res = {
            status: 500,
            body: `Proxy error: ${err.message}`,
        };
    }
};

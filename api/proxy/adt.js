import fetch from "node-fetch";

const validAdtHostSuffixes = ["digitaltwins.azure.net"];

export default async function (context, req) {
    const xAdtHostHeader = req.headers["x-adt-host"];
    if (!xAdtHostHeader) {
        context.res = { status: 400, body: "Missing x-adt-host header" };
        return;
    }

    const adtUrl = `https://${xAdtHostHeader.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
    const adtUrlObject = new URL(adtUrl);

    if (!validAdtHostSuffixes.some((suffix) => adtUrlObject.host.endsWith(suffix))) {
        context.res = { status: 400, body: "Invalid ADT Environment URL" };
        return;
    }

    const targetUrl = adtUrl + req.url.replace("/api/proxy/adt", "");

    try {
        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                Authorization: req.headers["authorization"],
                "Content-Type": req.headers["content-type"] || "application/json",
            },
            body: ["POST", "PUT", "PATCH"].includes(req.method)
                ? JSON.stringify(req.body)
                : undefined,
        });

        const data = await response.text();
        context.res = {
            status: response.status,
            headers: {
                "Content-Type": response.headers.get("content-type"),
            },
            body: data,
        };
    } catch (error) {
        context.log("Proxy error:", error);
        context.res = {
            status: 500,
            body: `Proxy request failed: ${error.message}`,
        };
    }
}

const tokenCache: Record<string, { token: string; expiresOn: number }> = {};

export async function getTokenForScope(scope: string) {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || "https://app-digitwin-token-broker-prod-dudsh4a4b6c4ghf3.uksouth-01.azurewebsites.net";
    const service =
        scope.includes("digitaltwins") ? "adt" :
            scope.includes("storage") ? "storage" : "adt";

    const cached = tokenCache[service];
    if (cached && cached.expiresOn > Date.now() + 60 * 1000) {  // 1 minute buffer
        return cached.token;
    }

    const res = await fetch(`${backendUrl}/api/token/${service}`);
    const data = await res.json();

    tokenCache[service] = {
        token: data.accessToken,
        expiresOn: Date.now() + (data.expiresIn ?? 3600) * 1000
    };

    return data.accessToken;
}
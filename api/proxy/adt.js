// api/proxy/adt.js
const { createProxyMiddleware } = require('http-proxy-middleware');

const validAdtHostSuffixes = ['digitaltwins.azure.net'];

const adtProxy = createProxyMiddleware({
    changeOrigin: true,
    secure: true,
    target: '/',
    pathRewrite: { '^/api/proxy/adt': '' },
    router: (req) => {
        const xAdtHostHeader = req.headers['x-adt-host'];
        if (!xAdtHostHeader) throw new Error('Missing x-adt-host header');

        const adtUrl = `https://${xAdtHostHeader.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;
        const adtUrlObject = new URL(adtUrl);

        if (validAdtHostSuffixes.some(suffix => adtUrlObject.host.endsWith(suffix))) {
            return adtUrl;
        }

        throw new Error('Invalid ADT Environment URL');
    }
});

module.exports = adtProxy;
// api/proxy/blob.js
const { createProxyMiddleware } = require('http-proxy-middleware');

const validBlobHostSuffixes = ['blob.core.windows.net'];

const blobProxy = createProxyMiddleware({
    changeOrigin: true,
    secure: true,
    target: '/',
    pathRewrite: { '^/api/proxy/blob': '' },
    router: (req) => {
        const blobHost = req.headers['x-blob-host'];
        if (!blobHost) throw new Error('Missing x-blob-host header');

        const blobUrl = `https://${blobHost.replace(/^https?:\/\//, '').replace(/\/$/, '')}`;
        const blobUrlObject = new URL(blobUrl);

        if (validBlobHostSuffixes.some(suffix => blobUrlObject.host.endsWith(suffix))) {
            return blobUrl;
        }

        throw new Error('Invalid Blob URL');
    }
});

module.exports = blobProxy;

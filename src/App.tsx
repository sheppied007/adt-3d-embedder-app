import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import './App.css';
import {
    ADT3DSceneAdapter,
    ADT3DViewer,
    Locale,
    Theme
} from '@microsoft/iot-cardboard-js';
import { getTokenForScope } from './services/backend-auth-service';

const cardStyle = {
    height: '100%',
    color: 'white'
} as React.CSSProperties;

function App() {
    const search = useLocation().search;
    const sceneId = new URLSearchParams(search).get('sceneId') ?? '942097f6332e4f21ab3652a55481fc34';

    const [adapter, setAdapter] = useState<ADT3DSceneAdapter | null>(null);
    const [scenesConfig, setScenesConfig] = useState(null);

    useEffect(() => {
        const authenticationParameters = {
            hostUrl: process.env.REACT_APP_ADT_URL ?? '',
            blobContainerUrl: process.env.REACT_APP_STORAGE_URL,
            tenantId: process.env.REACT_APP_TENANT_ID,
            uniqueObjectId: 'http://digitaltwins.azure.net',
        };

        const customAuthService = {
            login: async () => Promise.resolve(),
            logout: async () => Promise.resolve(),
            getToken: async (scope?: string) => {
                return await getTokenForScope(scope ?? "https://digitaltwins.azure.net/.default");
            }
        };

        setAdapter(
            new ADT3DSceneAdapter(
                customAuthService,
                authenticationParameters.hostUrl,
                authenticationParameters.blobContainerUrl,
                authenticationParameters.tenantId,
                authenticationParameters.uniqueObjectId
            )
        );
    }, []);

    useEffect(() => {
        if (adapter) {
            adapter.getScenesConfig().then(({ result }) => {
                console.log("Results:", result);
                if (result && result.data) {
                    setScenesConfig(result.data as any);
                }
            }).catch(err => {
                console.error("Failed to fetch scenes config:", err);
            });
        }
    }, [adapter]);

    return !scenesConfig ? (
        <div>Loading scenes..</div>
    ) : (
        <div style={cardStyle}>
            <ADT3DViewer
                theme={Theme.Kraken}
                locale={Locale.EN}
                sceneId={sceneId}
                scenesConfig={scenesConfig}
                adapter={adapter as any}
            />
        </div>
    );
}

export default App;
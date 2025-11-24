import React, { useEffect, useState } from 'react';
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
    const [sceneId, setSceneId] = useState<string>("");
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
                if (result && result.data) {
                    setScenesConfig(result.data as any);
                }
            }).catch(err => {
                console.error("Failed to fetch scenes config:", err);
            });
        }

        let sceneIdFromSettings = process.env.REACT_APP_SCENE_ID ?? "942097f6332e4f21ab3652a55481fc34";
        setSceneId(sceneIdFromSettings);
    }, [adapter]);

    return !scenesConfig ? (
        <div className="loading-container">
            <img src="/adt.png" alt="Loading Icon" className="loading-icon" />
            <div className="dot-spinner"></div>
        </div>
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
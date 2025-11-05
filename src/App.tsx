import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import './App.css';
import {
  ADT3DSceneAdapter,
  ADT3DViewer,
  Locale,
  MsalAuthService,
  Theme
} from '@microsoft/iot-cardboard-js';

const cardStyle = {
  height: '100%',
  color: 'white'
} as React.CSSProperties;

function App() {
  console.log("App loaded");

  const search = useLocation().search;
  const sceneId = new URLSearchParams(search).get('sceneId') ?? 'Home1';

  const [adapter, setAdapter] = useState<ADT3DSceneAdapter | null>(null);
  const [scenesConfig, setScenesConfig] = useState(null);

  useEffect(() => {
    const authenticationParameters = {
      hostUrl: process.env.REACT_APP_ADT_URL ?? '',
      blobContainerUrl: process.env.REACT_APP_STORAGE_URL,
      aadParameters: {
        authority: `https://login.microsoftonline.com/${process.env.REACT_APP_TENANT_ID}`,
        clientId: process.env.REACT_APP_CLIENT_ID ?? '',
        scope: 'https://digitaltwins.azure.net/.default',
        redirectUri: process.env.REACT_APP_REDIRECT_URL ?? '',
        tenantId: process.env.REACT_APP_TENANT_ID,
        uniqueObjectId: 'http://digitaltwins.azure.net'
      }
    };


    setAdapter(
      new ADT3DSceneAdapter(
        new MsalAuthService(authenticationParameters.aadParameters),
        authenticationParameters.hostUrl,
        authenticationParameters.blobContainerUrl,
        authenticationParameters.aadParameters.tenantId,
        authenticationParameters.aadParameters.uniqueObjectId
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
    <div>Loading scenes...</div>
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
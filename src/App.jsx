import React from 'react';
import { useProfileState } from './hooks/useProfileState';
import { BLEND_MODES } from './constants';
import MainView from './components/MainView';
import './styles/App.css';

function App() {
  const { layerConfigs, updateLayerConfig } = useProfileState();

  return (
    <div className="app">
      <MainView
        layerConfigs={layerConfigs}
        onLayerConfigChange={updateLayerConfig}
        blendModes={BLEND_MODES}
      />
    </div>
  );
}

export default App;
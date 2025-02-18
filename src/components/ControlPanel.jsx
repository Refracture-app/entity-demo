import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../styles/ControlPanel.css';

const ControlPanel = ({
    layerConfigs,
    onLayerConfigChange,
    blendModes,
    isMinimized,
    onToggleMinimize
}) => {
    const [activeTab, setActiveTab] = useState('layer1');

    const handleSliderChange = (e) => {
        const { name, value } = e.target;
        const layerId = activeTab === 'layer1' ? 1 : 2;
        onLayerConfigChange(layerId, name, parseFloat(value));
    };

    const renderLayerControls = (layerId) => {
        const config = layerConfigs[layerId];
        return (
            <div className="controls-container">
                <div className="slider-group">
                    {[
                        { name: 'speed', min: 0.02, max: 0.5, step: 0.05 },
                        { name: 'size', min: 0.3, max: 2.0, step: 0.1 },
                        { name: 'xaxis', min: 10, max: 3000, step: 10 },
                        { name: 'yaxis', min: 10, max: 3000, step: 10 },
                        { name: 'drift', min: 0, max: 1, step: 0.1 },
                        { name: 'driftSpeed', min: 0.1, max: 2.0, step: 0.1 }
                    ].map(({ name, min, max, step }) => (
                        <div key={name} className="slider-container">
                            <div className="slider-header">
                                <span className="slider-label">{name.toUpperCase()}</span>
                                <span className="slider-value">
                                    {Number(config[name]).toFixed(name === 'speed' ? 3 : 1)}
                                </span>
                            </div>
                            <input
                                type="range"
                                name={name}
                                min={min}
                                max={max}
                                step={step}
                                value={config[name]}
                                onChange={handleSliderChange}
                            />
                        </div>
                    ))}

                    <div className="slider-container">
                        <div className="slider-header">
                            <span className="slider-label">BLEND MODE</span>
                        </div>
                        <select 
                            className="blend-mode-select"
                            name="blendMode"
                            value={config.blendMode}
                            onChange={(e) => onLayerConfigChange(layerId, 'blendMode', e.target.value)}
                        >
                            {blendModes.map(mode => (
                                <option key={mode} value={mode}>
                                    {mode.split('-').map(word => 
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="direction-control">
                        <button 
                            className="direction-button"
                            onClick={() => onLayerConfigChange(layerId, 'direction', -config.direction)}
                        >
                            ⟳ Change Direction
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Minimized view
    if (isMinimized) {
        return (
            <div 
                className="control-panel-minimized"
                onClick={onToggleMinimize}
            >
                <div className="minimized-icon">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <line x1="4" y1="12" x2="20" y2="12"></line>
                        <line x1="4" y1="6" x2="20" y2="6"></line>
                        <line x1="4" y1="18" x2="20" y2="18"></line>
                    </svg>
                </div>
            </div>
        );
    }

    return (
        <div className="control-panel">
            <div className="panel-header">
                <span>Controls</span>
                <button 
                    className="minimize-button"
                    onClick={onToggleMinimize}
                >
                    −
                </button>
            </div>

            <div className="panel-content">
                <div className="tab-navigation">
                    <button 
                        className={`tab-button ${activeTab === 'layer1' ? 'active' : ''}`}
                        onClick={() => setActiveTab('layer1')}
                    >
                        Layer 1
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'layer2' ? 'active' : ''}`}
                        onClick={() => setActiveTab('layer2')}
                    >
                        Layer 2
                    </button>
                </div>

                {activeTab === 'layer1' && renderLayerControls(1)}
                {activeTab === 'layer2' && renderLayerControls(2)}
            </div>
        </div>
    );
};

ControlPanel.propTypes = {
    layerConfigs: PropTypes.object.isRequired,
    onLayerConfigChange: PropTypes.func.isRequired,
    blendModes: PropTypes.arrayOf(PropTypes.string).isRequired,
    isMinimized: PropTypes.bool.isRequired,
    onToggleMinimize: PropTypes.func.isRequired
};

export default ControlPanel;
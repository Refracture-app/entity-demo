import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ControlPanel from './ControlPanel';
import CanvasManager from '../utils/CanvasManager';
import { APP_CONFIG } from '../constants';
import '../styles/MainView.css';

const MainView = ({
    layerConfigs = {},
    onLayerConfigChange = () => {},
    blendModes = []
}) => {
    const [isMinimized, setIsMinimized] = useState(true);
    const canvasRefs = {
        1: useRef(null),
        2: useRef(null)
    };
    
    const managerRefs = useRef({});
    const resizeTimeoutRef = useRef(null);

    useEffect(() => {
        if (!layerConfigs || !Object.keys(layerConfigs).length) return;

        // Initialize canvas managers
        Object.keys(canvasRefs).forEach(layerId => {
            const canvas = canvasRefs[layerId]?.current;
            if (!canvas) return;
            
            managerRefs.current[layerId] = new CanvasManager(canvas, layerId);
            managerRefs.current[layerId].setImage(
                `${APP_CONFIG.BASE_IMAGE_PATH}${APP_CONFIG.ASSETS[`LAYER_${layerId}`]}`
            );
        });

        // Start animations with current config
        Object.keys(layerConfigs).forEach(layerId => {
            const manager = managerRefs.current[layerId];
            if (manager) {
                manager.animate(layerConfigs[layerId]);
            }
        });

        const handleResize = () => {
            if (resizeTimeoutRef.current) {
                cancelAnimationFrame(resizeTimeoutRef.current);
            }
            
            resizeTimeoutRef.current = requestAnimationFrame(() => {
                Object.values(managerRefs.current).forEach(manager => {
                    if (manager && typeof manager.resize === 'function') {
                        manager.resize();
                    }
                });
            });
        };

        window.addEventListener('resize', handleResize, { passive: true });

        return () => {
            window.removeEventListener('resize', handleResize);
            if (resizeTimeoutRef.current) {
                cancelAnimationFrame(resizeTimeoutRef.current);
            }
            Object.values(managerRefs.current).forEach(manager => {
                if (manager && typeof manager.stop === 'function') {
                    manager.stop();
                }
            });
            managerRefs.current = {};
        };
    }, [layerConfigs]);

    return (
        <div className="main-view">
            <div className="canvas-container">
                <div className="grid-overlay"></div>
                {[1, 2].map(layerId => (
                    <canvas
                        key={layerId}
                        ref={canvasRefs[layerId]}
                        className="canvas"
                        style={{
                            zIndex: layerId,
                            mixBlendMode: layerConfigs[layerId]?.blendMode || 'normal'
                        }}
                    />
                ))}
                <img 
                    src={`${APP_CONFIG.BASE_IMAGE_PATH}${APP_CONFIG.ASSETS.ENTITY_LOGO}`}
                    alt="Entity" 
                    className="entity-logo"
                />
            </div>

            <ControlPanel
                layerConfigs={layerConfigs}
                onLayerConfigChange={onLayerConfigChange}
                blendModes={blendModes}
                isMinimized={isMinimized}
                onToggleMinimize={() => setIsMinimized(!isMinimized)}
            />
        </div>
    );
};

MainView.propTypes = {
    layerConfigs: PropTypes.object,
    onLayerConfigChange: PropTypes.func,
    blendModes: PropTypes.arrayOf(PropTypes.string)
};

export default MainView;
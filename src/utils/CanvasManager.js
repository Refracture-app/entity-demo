class CanvasManager {
    constructor(canvas, layerId) {
        this.canvas = canvas;
        this.layerId = layerId;
        this.ctx = canvas.getContext('2d', {
            alpha: true,
            willReadFrequently: false
        });
        
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';

        this.image = new Image();
        this.animationFrame = null;
        this.resizing = false;
        this.lastDrawTime = 0;
        this.FRAME_RATE = 60;
        this.FRAME_INTERVAL = 1000 / this.FRAME_RATE;
        
        this.animate = this.animate.bind(this);
        this.setupCanvas();
    }

    setupCanvas() {
        if (!this.canvas.parentElement) return;

        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const width = Math.floor(rect.width);
        const height = Math.floor(rect.height);
        
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.canvas.width = width * dpr;
        this.canvas.height = height * dpr;
        
        this.ctx.scale(dpr, dpr);
    }

    setImage(src) {
        return new Promise((resolve, reject) => {
            this.image.onload = () => {
                if (this.animationFrame) {
                    this.draw(this.currentConfig);
                }
                // Initial draw to prevent black borders
                else {
                    const defaultConfig = {
                        size: 1,
                        xaxis: 0,
                        yaxis: 0,
                        drift: 0,
                        driftState: { x: 0, y: 0 },
                        angle: 0,
                        direction: 1,
                        blendMode: 'normal'
                    };
                    this.currentConfig = defaultConfig;
                    this.draw(defaultConfig);
                }
                resolve();
            };
            this.image.onerror = reject;
            this.image.src = src;
        });
    }

    drawQuadrant(config, x, y, width, height) {
        if (!width || !height || !this.image.complete) return;
        
        this.ctx.save();
        
        this.ctx.filter = 'blur(0.3px)';
        
        this.ctx.beginPath();
        this.ctx.rect(x, y, width, height);
        this.ctx.clip();
        
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        
        const imgAspectRatio = this.image.width / this.image.height;
        let imgWidth = width * config.size;
        let imgHeight = imgWidth / imgAspectRatio;
        
        if (imgHeight > height * config.size) {
            imgHeight = height * config.size;
            imgWidth = imgHeight * imgAspectRatio;
        }
        
        const drawX = centerX + config.xaxis/10 + (config.driftState?.x || 0);
        const drawY = centerY + config.yaxis/10 + (config.driftState?.y || 0);
        
        this.ctx.translate(drawX, drawY);
        this.ctx.rotate(config.angle * Math.PI / 180);
        
        this.ctx.drawImage(
            this.image,
            -imgWidth / 2,
            -imgHeight / 2,
            imgWidth,
            imgHeight
        );
        
        this.ctx.restore();
    }

    draw(config) {
        if (!this.image.complete) return;

        const dpr = window.devicePixelRatio || 1;
        const width = this.canvas.width / dpr;
        const height = this.canvas.height / dpr;
        
        // Create an offscreen canvas for the first quadrant
        const quadrantCanvas = document.createElement('canvas');
        const quadrantCtx = quadrantCanvas.getContext('2d', {
            alpha: true,
            willReadFrequently: false
        });
        quadrantCanvas.width = width/2 * dpr;
        quadrantCanvas.height = height/2 * dpr;
        quadrantCtx.scale(dpr, dpr);
        
        // Clear main canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw first quadrant to offscreen canvas
        this.ctx.save();
        this.drawQuadrant(config, 0, 0, width/2, height/2);
        
        // Copy the first quadrant
        quadrantCtx.drawImage(
            this.canvas,
            0, 0, width/2 * dpr, height/2 * dpr,
            0, 0, width/2, height/2
        );
        this.ctx.restore();
        
        // Clear main canvas again
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw all quadrants using the offscreen canvas
        // First quadrant
        this.ctx.drawImage(quadrantCanvas, 0, 0);
        
        // Mirror horizontally
        this.ctx.save();
        this.ctx.translate(width, 0);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(quadrantCanvas, 0, 0);
        this.ctx.restore();
        
        // Mirror vertically (both sides)
        this.ctx.save();
        this.ctx.translate(0, height);
        this.ctx.scale(1, -1);
        // Left side
        this.ctx.drawImage(quadrantCanvas, 0, 0);
        // Right side
        this.ctx.translate(width, 0);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(quadrantCanvas, 0, 0);
        this.ctx.restore();
    }

    updateDrift(config) {
        if (config.drift > 0) {
            const time = (Date.now() - (config.driftState?.startTime || Date.now())) / 1000;
            config.driftState = config.driftState || {};
            config.driftState.x = Math.sin(time * (config.driftSpeed || 0.1)) * 150 * config.drift;
            config.driftState.y = Math.cos(time * (config.driftSpeed || 0.1)) * 150 * config.drift;
        } else {
            config.driftState = { x: 0, y: 0 };
        }
    }

    animate(config) {
        this.currentConfig = config;
        
        if (config.speed !== 0) {
            const now = performance.now();
            const elapsed = now - this.lastDrawTime;

            if (elapsed > this.FRAME_INTERVAL) {
                config.angle = (config.angle + config.speed * config.direction) % 360;
                this.updateDrift(config);
                this.draw(config);
                this.lastDrawTime = now - (elapsed % this.FRAME_INTERVAL);
            }

            this.animationFrame = requestAnimationFrame(() => this.animate(config));
        }
    }

    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    resize() {
        this.setupCanvas();
        if (this.currentConfig) {
            this.draw(this.currentConfig);
        }
    }
}

export default CanvasManager;
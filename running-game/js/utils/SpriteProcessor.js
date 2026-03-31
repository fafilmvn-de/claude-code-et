// Sprite processing utility to remove grey checkerboard backgrounds
export class SpriteProcessor {
    constructor() {
        this.processedImages = new Map();
    }
    
    // Process an image to remove grey checkerboard background (async)
    async processImage(image, key) {
        if (!image || this.processedImages.has(key)) {
            return this.processedImages.get(key) || image;
        }
        
        return new Promise((resolve) => {
            try {
                // Create a temporary canvas for processing
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = image.width;
                canvas.height = image.height;
                
                // Draw the original image
                ctx.drawImage(image, 0, 0);
                
                // Get image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // Process each pixel to remove grey backgrounds
                let pixelsProcessed = 0;
                let backgroundPixels = 0;
                
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];     // Red
                    const g = data[i + 1]; // Green
                    const b = data[i + 2]; // Blue
                    const a = data[i + 3]; // Alpha
                    
                    pixelsProcessed++;
                    
                    // Check if pixel is grey/checkerboard background
                    const isGrey = this.isGreyBackground(r, g, b);
                    
                    if (isGrey) {
                        // Make pixel transparent
                        data[i + 3] = 0; // Set alpha to 0 (transparent)
                        backgroundPixels++;
                    }
                }
                
                console.log(`🎨 Processing ${key}: ${backgroundPixels}/${pixelsProcessed} pixels made transparent`);
                
                // Put the processed image data back
                ctx.putImageData(imageData, 0, 0);
                
                // Create a new image from the processed canvas
                const processedImage = new Image();
                processedImage.onload = () => {
                    // Cache the processed image
                    this.processedImages.set(key, processedImage);
                    resolve(processedImage);
                };
                
                processedImage.onerror = () => {
                    console.warn(`Failed to load processed image ${key}, using original`);
                    resolve(image);
                };
                
                processedImage.src = canvas.toDataURL();
                
            } catch (error) {
                console.warn(`Failed to process image ${key}:`, error);
                // Return original image if processing fails
                resolve(image);
            }
        });
    }
    
    // Check if a pixel color represents a grey checkerboard background
    isGreyBackground(r, g, b) {
        // Common checkerboard/transparency background colors
        const backgroundColors = [
            [192, 192, 192], // #C0C0C0 - Light grey checkerboard
            [255, 255, 255], // #FFFFFF - White checkerboard
            [204, 204, 204], // #CCCCCC - Light grey
            [128, 128, 128], // #808080 - Medium grey
            [160, 160, 160], // #A0A0A0 - Medium grey
            [169, 169, 169], // #A9A9A9 - Dark grey
            [211, 211, 211], // #D3D3D3 - Light grey
            [220, 220, 220], // #DCDCDC - Gainsboro
            [240, 240, 240], // #F0F0F0 - Very light grey
            [245, 245, 245], // #F5F5F5 - WhiteSmoke
        ];
        
        // Check for exact matches first
        for (const [gr, gg, gb] of backgroundColors) {
            if (r === gr && g === gg && b === gb) {
                return true;
            }
        }
        
        // Check for very light colors (likely background)
        if (r > 240 && g > 240 && b > 240) {
            return true; // Very light/white background
        }
        
        // Check if it's a grey-ish color (R, G, B values are similar)
        const diff = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b));
        const average = (r + g + b) / 3;
        
        // More aggressive grey detection for checkerboard patterns
        // It's grey if:
        // 1. RGB values are very similar (difference < 15) - more strict
        // 2. Average is in grey range (80-250) - broader range
        if (diff < 15 && average > 80 && average < 250) {
            return true;
        }
        
        // Check for specific checkerboard pattern colors
        // Common values: 192, 255 (light checkerboard) or 128, 192 (darker checkerboard)
        const isCheckerboardValue = (val) => {
            return val === 128 || val === 192 || val === 255 || val === 204 || val === 240;
        };
        
        if (isCheckerboardValue(r) && isCheckerboardValue(g) && isCheckerboardValue(b)) {
            return true;
        }
        
        return false;
    }
    
    // Get processed image or process it if not already done
    getProcessedImage(originalImage, key) {
        if (this.processedImages.has(key)) {
            return this.processedImages.get(key);
        }
        
        return this.processImage(originalImage, key);
    }
    
    // Clear processed image cache
    clearCache() {
        this.processedImages.clear();
    }
}
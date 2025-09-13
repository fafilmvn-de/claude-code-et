// Image loading utility with promise-based interface
export class ImageLoader {
    constructor() {
        this.loadedImages = {};
    }
    
    async loadImages(imageFiles, basePath = '') {
        const loadPromises = imageFiles.map(filename => this.loadSingleImage(filename, basePath));
        
        try {
            await Promise.all(loadPromises);
            console.log(`Successfully loaded ${imageFiles.length} images`);
            return this.loadedImages;
        } catch (error) {
            console.warn('Some images failed to load:', error);
            return this.loadedImages;
        }
    }
    
    loadSingleImage(filename, basePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const key = filename.replace('.png', '');
            
            img.onload = () => {
                console.log(`Loaded: ${filename}`);
                this.loadedImages[key] = img;
                resolve(img);
            };
            
            img.onerror = (error) => {
                console.error(`Failed to load image: ${filename}`, error);
                // Still resolve to continue loading other images
                resolve(null);
            };
            
            img.src = `${basePath}${filename}`;
            console.log(`Attempting to load: ${filename} from ${img.src}`);
        });
    }
    
    getImage(key) {
        return this.loadedImages[key] || null;
    }
    
    hasImage(key) {
        return key in this.loadedImages && this.loadedImages[key] !== null;
    }
}
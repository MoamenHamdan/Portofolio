// Bound the encoded string, not only JPEG bytes: base64 adds ~33%.
export const MAX_IMAGE_LENGTH = 250_000;
export const MAX_DOCUMENT_BYTES = 900_000;

// Guard plain objects from admin forms, leaving room below Firestore's 1 MiB
// document limit for field names, document paths, and encoding overhead.
export function assertDocumentSize(data) {
    if (new TextEncoder().encode(JSON.stringify(data)).length > MAX_DOCUMENT_BYTES) {
        throw new Error('This entry is too large. Remove some images or use image URLs before saving.');
    }
}

export const compressImage = (file, maxWidth = 1024, quality = 0.75, maxLength = MAX_IMAGE_LENGTH) => {
    return new Promise((resolve, reject) => {
        if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            reject(new Error('Choose a JPEG, PNG or WebP image.'));
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            reject(new Error('Choose an image smaller than 5MB.'));
            return;
        }
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Failed to read image.'));
        reader.onload = () => {
            const img = new Image();
            img.onerror = () => reject(new Error('Failed to load image.'));
            img.onload = () => {
                try {
                    if (!img.width || !img.height) throw new Error('Invalid image dimensions.');
                    const scale = Math.min(1, maxWidth / Math.max(img.width, img.height));
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.max(1, Math.round(img.width * scale));
                    canvas.height = Math.max(1, Math.round(img.height * scale));
                    const ctx = canvas.getContext('2d');
                    if (!ctx) throw new Error('Image processing is unavailable in this browser.');
                    for (let attempt = 0; attempt < 12; attempt++) {
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        for (let q = quality; q >= 0.2; q -= 0.1) {
                            const result = canvas.toDataURL('image/jpeg', q);
                            if (!result.startsWith('data:image/jpeg;base64,')) throw new Error('Could not encode this image.');
                            if (result.length <= maxLength) { resolve(result); return; }
                        }
                        canvas.width = Math.max(1, Math.floor(canvas.width * 0.75));
                        canvas.height = Math.max(1, Math.floor(canvas.height * 0.75));
                    }
                    throw new Error('Image is too large. Choose a smaller image or use an image URL.');
                } catch (error) { reject(error); }
            };
            img.src = reader.result;
        };
        reader.readAsDataURL(file);
    });
};

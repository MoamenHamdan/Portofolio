/**
 * Compresses an image File to a base64 string small enough for Firestore.
 * Targets ~500 KB max (well within Firestore's 1 MB document limit).
 *
 * @param {File} file         — the raw File object from <input type="file">
 * @param {number} maxWidth   — max pixel width (default 1024)
 * @param {number} quality    — JPEG quality 0-1 (default 0.75)
 * @returns {Promise<string>} — data-URL  "data:image/jpeg;base64,..."
 */
export const compressImage = (file, maxWidth = 1024, quality = 0.75) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.onload = (e) => {
            const img = new Image();
            img.onerror = () => reject(new Error("Failed to load image"));
            img.onload = () => {
                // Calculate scaled dimensions
                let { width, height } = img;
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                // Try at requested quality; if still too big, step quality down
                let dataUrl = canvas.toDataURL("image/jpeg", quality);
                let q = quality;
                while (dataUrl.length > 700_000 && q > 0.2) {
                    q -= 0.1;
                    dataUrl = canvas.toDataURL("image/jpeg", q);
                }

                if (dataUrl.length > 900_000) {
                    reject(
                        new Error(
                            `Image is still too large after compression (${Math.round(
                                dataUrl.length / 1024
                            )} KB). Please use a smaller image or paste an external URL instead.`
                        )
                    );
                } else {
                    resolve(dataUrl);
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
};

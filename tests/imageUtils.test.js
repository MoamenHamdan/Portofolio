import { afterEach, describe, expect, it, vi } from 'vitest';
import { assertDocumentSize, compressImage } from '../src/utils/imageUtils';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function mockImage(width, height, encode) {
    vi.stubGlobal('FileReader', class {
        readAsDataURL() { this.result = 'data:image/png;base64,AAAA'; this.onload(); }
    });
    vi.stubGlobal('Image', class {
        width = width; height = height;
        set src(value) { this.onload(); }
    });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ fillRect: vi.fn(), drawImage: vi.fn() });
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(encode);
}
const file = { type: 'image/png', size: 1000 };
describe('Firestore image budgets', () => {
    it('limits portrait dimensions as well as landscape dimensions', async () => {
        mockImage(1000, 4000, function () {
            expect(this.width).toBe(40); expect(this.height).toBe(160);
            return 'data:image/jpeg;base64,AAAA';
        });
        await expect(compressImage(file, 160, 0.7, 32000)).resolves.toBe('data:image/jpeg;base64,AAAA');
    });
    it('reduces dimensions if lowering JPEG quality is insufficient', async () => {
        mockImage(1000, 1000, function () {
            return 'data:image/jpeg;base64,' + 'A'.repeat(this.width > 120 ? 40000 : 1000);
        });
        expect((await compressImage(file, 160, 0.7, 32000)).length).toBeLessThanOrEqual(32000);
    });
    it('rejects images that cannot fit instead of saving an oversized value', async () => {
        mockImage(1000, 1000, () => 'data:image/jpeg;base64,' + 'A'.repeat(40000));
        await expect(compressImage(file, 160, 0.7, 32000)).rejects.toThrow('too large');
    });
    it('rejects invalid formats and oversized source files', async () => {
        await expect(compressImage({ type: 'text/html', size: 10 })).rejects.toThrow('JPEG');
        await expect(compressImage({ type: 'image/png', size: 6 * 1024 * 1024 })).rejects.toThrow('5MB');
    });
    it('checks the combined document, including UTF-8 text and multiple images', () => {
        expect(() => assertDocumentSize({ hero: 'A'.repeat(250000), about: 'A'.repeat(250000) })).not.toThrow();
        expect(() => assertDocumentSize({ images: Array(4).fill('A'.repeat(250000)) })).toThrow('too large');
        expect(() => assertDocumentSize({ text: 'م'.repeat(460000) })).toThrow('too large');
    });
});

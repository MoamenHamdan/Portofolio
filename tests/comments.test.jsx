import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
const mocks = vi.hoisted(() => ({ addDoc: vi.fn(), compress: vi.fn(), limit: vi.fn() }));
vi.mock('../src/firebase', () => ({ db: {} }));
vi.mock('../src/utils/imageUtils', () => ({ compressImage: mocks.compress }));
vi.mock('aos', () => ({ default: { init: vi.fn() } }));
vi.mock('firebase/firestore', () => ({
    addDoc: mocks.addDoc, collection: (_, path) => path,
    query: (...args) => args, orderBy: vi.fn(), limit: mocks.limit,
    serverTimestamp: () => 'server-time', onSnapshot: () => () => {},
}));
import Komentar from '../src/components/Commentar';
beforeEach(() => { vi.clearAllMocks(); mocks.addDoc.mockResolvedValue({ id: 'comment' }); });
function fillForm() {
    fireEvent.change(screen.getByPlaceholderText('Enter your name'), { target: { value: ' Visitor ' } });
    fireEvent.change(screen.getByPlaceholderText('Write your message here...'), { target: { value: ' Hello ' } });
}
describe('Firestore-only comments', () => {
    it('writes comments without a photo and bounds the subscription', async () => {
        render(<Komentar />); fillForm();
        fireEvent.click(screen.getByRole('button', { name: 'Post Comment' }));
        await waitFor(() => expect(mocks.addDoc).toHaveBeenCalledWith('portfolio-comments', {
            content: 'Hello', userName: 'Visitor', profileImage: null, createdAt: 'server-time',
        }));
        expect(mocks.compress).not.toHaveBeenCalled(); expect(mocks.limit).toHaveBeenCalledWith(50);
    });
    it('writes the compressed avatar in the comment document', async () => {
        mocks.compress.mockResolvedValue('data:image/jpeg;base64,AAAA');
        const { container } = render(<Komentar />); fillForm();
        const photo = new File(['image'], 'avatar.png', { type: 'image/png' });
        fireEvent.change(container.querySelector('input[type=file]'), { target: { files: [photo] } });
        fireEvent.click(screen.getByRole('button', { name: 'Post Comment' }));
        await waitFor(() => expect(mocks.addDoc).toHaveBeenCalledWith('portfolio-comments', expect.objectContaining({ profileImage: 'data:image/jpeg;base64,AAAA' })));
        expect(mocks.compress).toHaveBeenCalledWith(photo, 160, 0.7, 32000);
    });
    it('preserves the message and avoids a write when compression fails', async () => {
        const log = vi.spyOn(console, 'error').mockImplementation(() => {});
        mocks.compress.mockRejectedValue(new Error('Image is too large.'));
        const { container } = render(<Komentar />); fillForm();
        fireEvent.change(container.querySelector('input[type=file]'), { target: { files: [new File(['x'], 'a.png', { type: 'image/png' })] } });
        fireEvent.click(screen.getByRole('button', { name: 'Post Comment' }));
        expect(await screen.findByText('Image is too large.')).toBeTruthy();
        expect(mocks.addDoc).not.toHaveBeenCalled();
        expect(screen.getByPlaceholderText('Write your message here...').value).toBe(' Hello ');
        log.mockRestore();
    });
});

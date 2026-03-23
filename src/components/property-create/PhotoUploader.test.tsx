import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PROPERTY_CREATE_MAX_FILES } from '@/constants/propertyCreate';
import { PhotoUploader } from './PhotoUploader';

describe('PhotoUploader', () => {
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      writable: true,
      value: URL.createObjectURL ?? (() => ''),
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      writable: true,
      value: URL.revokeObjectURL ?? (() => undefined),
    });

    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockImplementation((file) => {
      const name = (file as File).name || 'file';
      return `blob:${name}`;
    });
    revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('accepts only image files and respects max file limit', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const existing = Array.from({ length: PROPERTY_CREATE_MAX_FILES - 1 }, (_, index) =>
      new File(['x'], `existing-${index}.png`, { type: 'image/png' }),
    );

    const { container } = render(<PhotoUploader files={existing} onChange={onChange} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement | null;
    if (!input) {
      throw new Error('File input not found');
    }

    const image1 = new File(['a'], 'fresh-1.jpg', { type: 'image/jpeg' });
    const image2 = new File(['b'], 'fresh-2.png', { type: 'image/png' });
    const textFile = new File(['c'], 'notes.txt', { type: 'text/plain' });
    await user.upload(input, [image1, textFile, image2]);

    expect(onChange).toHaveBeenCalledTimes(1);
    const nextFiles = onChange.mock.calls[0][0] as File[];
    expect(nextFiles).toHaveLength(PROPERTY_CREATE_MAX_FILES);
    expect(nextFiles.every((file) => file.type.startsWith('image/'))).toBe(true);
    expect(nextFiles[nextFiles.length - 1]?.name).toBe(image1.name);
  });

  it('removes selected preview item by index', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const files = [
      new File(['a'], 'one.png', { type: 'image/png' }),
      new File(['b'], 'two.png', { type: 'image/png' }),
    ];

    render(<PhotoUploader files={files} onChange={onChange} />);

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[1]);

    expect(onChange).toHaveBeenCalledWith([files[1]]);
    expect(createObjectURLSpy).toHaveBeenCalledTimes(2);
  });

  it('revokes object URLs when preview list changes and on unmount', () => {
    const first = [new File(['a'], 'first.png', { type: 'image/png' })];
    const second = [new File(['b'], 'second.png', { type: 'image/png' })];

    const { rerender, unmount } = render(<PhotoUploader files={first} onChange={vi.fn()} />);

    rerender(<PhotoUploader files={second} onChange={vi.fn()} />);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:first.png');

    unmount();
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:second.png');
  });
});

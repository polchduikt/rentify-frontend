import { useEffect, useMemo, useRef } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';

const MAX_FILES = 12;

interface PhotoUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
}

export const PhotoUploader = ({ files, onChange }: PhotoUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const previewUrls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(
    () => () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    },
    [previewUrls]
  );

  const onPickFiles = (nextFiles: FileList | null) => {
    if (!nextFiles) {
      return;
    }

    const validImages = Array.from(nextFiles).filter((file) => file.type.startsWith('image/'));
    onChange([...files, ...validImages].slice(0, MAX_FILES));
  };

  const removeAt = (index: number) => {
    onChange(files.filter((_, fileIndex) => fileIndex !== index));
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex h-28 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-sm font-medium text-slate-700 transition hover:border-blue-400 hover:bg-blue-50"
      >
        <ImagePlus size={18} />
        Додати фото ({files.length}/{MAX_FILES})
      </button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(event) => onPickFiles(event.target.files)}
      />

      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="group relative overflow-hidden rounded-2xl border border-slate-200">
              <img src={previewUrls[index]} alt={file.name} className="aspect-square h-full w-full object-cover" />
              {index === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Головне
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAt(index)}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

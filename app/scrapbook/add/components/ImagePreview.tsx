interface ImagePreviewProps {
  files: FileList | undefined;
  onRemove: (index: number) => void;
}

export function ImagePreview({ files, onRemove }: ImagePreviewProps) {
  if (!files?.length) return null;

  return (
    <div className="flex gap-4 mt-4 flex-wrap">
      {Array.from(files).map((file, index) => (
        <div key={index} className="relative">
          <img
            src={URL.createObjectURL(file)}
            alt={`Preview ${index + 1}`}
            className="w-24 h-24 object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
} 
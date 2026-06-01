import { useRef, useState } from "react";
import { Icon } from "../Icon";

/* Drag-and-drop zone with a browse button and a "read locally" disclaimer.
   Files are read in-process (FileReader) — never uploaded anywhere. */
export function FileDropZone({
  onFile,
  label = "Drop a file here",
  hint = "or click to browse — processed locally, never uploaded",
}: {
  onFile: (file: File) => void;
  label?: string;
  hint?: string;
}) {
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handle = (files: FileList | null) => {
    if (files && files[0]) onFile(files[0]);
  };
  return (
    <div
      className={"dropzone" + (over ? " over" : "")}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        handle(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
    >
      <span className="dz-ico">
        <Icon name="fileDrop" />
      </span>
      <div>
        <strong>{label}</strong>
        <span>{hint}</span>
      </div>
      <span className="dz-pick btn sm">Browse</span>
      {/* reset value after each pick so selecting the *same* file again still
          fires onChange (otherwise re-uploading the same file does nothing). */}
      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

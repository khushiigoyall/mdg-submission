import React, { useCallback, useEffect, useState } from "react";
import { getEvents } from "../services/eventservice";
import photoService from "../services/photoService";
import { Upload, X, Image, CheckCircle, AlertCircle } from "lucide-react";

type EventType = {
  id: number;
  name: string;
};

export default function MultipleUploadPage() {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getEvents();
        setEvents(data?.events ?? data ?? []);
      } catch (e) {
        console.error("Failed loading events", e);
        setEvents([]);
      }
    };

    loadEvents();
  }, []);

 
  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedEvent) {
      setMessage("Please select an event");
      return;
    }

    if (files.length === 0) {
      setMessage("Please add files to upload");
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const res = await photoService.uploadMultiplePhotos(selectedEvent, files);
      setMessage(`Uploaded ${res.uploaded_count ?? files.length} photos`);
      setFiles([]);
    } catch (e: any) {
      console.error(e);
      setMessage(e?.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };
  

  return (
    <div className="w-full">
      {/* Event selector */}
      <div className="mb-6">
        <label className="block mb-2 text-sm text-[#7a7570] font-medium">
          Select Event
        </label>
        <select
          className="w-full px-4 py-3 rounded-xl bg-[#1a1917] border border-white/[0.06] text-[#e8e3dc] focus:border-[#c9a96e] outline-none transition-colors"
          value={selectedEvent ?? ""}
          onChange={(e) => setSelectedEvent(Number(e.target.value))}
        >
          <option value="">Choose an event…</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.name}
            </option>
          ))}
        </select>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`p-12 rounded-2xl border-2 border-dashed mb-6 transition-all duration-300 ${
          dragOver
            ? "border-[#c9a96e] bg-[#c9a96e]/10"
            : "border-white/[0.1] bg-[#1a1917] hover:border-white/[0.2]"
        }`}
      >
        <div className="text-center">
          <Upload className={`mx-auto mb-4 w-10 h-10 ${dragOver ? "text-[#c9a96e]" : "text-[#7a7570]"}`} />
          <p className="text-[#e8e3dc] font-medium">Drag & drop photos here</p>
          <p className="text-[#7a7570] text-sm mb-4">or</p>

          <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c9a96e] text-[#111010] font-semibold hover:bg-[#b0935d] transition-colors">
            <Image className="w-5 h-5" />
            Browse Files
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
          </label>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-2 mb-6 p-4 rounded-xl font-medium ${
            message.includes("Uploaded")
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {message.includes("Uploaded") ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message}</span>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 rounded-xl bg-[#1a1917] border border-white/[0.06]"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#e8e3dc] truncate">{file.name}</p>
                <p className="text-xs text-[#7a7570]">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={() => removeFile(i)}
                className="text-[#7a7570] hover:text-[#c9a96e] p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={uploading || !selectedEvent || files.length === 0}
        className="w-full py-4 rounded-xl bg-[#c9a96e] text-[#111010] font-bold text-lg hover:bg-[#b0935d] transition-colors disabled:bg-[#1a1917] disabled:text-[#7a7570] disabled:cursor-not-allowed border disabled:border-white/[0.06] disabled:border border-transparent"
      >
        {uploading
          ? "Uploading..."
          : `Upload ${files.length || ""} Photos`}
      </button>
    </div>
  );
}

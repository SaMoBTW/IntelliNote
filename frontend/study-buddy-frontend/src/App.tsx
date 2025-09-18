import React, { useState } from "react";

export default function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setLoading(true);
    setErr(null);

    try {
      const form = new FormData();
      form.append("file", e.target.files[0]); // key must match @RequestParam("file")

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form, // let the browser set multipart boundary
      });

      const body = await res.text();
      if (!res.ok) throw new Error(body || `HTTP ${res.status}`);

      setText(body);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Upload failed";
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1>AI Study Buddy</h1>
      <input type="file" onChange={handleUpload} />
      {loading && <p>Uploading…</p>}
      {err && <p style={{ color: "crimson" }}>{err}</p>}
      {text && (
        <>
          <h2>Extracted Text</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{text}</pre>
        </>
      )}
    </div>
  );
}

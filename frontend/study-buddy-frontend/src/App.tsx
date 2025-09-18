import React, { useState } from "react";

function App() {
    const [text, setText] = useState("");

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const formData = new FormData();
        formData.append("file", e.target.files[0]);

        const res = await fetch("http://localhost:8080/api/upload", {
            method: "POST",
            body: formData,
        });

        const data = await res.text(); // backend sends plain string
        setText(data);
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>AI Study Buddy</h1>
            <input type="file" onChange={handleUpload} />
            <h2>Extracted Text:</h2>
            <pre>{text}</pre>
        </div>
    );
}

export default App;
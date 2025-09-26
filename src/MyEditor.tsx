import React, { useState } from "react";
import ReactQuill from "react-quill";
import DOMPurify from "dompurify";
import "react-quill/dist/quill.snow.css";

const MyEditor: React.FC = () => {
  const [value, setValue] = useState<string>("");

  const handleChange = (content: string) => {
    // HTML içeriği sanitize ederek güvenli hale getir
    setValue(DOMPurify.sanitize(content));
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      <ReactQuill value={value} onChange={handleChange} />
      <div
        style={{
          marginTop: "20px",
          border: "1px solid #ccc",
          padding: "10px",
          minHeight: "100px",
        }}
      >
        <h2>Preview:</h2>
        <div dangerouslySetInnerHTML={{ __html: value }} />
      </div>
    </div>
  );
};

export default MyEditor;
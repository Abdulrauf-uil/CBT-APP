import { useRef } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';

export default function ImageUpload({ image, onUpload, onClear, label = "Upload Image" }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for Base64 sanity
        alert("Image is too large. Please select an image under 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="image-upload-wrapper">
      {!image ? (
        <button 
          type="button" 
          className="btn-image-upload"
          onClick={() => fileInputRef.current.click()}
        >
          <ImageIcon size={16} />
          <span>{label}</span>
        </button>
      ) : (
        <div className="image-preview-container">
          <img src={image} alt="Preview" className="image-preview" />
          <button 
            type="button" 
            className="btn-clear-image"
            onClick={onClear}
            title="Remove Image"
          >
            <X size={14} />
          </button>
        </div>
      )}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />
    </div>
  );
}

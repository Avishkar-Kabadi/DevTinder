import { useState } from "react";

const StepPhoto = ({ formData, setFormData, back, loading, onSubmit }) => {
  const [preview, setPreview] = useState(
    formData.image ? URL.createObjectURL(formData.image) : null
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-base-200 p-6 rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-4">📸 Upload Your Photo</h2>

      <input
        type="file"
        accept="image/*"
        className="input input-bordered w-full"
        onChange={handleFileChange}
        disabled={loading}
      />

      {preview && (
        <img
          src={preview}
          alt="preview"
          className="w-48 h-48 object-cover rounded-xl mt-4 mx-auto"
        />
      )}

      <div className="flex justify-between mt-6">
        <button className="btn" onClick={back} disabled={loading}>
          ← Back
        </button>

        <button
          disabled={!formData.image || loading}
          className="btn btn-success flex items-center gap-2"
          onClick={onSubmit}
        >
          {loading && <span className="loading loading-spinner loading-sm" />}
          {loading ? "Uploading..." : "Finish ✔"}
        </button>
      </div>
    </div>
  );
};

export default StepPhoto;

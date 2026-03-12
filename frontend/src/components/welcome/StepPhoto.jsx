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
    <div className="w-full max-w-2xl mx-auto bg-base-100 border border-base-200 p-8 rounded-3xl shadow-xl animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center sm:text-left">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent inline-block mb-2">Upload Photo</h2>
          <p className="text-base-content/60">Put a face to the name so others can recognize you.</p>
      </div>

      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-base-300 rounded-2xl bg-base-200/50 mb-8 transition-colors hover:bg-base-200/80">
        
        {preview ? (
            <div className="relative mb-4 group cursor-pointer" onClick={() => document.getElementById('photo-upload').click()}>
                <img
                src={preview}
                alt="preview"
                className="w-48 h-48 object-cover rounded-full shadow-lg ring-4 ring-base-100 group-hover:opacity-80 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">
                    <span className="bg-base-100/80 text-base-content px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">Change</span>
                </div>
            </div>
        ) : (
            <div className="w-48 h-48 rounded-full bg-base-300 flex flex-col items-center justify-center mb-4 text-base-content/40 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
                <span className="text-sm font-medium">No photo</span>
            </div>
        )}

        <label className="btn btn-primary btn-outline btn-sm rounded-xl cursor-pointer">
            {preview ? "Choose different photo" : "Select a photo"}
            <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={loading}
            />
        </label>
        <p className="text-xs text-base-content/50 mt-4 text-center max-w-xs">
            JPEG, PNG, or WEBP. Max size 5MB.
        </p>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-base-200 mt-2">
        <button className="btn btn-ghost rounded-xl transition-all hover:-translate-x-1" onClick={back} disabled={loading}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>
        <button
          disabled={!formData.image || loading}
          className="btn btn-primary rounded-xl px-10 transition-transform hover:scale-105"
          onClick={onSubmit}
        >
          {loading && <span className="loading loading-spinner loading-sm" />}
          {loading ? "Finishing..." : "Complete Profile"}
          {!loading && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default StepPhoto;

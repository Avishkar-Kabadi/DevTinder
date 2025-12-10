const StepBasicInfo = ({ formData, setFormData, next }) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-base-200 p-6 rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-4">👤 Basic Information</h2>

      <label className="label">Bio / About</label>
      <textarea
        className="textarea textarea-bordered w-full"
        value={formData.bio}
        rows={3}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, bio: e.target.value }))
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="label">Age</label>
          <input
            type="number"
            className="input input-bordered w-full"
            value={formData.age}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, age: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="label">Gender</label>
          <select
            className="select select-bordered w-full"
            value={formData.gender}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, gender: e.target.value }))
            }
          >
            <option value="">Select gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
            <option>Prefer not to say</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          disabled={!formData.age || !formData.gender || !formData.bio}
          className="btn btn-primary"
          onClick={next}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default StepBasicInfo;

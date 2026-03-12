const StepBasicInfo = ({ formData, setFormData, next }) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-base-100 border border-base-200 p-8 rounded-3xl shadow-xl animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center sm:text-left">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent inline-block mb-2">Basic Info</h2>
          <p className="text-base-content/60">Tell us a little bit about yourself.</p>
      </div>

      <div className="form-control mb-6">
          <label className="label py-1"><span className="label-text font-semibold">Bio / About Me</span></label>
          <textarea
            className="textarea textarea-bordered focus:textarea-primary bg-base-200/50 w-full rounded-2xl transition-all custom-scrollbar resize-none"
            placeholder="I am a software developer..."
            value={formData.bio}
            rows={4}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, bio: e.target.value }))
            }
          />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="form-control">
          <label className="label py-1"><span className="label-text font-semibold">Age</span></label>
          <input
            type="number"
            className="input input-bordered focus:input-primary bg-base-200/50 w-full rounded-2xl transition-all"
            placeholder="Your age"
            value={formData.age}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, age: e.target.value }))
            }
          />
        </div>

        <div className="form-control">
          <label className="label py-1"><span className="label-text font-semibold">Gender</span></label>
          <select
            className="select select-bordered focus:select-primary bg-base-200/50 w-full rounded-2xl transition-all"
            value={formData.gender}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, gender: e.target.value }))
            }
          >
            <option value="" disabled>Select gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
            <option>Prefer not to say</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-base-200 mt-2">
        <button
          disabled={!formData.age || !formData.gender || !formData.bio}
          className="btn btn-primary rounded-xl px-10 transition-transform hover:scale-105"
          onClick={next}
        >
          Next Step
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default StepBasicInfo;

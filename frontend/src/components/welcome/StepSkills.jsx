import { useState } from "react";

const StepSkills = ({ formData, setFormData, next, back }) => {
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    if (!skillInput.trim()) return;

    // prevent duplicates
    if(formData.skills.includes(skillInput.trim())) {
        setSkillInput("");
        return;
    }

    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, skillInput.trim()],
    }));

    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-base-100 border border-base-200 p-8 rounded-3xl shadow-xl animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center sm:text-left">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent inline-block mb-2">Your Interests</h2>
          <p className="text-base-content/60">What are you passionate about?</p>
      </div>

      <div className="form-control mb-6">
        <label className="label py-1">
            <span className="label-text font-semibold">Add Interests</span>
        </label>
        <div className="flex gap-2">
            <input
            type="text"
            className="input input-bordered focus:input-primary bg-base-200/50 w-full rounded-2xl transition-all"
            placeholder="Type an interest (e.g. Photography, Traveling, Tech) and press Enter"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
                if(e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                }
            }}
            />
            <button className="btn btn-primary rounded-2xl px-6" onClick={addSkill}>
            Add
            </button>
        </div>
      </div>

      <div className="bg-base-200/50 border border-base-200 rounded-2xl p-6 min-h-[120px] mb-8">
          <div className="flex flex-wrap gap-2">
            {formData.skills.length > 0 ? (
                formData.skills.map((skill, index) => (
                <div key={index} className="badge badge-primary badge-lg gap-2 pr-1 shadow-sm">
                    {skill}
                    <button 
                        className="bg-primary-content/20 hover:bg-error hover:text-white rounded-full p-0.5 transition-colors" 
                        onClick={() => removeSkill(skill)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                ))
            ) : (
                <p className="text-base-content/40 text-center w-full mt-4 italic">No interests added yet.</p>
            )}
          </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-base-200 mt-2">
        <button className="btn btn-ghost rounded-xl transition-all hover:-translate-x-1" onClick={back}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>
        <button
          disabled={formData.skills.length === 0}
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

export default StepSkills;

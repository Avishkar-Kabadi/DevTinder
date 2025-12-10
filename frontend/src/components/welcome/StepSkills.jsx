import { useState } from "react";

const StepSkills = ({ formData, setFormData, next, back }) => {
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    if (!skillInput.trim()) return;

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
    <div className="w-full max-w-2xl mx-auto bg-base-200 p-6 rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-4">🛠️ Your Skills</h2>

      <div className="flex gap-2">
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Add a skill (React, Python...)"
          value={skillInput}
          onChange={(e) => setSkillInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && (e.preventDefault(), addSkill())
          }
        />
        <button className="btn btn-secondary" onClick={addSkill}>
          Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {formData.skills.map((skill, index) => (
          <div key={index} className="badge badge-primary gap-2">
            {skill}
            <button className="text-white" onClick={() => removeSkill(skill)}>
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-6">
        <button className="btn" onClick={back}>
          ← Back
        </button>
        <button
          disabled={formData.skills.length === 0}
          className="btn btn-primary"
          onClick={next}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default StepSkills;

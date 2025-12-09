import axios from "axios";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "../store/userSlice";
import { baseUrl } from "../utils/constants";
const CompleteProfile = () => {
  const dispatch = useDispatch();
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
  const [bio, setBio] = useState("");
  const [image, setImage] = useState(null);
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addSkill = () => {
    if (skillInput.trim() !== "" && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);

      setSkillInput("");
    } else if (skills.includes(skillInput.trim())) {
      setError("This skill has already been added!");
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    if (!validTypes.includes(file.type)) {
      alert("Only JPEG, JPG, PNG, and WEBP images are allowed!");
      e.target.value = "";
      return;
    }

    setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("bio", bio);
    skills.forEach((skill) => formData.append("skills[]", skill));
    formData.append("gender", gender);
    formData.append("image", image);

    if (!bio || skills.length === 0 || !image || !gender) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.put(
        baseUrl + "/auth/update-profile",
        formData,
        { withCredentials: true },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      dispatch(addUser(res.data.user));
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update failed:", error);
      setError(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-base-200 min-h-screen flex justify-center items-center px-4">
      <div className="card w-full max-w-3xl shadow-2xl bg-base-100 p-6 rounded-xl">
        <h2 className="text-2xl font-extrabold text-center mb-6 text-primary">
          ✨ Complete Your Profile
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center border-b pb-4 border-base-300">
            <div className="avatar mb-3">
              <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                {image ? (
                  <img src={URL.createObjectURL(image)} alt="Profile Preview" />
                ) : (
                  <div className="flex justify-center items-center h-full w-full bg-gray-200 text-gray-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            <input
              type="file"
              className="file-input file-input-bordered file-input-primary w-full max-w-xs file-input-sm"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  📝 Bio / About Me
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered h-24 resize-none"
                placeholder="Write a compelling summary about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows="3"
              ></textarea>
            </div>
            <div className="flex flex-col space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">👤 Gender</span>
                </label>
                <select
                  className="select select-bordered w-full select-sm"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select your gender
                  </option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    🛠️ Your Skills
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered w-full input-sm"
                    placeholder="Add skill (e.g., Python)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="btn btn-secondary btn-sm min-w-[60px]"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="form-control pt-2">
            <div className="flex flex-wrap gap-2 min-h-[30px] items-start p-2 border border-base-300 rounded-lg bg-base-200">
              {skills.length > 0 ? (
                skills.map((skill, index) => (
                  <span
                    key={index}
                    className="badge badge-accent text-white font-medium p-2 cursor-pointer transition duration-150 hover:bg-red-500 badge-sm" // Smaller badges
                    onClick={() => removeSkill(skill)}
                  >
                    {skill} <span className="ml-1 font-bold">✕</span>
                  </span>
                ))
              ) : (
                <p className="text-xs text-gray-500 italic">
                  No skills added yet.
                </p>
              )}
            </div>
          </div>
          {error && (
            <div role="alert" className="alert alert-error alert-sm mt-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}
          <button
            type="submit"
            className="btn btn-primary w-full mt-4 text-base"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner"></span>
            ) : (
              "Complete Profile"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;

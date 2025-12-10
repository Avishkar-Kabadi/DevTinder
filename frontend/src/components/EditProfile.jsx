import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addUser } from "../store/userSlice";
import { baseUrl } from "../utils/constants";
import UserCard from "./UserCard";
const EditProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector((store) => store.user);
  const [skills, setSkills] = useState(user?.skills);
  const [skillInput, setSkillInput] = useState("");
  const [about, setAbout] = useState(user?.about);
  const [age, setAge] = useState(user?.age);
  const [image, setImage] = useState(null);
  const [gender, setGender] = useState(user?.gender);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName);
  const [lastName, setLastName] = useState(user?.lastName);
  const [photoUrl, SetpPhotoUrl] = useState(user?.photoUrl);

  useEffect(() => {
    if (image) {
      SetpPhotoUrl(URL.createObjectURL(image));
    }
  }, [image]);

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
    if (image) {
      formData.append("image", image);
    }

    formData.append("about", about);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("age", age);
    skills.forEach((skill) => formData.append("skills[]", skill));
    formData.append("gender", gender);

    try {
      setError(null);
      const res = await axios.put(baseUrl + "/auth/update-profile", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch(addUser(res.data.user));

      setMessage(res.data.message);
      setTimeout(() => {
        setMessage(null);
      }, 2000);

      console.log(message);
    } catch (error) {
      setError(error.response?.data?.message);
      setTimeout(() => {
        setError(null);
      }, 2000);
    } finally {
      setLoading(false);
      setEditing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-base-200 text-white flex justify-center px-4 py-5">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between">
          <h1 className="lg:text-4xl text-3xl font-extrabold text-center text-[#5AB2FF] mb-10">
            {editing
              ? "Edit Your DevTinder Profile 🚀"
              : "Your DevTinder Profile 🚀"}
          </h1>

          <button
            onClick={() => setEditing((prev) => !prev)}
            className=" bg-secondary p-2 text-sm   rounded-xl text-center text-white mb-10"
          >
            {editing ? "Cancel" : " Edit Profile"}
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-10"
        >
          <div className="space-y-4">
            <div className="flex flex-col items-start">
              {editing && (
                <>
                  <label className="font-semibold text-sm">
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    className="file-input file-input-bordered file-input-secondary w-full max-w-xs"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </>
              )}
            </div>

            <div>
              <label className="font-semibold text-sm">First Name</label>
              <input
                className="input input-bordered w-full bg-[#111] border-[#444] text-sm"
                type="text"
                placeholder="Enter your first Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!editing}
              />
            </div>

            <div>
              <label className="font-semibold text-sm">Last Name</label>
              <input
                className="input input-bordered w-full bg-[#111] border-[#444] text-sm"
                type="text   "
                placeholder="Enter your Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={!editing}
              />
            </div>

            <div className="space-y-6">
              <div>
                <label className="font-semibold text-sm">
                  about / About Me
                </label>
                <textarea
                  className="textarea textarea-bordered w-full bg-[#111] border-[#444] text-sm"
                  placeholder="Write about yourself..."
                  value={about}
                  disabled={!editing}
                  onChange={(e) => setAbout(e.target.value)}
                  rows="4"
                ></textarea>
              </div>
            </div>

            <div>
              <label className="font-semibold text-sm">Age</label>
              <input
                className="input input-bordered w-full bg-[#111] border-[#444] text-sm"
                type="number"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                disabled={!editing}
              />
            </div>

            <div>
              <label className="font-semibold text-sm">Gender</label>
              <select
                className="select select-bordered w-full bg-[#111] border-[#444] text-sm"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={!editing}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {editing && (
              <div>
                <label className="font-semibold text-sm">Add Skills</label>

                <div className="flex gap-2 mt-2">
                  <>
                    <input
                      type="text"
                      className="input input-bordered bg-[#111] border-[#444] w-full text-sm"
                      placeholder="Add skill (e.g., React)"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addSkill())
                      }
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="btn btn-primary btn-sm px-4"
                    >
                      Add
                    </button>
                  </>
                </div>
              </div>
            )}

            <div>
              <label className="font-semibold text-sm">Your Skills</label>

              <div className="min-h-[60px] p-3 border border-[#333] rounded-lg bg-[#111] flex flex-wrap gap-2">
                {skills?.length > 0 ? (
                  skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-3 rounded-full bg-[#5AB2FF33] border border-[#5AB2FF] text-[#5AB2FF] text-xs font-medium cursor-pointer hover:bg-red-500 hover:text-white transition"
                    >
                      {skill}{" "}
                      {editing && (
                        <button onClick={() => removeSkill(skill)}>✕</button>
                      )}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    No skills added yet.
                  </p>
                )}
              </div>
            </div>
            {error && <div className="alert alert-error mt-6">{error}</div>}

            {editing && (
              <button
                onClick={handleSubmit}
                className="btn btn-primary w-full mt-8 py-3 text-lg"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Update Profile"
                )}
              </button>
            )}
          </div>

          <div>
            <UserCard
              user={{
                skills,
                photoUrl,
                firstName,
                lastName,
                gender,
                age,
                about,
              }}
            />
          </div>
        </form>
      </div>
      <div className="toast toast-end">
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="alert alert-success">
            <span>{message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfile;

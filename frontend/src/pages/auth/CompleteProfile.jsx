import axios from "axios";
import { useState } from "react";
import { addUser } from "../../store/userSlice";
import {
  StepBasicInfo,
  StepPhoto,
  WelcomeProfile,
} from "../../components/welcome";
import { baseUrl } from "../../utils/constants";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const CompleteProfile = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    bio: "",
    age: "",
    gender: "",
    image: null,
  });

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("about", formData.bio);
      fd.append("age", formData.age);
      fd.append("gender", formData.gender);

      if (formData.image) fd.append("image", formData.image);


      const res = await axios.put(baseUrl + "/auth/update-profile", fd, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch(addUser(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-base-100 p-6 flex items-center justify-center">
      {step === 0 && <WelcomeProfile onStart={() => setStep(1)} />}
      {step === 1 && (
        <StepBasicInfo formData={formData} setFormData={setFormData} next={() => setStep(2)} />
      )}

      {step === 2 && (
        <StepPhoto formData={formData} setFormData={setFormData} loading={loading} back={() => setStep(2)} onSubmit={onSubmit} />
      )}
    </div>
  );
};

export default CompleteProfile;

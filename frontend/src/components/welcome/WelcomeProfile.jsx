import React from "react";
import { ArrowRight } from "lucide-react";

const WelcomeProfile = ({ onStart }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-4xl font-bold mb-4">Welcome to DevTinder 👨‍💻❤️</h1>
      <p className="text-lg text-gray-500 max-w-lg mb-6">
        Create a strong profile and connect with developers who match your
        interests, skills, and mindset.
      </p>

      <button
        onClick={onStart}
        className="btn btn-primary btn-wide flex items-center gap-2"
      >
        Complete My Profile <ArrowRight size={18} />
      </button>
    </div>
  );
};

export default WelcomeProfile;

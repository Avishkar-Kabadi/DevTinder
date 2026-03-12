import React from "react";
import { ArrowRight, Globe } from "lucide-react";

const WelcomeProfile = ({ onStart }) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-base-100 border border-base-200 p-10 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
      
      <div className="bg-primary/10 p-4 rounded-full mb-6">
        <Globe className="w-16 h-16 text-primary" />
      </div>

      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
        Welcome to Loom
      </h1>
      
      <p className="text-lg text-base-content/70 max-w-md mb-10 leading-relaxed">
        Let's create your social profile. Connect with others who share your
        interests and passions.
      </p>

      <button
        onClick={onStart}
        className="btn btn-primary btn-lg rounded-full px-12 group transition-all hover:scale-105 shadow-xl shadow-primary/20"
      >
        <span>Build My Profile</span>
        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
      </button>

      <p className="text-xs text-base-content/40 mt-8 mt-6 max-w-xs">
          Only takes a minute, and you can edit this later at any time.
      </p>
    </div>
  );
};

export default WelcomeProfile;

import React from "react";

const Spinner = () => {
  return (
    <div
      className="fixed inset-0 flex min-h-screen items-center justify-center bg-base-200 bg-opacity-80 z-[100] transition-opacity duration-300"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="loading loading-spinner text-primary loading-lg"></span>

      <p className="sr-only">Loading...</p>
    </div>
  );
};

export default Spinner;

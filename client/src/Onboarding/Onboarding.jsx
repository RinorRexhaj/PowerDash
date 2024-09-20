// import { useState, useEffect } from "react";

// const Onboarding = ({ completeOnboarding }) => {
//   const [step, setStep] = useState(1);

//   const handleNextStep = () => {
//     setStep(step + 1);
//   };

//   const finishOnboarding = () => {
//     completeOnboarding();
//   };
//   console.log(step);

//   return (
//     <div className="text-center">
//       <div className="flex justify-center items-center mb-5">
//         <div
//           className={`flex justify-center items-center w-10 h-10 rounded-full text-white ${
//             step >= 1 ? "bg-blue-400" : "bg-slate-300"
//           }`}
//         >
//           1
//         </div>
//         <div
//           className={`w-25 h-1 ${
//             step >= 2 ? "bg-blue-400 transition duration-300 " : "bg-slate-300"
//           }`}
//         ></div>
//         <div
//           className={`flex justify-center items-center w-10 h-10 rounded-full text-white ${
//             step === 2
//               ? "bg-blue-400  transition duration-300 "
//               : "bg-slate-300 text-black"
//           }`}
//         >
//           2
//         </div>
//       </div>

//       {step === 1 && (
//         <div className="step-1">
//           <h2>Create an Account</h2>
//           {/* Form for account creation */}
//           <button onClick={handleNextStep}>Next</button>
//         </div>
//       )}

//       {step === 2 && (
//         <div className="step-2">
//           <h2>Import Data</h2>
//           {/* File upload component */}
//           <button onClick={finishOnboarding}>Finish</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Onboarding;

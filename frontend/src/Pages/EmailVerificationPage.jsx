import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const EmailVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    setError("");
    const newCode = [...code];

    // If user pasted multiple characters
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);

      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex]?.focus();
    } else {
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const verificationCode = code.join("");

    // FRONTEND ONLY – burada sadece console.log var
    setIsLoading(true);
    setTimeout(() => {
      console.log("Submitted verification code:", verificationCode);
      // Örnek hata gösterimi:
      // setError("Invalid verification code");
      setIsLoading(false);
    }, 800);
  };

  // Auto submit when all fields are filled (opsiyonel, istersen kaldır)
  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit({ preventDefault: () => {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 px-8 py-10"
      >
        <h2 className="text-3xl font-bold mb-3 text-center bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent">
          Verify Your Email
        </h2>
        <p className="text-center text-slate-600 mb-8 text-sm">
          Enter the 6-digit verification code we sent to your email address.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="6"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-11 h-11 sm:w-12 sm:h-12 text-center text-xl sm:text-2xl font-semibold 
                           bg-white text-slate-800 border-2 border-slate-200 rounded-xl 
                           focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400 focus:outline-none
                           transition"
              />
            ))}
          </div>

          {error && (
            <p className="text-red-500 font-semibold mt-1 text-sm text-center">
              {error}
            </p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isLoading || code.some((digit) => !digit)}
            className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-blue-600 
                       text-white font-semibold py-3 px-4 rounded-xl shadow-md 
                       hover:from-indigo-600 hover:to-blue-700 
                       focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-60
                       disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </motion.button>
        </form>

        <p className="mt-4 text-xs text-center text-slate-500">
          Didn&apos;t receive the code? Check your spam folder or request a new one from the login page.
        </p>
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage;

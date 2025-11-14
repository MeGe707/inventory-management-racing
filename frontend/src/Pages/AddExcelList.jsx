import React, { useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../Context/AppContext.jsx";
import { FaFileExcel } from "react-icons/fa"; // Excel ikon


const AddExcelList = () => {
  const { token, getAllItems, link } = useContext(AppContext);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  

  const handleUpload = async () => {
    setMessage("");
    setError("");

    if (!file) {
      setError("📎 Lütfen bir Excel dosyası seçin.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
         `${link}/user/upload-excel-items`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message || "✅ Update successful");
      setFile(null);
      if(response.data.success) {
        toast.success("Update successful")
      }
    
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err.response?.data?.message || "❌ Error occured, please try again."
      );
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-8 bg-white shadow-lg rounded-lg border border-gray-200 transition-all duration-300 w-96">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FaFileExcel className="text-green-600 text-3xl" />
        Upload Item via Excel
      </h2>

      <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-50 text-blue rounded-lg shadow-md tracking-wide border border-dashed border-blue-300 cursor-pointer hover:bg-blue-50 transition-all">
        <svg
          className="w-8 h-8 text-blue-500 mb-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M16.88 9.94a1 1 0 00-1.41 0l-3.88 3.88V3a1 1 0 10-2 0v10.82L5.71 9.94a1 1 0 00-1.41 1.41l5.59 5.59a1 1 0 001.41 0l5.58-5.59a1 1 0 000-1.41z" />
        </svg>
        <span className="text-sm text-blue-600 font-medium">
          {file ? file.name : "Click to select an Excel file"}
        </span>
        <input
          type="file"
          accept=".xlsx, .xls"
          className="hidden"
          onChange={(e) => setFile(e.target.files[0])}
        />
      </label>

      <button
        onClick={handleUpload}
        className="mt-6 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium transition-all"
      >
        📤 Upload Excel File
      </button>

       <a
        href="excelsablon.xlsx"
        download
        className="mt-4 w-full inline-block text-center bg-gray-100 hover:bg-gray-200 text-blue-700 font-medium py-2 rounded border border-blue-300 transition-all"
      >
        📥 Download Sample Excel
      </a>

      {message && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 border border-green-300 rounded text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 border border-red-300 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default AddExcelList;

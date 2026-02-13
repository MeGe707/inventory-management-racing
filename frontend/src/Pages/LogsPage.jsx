import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../Context/AppContext";
import { Clock } from "lucide-react";

export default function LogsPage() {
  const { token, link } = useContext(AppContext);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [searchType, setSearchType] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const typeColors = {
    CREATE_ITEM: "border-green-500",
    UPDATE_ITEM: "border-yellow-500",
    DELETE_ITEM: "border-red-500",
    CREATE_USER: "border-blue-500",
    DELETE_USER: "border-pink-500",
    CREATE_ADMIN: "border-indigo-500",
    DELETE_ADMIN: "border-orange-500",
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(`${link}/user/get-logs`);
        setLogs(res.data.data);
        setFilteredLogs(res.data.data);
      } catch (error) {
        console.error("Error while fetching logs:", error);
      }
    };
    fetchLogs();
  }, [token]);

  useEffect(() => {
    const filtered = logs.filter((log) => {
      const userMatch = searchUser
        ? log.userName?.toLowerCase().includes(searchUser.toLowerCase())
        : true;
      const typeMatch = searchType ? log.actionType === searchType : true;
      return userMatch && typeMatch;
    });
    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [searchUser, searchType, logs]);

  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentLogs = filteredLogs.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredLogs.length / perPage);

  const nextPage = () =>
    currentPage < totalPages && setCurrentPage((p) => p + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage((p) => p - 1);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Activity Logs</h2>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Filter by username"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 w-64"
        />

        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="">All Actions</option>
          <option value="CREATE_ITEM">Create Item</option>
          <option value="UPDATE_ITEM">Update Item</option>
          <option value="DELETE_ITEM">Delete Item</option>
          <option value="CREATE_USER">Create User</option>
          <option value="DELETE_USER">Delete User</option>
          <option value="CREATE_ADMIN">Create Admin</option>
          <option value="DELETE_ADMIN">Delete Admin</option>
        </select>

        <select
          value={perPage}
          onChange={(e) => setPerPage(Number(e.target.value))}
          className="ml-auto border border-gray-300 rounded px-3 py-2"
        >
          <option value={5}>5 / page</option>
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      {/* LOG LIST */}
      <div className="space-y-4">
        {currentLogs.map((log) => (
          <div
            key={log._id}
            className={`border-l-4 ${
              typeColors[log.actionType] || "border-gray-300"
            } bg-white rounded-lg shadow p-4 hover:shadow-md transition-all duration-200`}
          >
            <div className="flex justify-between items-center">
              <div className="font-semibold text-gray-800">
                {log.actionType}
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="text-sm mt-2 text-gray-700">
              {log.description}
            </div>

            <div className="text-sm text-gray-500 mt-1">
              User:{" "}
              <span className="font-medium">
                {log.userName || "Superadmin"}
              </span>
            </div>

            <div className="text-sm text-gray-500">
              Target: {log.targetType} — {log.targetId}
            </div>

            {(log.before || log.after) && (
              <div className="mt-4">
                <div className="flex flex-col md:flex-row gap-6">
                  {log.before && (
                    <details className="w-full md:w-1/2">
                      <summary className="text-sm font-semibold text-gray-600 cursor-pointer mb-1">
                        Before State
                      </summary>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-2 max-h-64 overflow-auto">
                        {JSON.stringify(log.before, null, 2)}
                      </pre>
                    </details>
                  )}

                  {log.after && (
                    <details className="w-full md:w-1/2">
                      <summary className="text-sm font-semibold text-gray-600 cursor-pointer mb-1">
                        After State
                      </summary>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-2 max-h-64 overflow-auto">
                        {JSON.stringify(log.after, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-3 mt-8">
        <button
          onClick={prevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 border rounded text-sm font-medium hover:bg-gray-100 disabled:opacity-40"
        >
          ⬅ Previous
        </button>

        <span className="text-sm text-gray-700 font-medium">
          Page {currentPage} / {totalPages}
        </span>

        <button
          onClick={nextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 border rounded text-sm font-medium hover:bg-gray-100 disabled:opacity-40"
        >
          Next ➡
        </button>
      </div>
    </div>
  );
}

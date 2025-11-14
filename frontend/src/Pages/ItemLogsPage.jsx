import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../Context/AppContext";

export default function ItemLogsPage() {
  const { token, link} = useContext(AppContext);
  const { itemId } = useParams(); 

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedLogs, setPaginatedLogs] = useState([]);

  // LOG GETİRME
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get( `${link}/user/get-logs`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const filteredLogs = res.data.data.filter(
          (log) => log.targetId === itemId
        );

        setLogs(filteredLogs);
      } catch (error) {
        console.error("Loglar alınırken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [itemId, token]);

  // SAYFALAMA
  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setPaginatedLogs(logs.slice(startIndex, endIndex));
  }, [logs, pageSize, currentPage]);

  const totalPages = Math.ceil(logs.length / pageSize);

  const handlePageChange = (pageNum) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  if (loading) return <div className="p-6">Yükleniyor...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Item Logları</h2>

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm text-gray-600">Göster:</label>
        <select
          className="border px-3 py-1 rounded"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span className="text-sm text-gray-500">log/sayfa</span>
      </div>

      {logs.length === 0 ? (
        <p className="text-gray-500">Bu iteme ait hiç log bulunamadı.</p>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedLogs.map((log) => (
              <div
                key={log._id}
                className="border border-gray-300 rounded-lg shadow p-4 hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-blue-700">
                    {log.actionType}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleString("tr-TR")}
                  </div>
                </div>

                <div className="text-sm mt-2 text-gray-700">
                  {log.description}
                </div>

                <div className="text-sm text-gray-500 mt-1">
                  Kullanıcı:{" "}
                  <span className="font-medium">
                    {log.userName || "Superadmin"}
                  </span>
                </div>

                <div className="text-sm text-gray-500">
                  Hedef: {log.targetType} - {log.targetId}
                </div>

                {(log.before || log.after) && (
                  <div className="flex gap-4 mt-2">
                    {log.before && (
                      <details className="w-1/2">
                        <summary className="text-sm text-gray-600 cursor-pointer">
                          Önceki Durum
                        </summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(log.before, null, 2)}
                        </pre>
                      </details>
                    )}
                    {log.after && (
                      <details className="w-1/2">
                        <summary className="text-sm text-gray-600 cursor-pointer">
                          Sonraki Durum
                        </summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(log.after, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sayfa numaraları */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2 text-sm">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded border disabled:opacity-30"
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 rounded border ${
                    currentPage === i + 1
                      ? "bg-blue-500 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded border disabled:opacity-30"
              >
                ›
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

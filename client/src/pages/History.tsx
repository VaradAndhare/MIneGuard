import { useEffect, useState } from "react";

export default function History() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const token = localStorage.getItem("token");

  fetch("/api/history", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);

      if (Array.isArray(data)) {
        setHistory(data);
      } else {
        setHistory([]);
      }

      setLoading(false);
    })
    .catch((err) => {
      console.error(err);
      setLoading(false);
    });
}, []);
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">
        Scan History
      </h1>

      {loading && (
        <p>Loading...</p>
      )}

      {!loading && history.length === 0 && (
        <p className="text-muted-foreground">
          No files checked yet.
        </p>
      )}

      {history.map((item: any) => (
        <div
          key={item._id}
          className="border rounded-lg p-4"
        >
          <p className="font-medium">
            {item.fileName}
          </p>

          <p className="text-sm text-muted-foreground">
            Similarity: {item.similarity}%
          </p>

          <p className="text-sm text-muted-foreground">
            Originality: {item.originality}%
          </p>

          <p className="text-xs text-muted-foreground">
            {new Date(item.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
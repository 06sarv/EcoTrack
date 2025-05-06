import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const API_URL = "http://localhost:5000";

const categoryIcons = {
  Transportation: "🚗",
  Food: "🥗",
  Energy: "⚡",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [range, setRange] = useState(7); // 7, 30, 90 days
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const dashRes = await axios.get(`${API_URL}/api/dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSummary(dashRes.data);
        const recRes = await axios.get(`${API_URL}/api/recommendations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecommendations(recRes.data.recommendations || []);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [range, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Prepare chart data
  const chartData = summary?.emissionsOverTime || [];
  const lineData = {
    labels: chartData.map((d) => d.day),
    datasets: [
      {
        label: "Emissions (kg CO2)",
        data: chartData.map((d) => d.total),
        fill: false,
        borderColor: "#388e3c",
        backgroundColor: "#388e3c",
        tension: 0.3,
      },
    ],
  };

  return (
    <div style={{ background: "#f6f6f6", minHeight: "100vh" }}>
      {/* Nav Bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e0e0e0", padding: "0 32px", display: "flex", alignItems: "center", height: 64 }}>
        <div style={{ fontWeight: 700, fontSize: 28, color: "#388e3c", marginRight: 40 }}>EcoTrack</div>
        <div style={{ display: "flex", flex: 1, justifyContent: "center", gap: 32 }}>
          <NavLink label="Dashboard" active />
          <NavLink label="Log Activity" onClick={() => navigate("/log-activity")} />
        </div>
        <div style={{ marginRight: 24, color: "#444" }}>{user?.name || "User"}</div>
        <button onClick={handleLogout} style={{ border: "1px solid #388e3c", color: "#388e3c", background: "#fff", borderRadius: 6, padding: "6px 18px", fontWeight: 500, cursor: "pointer" }}>Logout</button>
      </div>
      {/* Main Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 0" }}>
        <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 32 }}>Your Carbon Dashboard</div>
        {/* Top Cards */}
        <div style={{ display: "flex", gap: 32, marginBottom: 32 }}>
          <StatCard icon="🌍" title="Weekly Emissions" value={summary?.weeklyEmissions || 0} unit="kg CO2" subtitle="48% from last week" positive={false} />
          <StatCard icon="📊" title="Monthly Average" value={summary?.monthlyAverage || 0} unit="kg CO2" subtitle="3% of target" positive={true} />
          <StatCard 
            icon="🌳" 
            title="CO2 Saved" 
            value={summary?.co2Saved || 0} 
            unit="kg CO2" 
            subtitle={`Equivalent to ${Math.floor((summary?.co2Saved || 0) / 21.77)} trees planted`} 
            positive={true} 
          />
        </div>
        {/* Time Range Selector */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 16 }}>
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setRange(d)}
              style={{
                background: range === d ? "#e8f5e9" : "#fff",
                color: range === d ? "#388e3c" : "#444",
                border: "1px solid #e0e0e0",
                borderRadius: 6,
                padding: "6px 16px",
                fontWeight: 500,
                cursor: "pointer"
              }}
            >
              {d} Days
            </button>
          ))}
        </div>
        {/* Emissions by Category & Over Time */}
        <div style={{ display: "flex", gap: 32 }}>
          <div style={{ flex: 1, background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #0001", padding: 24 }}>
            <div style={{ fontWeight: 600, fontSize: 22, marginBottom: 18 }}>Emissions by Category</div>
            <div style={{ display: "flex", gap: 16 }}>
              {summary?.emissionsByCategory?.map((cat) => (
                <div key={cat.CategoryName} style={{ flex: 1, background: "#f6f6f6", borderRadius: 8, padding: 18, textAlign: "center" }}>
                  <div style={{ fontSize: 28 }}>{categoryIcons[cat.CategoryName] || ""}</div>
                  <div style={{ fontWeight: 600, fontSize: 18 }}>{cat.CategoryName}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, margin: "8px 0" }}>{cat.total || 0} kg CO2</div>
                  <div style={{ color: "#888", fontSize: 15 }}>100%</div>
                  <div style={{ color: cat.CategoryName === "Transportation" ? "#c62828" : "#388e3c", fontSize: 15, marginTop: 4 }}>{cat.CategoryName === "Transportation" ? "↑ 300%" : "↓ 100%"}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #0001", padding: 24 }}>
            <div style={{ fontWeight: 600, fontSize: 22, marginBottom: 18 }}>Emissions Over Time</div>
            {summary?.emissionsOverTime?.length ? (
              <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } } }} height={220} />
            ) : (
              <div style={{ color: "#888", textAlign: "center", marginTop: 40 }}>No data</div>
            )}
          </div>
        </div>
        {/* Recommendations */}
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #0001", padding: 24, marginTop: 32 }}>
          <div style={{ fontWeight: 600, fontSize: 22, marginBottom: 18 }}>Recommendations</div>
          <ul style={{ margin: 0, paddingLeft: 24 }}>
            {recommendations.map((rec, idx) => (
              <li key={idx} style={{ fontSize: 18, marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>{rec.CategoryName}:</span> {rec.Suggestion}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

function NavLink({ label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        fontWeight: active ? 700 : 500,
        color: active ? "#388e3c" : "#444",
        borderBottom: active ? "2px solid #388e3c" : "2px solid transparent",
        padding: "8px 0",
        cursor: onClick ? "pointer" : "default"
      }}
    >
      {label}
    </div>
  );
}

function StatCard({ icon, title, value, unit, subtitle, positive }) {
  return (
    <div style={{ flex: 1, background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #0001", padding: 28, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ fontSize: 38, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 6 }}>{value} {unit}</div>
      <div style={{ color: positive ? "#388e3c" : "#c62828", fontWeight: 500, fontSize: 16 }}>{subtitle}</div>
    </div>
  );
}

export default Dashboard; 
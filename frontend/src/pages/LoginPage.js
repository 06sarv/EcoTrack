import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

const API_URL = "http://localhost:5000/api/auth";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        // Login
        const res = await axios.post(`${API_URL}/login`, {
          email: form.email,
          password: form.password,
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard");
      } else {
        // Register
        const res = await axios.post(`${API_URL}/register`, {
          name: form.username,
          email: form.email,
          password: form.password,
        });
        // Optionally, auto-login after register
        setIsLogin(true);
        setError("Registration successful! Please log in.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (isLogin ? "Login failed." : "Registration failed.")
      );
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Left: Form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa" }}>
        <div style={{ width: 400, background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px #0001", padding: 40 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 48, color: "#388e3c", marginBottom: 8 }}>
              <span role="img" aria-label="clock">🕒</span>
            </div>
            <div style={{ fontWeight: 700, fontSize: 32, color: "#388e3c" }}>EcoTrack</div>
            <div style={{ color: "#444", marginTop: 8, fontSize: 16 }}>
              Track your carbon footprint and make a difference.
            </div>
          </div>
          <div style={{ display: "flex", marginBottom: 24 }}>
            <button
              style={{
                flex: 1,
                padding: 10,
                background: isLogin ? "#e8f5e9" : "#f5f5f5",
                border: "none",
                borderRadius: "6px 0 0 6px",
                fontWeight: isLogin ? 700 : 400,
                color: isLogin ? "#388e3c" : "#444",
                cursor: "pointer"
              }}
              onClick={() => { setIsLogin(true); setError(""); }}
            >
              Login
            </button>
            <button
              style={{
                flex: 1,
                padding: 10,
                background: !isLogin ? "#e8f5e9" : "#f5f5f5",
                border: "none",
                borderRadius: "0 6px 6px 0",
                fontWeight: !isLogin ? 700 : 400,
                color: !isLogin ? "#388e3c" : "#444",
                cursor: "pointer"
              }}
              onClick={() => { setIsLogin(false); setError(""); }}
            >
              Register
            </button>
          </div>
          {error && <div style={{ color: "#c62828", marginBottom: 16, textAlign: "center" }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 4 }}>Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={handleChange}
                  style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
                  required
                />
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 4 }}>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
                required
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", marginBottom: 4 }}>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
                required
              />
            </div>
            <button
              type="submit"
              style={{ width: "100%", background: "#388e3c", color: "#fff", padding: 12, border: "none", borderRadius: 6, fontWeight: 600, fontSize: 18, cursor: "pointer" }}
            >
              {isLogin ? "Login" : "Register"}
            </button>
          </form>
          <div style={{ color: "#888", fontSize: 14, marginTop: 16, textAlign: "center" }}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
      {/* Right: Green Info Panel */}
      <div style={{ flex: 1, background: "#43a047", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: 420 }}>
          <div style={{ fontSize: 40, fontWeight: 700, marginBottom: 24 }}>
            Track. Reduce. Make a Difference.
          </div>
          <div style={{ fontSize: 20, marginBottom: 32 }}>
            EcoTrack helps you understand your carbon footprint through daily activities. Get personalized insights and recommendations to make sustainable choices.
          </div>
          <ul style={{ paddingLeft: 32, margin: 0 }}>
            <li style={{ fontSize: 20, marginBottom: 6, fontWeight: 500 }}>Track Daily Activities
              <div style={{ color: "#c8e6c9", fontSize: 16, marginLeft: 8, marginBottom: 8, fontWeight: 400 }}>
                Log your transportation, energy use, and food consumption with easy-to-use forms.
              </div>
            </li>
            <li style={{ fontSize: 20, marginBottom: 6, fontWeight: 500 }}>Visualize Your Impact
              <div style={{ color: "#c8e6c9", fontSize: 16, marginLeft: 8, marginBottom: 8, fontWeight: 400 }}>
                See detailed weekly reports and understand your emissions across different categories.
              </div>
            </li>
            <li style={{ fontSize: 20, marginBottom: 6, fontWeight: 500 }}>Get Smart Recommendations
              <div style={{ color: "#c8e6c9", fontSize: 16, marginLeft: 8, fontWeight: 400 }}>
                Receive personalized suggestions to reduce your carbon footprint based on your habits.
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 
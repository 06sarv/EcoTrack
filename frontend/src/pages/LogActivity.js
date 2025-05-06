import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000";
const categories = ["Transportation", "Food", "Energy"];

// Hardcoded options for each category
const categoryOptions = {
  Transportation: {
    types: ["Car", "Bus", "Train", "Plane", "Bicycle", "Walking"],
    unit: "km"
  },
  Food: {
    types: ["Beef", "Lamb", "Pork", "Chicken", "Fish", "Dairy", "Vegetables", "Fruits", "Grains"],
    mealTypes: ["Breakfast", "Lunch", "Dinner", "Snack"],
    foodSources: ["Home made", "Restaurant", "Takeaway", "Fast food"],
    unit: "meal"
  },
  Energy: {
    types: ["Electricity", "Natural Gas", "Heating Oil", "Propane", "Wood", "Grid"],
    energySources: ["Grid", "Solar", "Wind", "Nuclear", "Hydro", "Fossil Fuels"],
    unit: "kWh"
  }
};

const LogActivity = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("Transportation");
  const [form, setForm] = useState({
    activityId: "",
    quantity: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
    // Transportation specific
    transportationType: "",
    numPassengers: 1,
    // Food specific
    mealType: "",
    foodSource: "",
    // Energy specific
    energySource: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!form.activityId || !form.quantity) {
      setError("Please fill all required fields.");
      return;
    }

    // Validate category-specific fields
    if (activeTab === "Transportation" && (!form.numPassengers || form.numPassengers < 1)) {
      setError("Please enter a valid number of passengers.");
      return;
    }
    if (activeTab === "Food" && (!form.mealType || !form.foodSource)) {
      setError("Please select both meal type and food source.");
      return;
    }
    if (activeTab === "Energy" && !form.energySource) {
      setError("Please select an energy source.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/activity/log`,
        {
          activityId: form.activityId, // This is now the activity type string
          quantity: parseFloat(form.quantity),
          date: form.date,
          notes: form.notes,
          // Category specific fields
          ...(activeTab === "Transportation" && {
            transportationType: form.activityId,
            numPassengers: parseInt(form.numPassengers)
          }),
          ...(activeTab === "Food" && {
            mealType: form.mealType,
            foodSource: form.foodSource
          }),
          ...(activeTab === "Energy" && {
            energySource: form.energySource
          })
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess("Activity logged successfully!");
      setForm({
        activityId: "",
        quantity: "",
        date: new Date().toISOString().slice(0, 10),
        notes: "",
        transportationType: "",
        numPassengers: 1,
        mealType: "",
        foodSource: "",
        energySource: ""
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to log activity.");
    }
  };

  return (
    <div style={{ background: "#f6f6f6", minHeight: "100vh" }}>
      {/* Nav Bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e0e0e0", padding: "0 32px", display: "flex", alignItems: "center", height: 64 }}>
        <div style={{ fontWeight: 700, fontSize: 28, color: "#388e3c", marginRight: 40, cursor: "pointer" }} onClick={() => navigate("/dashboard")}>EcoTrack</div>
        <div style={{ display: "flex", flex: 1, justifyContent: "center", gap: 32 }}>
          <NavLink label="Dashboard" onClick={() => navigate("/dashboard")} />
          <NavLink label="Log Activity" active />
        </div>
        <div style={{ marginRight: 24, color: "#444" }}>{user?.name || "User"}</div>
        <button onClick={() => { localStorage.clear(); navigate("/login"); }} style={{ border: "1px solid #388e3c", color: "#388e3c", background: "#fff", borderRadius: 6, padding: "6px 18px", fontWeight: 500, cursor: "pointer" }}>Logout</button>
      </div>

      {/* Centered Card */}
      <div style={{ maxWidth: 600, margin: "32px auto", padding: "0 16px" }}>
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px #0001", padding: 32 }}>
          <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Log Activity</div>
          
          {/* Category Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                style={{
                  flex: 1,
                  background: activeTab === cat ? "#e8f5e9" : "#fff",
                  color: activeTab === cat ? "#388e3c" : "#444",
                  border: "1px solid #e0e0e0",
                  borderRadius: 6,
                  padding: "12px",
                  fontWeight: 500,
                  cursor: "pointer"
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div style={{ background: "#e8f5e9", color: "#388e3c", padding: 12, borderRadius: 6, marginBottom: 24 }}>
              {success}
            </div>
          )}
          {error && (
            <div style={{ background: "#ffebee", color: "#c62828", padding: 12, borderRadius: 6, marginBottom: 24 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Activity Type */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", marginBottom: 6 }}>{activeTab} Type</label>
              <select
                name="activityId"
                value={form.activityId}
                onChange={handleChange}
                style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
                required
              >
                <option value="">Select type</option>
                {categoryOptions[activeTab].types.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", marginBottom: 6 }}>
                {activeTab === "Transportation" ? "Distance" : 
                 activeTab === "Food" ? "Number of Meals" : 
                 "Energy Used"} ({categoryOptions[activeTab].unit})
              </label>
              <input
                type="number"
                name="quantity"
                min="0"
                step="any"
                value={form.quantity}
                onChange={handleChange}
                style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
                required
              />
            </div>

            {/* Category-specific fields */}
            {activeTab === "Transportation" && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", marginBottom: 6 }}>Number of Passengers</label>
                <input
                  type="number"
                  name="numPassengers"
                  min="1"
                  value={form.numPassengers}
                  onChange={handleChange}
                  style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
                  required
                />
              </div>
            )}

            {activeTab === "Food" && (
              <>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", marginBottom: 6 }}>Meal Type</label>
                  <select
                    name="mealType"
                    value={form.mealType}
                    onChange={handleChange}
                    style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
                    required
                  >
                    <option value="">Select meal type</option>
                    {categoryOptions.Food.mealTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", marginBottom: 6 }}>Food Source</label>
                  <select
                    name="foodSource"
                    value={form.foodSource}
                    onChange={handleChange}
                    style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
                    required
                  >
                    <option value="">Select food source</option>
                    {categoryOptions.Food.foodSources.map((source) => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {activeTab === "Energy" && (
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", marginBottom: 6 }}>Energy Source</label>
                <select
                  name="energySource"
                  value={form.energySource}
                  onChange={handleChange}
                  style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
                  required
                >
                  <option value="">Select energy source</option>
                  {categoryOptions.Energy.energySources.map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Date */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", marginBottom: 6 }}>Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ccc" }}
                required
              />
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", marginBottom: 6 }}>Notes (Optional)</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                style={{ width: "100%", padding: 10, borderRadius: 4, border: "1px solid #ccc", minHeight: 48 }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              style={{ width: "100%", background: "#388e3c", color: "#fff", padding: 12, border: "none", borderRadius: 6, fontWeight: 600, fontSize: 18, cursor: "pointer" }}
              disabled={loading}
            >
              Log {activeTab}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const NavLink = ({ label, active, onClick }) => (
  <div
    onClick={onClick}
    style={{
      color: active ? "#388e3c" : "#444",
      fontWeight: active ? 600 : 400,
      cursor: "pointer",
      padding: "8px 16px",
      borderRadius: 6,
      background: active ? "#e8f5e9" : "transparent"
    }}
  >
    {label}
  </div>
);

export default LogActivity; 
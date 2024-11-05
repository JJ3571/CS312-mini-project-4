import React, { useState } from "react";
import axios from "axios";

const Signin = () => {
  const [user_id, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/signin", { user_id, password });
      setMessage(response.data);
    } catch (error) {
      console.error(error);
      setMessage("Error signing in.");
    }
  };

  return (
    <div>
      <h2>Signin</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={user_id}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="User ID"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Signin</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Signin;

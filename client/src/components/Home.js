import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Container, Paper, Tabs, Tab, Typography, Box, TextField, Button, Alert
} from "@mui/material";

export default function Home() {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const url = tab === 0 ? "/api/auth/signup" : "/api/auth/login";
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Auth error");
      login(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={4} sx={{ p: 4 }}>
        <Tabs value={tab} onChange={(_, val) => setTab(val)} centered>
          <Tab label="Sign Up" />
          <Tab label="Login" />
        </Tabs>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Username" name="username" value={form.username}
            onChange={handleChange} fullWidth required sx={{ mb: 2 }}
          />
          <TextField
            label="Password" name="password" type="password" value={form.password}
            onChange={handleChange} fullWidth required sx={{ mb: 2 }}
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button fullWidth type="submit" variant="contained" color="primary">
            {tab === 0 ? "Sign Up" : "Login"}
          </Button>
        </Box>
      </Paper>
      <Typography align="center" sx={{ mt: 2, color: "gray" }}>
        <b>Expense Tracker Bank</b> - Manage your money smartly!
      </Typography>
    </Container>
  );
}

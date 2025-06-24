import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Container, Typography, Button, Box, TextField, Paper, MenuItem,
  TableContainer, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Select, InputLabel, FormControl
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";

const categories = ["Food", "Transport", "Shopping", "Bills", "Other"];
const paymentTypes = ["Cash", "Card", "UPI", "Netbanking", "Other"];

export default function Dashboard() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(user?.balance || 0);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ amount: "", date: "", paymentType: "", category: "", description: "" });
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (!token) return navigate("/");
    fetchExpenses();
    // eslint-disable-next-line
  }, [token, sortBy, order]);

  const fetchExpenses = async () => {
    const res = await fetch(`/api/expenses?sortBy=${sortBy}&order=${order}`, {
      headers: { "x-auth-token": token }
    });
    const data = await res.json();
    setExpenses(data.expenses || []);
    setBalance(data.balance);
  };

  // Initial balance
  const handleSetBalance = async (e) => {
    e.preventDefault();
    const val = parseFloat(balance);
    if (Number.isNaN(val)) return;
    await fetch("/api/expenses/balance", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-auth-token": token },
      body: JSON.stringify({ balance: val })
    });
    fetchExpenses();
  };

  // Add Expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-auth-token": token },
      body: JSON.stringify(form)
    });
    setForm({ amount: "", date: "", paymentType: "", category: "", description: "" });
    fetchExpenses();
  };

  // Edit Expense
  const handleEditExpense = (expense) => {
    setEditId(expense._id);
    setEditForm(expense);
  };

  const handleSaveEdit = async (id) => {
    await fetch(`/api/expenses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-auth-token": token },
      body: JSON.stringify(editForm)
    });
    setEditId(null);
    fetchExpenses();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Paper sx={{ p: 3, mb: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">Welcome, {user?.username}</Typography>
          <Button color="secondary" onClick={() => { logout(); navigate("/"); }} endIcon={<LogoutIcon />}>Logout</Button>
        </Box>
        <Box component="form" onSubmit={handleSetBalance} sx={{ mt: 2, mb: 2 }}>
          <TextField
            label="Initial Bank Balance" type="number" value={balance} onChange={e => setBalance(e.target.value)}
            required sx={{ mr: 2, width: "200px" }}
          />
          <Button type="submit" variant="outlined">Set Balance</Button>
        </Box>
        <Typography variant="h6" color="primary">Current Balance: ₹{balance}</Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Add Expense</Typography>
        <Box component="form" onSubmit={handleAddExpense} sx={{ display: "flex", gap: 2 }}>
          <TextField label="Amount" type="number" name="amount" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
          <TextField label="Date" type="date" name="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required InputLabelProps={{ shrink: true }} />
          <FormControl>
            <InputLabel>Payment</InputLabel>
            <Select name="paymentType" value={form.paymentType} onChange={e => setForm({ ...form, paymentType: e.target.value })} required sx={{ minWidth: 100 }}>
              {paymentTypes.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel>Category</InputLabel>
            <Select name="category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required sx={{ minWidth: 100 }}>
              {categories.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Description" name="description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <Button type="submit" variant="contained">Add</Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box display="flex" gap={2} alignItems="center" mb={2}>
          <Typography variant="h6">Transaction History</Typography>
          <FormControl size="small">
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} onChange={e => setSortBy(e.target.value)} label="Sort By">
              <MenuItem value="amount">Amount</MenuItem>
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="createdAt">Created</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small">
            <InputLabel>Order</InputLabel>
            <Select value={order} onChange={e => setOrder(e.target.value)} label="Order">
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Amount (₹)</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Edit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenses.map(exp => (
                <TableRow key={exp._id}>
                  <TableCell>
                    {editId === exp._id
                      ? <TextField type="date" value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} size="small" />
                      : new Date(exp.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {editId === exp._id
                      ? <TextField type="number" value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: e.target.value })} size="small" />
                      : exp.amount}
                  </TableCell>
                  <TableCell>
                    {editId === exp._id
                      ? <Select value={editForm.paymentType} onChange={e => setEditForm({ ...editForm, paymentType: e.target.value })} size="small">
                          {paymentTypes.map(pt => <MenuItem key={pt} value={pt}>{pt}</MenuItem>)}
                        </Select>
                      : exp.paymentType}
                  </TableCell>
                  <TableCell>
                    {editId === exp._id
                      ? <Select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} size="small">
                          {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                        </Select>
                      : exp.category}
                  </TableCell>
                  <TableCell>
                    {editId === exp._id
                      ? <TextField value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} size="small" />
                      : exp.description}
                  </TableCell>
                  <TableCell>
                    {editId === exp._id
                      ? <Button onClick={() => handleSaveEdit(exp._id)} color="success" size="small">Save</Button>
                      : <IconButton onClick={() => handleEditExpense(exp)}><EditIcon /></IconButton>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {expenses.length === 0 && <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>No transactions yet.</Typography>}
      </Paper>
    </Container>
  );
}

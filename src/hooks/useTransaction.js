import { useState, useEffect } from "react";
import { transactionService } from "../services/transactionService";

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    const data = await transactionService.getAll();
    setTransactions(data);
  }

  return {
    transactions,
  };
}
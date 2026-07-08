import { useEffect, useState } from "react";
import { supabase } from "./services/supabase";

export const transactionService = {
  async getAll() {
    return mockTransactions;
  },

  async create(transaction) {
    return transaction;
  },

  async delete(id) {
    return true;
  },
};

import { useEffect, useState } from "react";
import { supabase } from "./services/supabase";

export const transactionService = {
  async getAll() {
    return mockTransactions;
  },

  async create(transaction) {
    return transaction;
  },

  async delete(id) {
    return true;
  },
};
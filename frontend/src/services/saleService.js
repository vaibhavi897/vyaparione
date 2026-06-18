import api from "./api";

export const getSales = async () => {
  const response = await api.get("/sales");
  return response.data;
};

export const recordSale = async (saleData) => {
  const response = await api.post("/sales", saleData);
  return response.data;
};

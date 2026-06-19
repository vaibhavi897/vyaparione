import api from "./api";

export const getForecastData = async () => {
  const response = await api.get("/forecast");
  return response.data;
};

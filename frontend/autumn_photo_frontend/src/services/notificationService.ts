import axios from "./axiosinstances";

export const getNotifications = async (page: number = 1) => {
  const res = await axios.get(`/notifications/?page=${page}`);
  return res.data;
};

export const markNotificationRead = async (id: number) => {
  await axios.post(`/notifications/${id}/read/`);
};

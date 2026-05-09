import axios from "axios";
import { toast } from "react-toastify";

export function getAllUsers(loggedInUserId, setAllUsers) {
  axios
    .get(`${import.meta.env.VITE_BACKEND_URL}/api/users/get-all-users/${loggedInUserId}`)
    .then((res) => {
      setAllUsers(res.data.result);
    })
    .catch((error) => {
      toast.error(error.error);
    });
}
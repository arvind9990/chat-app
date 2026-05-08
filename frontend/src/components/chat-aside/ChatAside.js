import axios from "axios";
import { toast } from "react-toastify";
export function getAllUsers(loggedInUserId, setAllUsers) {
  axios
    .get(`https://chat-app-cpw1.onrender.com`)
    .then((res) => {
      //   console.log(res.data);
      setAllUsers(res.data.result);
    })
    .catch((error) => {
      toast.error(error.error);
    });
}

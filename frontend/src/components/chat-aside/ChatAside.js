import axios from "axios";
import { toast } from "react-toastify";
export function getAllUsers(loggedInUserId, setAllUsers) {
  axios
    .get(`http://localhost:3000/api/users/get-all-users/${loggedInUserId}`)
    .then((res) => {
      //   console.log(res.data);
      setAllUsers(res.data.result);
    })
    .catch((error) => {
      toast.error(error.error);
    });
}
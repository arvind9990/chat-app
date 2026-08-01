import axios from "axios";
import { toast } from "react-toastify";

export function signup(formData, navigate) {
  if (checkValidation(formData)) {
    return;
  }

  const data = {
    username: formData.username.trim(),
    password: formData.password,
    email: formData.email.trim(),
    city: formData.city.trim(),
    gender: formData.gender,
  };

  const file = formData.file;
  const fileReader = new FileReader();

  fileReader.readAsDataURL(file);

  fileReader.onloadend = () => {
    axios
      .post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/sign-up`, {
        ...data,
        file: fileReader.result,
      })
      .then((res) => {
        if (res.data.ok) {
          toast.success("Account Created");
          setTimeout(() => {
            navigate("/");
          }, 1000);
        } else {
          throw Error(res.data.error);
        }
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };
}

function checkValidation(formData) {
  if (!formData.username.trim()) {
    toast.error("Username is required");
    return true;
  }

  if (!formData.password) {
    toast.error("Password is required");
    return true;
  }

  if (!formData.email.trim()) {
    toast.error("Email is required");
    return true;
  }

  if (!formData.email.endsWith("@gmail.com")) {
    toast.error("Only Gmail allowed (@gmail.com)");
    return true;
  }

  if (!formData.city.trim()) {
    toast.error("City is required");
    return true;
  }

  if (!formData.file) {
    toast.error("Profile photo is required");
    return true;
  }

  return false;
}
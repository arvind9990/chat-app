import axios from "axios";
const loginUrl = "http://localhost:3000/api/auth/sign-in";
import { toast } from "react-toastify";

export function signin(
  credentials,
  error,
  setError,
  navigate,
  login,
  setLoggedInUser
) {
  const validationError = validateSignin(credentials, error, setError);
  if (!validationError) {
    axios
      .post(loginUrl, credentials)
      .then((res) => {
        if (res.data.ok) {
          setLoggedInUser(res.data.user);
          toast.success("User Logged In", {
            autoClose: 1000,
          });
          login();
        } else {
          throw Error(res.data.error);
        }
      })
      .catch((error) => {
        toast.error(error.message, {
          autoClose: 1500,
        });
      });
  }
}

export function validateSignin({ email, password }, error, setError) {
  var anyErrors = true;
  if (email === "" && password === "") {
    setError((prevState) => {
      return {
        ...prevState,
        email: "Email is required",
        password: "Password is required",
      };
    });
  } else {
    if (email === "") {
      // setError({ ...error, email: "---------" });

      setError((prevState) => {
        return {
          ...prevState,
          email: "Email is required",
        };
      });
    } else if (password === "") {
      setError((prevState) => {
        return {
          ...prevState,
          password: "Password is required",
        };
      });
    } else {
      anyErrors = false;
    }
  }

  return anyErrors;
}
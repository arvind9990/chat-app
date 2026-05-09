import axios from "axios";
import { toast } from "react-toastify";

export function signup(
  usernameRef,
  passwordRef,
  emailRef,
  cityRef,
  genderRef,
  navigate,
  fileRef,
) {
  if (!checkValidation(usernameRef, passwordRef, emailRef, cityRef, fileRef)) {
    var data = {
      username: usernameRef.current.value,
      password: passwordRef.current.value,
      email: emailRef.current.value,
      city: cityRef.current.value,
      gender: genderRef.current.value,
    };

    const file = fileRef.current.files[0];
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
            usernameRef.current.value = "";
            passwordRef.current.value = "";
            emailRef.current.value = "";
            cityRef.current.value = "";
            genderRef.current.value = "male";
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
}

function checkValidation(userNameRef, passwordRef, emailRef, cityRef, fileRef) {
  var anyError = true;

  if (userNameRef.current.value === "") {
    userNameRef.current.style.border = "2px solid red";
    toast.error("Username is required");
  } else if (passwordRef.current.value === "") {
    passwordRef.current.style.border = "2px solid red";
    toast.error("Password is required");
  } else if (emailRef.current.value === "") {
    emailRef.current.style.border = "2px solid red";
    toast.error("Email is required");
  } else if (!emailRef.current.value.endsWith("@gmail.com")) {
    emailRef.current.style.border = "2px solid red";
    toast.error("Only Gmail allowed (@gmail.com)");
  } else if (cityRef.current.value === "") {
    cityRef.current.style.border = "2px solid red";
    toast.error("City is required");
  } else if (!fileRef.current.files[0]) {
    toast.error("Profile photo is required");
  } else {
    anyError = false;
  }

  return anyError;
}
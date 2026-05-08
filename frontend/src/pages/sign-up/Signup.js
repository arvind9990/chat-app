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
  if (
    !checkValidation(usernameRef, passwordRef, emailRef, cityRef, genderRef)
  ) {
    //create data object
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
        .post("https://chat-app-cpw1.onrender.com", {
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

function checkValidation(userNameRef, passwordRef, emailRef, cityRef) {
  var anyError = true;

  if (userNameRef.current.value === "") {
    userNameRef.current.style.border = "2px solid red";
  } else if (passwordRef.current.value === "") {
    passwordRef.current.style.border = "2px solid red";
  } else if (emailRef.current.value === "") {
    emailRef.current.style.border = "2px solid red";
  } else if (cityRef.current.value === "") {
    cityRef.current.style.border = "2px solid red";
  } else {
    anyError = false;
  }

  return anyError;
}

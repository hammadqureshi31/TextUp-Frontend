import React from "react";
import { FcGoogle } from "react-icons/fc";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Spinner } from "flowbite-react";
import axios from "axios";
import { backendPortURL } from "../../config";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { fetchUserDetails } from "../../redux/slice/userSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const loginValidationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("password is required").min(6).max(12),
  });

  const handleLoginUser = async (values) => {
    try {
      const { email, password } = values;
      axios.defaults.withCredentials = true;

      const loginResp = await axios.post(`${backendPortURL}user/login`, {
        email,
        password,
      });

      if (loginResp.data) {
        dispatch(fetchUserDetails());
        navigate("/");
      }
    } catch (error) {
      console.log("Something went wrong! Please try again..", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      window.location.href = `${backendPortURL}auth/google/callback`; 
    } catch (error) {
      console.error("Google sign-in error", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4 py-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
        {/* Heading */}
        <h2 className="text-2xl font-semibold font-acme text-center text-[#334E83] mb-2 md:text-4xl md:mb-5">
          Log in to TextUp
        </h2>
        <p className="text-sm text-center font-roboto text-gray-500 mb-6 md:text-base">
          Welcome back! Sign in using your social account or email to continue
          us
        </p>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={loginValidationSchema}
          onSubmit={handleLoginUser}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4 md:space-y-6">
              {/* Email */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="email"
                >
                  Your email
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 px-4 py-3 w-full border-b border-gray-300 rounded-md text-gray-700 focus:outline-none focus:border"
                  placeholder="Your email"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-red-400 text-xs text-right w-full mb-2"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 "
                  htmlFor="password"
                >
                  Password
                </label>
                <Field
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 px-4 py-3 w-full border-b border-gray-300 rounded-md text-gray-700 focus:outline-none focus:border"
                  placeholder="Password"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-400 text-xs text-right w-full mb-2"
                />
              </div>

              {/* Submit Button */}
              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full mt-2 py-3 bg-gradient-to-r  font-poppins from-[#04081E] via-[#2A2760] to-[#334E83] text-white rounded-full hover:from-gray-700 hover:to-indigo-700 focus:outline-none transition"
                >
                  {isSubmitting ? <Spinner className=" w-full " /> : "Log in"}
                </button>
                <div onClick={()=>navigate('/forgot-password')}
                className="w-full text-center cursor-pointer text-sm text-[#334E83] font-semibold font-poppins">
                  Forgot password ?
                </div>
              </div>
            </Form>
          )}
        </Formik>

        {/* OR Divider */}
        <div className="flex items-center justify-center my-5 w-full md:my-6">
          <hr className="border-gray-400 w-1/5" />
          <span className="mx-2 text-sm  font-semibold font-acme text-[#334E83] md:text-base">
            OR
          </span>
          <hr className="border-gray-400 w-1/5" />
        </div>

        <div onClick={handleGoogleSignIn}
         className="w-full md:w-auto cursor-pointer rounded-full font-roboto transition flex gap-2 items-center justify-center">
          {/* Google Icon Button */}
          <button className="rounded-full flex items-center justify-center">
            <FcGoogle className="w-6 h-6" />
          </button>
          {/* Login Text */}
          <h3 className="text-[#334E83] font-medium font-roboto md:tracking-wider">
            Login with Google
          </h3>
        </div>

        <div className="text-center mt-4">
          <p className="text-sm md:text-base text-gray-400">
            Don't have an account?{" "}
            <a
              onClick={() => navigate("/signup")}
              className="text-gray-400 hover:text-[#334E83] underline cursor-pointer"
            >
            Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

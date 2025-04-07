import React from "react";
import { FcGoogle } from "react-icons/fc";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Spinner } from "flowbite-react";
import axios from "axios";
import { backendPortURL } from "../../config";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const ForgotPasswordValidationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
  });

  let debounceTimer;

  const handleForgotPassword = (values) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      try {
        const { email } = values;
        axios.defaults.withCredentials = true;

        const ForgotPasswordResp = await axios.post(
          `${backendPortURL}user/forgot-password`,
          { email }
        );

        if (ForgotPasswordResp.data) {
          toast.success("Password reset email sent successfully!");
        }
      } catch (error) {
        console.log("Something went wrong! Please try again..", error);
        toast.error("Something went wrong! Please try again..");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4 py-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
        {/* Heading */}
        <h2 className="text-2xl font-semibold font-acme tracking-wider text-center text-[#334E83] mb-2 md:text-3xl md:mb-5">
          Make Forgot Password Request
        </h2>
        <p className="text-sm text-center font-roboto text-gray-500 mb-6 md:text-base">
          Shortly, we will send an email to your registered account with
          instructions to reset your password. Please make sure to check your
          inbox and spam folder.
        </p>

        <Formik
          initialValues={{ email: "" }}
          validationSchema={ForgotPasswordValidationSchema}
          onSubmit={handleForgotPassword}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4 md:space-y-10 md:mt-12">
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

              {/* Submit Button */}
              <div className="flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full mt-2 py-3 bg-gradient-to-r  font-poppins from-[#04081E] via-[#2A2760] to-[#334E83] text-white rounded-full hover:from-gray-700 hover:to-indigo-700 focus:outline-none transition"
                >
                  {isSubmitting ? <Spinner className=" w-full " /> : "Request"}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        <Toaster />

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

export default ForgotPassword;

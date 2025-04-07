import React from "react";
import { FcGoogle } from "react-icons/fc";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Spinner } from "flowbite-react";
import axios from "axios";
import { backendPortURL } from "../../config";
import { useNavigate, useParams } from "react-router";
import { useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";

const ResetPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userId } = useParams()

  const ResetPasswordValidationSchema = Yup.object().shape({
    password: Yup.string().required("password is required").min(6).max(12),
    confirmPassword: Yup.string()
      .required("password is required")
      .min(6)
      .max(12),
  });

  const ResetPassword = async (values) => {
    const { password, confirmPassword } = values;
    axios.defaults.withCredentials = true;

    if (password.trim() !== confirmPassword.trim()) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(
        `${backendPortURL}user/reset-password/${userId}`,
        { password }
      );

      if (response?.data) {
        toast.success("Password reset successful!");
        navigate("/login");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error("Something went wrong! Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4 py-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
        {/* Heading */}
        <h2 className="text-2xl font-semibold font-acme tracking-wider text-center text-[#334E83] mb-2 md:text-3xl md:mb-5">
          Reset Your Password
        </h2>
        <p className="text-sm text-center font-roboto text-gray-500 mb-6 md:text-base">
          Set a new password for your account below. Make sure it's secure and
          easy for you to remember.
        </p>

        <Formik
          initialValues={{ password: "", confirmPassword: "" }}
          validationSchema={ResetPasswordValidationSchema}
          onSubmit={ResetPassword}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4 md:space-y-10 md:mt-12">
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

              {/* Confirm Password */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 "
                  htmlFor="password"
                >
                  Confirm Password
                </label>
                <Field
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="mt-1 px-4 py-3 w-full border-b border-gray-300 rounded-md text-gray-700 focus:outline-none focus:border"
                  placeholder="Confirm Password"
                />
                <ErrorMessage
                  name="confirmPassword"
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
                  {isSubmitting ? <Spinner className=" w-full " /> : "Reset"}
                </button>
              </div>
            </Form>
          )}
        </Formik>

        <Toaster />
      </div>
    </div>
  );
};

export default ResetPassword;

import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Spinner } from "flowbite-react";
import axios from "axios";
import { backendPortURL } from "../../config";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { fetchUserDetails } from "../../redux/slice/userSlice";

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const signupValidationSchema = Yup.object().shape({
    firstname: Yup.string().required("Firstname is required."),
    email: Yup.string().email("Invalid email").required("Email is Required"),
    password: Yup.string()
      .required("Strong password required..")
      .min(6)
      .max(12),
  });

  const handleSignupUser = async (values) => {
    try {
      const { firstname, email, password } = values;
      // console.log(firstname, email, password)
      axios.defaults.withCredentials = true;
      const signupResp = await axios.post(`${backendPortURL}user/signup`, {
        firstname,
        email,
        password,
      });

      console.log("response:", signupResp.data);

      if(signupResp.data){
        dispatch(fetchUserDetails())
      }

      if(signupResp.data.profileSetup){
        navigate('/Home');
      }else{
        navigate('/user/profile-setup')
      }
    } catch (error) {
      console.log("Error is creating an account: ", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-xl">
        {/* Heading */}
        <h2 className="text-2xl font-semibold font-acme text-center text-[#334E83] mb-2 md:text-4xl md:mb-5">
          Sign up with Email
        </h2>
        <p className="text-sm text-center font-roboto text-gray-500 mb-6 md:text-base">
          Get chatting with friends and family today by signing up for our chat
          app!
        </p>

        <Formik
          initialValues={{ firstname: "", email: "", password: "" }}
          validationSchema={signupValidationSchema}
          onSubmit={handleSignupUser}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4 md:space-y-6">
              {/* Name */}
              <div>
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="name"
                >
                  First name
                </label>
                <Field
                  id="firstname"
                  name="firstname"
                  type="text"
                  required
                  className="mt-1 px-4 py-3 w-full border-b border-gray-300 rounded-md text-gray-700 focus:outline-none focus:border"
                  placeholder="Your first name"
                />
                <ErrorMessage
                  name="firstname"
                  component="div"
                  className="text-red-400 text-xs text-right w-full mb-2"
                />
              </div>

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
              <button
                type="submit"
                className="w-full mt-2 py-3 bg-gradient-to-r  font-poppins from-[#04081E] via-[#2A2760] to-[#334E83] text-white rounded-full hover:from-gray-700 hover:to-indigo-700 focus:outline-none transition"
              >
                {isSubmitting ? (
                  <Spinner className="w-full" />
                ) : (
                  "Create an account"
                )}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Signup;

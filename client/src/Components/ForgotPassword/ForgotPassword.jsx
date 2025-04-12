import React, { useContext } from "react";
import PropTypes from "prop-types";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../../UserContext";
function ForgotPassword(props) {
  const { showSnackbar } = useContext(UserContext);
  const navigate = useNavigate();
  const handleSubmit = async (value) => {
    try {
      if (value.email.length > 0) {
        const res = await axios
          .post(`http://localhost:8080/forgetPassword`, value)
          .then(() => {
            showSnackbar("Email Sent Successfully.", "success");
            navigate("/ChangePassword");
          });
      }
    } catch (error) {
      showSnackbar(
        error.response?.data?.message || "An error occurred",
        "error"
      );
      console.error(error);
    }
  };
  return (
    <div className="flex h-screen items-center bg-blue-50">
      <div className="mx-auto">
        <p className="my-[20px]">Write Your Email For Sending Rest Code </p>
        <Formik
          onSubmit={handleSubmit}
          enableReinitialize
          initialValues={{ email: "" }}
        >
          {() => (
            <Form>
              <Field
                type="email"
                className="block mb-1 w-full rounded-sm p-2 border"
                name="email"
                placeholder="Your Email"
              />
              <button
                type="submit"
                className="bg-blue-500 block w-full rounded-sm text-white p-2 hover:bg-blue-600 disabled:bg-gray-400"
              >
                Send
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

ForgotPassword.propTypes = {};

export default ForgotPassword;

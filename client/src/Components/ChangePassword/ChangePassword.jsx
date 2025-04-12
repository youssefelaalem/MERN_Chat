import React, { useContext, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";

import PropTypes from "prop-types";
import EyeIcon from "../../assets/icons/EyeIcon";
import EyeSlashIcon from "../../assets/icons/EyeSlashIcon";
import axios from "axios";
import { UserContext } from "../../UserContext";
import { useNavigate } from "react-router-dom";

function ChangePassword(props) {
  const { showSnackbar } = useContext(UserContext);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleSubmit = async (value) => {
    try {
      const res = await axios
        .post(`http://localhost:8080/verifyResetCode`, value)
        .then(() => {
          showSnackbar("Password Changed Successfully.", "success");
          navigate("/");
        });
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
      <Formik
        enableReinitialize
        initialValues={{ resetCode: "", password: "", confirmPassword: "" }}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form className="flex mx-auto flex-col">
            <Field
              type="number"
              className="number-input block mb-1 w-full rounded-sm p-2 border"
              name="resetCode"
              placeholder="Rest Code"
            />
            <div className="mb-1">
              <div className="relative">
                <Field
                  type={showPassword ? "text" : "password"}
                  className="block w-full rounded-sm p-2 border pr-10"
                  name="password"
                  placeholder="New Password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
                </button>
              </div>
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <div className="mb-1">
              <div className="relative">
                <Field
                  type={showConfirmPassword ? "text" : "password"}
                  className="block w-full rounded-sm p-2 border pr-10"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeIcon /> : <EyeSlashIcon />}
                </button>
              </div>
              <ErrorMessage
                name="confirmPassword"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 block w-full rounded-sm text-white p-2 hover:bg-blue-600 disabled:bg-gray-400"
            >
              Update Password
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

ChangePassword.propTypes = {};

export default ChangePassword;

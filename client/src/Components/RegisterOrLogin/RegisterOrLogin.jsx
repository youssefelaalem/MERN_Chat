import { useState } from "react";
import { useContext } from "react";
import { UserContext } from "../../UserContext";
import PropTypes from "prop-types";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { loginSchema, registerSchema } from "./Validation";
import EyeIcon from "../../assets/icons/EyeIcon";
import EyeSlashIcon from "../../assets/icons/EyeSlashIcon";
// import styles from "yet-another-react-lightbox/styles.css";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axios";

export default function RegisterOrLogin({ setErrorMessage }) {
  const [formType, setFormType] = useState("login");
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const endpoint = formType === "register" ? "register" : "login";
      const res = await axiosInstance.post(`/${endpoint}`, values);

      setLoggedInUsername(values.username);
      setId(res.data.id);
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "An error occurred");
    }
    setSubmitting(false);
  };

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <div className="w-64 mx-auto mb-12">
        <Formik
          key={formType} // Reset form when switching types
          initialValues={
            formType === "register"
              ? { email: "", username: "", password: "" }
              : { username: "", password: "" }
          }
          validationSchema={
            formType === "register" ? registerSchema : loginSchema
          }
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              {formType === "register" && (
                <div className="mb-2">
                  <Field
                    name="email"
                    type="email"
                    placeholder="Email"
                    className="block w-full rounded-sm p-2 border"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-sm"
                  />
                </div>
              )}

              <div className="mb-2">
                <Field
                  name="username"
                  type="text"
                  placeholder="Username"
                  className="block w-full rounded-sm p-2 border"
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>
              <div className="mb-1">
                <div className="relative">
                  <Field
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="block w-full rounded-sm p-2 border pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
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
              {formType === "login" && (
                <div className={"ForgotPassword  mb-1"}>
                  <Link
                    to={"/ForgotPassword"}
                    className="text-blue-600 text-[14px] underline"
                  >
                    Forgot Password
                  </Link>
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 block w-full rounded-sm text-white p-2 hover:bg-blue-600 disabled:bg-gray-400"
              >
                {formType === "login" ? "Login" : "Register"}
              </button>

              <div className="text-center mt-2">
                {formType === "login" ? (
                  <span>
                    {"Don't have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() => setFormType("register")}
                      className="text-blue-600 hover:underline"
                    >
                      Register
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setFormType("login")}
                      className="text-blue-600 hover:underline"
                    >
                      Login
                    </button>
                  </span>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

RegisterOrLogin.propTypes = {
  setErrorMessage: PropTypes.func.isRequired,
};

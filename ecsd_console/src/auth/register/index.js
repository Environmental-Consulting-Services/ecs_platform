 

// react-router-dom components
import { useContext, useState } from "react";
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import { useNavigate } from "react-router-dom";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

import { AuthContext } from "context";
import AuthService from "services/auth-service";
import { InputLabel } from "@mui/material";

function Register() {
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();



  const [inputs, setInputs] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPass: "",
    agree: false,
  });

  const [errors, setErrors] = useState({
    first_nameError: false,
    last_nameError: false,
    emailError: false,
    passwordError: false,
    confirmPassError: false,
    agreeError: false,
    emailTaken: false,
  });

  const changeHandler = (e) => {
    setInputs({
      ...inputs,
      [e.target.name]: e.target.value,
    });
  };
  const submitHandler = async (e) => {
    e.preventDefault();
    const mailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (inputs.first_name.trim().length === 0) {
      setErrors({ ...errors, first_nameError: true });
      return;
    }

    if (inputs.email.trim().length === 0 || !inputs.email.trim().match(mailFormat)) {
      setErrors({ ...errors, emailError: true });
      return;
    }

    if (inputs.password.trim().length < 8) {
      setErrors({ ...errors, passwordError: true });
      return;
    }

    if (inputs.confirmPass.trim() !== inputs.password.trim()) {
      setErrors({ ...errors, confirmPassError: true });
      return;
    }

    if (inputs.agree === false) {
      setErrors({ ...errors, agreeError: true });
      return;
    }
    // here will be the post action to add a user to the db
    const newUser = { first_name: inputs.first_name, last_name: inputs.last_name, email: inputs.email, password: inputs.password };
    const myData = {
      data: {
        type: "users",
        attributes: { ...newUser, password_confirmation: newUser.password },
      },
    };

    try {
      const response = await AuthService.register(myData);
      navigate("/auth/login");
      //authContext.login(response.access_token);
    } catch (err) {
      setErrors({ ...errors, emailTaken: true });
      console.error(err);
      return null;
    }

    setInputs({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmPass: "",
      agree: false,
    });

    setErrors({
      first_nameError: false,
      last_nameError: false,
      emailError: false,
      passwordError: false,
      confirmPassError: false,
      agreeError: false,
      emailTaken: false,
    });
  };

  return (
    <CoverLayout >
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Join us today
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Enter your email and password to register
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" method="submit" onSubmit={submitHandler}>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="First Name"
                variant="standard"
                fullWidth
                name="first_name"
                value={inputs.first_name}
                onChange={changeHandler}
                error={errors.first_nameError}
                inputProps={{
                  autoComplete: "first_name",
                  form: {
                    autoComplete: "off",
                  },
                }}
              />
              {errors.first_nameError && (
                <MDTypography variant="caption" color="error" fontWeight="light">
                  The first name can not be empty
                </MDTypography>
              )}
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="text"
                label="Last Name"
                variant="standard"
                fullWidth
                name="last_name"
                value={inputs.last_name}
                onChange={changeHandler}
                error={errors.last_nameError}
                inputProps={{
                  autoComplete: "last_name",
                  form: {
                    autoComplete: "off",
                  },
                }}
              />
              {errors.last_nameError && (
                <MDTypography variant="caption" color="error" fontWeight="light">
                  The name can not be empty
                </MDTypography>
              )}
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="Email"
                variant="standard"
                fullWidth
                name="email"
                value={inputs.email}
                onChange={changeHandler}
                error={errors.emailError}
                inputProps={{
                  autoComplete: "email",
                  form: {
                    autoComplete: "off",
                  },
                }}
              />
              {errors.emailError && (
                <MDTypography variant="caption" color="error" fontWeight="light">
                  The email must be valid
                </MDTypography>
              )}
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Password"
                variant="standard"
                fullWidth
                name="password"
                value={inputs.password}
                onChange={changeHandler}
                error={errors.passwordError}
              />
              {errors.passwordError && (
                <MDTypography variant="caption" color="error" fontWeight="light">
                  The password must be of at least 8 characters
                </MDTypography>
              )}
            </MDBox>
            <MDBox mb={2}>
              <MDInput
                type="password"
                label="Confirm Password"
                variant="standard"
                fullWidth
                name="confirmPass"
                value={inputs.confirmPass}
                onChange={changeHandler}
                error={errors.confirmPassError}
              />
              {errors.confirmPassError && (
                <MDTypography variant="caption" color="error" fontWeight="light">
                  The passwords must match
                </MDTypography>
              )}
            </MDBox>
            {errors.roleError && (
              <MDTypography variant="caption" color="error" fontWeight="light">
                You must choose a role
              </MDTypography>
            )}
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Checkbox name="agree" id="agree" onChange={changeHandler} />
              <InputLabel
                variant="standard"
                fontWeight="regular"
                color="text"
                sx={{ lineHeight: "1.5", cursor: "pointer" }}
                htmlFor="agree"
              >
                &nbsp;&nbsp;I agree to the&nbsp;
              </InputLabel>
              <MDTypography
                component="a"
                href="#"
                variant="button"
                fontWeight="bold"
                color="info"
                textGradient
              >
                Terms and Conditions
              </MDTypography>
            </MDBox>
            {errors.agreeError && (
              <MDTypography variant="caption" color="error" fontWeight="light">
                You must agree to the Terms and Conditions
              </MDTypography>
            )}
            {errors.emailTaken && (
              <MDTypography variant="caption" color="error" fontWeight="light">
                It appears you already have an account.
              </MDTypography>
            )}
            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="info" fullWidth type="submit">
                Register
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Already have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/auth/login"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Sign In
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default Register;

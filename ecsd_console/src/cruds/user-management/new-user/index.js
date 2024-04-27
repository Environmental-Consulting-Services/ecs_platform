 

import { useEffect, useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { InputLabel, Autocomplete } from "@mui/material";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDAvatar from "components/MDAvatar";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import FormField from "layouts/applications/wizard/components/FormField";
import { useNavigate } from "react-router-dom";

import CrudService from "services/cruds-service";

const NewUser = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [image, setImage] = useState("");
  const [fileState, setFileState] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    type: "user",
    email: "",
    password: "",
    confirm: "",
    role: "",
  });

  const [value, setValue] = useState("");

  const [error, setError] = useState({
    first_name: false,
    last_name: false,
    phone: false,
    address: false,
    email: false,
    password: false,
    confirm: false,
    role: false,
    error: false,
    textError: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const response = await CrudService.getRoles();
        setRoles(response.data);
      } catch (err) {
        console.error(err);
        return null;
      }
    })();
  }, []);

  const changeHandler = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const changeImageHandler = (e) => {
    const formData = new FormData();
    formData.append("attachment", e.target.files[0]);
    setFileState(formData);
    setImageUrl(URL.createObjectURL(e.target.files[0]));
    setImage(e.target.files[0]);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    const mailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (user.first_name.trim().length === 0) {
      setError({
        email: false,
        role: false,
        confirm: false,
        password: false,
        first_name: true,
        last_name: false,
        textError: "The first name cannot be empty",
      });
      return;
    }

    if (user.last_name.trim().length === 0 ) {
      setError({
        role: false,
        confirm: false,
        password: false,
        first_name: false,
        last_name: true,
        email: false,
        textError: "The last name is not valid",
      });
      return;
    }

    if (user.email.trim().length === 0 || !user.email.trim().match(mailFormat)) {
      setError({
        role: false,
        confirm: false,
        password: false,
        first_name: false,
        last_name: false,
        email: true,
        textError: "The email is not valid",
      });
      return;
    }

    if (user.password.trim().length < 8) {
      setError({
        first_name: false,
        last_name: false,
        email: false,
        role: false,
        confirm: false,
        password: true,
        textError: "The password should have at least 8 characters",
      });
      return;
    }

    if (user.confirm.trim() !== user.password.trim()) {
      setError({
        first_name: false,
        last_name: false,
        email: false,
        role: false,
        password: false,
        confirm: true,
        textError: "The password and password confirmation do not match",
      });
      return;
    }

    if (value.id === "" || value.id === null || value.id === undefined) {
      setError({
        first_name: false,
        last_name: false,
        email: false,
        role: false,
        password: false,
        confirm: false,
        role: true,
        textError: "Role is required",
      });
      return;
    }

    const newUser = {
      data: {
        type: "users",
        attributes: {
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          address: user.address,
          type: user.type,
          email: user.email,
          password: user.password,
          password_confirmation: user.confirm,
          profile_image: null,
        },
        relationships: {
          roles: {
            data: [
              {
                id: value.id.toString(),
                type: "roles",
              },
            ],
          },
        },
      },
    };

    let res = null;
    try {
      res = await CrudService.createUser(newUser);
    } catch (err) {
      setError({ ...error, error: true, textError: err.message });
      return null;
    }
    if (res && image) {
      try {
        const { url } = await CrudService.imageUpload(fileState, res.data.id);
        const userData = {
          data: {
            type: "profile",
            attributes: {
              profile_image: `${window._env_.REACT_APP_IMAGES}${url}`,
            },
          },
        };
        const toUpdateUser = {
          data: {
            id: res.data.id.toString(),
            type: "users",
            attributes: {
              profile_image: fileState ? `${window._env_.REACT_APP_IMAGES}${url}` : null,
            },
          },
        };
        await CrudService.updateUser(toUpdateUser, res.data.id);
      } catch (err) {
        if (err.hasOwnProperty("errors")) {
          setError({ ...error, error: true, textError: err.errors[0].detail });
        }
        return err;
      }
    }
      navigate("/user-management", {
        state: { value: true, text: "The user was sucesfully created" },
      });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={5} mb={9}>
        <Grid container justifyContent="center">
          <Grid item xs={12} lg={8}>
            <MDBox mt={6} mb={8} textAlign="center">
              <MDBox mb={1}>
                <MDTypography variant="h3" fontWeight="bold">
                  Add New User
                </MDTypography>
              </MDBox>
              <MDTypography variant="h5" fontWeight="regular" color="secondary">
                This information will describe more about the user.
              </MDTypography>
            </MDBox>
            <Card>
              <MDBox
                component="form"
                method="POST"
                onSubmit={submitHandler}
                encType="multipart/form-data"
              >
                <MDBox display="flex" flexDirection="column" px={3} my={4}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        label="First Name"
                        placeholder="first name"
                        name="first_name"
                        value={user.first_name}
                        onChange={changeHandler}
                        error={error.first_name}
                        inputProps={{
                          autoComplete: "first_name",
                          form: {
                            autoComplete: "off",
                          },
                        }}
                      />
                      {error.first_name && (
                        <MDTypography variant="caption" color="error" fontWeight="light">
                          {error.textError}
                        </MDTypography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        label="Last Name"
                        placeholder="last name"
                        name="last_name"
                        value={user.last_name}
                        onChange={changeHandler}
                        error={error.last_name}
                        inputProps={{
                          autoComplete: "last_name",
                          form: {
                            autoComplete: "off",
                          },
                        }}
                      />
                      {error.last_name && (
                        <MDTypography variant="caption" color="error" fontWeight="light">
                          {error.textError}
                        </MDTypography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        label="Email"
                        placeholder="example@email.com"
                        inputProps={{
                          type: "email",
                          autoComplete: "email",
                          form: {
                            autoComplete: "off",
                          },
                        }}
                        name="email"
                        value={user.email}
                        onChange={changeHandler}
                        error={error.email}
                      />
                      {error.email && (
                        <MDTypography variant="caption" color="error" fontWeight="light">
                          {error.textError}
                        </MDTypography>
                      )}
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                      <FormField
                        label="Phone"
                        placeholder=""
                        name="phone"
                        value={user.phone}
                        onChange={changeHandler}
                        error={error.phone}
                        inputProps={{
                          autoComplete: "phone",
                          form: {
                            autoComplete: "off",
                          },
                        }}
                      />
                      {error.phone && (
                        <MDTypography variant="caption" color="error" fontWeight="light">
                          {error.textError}
                        </MDTypography>
                      )}
                    </Grid>

                  <Grid item xs={12} sm={6}>
                      <FormField
                        label="Address"
                        placeholder=""
                        name="address"
                        value={user.address}
                        onChange={changeHandler}
                        error={error.address}
                        inputProps={{
                          autoComplete: "address",
                          form: {
                            autoComplete: "off",
                          },
                        }}
                      />
                      {error.address && (
                        <MDTypography variant="caption" color="error" fontWeight="light">
                          {error.textError}
                        </MDTypography>
                      )}
                    </Grid>
                  <Grid container spacing={3} mt={4}>
                    <Grid item xs={12} sm={6}>
                      <MDInput
                        fullWidth
                        label="Current Password"
                        inputProps={{ type: "password", autoComplete: "" }}
                        name="password"
                        value={user.password}
                        onChange={changeHandler}
                        error={error.password}
                      />
                      {error.password && (
                        <MDTypography variant="caption" color="error" fontWeight="light">
                          {error.textError}
                        </MDTypography>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <MDInput
                        fullWidth
                        label="Confirm Password"
                        inputProps={{ type: "password", autoComplete: "" }}
                        name="confirm"
                        value={user.confirm}
                        onChange={changeHandler}
                        error={error.confirm}
                      />
                      {error.confirm && (
                        <MDTypography variant="caption" color="error" fontWeight="light">
                          {error.textError}
                        </MDTypography>
                      )}
                    </Grid>
                  </Grid>
                  <MDBox display="flex" flexDirection="column" fullWidth>
                    <MDBox
                      display="flex"
                      flexDirection="column"
                      fullWidth
                      marginBottom="1rem"
                      marginTop="2rem"
                    >
                      <Autocomplete
                        defaultValue=""
                        options={roles}
                        getOptionLabel={(option) => (option ? option.attributes.name : "")}
                        value={value ?? ""}
                        onChange={(event, newValue) => {
                          setValue(newValue);
                        }}
                        renderInput={(params) => (
                          <FormField {...params} label="Role" InputLabelProps={{ shrink: true }} />
                        )}
                      />
                      {error.role && (
                        <MDTypography
                          variant="caption"
                          color="error"
                          fontWeight="light"
                          paddingTop="1rem"
                        >
                          {error.textError}
                        </MDTypography>
                      )}
                    </MDBox>
                    <MDBox
                      display="flex"
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="space-between"
                      fullWidth
                    >
                      <MDBox mt={2} display="flex" flexDirection="column">
                        <InputLabel id="demo-simple-select-label">Profile Image</InputLabel>
                        <MDInput
                          fullWidth
                          type="file"
                          name="attachment"
                          onChange={changeImageHandler}
                          id="file-input"
                          accept="image/*"
                          sx={{ mt: "16px" }}
                        ></MDInput>
                      </MDBox>

                      {imageUrl && (
                        <MDBox ml={4} mt={2}>
                          <MDAvatar src={imageUrl} alt="profile-image" size="xxl" shadow="sm" />
                        </MDBox>
                      )}
                    </MDBox>
                  </MDBox>
                  {error.error && (
                    <MDTypography variant="caption" color="error" fontWeight="light" pt={2}>
                      {error.textError}
                    </MDTypography>
                  )}
                  <MDBox ml="auto" mt={4} mb={2} display="flex" justifyContent="flex-end">
                    <MDBox mx={2}>
                      <MDButton
                        variant="gradient"
                        color="dark"
                        size="small"
                        px={2}
                        mx={2}
                        onClick={() =>
                          navigate("/user-management", {
                            state: { value: false, text: "" },
                          })
                        }
                      >
                        Back
                      </MDButton>
                    </MDBox>
                    <MDButton variant="gradient" color="dark" size="small" type="submit">
                      Save
                    </MDButton>
                  </MDBox>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default NewUser;

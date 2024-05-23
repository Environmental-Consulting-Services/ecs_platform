

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
import { useNavigate, useParams } from "react-router-dom";

import CrudService from "services/cruds-service";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [image, setImage] = useState("");
  const [fileState, setFileState] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [user, setUser] = useState({
    id: "",
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    email: "",
    role: "",
  });
  const [value, setValue] = useState({});

  const [error, setError] = useState({
    first_name: false,
    last_name: false,
    phone: false,
    address: false,
    email: false,
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

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const response = await CrudService.getUser(id);
        const getData = response.data;
        const roleData = await CrudService.getRole(getData.relationships.roles.data[0].id);
        const role = roleData.data
        setUser({
          id: getData.id,
          first_name: getData.attributes.first_name,
          last_name: getData.attributes.last_name,
          phone: getData.attributes.phone,
          address: getData.attributes.address,
          email: getData.attributes.email,
          role: getData.relationships.roles.data[0].id,
        });
        setImage(getData.attributes.profile_image);
        setValue(role);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (roles && roles.length > 0) {
      const role = roles.find((role) => role.id === user.role);
      setValue(role);
    }
  }, [roles]);

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

    if (!user || !user.first_name || user.first_name.trim().length === 0) {
      setError({
        email: false,
        role: false,
        first_name: true,
        last_name: false,
        phone: false,
        address: false,
        textError: "The first name cannot be empty",
      });
      return;
    }

    if (!user || !user.last_name || user.last_name.trim().length === 0) {
      setError({
        email: false,
        role: false,
        first_name: false,
        last_name: true,
        phone: false,
        address: false,
        textError: "The last name cannot be empty",
      });
      return;
    }

    if (!user || !user.email || user.email.trim().length === 0 || !user.email.trim().match(mailFormat)) {
      setError({
        role: false,
        first_name: false,
        last_name: false,
        phone: false,
        address: false,
        email: true,
        textError: "The email is not valid",
      });
      return;
    }

    if (value.id && value.id === "") {
      setError({
        first_name: false,
        last_name: false,
        phone: false,
        address: false,
        email: false,
        role: false,
        password: false,
        confirm: false,
        role: true,
        textError: "Role is required",
      });
      return;
    }

    try {
      let { url } = fileState
        ? await CrudService.imageUpload(fileState, user.id.toString())
        : image;
      const newUser = {
        data: {
          id: user.id.toString(),
          type: "users",
          attributes: {
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            address: user.address,
            type: user.type,
            email: user.email,
            profile_image: fileState ? `${window._env_.REACT_APP_IMAGES}${url}` : image,
          },
          relationships: {
            roles: {
              data: [
                {
                  id: value.id ? value.id.toString() : user.role.toString(),
                  type: "roles",
                },
              ],
            },
          },
        },
      };

      try {
        const res = await CrudService.updateUser(newUser, newUser.data.id);
        navigate("/user-management", {
          state: { value: true, text: "The user was sucesfully updated" },
        });
      } catch (err) {
        if (err.hasOwnProperty("errors")) {
          setError({ ...error, error: true, textError: err.errors[0].detail });
        }
        console.error(err);
      }
    } catch (err) {
      setError({ ...error, error: true, textError: err.message });
      return null;
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar breadcrumbTitle={user.first_name +" "+ user.last_name} />
      <MDBox mt={5} mb={2}>
        <Grid container justifyContent="center">
          <Grid item xs={12} lg={8}>
            <MDBox mt={6} mb={2} textAlign="center">
              <MDBox mb={1}>
                <MDTypography variant="h3" fontWeight="bold">
                  Edit User
                </MDTypography>
              </MDBox>
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
                        inputProps={{ type: "email" }}
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
                    <Grid item xs={12} sm={6}>
                      <FormField
                        label="Phone"
                        placeholder="555-555-1212"
                        name="phone"
                        value={user.phone}
                        onChange={changeHandler}
                        error={error.phone}
                        /* inputProps={{
                          autoComplete: "phone",
                          form: {
                            autoComplete: "off",
                          },
                        }} */
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
                        /* inputProps={{
                          autoComplete: "address",
                          form: {
                            autoComplete: "off",
                          },
                        }} */
                      />
                      {error.address && (
                        <MDTypography variant="caption" color="error" fontWeight="light">
                          {error.textError}
                        </MDTypography>
                      )}
                    </Grid>
                  </Grid>

                  
                  <MDBox display="flex" flexDirection="column" fullWidth>
                    <MDBox display="flex" flexDirection="column" fullWidth marginTop="2rem">
                      <Autocomplete
                        defaultValue={null}
                        options={roles}
                        getOptionLabel={(option) => {
                          if (option.data) {
                            if (option.data.attributes) {
                              if (option.data.attributes.name) return option.data.attributes.name;
                            }
                          } else {
                            if (option.attributes) {
                              if (option.attributes.name) return option.attributes.name;
                            }
                          }
                          return "";
                        }
                        }
                        value={value ?? null}
                        onChange={(event, newValue) => {
                          setValue(newValue);
                        }}
                        renderInput={(params) => (
                          <FormField {...params} label="Role" InputLabelProps={{ shrink: true }} />
                        )}
                      />
                      {error.role && (
                        <MDTypography variant="caption" color="error" fontWeight="light" pl={4}>
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

                      {image && (
                        <MDBox ml={4} mt={2}>
                          <MDAvatar
                            src={imageUrl ?? image}
                            alt="profile-image"
                            size="xxl"
                            shadow="sm"
                          />
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

export default EditUser;

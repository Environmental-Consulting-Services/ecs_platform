 

import { useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";

// Settings page components
import Header from "cruds/user-profile/components/Header";
import BasicInfo from "cruds/user-profile/components/BasicInfo";
import ChangePassword from "cruds/user-profile/components/ChangePassword";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import AuthService from "services/auth-service";
import getId from "services/helper-service";
import Footer from "examples/Footer";

function UserProfile() {
  const [isDemo, setIsDemo] = useState(false);
  const [user, setUser] = useState({
    id: "",
    type: "user",
    first_name: "",
    last_name : "",
    phone: "",
    addres:  "",
    email: "",
    password: "",
    newPassword: "",
    currentPassword: "",
    confirmPassword: "",
    profile_image: "",
  });

  useEffect(() => {
    (async () => {
      const response = await AuthService.getProfile();
      if (getId(response.data.id) == 1 || getId(response.data.id) == 2 || getId(response.data.id) == 3) {
        setIsDemo(window._env_.REACT_APP_IS_DEMO === "true");
      }
      setUser((prevUser) => ({
        ...prevUser,
        id: response.data.id,
        first_name: response.data.attributes.first_name,
        last_name: response.data.attributes.last_name,
        phone: response.data.attributes.phone,
        address: response.data.attributes.address,
        type: response.data.attributes.type,
        email: response.data.attributes.email,
        profile_image: response.data.attributes.profile_image,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    })();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mt={4}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} lg={9}>
            <MDBox mb={3}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                <Header user={user} isDemo={isDemo} />
                </Grid>
                <Grid item xs={12}>
                  <BasicInfo user={user} isDemo={isDemo} />
                </Grid>
                <Grid item xs={12}>
                  <ChangePassword user={user} isDemo={isDemo} />
                </Grid>
              </Grid>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default UserProfile;

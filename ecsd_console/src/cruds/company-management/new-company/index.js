 import { useContext, useState, useEffect } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDEditor from "components/MDEditor";
import Switch from "@mui/material/Switch";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import FormField from "layouts/applications/wizard/components/FormField";
import { useNavigate } from "react-router-dom";

import CrudService from "services/cruds-service";
import { AuthContext } from "context";

const NewCompany = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [ownerID, setOwnerId] = useState("");
  const [companyActive, setCompanyActive] = useState(false);
  const [owner, setOwner] = useState("");
  const [company, setCompany] = useState({
    name: "",
    companyActive: "",
    status: "",
    street_one: "",
    street_two: "",
    city: "",
    state: "",
    zip_code: "",
  });

 
  const [value, setValue] = useState("");

  const [error, setError] = useState({
    name: false,
    companyActive:false,
    status: false,
    street_one: false,
    street_two: false,
    city: false,
    state: false,
    zip_code: false,
    error: false,
    textError: "",
  });

  const changeHandler = (e) => {
    setCompany({
      ...company,
      [e.target.name]: e.target.value,
    });
  };

  const changeCompanyActiveHandler = (e) => {
    setCompanyActive(e.target.checked);
  };

  const {getLocalUser, getCurrentUser} = useContext(AuthContext);


  useEffect(() => {
    (async () => {
      try {
        //let userId = await getCurrentUser();
        let localUser = await getLocalUser();
        let resp = await CrudService.getUser(localUser.id);
        console.log(localUser.id);
        setOwnerId(localUser.id);
        console.log(resp.data.attributes.first_name + " " + resp.data.attributes.last_name);

        setOwner(resp.data.attributes.first_name + " " + resp.data.attributes.last_name);
      } catch (err) {
        console.error(err);
        return null;
      }
    })();
  }, []);


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

  const submitHandler = async (e) => {
    e.preventDefault();

    if (company.name.trim().length < 1) {
      setError({ name:true,  textError: "The company name is required" });
      return;
    }

    const companyToSave = {
      data: {
              type: "companies",
              attributes: {
                  name: company.name,
                  status: (companyActive) ? "active" : "inactive",
                  address: {
                      street_one: company.street_one,
                      street_two: company.street_two,
                      city: company.city,
                      state: company.state,
                      zip_code: company.zip_code,
                  },
                  owner: {_id: ownerID},
                  primary_contact: {_id:""}
              }
          }
  };
    console.log(companyToSave.owner);
    try {
      await CrudService.createCompany(companyToSave);
      navigate("/company-management", {
        state: { value: true, text: "The company was sucesfully created" },
      });
    } catch (err) {
      if (err.hasOwnProperty("errors")) {
        setError({ ...error, error: true, textError: err.message });
      }
    }
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
                  Add New Company
                </MDTypography>
              </MDBox>
              <MDTypography variant="h5" fontWeight="regular" color="secondary">
                This information describes more about the company.
              </MDTypography>
            </MDBox>
            <Card>
              <MDBox component="form" method="POST" onSubmit={submitHandler}>
                <MDBox display="flex" flexDirection="column" px={3} my={2}>
                  <MDBox p={1}>
                    <FormField
                      type="text"
                      label="Name"
                      name="name"
                      value={company.name}
                      onChange={changeHandler}
                      error={error.name}
                    />
                    {name.error && (
                      <MDTypography variant="caption" color="error" fontWeight="light">
                        {error.textError}
                      </MDTypography>
                    )}
                  </MDBox>                  
                  <MDBox p={1}>
                    <FormField
                      type="text"
                      label="Street Address"
                      name="street_one"
                      value={company.street_one}
                      onChange={changeHandler}
                      error={error.street_one}
                    />
                    {error.street_one && (
                      <MDTypography variant="caption" color="error" fontWeight="light">
                         {error.textError}
                      </MDTypography>
                    )}
                  </MDBox>
                  <MDBox p={1}>
                    <FormField
                      type="text"
                      label="Street Address 2"
                      name="street_two"
                      value={company.street_two}
                      onChange={changeHandler}
                      error={error.street_two}
                    />
                    {error.street_two && (
                      <MDTypography variant="caption" color="error" fontWeight="light">
                       {error.textError}
                      </MDTypography>
                    )}
                  </MDBox>
                  <MDBox p={1}>
                    <FormField
                      type="text"
                      label="City"
                      name="city"
                      value={company.city}
                      onChange={changeHandler}
                      error={error.city}
                    />
                    {error.city && (
                      <MDTypography variant="caption" color="error" fontWeight="light">
                        {error.textError}
                      </MDTypography>
                    )}
                  </MDBox>
                  <MDBox p={1}>
                    <FormField
                      type="text"
                      label="State"
                      name="state"
                      value={company.state}
                      onChange={changeHandler}
                      error={error.state}
                    />
                    {error.state && (
                      <MDTypography variant="caption" color="error" fontWeight="light">
                        {error.textError}
                      </MDTypography>
                    )}
                  </MDBox>
                  <MDBox p={1}>
                    <FormField
                      type="text"
                      label="Zip Code"
                      name="zip_code"
                      value={company.zip_code}
                      onChange={changeHandler}
                      error={error.zip_code}
                    />
                    {error.zip_code && (
                      <MDTypography variant="caption" color="error" fontWeight="light">
                        {error.textError}
                      </MDTypography>
                    )}
                  </MDBox>
                  <MDBox p={1}>
                    <FormField
                      type="text"
                      label="Owner"
                      name="owner"
                      value={owner}
                      editable={false.toString()}
                    />
                  </MDBox>
                  <MDBox display="flex" alignItems="center" mb={0.5} ml={-1.5}>
                    <MDBox mt={0.5}>
                    <Switch name="companyActive" checked={companyActive} onChange={changeCompanyActiveHandler} />
                    </MDBox>
                    <MDBox width="80%" ml={0.5}>
                      <MDTypography variant="button" fontWeight="regular" color="text">
                        Active Company?
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                  <MDBox ml="auto" mt={4} mb={2} display="flex" justifyContent="flex-end">
                    <MDBox mx={2}>
                      <MDButton
                        variant="gradient"
                        color="dark"
                        size="small"
                        px={2}
                        mx={2}
                        onClick={() =>
                          navigate("/company-management", {
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

export default NewCompany;

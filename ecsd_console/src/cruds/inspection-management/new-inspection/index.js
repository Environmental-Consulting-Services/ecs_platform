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
import Autocomplete from "@mui/material/Autocomplete";

import CrudService from "services/cruds-service";
import { AuthContext } from "context";

const NewInspection = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [ownerID, setOwnerId] = useState("");
  const [inspectionActive, setInspectionActive] = useState(false);
  const [owner, setOwner] = useState("");
  const [inspection, setInspection] = useState({
    name: "",
    inspectionActive: "",
    template: "",
    status: "unsheduled",
    street_one: "",
    street_two: "",
    city: "",
    state: "",
    zip_code: "",
  });

 
  const [template, setTemplate] = useState("");

  const [error, setError] = useState({
    name: false,
    template: false,
    inspectionActive:false,
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
    setInspection({
      ...inspection,
      [e.target.name]: e.target.value,
    });
  };

  const changeInspectionActiveHandler = (e) => {
    setInspectionActive(e.target.checked);
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
        const response = await CrudService.getInspectionTemplates();
        setTemplates(response.data);
      } catch (err) {
        console.error(err);
        return null;
      }
    })();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (inspection.name.trim().length < 1) {
      setError({ name:true,  textError: "The inspection name is required" });
      return;
    }

    const inspectionToSave = {
      data: {
              type: "inspections",
              attributes: {
                  name: inspection.name,
                  template: template.id,
                  status: (inspectionActive) ? "scheduled" : "unscheduled",
                  
              }
          }
  };
    //console.log(inspectionToSave.owner);
    try {
      await CrudService.createInspection(inspectionToSave);
      navigate("/inspection-management", {
        state: { value: true, text: "The inspection was sucesfully created" },
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
                  Add New Inspection
                </MDTypography>
              </MDBox>
              <MDTypography variant="h5" fontWeight="regular" color="secondary">
                This information describes more about the inspection.
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
                      value={inspection.name}
                      onChange={changeHandler}
                      error={error.name}
                    />
                    {name.error && (
                      <MDTypography variant="caption" color="error" fontWeight="light">
                        {error.textError}
                      </MDTypography>
                    )}
                  </MDBox>       

                  <MDBox
                      display="flex"
                      flexDirection="column"
                      fullWidth
                      marginBottom="1rem"
                      marginTop="2rem"
                    >
                      <Autocomplete
                        defaultValue=""
                        options={templates}
                        getOptionLabel={(option) => (option ? option.attributes.name : "")}
                        value={template ?? ""}
                        onChange={(event, newValue) => {
                          setTemplate(newValue);
                        }}
                        renderInput={(params) => (
                          <FormField {...params} label="Template" InputLabelProps={{ shrink: true }} />
                        )}
                      />
                      {error.template && (
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

                  
                 {/*  <MDBox display="flex" alignItems="center" mb={0.5} ml={-1.5}>
                    <MDBox mt={0.5}>
                    <Switch name="inspectionActive" checked={inspectionActive} onChange={changeInspectionActiveHandler} />
                    </MDBox>
                    <MDBox width="80%" ml={0.5}>
                      <MDTypography variant="button" fontWeight="regular" color="text">
                        Active Inspection?
                      </MDTypography>
                    </MDBox>
                  </MDBox> */}
                  


                  <MDBox ml="auto" mt={4} mb={2} display="flex" justifyContent="flex-end">
                    <MDBox mx={2}>
                      <MDButton
                        variant="gradient"
                        color="dark"
                        size="small"
                        px={2}
                        mx={2}
                        onClick={() =>
                          navigate("/inspection-management", {
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

export default NewInspection;

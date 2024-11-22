 

import { useEffect, useState } from "react";

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
import { useNavigate, useParams } from "react-router-dom";

import CrudService from "services/cruds-service";

const EditInspection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [ownerID, setOwnerId] = useState("");
  const [owner, setOwner] = useState("");
  const [inspectionActive, setInspectionActive] = useState(false);
  const [inspection, setInspection] = useState({
    name: "",
    status: "",
    
  });

 
  const [value, setValue] = useState("");

  const [error, setError] = useState({
    name: false,
    status: false,
   
    error: false,
    textError: "",
  });

  // Get User Roles
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
        const res = await CrudService.getInspection(id);
        setInspectionActive(res.data.attributes.status === "active" ? true : false)
        setInspection({
          id: res.data.id,
          name: res.data.attributes.name,
          status: res.data.attributes.status,
          
        });
      } catch (err) {
        console.error(err);
      }
    })();
  }, [id]);


  const changeHandler = (e) => {
    setInspection({
      ...inspection,
      [e.target.name]: e.target.value,
    });
  };


  const changeInspectionActiveHandler = (e) => {
    setInspectionActive(e.target.checked);
  };

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
                  id: id,
                  name: inspection.name,
                  status: (inspectionActive) ? "active" : "inactive",
                 
              }
          }
  };

    try {
      await CrudService.updateInspection(inspectionToSave, id);
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
      <DashboardNavbar breadcrumbTitle={inspection.name}/>
      <MDBox mt={5} mb={9}>
        <Grid container justifyContent="center">
          <Grid item xs={12} lg={8}>
            <MDBox mt={6} mb={8} textAlign="center">
              <MDBox mb={1}>
                <MDTypography variant="h3" fontWeight="bold">
                  Edit Inspection
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
                  
                  <MDBox display="flex" alignItems="center" mb={0.5} ml={-1.5}>
                    <MDBox mt={0.5}>
                    <Switch name="inspectionActive" checked={inspectionActive} onChange={changeInspectionActiveHandler} />
                    </MDBox>
                    <MDBox width="80%" ml={0.5}>
                      <MDTypography variant="button" fontWeight="regular" color="text">
                        Active Inspection?
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

export default EditInspection;

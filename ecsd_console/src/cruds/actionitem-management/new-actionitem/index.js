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
import MDDatePicker from "components/MDDatePicker";
import { InputLabel } from "@mui/material";
import { TextField } from "@mui/material";
import { Autocomplete } from "@mui/material";
import { Select } from "@mui/material";
import { MenuItem } from "@mui/material";
import { FormControl } from "@mui/material";



const NewActionItem = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [ownerID, setOwnerId] = useState("");
  const [actionitemActive, setActionItemActive] = useState(false);
  const [owner, setOwner] = useState("");
  const [assignees, setAssignees] = useState([]);

  const [actionitem, setActionItem] = useState({
    name: "",
    number: "",
    notes: "",
    description: "",
    status: "",
    source: "",
    control: "",
    location: "",
    date_initiated: "",
    date_resolved: "",
    due_date: "",
    assigned_to: "",
    created_at: "",
    updated_at: "",
    inspection: "",
    project: "",
    actionitemActive: ""

  });


  const [value, setValue] = useState("");

  const [error, setError] = useState({
    name: false,
    number: false,
    notes: false,
    description: false,
    status: false,
    source: false,
    control: false,
    location: false,
    date_initiated: false,
    date_resolved: false,
    due_date: false,
    assigned_to: false,
    created_at: false,
    updated_at: false,
    inspection: false,
    project: false,
    actionitemActive: false,
    error: false,
    textError: ""
  });

  const changeHandler = (e) => {
    setActionItem({
      ...actionitem,
      [e.target.name]: e.target.value,
    });
  };

  const changeHandlerDate = (e, i, o) => {
    setActionItem({
      ...actionitem,
      [o.input.name]: i,
    });
  };


  const changeActionItemActiveHandler = (e) => {
    setActionItemActive(e.target.checked);
  };

  const { getLocalUser, getCurrentUser } = useContext(AuthContext);

  useEffect(() => {
    (async () => {
      const projectId = "1";
      const response = await CrudService.getProjectAssignees(projectId);
      
      var projectAssigneeSelections = [[{ label: "Select Assignee", value: "" }]];
      response.data.map((assignee) => {
        projectAssigneeSelections.push({ label: assignee.attributes.name, value: assignee.id });        
      } );
      setAssignees(projectAssigneeSelections); 
    })();
  }, []);

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

    if (actionitem.name.trim().length < 1) {
      setError({ name: true, textError: "The actionitem name is required" });
      return;
    }

    const actionitemToSave = {
      data: {
        type: "actionitems",
        attributes: {
          ...actionitem,
        }
      }
    };

    try {
      await CrudService.createActionItem(actionitemToSave);
     
      navigate("/actionitem-management", {
        state: { value: true, text: "The actionitem was sucesfully created" },
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
                  Add New ActionItem
                </MDTypography>
              </MDBox>
              <MDTypography variant="h5" fontWeight="regular" color="secondary">
                This information describes more about the actionitem.
              </MDTypography>
            </MDBox>

            <Card>
              <MDBox component="form" method="POST" onSubmit={submitHandler}>
                <MDBox display="flex" flexDirection="column" px={3} my={2}>
                  {/* Name */}
                  <MDBox p={1}>
                    <FormField
                      type="text"
                      label="Name"
                      name="name"
                      value={actionitem.name}
                      onChange={changeHandler}
                      error={error.name}
                    />
                    {name.error && (
                      <MDTypography variant="caption" color="error" fontWeight="light">
                        {error.textError}
                      </MDTypography>
                    )}
                  </MDBox>

                  {/* active? */}
                  <MDBox display="flex" alignItems="center" mb={0.5} ml={-1.5}>
                    <MDBox mt={0.5}>
                      <Switch name="actionitemActive" checked={actionitemActive} onChange={changeActionItemActiveHandler} />
                    </MDBox>
                    <MDBox width="80%" ml={0.5}>
                      <MDTypography variant="button" fontWeight="regular" color="text">
                        Active ActionItem?
                      </MDTypography>
                    </MDBox>
                  </MDBox>


                    {/* Description */}
                  <Grid item xs={12} sm={6}>
                    <FormField
                      label="Description"
                      placeholder="description"
                      name="description"
                      value={actionitem.description}
                      onChange={changeHandler}
                      error={error.description}
                    />
                    {error.last_name && (
                      <MDTypography variant="caption" color="error" fontWeight="light">
                        {error.textError}
                      </MDTypography>
                    )}
                  </Grid>

                  {/* source */}
                  <Grid item xs={12} sm={6}>
                    <FormField
                      label="source"
                      placeholder="source"
                      name="source"
                      value={actionitem.source}
                      onChange={changeHandler}
                      error={error.source}
                    />
                    {error.source && (
                      <MDTypography variant="caption" color="error" fontWeight="light">
                        {error.textError}
                      </MDTypography>
                    )}
                  </Grid>
                  
                  {/* control */}
                  <Grid item xs={12} sm={6}>
                    <FormField
                      label="Control"
                      placeholder=""
                      name="control"
                      value={actionitem.control}
                      onChange={changeHandler}
                      error={error.control}
                    />
                    {error.control && (
                      <MDTypography variant="caption" color="error" fontWeight="light">
                        {error.textError}
                      </MDTypography>
                    )}
                  </Grid>

                  {/* location */}
                  <Grid item xs={12} sm={6}>
                    <FormField
                      label="location"
                      placeholder=""
                      name="location"
                      value={actionitem.location}
                      onChange={changeHandler}
                      error={error.location}
                    />
                    {error.location && (
                      <MDTypography variant="caption" color="error" fontWeight="light">
                        {error.textError}
                      </MDTypography>
                    )}
                  </Grid>

                  {/* date_initiated */}
                  <Grid item xs={12} sm={6}>
                    <InputLabel>
                       Date Initiated
                     </InputLabel>
                    <MDDatePicker
                      input={{name: "date_initiated"}}
                      label="date_initiated"
                      //placeholder="Date Initiated"
                      value={actionitem.date_initiated}
                      onChange={changeHandlerDate}
                      error={error.date_initiated}
                    />
                    {error.date_initiated && (
                      <MDTypography variant="caption" color="error" fontWeight="light">
                        {error.textError}
                      </MDTypography>
                    )}
                  </Grid>
                  
                  {/* date_resolved */}
                  <Grid item xs={12} sm={6}>
                 
                    <InputLabel>
                       Date Resolved
                    </InputLabel>
                    <MDDatePicker
                      input={{name: "date_resolved"}}
                      label="Date Resolved"
                      //placeholder=""
                      value={actionitem.date_resolved}
                      onChange={changeHandlerDate}
                      error={error.date_resolved}
                    />
                    {error.date_resolved && (
                      <MDTypography variant="caption" color="error" fontWeight="light">
                        {error.textError}
                      </MDTypography>
                    )}
                  </Grid>

                  {/* due_date */}
                  <Grid item xs={12} sm={6}>

                    <InputLabel>
                       Due Date
                    </InputLabel>
                    <MDDatePicker   
                      input={{ name: "due_date"}}
                      label="Due Date"
                      //placeholder=""
                      value={actionitem.due_date}
                      onChange={changeHandlerDate}
                      error={error.due_date}
                    />
                    {error.due_date && (
                      <MDTypography variant="caption" color="error" fontWeight="light">
                        {error.textError}
                      </MDTypography>
                    )}
                  </Grid>

                  {/* assigned_to */}
                  
                  <Grid item xs={12} sm={6}>
                   {/*  <FormField
                      label="Assigned To"
                      placeholder=""
                      name="assigned_to"
                      value={actionitem.assigned_to}
                      onChange={changeHandler}
                      error={error.assigned_to}
                    />
                   */}
                    <Autocomplete
                        key="assigned_to"
                        disablePortal
                        id="combo-box-assigned_to"
                        options={assignees}
                        sx={{ width: 300 }}
                        onChange={changeHandler}
                        renderInput={(params) => <TextField {...params} label="Assigned To" />}
                      /> 

      
                    
                    {error.assigned_to && (
                      <MDTypography variant="caption" color="error" fontWeight="light">
                        {error.textError}
                      </MDTypography>
                    )}

                  </Grid>
                  
                  <MDBox display="flex" flexDirection="column" fullWidth>
              
                    <MDBox
                      display="flex"
                      flexDirection="row"
                      alignItems="center"
                      justifyContent="space-between"
                      fullWidth
                    >


                      <MDBox ml="auto" mt={4} mb={2} display="flex" justifyContent="flex-end">
                        <MDBox mx={2}>
                          <MDButton
                            variant="gradient"
                            color="dark"
                            size="small"
                            px={2}
                            mx={2}
                            onClick={() =>
                              navigate("/actionitem-management", {
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

export default NewActionItem;

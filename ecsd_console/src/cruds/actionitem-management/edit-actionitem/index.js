

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
import MDDatePicker from "components/MDDatePicker";
import { InputLabel } from "@mui/material";
import { Autocomplete } from "@mui/material";
import TextField from "@mui/material/TextField";
import DataTable from "examples/Tables/DataTable";
import { IconButton, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Form } from "formik";
import Modal from "@mui/material/Modal";



const EditActionItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [ownerID, setOwnerId] = useState(""); ``
  const [owner, setOwner] = useState("");
  const [assignees, setAssignees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [assigneeText, setAssigneeText] = useState("");
  const [data, setData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [note, setNote] = useState("");
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);


  //const [actionitemActive, setActionItemActive] = useState(false);
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
    (async () => {

    })();
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await CrudService.getActionItem(id);
        //setActionItemActive(res.data.attributes.status === "active" ? true : false)
        setActionItem({
          id: res.data.id,
          name: res.data.attributes.name,
          status: res.data.attributes.status,
          number: res.data.attributes.number,
          notes: res.data.attributes.notes,
          description: res.data.attributes.description,
          source: res.data.attributes.source,
          control: res.data.attributes.control,
          location: res.data.attributes.location,
          date_initiated: res.data.attributes.date_initiated,
          date_resolved: res.data.attributes.date_resolved,
          due_date: res.data.attributes.due_date,
          assigned_to: res.data.attributes.assigned_to,
          created_at: res.data.attributes.created_at,
          updated_at: res.data.attributes.updated_at,
          inspection: res.data.attributes.inspection,
          project: res.data.attributes.project
        });

        setData(res.data.attributes.notes);
        const projectId = res.data.attributes.project;
        const response = await CrudService.getProjectAssignees(projectId);

        var projectAssigneeSelections = [];
        response.data.map((assignee) => {
          projectAssigneeSelections.push({ label: assignee.attributes.first_name + " " + assignee.attributes.last_name, value: assignee.attributes._id });
        });
        setAssignees(projectAssigneeSelections);
        setAssigneeText(projectAssigneeSelections.filter((assignee) => assignee.value === res.data.attributes.assigned_to)[0].label);

      } catch (err) {
        console.error(err);
      }
    })();
  }, [id]);


  useEffect(() => {
    setTableData(getRows(data));
  }, [data]);


  const handleNoteSave = async (e) => {
    try {

      var newNote = await CrudService.createActionItemNote(actionitem.id, { "data": { "attributes": { "note": note } } }).then(async (response) => {

        await CrudService.getActionItemNotes(actionitem.id).then((response) => {
         
          setData(response.data.map((row) => {  
            return row.attributes;
          }));
        });
      });

      setNote("");
      handleClose();
    } catch (err) {
      console.error(err);
    }
  };
  /* 
const addNoteModal = () => {
  return (
    <Modal
      open={showModal}
      onClose={handleClose}
    >
      <Modal.Header closeButton>
        <Modal.Title>Add Note</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Note</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Note"
              name="note"
              value={note}
              onChange={changeHandler}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}; */






  const clickAddNoteHandler = () => {
    handleShow();
  };
  /* 
    const handleNoteEdit = (value) => {
      //console.log(value);
      try {
          var rowData = tableData.map(
            (row) => {
              if (row._id === value.target.name) {
                return {
                  ...row,
                  note: value.target.value,
                };
              }
              return row;
            }
          );
          //setData(rowData);
       
      } catch (err) {
        // it sends error if the actionitem is associated with an item
        console.error(err);
        if (err.hasOwnProperty("errors")) {
          setNotification({
            value: true,
            text: err.errors[0].title,
          });
        }
        return null;
      }
  
  
    };
   */

  const clickDeleteHandler = async (e, id) => {
    try {
      if (!confirm("Are you sure you want to delete this note?")) {
        e.nativeEvent.stopImmediatePropagation();
      } else {

        await CrudService.deleteActionItemNote(actionitem.id, id).then(async (response) => {
          await CrudService.getActionItemNotes(actionitem.id).then((response) => {

            setData(response.data.map((row) => {  
              return row.attributes;
            }));
          });
        });       
      }
    } catch (err) {
      // it sends error if the actionitem is associated with an item
      console.error(err);
      if (err.hasOwnProperty("errors")) {
        setNotification({
          value: true,
          text: err.errors[0].title,
        });
      }
      return null;
    }
  };


  const getRows = (info) => {
    let updatedInfo = info.map((row) => {

      /*    const UserName  =  getUserName(row.attributes.owner);
         console.log(UserName); */
      return {
        type: "notes",
        _id: row._id,
        note: row.note,
        user: row.user,
        created_at: row.created_at,
      };
    });
    return updatedInfo;
  };

  const dataTableData = {
    columns: [
      {
        Header: "note",
        accessor: "",
        width: "50%",
        Cell: (info) => {
          return (
            <MDBox display="flex" alignItems="center">
              <MDBox>
                <FormField
                  name={info.cell.row.original._id}
                  value={info.cell.row.original.note}
                //onChange={handleNoteEdit}
                />
              </MDBox>
            </MDBox>
          );
        },
      },

      {
        Header: "user",
        accessor: "user",
        width: "20%"
      },
      {
        Header: "created at",
        accessor: "created_at",
        width: "20%"
      },
      {
        Header: "actions",
        width: "10%",
        disableSortBy: true,
        accessor: "",
        Cell: (info) => {
          return (
            <MDBox display="flex" alignItems="center">
              <Tooltip title="Delete Note">
                <IconButton
                  onClick={(e) => clickDeleteHandler(e, info.cell.row.original._id)}
                  size="large">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </MDBox>
          );
        },
      },
    ],

    rows: tableData,
  };




  const changeHandler = (e) => {
    setActionItem({
      ...actionitem,
      [e.target.name]: e.target.value,
    });
  };

  const changeStatusHandler = (e, i, o) => {
    if (o && o === "clear") {
      setActionItem({
        ...actionitem,
        status: ""
      });
    } else {
      setActionItem({
        ...actionitem,
        status: i
      });
    }
  };



  const changeAssigneeHandler = (e, i, o) => {
    if (o && o === "clear") {
      setActionItem({
        ...actionitem,
        assigned_to: ""
      });
    } else {
      setAssigneeText(i.label);
      setActionItem({
        ...actionitem,
        assigned_to: i.value
      });
    }
  };




  const changeHandlerDate = (e, i, o) => {
    setActionItem({
      ...actionitem,
      [o.input.name]: i,
    });
  };


  /* const changeActionItemActiveHandler = (e) => {
    setActionItemActive(e.target.checked);
  } */;


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
          notes: data,
        }
      }
    };

    try {
      await CrudService.updateActionItem(actionitemToSave, id);
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
      <DashboardNavbar breadcrumbTitle={actionitem.name} />
      <MDBox mt={5} mb={9}>
        <Grid container justifyContent="center">
          <Grid item xs={12} lg={8}>
            <MDBox mt={6} mb={8} textAlign="center">
              <MDBox mb={1}>
                <MDTypography variant="h3" fontWeight="bold">
                  Edit Action Item
                </MDTypography>
              </MDBox>
              <MDTypography variant="h5" fontWeight="regular" color="secondary">
                This information describes more about the action item.
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

                  <Autocomplete
                    key="status"
                    disablePortal
                    id="combo-box-status"
                    options={["inprogress", "cantdo", "complete", "todo"]}
                    sx={{ width: 300 }}
                    value={actionitem.status}
                    onChange={changeStatusHandler}
                    error={error.status}
                    isOptionEqualToValue={(option, value) => option.value === value}
                    renderInput={(params) => <FormField {...params} label="Status" />}
                  />


                  {/*  <MDBox display="flex" alignItems="center" mb={0.5} ml={-1.5}>
                    <MDBox mt={0.5}>
                      <Switch name="actionitemActive" checked={actionitemActive} onChange={changeActionItemActiveHandler} />
                    </MDBox>
                    <MDBox width="80%" ml={0.5}>
                      <MDTypography variant="button" fontWeight="regular" color="text">
                        Active ActionItem?
                      </MDTypography>
                    </MDBox>
                  </MDBox> */}

                  {/* Description */}
                  <Grid item xs={12} sm={6}>
                    <MDBox mt={2}>
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
                    </MDBox>
                  </Grid>

                  {/* source */}
                  <Grid item xs={12} sm={6}>
                    <MDBox mt={2}>
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
                    </MDBox>
                  </Grid>

                  {/* control */}
                  <Grid item xs={12} sm={6}>
                    <MDBox mt={2}>
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
                    </MDBox>
                  </Grid>

                  {/* location */}
                  <Grid item xs={12} sm={6}>
                    <MDBox mt={2}>
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
                    </MDBox>
                  </Grid>

                  {/* date_initiated */}
                  <Grid item xs={12} sm={6}>
                    <MDBox mt={2}>
                      <InputLabel>
                        Date Initiated
                      </InputLabel>
                      <MDDatePicker
                        input={{ name: "date_initiated" }}
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
                    </MDBox>
                  </Grid>

                  {/* date_resolved */}
                  <Grid item xs={12} sm={6}>
                    <MDBox mt={2}>
                      <InputLabel>
                        Date Resolved
                      </InputLabel>
                      <MDDatePicker
                        input={{ name: "date_resolved" }}
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
                    </MDBox>
                  </Grid>

                  {/* due_date */}
                  <Grid item xs={12} sm={6}>
                    <MDBox mt={2}>
                      <InputLabel>
                        Due Date
                      </InputLabel>
                      <MDDatePicker
                        input={{ name: "due_date" }}
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
                    </MDBox>
                  </Grid>

                  {/* assigned_to */}
                  <Grid item xs={12} sm={6}>
                    <MDBox mt={2}>
                      {/* <FormField
                      label="Assigned To"
                      placeholder=""
                      name="assigned_to"
                      value={actionitem.assigned_to}
                      onChange={changeHandler}
                      error={error.assigned_to}
                    /> */}
                      <Autocomplete
                        key="assigned_to"
                        disablePortal
                        id="combo-box-assigned_to"
                        options={assignees}
                        sx={{ width: 300 }}
                        value={assigneeText}
                        onChange={changeAssigneeHandler}
                        error={error.assigned_to}
                        isOptionEqualToValue={(option, value) => option.value === value}
                        renderInput={(params) => <FormField {...params} label="Assigned To" />}
                      />


                      {error.assigned_to && (
                        <MDTypography variant="caption" color="error" fontWeight="light">
                          {error.textError}
                        </MDTypography>
                      )}
                    </MDBox>
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
                <Grid container xs={12} justifyContent="center">

                  <MDBox mt={2} mb={2} textAlign="center" justifyContent="center">
                    <MDBox mb={1}>
                      <MDTypography variant="h3" fontWeight="bold">
                        Action Item Notes
                      </MDTypography>
                    </MDBox>

                  </MDBox>


                  <Grid item xs={12} >
                    <MDBox ml="auto" mx={4} mt={4} mb={2} display="flex" justifyContent="flex-end">

                      <MDButton
                        variant="gradient"
                        color="dark"
                        size="small"
                        type="button"
                        onClick={clickAddNoteHandler}
                      >
                        + Add Note
                      </MDButton>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12}>
                    <DataTable table={dataTableData} />
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
      <Modal
        height={200}
        width={400}
        keepMounted
        open={showModal}
        onClose={handleClose}
      >
        <>
          <MDBox height={200} width={400}>
            <MDTypography variant="h6" fontWeight="bold" textAlign="center">
              Add Note
            </MDTypography>
          </MDBox>
          <MDBox>
            <MDBox component="form" method="POST" >
              <FormField
                type="text"
                placeholder="Enter Note"
                name="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

            </MDBox>
          </MDBox>
          <MDBox>
            <MDButton variant="secondary" onClick={handleClose}>
              Close
            </MDButton>
            <MDButton variant="primary" onClick={handleNoteSave}>
              Save
            </MDButton>
          </MDBox>
        </>
      </Modal>
    </DashboardLayout>
  );
};

export default EditActionItem;

import React, { useState, useEffect } from "react";
import { Grid, Card, IconButton, Tooltip } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import DataTable from "examples/Tables/DataTable";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CrudService from "services/cruds-service";
import { useNavigate, useParams, useLocation } from "react-router-dom";




const EditProjectKeyPair = () => {
  const [tableData, setTableData] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState({ key: "", value: "" });
  const [editRowIndex, setEditRowIndex] = useState(null);

  const [data, setData] = useState([]);

  const formatDate = (myDate) => {
    const date = new Date(myDate);

    // Extract month, day, and year
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);

    // Combine in mm/dd/yy format
    return `${month}/${day}/${year}`;
  };

  const navigate = useNavigate();

  const location = useLocation();
  const projID = location.state?.projectId;
  if (!projID) {
    navigate("/project-management");
    return null;
  }
  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await CrudService.getKeysByID([projID]);
        const keys = response.data;
        const formatKeys = keys.map((keyPair) => ({
          key: keyPair.attributes.key,
          value: keyPair.attributes.value,
          date: formatDate(keyPair.attributes.dateCreated),
          user: keyPair.attributes.owner
        }));
        setTableData(formatKeys);
      } catch (error) {
        console.error("Error fetching keys:", error);
      }
    };

    fetchKeys();
  }, []);

  // Handle adding a new row
  const handleAddRow = () => {
    setIsAdding(true);
    setNewKeyValue({ key: "", value: "" });
  };

  // Save the new row
  const handleSaveNewRow = async (e) => {
    e.preventDefault();

    if (newKeyValue.key.trim().length < 1 || newKeyValue.value.trim().length < 1) {
      setError({ name: true, textError: "The key and value fields are required" });
      return;
    }

    const keyToSave = {
      data: {
        attributes: {
          key: newKeyValue.key,
          value: newKeyValue.value,
          projectId: projID,
        },
      },
    };

    try {
      const response = await CrudService.createKey(keyToSave);
      const savedKey = response.data.attributes;
      setTableData((prevTableData) => [
        ...prevTableData,
        {
          key: savedKey.key,
          value: savedKey.value,
          date: formatDate(savedKey.dateCreated),
          user: savedKey.owner,
        },
      ]);
      setNewKeyValue({ key: "", value: "" });
      setIsAdding(false);
    } catch (err) {
      console.error("Error saving new key:", err);
      if (err.hasOwnProperty("errors")) {
        setError({ ...error, error: true, textError: err.message });
      }
    }
  };

  // Cancel the new row addition
  const handleCancelNewRow = () => {
    setNewKeyValue({ key: "", value: "" });
    setIsAdding(false);
  }

  // Handle row editing
  const handleEditRow = (index) => {
    setEditRowIndex(index);
    setNewKeyValue({
      key: tableData[index].key,
      value: tableData[index].value,
    });
  };

  // Save edits
  const handleSaveEdit = async (index) => {
    const key = tableData[index].key;
    const keyToEdit = {
      data: {
        attributes: {
          value: newKeyValue.value,
        },
      },
    };

    try {
      const response = await CrudService.editKeys(keyToEdit, key);
      const updatedKey = response.data.attributes;
      const updatedData = [...tableData];
      updatedData[index] = {
        ...updatedData[index],
        value: updatedKey.value,
        date: formatDate(updatedKey.dateCreated),
      };

      setTableData(updatedData);
      setEditRowIndex(null);
      setNewKeyValue({ key: "", value: "" });
    } catch (err) {
      console.error("Error updating key:", err);
      alert("Failed to update the key. Please try again.");
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditRowIndex(null);
    setNewKeyValue({ key: "", value: "" });
  };

  // Delete a row
  const handleDeleteRow = async (index) => {
    const keyToDelete = tableData[index].key;

    try {
      await CrudService.deleteKey(keyToDelete);
      const updatedData = tableData.filter((_, i) => i !== index);
      setTableData(updatedData);
    } catch (err) {
      console.error("Error deleting key:", err);
      alert("Failed to delete the key. Please try again.");
    }
  };

  const dataTableData = {
    columns: [
      { Header: "Key", accessor: "key", width: "25%" },
      { Header: "Value", accessor: "value", width: "25%" },
      { Header: "Updated Date", accessor: "date", width: "25%" },
      { Header: "Updated By", accessor: "user", width: "25%" },
      {
        Header: "Actions",
        accessor: "actions",
        width: "15%",
        Cell: ({ row }) => {
          const index = row.index;
          return (
            <MDBox display="flex" justifyContent="center" alignItems="center">
              {editRowIndex === index ? (
                <>
                  <Tooltip title="Save">
                    <IconButton onClick={() => handleSaveEdit(index)}>
                      <SaveIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cancel">
                    <IconButton onClick={handleCancelEdit}>
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => handleEditRow(index)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => handleDeleteRow(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </MDBox>
          );
        },
      },
    ],
    rows: [
      ...tableData.map((row, index) =>
        editRowIndex === index
          ? {
            ...row,
            key: (
              <MDInput
                value={newKeyValue.key}
                onChange={(e) =>
                  setNewKeyValue({ ...newKeyValue, key: e.target.value })
                }
                size="small"
              />
            ),
            value: (
              <MDInput
                value={newKeyValue.value}
                onChange={(e) =>
                  setNewKeyValue({ ...newKeyValue, value: e.target.value })
                }
                size="small"
              />
            ),
          }
          : row
      ),
      ...(isAdding
        ? [
          {
            key: (
              <MDInput
                value={newKeyValue.key}
                onChange={(e) =>
                  setNewKeyValue({ ...newKeyValue, key: e.target.value })
                }
                placeholder="Enter Key"
                size="small"
              />
            ),
            value: (
              <MDInput
                value={newKeyValue.value}
                onChange={(e) =>
                  setNewKeyValue({ ...newKeyValue, value: e.target.value })
                }
                placeholder="Enter Value"
                size="small"
              />
            ),
            date: "—",
            user: "—",
            actions: (
              <MDBox display="flex" justifyContent="center" alignItems="center">
                <Tooltip title="Save">
                  <IconButton onClick={handleSaveNewRow}>
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel">
                  <IconButton onClick={handleCancelNewRow}>
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              </MDBox>
            ),
          },
        ]
        : []),
    ],
  };

  return (
    <DashboardLayout>
      <DashboardNavbar breadcrumbTitle="Edit Project Key Pair" />
      <MDBox mt={5} mb={9}>
        <Grid container justifyContent="center">
          <Grid item xs={12} lg={8}>
            <MDBox mt={6} mb={8} textAlign="center">
              <MDBox mb={1}>
                <MDTypography variant="h3" fontWeight="bold">
                  Edit Project Key Pair
                </MDTypography>
              </MDBox>
            </MDBox>
            <Card>
              <MDBox p={2}>
                <DataTable table={dataTableData} />
                <MDBox mt={2} display="flex" justifyContent="flex-end">
                  {!isAdding ? (
                    <MDButton
                      variant="gradient"
                      color="dark"
                      size="small"
                      onClick={handleAddRow}
                    >
                      + Add Key Pair
                    </MDButton>
                  ) : (
                    <>
                      <Tooltip title="Save">
                        <MDButton
                          variant="gradient"
                          color="dark"
                          size="small"
                          onClick={handleSaveNewRow}
                          style={{ marginRight: "10px" }}
                        >
                          Save
                        </MDButton>
                      </Tooltip>
                      <Tooltip title="Cancel">
                        <MDButton
                          variant="gradient"
                          color="dark"
                          size="small"
                          onClick={handleCancelNewRow}
                        >
                          Cancel
                        </MDButton>
                      </Tooltip>
                    </>
                  )}
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

export default EditProjectKeyPair;

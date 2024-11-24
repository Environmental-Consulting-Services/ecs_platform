import React, { useState } from "react";
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

const EditProjectKeyPair = () => {
  const [tableData, setTableData] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState({ key: "", value: "" });
  const [editRowIndex, setEditRowIndex] = useState(null);

  // Handle adding a new row
  const handleAddRow = () => {
    setIsAdding(true);
    setNewKeyValue({ key: "", value: "" });
  };

  // Save the new row
  const handleSaveNewRow = () => {
    if (newKeyValue.key.trim() === "" || newKeyValue.value.trim() === "") {
      alert("Key and Value fields cannot be empty.");
      return;
    }

    setTableData((prevData) => [
      ...prevData,
      {
        key: newKeyValue.key,
        value: newKeyValue.value,
        date: new Date().toLocaleString(),
        user: "Current User",
      },
    ]);

    setNewKeyValue({ key: "", value: "" });
    setIsAdding(false);
  };

  // Cancel the new row addition
  const handleCancelNewRow = () => {
    setNewKeyValue({ key: "", value: "" });
    setIsAdding(false);
  };

  // Handle row editing
  const handleEditRow = (index) => {
    setEditRowIndex(index);
    setNewKeyValue({
      key: tableData[index].key,
      value: tableData[index].value,
    });
  };

  // Save edits
  const handleSaveEdit = (index) => {
    const updatedData = [...tableData];
    updatedData[index] = {
      ...updatedData[index],
      key: newKeyValue.key,
      value: newKeyValue.value,
    };
    setTableData(updatedData);
    setEditRowIndex(null);
    setNewKeyValue({ key: "", value: "" });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditRowIndex(null);
    setNewKeyValue({ key: "", value: "" });
  };

  // Delete a row
  const handleDeleteRow = (index) => {
    const updatedData = tableData.filter((_, i) => i !== index);
    setTableData(updatedData);
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
                  {!isAdding && (
                    <MDButton
                      variant="gradient"
                      color="dark"
                      size="small"
                      onClick={handleAddRow}
                    >
                      + Add Key Pair
                    </MDButton>
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

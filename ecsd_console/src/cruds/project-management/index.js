 

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";
import { Tooltip, IconButton } from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import CrudService from "services/cruds-service";
import HTMLReactParser from "html-react-parser";
import { AbilityContext } from "Can";
import { useAbility } from "@casl/react";
/* 
import { generate } from '@pdfme/generator';
import { BLANK_PDF } from '@pdfme/common';
 */


function ProjectManagement() {
  let { state } = useLocation();
  const ability = useAbility(AbilityContext);
  const [data, setData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [userNames, setUserNames] = useState([]); //array of user entities [id, name

  const [notification, setNotification] = useState({
    value: false,
    text: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const response = await CrudService.getProjects();


      let userIDs = [];
      response.data.forEach((project) => {
        userIDs.push(project.attributes.owner);
      }
      );  

      let Users = await CrudService.getUsersByID(userIDs);

      console.log(Users);


      setUserNames(Users);
      setData(response.data);
    })();
  }, []);

  useEffect(() => {
    if (!state) return;
    setNotification({
      value: state.value,
      text: state.text,
    });
  }, [state]);

  useEffect(() => {
    setTableData(getRows(data));
  }, [data]);

  useEffect(() => {
    if (notification.value === true) {
      let timer = setTimeout(() => {
        setNotification({
          value: false,
          text: "",
        });
      }, 5000);
    }
  }, [notification]);

  const clickAddHandler = () => {
    navigate("/project-management/new-project");
  };

  const clickEditHandler = (id) => {
    navigate(`/project-management/edit-project/${id}`);
  };

  const clickDeleteHandler = async (e, id) => {
    try {
      if (!confirm("Are you sure you want to delete this project?")) {
        e.nativeEvent.stopImmediatePropagation();
      } else {
        await CrudService.deleteProject(id);
        // the delete does not send a response
        // so I need to get again the projects to set it and this way the table gets updated -> it goes to the useEffect with data dependecy
        const response = await CrudService.getProjects();
        setData(response.data);
        setNotification({
          value: true,
          text: "The project has been successfully deleted",
        });
      }
    } catch (err) {
      // it sends error if the project is associated with an item
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
        type: "projects",
        id: row.id,
        name: row.attributes.name,
        owner: row.attributes.owner,
        created_at: row.attributes.created_at,
      };
    });
    return updatedInfo;
  };
/* 
  //TODO: need a function to get the user entities from an array of ids
  const getUserName = async (userId) => {
      
    try{
        const resp = await CrudService.getUser(userId);
        return resp.data.attributes.first_name + " " + resp.data.attributes.last_name;
       
      } catch (err) {
        //console.error(err);
        return userId;
      }
  }
 */
/* 
  function doPDF() {
    generate({ template, inputs }).then((pdf) => {
      console.log(pdf);


      // Browser
      const blob = new Blob([pdf.buffer], { type: 'application/pdf' });
      window.open(URL.createObjectURL(blob));
    });
  }



  const inputs = [{ a: 'a2', b: 'b1', c: 'c1' }];

  const template = {
    basePdf: BLANK_PDF,
    schemas: [
      {
        a: {
          type: 'text',
          position: { x: 40, y: 50 },
          width: 10,
          height: 10,
        },
        b: {
          type: 'text',
          position: { x: 10, y: 10 },
          width: 10,
          height: 10,
        },
        c: {
          type: 'text',
          position: { x: 20, y: 20 },
          width: 10,
          height: 10,
        },
      },
    ],
  };


 */


  const dataTableData = {
    columns: [
      { Header: "name", accessor: "name", width: "25%" },
      {
        Header: "owner",
        accessor: "owner",
        width: "25%",
        Cell: (info) => {
          
          if(userNames && userNames.data && userNames.data.length > 0){
           let user = userNames.data.filter((user) => {
            if (user.id === info.cell.row.original.owner) {
              return true;
            }
          });
            
          return (
            <MDTypography variant="body" >
              {user[0].attributes.first_name+ " " + user[0].attributes.last_name}
            </MDTypography>
          );
        } else {
          return (
            <MDTypography variant="body" >
              {info.cell.row.original.owner}
            </MDTypography>
          );
        }
      },
      },
      { Header: "created at", accessor: "created_at", width: "25%" },
      {
        Header: "actions",
        disableSortBy: true,
        accessor: "",
        Cell: (info) => {
          return (
            <MDBox display="flex" alignItems="center">
              {ability.can("delete", "projects") && (
                <Tooltip title="Delete Project">
                  <IconButton
                    onClick={(e) => clickDeleteHandler(e, info.cell.row.original.id)}
                    size="large">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )}
              {ability.can("edit", "projects") && (
                <Tooltip title="Edit Project">
                  <IconButton onClick={() => clickEditHandler(info.cell.row.original.id)} size="large">
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
            </MDBox>
          );
        },
      },
    ],

    rows: tableData,
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      {notification.value && (
        <MDAlert color="info" my="20px">
          <MDTypography variant="body2" color="white">
            {notification.text}
          </MDTypography>
        </MDAlert>
      )}
      <MDBox pt={6} pb={3}>
        <MDBox mb={3}>
          <Card>
            <MDBox p={3} lineHeight={1} display="flex" justifyContent="space-between">
              <MDTypography variant="h5" fontWeight="medium">
                Project Management
              </MDTypography>
              {ability.can("create", "projects") && (
                <MDButton
                  variant="gradient"
                  color="dark"
                  size="small"
                  type="submit"
                  onClick={clickAddHandler}
                >
                  + Add Project
                </MDButton>
              )}
            </MDBox>
            <DataTable table={dataTableData} />
          </Card>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ProjectManagement;

 

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

import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import ShareIcon from "@mui/icons-material/Share";

import CrudService from "services/cruds-service";
import { AbilityContext } from "Can";
import { useAbility } from "@casl/react";
import { format } from 'date-fns';
import React from "react";
import { Model } from "survey-core";
import { SurveyPDF } from "survey-pdf";
import { Survey } from "survey-react-ui";
import "survey-core/defaultV2.min.css";
import { json } from "./json";
import { setLicenseKey } from "survey-core";

function InspectionManagement() {
  let { state } = useLocation();
  const ability = useAbility(AbilityContext);
  const [data, setData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [notification, setNotification] = useState({
    value: false,
    text: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const response = await CrudService.getInspections();
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
    navigate("/inspection-management/new-inspection");
  };


  const clickShareHandler = async (e, id) => {
    try {

      const response = await CrudService.shareInspectionPDF(id).then( async (inspectionResponse) => {
        setNotification({
          value: true,
          text: "The inspection has been successfully shared",
        });
      });
  
      } catch (err) {
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
  



  const clickPDFHandler = async (e, id) => {
    try {
     

      const response = await CrudService.getInspection(id).then( async (inspectionResponse) => {

        await CrudService.getInspectionTemplate(inspectionResponse.data.attributes.template).then(templateResponse => {
        
          const surveyModel = templateResponse.data.attributes.items[0];

          const pdfWidth = /* !!surveyModel && surveyModel.pdfWidth ? surveyModel.pdfWidth :  */210;
          const pdfHeight = /* !!surveyModel && surveyModel.pdfHeight ? surveyModel.pdfHeight : */ 297;
          const options = {
            haveCommercialLicense: true,
              fontSize: 10,
             margins: {
                  left: 10,
                  right: 10,
                  top: 10,
                  bot: 10
              },
              format: [pdfWidth, pdfHeight],
              tagboxSelectedChoicesOnly: true,
              compress: true

          };


          surveyModel.pages[0].visible = true;

          const surveyPDF = new SurveyPDF( surveyModel, options);
          surveyPDF.mode = "display";


          setLicenseKey(
            "NzMyNjcyZDctM2RlNC00ZTU3LTkzODctMThhMzcyYTU5MWUyOzE9MjAyNS0wNS0xNSwyPTIwMjUtMDUtMTUsND0yMDI1LTA1LTE1"
          );

          if (surveyPDF) {
             surveyPDF.data = inspectionResponse.data.attributes.formdata;
          }

          let filename = inspectionResponse.data.attributes.scheduled_date + ".pdf";
          surveyPDF.save(filename);
       
        });      
      });
    
    } catch (err) {
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


  const clickEditHandler = (e,id) => {
    navigate(`/inspection-management/view-inspection/${id}`);
  };

  const clickDeleteHandler = async (e, id) => {
    try {
      if (!confirm("Are you sure you want to delete this inspection?")) {
        e.nativeEvent.stopImmediatePropagation();
      } else {
        await CrudService.deleteInspection(id);
        // the delete does not send a response
        // so I need to get again the projects to set it and this way the table gets updated -> it goes to the useEffect with data dependecy
        const response = await CrudService.getInspections();
        setData(response.data);
        setNotification({
          value: true,
          text: "The inspection has been successfully deleted",
        });
      }
    } catch (err) {
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

      let scheduled_date = "Not Scheduled";
      if(row.attributes.scheduled_date != null && row.attributes.scheduled_date != ""){
        scheduled_date = format(Date.parse(row.attributes.scheduled_date), 'MMMM do, yyyy');
      }

      let created_date = "";
      if(row.attributes.created_at != null && row.attributes.created_at != ""){
        created_date = format(Date.parse(row.attributes.created_at), 'MMMM do, yyyy');
      }

      return {
        type: "inspections",
        id: row.id,
        name: row.attributes.name,
        scheduled_date: scheduled_date,
        status: row.attributes.status,
        action_count: (row.attributes.actions && row.attributes.actions.length>0)? row.attributes.actions.reduce((acc, action) => {
          return acc + 1;
        }, 0): 0,
        //owner: row.attributes.owner,
        created_at: created_date,
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



  const dataTableData = {
    columns: [
      { Header: "scheduled date", accessor: "scheduled_date", width: "25%" },
      /* {
        Header: "owner",
        accessor: "owner",
        width: "25%",
        Cell: ({ cell: { value } }) => HTMLReactParser(value),
      }, */
      { Header: "created at", accessor: "created_at", width: "25%" },
     
      { Header: "Status", accessor: "status", width: "25%" },
      { Header: "Action Items", accessor: "action_count", width: "25%" },
      {
        Header: "actions",
        disableSortBy: true,
        accessor: "",
        align: "center",
        Cell: (info) => {
          return (
            <MDBox display="flex" alignItems="center">
              
              <Tooltip title="Edit Inspection">
                <IconButton onClick={(e) => clickEditHandler(e,info.cell.row.original.id)} size="small">
                <EditIcon />
                </IconButton>
                </Tooltip>
  
                <Tooltip title="Download PDF">
                  <IconButton
                    onClick={(e) => clickPDFHandler(e, info.cell.row.original.id)}
                    size="large">
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Share Inspection">
                <IconButton onClick={(e) => clickShareHandler(e,info.cell.row.original.id)} size="large">
                  <ShareIcon />
                </IconButton>
                </Tooltip>


              {/* {ability.can("edit", "projects") && (
                <Tooltip title="Edit Project">
                  <IconButton onClick={() => clickEditHandler(info.cell.row.original.id)} size="large">
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )} */}
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
                Inspection Management
              </MDTypography>
              {ability.can("create", "projects") && (
                <MDButton
                  variant="gradient"
                  color="dark"
                  size="small"
                  type="submit"
                  onClick={clickAddHandler}
                >
                  + Add Inspection
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

export default InspectionManagement;

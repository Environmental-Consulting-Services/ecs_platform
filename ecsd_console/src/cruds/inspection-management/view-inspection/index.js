import { useEffect, useState } from "react";
// @mui material components

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDEditor from "components/MDEditor";
import MDAlert from "components/MDAlert";

import Switch from "@mui/material/Switch";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import FormField from "layouts/applications/wizard/components/FormField";
import { useNavigate, useParams } from "react-router-dom";
import { setLicenseKey } from "survey-core";
import CrudService from "services/cruds-service";

import 'survey-core/defaultV2.min.css';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';

const ViewInspection = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState();
  const [surveyJson, setSurveyJson] = useState();
  const [surveyModel, setSurveyModel] = useState(new Model(surveyJson));
  const [surveyResults, setSurveyResults] = useState("");
  const [isSurveyCompleted, setIsSurveyCompleted] = useState(false);
  const [isSurveyReady, setIsSurveyReady] = useState(false);
  const [notification, setNotification] = useState({ value: false, color: "info", message: "" });
  const [jsonSurveyData, setJsonSurveyData] = useState({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [value, setValue] = useState("");
  const [inspection, setInspection] = useState("");
  const [inspectiontemplate, setInspectionTemplate] = useState({
    name: "",
    status: "",
    type: "",
    items: [],
    created_at: "",
    updated_at: "",
    project: "",
  });
  
  const [error, setError] = useState({
    name: false,
    status: false,
    error: false,
    textError: "",
  });

  function SurveyWidget() {
    return (
        <Survey model={surveyModel} id="surveyContainer" key="surveyContainer"/> 
    )
  }

  // If you use a web service:
  async function saveSurvey() {

    inspection.formdata = surveyModel.data;
    let updatetData = {
      data: {
        type: "inspections",
        id: id,
        attributes: {
            formdata: inspection.formdata,          
        }
      }
    }     

    try {
       let inspectionResponse = await CrudService.updateInspection(updatetData, id);
        setNotification({ value: true, text: "The company was sucesfully created" });
    } catch (err) {
        if (err.hasOwnProperty("errors")) {
          setNotification({ ...error, error: true, textError: err.message });
       }
    }
    
  }

  useEffect(() => {

    setLicenseKey(
      "NzMyNjcyZDctM2RlNC00ZTU3LTkzODctMThhMzcyYTU5MWUyOzE9MjAyNS0wNS0xNSwyPTIwMjUtMDUtMTUsND0yMDI1LTA1LTE1"
    );
    
    if (!id) return;
    (async () => {
      try {

        let inspectionResponse = await CrudService.getInspection(id);
        setInspection({
          id: inspectionResponse.data.id,
          name: inspectionResponse.data.attributes.name,
          status: inspectionResponse.data.attributes.status,

        });

       
        let res = await CrudService.getInspectionTemplate(inspectionResponse.data.attributes.template);
        //setInspectionTemplateActive(res.data.attributes.status === "active" ? true : false)
        setInspectionTemplate({
          id: res.data.id,
          name: res.data.attributes.name,
          status: res.data.attributes.status,
          type : res.data.attributes.type,
          items: res.data.attributes.items,
          created_at: res.data.attributes.created_at,
          updated_at: res.data.attributes.updated_at,
          project: res.data.attributes.project,          
        });
  
       
        let InspectionSurveyModel = new Model(res.data.attributes.items[0]);
        InspectionSurveyModel.haveCommercialLicense = true;
        InspectionSurveyModel.data = inspectionResponse.data.attributes.formdata;
        setSurveyModel(InspectionSurveyModel);
        setDataLoaded(true);

      } catch (err) {
        console.error(err);
      }
    })();
  }, [id]);


  const submitHandler = async (e) => {
    e.preventDefault();
    saveSurvey();
  };

  return (

    <DashboardLayout>
      <DashboardNavbar breadcrumbTitle={inspectiontemplate.name}/>
      <MDBox pt={3} pb={3}>
        <MDBox mb={1}>
          <Card height="100%">
            <MDBox p={1} lineHeight={1} display="flex" justifyContent="center">
                <MDBox>
                <MDTypography variant="h3" fontWeight="bold">
                  View Inspection 
                </MDTypography>
                </MDBox>
                {/* <MDBox>
           <MDTypography variant="h5" fontWeight="regular" color="secondary">
                This information describes more about the Inspection Template.
              </MDTypography> 
              </MDBox>*/}
            </MDBox>

            {notification.value === true && (
              <MDAlert color={notification.color} mt="20px">
                <MDTypography variant="body2" color="white">
                  {notification.message}
                </MDTypography>
              </MDAlert>
            )}
              <MDBox component="form" method="POST" onSubmit={submitHandler}>
              <MDBox ml="auto" mt={0} mb={2} pr={2} display="flex" justifyContent="flex-end">
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
              <MDBox height="800px" >
                       
                    {dataLoaded ? (   
                    <SurveyWidget ></SurveyWidget>) : ( <MDBox>Loading...</MDBox>)}
                  {/*   */}
                  {/* <SurveyCreatorWidget id={inspectiontemplate.id}></SurveyCreatorWidget> */}
              </MDBox>
         </Card>
      </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );

};

export default ViewInspection;

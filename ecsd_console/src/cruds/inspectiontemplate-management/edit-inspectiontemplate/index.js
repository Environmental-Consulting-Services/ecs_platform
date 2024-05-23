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
import { SurveyCreatorWidget } from '../surveycreator/SurveyCreatorWidget';
import { SurveyCreatorComponent, SurveyCreator } from "survey-creator-react";
import { setLicenseKey } from "survey-core";
import CrudService from "services/cruds-service";

/* 
import {
  getSurveyJSON,
  saveSurveyJSON,
  getSurveyName,
  saveSurveyName
} from "../surveycreator/WebDataService";

 */




const EditInspectionTemplate = () => {

 
  const { id } = useParams();
  const navigate = useNavigate();
  //const [roles, setRoles] = useState([]);
  const [inspectiontemplateActive, setInspectionTemplateActive] = useState(false);  
  const [notification, setNotification] = useState({ value: false, color: "info", message: "" });

  const [jsonSurveyData, setJsonSurveyData] = useState({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [creator, setCreator] = useState({});
  const [value, setValue] = useState("");
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

  const creatorOptions = {
    showLogicTab: true,
    isAutoSave: false
  };
    function SurveyCreatorWidget() {
    // ...
      return (
      <SurveyCreatorComponent sx={{ height: '100%' }} creator={creator}></SurveyCreatorComponent>
      )
    }

 


    creator.saveSurveyFunc = (saveNo, callback) => { 

      //save to api
      //window.localStorage.setItem("survey-json", creator.text);
      //callback(saveNo, true);
      
      var saveSucess = saveSurvey();
      if (callback){
          callback(saveNo, saveSucess);
      }
    };
    // ...
    
  // If you use a web service:
  async function saveSurvey() {

    var json = creator.JSON;

    if (inspectiontemplate.name.trim().length < 1) {
      setError({ name:true,  textError: "The Inspection Template name is required" });
      return;
    }

    const templateToSave = {
      data: {
              type: "inspectiontemplates",
              attributes: {
                  id: id,
                  name: inspectiontemplate.name,
                  type: "surveyjs",
                  status: (inspectiontemplateActive) ? "active" : "inactive",
                  items : json
                  
              }
          }
  };

  let saveSuccess = false
    try {
      await CrudService.updateInspectionTemplates(templateToSave, id).then(response => {
        if (response.data) {
          /* navigate("/inspectiontemplate-management", {
            state: { value: true, text: "The Inspection Template was sucesfully created" },
          }); */
          setNotification({ value: true, color: "success", message: "Inspection Teamplate Updated Successfully" });
          saveSuccess = true;
        }
      });
    } catch (err) {
      if (err.hasOwnProperty("errors")) {
        setError({ ...error, error: true, textError: err.message });
      }
    }

    return saveSuccess;

  };




  const fetchInstpectionTemplate = async () => {
    try {
      const res = await CrudService.getInspectionTemplate(id);
      setInspectionTemplateActive(res.data.attributes.status === "active" ? true : false)
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
      
     

      
      setLicenseKey(
        "NzMyNjcyZDctM2RlNC00ZTU3LTkzODctMThhMzcyYTU5MWUyOzE9MjAyNS0wNS0xNSwyPTIwMjUtMDUtMTUsND0yMDI1LTA1LTE1"
      );
      const creator = new SurveyCreator({ showLogicTab: true });
      creator.isAutoSave = false;
      creator.JSON = res.data.attributes.items[0];
      creator.haveCommercialLicense = true;
      //setJsonSurveyData(res.data[0].attributes.items[0]);
      // Enable auto save
      setCreator(creator);
      setDataLoaded(true);

    } catch (err) {
      console.error(err);
    }
  
  };


  useEffect(() => {
    if (!id) return () => {};

    fetchInstpectionTemplate();
  
  }, [id]);


  const changeHandler = (e) => {
    setInspectionTemplate({
      ...inspectiontemplate,
      [e.target.name]: e.target.value,
    });
  };


  const changeInspectionTemplateActiveHandler = (e) => {
    setInspectionTemplateActive(e.target.checked);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    creator.saveSurveyFunc();

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
                  Edit Inspection Template
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
                          navigate("/inspectiontemplate-management", {
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
                <MDBox display="flex" flexDirection="column" px={3} my={2} sx={{ flexGrow: 100 }}>
                  <MDBox p={1}>
                    <FormField
                      type="text"
                      label="Name"
                      name="name"
                      value={inspectiontemplate.name}
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
                    <Switch name="inspectiontemplateActive" checked={inspectiontemplateActive} onChange={changeInspectionTemplateActiveHandler} />
                    </MDBox>
                    <MDBox width="80%" ml={0.5}>
                      <MDTypography variant="button" fontWeight="regular" color="text">
                        Active Inspection Template?
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                 
                 
                </MDBox>
              </MDBox>
              <MDBox height="800px" >
                  {dataLoaded &&   
                    <SurveyCreatorWidget id={inspectiontemplate.id}></SurveyCreatorWidget>}
                  {/*   */}
                  {/* <SurveyCreatorWidget id={inspectiontemplate.id}></SurveyCreatorWidget> */}
              </MDBox>
         </Card>
      </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );``
};

export default EditInspectionTemplate;

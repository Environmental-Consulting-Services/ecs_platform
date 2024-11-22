 

import { useEffect, useState } from "react";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDEditor from "components/MDEditor";
import DataTable from "examples/Tables/DataTable";
import { Tooltip, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";



import Switch from "@mui/material/Switch";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import FormField from "layouts/applications/wizard/components/FormField";
import { useNavigate, useParams } from "react-router-dom";
import MDInput from "components/MDInput";
import MDAlert from "components/MDAlert";
import CrudService from "services/cruds-service";
import { AbilityContext } from "Can";
import { useAbility } from "@casl/react";
import { set } from "date-fns";

const EditProjectKeyPair = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const ability = useAbility(AbilityContext);
  const [image, setImage] = useState("");
  const [fileState, setFileState] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [notification, setNotification] = useState({ value: false, color: "info", message: "" });
  const [siteMapId, setSiteMapId] = useState(null);
  const [siteMapImage, setSiteMapImage] = useState();
  const [isSaveDisabled, setSaveDisabled] = useState(true);
  const [data, setData] = useState([]);
  const [tableData, setTableData] = useState([]);
  //const [tableData, setTableData] = useState([{keys: ""}]);

  const [oldSiteMaps, setOldSiteMaps] = useState([]);
  const [oldSiteMapImages, setOldSiteMapImages] = useState([]);

  // Phu's edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ Key: "", Value: "" });

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    setTableData([...tableData, formData]);
    setIsFormOpen(false);
  };

  ////////////////////////////////////////////////////////

  const [project, setProject] = useState({
    name: "",
    status: "",
    street_one: "",
    street_two: "",
    city: "",
    state: "",
    zip_code: "",
    site_map:{},
    previous_site_maps: [],
  });

 
  const [value, setValue] = useState("");

  const [error, setError] = useState({
    //name: false,
    error: false,
    textError: "",
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await CrudService.getProject(id);
        
        let project = {
          id: res.data.id,
          name: res.data.attributes.name,
          status: res.data.attributes.status,
          street_one: res.data.attributes.address.street_one,
          street_two: res.data.attributes.address.street_two,
          city: res.data.attributes.address.city,
          state: res.data.attributes.address.state,
          zip_code: res.data.attributes.address.zip_code,
          owner: res.data.attributes.owner,
          site_map: res.data.attributes.site_maps[0].site_map,
          previous_site_maps: res.data.attributes.site_maps.slice(1),
        };
        
        setProject(project);

      } catch (err) {
        console.error(err);
      }
    })();
  }, []);



/* 
  useEffect(() => {
    async function getRowData(rowInput) {
      let rowData = await getRows(rowInput);
      setTableData(rowData);
    }
    
    getRowData(keys);
    
  }, [keys]);
 */



  useEffect(() => {
    if (notification.value === true) {
      let timer = setTimeout(() => {
        setNotification({ value: false, color: "info", message: "" });
      }, 5000);
    }
  }, [notification]);

  const convertBlobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });

/* 
  const getRows = async (info) => {
    let updatedInfo = [];
    
     if(info){

        updatedInfo = await info.map(async (row) => {
          
          
          var rowData = await fetchImage(row.site_map)
          .then((imageData) => {
             return {
              type: "projects",
              site_map_data: "food",
            }
          })
          .catch((err) => {
            return {
              site_map_data: "no image loaded",
            }
          });

          return rowData;



      });
    }
    return updatedInfo;
  };

 */

const dataTableData = {
      columns: [
        { Header: "Key", accessor: "key", width: "25%" },
        { Header: "Value", accessor: "value", width: "25%" },
        { Header: "Updated Date", accessor: "date", width: "25%" },
        { Header: "Updated By", accessor: "user", width: "25%" },
      ],
  
      rows: tableData
    };







  const disableSaveButton = () => {
    setSaveDisabled(true);
};

const enableSaveButton = () => {
  setSaveDisabled(false);
  
};


  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      console.log( fileState.get("file")  );
      await CrudService.imageUpload(fileState, id).then(async (res) => {
        let projectData = {
          data: {
            type: "project",
            id: project.id,
            attributes: {
              site_maps: [{ site_map: res.data[0].attributes.id }],
            },
          },
        };
        const response = await CrudService.updateProjectSiteMap(projectData, project.id);
      });
      setNotification({ value: true, color: "success", message: "Site Map Updated Successfully" });
    } catch (err) {
      setError(err.message);
      return null;
    }
    setError(null);
    disableSaveButton();

  };

  const handleImagePreview = (e) => {
    let image_as_base64 = URL.createObjectURL(e.target.files[0])
    let image_as_files = e.target.files[0];
    setSiteMapImage(image_as_base64);
        //image_file: image_as_files,
}


  const changeHandler = (e) => {
    handleImagePreview(e);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    setFileState(formData);
    console.log(formData.get("file"));
    setImageUrl(URL.createObjectURL(e.target.files[0]));
    setImage(e.target.files[0]);
    enableSaveButton();
  };

  return (
    <DashboardLayout>
      <DashboardNavbar breadcrumbTitle={project.name}/>
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
            {notification.value === true && (
              <MDAlert color={notification.color} mt="20px">
                <MDTypography variant="body2" color="white">
                  {notification.message}
                </MDTypography>
              </MDAlert>
            )}
            <Card id="sitemap">
              <MDBox p={2} component="form" onSubmit={submitHandler} encType="multipart/form-data">
                <Grid
                  container
                  spacing={3}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  marginTop="0"
                  marginLeft="0"
                  width="100%"
                >
                  <Grid item position="relative" style={{ paddingLeft: "0", paddingTop: "0" }}>
                    {/* <MDAvatar src={imageUrl ?? image} alt="profile-image" size="xl" shadow="sm" /> */}
                  </Grid>
                  <MDInput
                    type="file"
                    onChange={changeHandler}
                    id="avatar"
                    name="attachment"
                    accept="image/*"
                    sx={{ display: "none", cursor: "pointer" }}
                  ></MDInput>
                  <MDBox sx={{ ml: "auto" }} display="flex" flexDirection="column">
                    <MDBox display="flex" justifyContent="flex-end" flexDirection="row">
                    </MDBox>
                    <MDButton variant="gradient" color="dark" size="small" type="submit" 
                       onClick={() =>
                        navigate(`/project-management/edit-project/${id}`, {state: { value: false, text: "" },})}>
                        back
                      </MDButton>
                  </MDBox>
                </Grid>
                <MDButton
                  variant="gradient"
                  color="dark"
                  size="small"
                  type="submit"
                  onClick={handleOpenForm}
                >
                  + Add Key Pair
                </MDButton>
                {isFormOpen && (
        <div style={{ marginTop: "10px" }}>
          <form>
            <Grid container direction="column" spacing={2}>
              <Grid item>
            <MDTypography variant="body2" fontWeight ="bold">
                Key:
                <MDInput
                  lable="Type your key"
                  name="key"
                  type = "string"
                  value={formData.key}
                  onChange={handleChange}
                  size="small"
                  style={{ marginLeft: "20px" }}

                />
              </MDTypography>
              </Grid>
              <Grid item>
                <MDTypography variant="body2" fontWeight ="bold">
                  Value:
                  <MDInput
                    lable="Type the value of key"
                    type = "string"
                    name="value"
                    value={formData.value}
                    onChange={handleChange}
                    size="small"
                    style={{ marginLeft: "5px" }}

                />
              </MDTypography>
              </Grid>
              <Grid item>
            <MDButton
             variant="gradient"
             color="dark"
             size="small"
             type="submit"
             onClick={handleSave}>
              Save
            </MDButton>
            <MDButton
            style={{ marginLeft: "5px" }}
             variant="gradient"
             color="dark"
             size="small"
             type="cancel"
             onClick={handleCloseForm}>
              Cancel
            </MDButton>
            </Grid>
            </Grid>
          </form>
        </div>
      )}
              </MDBox>
                 <DataTable table={dataTableData} />
                 
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default EditProjectKeyPair;

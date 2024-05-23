 

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

const EditProjectSiteMap = () => {
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
  const [tableData, setTableData] = useState([{site_map_data: ""}]);
  const [oldSiteMaps, setOldSiteMaps] = useState([]);
  const [oldSiteMapImages, setOldSiteMapImages] = useState([]);

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


  /* // Get User Roles
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
  }, []); */

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


        let siteMapId = "";

        if (project != null && project.site_map != null && project.site_map.length > 0){
          siteMapId = project.site_map;
        } 
        setSiteMapId(siteMapId);
    
        let oldSiteMaps = [];
        if (project != null && project.previous_site_maps != null && project.previous_site_maps.length > 0){
          oldSiteMaps = project.previous_site_maps;
        } 
        setOldSiteMaps(oldSiteMaps); 
        
        setProject(project);

      } catch (err) {
        console.error(err);
      }
    })();
  }, []);


  useEffect(() => {
    fetchSiteMapImage();
  }, [siteMapId]);


  useEffect(() => {
    fetchOldSiteMapImages();
  }, [oldSiteMaps]);



/* 
  useEffect(() => {
    async function getRowData(rowInput) {
      let rowData = await getRows(rowInput);
      setTableData(rowData);
    }
    
    getRowData(oldSiteMaps);
    
  }, [oldSiteMaps]);
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

  const fetchSiteMapImage = async () => {
    if(siteMapId != null) {
      const res = await CrudService.imageDownloadBase64(siteMapId);
      setSiteMapImage("data:image/png;base64," + res);
    } else {
      setSiteMapImage(null);
    }
  };


  const fetchOldSiteMapImages = async () => {
    if(oldSiteMaps != null && oldSiteMaps.length > 0) {
      oldSiteMaps.map(async (siteMap) => {
        try{
        const res = await CrudService.imageDownloadBase64(siteMap.site_map);
        setOldSiteMapImages(oldSiteMapImages => [...oldSiteMapImages, {site_map_id: siteMap.site_map, site_map_data: <img height={100} width={"auto"} src={"data:image/png;base64," + res}/> }]);
        //console.log(res.status);
        } catch (err) {
       
        }
      });
      //setSiteMapImage("data:image/png;base64," + res);

    } else {
      setOldSiteMapImages([]);
    }


  };






/* 
  const fetchImage = async (id) => {
    if(id != null) {
      const res = await CrudService.imageDownloadBase64(id);
      return "data:image/png;base64," + res;
    } else {
      return null;
    }
  }; */


  function SiteMapImage({image}) {
   {
      if(image != null){
        return (
          <>
            <img src={image} alt="icons" width={400} />
          </>);
      } else {
        return (
          <>
            <MDTypography variant="h6" color="textSecondary" fontWeight="light">
              No Site Map
            </MDTypography>
          </>
        );
      }
    }
  }

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
        { Header: "Site Map", accessor: "site_map_data", width: "25%" },
        /* {
          Header: "actions",
          disableSortBy: true,
          accessor: "",
          Cell: (info) => {
            return (
              <MDBox display="flex" alignItems="center">
                {ability.can("delete", "projects") && (
                  <Tooltip title="Delete Project">
                    <IconButton
                      size="large">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {ability.can("edit", "projects") && (
                  <Tooltip title="Edit Project">
                    <IconButton  size="large">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </MDBox>
            );
          },
        }, */
      ],
  
      rows: oldSiteMapImages
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
                  Edit Project Site Map
                </MDTypography>
              </MDBox>
              <MDTypography variant="h5" fontWeight="regular" color="secondary">
                The Site Map used for this project.
              </MDTypography>
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
                    <SiteMapImage image={siteMapImage} />
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
                      <MDButton
                        variant="gradient"
                        color="info"
                        size="small"
                        component="label"
                        htmlFor="avatar"
                        sx={{ marginRight: "1rem" }}
                      >
                        change
                      </MDButton>
                      <MDButton variant="gradient" color="info" size="small" type="submit"  disabled={isSaveDisabled} >
                        save
                      </MDButton>
                    </MDBox>
                    <MDButton variant="gradient" color="dark" size="small" type="submit" 
                       onClick={() =>
                        navigate(`/project-management/edit-project/${id}`, {state: { value: false, text: "" },})}>
                        back
                      </MDButton>
                  </MDBox>
                </Grid>
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

export default EditProjectSiteMap;

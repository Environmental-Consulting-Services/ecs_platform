 

import { useEffect, useState, useContext } from "react";

// react-router-dom components
import { useLocation, NavLink } from "react-router-dom";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @mui material components
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";

import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';


import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';


// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 PRO React examples
import SidenavCollapse from "examples/Sidenav/SidenavCollapse";
import SidenavList from "examples/Sidenav/SidenavList";
import SidenavItem from "examples/Sidenav/SidenavItem";

// Custom styles for the Sidenav
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";
import CrudService from "../../services/cruds-service";

// Material Dashboard 2 PRO React context
import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
  AuthContext,
} from "context";

import AuthService from "services/auth-service";
import { Can } from "Can";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const authContext = useContext(AuthContext);

  const [openCollapse, setOpenCollapse] = useState(false);
  const [openNestedCollapse, setOpenNestedCollapse] = useState(false);
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } = controller;
  const location = useLocation();
  const { pathname } = location;
  const collapseName = pathname.split("/").slice(1)[0];
  const items = pathname.split("/").slice(1);
  const itemParentName = items[1];
  const itemName = items[items.length - 1];
  const [activeCompany, setActiveCompany] = useState("none");
  const [data, setData] = useState([]);


  let textColor = "white";

  if (transparentSidenav || (whiteSidenav && !darkMode)) {
    textColor = "dark";
  } else if (whiteSidenav && darkMode) {
    textColor = "inherit";
  }

  const closeSidenav = () => setMiniSidenav(dispatch, true);



  useEffect(() => {
    (async () => {

      if(authContext.isAuthenticated) {
      const response = await CrudService.getCompanies();
      
      var companiesSelections = [{label:"None", value:"none"}];
      response.data.map((company) => {
        companiesSelections.push({ label: company.attributes.name, value: company.id });        
      } );
      setData(companiesSelections);
    }else{
      setData([]);
    }

    })();
  }, []);

  useEffect(() => {
    setOpenCollapse(collapseName);
    setOpenNestedCollapse(itemParentName);
  }, []);

  useEffect(() => {
    // A function that sets the mini state of the sidenav.
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
      setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
      setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
    }

    /** 
     The event listener that's calling the handleMiniSidenav function when resizing the window.
    */
    window.addEventListener("resize", handleMiniSidenav);

    // Call the handleMiniSidenav function to set the state with the initial value.
    handleMiniSidenav();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, location]);

  const handleLogOut = async () => {
    try {
      await AuthService.logout();
      authContext.logout();
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleCompanySelect = (event) => {
    try {
      authContext.setActiveCompany(event.target.value);
      setActiveCompany(event.target.value);
    } catch (err) {
      console.error(err);
      return null;
    }
  };



  // Render all the nested collapse items from the routes.js
  const renderNestedCollapse = (collapse) => {
    const template = collapse.map(({ name, route, key, href }) =>
      href ? (
        <Link
          key={key}
          href={href}
          target="_blank"
          rel="noreferrer"
          sx={{ textDecoration: "none" }}
        >
          <SidenavItem name={name} nested />
        </Link>
      ) : (
        <NavLink to={route} key={key} sx={{ textDecoration: "none" }}>
          <SidenavItem name={name} active={route === pathname} nested />
        </NavLink>
      )
    );

    return template;
  };
  // Render the all the collpases from the routes.js
  const renderCollapse = (collapses) =>
    collapses.map(({ name, collapse, route, href, key, type }) => {
      let returnValue;
      if (collapse) {
        returnValue = (
          <SidenavItem
            key={key}
            color={color}
            name={name}
            active={key === itemParentName ? "isParent" : false}
            open={openNestedCollapse === key}
            onClick={({ currentTarget }) =>
              openNestedCollapse === key && currentTarget.classList.contains("MuiListItem-root")
                ? setOpenNestedCollapse(false)
                : setOpenNestedCollapse(key)
            }
          >
            {renderNestedCollapse(collapse)}
          </SidenavItem>
        );
      } else {
        if (name !== "Logout") {
          returnValue = href ? (
            type ? (
              <Can I="edit" this={type}>
                <Link
                  href={href}
                  key={key}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ textDecoration: "none" }}
                >
                  <SidenavItem color={color} name={name} active={key === itemName} />
                </Link>
              </Can>
            ) : (
              <Link
                href={href}
                key={key}
                target="_blank"
                rel="noreferrer"
                sx={{ textDecoration: "none" }}
              >
                <SidenavItem color={color} name={name} active={key === itemName} />
              </Link>
            )
          ) : type ? (
            <Can I="edit" a={type}>
              <NavLink to={route} key={key} sx={{ textDecoration: "none" }}>
                <SidenavItem color={color} name={name} active={key === itemName} />
              </NavLink>
            </Can>
          ) : (
            <NavLink to={route} key={key} sx={{ textDecoration: "none" }}>
              <SidenavItem color={color} name={name} active={key === itemName} />
            </NavLink>
          );
        } else {
          returnValue = (
            <MDBox>
              <MDButton
                fullWidth
                variant="gradient"
                color={color}
                type="button"
                onClick={handleLogOut}
              >
                Log Out
              </MDButton>
            </MDBox>
          );
        }
      }
      return <SidenavList key={key}>{returnValue}</SidenavList>;
    });

  // Render all the routes from the routes.js (All the visible items on the Sidenav)
  const renderRoutes = routes.map(
    ({ type, name, icon, title, collapse, noCollapse, key, href, route }) => {
      let returnValue;

      if (type === "collapse") {
        if (href) {
          returnValue = (
            <Link
              href={href}
              key={key}
              target="_blank"
              rel="noreferrer"
              sx={{ textDecoration: "none" }}
            >
              <SidenavCollapse
                name={name}
                icon={icon}
                active={key === collapseName}
                noCollapse={noCollapse}
              />
            </Link>
          );
        } else if (noCollapse && route) {
          returnValue = (
            <NavLink to={route} key={key}>
              <SidenavCollapse
                name={name}
                icon={icon}
                noCollapse={noCollapse}
                active={key === collapseName}
              >
                {collapse ? renderCollapse(collapse) : null}
              </SidenavCollapse>
            </NavLink>
          );
        } else {
          returnValue = (
            <SidenavCollapse
              key={key}
              name={name}
              icon={icon}
              active={key === collapseName}
              open={openCollapse === key}
              onClick={() => (openCollapse === key ? setOpenCollapse(false) : setOpenCollapse(key))}
            >
              {collapse ? renderCollapse(collapse) : null}
            </SidenavCollapse>
          );
        }
      } else if (type === "title") {
        returnValue = (
          <MDTypography
            key={key}
            color={textColor}
            display="block"
            variant="caption"
            fontWeight="bold"
            textTransform="uppercase"
            pl={3}
            mt={2}
            mb={1}
            ml={1}
          >
            {title}
          </MDTypography>
        );
      } else if (type === "divider") {
        returnValue = (
          <Divider
            key={key}
            light={
              (!darkMode && !whiteSidenav && !transparentSidenav) ||
              (darkMode && !transparentSidenav && whiteSidenav)
            }
          />
        );
      }

      return returnValue;
    }
  );

  /* renderRoutes.unshift(
   
    <SidenavCollapse
      name="logout"
      icon="logout"
      noCollapse={true}
      active={true}
      key="logout"
      onClick={handleLogOut}
      color={color}
    >
      Logout
    </SidenavCollapse>
  ); */
  
  renderRoutes.unshift(
    <MDBox key="companyselect" ml={1} mt={1} mb={1}>  
    <Autocomplete
      key="companyselect"
      disablePortal
      id="combo-box-demo"
      options={data}
      sx={{ width: 240 }}
      onChange={handleCompanySelect}
      renderInput={(params) => <TextField {...params} label="Company" />}
    />
    </MDBox>

);
/* 

    <MDBox key="companyselect" display="flex" alignItems="center" sx={{ minWidth: "100%", height: 100 }}>
          
    <FormControl key="companySelect" variant="outlined" fullWidth>
      <InputLabel id="company-select-outlined-label">Company</InputLabel>
      <Select 
        labelId="company-select-outlined-label"
        id="company-select-outlined"
        value={activeCompany}
        onChange={handleCompanySelect}
        label="Company"
      >
        <MenuItem value="None">
          <em>None</em>
        </MenuItem>
        <MenuItem value={10}>Company A</MenuItem>
        <MenuItem value={20}>Company B</MenuItem>
        <MenuItem value={30}>Company C</MenuItem>
      </Select>
    </FormControl>
  </MDBox> */


  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode }}
    >
      <MDBox pt={3} pb={1} px={4} textAlign="center">
        <MDBox
          display={{ xs: "block", xl: "none" }}
          position="absolute"
          top={0}
          right={0}
          p={1.625}
          onClick={closeSidenav}
          sx={{ cursor: "pointer" }}
        >
          <MDTypography variant="h3" color="secondary">
            <Icon sx={{ fontWeight: "bold" }}>close</Icon>
          </MDTypography>
        </MDBox>
        <MDBox component={NavLink} to="/" display="flex" alignItems="center">
          {brand && <MDBox component="img" src={brand} alt="Brand" width="2rem" />}
          <MDBox
            width={!brandName && "100%"}
            sx={(theme) => sidenavLogoLabel(theme, { miniSidenav })}
          >
            <MDTypography component="h6" variant="button" fontWeight="medium" color={textColor} >
              {brandName}
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>
      <Divider
        light={
          (!darkMode && !whiteSidenav && !transparentSidenav) ||
          (darkMode && !transparentSidenav && whiteSidenav)
        }
      />
      <List>{renderRoutes}</List>
    </SidenavRoot>
  );
}

// Setting default values for the props of Sidenav
Sidenav.defaultProps = {
  color: "info",
  brand: "",
};

// Typechecking props for the Sidenav
Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;

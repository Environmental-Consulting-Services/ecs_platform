
import { useState, useEffect, useMemo, useContext } from "react";

// react-router components
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import { setupAxiosInterceptors } from "services/interceptor";

// @mui material components
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Icon from "@mui/material/Icon";
import MDAvatar from "components/MDAvatar";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";

// Material Dashboard 2 PRO React examples
import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";

// Material Dashboard 2 PRO React themes
import theme from "assets/theme";
import themeRTL from "assets/theme/theme-rtl";

// Material Dashboard 2 PRO React Dark Mode themes
import themeDark from "assets/theme-dark";
/* import themeDarkRTL from "assets/theme-dark/theme-rtl";
 */
// RTL plugins
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

// Material Dashboard 2 PRO React routes
import routes from "routes";
import crudRoutes from "crud.routes";
import pageRoutes from "page.routes";


// Material Dashboard 2 PRO React contexts
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator, AuthContext } from "context";

import { getPermissions } from "config/Permissions";

// Images
import brandWhite from "assets/images/logocircuitdrop.webp";
import brandDark from "assets/images/logocircuitdrop.webp";
import ProtectedRoute from "examples/ProtectedRoute";
import Login from "auth/login";
import Register from "auth/register";
import ForgotPassword from "auth/forgot-password";
import ResetPassword from "auth/reset-password";
import AuthService from "services/auth-service";
import { Helmet } from "react-helmet";

export default function App({ ability }) {
  const [controller, dispatch] = useMaterialUIController();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const { pathname } = useLocation();

  const authContext = useContext(AuthContext);
  const [userDetails, setUserDetails] = useState({ name: "", image: "" });

  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setIsDemo(window._env_.REACT_APP_IS_DEMO === "false");
  }, []);

  // if the token expired or other errors it logs out and goes to the login page
  const navigate = useNavigate();
  
  setupAxiosInterceptors(() => {
    authContext.logout();
    navigate("/auth/login");
  });

  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
      prepend: true,
    });

    setRtlCache(cacheRtl);
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  useEffect(() => {
    if (!authContext.isAuthenticated) return;
    (async () => {
      const id = await authContext.getCurrentUser();
      const response = await AuthService.getProfile();
      setUserDetails({
        name: response.data.attributes.name,
        image: response.data.attributes.profile_image,
      });
      const rules = await getPermissions(id);
      ability.update(rules);
    })();
  }, [authContext.isAuthenticated]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.key === "user-name") {
        route.name = userDetails.name;
        route.icon = <MDAvatar src={userDetails.image} alt={userDetails.name} size="sm" />;
      }
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if (route.route) {
        return (
          <Route
            exact
            path={route.route}
            element={
              <ProtectedRoute isAuthenticated={authContext.isAuthenticated}>
                {route.component}
              </ProtectedRoute>
            }
            key={route.key}
          />
        );
      }

      return null;
    });

  const getCrudRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getCrudRoutes(route.collapse);
      }
      if (route.route) {
        return (
          <Route
            exact
            path={route.route}
            element={
              <ProtectedRoute isAuthenticated={authContext.isAuthenticated}>
                {route.component}
              </ProtectedRoute>
            }
            key={route.key}
          />
        );
      }

      return null;
    });


    const getPageRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) {
        return getPageRoutes(route.collapse);
      }
      if (route.route) {
        return (
          <Route
            exact
            path={route.route}
            element={
              <ProtectedRoute isAuthenticated={authContext.isAuthenticated}>
                {route.component}
              </ProtectedRoute>
            }
            key={route.key}
          />
        );
      }

      return null;
    });






  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  return <>

    
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={darkMode ? themeDark : theme}>
          <CssBaseline />
          {layout === "dashboard" && (
            <>
              <Sidenav
                color={sidenavColor}
                brand={(transparentSidenav && !darkMode) || whiteSidenav ? brandDark : brandWhite}
                brandName="ECSD"
                routes={routes}
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
              />
              <Configurator />
              {configsButton}
            </>
          )}
          {layout === "vr" && <Configurator />}
          <Routes>
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            {getRoutes(routes)}
            {getCrudRoutes(crudRoutes)}
            {getPageRoutes(pageRoutes)}
            {/* default route */}
            {/* <Route path="*" element={<Navigate to="/dashboards/landing" />} /> */}
            <Route path="*" element={<Navigate to="/company-management" />} />
          
          </Routes>
        </ThemeProvider>
      </StyledEngineProvider>
    
  </>;
}

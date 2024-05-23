
/** 
  All of the routes for the Material Dashboard 2 PRO React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that contains other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Material Dashboard 2 PRO React layouts
import Analytics from "layouts/dashboards/analytics";
import Landing from "layouts/dashboards/landing";

import Sales from "layouts/dashboards/sales";
import ProfileOverview from "layouts/pages/profile/profile-overview";
import AllProjects from "layouts/pages/profile/all-projects";
import NewUser from "layouts/pages/users/new-user";
import Settings from "layouts/pages/account/settings";
import Billing from "layouts/pages/account/billing";
import Invoice from "layouts/pages/account/invoice";
import Timeline from "layouts/pages/projects/timeline";
import PricingPage from "layouts/pages/pricing-page";
import Widgets from "layouts/pages/widgets";
import RTL from "layouts/pages/rtl";
import Charts from "layouts/pages/charts";
import Notifications from "layouts/pages/notifications";
import Wizard from "layouts/applications/wizard";
import DataTables from "layouts/applications/data-tables";
import Calendar from "layouts/applications/calendar";
//import NewProduct from "layouts/ecommerce/products/new-product";
//import EditProduct from "layouts/ecommerce/products/edit-product";
//import ProductPage from "layouts/ecommerce/products/product-page";
import OrderList from "layouts/ecommerce/orders/order-list";
import OrderDetails from "layouts/ecommerce/orders/order-details";
import SignInBasic from "layouts/authentication/sign-in/basic";
import SignInCover from "layouts/authentication/sign-in/cover";
import SignInIllustration from "layouts/authentication/sign-in/illustration";
import SignUpCover from "layouts/authentication/sign-up/cover";
import ResetCover from "layouts/authentication/reset-password/cover";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faNode } from "@fortawesome/free-brands-svg-icons";

import UserProfile from "cruds/user-profile";
import RoleManagement from "cruds/role-managament";
/* import CategoryManagement from "cruds/category-management"*/
import CompanyManagement from "cruds/company-management";
import ProjectManagement from "cruds/project-management";
/* import TagManagement from "cruds/tag-management";*/
import UserManagement from "cruds/user-management";
/* import ItemManagement from "cruds/item-management";*/
import InspectionManagement from "cruds/inspection-management";
// Material Dashboard 2 PRO React components
import MDAvatar from "components/MDAvatar";

// @mui icons
import Icon from "@mui/material/Icon";

// Images
import profilePicture from "assets/images/team-3.jpg";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import InspectionTemplateManagement from "cruds/inspectiontemplate-management";
import ActionItemManagement from "cruds/actionitem-management";

const routes = [
  /* {
    type: "collapse",
    name: "usename",
    key: "user-name",
    icon: <MDAvatar  alt="User Name" size="sm" />,
    collapse: [
      {
        name: "My Profile",
        key: "profile-overview",
        route: "/pages/profile/profile-overview",
        component: <ProfileOverview />,
      },
      {
        name: "Settings",
        key: "settings",
        route: "/pages/account/settings",
        component: <Settings />,
      },
      {
        name: "Logout",
        key: "logout",
      },
    ],
  },
  { type: "divider", key: "divider-0" }, */
  { type: "title", title: "Manage Compliance", key: "crud-pages" },
  /* {
    type: "collapse",
    name: "User Profile",
    key: "user-profile",
    title: "User Profile",
    route: "/user-profile",
    icon: <FontAwesomeIcon icon={faUser} size="sm" />,
    component: <UserProfile />,
    noCollapse: true,
  }, */
  
  {
    name: "Companies",
    title: "Companies",
    key: "company-management",
    route: "/company-management",
    component: <CompanyManagement />,
    icon: <FontAwesomeIcon icon={faUser} size="sm" />,
    type: "collapse",
    noCollapse: true,
  },
  {
    name: "Projects",
    key: "project-management",
    route: "/project-management",
    component: <ProjectManagement />,
    icon: <FontAwesomeIcon icon={faUser} size="sm" />,
    type: "collapse",
    noCollapse: true,
  },
  {
    name: "Users",
    key: "user-management",
    title: "User Management",
    route: "/user-management",
    component: <UserManagement />,
    icon: <FontAwesomeIcon icon={faUser} size="sm" />,
    type: "collapse",
    noCollapse: true,
  },
  {
    name: "Inspections",
    title: "Inspections",
    key: "inspection-management",
    route: "/inspection-management",
    component: <InspectionManagement />,
    icon: <FontAwesomeIcon icon={faUser} size="sm" />,
    type: "collapse",
    noCollapse: true,
  },
  {
    name: "Action Items",
    title: "Action Items",
    key: "actionitem-management",
    route: "/actionitem-management",
    component: <ActionItemManagement />,
    icon: <FontAwesomeIcon icon={faUser} size="sm" />,
    type: "collapse",
    noCollapse: true,
  },
  {
    name: "Inspection Templates",
    title: "Inspection Templates",
    key: "inspectiontemplate-management",
    route: "/inspectiontemplate-management",
    component: <InspectionTemplateManagement />,
    icon: <FontAwesomeIcon icon={faUser} size="sm" />,
    type: "collapse",
    noCollapse: true,
  },
  
  /* 
  {
    type: "collapse",
    name: "Examples (API)",
    key: "react-nodejs",
    icon: <FontAwesomeIcon icon={faNode} size="sm" />,
    noCollapse: true,
    collapse: [
     
      {
        name: "Role Management",
        key: "role-management",
        route: "/role-management",
        component: <RoleManagement />,
        type: "roles",
      }, 
      {
        name: "Category Management",
        key: "category-management",
        route: "/category-management",
        component: <CategoryManagement />,
        type: "categories",
      },
      {
        name: "Companies",
        key: "company-management",
        route: "/company-management",
        component: <CompanyManagement />,
        type: "companies",
      },
      {
        name: "Tag Management",
        key: "tag-management",
        route: "/tag-management",
        component: <TagManagement />,
        type: "tags",
      },
      {
        name: "Item Management",
        key: "item-management",
        route: "/item-management",
        component: <ItemManagement />,
        type: "items",
      }, 
    ],
  }, */
  /* 
  { type: "title", title: "Pages", key: "title-pages" },
  {
    type: "collapse",
    name: "Pages",
    key: "pages",
    icon: <Icon fontSize="medium">image</Icon>,
    collapse: [
      {
        name: "Profile",
        key: "profile",
        collapse: [
          {
            name: "Profile Overview",
            key: "profile-overview",
            route: "/pages/profile/profile-overview",
            component: <ProfileOverview />,
          },
          {
            name: "All Projects",
            key: "all-projects",
            route: "/pages/profile/all-projects",
            component: <AllProjects />,
          },
        ],
      },
      {
        name: "Users",
        key: "users",
        collapse: [
          {
            name: "New User",
            key: "new-user",
            route: "/pages/users/new-user",
            component: <NewUser />,
          },
        ],
      },
      {
        name: "Account",
        key: "account",
        collapse: [
          {
            name: "Settings",
            key: "settings",
            route: "/pages/account/settings",
            component: <Settings />,
          },
          {
            name: "Billing",
            key: "billing",
            route: "/pages/account/billing",
            component: <Billing />,
          },
          {
            name: "Invoice",
            key: "invoice",
            route: "/pages/account/invoice",
            component: <Invoice />,
          },
        ],
      },
      {
        name: "Projects",
        key: "projects",
        collapse: [
          {
            name: "Timeline",
            key: "timeline",
            route: "/pages/projects/timeline",
            component: <Timeline />,
          },
        ],
      },
      {
        name: "Pricing Page",
        key: "pricing-page",
        route: "/pages/pricing-page",
        component: <PricingPage />,
      },
      { name: "RTL", key: "rtl", route: "/pages/rtl", component: <RTL /> },
      { name: "Widgets", key: "widgets", route: "/pages/widgets", component: <Widgets /> },
      { name: "Charts", key: "charts", route: "/pages/charts", component: <Charts /> },
      {
        name: "Notfications",
        key: "notifications",
        route: "/pages/notifications",
        component: <Notifications />,
      },
    ],
  },
  {
    type: "collapse",
    name: "Applications",
    key: "applications",
    icon: <Icon fontSize="medium">apps</Icon>,
    collapse: [
      
      {
        name: "Wizard",
        key: "wizard",
        route: "/applications/wizard",
        component: <Wizard />,
      },
      {
        name: "Data Tables",
        key: "data-tables",
        route: "/applications/data-tables",
        component: <DataTables />,
      },
      {
        name: "Calendar",
        key: "calendar",
        route: "/applications/calendar",
        component: <Calendar />,
      },
    ],
  },
  {
    type: "collapse",
    name: "Ecommerce",
    key: "ecommerce",
    icon: <Icon fontSize="medium">shopping_basket</Icon>,
    collapse: [
      {
        name: "Products",
        key: "products",
        collapse: [
          {
            name: "New Product",
            key: "new-product",
            route: "/ecommerce/products/new-product",
            component: <NewProduct />,
          },
          {
            name: "Edit Product",
            key: "edit-product",
            route: "/ecommerce/products/edit-product",
            component: <EditProduct />,
          },
          {
            name: "Product Page",
            key: "product-page",
            route: "/ecommerce/products/product-page",
            component: <ProductPage />,
          },
        ],
      },
      {
        name: "Orders",
        key: "orders",
        collapse: [
          {
            name: "Order List",
            key: "order-list",
            route: "/ecommerce/orders/order-list",
            component: <OrderList />,
          },
          {
            name: "Order Details",
            key: "order-details",
            route: "/ecommerce/orders/order-details",
            component: <OrderDetails />,
          },
        ],
      },
    ],
  },
  {
    type: "collapse",
    name: "Authentication",
    key: "authentication",
    icon: <Icon fontSize="medium">content_paste</Icon>,
    collapse: [
      {
        name: "Sign In",
        key: "sign-in",
        collapse: [
          {
            name: "Basic",
            key: "basic",
            route: "/authentication/sign-in/basic",
            component: <SignInBasic />,
          },
          {
            name: "Cover",
            key: "cover",
            route: "/authentication/sign-in/cover",
            component: <SignInCover />,
          },
          {
            name: "Illustration",
            key: "illustration",
            route: "/authentication/sign-in/illustration",
            component: <SignInIllustration />,
          },
        ],
      },
      {
        name: "Sign Up",
        key: "sign-up",
        collapse: [
          {
            name: "Cover",
            key: "cover",
            route: "/authentication/sign-up/cover",
            component: <SignUpCover />,
          },
        ],
      },
      {
        name: "Reset Password",
        key: "reset-password",
        collapse: [
          {
            name: "Cover",
            key: "cover",
            route: "/authentication/reset-password/cover",
            component: <ResetCover />,
          },
        ],
      },
    ],
  }, */

 /*  { type: "divider", key: "divider-1" },
  { type: "title", title: "Dashboards", key: "dashboards" },
  {
    type: "collapse",
    name: "Compliance Landing",
    key: "landing",
    route: "/dashboards/landing",
    component: <Landing />,
    icon: <FontAwesomeIcon icon={faUser} size="sm" />,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Project Performnce",
    key: "sales",
    route: "/dashboards/sales",
    component: <Sales />,
    icon: <FontAwesomeIcon icon={faUser} size="sm" />,
    noCollapse: true,
  }, */
  /* {
    type: "collapse",
    name: "Dashboards",
    key: "dashboards",
    icon: <Icon fontSize="medium">dashboard</Icon>,
    collapse: [
      {
        name: "Company Performance",
        key: "analytics",
        route: "/dashboards/analytics",
        component: <Analytics />,
      },
      {
        name: "Project Performnce",
        key: "sales",
        route: "/dashboards/sales",
        component: <Sales />,
      },
    ],
  }, */
  { type: "divider", key: "divider-2" },
  {
    type: "collapse",
    name: "Docs",
    key: "docs",
    href: "http://docs.ecscompliance.com",
    icon: <Icon fontSize="medium">receipt_long</Icon>,
    noCollapse: true,
  },
  {
    type: "collapse",
    name: "Support",
    key: "support",
    href: "http://support.ecscompliance.com",
    icon: <Icon fontSize="medium">receipt_long</Icon>,
    noCollapse: true,
  },
];

export default routes;

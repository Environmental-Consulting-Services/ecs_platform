import HttpService from "./http.service";

class CrudService {
  // users requests
  imageUpload = async (formData, id) => {

    const imageUpdate = `public/images/upload`;
    return await HttpService.postFormData(imageUpdate, formData);
  };

  imageDownload = async (id) => {
    const imagepath = `public/images/files/${id}`;
    return await HttpService.get(imagepath);
  };

  imageDownloadBase64 = async (id) => {
    const imagepath = `public/images/files/${id}/base64`;
    return await HttpService.getblob(imagepath);
  };




  getUsers = async () => {
    const usersEndpoint = "users?include=roles";
    return await HttpService.get(usersEndpoint);
  };

  getUsersByID = async (IDs) => {
    let idFilter = "";
    if (IDs != null && IDs.length > 0) {
      IDs.map((id) => {
        if (id != null || id != "") {
          idFilter = idFilter + `filter[_id]=${id}&`;
          return `filter[_id]=${id}&`;
        }
      });
    }

    const usersEndpoint = `users?${idFilter}`;
    return await HttpService.get(usersEndpoint);
  };

  deleteUser = async (id) => {
    const endpoint = `users/${id}`;
    return await HttpService.delete(endpoint);
  };

  createUser = async (payload) => {
    const endpoint = "users";
    return await HttpService.post(endpoint, payload);
  };

  getUser = async (id) => {
    const endpoint = `users/${id}?include=roles`;
    return await HttpService.get(endpoint);
  };

  getUserWithPermissions = async (id) => {
    const endpoint = `users/${id}?include=roles,roles.permissions`;
    return await HttpService.get(endpoint);
  };

  updateUser = async (payload, id) => {
    const endpoint = `users/${id}`;
    return await HttpService.patch(endpoint, payload);
  };

  // roles requests
  getRoles = async () => {
    const rolesEndpoint = "roles";
    return await HttpService.get(rolesEndpoint);
  };

  deleteRole = async (id) => {
    const endpoint = `roles/${id}`;
    return await HttpService.delete(endpoint);
  };

  createRole = async (payload) => {
    const endpoint = "roles";
    return await HttpService.post(endpoint, payload);
  };

  updateRole = async (payload, id) => {
    const endpoint = `roles/${id}`;
    return await HttpService.patch(endpoint, payload);
  };

  getRole = async (id) => {
    const endpoint = `roles/${id}`;
    return await HttpService.get(endpoint);
  };

  // categories requests
  getCategories = async () => {
    const categoriesEndpoint = "categories";
    return await HttpService.get(categoriesEndpoint);
  };

  deleteCategory = async (id) => {
    const endpoint = `categories/${id}`;
    return await HttpService.delete(endpoint);
  };

  createCategory = async (payload) => {
    const endpoint = "categories";
    return await HttpService.post(endpoint, payload);
  };

  getCategory = async (id) => {
    const categoriesEndpoint = `categories/${id}`;
    return await HttpService.get(categoriesEndpoint);
  };

  updateCategory = async (payload, id) => {
    const categoriesEndpoint = `categories/${id}`;
    return await HttpService.patch(categoriesEndpoint, payload);
  };


  // company requests
  getCompanies = async () => {
    const companiesEndpoint = "companies";
    return await HttpService.get(companiesEndpoint);
  };

  deleteCompany = async (id) => {
    const endpoint = `companies/${id}`;
    return await HttpService.delete(endpoint);
  };

  createCompany = async (payload) => {
    const endpoint = "companies";
    return await HttpService.post(endpoint, payload);
  };

  getCompany = async (id) => {
    const companiesEndpoint = `companies/${id}`;
    return await HttpService.get(companiesEndpoint);
  };

  updateCompany = async (payload, id) => {
    const companiesEndpoint = `companies/${id}`;
    return await HttpService.patch(companiesEndpoint, payload);
  };



  // project requests
  getProjects = async () => {
    const projectsEndpoint = "projects";
    return await HttpService.get(projectsEndpoint);
  };

  deleteProject = async (id) => {
    const endpoint = `projects/${id}`;
    return await HttpService.delete(endpoint);
  };

  createProject = async (payload) => {
    const endpoint = "projects";
    return await HttpService.post(endpoint, payload);
  };

  getProject = async (id) => {
    const projectsEndpoint = `projects/${id}`;
    return await HttpService.get(projectsEndpoint);
  };

  updateProject = async (payload, id) => {
    const projectsEndpoint = `projects/${id}`;
    return await HttpService.patch(projectsEndpoint, payload);
  };

  updateProjectSiteMap = async (payload, id) => {
    const projectsEndpoint = `projects/${id}/sitemaps`;
    return await HttpService.patch(projectsEndpoint, payload);
  };

  // project requests
  getProjectAssignees = async (id) => {
    const projectsEndpoint = `projects/${id}/people`;
    return await HttpService.get(projectsEndpoint);
  };

  // project requests
  getInspections = async () => {
    const inspectionsEndpoint = "inspections";
    return await HttpService.get(inspectionsEndpoint);
  };

  deleteInspection = async (id) => {
    const endpoint = `inspections/${id}`;
    return await HttpService.delete(endpoint);
  };

  createInspection = async (payload) => {
    const endpoint = "inpections";
    return await HttpService.post(endpoint, payload);
  };

  getInspection = async (id) => {
    const inspectionsEndpoint = `inspections/${id}`;
    return await HttpService.get(inspectionsEndpoint);
  };

  updateInspection = async (payload, id) => {
    const inspectionsEndpoint = `inspections/${id}`;
    return await HttpService.patch(inspectionsEndpoint, payload);
  };
  /* 
    updateProjectSiteMap = async (payload, id) => {
      const projectsEndpoint = `projects/${id}/sitemaps`;
      return await HttpService.patch(projectsEndpoint, payload);
    }; */


  // project requests
  getActionItems = async () => {
    const actionitemsEndpoint = "actionitems";
    return await HttpService.get(actionitemsEndpoint);
  };

  deleteActionItem = async (id) => {
    const endpoint = `actionitems/${id}`;
    return await HttpService.delete(endpoint);
  };

  createActionItem = async (payload) => {
    const endpoint = "actionitems";
    return await HttpService.post(endpoint, payload);
  };

  getActionItem = async (id) => {
    const actionitemsEndpoint = `actionitems/${id}`;
    return await HttpService.get(actionitemsEndpoint);
  };

  updateActionItem = async (payload, id) => {
    const actionitemsEndpoint = `actionitems/${id}`;
    return await HttpService.patch(actionitemsEndpoint, payload);
  };


  getActionItemNotes = async (id) => {
    const actionitemsEndpoint = `actionitems/${id}/notes`;
    return await HttpService.get(actionitemsEndpoint);
  };

  deleteActionItemNote = async (actionId, noteId) => {
    const endpoint = `actionitems/${actionId}/notes/${noteId}`;
    return await HttpService.delete(endpoint);
  };

  createActionItemNote = async (actionId, payload) => {
    const endpoint = `actionitems/${actionId}/notes`;
    return await HttpService.post(endpoint, payload);
  };








  // tag requests
  getTags = async () => {
    const tagsEndpoint = "tags";
    return await HttpService.get(tagsEndpoint);
  };

  deleteTag = async (id) => {
    const endpoint = `tags/${id}`;
    return await HttpService.delete(endpoint);
  };

  createTag = async (payload) => {
    const endpoint = "tags";
    return await HttpService.post(endpoint, payload);
  };

  getTag = async (id) => {
    const endpoint = `tags/${id}`;
    return await HttpService.get(endpoint);
  };

  updateTag = async (payload, id) => {
    const endpoint = `tags/${id}`;
    return await HttpService.patch(endpoint, payload);
  };

  // item requests
  getItems = async () => {
    const tagsEndpoint = "items";
    return await HttpService.get(tagsEndpoint);
  };

  deleteItem = async (id) => {
    const endpoint = `items/${id}`;
    return await HttpService.delete(endpoint);
  };

  getCategoryOfItem = async (id) => {
    const endpoint = `items/${id}/category`;
    return await HttpService.get(endpoint);
  };

  getTagsOfItem = async (id) => {
    const endpoint = `items/${id}/tags`;
    return await HttpService.get(endpoint);
  };

  createItem = async (payload) => {
    const endpoint = "items";
    return await HttpService.post(endpoint, payload);
  };

  itemImageUpload = async (formData, id) => {
    const imageUpdate = `uploads/items/${id}/image`;
    return await HttpService.post(imageUpdate, formData);
  };

  getItem = async (id) => {
    const endpoint = `items/${id}?include=category,tags`
    return await HttpService.get(endpoint);
  }

  updateItem = async (payload, id) => {
    const endpoint = `items/${id}`;
    return await HttpService.patch(endpoint, payload);
  };

  // company requests
  getMessages = async () => {
    const messagesEndpoint = "messages";
    return await HttpService.get(messagesEndpoint);
  };

  deleteMessage = async (id) => {
    const endpoint = `messages/${id}`;
    return await HttpService.delete(endpoint);
  };

  createMessage = async (payload) => {
    const endpoint = "messages";
    return await HttpService.post(endpoint, payload);
  };

  getMessage = async (id) => {
    const enpoint = `messages/${id}`;
    return await HttpService.get(enpoint);
  };

  updateMessage = async (payload, id) => {
    const endpoint = `messages/${id}`;
    return await HttpService.patch(endpoint, payload);
  };






  // project requests
  getInspectionTemplates = async () => {
    const projectsEndpoint = "inspectiontemplates";
    return await HttpService.get(projectsEndpoint);
  };

  deleteInspectionTemplates = async (id) => {
    const endpoint = `inspectiontemplates/${id}`;
    return await HttpService.delete(endpoint);
  };

  createInspectionTemplates = async (payload) => {
    const endpoint = "inspectiontemplates";
    return await HttpService.post(endpoint, payload);
  };

  getInspectionTemplate = async (id) => {
    const projectsEndpoint = `inspectiontemplates/${id}`;
    return await HttpService.get(projectsEndpoint);
  };

  updateInspectionTemplates = async (payload, id) => {
    const projectsEndpoint = `inspectiontemplates/${id}`;
    return await HttpService.patch(projectsEndpoint, payload);
  };


  // KEY PAIR

  getKeysByID = async (IDs) => {
    let idFilter = "";
    if (IDs != null && IDs.length > 0) {
      IDs.map((id) => {
        if (id != null || id != "") {
          idFilter = idFilter + `filter[project]=${id}`;
          return `filter[project]=${id}`;
        }
      });
    }

    const keypairsEndpoint = `keypairs?${idFilter}`;
    return await HttpService.get(keypairsEndpoint);
  };

  getKeys = async () => {
    const keysEndpoint = `keypairs`;
    return await HttpService.get(keysEndpoint);
  };


  createKey = async (payload) => {
    const keysEndpoint = `keypairs`;
    return await HttpService.post(keysEndpoint, payload);
  };

  editKeys = async (payload, key) => {
    const keysEndpoint = `keypairs/${key}`;
    return await HttpService.patch(keysEndpoint, payload);
  };

  deleteKey = async (key) => {
    const keysEndpoint = `keypairs/${key}`;
    return await HttpService.delete(keysEndpoint);
  };



}

export default new CrudService();

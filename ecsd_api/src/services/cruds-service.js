import HttpService from "./http.service";

class CrudService {
  // users requests
  sendMail = async (formData, id) => {
    const sendMail = `send-email`;
    return await HttpService.postFormData(sendMail, formData);
  };
}

export default new CrudService();

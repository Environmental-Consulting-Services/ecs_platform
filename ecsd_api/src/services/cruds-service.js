import HttpService from "./http.service";

class CrudService {
  // users requests
  sendMail = async (formData, id) => {
    console.log("Sending email to mail server");

    const sendMail = `send-email`;

    await HttpService.postFormData(sendMail, formData).then((response) => {
      console.log("Email sent: "+ response);
      return response;
    }).catch((error) => {
      console.log(error);
      return error;
    });
  }
}

export default new CrudService();

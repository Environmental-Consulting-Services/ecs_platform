
import randomToken from "random-token";
import bcrypt from "bcrypt";

async function test() {

    // hash password to save in db
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash("testsecret", salt);


    const company = {
        data: {
            type: "companies",
            attributes: {
                name: "TestCompany",
                status: "active",
                address: {
                    street_one: "123 Test St.",
                    street_two: "test suite",
                    city: "Denver",
                    state: "CO",
                    zip_code: "80202",
                },
                owner: {
                    first_name: "TestUserFirst",
                    last_name: "TestUserLast",
                    type: "user",
                    email: "",
                    phone: "123456789",
                    password: hashPassword
                },
                primary_contact: {
                    first_name: "TestPersonFirst",
                    last_name: "TestPersonLast",
                    type: "person",
                    email: "",
                    password: hashPassword
                }
            },
        },
    };
    
    

    const testUser = { email: "admin@jsonapi.com",
                        password: "secret",};

    const myData = {data: {
            type: "token",
            attributes: {   ...testUser  }},};

    try {
      const response = await AuthService.login(myData);
      response.access_token, response.refresh_token
    } catch (res) {
        console.log(res);
        exit(1);
    }

    await CrudService.createCompany(company);


    console.log('Test');
}

export { test };
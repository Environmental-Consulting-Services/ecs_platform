import bcrypt from "bcrypt";



const salt  = (async() => {
    return await bcrypt.genSalt(10);
})

const hashPassword = (async() => {
    return await bcrypt.hash(makeString(8), salt);
})


const CreateCompany = {
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
        };



const TestUser = { email: "admin@jsonapi.com",
                    password: "secret",};

const MyData = {data: {
        type: "token",
        attributes: {   ...TestUser  }},};

const UpdateCompany = {
    data: {
        type: "companies",
        attributes: {
            name: "TestCompany-Updated",
            status: "active",
            address: {
                street_one: "123 Test St.",
                street_two: "test suite",
                city: "Denver",
                state: "CO",
                zip_code: "80202",
            },
            owner: {
                first_name: "TestUserFirst - U",
                last_name: "TestUserLast - U",
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

exports = {
    CreateCompany,
    TestUser,
    MyData,
    UpdateCompany
}
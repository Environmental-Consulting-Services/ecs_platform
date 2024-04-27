import { CompanyModel } from "../../schemas/company.schema";
import { AddressModel } from "../../schemas/address.schema";
import { UserModel } from "../../schemas/user.schema";
import eq from "lodash";

export const getCompaniesRoute = async (req, res) => {
  let companiesObjectArray = [];
  let jsonArrayCompanies = {};

  // pagination
  let paginationSize = null;
  let pageNumber = null;
  if (req.query.page) {
    if (req.query.page.number) {
      pageNumber = +req.query.page.number;
    }
    if (req.query.page.size) {
      paginationSize = +req.query.page.size;
    }
  }

  // filtering
  let filters = {};
  if (req.query.filter) {
    filters = req.query.filter;
  }

  // sorting
  let sortValue;
  if (req.query.sort) {
    sortValue = req.query.sort;
  }

  // choose fields
  let fieldsCompany;
  if (req.query.fields) {
    if (req.query.fields.categories) {
      fieldsCompany = req.query.fields.companies.split(",");
    }
  }

  //TODO: need to limit to companies a user can see....

  const allCompanies = await CompanyModel
    .find(filters)
    .select(fieldsCompany)
    .limit(paginationSize)
    .skip((pageNumber - 1) * paginationSize)
    .sort(sortValue);

  companiesObjectArray = allCompanies.map((element) => {
    let jsonObj = {
      type: "companies",
      id: element.id,
      attributes: {
        ...element._doc,
      },
    };
    return (jsonArrayCompanies = { ...jsonArrayCompanies, ...jsonObj });
  });

  const sentData = { data: [...companiesObjectArray] };
  return res.status(200).send(sentData);
};

export const getCompanyRoute = async (req, res) => {
  const companyId = req.params.id;

  let fieldsCompany;
  if (req.query.fields) {
    if (req.query.fields.companies) {
      fieldsCompany = req.query.fields.companies.split(",");
    }
  }

  const foundCompany = await CompanyModel.findOne({ _id: companyId }).select(fieldsCompany);
  if (!foundCompany) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The company can not be found" }] });
  }

  const sentData = {
    data: {
      type: "companies",
      id: foundCompany.id,
      attributes: {
        ...foundCompany._doc,
      },
    },
  };
  return res.status(200).send(sentData);
};

export const createCompanyRoute = async (req, res) => {
    
  const {  name,
    status,
    address,
    owner ,
    primary_contact} = req.body.data.attributes;

 
  if (!name) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The name is required" }] });
  }

  /* const existingCompany = await companyModel.findOne({ name: name });
  if (existingCompany) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The copmany already exists" }] });
  }
   */

  //Check Users Exist
  const ownerUser = await UserModel.findById(owner._id);
  if (!ownerUser) {
    return res
      .status(400) 
      .send({ errors: [{ detail: "The owner user does not exist" }] });
  }

  //Check Owner already has THIS company
  const existingCompany = await CompanyModel.findOne({ owner: owner._id , name: name });
  if (existingCompany) {
    return res
      .status(400) 
      .send({ errors: [{ detail: "The owner already has a company by this name" }] });
  }
  
  const newCompany = new CompanyModel({
    name: name,
    status:  "active",
    address: new AddressModel({
      street_one: address.street_one,
      street_two: address.street_two,
      city: address.city,
      state: address.state,
      zip_code: address.zip_code,
    }),
    owner: {_id: owner._id},
    //primary_contact: primary_contact, 
    //people: people.map(person => person._id),
    created_at: Date.now(),
    updated_at: Date.now(),
  });
  newCompany.save();
  const sentData = {
    data: {
      type: "companies",
      id: newCompany.id,
      attributes: {
        ...newCompany._doc
      },
    },
  };
  return res.status(201).send(sentData);
};

export const editCompanyRoute = async (req, res) => {
  const companyId = req.params.id;
  const {  name, status, address, owner, primary_contact, people,  } = req.body.data.attributes;

  const foundCompany = await CompanyModel.findById(companyId);
  if (!foundCompany) {
    return res
      .status(400)
      .json({ errors: [{ detail: "No copmany was found" }] });
  }
  if(!eq(foundCompany.owner._id, req.user._id)) {
    return res
    .status(401)
    .json({ errors: [{ detail: "Only owners can update the company" }] });
  }

 
 /*  const existingCopmaniesWithName = await CompanyModel.find({ name: name, _id: { $ne: companyId } });
  if (existingCopmaniesWithName.length > 0) {
    return res.status(400).send({
      errors: [{ detail: "Already exists a company with this name" }],
    });
  }
  */

  const newPrimaryContact = primary_contact !== null ? UserModel({id: primary_contact}): null;
  const updatedCompany = await CompanyModel.updateOne(
    { _id: companyId },
    {
      name : name, 
      status: status, 
      address: address, 
      owner : {_id: owner._id}, 
      primary_contact : newPrimaryContact,     
     //people: people.map(person => person._id),
      created_at: Date.now(),
      updated_at: Date.now(),
    }
  );

  const sentData = {
    data: {
      type: "companies",
      id: companyId,
      attributes: {
        ...updatedCompany._doc
      },
    },
  };
  return res.status(200).send(sentData);
};

export const deleteCompanyRoute = async (req, res) => {
  const toDeleteCompany = await CompanyModel.findOne({ _id: req.params.id});

  if (!toDeleteCompany || String(toDeleteCompany.owner._id) != String(req.user._id)) {
    return res
      .status(400)
      .send({ errors: [{ detail: "The company does not exist" }] });
  }

  try {
    await CompanyModel.deleteOne({_id: toDeleteCompany._id });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
  }
};

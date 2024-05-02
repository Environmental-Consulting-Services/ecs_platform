import 'package:ecsd_mobile/model/company_model.dart';
import 'package:ecsd_mobile/screens/projects-list.dart';
import 'package:ecsd_mobile/services/company_service.dart';
import 'package:flutter/material.dart';
import 'package:ecsd_mobile/constants/Theme.dart';
import 'package:ecsd_mobile/widgets/navbars/navbar.dart';
import 'package:ecsd_mobile/widgets/drawer.dart';

class Companies extends StatefulWidget {
  // final GlobalKey _scaffoldKey = new GlobalKey();
//final double height = window.physicalSize.height;
  final String companyId;

  static Route<void> route() {
    return MaterialPageRoute<void>(builder: (_) => const Companies());
  }

  const Companies({Key? key, this.companyId = ""}) : super(key: key);

  @override
  State<Companies> createState() => _CompaniesState();
}

// homepage state
class _CompaniesState extends State<Companies> {
  late Future<List<CompanyModel>> companiesFuture;

  // function to fetch data from api and return future list of posts
  Future<List<CompanyModel>> getCompanies() async {
    Future<List<CompanyModel>> companies = CompanyService.loadCompanies();
    return companies;
  }

  @override
  void initState() {
    companiesFuture = getCompanies();

    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    var companyListFutureBuilder = new FutureBuilder(
        future: companiesFuture,
        builder: (context, snapshot) {
          switch (snapshot.connectionState) {
            case ConnectionState.none:
              return Text('none');
            case ConnectionState.active:
            case ConnectionState.waiting:
              return Text('Loading...');
            case ConnectionState.done:
              return createCompanyList(context, snapshot);

            default:
              if (snapshot.hasError) {
                return Text('Error: ${snapshot.error}');
              } else {
                return createCompanyList(context, snapshot);
              }
          }
        });

    return Scaffold(
        resizeToAvoidBottomInset: false,
        appBar: Navbar(
          getCurrentPage: () => "Companies",
          tags: [],
          title: "Companies",
          searchController: TextEditingController(),
          searchOnChanged: () {},
        ),
        backgroundColor: ArgonColors.bgColorScreen,
        drawer: ArgonDrawer(currentPage: "Companies"),
        body: Container(
          padding: EdgeInsets.only(left: 24.0, right: 24.0),
          child: SingleChildScrollView(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.only(top: 10.0),
                  child: SizedBox(),
                ),
                companyListFutureBuilder,
              ],
            ),
          ),
        ));
  }

  Widget createCompanyList(BuildContext context, AsyncSnapshot snapshot) {
    /*  if (!snapshot.hasData) {
      return Container(
        alignment: Alignment.center,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text("Loading Compliance..."),
          ],
        ),
      );
    } else { */
    return ListView.builder(
      scrollDirection: Axis.vertical,
      shrinkWrap: true,
      itemCount: (snapshot.hasData) ? snapshot.data!.length : 0,
      itemBuilder: (context, index) {
        final CompanyModel company = snapshot.data?[index];
        return GestureDetector(
          onTap: () {
            Navigator.of(context).push(MaterialPageRoute(
                builder: (context) => ProjectList(
                      companyId: company.id,
                    )));
          },
          child: Card(
            child: Container(
              padding: EdgeInsets.only(right: 24, left: 24, bottom: 36),
              child: Column(
                children: [
                  Padding(
                      padding: const EdgeInsets.only(top: 16.0),
                      child: ListTile(
                        title: Text(company!.name,
                            style: TextStyle(
                                color: Theme.of(context).primaryColorDark,
                                fontSize: 22)),
                        subtitle: Text("Status: " + company.status,
                            style: TextStyle(
                                color: Theme.of(context).primaryColorDark,
                                fontSize: 10)),
                        trailing: Text("Location:" + company.address.city,
                            style: TextStyle(
                                color: Theme.of(context).primaryColorDark,
                                fontSize: 10)),
                      )),
                  Container(
                    height: 2.0,
                    color: const Color.fromARGB(255, 9, 9, 9),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
    /* } */
  }
}

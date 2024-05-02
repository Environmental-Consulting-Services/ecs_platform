import 'package:ecsd_mobile/screens/profile.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:scrollable_positioned_list/scrollable_positioned_list.dart';
import 'package:ecsd_mobile/constants/Theme.dart';

import 'package:ecsd_mobile/screens/notifications.dart';
import 'package:ecsd_mobile/screens/search.dart';

import 'package:ecsd_mobile/widgets/input.dart';

class Navbar extends StatefulWidget implements PreferredSizeWidget {
  final String title;
  final String categoryOne;
  final String categoryTwo;
  final bool searchBar;
  final bool backButton;
  final bool transparent;
  final bool rightOptions;
  final List<String> tags;
  final Function getCurrentPage;
  final bool isOnSearch;
  final TextEditingController searchController;
  final Function searchOnChanged;
  final bool searchAutofocus;
  final bool noShadow;
  final Color bgColor;

  Navbar(
      {this.title = "Home",
      this.categoryOne = "",
      this.categoryTwo = "",
      required this.tags,
      this.transparent = false,
      this.rightOptions = true,
      required this.getCurrentPage,
      required this.searchController,
      this.isOnSearch = false,
      required this.searchOnChanged,
      this.searchAutofocus = false,
      this.backButton = false,
      this.noShadow = false,
      this.bgColor = ArgonColors.white,
      this.searchBar = false});

  final double _prefferedHeight = 180.0;

  @override
  _NavbarState createState() => _NavbarState();

  @override
  Size get preferredSize => Size.fromHeight(_prefferedHeight);
}

class _NavbarState extends State<Navbar> {
  late String activeTag;

  ItemScrollController _scrollController = ItemScrollController();

  void initState() {
    if (widget.tags.length != 0) {
      activeTag = widget.tags[0];
    }
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    //final bool categories =
    //widget.categoryOne.isNotEmpty && widget.categoryTwo.isNotEmpty;
    //final bool tagsExist = (widget.tags.length == 0 ? false : true);

    return Container(
        decoration: BoxDecoration(
            color: !widget.transparent ? widget.bgColor : Colors.transparent,
            boxShadow: [
              BoxShadow(
                  color: !widget.transparent && !widget.noShadow
                      ? ArgonColors.initial
                      : Colors.transparent,
                  spreadRadius: -10,
                  blurRadius: 12,
                  offset: Offset(0, 5))
            ]),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.only(left: 16.0, right: 16.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Flex(
                    clipBehavior: Clip.hardEdge,
                    direction: Axis.vertical,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          Row(
                            children: [
                              IconButton(
                                  icon: Icon(
                                      !widget.backButton
                                          ? Icons.menu
                                          : Icons.arrow_back_ios,
                                      color: !widget.transparent
                                          ? (widget.bgColor == ArgonColors.white
                                              ? ArgonColors.initial
                                              : ArgonColors.white)
                                          : ArgonColors.white,
                                      size: 24.0),
                                  onPressed: () {
                                    if (!widget.backButton)
                                      Scaffold.of(context).openDrawer();
                                    else
                                      Navigator.of(context).maybePop(context);
                                  }),
                              Text(widget.title,
                                  style: TextStyle(
                                      color: !widget.transparent
                                          ? (widget.bgColor == ArgonColors.white
                                              ? ArgonColors.initial
                                              : ArgonColors.white)
                                          : ArgonColors.white,
                                      fontWeight: FontWeight.w400,
                                      fontSize: 16.0)),
                            ],
                          ),
                          if (widget.rightOptions)
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                            builder: (context) =>
                                                Notifications()));
                                  },
                                  child: IconButton(
                                      icon: Icon(Icons.notifications_active,
                                          color: !widget.transparent
                                              ? (widget.bgColor ==
                                                      ArgonColors.white
                                                  ? ArgonColors.initial
                                                  : ArgonColors.white)
                                              : ArgonColors.white,
                                          size: 22.0),
                                      onPressed: null),
                                ),
                                PopupMenuButton(
                                    icon: Icon(Icons.account_circle,
                                        color: !widget.transparent
                                            ? (widget.bgColor ==
                                                    ArgonColors.white
                                                ? ArgonColors.initial
                                                : ArgonColors.white)
                                            : ArgonColors.white,
                                        size: 22.0),
                                    itemBuilder: (BuildContext context) {
                                      return [
                                        PopupMenuItem(
                                            child: Text("Profile"),
                                            value: "Profile",
                                            onTap: () {
                                              widget.getCurrentPage() !=
                                                      "Profile"
                                                  ? Navigator.push(
                                                      context,
                                                      MaterialPageRoute(
                                                          builder: (context) =>
                                                              Profile()))
                                                  : null;
                                            }),
                                        PopupMenuItem(
                                          child: Text("Logout"),
                                          value: "Logout",
                                          onTap: () => {
                                            /* BlocProvider.of<AuthenticationBloc>(
                                                    context)
                                                .add(UserLogoutEvent()) */
                                          },
                                        ),
                                      ];
                                    }),

                                /* GestureDetector(
                                  onTap: () {
                                    Navigator.push(
                                        context,
                                        MaterialPageRoute(
                                            builder: (context) => Profile()));
                                  },
                                  child: IconButton(
                                      icon: Icon(Icons.account_circle,
                                          color: !widget.transparent
                                              ? (widget.bgColor ==
                                                      ArgonColors.white
                                                  ? ArgonColors.initial
                                                  : ArgonColors.white)
                                              : ArgonColors.white,
                                          size: 22.0),
                                      onPressed: null),
                                ), */
                              ],
                            )
                        ],
                      ),
/*                 if (widget.searchBar)
                  Padding(
                    padding: const EdgeInsets.only(
                        top: 8, bottom: 4, left: 15, right: 15),
                    child: Input(
                      placeholder: "What are you looking for?",
                      controller: widget.searchController,
                      onChanged: (value) {
                        widget.searchOnChanged(value);
                      },
                      autofocus: widget.searchAutofocus,
                      suffixIcon: Icon(Icons.zoom_in, color: ArgonColors.muted),
                      onTap: () {
                        if (!widget.isOnSearch)
                          Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (context) => Search()));
                      },
                      prefixIcon: Container(),
                    ),
                  ), */
                      /* SizedBox(
                  height: 10.0,
                ), */
                      /* if (categories)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      SizedBox(width: 30),
                      Container(
                        color: ArgonColors.initial,
                        height: 25,
                        width: 1,
                      ),
                      SizedBox(width: 30),
                    ],
                  ), */
                      /* ß */
                    ])
              ],
            ),
          ),
        ));
  }
}

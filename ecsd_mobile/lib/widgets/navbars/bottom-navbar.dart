import 'package:flutter/material.dart';
import 'package:scrollable_positioned_list/scrollable_positioned_list.dart';
import 'package:ecsd_mobile/constants/Theme.dart';

class BottomNavBar extends StatefulWidget implements PreferredSizeWidget {
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

  BottomNavBar(
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

  final double _prefferedHeight = 50.0;

  @override
  _BottomNavBarState createState() => _BottomNavBarState();

  @override
  Size get preferredSize => Size.fromHeight(_prefferedHeight);
}

class _BottomNavBarState extends State<BottomNavBar> {
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
    final bool categories =
        widget.categoryOne.isNotEmpty && widget.categoryTwo.isNotEmpty;
    final bool tagsExist = (widget.tags.length == 0 ? false : true);

    return Container(
        height: widget.searchBar
            ? (!categories
                ? (tagsExist ? 211.0 : 178.0)
                : (tagsExist ? 210.0 : 210.0))
            : (!categories
                ? (tagsExist ? 162.0 : 102.0)
                : (tagsExist ? 200.0 : 150.0)),
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
            child: Flex(direction: Axis.horizontal, children: [
              Column(
                children: [
                  /*   if (widget.searchBar)
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
                        suffixIcon:
                            Icon(Icons.zoom_in, color: ArgonColors.muted),
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
                  SizedBox(
                    height: 10.0,
                  ),
                  /*   if (categories)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        GestureDetector(
                          onTap: () {
                            Navigator.push(
                                context,
                                MaterialPageRoute(
                                    builder: (context) => Elements()));
                          },
                          child: Row(
                            children: [
                              Icon(Icons.compass_calibration_sharp,
                                  color: ArgonColors.initial, size: 22.0),
                              SizedBox(width: 10),
                              Text(widget.categoryOne,
                                  style: TextStyle(
                                      color: ArgonColors.initial,
                                      fontSize: 16.0)),
                            ],
                          ),
                        ),
                        SizedBox(width: 30),
                        Container(
                          color: ArgonColors.initial,
                          height: 25,
                          width: 1,
                        ),
                        SizedBox(width: 30),
                      ],
                    ), */
                  /* if (tagsExist)
                    Container(
                      height: 40,
                      child: ScrollablePositionedList.builder(
                        itemScrollController: _scrollController,
                        scrollDirection: Axis.horizontal,
                        itemCount: widget.tags.length,
                        itemBuilder: (BuildContext context, int index) {
                          return GestureDetector(
                            onTap: () {
                              if (activeTag != widget.tags[index]) {
                                setState(() => activeTag = widget.tags[index]);
                                _scrollController.scrollTo(
                                    index:
                                        index == widget.tags.length - 1 ? 1 : 0,
                                    duration: Duration(milliseconds: 420),
                                    curve: Curves.easeIn);
                                widget.getCurrentPage(activeTag);
                              }
                            },
                            child: Container(
                                margin: EdgeInsets.only(
                                    left: index == 0 ? 46 : 8, right: 8),
                                padding: EdgeInsets.only(
                                    top: 4, bottom: 4, left: 20, right: 20),
                                // width: 90,
                                decoration: BoxDecoration(
                                    color: activeTag == widget.tags[index]
                                        ? ArgonColors.primary
                                        : ArgonColors.secondary,
                                    borderRadius:
                                        BorderRadius.all(Radius.circular(4.0))),
                                child: Center(
                                  child: Text(widget.tags[index],
                                      style: TextStyle(
                                          color: activeTag == widget.tags[index]
                                              ? ArgonColors.white
                                              : ArgonColors.black,
                                          fontWeight: FontWeight.w600,
                                          fontSize: 14.0)),
                                )),
                          );
                        },
                      ),
                    ) */
                ],
              ),
            ]),
          ),
        ));
  }
}

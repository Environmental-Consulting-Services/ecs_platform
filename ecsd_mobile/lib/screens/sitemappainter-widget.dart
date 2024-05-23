import 'dart:async';
import 'dart:convert';
import 'dart:ui' as ui;
import 'package:ecsd_mobile/model/image_model.dart';
import 'package:ecsd_mobile/services/image_service.dart';
import 'package:ecsd_mobile/services/project_service.dart';
import 'package:ecsd_mobile/widgets/appstate.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_painter/flutter_painter.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:observable/observable.dart';

class SiteMapPainter extends StatefulWidget {
  final String inspectionId;
  const SiteMapPainter({Key? key, this.inspectionId = ""}) : super(key: key);

  @override
  _SiteMapPainterState createState() => _SiteMapPainterState();
}

class _SiteMapPainterState extends State<SiteMapPainter> {
  ObservableMap? _state;
  late StreamSubscription stateChanges;
  late String projectId;
  late Future<ImageModel> siteMapImage;
  late PainterController painterController;

  Future<ImageModel> getSiteMapImage(String projectId) async {
    ImageModel image = ImageModel.create();

    await ProjectService.getSiteMapIdForProject(projectId).then((value) async {
      if (value != "")
        ImageService.loadBase64Image(value).then((value) async {
          image = value;
        });
    });
    return image;
  }

  static const Color red = Color(0xFFFF0000);
  FocusNode textFocusNode = FocusNode();
  late PainterController controller;
  ui.Image? backgroundImage;
  Paint shapePaint = Paint()
    ..strokeWidth = 5
    ..color = Colors.red
    ..style = PaintingStyle.stroke
    ..strokeCap = StrokeCap.round;

  static const List<String> imageLinks = [];

  @override
  void initState() {
    super.initState();

    _state = context.findAncestorWidgetOfExactType<AppState>()?.state;
    if (_state != null) {
      projectId = _state?['projectId'];
      stateChanges = _state!.changes.listen((event) => setState(() {}));
    } else {
      projectId = "";
    }

    siteMapImage = getSiteMapImage(projectId);

    controller = PainterController(
        settings: PainterSettings(
            text: TextSettings(
              focusNode: textFocusNode,
              textStyle: const TextStyle(
                  fontWeight: FontWeight.bold, color: red, fontSize: 18),
            ),
            freeStyle: const FreeStyleSettings(
              color: red,
              strokeWidth: 5,
            ),
            shape: ShapeSettings(
              paint: shapePaint,
            ),
            scale: const ScaleSettings(
              enabled: true,
              minScale: 1,
              maxScale: 5,
            )));
    // Listen to focus events of the text field
    textFocusNode.addListener(onFocus);
    // Initialize background
    initBackground();
    painterController = controller;
  }

  /// Fetches image from an [ImageProvider] (in this example, [NetworkImage])
  /// to use it as a background
  void initBackground() async {
    final image = await new MemoryImage(await siteMapImage
            .then((value) => Base64Decoder().convert(value.image_data)))
        .image;

    setState(() {
      backgroundImage = image;
      controller.background = image.backgroundDrawable;
    });
  }

  /// Updates UI when the focus changes
  void onFocus() {
    setState(() {});
  }

  Widget buildDefault(BuildContext context) {
    return Scaffold(
        appBar: PreferredSize(
          preferredSize: const Size(double.infinity, kToolbarHeight),
          // Listen to the controller and update the UI when it updates.
          child: ValueListenableBuilder<PainterControllerValue>(
              valueListenable: controller,
              //child: const Text("SiteMap Annotation"),
              builder: (context, _, child) {
                return AppBar(
                  automaticallyImplyLeading: false,
                  title: child,
                  leading: null,
                  actions: [
                    // Delete the selected drawable
                    IconButton(
                      icon: const Icon(
                        Icons.delete,
                      ),
                      onPressed: controller.selectedObjectDrawable == null
                          ? null
                          : removeSelectedDrawable,
                    ),
                    // Delete the selected drawable
                    IconButton(
                      icon: const Icon(
                        Icons.flip,
                      ),
                      onPressed: controller.selectedObjectDrawable != null &&
                              controller.selectedObjectDrawable is ImageDrawable
                          ? flipSelectedImageDrawable
                          : null,
                    ),
                    // Redo action
                    IconButton(
                      icon: const Icon(
                        Icons.redo,
                      ),
                      onPressed: controller.canRedo ? redo : null,
                    ),
                    // Undo action
                    IconButton(
                      icon: const Icon(
                        Icons.undo,
                      ),
                      onPressed: controller.canUndo ? undo : null,
                    ),
                  ],
                );
              }),
        ),
        // Generate image
        floatingActionButton: FloatingActionButton(
          child: const Icon(
            Icons.save,
          ),
          onPressed: renderAndDisplayImage,
        ),
        body: Stack(
          children: [
            if (backgroundImage != null)
              // Enforces constraints
              Positioned.fill(
                child: Center(
                  child: AspectRatio(
                    aspectRatio:
                        backgroundImage!.width / backgroundImage!.height,
                    child: FlutterPainter(
                      controller: controller,
                    ),
                  ),
                ),
              ),
            Positioned(
              bottom: 0,
              right: 0,
              left: 0,
              child: ValueListenableBuilder(
                valueListenable: controller,
                builder: (context, _, __) => Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Flexible(
                      child: Container(
                        constraints: const BoxConstraints(
                          maxWidth: 400,
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 15),
                        decoration: const BoxDecoration(
                          borderRadius:
                              BorderRadius.vertical(top: Radius.circular(20)),
                          color: Colors.white54,
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (controller.freeStyleMode !=
                                FreeStyleMode.none) ...[
                              const Divider(),
                              const Text("Drawing Tool Settings"),

                              // Control free style stroke width
                              Row(
                                children: [
                                  const Expanded(
                                      flex: 1, child: Text("Stroke Width")),
                                  Expanded(
                                    flex: 3,
                                    child: Slider.adaptive(
                                        min: 2,
                                        max: 25,
                                        value: controller.freeStyleStrokeWidth,
                                        onChanged: setFreeStyleStrokeWidth),
                                  ),
                                ],
                              ),
                              if (controller.freeStyleMode ==
                                  FreeStyleMode.draw)
                                Row(
                                  children: [
                                    const Expanded(
                                        flex: 1, child: Text("Color")),
                                    // Control free style color hue
                                    Expanded(
                                      flex: 3,
                                      child: Slider.adaptive(
                                          min: 0,
                                          max: 359.99,
                                          value: HSVColor.fromColor(
                                                  controller.freeStyleColor)
                                              .hue,
                                          activeColor:
                                              controller.freeStyleColor,
                                          onChanged: setFreeStyleColor),
                                    ),
                                  ],
                                ),
                            ],
                            if (textFocusNode.hasFocus) ...[
                              const Divider(),
                              const Text("Text settings"),
                              // Control text font size
                              Row(
                                children: [
                                  const Expanded(
                                      flex: 1, child: Text("Font Size")),
                                  Expanded(
                                    flex: 3,
                                    child: Slider.adaptive(
                                        min: 8,
                                        max: 96,
                                        value:
                                            controller.textStyle.fontSize ?? 14,
                                        onChanged: setTextFontSize),
                                  ),
                                ],
                              ),

                              // Control text color hue
                              Row(
                                children: [
                                  const Expanded(flex: 1, child: Text("Color")),
                                  Expanded(
                                    flex: 3,
                                    child: Slider.adaptive(
                                        min: 0,
                                        max: 359.99,
                                        value: HSVColor.fromColor(
                                                controller.textStyle.color ??
                                                    red)
                                            .hue,
                                        activeColor: controller.textStyle.color,
                                        onChanged: setTextColor),
                                  ),
                                ],
                              ),
                            ],
                            if (controller.shapeFactory != null) ...[
                              const Divider(),
                              const Text("Shape Settings"),

                              // Control text color hue
                              Row(
                                children: [
                                  const Expanded(
                                      flex: 1, child: Text("Stroke Width")),
                                  Expanded(
                                    flex: 3,
                                    child: Slider.adaptive(
                                        min: 2,
                                        max: 25,
                                        value: controller
                                                .shapePaint?.strokeWidth ??
                                            shapePaint.strokeWidth,
                                        onChanged: (value) =>
                                            setShapeFactoryPaint(
                                                (controller.shapePaint ??
                                                        shapePaint)
                                                    .copyWith(
                                              strokeWidth: value,
                                            ))),
                                  ),
                                ],
                              ),

                              // Control shape color hue
                              Row(
                                children: [
                                  const Expanded(flex: 1, child: Text("Color")),
                                  Expanded(
                                    flex: 3,
                                    child: Slider.adaptive(
                                        min: 0,
                                        max: 359.99,
                                        value: HSVColor.fromColor(
                                                (controller.shapePaint ??
                                                        shapePaint)
                                                    .color)
                                            .hue,
                                        activeColor: (controller.shapePaint ??
                                                shapePaint)
                                            .color,
                                        onChanged: (hue) =>
                                            setShapeFactoryPaint(
                                                (controller.shapePaint ??
                                                        shapePaint)
                                                    .copyWith(
                                              color: HSVColor.fromAHSV(
                                                      1, hue, 1, 1)
                                                  .toColor(),
                                            ))),
                                  ),
                                ],
                              ),

                              Row(
                                children: [
                                  const Expanded(
                                      flex: 1, child: Text("Fill shape")),
                                  Expanded(
                                    flex: 3,
                                    child: Center(
                                      child: Switch(
                                          value: (controller.shapePaint ??
                                                      shapePaint)
                                                  .style ==
                                              PaintingStyle.fill,
                                          onChanged: (value) =>
                                              setShapeFactoryPaint(
                                                  (controller.shapePaint ??
                                                          shapePaint)
                                                      .copyWith(
                                                style: value
                                                    ? PaintingStyle.fill
                                                    : PaintingStyle.stroke,
                                              ))),
                                    ),
                                  ),
                                ],
                              ),
                            ]
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
        bottomNavigationBar: ValueListenableBuilder(
          valueListenable: controller,
          builder: (context, _, __) => Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              // Free-style eraser
              IconButton(
                icon: /* Icon(
                  Icons.ink_eraser, */
                    SvgPicture.asset(
                  'assets/icons/ink_eraser.svg',
                  color: const ui.Color.fromARGB(255, 0, 0, 0),
                  height: 24,
                  width: 24,
                ),
                /* color: controller.freeStyleMode == FreeStyleMode.erase
                      ? Theme.of(context).colorScheme.secondary
                      : null,
                ), */
                onPressed: toggleFreeStyleErase,
              ),
              // Free-style drawing
              IconButton(
                icon: Icon(
                  Icons.draw,
                  color: controller.freeStyleMode == FreeStyleMode.draw
                      ? Theme.of(context).colorScheme.secondary
                      : null,
                ),
                onPressed: toggleFreeStyleDraw,
              ),
              // Add text
              IconButton(
                icon: Icon(
                  Icons.text_fields,
                  color: textFocusNode.hasFocus
                      ? Theme.of(context).colorScheme.secondary
                      : null,
                ),
                onPressed: addText,
              ),
              // Add sticker image
              /* IconButton(
                icon: const Icon(
                  Icons.approval,
                ),
                onPressed: addSticker,
              ), */
              // Add shapes
              if (controller.shapeFactory == null)
                PopupMenuButton<ShapeFactory?>(
                  tooltip: "Add shape",
                  itemBuilder: (context) => <ShapeFactory, String>{
                    LineFactory(): "Line",
                    ArrowFactory(): "Arrow",
                    DoubleArrowFactory(): "Double Arrow",
                    RectangleFactory(): "Rectangle",
                    OvalFactory(): "Oval",
                  }
                      .entries
                      .map((e) => PopupMenuItem(
                          value: e.key,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.start,
                            children: [
                              Icon(
                                getShapeIcon(e.key),
                                color: Colors.black,
                              ),
                              Text(" ${e.value}")
                            ],
                          )))
                      .toList(),
                  onSelected: selectShape,
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Icon(
                      getShapeIcon(controller.shapeFactory),
                      color: controller.shapeFactory != null
                          ? Theme.of(context).colorScheme.secondary
                          : null,
                    ),
                  ),
                )
              else
                IconButton(
                  icon: Icon(
                    getShapeIcon(controller.shapeFactory),
                    color: Theme.of(context).colorScheme.secondary,
                  ),
                  onPressed: () => selectShape(null),
                ),
            ],
          ),
        ));
  }

  @override
  Widget build(BuildContext context) {
    return buildDefault(context);
  }

  static IconData getShapeIcon(ShapeFactory? shapeFactory) {
    if (shapeFactory is LineFactory) return Icons.linear_scale;
    if (shapeFactory is ArrowFactory) return Icons.north_east;
    if (shapeFactory is DoubleArrowFactory) {
      return Icons.swap_horiz;
    }
    if (shapeFactory is RectangleFactory) return Icons.rectangle;
    if (shapeFactory is OvalFactory) return Icons.circle;
    return Icons.polyline;
  }

  void undo() {
    controller.undo();
  }

  void redo() {
    controller.redo();
  }

  void toggleFreeStyleDraw() {
    controller.freeStyleMode = controller.freeStyleMode != FreeStyleMode.draw
        ? FreeStyleMode.draw
        : FreeStyleMode.none;
  }

  void toggleFreeStyleErase() {
    controller.freeStyleMode = controller.freeStyleMode != FreeStyleMode.erase
        ? FreeStyleMode.erase
        : FreeStyleMode.none;
  }

  void addText() {
    if (controller.freeStyleMode != FreeStyleMode.none) {
      controller.freeStyleMode = FreeStyleMode.none;
    }
    controller.addText();
  }

  void addSticker() async {
    final imageLink = await showDialog<String>(
        context: context,
        builder: (context) => const SelectStickerImageDialog(
              imagesLinks: imageLinks,
            ));
    if (imageLink == null) return;
    controller.addImage(
        await NetworkImage(imageLink).image, const Size(100, 100));
  }

  void setFreeStyleStrokeWidth(double value) {
    controller.freeStyleStrokeWidth = value;
  }

  void setFreeStyleColor(double hue) {
    controller.freeStyleColor = HSVColor.fromAHSV(1, hue, 1, 1).toColor();
  }

  void setTextFontSize(double size) {
    // Set state is just to update the current UI, the [FlutterPainter] UI updates without it
    setState(() {
      controller.textSettings = controller.textSettings.copyWith(
          textStyle:
              controller.textSettings.textStyle.copyWith(fontSize: size));
    });
  }

  void setShapeFactoryPaint(Paint paint) {
    // Set state is just to update the current UI, the [FlutterPainter] UI updates without it
    setState(() {
      controller.shapePaint = paint;
    });
  }

  void setTextColor(double hue) {
    controller.textStyle = controller.textStyle
        .copyWith(color: HSVColor.fromAHSV(1, hue, 1, 1).toColor());
  }

  void selectShape(ShapeFactory? factory) {
    controller.shapeFactory = factory;
  }

  void renderAndDisplayImage() {
    if (backgroundImage == null) return;
    final backgroundImageSize = Size(
        backgroundImage!.width.toDouble(), backgroundImage!.height.toDouble());

    // Render the image
    // Returns a [ui.Image] object, convert to to byte data and then to Uint8List
    final imageFuture = controller
        .renderImage(backgroundImageSize)
        .then<Uint8List?>((ui.Image image) => image.pngBytes);

    showDialog(
        context: context,
        builder: (context) => RenderedImageDialog(imageFuture: imageFuture));
  }

  void removeSelectedDrawable() {
    final selectedDrawable = controller.selectedObjectDrawable;
    if (selectedDrawable != null) controller.removeDrawable(selectedDrawable);
  }

  void flipSelectedImageDrawable() {
    final imageDrawable = controller.selectedObjectDrawable;
    if (imageDrawable is! ImageDrawable) return;

    controller.replaceDrawable(
        imageDrawable, imageDrawable.copyWith(flipped: !imageDrawable.flipped));
  }
}

class RenderedImageDialog extends StatelessWidget {
  final Future<Uint8List?> imageFuture;

  const RenderedImageDialog({Key? key, required this.imageFuture})
      : super(key: key);

  Future<bool> saveImage(BuildContext context, Uint8List? image) async {
    bool savedSucess = await ImageService.uploadImage(image)
        .then((value) => saveSiteMapToProject(context, value));

    return Future<bool>.value(savedSucess);
  }

  Future<bool> saveSiteMapToProject(
      BuildContext context, String siteMapId) async {
    ObservableMap? _state =
        context.findAncestorWidgetOfExactType<AppState>()?.state;
    String projectId;

    if (_state != null) {
      projectId = _state?['projectId'];
    } else {
      projectId = "";
    }

    ProjectService.setSiteMapIdForProject(projectId, siteMapId);

    return true;
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text("Edited Site Map"),
      actions: [
        TextButton(
          child: const Text("Close"),
          onPressed: () => Navigator.pop(context),
        ),
        TextButton(
          child: const Text("Save"),
          onPressed: () => {
            imageFuture
                .then((value) => saveImage(context, value))
                .then((value) => {Navigator.pop(context)})
          },
        ),
      ],
      content: FutureBuilder<Uint8List?>(
        future: imageFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const SizedBox(
              height: 50,
              child: Center(child: CircularProgressIndicator.adaptive()),
            );
          }
          if (!snapshot.hasData || snapshot.data == null) {
            return const SizedBox();
          }
          return InteractiveViewer(child: Image.memory(snapshot.data!));
        },
      ),
    );
  }
}

class SelectStickerImageDialog extends StatelessWidget {
  final List<String> imagesLinks;

  const SelectStickerImageDialog({Key? key, this.imagesLinks = const []})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text("Select sticker"),
      content: imagesLinks.isEmpty
          ? const Text("No images")
          : FractionallySizedBox(
              heightFactor: 0.5,
              child: SingleChildScrollView(
                child: Wrap(
                  children: [
                    for (final imageLink in imagesLinks)
                      InkWell(
                        onTap: () => Navigator.pop(context, imageLink),
                        child: FractionallySizedBox(
                          widthFactor: 1 / 4,
                          child: Image.network(imageLink),
                        ),
                      ),
                  ],
                ),
              ),
            ),
      actions: [
        TextButton(
          child: const Text("Cancel"),
          onPressed: () => Navigator.pop(context),
        )
      ],
    );
  }
}

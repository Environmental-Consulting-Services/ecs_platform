import 'dart:convert';
import 'package:ecsd_mobile/model/company_model.dart';
import 'package:ecsd_mobile/model/image_model.dart';
import 'package:ecsd_mobile/services/helper_service.dart';
import 'package:flutter/foundation.dart';
import '../model/user_model.dart';
import 'package:authentication_repository/src/secure_storage_service.dart';

import 'package:http/http.dart' as http;

class ImageService {
  static const String imagePath = 'public/images/files/';
  static const String imageUploadPath = 'public/images/upload';

  static Future<ImageModel> loadImage(imageId) async {
    final json = null;

    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken;

    final response =
        await http.get(HelperService.buildUri(imagePath + imageId.toString()),
            headers: HelperService.buildHeaders(
              accessToken: accessToken,
            ));

    final statusType = (response.statusCode / 100).floor() * 100;
    switch (statusType) {
      case 200:
        String image_data = response.body;

        ImageModel theImage = ImageModel(
            image_data: image_data,
            created_at: DateTime.now(),
            updated_at: DateTime.now());

        return theImage;
      case 400:
        final json = jsonDecode(response.body);
        throw Exception(json);
      case 300:
      case 500:
      default:
        throw Exception('Error contacting the server!');
    }
  }

  static Future<ImageModel> loadBase64Image(imageId) async {
    final json = null;

    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken;

    final response = await http.get(
        HelperService.buildUri(imagePath + imageId.toString() + "/base64"),
        headers: HelperService.buildHeaders(
          accessToken: accessToken,
        ));

    final statusType = (response.statusCode / 100).floor() * 100;
    switch (statusType) {
      case 200:
        String image_data = response.body;

        ImageModel.create();

        ImageModel theImage = ImageModel.create();

        theImage.image_data = image_data;
        theImage.created_at = DateTime.now();
        theImage.updated_at = DateTime.now();

        return theImage;
      case 400:
        final json = jsonDecode(response.body);
        throw Exception(json);
      case 300:
      case 500:
      default:
        throw Exception('Error contacting the server!');
    }
  }

  static Future<String> uploadImage(Uint8List? image) async {
    final json = null;

    final storedUser = await SecureStorageService.getUser();
    var storedToken = await SecureStorageService.getUserAccessToken();
    var accessToken = storedToken;

    final request = await http.MultipartRequest(
      'POST',
      HelperService.buildUri(imageUploadPath),
    );
    request.headers.addAll(HelperService.buildHeadersForUpload(
      accessToken: accessToken,
    ));

    request.files.add(
      http.MultipartFile(
        'file',
        Stream<List<int>>.fromIterable([image!.toList()]),
        image!.length,
        filename: "sitemap",
        //contentType: MediaType('image','jpeg'),
      ),
      //await http.MultipartFile.fromBytes("file", image)
    );
    //request.fields['name'] = 'John Doe';

    var response = await request.send().then((value) => value);

    String imageId = "";

    final statusType = (response.statusCode / 100).floor() * 100;
    switch (statusType) {
      case 200:
        await response.stream.transform(utf8.decoder).listen((value) {
          final jsonResponse = jsonDecode(value);
          imageId = jsonResponse["data"][0]["attributes"]["id"];
        });

        return imageId;
      case 400:
        throw Exception(response.reasonPhrase);
      case 300:
      case 500:
      default:
        throw Exception('Error contacting the server!');
    }
  }
}

import React, { Component } from "react";
import {
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Text,
  View,
  Image
} from "react-native";
import { f, auth, database, storage } from "../../config/config";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import Login from "../components/Login";
class upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedin: false,
      imageId: this.uniqueId(),
      imageSelected: false,
      uploading: false,
      caption: "",
      progress: 0,
      bl: true
    };
  }
  componentDidMount() {
    var that = this;
    f.auth().onAuthStateChanged(function(user) {
      if (user) {
        //loggedin
        that.setState({ loggedin: true });
        that.getUserDetails();
      }
      // not loggedin
      else that.setState({ loggedin: false });
    });
  }
  _checkPermissions = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ camera: status });

    const { statusRoll } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    this.setState({ cameraRoll: statusRoll });
  };
  s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };
  uniqueId = () => {
    return (
      this.s4() +
      "-" +
      this.s4() +
      "-" +
      this.s4() +
      "-" +
      this.s4() +
      "-" +
      this.s4() +
      "-" +
      this.s4() +
      "-" +
      this.s4() +
      "-" +
      this.s4() +
      "-"
    );
  };

  selectImage = async () => {
    this._checkPermissions();
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "Images",
      allowsEditing: true,
      quality: 1
    });

    if (!result.cancelled) {
      // this.uploadImage(result.uri);
      this.setState({
        imageSelected: true,
        imageId: this.uniqueId(),
        uri: result.uri
      });
    } else {
      console.log("cancel");
      this.setState({ imageSelected: false });
    }
  };
  uploadPublish = () => {
    if (this.state.caption != "") {
      if (this.state.caption != "") {
        //
        this.uploadImage(this.state.uri);
        this.setState({ bl: false });
      } else {
        alert("Please enter a caption");
      }
    } else console.log("ignore button tap as already uploading");
  };
  uploadImage = async uri => {
    var that = this;
    var userid = f.auth().currentUser.uid;
    var imageId = this.state.imageId;

    var re = /(?:\.([^.]+))?$/;
    var ext = re.exec(uri)[1];
    this.setState({ currentFileType: ext, uploading: true });

    const response = await fetch(uri);
    const blob = await response.blob();
    var FilePath = imageId + "." + that.state.currentFileType;
    //path storage firebase
    var uploadTask = storage
      .ref("user/" + userid + "/img")
      .child(FilePath)
      .put(blob);
    uploadTask.on(
      "state_changed",
      function(snapshot) {
        var progress = (
          (snapshot.bytesTransferred / snapshot.totalBytes) *
          100
        ).toFixed(0);
        console.log("upload is" + progress + "% complete");
        that.setState({ progress: progress });
      },
      function(error) {
        console.log("error with upload - " + error);
      },
      function() {
        //complete
        that.setState({ progress: 100 });
        uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
          that.processingUpload(downloadURL);
        });
      }
    );
  };
  processingUpload = imageUrl => {
    //
    var that = this;
    var imageId = this.state.imageId;
    var userId = f.auth().currentUser.uid;
    const { username } = this.state;

    var caption = this.state.caption;
    var dateTime = Date.now();
    var timestamp = Math.floor(dateTime / 1000);
    //
    var photoObj = {
      author: userId,
      username: username,
      caption: caption,
      posted: timestamp,
      url: imageUrl,
      profileDp: imageUrl
    };
    //feed
    database.ref("/photos/" + imageId).set(photoObj);
    //Set user photos object
    database.ref("/users/" + userId + "/photos/" + imageId).set(photoObj);
    this.setState({
      caption: "",
      imageId: "",
      uri: "",
      progress: 0,
      uploading: false,
      imageSelected: false,
      bl: true
    });
    alert("image uploaded   !!");
  };
  getUserDetails = () => {
    var userId = f.auth().currentUser.uid;

    var that = this;

    database
      .ref("users")
      .child(userId)
      .once("value")
      .then(function(snapshot) {
        const exist = snapshot.val() !== null;
        if (exist) data = snapshot.val();

        that.setState({
          username: data.username,
          name: data.name,
          avatar: data.avatar
        });
      })
      .catch(error => console.log(error));
  };
  render() {
    const { bl } = this.state;
    return (
      <View style={{ flex: 1 }}>
        {this.state.loggedin === true ? (
          <View style={{ flex: 1 }}>
            {this.state.imageSelected === true ? (
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    height: 70,
                    paddingTop: 30,
                    backgroundColor: "white",
                    borderColor: "lightgrey",
                    borderBottomWidth: 0.5,
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Text>Upload</Text>
                </View>
                <View style={{ padding: 5 }}>
                  <Text style={{ marginTop: 5 }}>Caption</Text>
                  <TextInput
                    editable={bl}
                    placeholder={"Enter your caption"}
                    maxLength={150}
                    multiline={true}
                    numberOfLine={4}
                    value={this.state.caption}
                    onChangeText={text => this.setState({ caption: text })}
                    style={{
                      marginVertical: 10,
                      height: 100,
                      padding: 5,
                      borderColor: "grey",
                      borderWidth: 1,
                      borderRadius: 3,
                      backgroundColor: "white",
                      color: "black"
                    }}
                  />
                  <TouchableOpacity
                    style={{
                      marginHorizontal: "auto",
                      backgroundColor: "purple",
                      borderRadius: 5,
                      paddingVertical: 10,
                      paddingHorizontal: 20
                    }}
                    onPress={() => this.uploadPublish()}
                  >
                    <Text style={{ textAlign: "center", color: "white" }}>
                      upload
                    </Text>
                  </TouchableOpacity>
                  {this.state.uploading === true ? (
                    <View style={{ marginTop: 10 }}>
                      <Text>{this.state.progress}%</Text>
                      {this.state.progress != 100 ? (
                        <ActivityIndicator size="small" color="black" />
                      ) : (
                        <Text>Processing</Text>
                      )}
                    </View>
                  ) : (
                    <View></View>
                  )}
                  <Image
                    source={{ uri: this.state.uri }}
                    style={{
                      marginTop: 10,
                      resizeMode: "cover",
                      width: "100%",
                      height: 275
                    }}
                  />
                </View>
              </View>
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Text style={{ fontSize: 30, paddingBottom: 15 }}>Upload</Text>
                <TouchableOpacity
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    backgroundColor: "blue",
                    borderRadius: 5
                  }}
                  onPress={() => this.selectImage()}
                >
                  <Text style={{ color: "white" }}>Select Photo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <Login message={"please logged in to upload a photo"} />
        )}
      </View>
    );
  }
}

export default upload;

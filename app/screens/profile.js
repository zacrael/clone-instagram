import React, { Component } from "react";
import {
  TouchableOpacity,
  FlatList,
  Text,
  View,
  Image,
  StyleSheet,
  TextInput
} from "react-native";
import { f, auth, database, storage } from "../../config/config";
import ProfilePhotoList from "../components/ProfilePhotoList";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import Login from "../components/Login";
class profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedin: false,
      imageId: this.uniqueId(),
      imageSelected: false,
      uploading: false,
      caption: "",
      progress: 0,
      avatar: ""
    };
  }
  componentDidMount = () => {
    var that = this;
    f.auth().onAuthStateChanged(function(user) {
      if (user) {
        //loggedin
        that.fecthUserInfo(user.uid);
      }
      // not loggedin
      else that.setState({ loggedin: false });
    });
  };

  logOutUser = () => {
    auth
      .signOut()
      .then(() => {
        console.log("Logged out");
      })
      .catch(error => {
        console.log("Errror", error);
      });
  };
  editProfile = () => {
    this.setState({ editingProfile: true });
  };

  saveProfile = () => {
    var name = this.state.name;
    var username = this.state.username;
    if (name != "") {
      database
        .ref("users")
        .child(this.state.userId)
        .child("name")
        .set(name);
    }
    if (username != "") {
      database
        .ref("users")
        .child(this.state.userId)
        .child("username")
        .set(username);
    }
    this.setState({ editingProfile: false });
  };

  fecthUserInfo = userId => {
    //get user data
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
          avatar: data.avatar,
          loggedin: true,
          userId: userId
        });
      })
      .catch(error => console.log(error));
  };

  // upload.ll
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
      this.uploadImage(this.state.uri);
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
    // var imageId = this.state.imageId;
    var userId = f.auth().currentUser.uid;
    const { username } = this.state;
    var caption = this.state.caption;
    var dateTime = Date.now();
    var timestamp = Math.floor(dateTime / 1000);
    //
    var avatars = imageUrl;
    var photoObj = {
      author: userId,
      username: username,
      caption: caption,
      posted: timestamp,
      url: imageUrl
    };

    database
      .ref("users")
      .child(userId)
      .child("avatar")
      .set(avatars);
    // database.ref("/photos/" + imageId).set(photoObj);
    //Set user photos object
    database.ref("/users/" + userId + "/avatar/").set(avatars);

    alert("image uploaded   !!");
    this.setState({ avatar: imageUrl });
  };

  render() {
    var that = this;

    return (
      <View style={{ flex: 1 }}>
        {this.state.loggedin === true ? (
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
              <Text>profile</Text>
            </View>
            <View
              style={{
                justifyContent: "space-evenly",
                alignItems: "center",
                flexDirection: "row",
                paddingVertical: 10
              }}
            >
              <TouchableOpacity onPress={() => this.selectImage()}>
                <Image
                  source={{
                    uri: this.state.avatar
                  }}
                  style={{
                    marginLeft: 10,
                    width: 100,
                    height: 100,
                    borderRadius: 50
                  }}
                />
              </TouchableOpacity>
              <View style={{ marginRight: 10 }}>
                <Text>Name:{this.state.name}</Text>
                <Text>username: {this.state.username}</Text>
              </View>
            </View>
            {this.state.editingProfile == true ? (
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  paddingBottom: 20,
                  borderBottomWidth: 1,
                  textAlign: "center"
                }}
              >
                <TouchableOpacity
                  onPress={() => this.setState({ editingProfile: false })}
                >
                  <Text style={{ fontWeight: "bold" }}>Cancel</Text>
                </TouchableOpacity>
                <Text>Name:</Text>
                <TextInput
                  editable={true}
                  placeholder={"enter your name"}
                  onChangeText={text => this.setState({ name: text })}
                  value={this.state.name}
                  style={{
                    width: 250,
                    marginVertical: 10,
                    padding: 5,
                    borderColor: "grey",
                    borderWidth: 1
                  }}
                />
                <Text>username:</Text>
                <TextInput
                  editable={true}
                  placeholder={"enter your username"}
                  onChangeText={text => this.setState({ username: text })}
                  value={this.state.username}
                  style={{
                    width: 250,
                    marginVertical: 10,
                    padding: 5,
                    borderColor: "grey",
                    borderWidth: 1
                  }}
                />
                <TouchableOpacity
                  style={{ backgroundColor: "blue", padding: 10 }}
                  onPress={() => this.saveProfile()}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    Save Changes
                  </Text>
                </TouchableOpacity>
                <Text>Edit Profile</Text>
              </View>
            ) : (
              <View style={{ paddingBottom: 20, borderBottomWidth: 1 }}>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => {
                    this.logOutUser();
                  }}
                >
                  <Text style={{ textAlign: "center", color: "grey" }}>
                    Log Out
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <ProfilePhotoList
              isUser={true}
              userId={this.state.userId}
              navigation={this.props.navigation}
            ></ProfilePhotoList>
          </View>
        ) : (
          <Login message={"please logged in to view your profile"} />
        )}
      </View>
    );
  }
}

export default profile;
const styles = StyleSheet.create({
  btn: {
    marginTop: 10,
    marginHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 20,
    borderColor: "grey",
    borderWidth: 0.5
  }
});
{
  /* <TouchableOpacity
  onPress={() => this.props.navigation.navigate("Upload")}
  style={styles.btn}
>
  <Text style={{ textAlign: "center", color: "grey" }}>Upload New+</Text>
</TouchableOpacity>; */
}

//
{
  /* <TouchableOpacity
                  onPress={() => this.editProfile()}
                  style={styles.btn}
                >
                  <Text style={{ textAlign: "center", color: "grey" }}>
                    Edit Profile
                  </Text>
                </TouchableOpacity> */
}
//

import React, { Component } from "react";
import {
  TouchableOpacity,
  FlatList,
  Text,
  View,
  Image,
  StyleSheet
} from "react-native";
import { f, auth, database, store } from "../../config/config";
import PhotoList from "../components/photoList";
class userProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,

      onload: false
    };
  }
  checkParams = () => {
    var params = this.props.navigation.state.params;
    if (params) {
      if (params.userId) {
        var that = this;
        that.setState({ userId: params.userId, onload: true });
        this.fecthUserInfo(params.userId);
      }
    }
  };
  fecthUserInfo = userId => {
    //get user data
    var that = this;

    database
      .ref("users")
      .child(userId)

      .child("username")
      .once("value")
      .then(function(snapshot) {
        const exist = snapshot.val() !== null;
        if (exist) data = snapshot.val();
        that.setState({ username: data });
      })
      .catch(error => console.log(error));
    database
      .ref("users")
      .child(userId)
      .child("name")
      .once("value")
      .then(function(snapshot) {
        const exist = snapshot.val() !== null;
        if (exist) data = snapshot.val();
        that.setState({ name: data });
      })
      .catch(error => console.log(error));
    database
      .ref("users")
      .child(userId)
      .child("avatar")
      .once("value")
      .then(function(snapshot) {
        const exist = snapshot.val() !== null;
        if (exist) data = snapshot.val();
        that.setState({ avatar: data, loaded: true });
      })
      .catch(error => console.log(error));
  };
  componentDidMount() {
    this.checkParams();
  }

  render() {
    const { userId } = this.state;

    return (
      <View style={{ flex: 1 }}>
        {this.state.loggedin === true ? (
          <View>
            <Text>loading....</Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                height: 70,
                paddingTop: 30,
                backgroundColor: "white",
                borderColor: "lightgrey",
                borderBottomWidth: 0.5,
                justifyContent: "center",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                <Text
                  style={{ fontSize: 12, fontWeight: "bold", paddingLeft: 10 }}
                >
                  Go Back
                </Text>
              </TouchableOpacity>
              <Text>profile</Text>
              <Text style={{ width: 100 }}>nothing</Text>
            </View>
            <View
              style={{
                justifyContent: "space-evenly",
                alignItems: "center",
                flexDirection: "row",
                paddingVertical: 10
              }}
            >
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
              <View style={{ marginRight: 10 }}>
                <Text>{this.state.name}</Text>
                <Text>{this.state.username}</Text>
              </View>
            </View>
            <PhotoList
              isUser={true}
              userId={userId}
              navigation={this.props.navigation}
            />
          </View>
        )}
      </View>
    );
  }
}

export default userProfile;
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

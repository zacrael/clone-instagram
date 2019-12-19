import React, { Component } from "react";
import {
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  FlatList,
  Text,
  View,
  Image
} from "react-native";
import { f, auth, database, store } from "../../config/config";
import Login from "../components/Login";
class comments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedin: false,
      commentsList: []
    };
  }
  checkParams = () => {
    var params = this.props.navigation.state.params;
    if (params) {
      if (params.photoId && params.photoId !== "") {
        var that = this;
        that.setState({ photoId: params.photoId, onload: true });
        this.fecthComments(params.photoId);
        this.getUserDetails(params.userId);
      }
    }
  };
  getUserDetails = userId => {
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
  addCommentToList = (commentsList, data, comment) => {
    var that = this;
    var commentObj = data[comment];
    database
      .ref("users")
      .child(commentObj.author)
      .child("username")
      .once("value")
      .then(function(snapshot) {
        const exists = snapshot.val() !== null;
        if (exists) data = snapshot.val();
        commentsList.push({
          id: comment,
          comment: commentObj.comment,
          posted: that.timeConverter(commentObj.posted),
          author: data,
          authorId: commentObj.author,
          avatar: commentObj.avatar
        });
        that.setState({
          refresh: false,
          loading: false
        });
      })
      .catch(error => console.log("Error", error));
  };
  fecthComments = photoId => {
    var that = this;
    database
      .ref("comments")
      .child(photoId)
      .orderByChild("posted")
      .once("value")
      .then(function(snapshot) {
        const exists = snapshot.val() !== null;

        if (exists) {
          data = snapshot.val();
          var commentsList = that.state.commentsList;
          for (var comment in data) {
            that.addCommentToList(commentsList, data, comment);
          }
        } else {
          that.setState({ commentsList: [] });
        }
      });
  };
  pluralCheck = s => {
    if (s === 1) {
      return "ago";
    } else {
      return "s ago";
    }
  };
  timeConverter = timestamp => {
    var a = new Date(timestamp * 1000);
    var seconds = Math.floor((new Date() - a) / 1000);

    var interval = Math.floor(seconds / 31536000);
    if (interval > 1) {
      return interval + "year" + this.pluralCheck(interval);
    }

    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return interval + "month" + this.pluralCheck(interval);
    }

    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return interval + "day" + this.pluralCheck(interval);
    }

    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return interval + "hour" + this.pluralCheck(interval);
    }

    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return interval + "minute" + this.pluralCheck(interval);
    }

    return Math.floor(seconds) + "second" + this.pluralCheck(seconds);
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

  componentDidMount = () => {
    var that = this;
    f.auth().onAuthStateChanged(function(user) {
      if (user) {
        //loggedin
        that.setState({ loggedin: true });
      }
      // not loggedin
      else that.setState({ loggedin: false });
    });
    this.checkParams();
  };
  postComment = () => {
    var comment = this.state.comment;
    if (comment !== "") {
      var imageId = this.state.photoId;
      var userId = f.auth().currentUser.uid;
      var commentId = this.uniqueId();
      var dateTime = Date.now();
      var timestamp = Math.floor(dateTime / 1000);
      const { avatar } = this.state;
      this.setState({ comment: "" });
      var commentObj = {
        posted: timestamp,
        author: userId,
        avatar: avatar,
        comment: comment
      };
      database.ref("/comments/" + imageId + "/" + commentId).set(commentObj);

      this.reloadCommentList();
    } else {
      alert("please enter your comment before posting");
    }
  };
  reloadCommentList = () => {
    this.setState({
      commentsList: []
    });
    this.fecthComments(this.state.photoId);
  };
  render() {
    return (
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
            <Text style={{ fontSize: 12, fontWeight: "bold", paddingLeft: 10 }}>
              Go Back
            </Text>
          </TouchableOpacity>
          <Text>profile</Text>
          <Text style={{ width: 100 }}>nothing</Text>
        </View>
        {this.state.commentsList == 0 ? (
          <View>
            <Text>No comment Found</Text>
          </View>
        ) : (
          <FlatList
            refreshing={this.state.refresh}
            data={this.state.commentsList}
            keyExtractor={(item, index) => index.toString()}
            style={{ flex: 1, backgroundColor: "#eee" }}
            renderItem={({ item, index }) => (
              <View
                style={{ flex: 1, borderBottomWidth: 1, borderColor: "grey" }}
              >
                <View
                  key={index}
                  style={{
                    width: "100%",
                    overflow: "hidden",
                    marginBottom: 5,
                    flexDirection: "row"
                  }}
                >
                  <View
                    style={{
                      padding: 5,
                      width: "15%",
                      flexDirection: "column"
                    }}
                  >
                    <View>
                      <Image
                        source={{
                          uri: item.avatar
                        }}
                        style={{
                          resizeMode: "cover",
                          width: 50,
                          height: 50,
                          borderRadius: 50
                        }}
                      />
                    </View>
                  </View>
                  <View
                    style={{
                      padding: 5,
                      width: "85%",
                      flexDirection: "row"
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        this.props.navigation.navigate("User", {
                          userId: item.authorId
                        })
                      }
                    >
                      <View style={{ flexDirection: "row" }}>
                        <Text
                          style={{
                            paddingTop: 15,
                            margin: 0,
                            paddingBottom: 0,
                            flexWrap: "wrap"
                          }}
                        >
                          {item.author} {item.comment}
                        </Text>
                        <Text style={{ paddingTop: 15 }}></Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ width: "100%" }}>
                  <Text>{item.posted}</Text>
                </View>
              </View>
            )}
          />
        )}
        {this.state.loggedin === true ? (
          <View>
            <KeyboardAvoidingView
              behavior="padding"
              enabled
              style={{
                borderTopWidth: 1,
                borderTopColor: "grey",
                padding: 10,
                marginBottom: 15
              }}
            >
              <Text style={{ fontWeight: "bold" }}>Post Comment</Text>
              <View>
                <TextInput
                  editable={true}
                  placeholder={"Enter your comment here..."}
                  value={this.state.comment}
                  onChangeText={text => this.setState({ comment: text })}
                  style={{
                    marginVertical: 10,
                    height: 50,
                    padding: 5,
                    borderColor: "grey",
                    borderRadius: 3,
                    backgroundColor: "white",
                    color: "black"
                  }}
                />
                <TouchableOpacity
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    backgroundColor: "blue",
                    borderRadius: 5
                  }}
                  onPress={() => this.postComment()}
                >
                  <Text style={{ color: "white" }}>Post</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        ) : (
          <Login
            message={"please logged in to post a comment"}
            moveScreen={true}
            navigation={this.props.navigation}
          />
        )}
      </View>
    );
  }
}

export default comments;

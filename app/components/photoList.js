import React, { Component } from "react";
import {
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions
} from "react-native";
import { f, auth, database, store } from "../../config/config";

class photoList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      photo_feed: [],
      refresh: false,
      loading: true,
      userId: "",
      empty: false
    };
  }

  checkParams = () => {
    var params = this.props.navigation.state.params;

    if (params) {
      if (params.userId) {
        var that = this;
        that.setState({ userId: params.userId });

        this.loadFeed(params.userId);
        this.fecthUserInfo(params.userId);
      }
    }
  };
  componentDidMount = () => {
    this.checkParams();
    const { isUser } = this.props;

    if (isUser === true) {
      // this.loadFeed(userId);
    } else {
      this.loadFeed("");
    }
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
  fecthUserInfo = userId => {
    //get user data
    console.log("fe", userId);
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

  addToFlatList = (photo_feed, data, photo) => {
    var that = this;
    var photoObj = data[photo];

    //

    database
      .ref("users")
      .child(photoObj.author)
      .child("avatar")
      .once("value")
      .then(function(snapshot) {
        const dataexist = snapshot.val() !== null;
        if (dataexist) data = snapshot.val();
        photo_feed.push({
          id: photo,
          url: photoObj.url,
          profileDp: photoObj.profileDp,
          caption: photoObj.caption,
          posted: that.timeConverter(photoObj.posted),
          timestamp: photoObj.posted,
          avatar: data,
          authorId: photoObj.author,
          username: photoObj.username
        });
        var myData = []
          .concat(photo_feed)
          .sort((a, b) => a.timestamp < b.timestamp);
        that.setState({ refresh: false, loading: false, photo_feed: myData });
      })
      .catch(error => console.log("1Error", error));
  };

  loadFeed = async (userId = "") => {
    this.setState({
      refresh: true,
      photo_feed: []
    });
    var that = this;

    console.log("loadfeed", userId);
    var databaseRef = database.ref("photos");
    if (userId != "") {
      databaseRef = database
        .ref("users")
        .child(userId)
        .child("photos");
    }

    await databaseRef
      .orderByChild("posted")
      .once("value")
      .then(function(snapshot) {
        const dataexist = snapshot.val() !== null;
        if (dataexist) {
          data = snapshot.val();
          var photo_feed = that.state.photo_feed;
          that.setState({ empty: false });
          for (var photo in data) {
            that.addToFlatList(photo_feed, data, photo);
          }
        } else {
          that.setState({ empty: true });
        }
      })
      .catch(error => console.log("2Error", error));
  };

  loadNew = () => {
    // var that = this;
    const { userId } = this.state;
    console.log("loadnew", userId);
    this.loadFeed(userId);
  };
  render() {
    var that = this;
    const { photo_feed } = this.state;

    return (
      <View style={{ flex: 1 }}>
        {this.state.loading === true ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            {this.state.empty === true ? (
              <Text>No Photos found</Text>
            ) : (
              <Text> loading...</Text>
            )}
          </View>
        ) : (
          <FlatList
            refreshing={this.state.refresh}
            onRefresh={this.loadNew}
            data={this.state.photo_feed}
            keyExtractor={(item, index) => index.toString()}
            style={{ flex: 1, backgroundColor: "#eee" }}
            renderItem={({ item, index }) => (
              <View
                key={item.authorId}
                style={{
                  width: "100%",
                  overflow: "hidden",
                  marginBottom: 5,
                  justifyContent: "space-between"
                }}
              >
                <View
                  style={{
                    padding: 5,

                    width: "100%",
                    flexDirection: "row",
                    justifyContent: "space-between"
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
                    <Text>{item.username}</Text>
                  </View>
                  {/* <Text style={{ paddingTop: 10, alignSelf: "flex-start" }}>
                    {item.author}
                  </Text> */}

                  <TouchableOpacity
                    onPress={() =>
                      this.props.navigation.navigate("User", {
                        userId: item.authorId
                      })
                    }
                  >
                    <Text style={{ alignSelf: "flex-end" }}>{item.posted}</Text>
                  </TouchableOpacity>
                </View>
                <View>
                  <Image
                    source={{
                      uri: item.url
                    }}
                    style={{
                      resizeMode: "cover",
                      width: "100%",
                      height: 500
                    }}
                  />
                </View>
                <View style={{ padding: 5 }}>
                  <Text>{item.caption}</Text>

                  <TouchableOpacity
                    onPress={() =>
                      this.props.navigation.navigate("Comments", {
                        photoId: item.id,
                        userId: item.authorId
                      })
                    }
                  >
                    <Text
                      style={{
                        color: "black",
                        opacity: 0.5,
                        marginTop: 10,
                        textAlign: "left",
                        paddingLeft: 5
                      }}
                    >
                      View Comments
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    );
  }
}
export default photoList;

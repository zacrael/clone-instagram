import React, { Component } from "react";
import {
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Text,
  View,
  Image
} from "react-native";
import { f, auth, database, store } from "../../config/config";

class ProfilePhotoLists extends Component {
  constructor(props) {
    super(props);
    this.state = {
      photo_feed: [],
      refresh: false,
      loading: true,
      userId: ""
    };
  }

  componentDidMount = () => {
    const { isUser, userId } = this.props;

    if (isUser === true) {
      this.loadFeed(userId);
      this.setState({ userId });
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

  addToFlatList = (photo_feed, data, photo) => {
    var that = this;
    var photoObj = data[photo];

    database
      .ref("users")
      .child(photoObj.author)
      .child("username")
      .once("value")
      .then(function(snapshot) {
        const dataexist = snapshot.val() !== null;
        if (dataexist) data = snapshot.val();
        photo_feed.push({
          id: photo,
          url: photoObj.url,
          caption: photoObj.caption,
          posted: that.timeConverter(photoObj.posted),
          author: data,
          authorId: photoObj.author
        });
        that.setState({ refresh: false, loading: false });
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
        if (dataexist) data = snapshot.val();
        var photo_feed = that.state.photo_feed;

        for (var photo in data) {
          that.addToFlatList(photo_feed, data, photo);
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
    const { photo_feed } = that.state;
    console.log("w", photo_feed.url);
    return (
      <View style={{ flex: 1 }}>
        {this.state.loading === true ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text> loading...</Text>
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
                  justifyContent: "space-between",
                  borderBottomWidth: 1,
                  borderColor: "grey"
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
                  <Text>{item.posted}</Text>

                  <TouchableOpacity
                    onPress={() =>
                      this.props.navigation.navigate("User", {
                        userId: item.authorId
                      })
                    }
                  >
                    <Text>{item.author}</Text>
                  </TouchableOpacity>
                </View>
                <View>
                  <Image
                    source={{
                      uri: item.url
                    }}
                    style={{ resizeMode: "cover", width: "100%", height: 270 }}
                  />
                </View>
                <View style={{ padding: 5 }}>
                  <Text>{item.caption}</Text>

                  <TouchableOpacity
                    onPress={() =>
                      this.props.navigation.navigate("Comments", {
                        userId: item.id
                      })
                    }
                  >
                    <Text
                      style={{
                        color: "blue",
                        marginTop: 10,
                        textAlign: "center"
                      }}
                    >
                      [ View Comments]
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
export default ProfilePhotoLists;

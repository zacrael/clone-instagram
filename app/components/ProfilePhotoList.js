import React, { Component } from "react";
import {
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  Dimensions
} from "react-native";
import { f, auth, database, store } from "../../config/config";

class ProfilePhotoList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      photo_feed: [],
      refresh: false,
      loading: true,
      userId: "",
      photosUri: []
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
          timestamp: photoObj.posted,
          author: data,
          authorId: photoObj.author
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
        console.log("photo");
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
    const { photos } = this.state;
    console.log(photos, "watatatatat");
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
            numColumns={2}
            style={{ flex: 1, backgroundColor: "#eee" }}
            renderItem={({ item, index }) => (
              <View key={item.authorId} style={styles.container}>
                <View>
                  <Image
                    source={{
                      uri: item.url
                    }}
                    style={styles.image}
                  />
                </View>
              </View>
            )}
          />
        )}
      </View>
    );
  }
}
export default ProfilePhotoList;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5fcff"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  },
  image: {
    width: Dimensions.get("window").width / 2 - 20,
    height: 150,
    margin: 10
  },
  flatListStyle: {
    flex: 1
  }
});

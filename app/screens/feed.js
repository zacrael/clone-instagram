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
import PhotoList from "../components/photoList";
class feed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      photo_feed: [],
      refresh: false,
      loading: true
    };
  }
  componentDidMount() {}
  // pluralCheck = s => {
  //   if (s === 1) {
  //     return "ago";
  //   } else {
  //     return "s ago";
  //   }
  // };
  // timeConverter = timestamp => {
  //   var a = new Date(timestamp * 1000);
  //   var seconds = Math.floor((new Date() - a) / 1000);

  //   var interval = Math.floor(seconds / 31536000);
  //   if (interval > 1) {
  //     return interval + "year" + this.pluralCheck(interval);
  //   }

  //   interval = Math.floor(seconds / 2592000);
  //   if (interval > 1) {
  //     return interval + "month" + this.pluralCheck(interval);
  //   }

  //   interval = Math.floor(seconds / 86400);
  //   if (interval > 1) {
  //     return interval + "day" + this.pluralCheck(interval);
  //   }

  //   interval = Math.floor(seconds / 3600);
  //   if (interval > 1) {
  //     return interval + "hour" + this.pluralCheck(interval);
  //   }

  //   interval = Math.floor(seconds / 60);
  //   if (interval > 1) {
  //     return interval + "minute" + this.pluralCheck(interval);
  //   }

  //   return Math.floor(seconds) + "second" + this.pluralCheck(seconds);
  // };

  // addToFlatList = (photo_feed, data, photo) => {
  //   var that = this;
  //   var photoObj = data[photo];

  //   database
  //     .ref("users")
  //     .child(photoObj.author)
  //     .child("username")
  //     .once("value")
  //     .then(function(snapshot) {
  //       const dataexist = snapshot.val() !== null;
  //       if (dataexist) data = snapshot.val();
  //       photo_feed.push({
  //         id: photo,
  //         url: photoObj.url,
  //         caption: photoObj.caption,
  //         posted: that.timeConverter(photoObj.posted),
  //         author: data,
  //         authorId: photoObj.author
  //       });
  //       that.setState({ refresh: false, loading: false });
  //     })
  //     .catch(error => console.log("1Error", error));
  // };

  // loadFeed = () => {
  //   this.setState({
  //     refresh: true,
  //     photo_feed: []
  //   });
  //   var that = this;
  //   database
  //     .ref("photos")
  //     .orderByChild("posted")
  //     .once("value")
  //     .then(function(snapshot) {
  //       const dataexist = snapshot.val() !== null;
  //       if (dataexist) data = snapshot.val();
  //       var photo_feed = that.state.photo_feed;

  //       for (var photo in data) {
  //         that.addToFlatList(photo_feed, data, photo);
  //       }
  //     })
  //     .catch(error => console.log("2Error", error));
  // };

  // loadNew = () => {
  //   this.loadFeed();
  // };
  render() {
    return (
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
          <Text>Feed</Text>
        </View>
        <PhotoList isUser={false} navigation={this.props.navigation} />
      </View>
    );
  }
}

export default feed;

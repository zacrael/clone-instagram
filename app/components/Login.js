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
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedin: false,
      loginStep: 0,
      moveScreen: false
    };
  }
  login = async () => {
    var email = this.state.email;
    var password = this.state.password;
    if (email != "" && password != "") {
      try {
        let user = await auth.signInWithEmailAndPassword(email, password);
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("email or password is empty..");
    }
  };
  createuserObj = (userObj, email) => {
    var usObj = {
      name: "Enter name",
      username: "name",
      avatar: "http://www.gavatar.com/avatar",
      email: email
    };
    database
      .ref("users")
      .child(userObj.uid)
      .set(usObj);
  };
  signUp = async () => {
    var email = this.state.email;
    var password = this.state.password;
    if (email != "" && password != "") {
      try {
        let user = await auth
          .createUserWithEmailAndPassword(email, password)
          .then(userObj => this.createuserObj(userObj.user, email))
          .catch(error => alert(error));
      } catch (error) {
        console.log(error);
      }
    } else {
      alert("email or password is empty..");
    }
  };
  componentDidMount = () => {
    if (this.props.moveScreen == true) {
      this.setState({ moveScreen: true });
    }
  };
  showLogin = () => {
    if (this.state.moveScreen == true) {
      this.props.navigation.navigate("Upload");
      return false;
    }
    this.setState({ loginStep: 1 });
  };
  showsignUp = () => {
    if (this.state.moveScreen == true) {
      this.props.navigation.navigate("Upload");
      return false;
    }
    this.setState({ loginStep: 2 });
  };
  render() {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text> You are not logged in</Text>
        <Text>{this.props.message}</Text>
        {this.state.loginStep == 0 ? (
          <View style={{ marginVertical: 20, flexDirection: "row" }}>
            <TouchableOpacity onPress={() => this.showLogin()}>
              <Text style={{ fontWeight: "bold", color: "grey" }}> Login </Text>
            </TouchableOpacity>
            <Text style={{ marginHorizontal: 10 }}> or </Text>
            <TouchableOpacity onPress={() => this.showsignUp()}>
              <Text style={{ fontWeight: "bold", color: "blue" }}>
                {" "}
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ marginVertical: 20 }}>
            {this.state.loginStep == 1 ? (
              <View>
                <TouchableOpacity
                  onPress={() => this.setState({ loginStep: 0 })}
                  style={{
                    borderRightWidth: 1,
                    paddingVertical: 5,
                    margin: 10,
                    borderBottomColor: "black"
                  }}
                >
                  <Text style={{ fontWeight: "bold" }}>Cancel</Text>
                </TouchableOpacity>
                <Text
                  style={{ fontWeight: "bold", marginBottom: 20 }}
                  Login
                ></Text>
                <TextInput
                  editable={true}
                  keyboardType={"email-address"}
                  placeholder={"enter your email address.."}
                  onChangeText={text => this.setState({ email: text })}
                  value={this.state.email}
                  style={{
                    width: 250,
                    marginVertical: 10,
                    padding: 5,
                    borderWidth: 1,
                    borderColor: "grey",
                    borderRadius: 3
                  }}
                />
                <TextInput
                  editable={true}
                  secureTextEntry={true}
                  placeholder={"enter your password.."}
                  onChangeText={text => this.setState({ password: text })}
                  value={this.state.password}
                  style={{
                    width: 250,
                    marginVertical: 10,
                    padding: 5,
                    borderWidth: 1,
                    borderColor: "grey",
                    borderRadius: 3
                  }}
                />
                <TouchableOpacity
                  onPress={() => this.login()}
                  style={{
                    backgroundColor: "green",
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 3
                  }}
                >
                  <Text style={{ textAlign: "center", color: "blue" }}>
                    Login
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => this.setState({ loginStep: 0 })}
                style={{
                  borderRightWidth: 1,
                  paddingVertical: 5,
                  margin: 10,
                  borderBottomColor: "black"
                }}
              >
                <Text style={{ fontWeight: "bold" }}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  }
}

export default Login;

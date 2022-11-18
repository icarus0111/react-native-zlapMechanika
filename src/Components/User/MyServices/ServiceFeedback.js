import AsyncStorage from '@react-native-community/async-storage';
import * as React from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Rating } from 'react-native-ratings';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NavigationActions, StackActions } from 'react-navigation';
import { connect } from 'react-redux';
import COLORS from '../../../Config/Colors';
import DEVICES from '../../../Config/Devices';
import STRINGS from '../../../Config/Strings';
import STYLES from '../../../Config/Styles';
import { login } from '../../../Redux/Actions/Auth';

class ServiceFeedbackScreen extends React.Component {

  static navigationOptions = ({ navigation }) => ({
    title: STRINGS.headers.service_feedback,
    headerTitleStyle: { fontSize: 18, fontWeight: '400' },
    headerStyle: {
      backgroundColor: COLORS.appColor,
      shadowColor: COLORS.appColor,
      height: 48
    },
    headerTintColor: COLORS.white,
    headerLeft: <View style={{ paddingHorizontal: 8 }}>
      <TouchableOpacity onPress={() => navigation.goBack()} >
        <Image source={require('../../../assets/icons/arrow-left.png')} style={STYLES.image24} />
      </TouchableOpacity>
    </View>,
    headerRight: <View style={{ paddingHorizontal: 4 }}>
      <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
        <Image source={require('../../../assets/icons/menu.png')} style={STYLES.image36} />
      </TouchableOpacity>
    </View>
  })

  constructor() {
    super();
    this.state = {
      myServiceDetail: {},
      feedback_star: 3,
      feedback_text: ''
    }
  }

  componentDidMount() {
    let item = this.props.navigation.getParam('item', 'default')
    this.setState({ myServiceDetail: item })
  }

  ratingCompleted(star) {
    this.setState({ feedback_star: star })
  }

  onSend() {

    let query = 'idUser=' + this.props.Credential.idUser + '&key=' + this.props.Credential.key + '&idQuery=' + this.state.myServiceDetail.idQuery +
      '&score=' + this.state.feedback_star + '&comment=' + this.state.feedback_text

    fetch(STRINGS.link.server + '/services/feedbackService?lang=pl-pl&' + query)
      .then(response => response.json())
      .then((responseJson) => {

        if (!responseJson.hasOwnProperty('errno')) {
          this.props.navigation.navigate('MyServices')
        } else {
          if (responseJson.errno == 9) {
            this.autoLogin()
          } else {
            this.refs.toast.show(responseJson.error, 2000)
          }
        }
      })
      .catch(error => console.log(error))
  }

  autoLogin() {

    let user = this.props.User.user

    if (JSON.parse(user).logged) {
      fetch('http://api.zlapmechanika.pl/user/login?lang=pl-pl&phone=' + JSON.parse(user).phonenumber + '&password=' + JSON.parse(user).password + '&notifyToken=' + this.props.FcmToken.fcmToken)
        .then(response => response.json())
        .then((responseJson) => {

          if (!responseJson.hasOwnProperty('errno')) {
            let credential = {
              idUser: responseJson.idUser,
              key: responseJson.key,
              type: responseJson.type
            }
            this.props.Login(credential.idUser, credential.key, credential.type)
            this.onSend()

          } else { this.goToLogin() }
        })
        .catch(error => console.log('profile error ----->', error), this.goToLogin())

    } else { this.goToLogin() }
  }

  goToLogin() {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Auth' })],
    })
    this.props.navigation.dispatch(resetAction)
  }

  status = (state) => {
    if (state == '0') {
      return 'waiting'
    } else if (state == '1') {
      return 'contracted'
    } else if (state == '254') {
      return 'cancelled'
    } else if (state == '255') {
      return 'done'
    }
  }

  render() {
    return (
      <ScrollView style={{ flex: 1 }}>
        <View style={[STYLES.container, { height: DEVICES.screenHeight - 80 }]}>
          <View style={styles.content}>
            <Text style={[STYLES.label, { marginVertical: 10 }]}>{this.state.myServiceDetail.serviceName}</Text>
            <Text style={STYLES.grayLabel}>Contractor</Text>
            <Text style={[STYLES.label, { fontWeight: '500' }]}>Jon's mechanic workshop</Text>
            <Text style={STYLES.label}>{this.state.myServiceDetail.locationAddress} {this.state.myServiceDetail.locationPostalCode} {this.state.myServiceDetail.locationCity}</Text>
            <Text style={STYLES.grayLabel}>Vehicle</Text>
            <Text style={STYLES.label}>{this.state.myServiceDetail.vehicleMake} {this.state.myServiceDetail.vehicleModel} {this.state.myServiceDetail.vehicleYear}</Text>
            <Text style={STYLES.label}>{this.state.myServiceDetail.idVehicleMotorType}</Text>
            <View style={{ flexDirection: 'row', marginVertical: 5 }}>
              <View>
                <Text style={STYLES.grayLabel}>Order date</Text>
                <Text style={STYLES.label}>2019-08-26</Text>
              </View>
              <View style={{ marginStart: 50 }}>
                <Text style={STYLES.grayLabel}>Service date</Text>
                <Text style={STYLES.label}>2019-08-26</Text>
              </View>
            </View>
            <View>
              <Text style={STYLES.grayLabel}>Status</Text>
              <Text style={[STYLES.label, { fontWeight: '500' }]}>{this.status(this.state.myServiceDetail.status)}</Text>
            </View>
            <Rating
              showRating={false}
              ratingCount={5}
              imageSize={40}
              onFinishRating={(star) => this.ratingCompleted(star)}
              style={{ paddingVertical: 30 }}
            />
            <TextInput
              style={styles.feedback_text}
              placeholder='Type comment here'
              value={this.state.feedback_text}
              onChangeText={(text) => this.setState({ feedback_text: text })}
              maxLength={200}
            />
            <TouchableOpacity style={[STYLES.defaultButton, { marginTop: 50, alignSelf: 'center' }]} onPress={() => this.onSend()}>
              <Text style={STYLES.defaultButtonText}>{STRINGS.buttons.send}</Text>
              <MaterialIcons name='feedback' size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: DEVICES.screenWidth * 0.075,
  },
  feedback_text: {
    height: 100,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.appColor,
    borderRadius: 5,
    textAlignVertical: 'top',
    fontSize: 16
  }
});

const mapStateToProps = state => ({
  Credential: state.Credential,
  User: state.User,
  FcmToken: state.FcmToken
})

const mapDispatchToProps = (dispatch) => {
  return {
    Login: (idUser, key, role) => { dispatch(login(idUser, key, role)) },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ServiceFeedbackScreen)
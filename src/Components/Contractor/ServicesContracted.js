import * as React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationActions, StackActions } from 'react-navigation';
import { connect } from 'react-redux';
import COLORS from '../../Config/Colors';
import DEVICES from '../../Config/Devices';
import STRINGS from '../../Config/Strings';
import STYLES from '../../Config/Styles';
import { login } from '../../Redux/Actions/Auth';

class ServicesContractedScreen extends React.Component {

  static navigationOptions = ({ navigation }) => ({
    title: STRINGS.headers.service_contracted,
    headerTitleStyle: { fontSize: 18, fontWeight: '400' },
    headerStyle: {
      backgroundColor: COLORS.appColor,
      shadowColor: COLORS.appColor,
      height: 48
    },
    headerTintColor: COLORS.white,
    headerLeft: <View style={{ paddingHorizontal: 8 }}>
      <TouchableOpacity onPress={() => navigation.goBack()} >
        <Image source={require('../../assets/icons/arrow-left.png')} style={STYLES.image24} />
      </TouchableOpacity>
    </View>,
    headerRight: <View style={{ paddingHorizontal: 4 }}>
      <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
        <Image source={require('../../assets/icons/menu.png')} style={STYLES.image36} />
      </TouchableOpacity>
    </View>
  })

  constructor() {
    super();
    this.state = {
      serviceDetail: {},
      service_name: '',
    }
  }

  componentDidMount() {
    let item = this.props.navigation.getParam('item', 'default')
    let service_name = this.props.navigation.getParam('service_name', 'default')
    this.setState({ serviceDetail: item, service_name: service_name })
  }

  onCancel() {

    let query = '&idUser=' + this.props.Credential.idUser + '&key=' + this.props.Credential.key + '&idQuery=' + this.state.serviceDetail.idQuery +
      '&serviceDateTime=' + this.state.serviceDetail.expectedDate + '&priceFrom=' + 100 + '&priceTo=' + 160

    fetch(STRINGS.link.server + '/services/queryContractorCancel?lang=pl-pl' + query)
      .then(response => response.json())
      .then((responseJson) => {

        if (!responseJson.hasOwnProperty('errno')) {
        } else {
          if (responseJson.errno == 9) {
            this.autoLogin()
          } else {
            // this.refs.toast.show(responseJson.error, 2000)
          }
        }
      })
      .catch(error => console.log(error))
  }

  autoLogin() {

    let user = this.props.User.user

    if (JSON.parse(user).logged) {
      fetch(STRINGS.link.server + '/user/login?lang=pl-pl&phone=' + JSON.parse(user).phonenumber + '&password=' + JSON.parse(user).password + '&notifyToken=' + this.props.FcmToken.fcmToken)
        .then(response => response.json())
        .then((responseJson) => {

          if (!responseJson.hasOwnProperty('errno')) {
            let credential = {
              idUser: responseJson.idUser,
              key: responseJson.key,
              type: responseJson.type
            }
            this.props.Login(credential.idUser, credential.key, credential.type)
            this.onCancel()

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

  onDone() {

    let query = '&idUser=' + this.props.Credential.idUser + '&key=' + this.props.Credential.key + '&idQuery=' + this.state.serviceDetail.idQuery +
      '&serviceDateTime=' + this.state.serviceDetail.expectedDate + '&priceFrom=' + 100 + '&priceTo=' + 160

    fetch(STRINGS.link.server + '/services/queryContractorFinish?lang=pl-pl' + query)
      .then(response => response.json())
      .then((responseJson) => {
        if (!responseJson.hasOwnProperty('errno')) {
          console.log('queryContractorFinish ----->', responseJson)
        } else {
          if (responseJson.errno == 9) {
            this.autoLogin()
          } else {
            // this.refs.toast.show(responseJson.error, 2000)
          }
        }
      })
      .catch(error => console.log(error))
  }

  render() {
    return (
      <View style={STYLES.container}>
        <View style={styles.content}>
          <Text style={[STYLES.label, { paddingVertical: 15 }]}>{this.state.service_name}</Text>
          <Text style={STYLES.grayLabel}>Vehicle</Text>
          <Text style={STYLES.label}>{this.state.serviceDetail.vehicleMake}, {this.state.serviceDetail.vehicleModel}, {this.state.serviceDetail.vehicleYear}</Text>
          <Text style={STYLES.label}>{this.state.serviceDetail.idVehicleMotorType}</Text>
          <Text style={STYLES.grayLabel}>User</Text>
          <Text style={STYLES.label}>Name surname</Text>
          <Text style={STYLES.grayLabel}>Expected service date</Text>
          <Text style={STYLES.label}>{this.state.serviceDetail.expectedDate}</Text>
          <Text style={STYLES.grayLabel}>Contracted service date</Text>
          <Text style={STYLES.label}>{this.state.serviceDetail.expectedDate}</Text>
          <Text style={STYLES.grayLabel}>Approximity price</Text>
          <Text style={STYLES.label}>From 100 to 160</Text>
          <View style={{ marginTop: 30, flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity style={[STYLES.defaultButton, { width: DEVICES.screenWidth * 0.4 }]} onPress={() => this.onCancel()}>
              <Text style={STYLES.defaultButtonText}>{STRINGS.buttons.cancel}</Text>
              <Image source={require('../../assets/icons/cancel.png')} style={STYLES.image24} />
            </TouchableOpacity>
            <TouchableOpacity style={[STYLES.defaultButton, { width: DEVICES.screenWidth * 0.4 }]} onPress={() => this.onDone()}>
              <Text style={[STYLES.defaultButtonText]}>{STRINGS.buttons.done}</Text>
              <Image source={require('../../assets/icons/check.png')} style={STYLES.image24} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: DEVICES.screenWidth * 0.075,
    flexDirection: 'column'
  }
});

const mapStateToProps = state => ({
  Credential: state.Credential,
  User: state.User,
  FcmToken: state.FcmToken
})

const mapDispatchToProps = (dispatch) => {
  return {
    Login: (idUser, key, role) => { dispatch(login(idUser, key, role)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ServicesContractedScreen)
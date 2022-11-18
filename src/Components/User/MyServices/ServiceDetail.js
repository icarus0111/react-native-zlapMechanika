import * as React from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-easy-toast';
import MapView, { Marker } from 'react-native-maps';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NavigationActions, StackActions } from 'react-navigation';
import { connect } from 'react-redux';
import COLORS from '../../../Config/Colors';
import DEVICES from '../../../Config/Devices';
import STRINGS from '../../../Config/Strings';
import STYLES from '../../../Config/Styles';
import { login } from '../../../Redux/Actions/Auth';

class MyServiceDetailScreen extends React.Component {

  static navigationOptions = ({ navigation }) => ({
    title: STRINGS.headers.service_details,
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
      region: {
        latitude: 51.9194,
        longitude: 19.1451,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      buttonVisible1: true,
      buttonVisible2: false
    }
  }

  componentDidMount() {
    let item = this.props.navigation.getParam('item', 'default')
    this.setState({ myServiceDetail: item })
    if (item.status == '1') {
      this.setState({ buttonVisible1: true, buttonVisible2: false })
    } else if (item.status == '254') {
      this.setState({ buttonVisible1: false, buttonVisible2: false })
    } else if (item.status == '255') {
      this.setState({ buttonVisible1: false, buttonVisible2: true })
    }
  }

  onRegionChangeComplete(region) {
    this.setState({ region })
  }

  onCall() {
    if (this.state.myServiceDetail.phone != null) {
      Linking.openURL(`tel:${this.state.myServiceDetail.phone}`)
    } else {
      this.refs.toast.show('Phone number is empty', 2000);
    }
  }

  onNavigate() {
    if (this.state.myServiceDetail.locationLat != null && this.state.myServiceDetail.locationLon != null) {
      this.setState({
        region: {
          latitude: parseFloat(this.state.myServiceDetail.locationLat),
          longitude: parseFloat(this.state.myServiceDetail.locationLon),
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }
      })
    } else {
      this.refs.toast.show('Location latitude or longitude is empty', 2000);
    }
  }

  onCancel() {
    fetch(STRINGS.link.server + '/services/queryCancel?lang=pl-pl&idUser=' + this.props.Credential.idUser + '&key=' + this.props.Credential.key + '&idQuery=' + this.state.myServiceDetail.idQuery)
      .then(response => response.json())
      .then((responseJson) => {

        if (!responseJson.hasOwnProperty('errno')) {
        } else {
          this.refs.toast.show(responseJson.error, 2000);
        }
      })
      .catch(error => console.log(error))
  }

  onDone() {
    fetch(STRINGS.link.server + '/services/queryDone?lang=pl-pl&idUser=' + this.props.Credential.idUser + '&key=' + this.props.Credential.key + '&idQuery=' + this.state.myServiceDetail.idQuery)
      .then(response => response.json())
      .then((responseJson) => {

        if (!responseJson.hasOwnProperty('errno')) {
          this.props.navigation.navigate('ServiceFeedback', { item: this.state.myServiceDetail })
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
            this.onDone()

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

  onFeedback() {
    this.props.navigation.navigate('ServiceFeedback', {
      item: this.state.myServiceDetail
    })
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
        <View style={STYLES.container}>
          <View style={styles.mapView}>
            <MapView
              region={this.state.region}
              onRegionChangeComplete={(region) => this.onRegionChangeComplete(region)}
              style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}
            >
              <Marker coordinate={this.state.region}></Marker>
            </MapView>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={STYLES.defaultButton} onPress={() => this.onCall()}>
                <Text style={STYLES.defaultButtonText}>{STRINGS.buttons.call}</Text>
                <Image source={require('../../../assets/icons/phone.png')} style={STYLES.image24} />
              </TouchableOpacity>
              <TouchableOpacity style={STYLES.defaultButton} onPress={() => this.onNavigate()}>
                <Text style={STYLES.defaultButtonText}>{STRINGS.buttons.navigate}</Text>
                <Image source={require('../../../assets/icons/navigate.png')} style={STYLES.image24} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.content}>
            <View style={styles.body}>
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
            </View>
          </View>
          {
            this.state.buttonVisible1 ?
              <View style={styles.footer}>
                <TouchableOpacity style={[STYLES.defaultButton, { width: DEVICES.screenWidth * 0.4 }]} onPress={() => this.onCancel()}>
                  <Text style={STYLES.defaultButtonText}>{STRINGS.buttons.cancel}</Text>
                  <Image source={require('../../../assets/icons/close.png')} style={STYLES.image24} />
                </TouchableOpacity>
                <TouchableOpacity style={[STYLES.defaultButton, { width: DEVICES.screenWidth * 0.4 }]} onPress={() => this.onDone()}>
                  <Text style={STYLES.defaultButtonText}>{STRINGS.buttons.done}</Text>
                  <Image source={require('../../../assets/icons/check.png')} style={STYLES.image24} />
                </TouchableOpacity>
              </View>
              :
              <View></View>
          }
          {
            this.state.buttonVisible2 ?
              <View style={styles.footer}>
                <TouchableOpacity style={[STYLES.defaultButton, { width: DEVICES.screenWidth * 0.4 }]} onPress={() => this.onFeedback()}>
                  <Text style={STYLES.defaultButtonText}>{STRINGS.buttons.feedback}</Text>
                  <MaterialIcons name='feedback' size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
              :
              <View></View>
          }
          <Toast ref='toast' position='center' />
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  mapView: {
    height: 300,
    justifyContent: 'flex-end'
  },
  content: {
    flex: 1,
    flexDirection: 'column'
  },
  body: {
    paddingHorizontal: DEVICES.screenWidth * 0.05
  },
  footer: {
    marginVertical: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly'
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

export default connect(mapStateToProps, mapDispatchToProps)(MyServiceDetailScreen)
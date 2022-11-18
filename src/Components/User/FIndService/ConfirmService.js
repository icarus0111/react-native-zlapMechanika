import * as React from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-easy-toast';
import MapView, { Marker } from 'react-native-maps';
import { NavigationActions, StackActions } from 'react-navigation';
import { connect } from 'react-redux';
import COLORS from '../../../Config/Colors';
import DEVICES from '../../../Config/Devices';
import STRINGS from '../../../Config/Strings';
import STYLES from '../../../Config/Styles';
import { login } from '../../../Redux/Actions/Auth';

class ConfirmServiceScreen extends React.Component {

  static navigationOptions = ({ navigation }) => ({
    title: STRINGS.headers.confirm_service,
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
      confirmService: {},
      region: {
        latitude: 51.9194,
        longitude: 19.1451,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }
    }
  }

  componentDidMount() {
    this.setState({ confirmService: this.props.navigation.state.params.item })

  }

  onCall() {
    Linking.openURL(`tel:${this.state.confirmService.phone}`)
  }

  onNavigate() {
    this.setState({
      region: {
        latitude: parseFloat(this.state.confirmService.lat),
        longitude: parseFloat(this.state.confirmService.lon),
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }
    })
  }

  onConfirm() {

    idQuery = this.props.navigation.state.params.idQuery
    idPropose = this.props.navigation.state.params.idPropose

    fetch(STRINGS.link.server + '/services/chooseService?lang=pl-pl&idUser=' + this.props.Credential.idUser + '&key=' + this.props.Credential.key + '&idQuery=' + idQuery + '&idPropose=' + idPropose)
      .then(response => response.json())
      .then((responseJson) => {
        if (!responseJson.hasOwnProperty('errno')) {
          this.refs.toast.show('Successfully confirmed', 2000);
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
            this.onConfirm()

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

  render() {
    return (
      <ScrollView style={{ flex: 1 }}>
        <View style={STYLES.container}>
          <View style={styles.mapView}>
            <MapView
              region={this.state.region}
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
            <Text style={[STYLES.label, { marginVertical: 10 }]}>{this.state.confirmService.contractorName}</Text>
            <Text style={STYLES.grayLabel}>Contractor</Text>
            <Text style={[STYLES.label, { fontWeight: '500' }]}>{this.state.confirmService.address}</Text>
            <Text style={STYLES.label}>{this.state.confirmService.postalCode} {this.state.confirmService.city}</Text>
            <Text style={STYLES.grayLabel}>Vehicle</Text>
            <Text style={STYLES.label}>{this.state.confirmService.vehicleMake} {this.state.confirmService.vehicleModel} {this.state.confirmService.vehicleYear}</Text>
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
              <Text style={STYLES.grayLabel}>Approximity price:</Text>
              <Text style={[STYLES.label, { fontWeight: '500' }]}>From 1200 to 2100</Text>
            </View>
          </View>
          <View style={styles.footer}>
            <TouchableOpacity style={STYLES.defaultButton} onPress={() => this.onConfirm()}>
              <Text style={STYLES.defaultButtonText}>{STRINGS.buttons.confirm}</Text>
              <Image source={require('../../../assets/icons/check.png')} style={STYLES.image24} />
            </TouchableOpacity>
          </View>
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
    marginTop: 5,
    paddingHorizontal: DEVICES.screenWidth * 0.075
  },
  footer: {
    marginVertical: 30,
    alignItems: 'center',
    justifyContent: 'center'
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

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmServiceScreen)
import * as React from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { NavigationActions, StackActions } from 'react-navigation';
import { connect } from 'react-redux';
import COLORS from '../../../Config/Colors';
import DEVICES from '../../../Config/Devices';
import STRINGS from '../../../Config/Strings';
import STYLES from '../../../Config/Styles';
import { login } from '../../../Redux/Actions/Auth';

class SelectContractorScreen extends React.Component {

  static navigationOptions = ({ navigation }) => ({
    title: STRINGS.headers.select_contractor,
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
      contractors: [],
      proposals: [],
      serviceName: '',
      idPropose: 0
    }
  }

  componentDidMount() {
    this.findContractor()
    this.findProposal1()
    this.setState({ serviceName: this.props.navigation.state.params.serviceName })
  }

  findContractor() {

    let idService = this.props.navigation.getParam('idService', 'default')
    let locationLat = this.props.navigation.getParam('locationLat', 'default')
    let locationLon = this.props.navigation.getParam('locationLon', 'default')

    fetch(STRINGS.link.server + '/services/findContractor?lang=plpl&idService=' + idService + '&locationLat=' + locationLat + '&locationLon=' + locationLon + '&page=1')
      .then(response => response.json())
      .then((responseJson) => {

        if (!responseJson.hasOwnProperty('errno')) {
          if (responseJson.hasOwnProperty('contractors')) {
            this.setState({ contractors: responseJson.contractors })
          } else {
            this.setState({ contractors: responseJson })
          }
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
            this.findContractor()

          } else { this.autoLogin() }
        })
        .catch(error => console.log('profile error ----->', error), this.autoLogin())

    } else { this.autoLogin() }
  }

  goToLogin() {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Auth' })],
    })
    this.props.navigation.dispatch(resetAction)
  }

  findProposal1() {

    let idQuery = this.props.navigation.getParam('idQuery', 'default');

    fetch(STRINGS.link.server + '/services/findProposal?lang=plpl&idUser=' + this.props.User.idUser + '&key=' + this.props.User.key + '&idQuery=' + idQuery + '&idPropose=0')
      .then(response => response.json())
      .then((responseJson) => {

        if (!responseJson.hasOwnProperty('errno')) {
          this.findProposal2(responseJson.requery)
        }
      })
      .catch(error => console.log(error))
  }

  findProposal2(idPropose) {

    let idQuery = this.props.navigation.getParam('idQuery', 'default');

    fetch(STRINGS.link.server + '/services/findProposal?lang=plpl&idUser=' + this.props.User.idUser + '&key=' + this.props.User.key + '&idQuery=' + idQuery + '&idPropose=' + idPropose)
      .then(response => response.json())
      .then((responseJson) => {

        if (!responseJson.hasOwnProperty('errno')) {
          this.setState({ idPropose: responseJson.idPropose })
        }
      })
      .catch(error => console.log(error))
  }

  vehicle = () => {
    let profile = this.props.Profile.profile
    let vehicle = JSON.parse(profile).vehicleMake + ' ' + JSON.parse(profile).vehicleModel + ' (year ' + JSON.parse(profile).vehicleYear + ')'
    return vehicle
  }

  onCall(phone) {
    Linking.openURL(`tel:${phone}`)
  }

  onConfirm(item) {
    this.props.navigation.navigate('ConfirmService', {
      item: item,
      idQuery: this.props.navigation.state.params.idQuery,
      idPropose: this.state.idPropose
    })
  }

  render() {
    return (
      <View style={STYLES.container}>
        <View style={styles.header}>
          <Text style={[STYLES.label, { marginBottom: 5 }]}>{this.state.serviceName}</Text>
          <Text style={STYLES.grayLabel}>Vehicle</Text>
          <Text style={STYLES.label}>{this.vehicle()}</Text>
          <Text style={STYLES.grayLabel}>Order date</Text>
          <Text style={STYLES.label}>2019-08-26</Text>
        </View>
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.content}>
            {
              this.state.contractors.map((item, key) => (
                <TouchableOpacity
                  style={styles.button}
                  key={key}
                  onPress={() => this.onConfirm(item)}>
                  <View style={styles.buttonDetailView}>
                    <Text style={[STYLES.label, { fontSize: 14, fontWeight: '500', color: COLORS.greenText }]}>Proposal</Text>
                    <Text style={[STYLES.label, { fontWeight: '700', color: COLORS.greenText }]}>{item.contractorName}</Text>
                    <Text style={[STYLES.label, { color: COLORS.greenText }]}>{item.address} {item.postalCode} {item.city}</Text>
                  </View>
                  <View style={styles.buttonCallView}>
                    <TouchableOpacity onPress={() => this.onCall(item.phone)}>
                      <FontAwesome name='phone-square' size={50} color={COLORS.appColor} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            }
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    paddingVertical: 20,
    paddingHorizontal: DEVICES.screenWidth * 0.05,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator
  },
  content: {
    flex: 1,
    flexDirection: 'column'
  },
  button: {
    height: 100,
    paddingHorizontal: DEVICES.screenWidth * 0.05,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
    flexDirection: 'row',
  },
  buttonDetailView: {
    flex: 1,
    justifyContent: 'center'
  },
  buttonCallView: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.black
  }
})

const mapStateToProps = state => ({
  Credential: state.Credential,
  User: state.User,
  FcmToken: state.FcmToken,
  Profile: state.Profile
})

const mapDispatchToProps = (dispatch) => {
  return {
    Login: (idUser, key, role) => { dispatch(login(idUser, key, role)) },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectContractorScreen)
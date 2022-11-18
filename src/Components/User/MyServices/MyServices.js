import * as React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIndicator } from 'react-native-indicators';
import { NavigationActions, StackActions } from 'react-navigation';
import { connect } from 'react-redux';
import COLORS from '../../../Config/Colors';
import STRINGS from '../../../Config/Strings';
import STYLES from '../../../Config/Styles';
import { login } from '../../../Redux/Actions/Auth';

class MyServicesScreen extends React.Component {

  static navigationOptions = ({ navigation }) => ({
    title: STRINGS.headers.my_services,
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
      myServices: [],
      loading: false
    }
  }

  componentDidMount() {
    this.getQueryMyList()
  }

  getQueryMyList() {

    this.setState({ loading: true })

    fetch(STRINGS.link.server + '/services/queryMyList?lang=pl-pl&idUser=' + this.props.Credential.idUser + '&key=' + this.props.Credential.key + '&page=1')
      .then(response => response.json())
      .then((responseJson) => {

        this.setState({ loading: false })

        if (!responseJson.hasOwnProperty('errno')) {
          if (responseJson.hasOwnProperty('query')) {
            this.setState({ myServices: responseJson.query })
          } else {
            this.setState({ myServices: responseJson })
          }
        } else {
          if (responseJson.errno == 9) {
            this.autoLogin()
          } else {
            this.refs.toast.show(responseJson.error, 2000)
          }
        }
      })
      .catch(error => this.setState({ loading: false }, () => console.log(error)))
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
            this.getQueryMyList()

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

  onItemClick(item) {
    if (item.status == '0') {
      this.props.navigation.navigate('SelectContractor', {
        serviceName: item.serviceName,
        idService: item.idService,
        locationLat: item.locationLat,
        locationLon: item.locationLon,
        idQuery: item.idQuery
      })
    } else {
      this.props.navigation.navigate('MyServiceDetail', {
        item: item
      })
    }
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
      this.state.loading ?
        <MaterialIndicator color={COLORS.appColor} size={60} />
        :
        <ScrollView style={{ flex: 1 }}>
          <View style={STYLES.container}>
            <View style={styles.content}>
              {
                this.state.myServices.map((item, key) => (
                  <TouchableOpacity
                    style={STYLES.rowDefaultButton}
                    onPress={() => this.onItemClick(item)}
                    key={key}>
                    <Text style={[STYLES.label, { fontWeight: '500' }]}>{item.serviceName}</Text>
                    <Text style={STYLES.label}>{item.vehicleMake} {item.vehicleModel} (year {item.vehicleYear})</Text>
                    <Text style={STYLES.label}>{this.status(item.status)}</Text>
                  </TouchableOpacity>
                ))
              }
            </View>
          </View>
        </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: 'column'
  }
})

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

export default connect(mapStateToProps, mapDispatchToProps)(MyServicesScreen)
import AsyncStorage from '@react-native-community/async-storage';
import * as React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-easy-toast';
import { NavigationActions, StackActions } from 'react-navigation';
import { connect } from 'react-redux';
import COLORS from '../../Config/Colors';
import STRINGS from '../../Config/Strings';
import STYLES from '../../Config/Styles';
import { login } from '../../Redux/Actions/Auth';

class ServicesListScreen extends React.Component {

  static navigationOptions = ({ navigation }) => ({
    title: STRINGS.headers.services_list,
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
      servicesList: [],
      services: []
    }
  }

  componentDidMount() {
    this.getAllServices()
    this.getServicesList()
  }

  getServicesList() {

    let query = '&idUser=' + this.props.Credential.idUser + '&key=' + this.props.Credential.key + '&type=' + this.props.navigation.state.params.type + '&page=1'

    fetch(STRINGS.link.server + '/services/queryServices?lang=pl-pl' + query)
      .then(response => response.json())
      .then((responseJson) => {

        if (!responseJson.hasOwnProperty('errno')) {
          if (responseJson.hasOwnProperty('query')) {
            this.setState({ servicesList: responseJson.query })
          } else {
            this.setState({ servicesList: responseJson })
          }
          if (responseJson.length == 0 || responseJson.query && responseJson.query.length == 0) {
            this.refs.toast.show('No result', 2000);
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
            this.getServicesList()

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

  getAllServices() {
    fetch(STRINGS.link.server + '/services/list?lang=pl-pl')
      .then(response => response.json())
      .then((responseJson) => {
        this.setState({ services: responseJson.categories })
      })
      .catch(error => console.log(error))
  }

  getServiceInfo = (idService) => {
    for (let i = 0; i < this.state.services.length; i++) {
      if (this.state.services[i].idService == idService) {
        return this.state.services[i].name
      }
    }
  }

  onDetail(item) {
    if (item.status == '0') {
      this.props.navigation.navigate('ServicesWating', {
        item: item,
        service_name: this.getServiceInfo(item.idService)
      })
    } else if (item.status == '1') {
      this.props.navigation.navigate('ServicesWating', {
        item: item,
        service_name: this.getServiceInfo(item.idService)
      })
    } else if (item.status == '2') {
      this.props.navigation.navigate('ServicesContracted', {
        item: item,
        service_name: this.getServiceInfo(item.idService)
      })
    } else if (item.status == '3') {
      this.props.navigation.navigate('ServicesContracted', {
        item: item,
        service_name: this.getServiceInfo(item.idService)
      })
    }
  }

  render() {
    return (
      <View style={STYLES.container}>
        <View style={styles.content}>
          {
            this.state.servicesList && this.state.servicesList.map((item, key) => (
              <TouchableOpacity
                style={styles.optionsButton}
                onPress={() => this.onDetail(item)}
                key={key}>
                <Text style={[styles.optionsButton_text, { fontWeight: '500' }]}>{this.getServiceInfo(item.idService)}</Text>
                <Text style={styles.optionsButton_text}>{item.vehicleMake} {item.vehicleModel} {item.vehicleYear}</Text>
                <Text style={styles.optionsButton_text}>{item.expectedDate}</Text>
              </TouchableOpacity>
            ))
          }
        </View>
        <Toast ref='toast' position='center' />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: 'column'
  },
  optionsButton: {
    height: 80,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
    paddingHorizontal: 20,
    justifyContent: 'center'
  },
  optionsButton_text: {
    fontSize: 16,
    fontWeight: '300',
    color: COLORS.black
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

export default connect(mapStateToProps, mapDispatchToProps)(ServicesListScreen)
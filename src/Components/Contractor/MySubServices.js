import AsyncStorage from '@react-native-community/async-storage';
import * as React from 'react';
import { BackHandler, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CheckBox from 'react-native-check-box';
import Toast from 'react-native-easy-toast';
import { MaterialIndicator } from 'react-native-indicators';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { NavigationActions, StackActions } from 'react-navigation';
import { connect } from 'react-redux';
import COLORS from '../../Config/Colors';
import DEVICES from '../../Config/Devices';
import STRINGS from '../../Config/Strings';
import STYLES from '../../Config/Styles';
import { saveIdServices } from '../../Redux/Actions/IdServices';
import { login } from '../../Redux/Actions/Auth';

class MySubServicesScreen extends React.Component {

  /*static navigationOptions = ({ navigation }) => ({
      title: STRINGS.headers.profile,
      headerTitleStyle: { fontSize: 18, fontWeight: '400' },
      headerStyle: {
          backgroundColor: COLORS.appColor,
          shadowColor: COLORS.appColor,
          height: 48
      },
      headerTintColor: COLORS.white,
      headerLeft: <View style={{ paddingHorizontal: 8 }}>
          <TouchableOpacity onPress={() => this.backPressed()} >
              <Image source={require('../../assets/icons/arrow-left.png')} style={STYLES.image24} />
          </TouchableOpacity>
      </View>,
      headerRight: <View style={{ paddingHorizontal: 4 }}>
          <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
              <Image source={require('../../assets/icons/menu.png')} style={STYLES.image36} />
          </TouchableOpacity>
      </View>
  })*/

  constructor() {
    super();
    this.state = {
      services: [],
      subCategories: [],
      checks: [],
      loading: false,
      idParents: []
    }
  }

  componentDidMount() {
    this.props.navigation.addListener('willFocus', () => BackHandler.addEventListener('hardwareBackPress', this.backPressed))
    this.props.navigation.addListener('willBlur', () => BackHandler.removeEventListener('hardwareBackPress', this.backPressed))
    let idParent = this.props.navigation.getParam('idParent', 'default');
    this.setState({ subCategories: [] }, () => this.getServicesList(idParent))
  }

  backPressed = () => {
    if (this.state.idParents.length > 1) {
      let temp3 = this.state.idParents
      temp3.splice(this.state.idParents.length - 1, 1)
      this.setState({ idParents: temp3 })
      this.returnServicesList(temp3[temp3.length - 1])
    } else {
      this.setState({ idParents: [] })
      this.props.navigation.goBack()
    }
    return true;
  }

  getServicesList(idParent) {
    let temp2 = this.state.idParents
    temp2.push(idParent)
    this.setState({ loading: true, idParents: temp2 })
    fetch(STRINGS.link.server + '/services/list?lang=pl-pl')
      .then(response => response.json())
      .then((responseJson) => {
        let temp = []
        let temp1 = []
        for (let i = 0; i < responseJson.categories.length; i++) {
          if (responseJson.categories[i].idParent == idParent) {
            temp.push(responseJson.categories[i])
            temp1.push({ isChecked: false })
          }
        }
        this.setState({ services: responseJson.categories, subCategories: temp, checks: temp1, loading: false })
      })
      .catch(error => console.log(error))
  }

  returnServicesList(idParent) {
    this.setState({ loading: true })
    fetch(STRINGS.link.server + '/services/list?lang=pl-pl')
      .then(response => response.json())
      .then((responseJson) => {
        let temp = []
        let temp1 = []
        for (let i = 0; i < responseJson.categories.length; i++) {
          if (responseJson.categories[i].idParent == idParent) {
            temp.push(responseJson.categories[i])
            temp1.push({ isChecked: false })
          }
        }
        this.setState({ services: responseJson.categories, subCategories: temp, checks: temp1, loading: false })
      })
      .catch(error => console.log(error))
  }

  haveSub = (idService, key) => {
    let count = 0;
    for (let i = 0; i < this.state.services.length; i++) {
      if (this.state.services[i].idParent == idService) {
        count++;
      }
    }
    if (count > 0) {
      return <View style={{ width: 30 }}></View>
    } else {
      return <View style={{ width: 30, justifyContent: 'center' }}>
        <CheckBox
          onClick={() => this.onCheck(key)}
          isChecked={this.state.checks[key].isChecked}
          checkBoxColor={COLORS.appColor} />
      </View>
    }
  }

  haveArrow = (idService, key) => {
    let count = 0;
    for (let i = 0; i < this.state.services.length; i++) {
      if (this.state.services[i].idParent == idService) {
        count++;
      }
    }
    if (count > 0) {
      return <Image source={require('../../assets/icons/right.png')} style={STYLES.image24} />
    } else {
      return <View></View>
    }
  }

  onSelect(item) {
    let count = 0;
    for (let i = 0; i < this.state.services.length; i++) {
      if (this.state.services[i].idParent == item.idService) {
        count++;
      }
    }
    if (count > 0) {
      let idServices = ''
      for (let i = 0; i < this.state.checks.length; i++) {
        if (this.state.checks[i].isChecked == true) {
          idServices = idServices + this.state.categories[i].idService + ','
        }
      }
      this.getServicesList(item.idService)
    }
  }

  onCheck(key) {
    let newArray = [...this.state.checks];
    newArray[key].isChecked = !newArray[key].isChecked;
    this.setState({ checks: newArray }, () => this.updateIdServices());
  }

  updateIdServices() {
    let idServices = ''
    if (this.state.checks.length > 0) {
      for (let i = 0; i < this.state.checks.length; i++) {
        if (this.state.checks[i].isChecked == true) {
          idServices = idServices + this.state.subCategories[i].idService + ','
        }
      }
      idServices = this.props.IdServices.idServices + idServices
      this.props.saveIdServices(idServices)
    }
  }

  onSave() {

    let idServices = this.props.IdServices.idServices
    if (idServices.length > 0) {
      idServices = idServices.slice(0, -1)
    }

    let query = 'idUser=' + this.props.User.idUser + '&key=' + this.props.User.key + '&idServices=' + idServices

    fetch(STRINGS.link.server + '/user/profileUpdate?lang=pl-pl&' + query)
      .then(response => response.json())
      .then((responseJson) => {
        if (!responseJson.hasOwnProperty('errno')) {
          this.refs.toast.show('Successfully saved', 2000);
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
            this.onSave()

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
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={this.backPressed}>
              <Image source={require('../../assets/icons/arrow-left.png')} style={STYLES.image24} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{STRINGS.headers.profile}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => this.props.navigation.toggleDrawer()}>
              <Image source={require('../../assets/icons/menu.png')} style={STYLES.image36} />
            </TouchableOpacity>
          </View>
        </View>
        {this.state.loading ?
          <MaterialIndicator color={COLORS.appColor} size={60} />
          :
          <ScrollView style={{ flex: 1 }}>
            <View style={STYLES.container}>
              <View style={styles.content}>
                {
                  this.state.subCategories.map((item, key) => (
                    <TouchableOpacity onPress={() => this.onSelect(item)}
                      style={STYLES.rowCategoryButton}
                      key={key}>
                      <View style={{ flexDirection: 'row' }}>
                        {this.haveSub(item.idService, key)}
                        <Text style={[STYLES.label, { width: DEVICES.screenWidth * 0.65 }]}>{item.name}</Text>
                      </View>
                      {this.haveArrow(item.idService, key)}
                    </TouchableOpacity>
                  ))
                }
                <TouchableOpacity style={[STYLES.defaultButton, { alignSelf: 'center', marginVertical: 20 }]} onPress={() => this.onSave()}>
                  <Text style={STYLES.defaultButtonText}>{STRINGS.buttons.save}</Text>
                  <FontAwesome name='save' size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
              <Toast ref='toast' position='center' />
            </View>
          </ScrollView>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    height: 48,
    backgroundColor: COLORS.appColor,
    elevation: 5,
    flexDirection: 'row'
  },
  headerLeft: {
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerRight: {
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: COLORS.white
  },
  content: {
    flex: 1,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.appColor
  }
});

const mapStateToProps = state => ({
  Credential: state.Credential,
  User: state.User,
  FcmToken: state.FcmToken,
  IdServices: state.IdServices
})

const mapDispatchToProps = (dispatch) => {
  return {
    Login: (idUser, key, role) => { dispatch(login(idUser, key, role)) },
    saveIdServices: (idServices) => { dispatch(saveIdServices(idServices)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MySubServicesScreen)
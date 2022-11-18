import AsyncStorage from '@react-native-community/async-storage';
import * as React from 'react';
import { BackHandler, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CheckBox from 'react-native-check-box';
import Toast from 'react-native-easy-toast';
import { MaterialIndicator } from 'react-native-indicators';
import { connect } from 'react-redux';
import COLORS from '../../Config/Colors';
import DEVICES from '../../Config/Devices';
import STRINGS from '../../Config/Strings';
import STYLES from '../../Config/Styles';
import { login } from '../../Redux/Actions/Auth';
import { saveProfile } from '../../Redux/Actions/Profile';
import { saveUser } from '../../Redux/Actions/User';

class LoginScreen extends React.Component {

  constructor() {
    super();
    this.passwordInputRef = React.createRef();
    this.state = {
      phonenumber: '',
      password: '',
      rememberMe: false,
      loading: false
    }
  }

  componentDidMount() {
    this.props.navigation.addListener('willFocus', () => BackHandler.addEventListener('hardwareBackPress', this.backPressed));
    this.props.navigation.addListener('willBlur', () => BackHandler.removeEventListener('hardwareBackPress', this.backPressed));
  }

  backPressed = () => {
    BackHandler.exitApp()
    return true
  }

  handlePhonenumberSubmitPress = () => {
    if (this.passwordInputRef.current) {
      this.passwordInputRef.current.focus();
    }
  }

  onLogin() {

    if (this.state.phonenumber == '') {
      this.refs.toast.show('Phone number should not be empty', 2000);
    } else if (this.state.password == '') {
      this.refs.toast.show('Password should not be empty', 2000);
    } else {

      this.setState({ loading: true })

      fetch(STRINGS.link.server + '/user/login?lang=pl-pl&phone=' + this.state.phonenumber + '&password=' + this.state.password + '&notifyToken=' + this.props.FcmToken.fcmToken)
        .then(response => response.json())
        .then((responseJson) => {

          console.log('login ----- login api ----->', responseJson)
          this.setState({ loading: false })

          if (!responseJson.hasOwnProperty('errno')) {

            let credential = {
              idUser: responseJson.idUser,
              key: responseJson.key,
              type: responseJson.type
            }

            if (responseJson.profileMissing) {
              if (credential.type == '1') {
                this.setState({ phonenumber: '', password: '' }, () => this.props.navigation.navigate('UserProfile'))
              } else {
                this.setState({ phonenumber: '', password: '' }, () => this.props.navigation.navigate('ContractorProfile'))
              }
            } else {
              fetch(STRINGS.link.server + '/user/profile?idUser=' + credential.idUser + '&key=' + credential.key)
                .then(response => response.json())
                .then((responseJson) => {

                  if (!responseJson.hasOwnProperty('errno')) {
                    this.saveUserToAsyc()
                    this.props.SaveUser(JSON.stringify({
                      phonenumber: this.state.phonenumber,
                      password: this.state.password,
                      logged: this.state.rememberMe
                    }))
                    this.props.Login(credential.idUser, credential.key, credential.type)

                    if (credential.type == '1') {
                      this.props.SaveProfile(JSON.stringify({
                        name: responseJson.name,
                        surname: responseJson.surname,
                        vehicleMake: responseJson.vehicleMake,
                        vehicleModel: responseJson.vehicleModel,
                        vehicleYear: responseJson.vehicleYear,
                        vehicleMotorType: responseJson.vehicleMotorType,
                        idVehicleMotorType: responseJson.idVehicleMotorType,
                        vehiclePlate: responseJson.vehiclePlate,
                        idUser: responseJson.idUser,
                        type: responseJson.type,
                        phone: responseJson.phone,
                        dateCreated: responseJson.dateCreated
                      }))
                      this.setState({ phonenumber: '', password: '' }, () => this.props.navigation.navigate('UserOptionsStack'))
                    } else {
                      this.props.SaveProfile(JSON.stringify({
                        name: responseJson.name,
                        surname: responseJson.surname,
                        contractor_name: responseJson.contractor_name,
                        address: responseJson.address,
                        postal_code: responseJson.postal_code,
                        city: responseJson.city,
                        lat: responseJson.lat,
                        lon: responseJson.lon,
                        idUser: responseJson.idUser,
                        type: responseJson.type,
                        phone: responseJson.phone,
                        dateCreated: responseJson.dateCreated,
                        idServices: responseJson.idServices
                      }))
                      this.setState({ phonenumber: '', password: '' }, () => this.props.navigation.navigate('ContractorOptionsStack'))
                    }
                  } else {
                    this.refs.toast.show(responseJson.error, 2000)
                  }
                })
                .catch(error => console.log('profile error ----->', error))
            }

          } else {

            if (responseJson.errno == 13) {
              this.props.navigation.navigate('AccountVerification', { idUser: responseJson.idUser })
            } else {
              this.refs.toast.show(responseJson.error, 2000)
            }
          }
        })
        .catch(error => this.setState({ loading: false }, () => console.log('login error ----->', error)))
    }
  }

  async saveUserToAsyc() {
    await AsyncStorage.setItem('@zlap_user', JSON.stringify({
      phonenumber: this.state.phonenumber,
      password: this.state.password,
      logged: this.state.rememberMe
    }))
  }

  onRegister() {
    this.props.navigation.navigate('RegisterationPhone')
  }

  render() {
    return (
      <View style={STYLES.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={this.backPressed}>
              <Image source={require('../../assets/icons/arrow-left.png')} style={STYLES.image24} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{STRINGS.headers.login}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity>
              <Image source={require('../../assets/icons/menu.png')} style={STYLES.image36} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.content}>
          <Image source={require('../../assets/icons/login.png')} style={{ alignSelf: 'center', marginVertical: 10, width: 48, height: 48, resizeMode: 'contain' }} />
          <View style={STYLES.formView}>
            <TextInput
              style={STYLES.formTextInput}
              placeholder='Phone number'
              value={this.state.phonenumber}
              onChangeText={(text) => this.setState({ phonenumber: text })}
              onSubmitEditing={this.handlePhonenumberSubmitPress}
              autoCorrect={false}
              keyboardType='phone-pad'
              returnKeyType='next'
            />
          </View>
          <View style={STYLES.formView}>
            <TextInput
              style={STYLES.formTextInput}
              placeholder='Password'
              ref={this.passwordInputRef}
              value={this.state.password}
              onChangeText={(text) => this.setState({ password: text })}
              secureTextEntry={true}
              returnKeyType='done'
            />
          </View>
          <CheckBox
            onClick={() => this.setState({ rememberMe: !this.state.rememberMe })}
            isChecked={this.state.rememberMe}
            checkBoxColor={COLORS.appColor}
            rightText={STRINGS.checkBox.remember_password}
            rightTextStyle={STYLES.label}
          />
          <TouchableOpacity style={[STYLES.authButton, { marginTop: 50 }]} onPress={() => this.onLogin()}>
            <Text style={STYLES.authButtonText}>{STRINGS.buttons.login}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ alignSelf: 'center', marginTop: 20 }} onPress={() => this.onRegister()}>
            <Text style={[STYLES.authButtonText, { color: COLORS.appColor }]}>{STRINGS.buttons.register}</Text>
          </TouchableOpacity>
        </View>
        {
          this.state.loading ?
            <MaterialIndicator color={COLORS.appColor} size={60} />
            :
            <View />
        }
        <Toast ref='toast' position='center' />
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
    paddingHorizontal: DEVICES.screenWidth * 0.1,
    flexDirection: 'column'
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.black,
    textAlign: 'center',
    paddingVertical: 10
  }
});

const mapStateToProps = state => {
  return {
    FcmToken: state.FcmToken
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    Login: (idUser, key, role) => { dispatch(login(idUser, key, role)) },
    SaveUser: (user) => { dispatch(saveUser(user)) },
    SaveProfile: (profile) => { dispatch(saveProfile(profile)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen)
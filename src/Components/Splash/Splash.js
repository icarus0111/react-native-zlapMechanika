import AsyncStorage from '@react-native-community/async-storage';
import * as React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import { login } from '../../Redux/Actions/Auth';
import { saveUser } from '../../Redux/Actions/User';
import { saveProfile } from '../../Redux/Actions/Profile';

class SplashScreen extends React.Component {

  constructor() {
    super();
    this.state = {}
  }

  componentDidMount() {
    this.autoLogin()
  }

  async autoLogin() {

    let fcmToken = await AsyncStorage.getItem('@zlap_fcmToken')
    let user = await AsyncStorage.getItem('@zlap_user')

    if (user == null) {
      this.props.navigation.navigate('Login')
    } else {
      if (JSON.parse(user).logged) {

        this.props.SaveUser(user)

        fetch(STRINGS.link.server + '/user/login?lang=pl-pl&phone=' + JSON.parse(user).phonenumber + '&password=' + JSON.parse(user).password + '&notifyToken=' + fcmToken)
          .then(response => response.json())
          .then((responseJson) => {

            if (!responseJson.hasOwnProperty('errno')) {

              let credential = {
                idUser: responseJson.idUser,
                key: responseJson.key,
                type: responseJson.type
              }

              if (responseJson.profileMissing) {
                if (credential.type == '1') {
                  this.props.navigation.navigate('UserProfile')
                } else {
                  this.props.navigation.navigate('ContractorProfile')
                }
              } else {
                fetch(STRINGS.link.server + '/user/profile?idUser=' + credential.idUser + '&key=' + credential.key)
                  .then(response => response.json())
                  .then((responseJson) => {

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
                      this.props.navigation.navigate('UserOptions')
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
                      this.props.navigation.navigate('ContractorOptions')
                    }
                  })
                  .catch(error => console.log('profile error ----->', error), this.props.navigation.navigate('Login'))
              }
            } else {
              this.props.navigation.navigate('Login')
            }
          })
          .catch(error => console.log('login error ----->', error), this.props.navigation.navigate('Login'))
      } else {
        this.props.navigation.navigate('Login')
      }
    }
  }

  render() {
    return false;
  }
}

const mapStateToProps = state => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    Login: (idUser, key, role) => { dispatch(login(idUser, key, role)) },
    SaveUser: (user) => { dispatch(saveUser(user)) },
    SaveProfile: (profile) => { dispatch(saveProfile(profile)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SplashScreen)
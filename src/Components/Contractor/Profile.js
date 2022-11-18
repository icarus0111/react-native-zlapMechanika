import * as React from 'react';
import { Image, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-easy-toast';
import MapView from 'react-native-maps';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationActions, StackActions } from 'react-navigation';
import { connect } from 'react-redux';
import COLORS from '../../Config/Colors';
import DEVICES from '../../Config/Devices';
import STRINGS from '../../Config/Strings';
import STYLES from '../../Config/Styles';
import { login } from '../../Redux/Actions/Auth';
import { saveProfile } from '../../Redux/Actions/Profile';

class ContractorProfileScreen extends React.Component {

  static navigationOptions = ({ navigation }) => ({
    title: STRINGS.headers.profile,
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
    this.surenameInputRef = React.createRef();
    this.contractorNameInputRef = React.createRef();
    this.addressInputRef = React.createRef();
    this.postalCodeInputRef = React.createRef();
    this.cityInputRef = React.createRef();
    this.state = {
      name: '',
      surname: '',
      idServices: [],
      idServicesString: '',
      contractor_name: '',
      address: '',
      postal_code: '',
      city: '',
      lat: '',
      lon: '',
      region: {
        latitude: 51.9194,
        longitude: 19.1451,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }
    }
  }

  componentDidMount() {
    this.getProfile()
  }

  handleNameSubmitPress = () => {
    if (this.surnameInputRef.current) {
      this.surnameInputRef.current.focus();
    }
  }

  handleSurnameSubmitPress = () => {
    if (this.contractorNameInputRef.current) {
      this.contractorNameInputRef.current.focus();
    }
  }

  handleContractorNameSubmitPress = () => {
    if (this.addressInputRef.current) {
      this.addressInputRef.current.focus();
    }
  }

  handleAddressSubmitPress = () => {
    if (this.postalCodeInputRef.current) {
      this.postalCodeInputRef.current.focus();
    }
  }

  handlePostalCodeSubmitPress = () => {
    if (this.cityInputRef.current) {
      this.cityInputRef.current.focus();
    }
  }

  getProfile() {

    let profile = this.props.Profile.profile
    let temp = ''
    for (let i = 0; i < JSON.parse(profile).idServices.length; i++) {
      if (i < (JSON.parse(profile).idServices.length - 1)) {
        temp = temp + JSON.parse(profile).idServices[i] + ','
      } else {
        temp = temp + JSON.parse(profile).idServices[i]
      }
    }
    let temp1 = {
      latitude: parseFloat(JSON.parse(profile).lat),
      longitude: parseFloat(JSON.parse(profile).lon),
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421
    }
    this.setState({
      name: JSON.parse(profile).name,
      surname: JSON.parse(profile).surname,
      idServices: JSON.parse(profile).idServices,
      contractor_name: JSON.parse(profile).contractor_name,
      address: JSON.parse(profile).address,
      postal_code: JSON.parse(profile).postal_code,
      city: JSON.parse(profile).city,
      lat: JSON.parse(profile).lat,
      lon: JSON.parse(profile).lon
    })

    this.setState({ idServicesString: temp, region: temp1 })
  }

  onRegionChange(region) {
    this.setState({ region, lat: region.latitude, lon: region.longitude }, () => console.log(region))
  }

  onRegionChangeComplete(region) {
    this.setState({ region, lat: region.latitude, lon: region.longitude }, () => console.log(region))
  }

  onSave() {

    let query = 'idUser=' + this.props.Credential.idUser + '&key=' + this.props.Credential.key + '&contractorName=' + this.state.contractor_name +
      '&address=' + this.state.address + '&postalCode=' + this.state.postal_code + '&city=' + this.state.city +
      '&name=' + this.state.name + '&surname=' + this.state.surname + '&lat=' + this.state.lat + '&lon=' + this.state.lon

    fetch(STRINGS.link.server + '/user/profileUpdate?' + query)
      .then(response => response.json())
      .then((responseJson) => {

        if (!responseJson.hasOwnProperty('errno')) {
          this.refs.toast.show('Successfully updated', 2000)
          this.props.SaveProfile(JSON.stringify({
            name: this.state.name,
            surname: this.state.surname,
            idServices: this.state.idServices,
            contractor_name: this.state.contractor_name,
            address: this.state.address,
            postal_code: this.state.postal_code,
            city: this.state.city,
            lat: this.state.lat,
            lon: this.state.lon,
            type: 2
          }))
          this.props.navigation.navigate('ContractorOptionsStack')
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

  onMyServices() {
    this.props.navigation.navigate('ContractorMyServices')
  }

  render() {
    return (
      <ScrollView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={STYLES.container} behavior='padding'>
          <View style={styles.content}>
            <Text style={styles.contentTitle}>{STRINGS.profile.contractor}</Text>
            <View style={styles.contentBody}>
              <View style={STYLES.formView}>
                <TextInput
                  style={STYLES.formTextInput}
                  placeholder='Name'
                  value={this.state.name}
                  onSubmitEditing={this.handleNameSubmitPress}
                  onChangeText={(text) => this.setState({ name: text })}
                  keyboardType='default'
                  returnKeyType='next'
                />
              </View>
              <View style={STYLES.formView}>
                <TextInput
                  style={STYLES.formTextInput}
                  placeholder='Surname'
                  ref={this.surenameInputRef}
                  value={this.state.surname}
                  onSubmitEditing={this.handleSurnameSubmitPress}
                  onChangeText={(text) => this.setState({ surname: text })}
                  returnKeyType='next'
                />
              </View>
            </View>
            <View style={styles.contentBody}>
              <View style={STYLES.formView}>
                <TextInput
                  style={STYLES.formTextInput}
                  placeholder='Contractor Name'
                  value={this.state.contractor_name}
                  ref={this.contractorNameInputRef}
                  onSubmitEditing={this.handleContractorNameSubmitPress}
                  onChangeText={(text) => this.setState({ contractor_name: text })}
                  returnKeyType='next'
                />
              </View>
              <View style={STYLES.formView}>
                <TextInput
                  style={STYLES.formTextInput}
                  placeholder='Address'
                  value={this.state.address}
                  ref={this.addressInputRef}
                  onSubmitEditing={this.handleAddressSubmitPress}
                  onChangeText={(text) => this.setState({ address: text })}
                  returnKeyType='next'
                />
              </View>
              <View style={[STYLES.formView, { flexDirection: 'row' }]}>
                <TextInput
                  style={[STYLES.formTextInput, { flex: 1 }]}
                  placeholder='Postal code'
                  value={this.state.postal_code}
                  ref={this.postalCodeInputRef}
                  onSubmitEditing={this.handlePostalCodeSubmitPress}
                  onChangeText={(text) => this.setState({ postal_code: text })}
                  returnKeyType='done'
                />
                <TextInput
                  style={[STYLES.formTextInput, { flex: 2, marginStart: 10 }]}
                  placeholder='City'
                  value={this.state.city}
                  ref={this.cityInputRef}
                  onChangeText={(text) => this.setState({ city: text })}
                  returnKeyType='done'
                />
              </View>
            </View>
            <View style={styles.mapView}>
              <MapView
                region={this.state.region}
                // onRegionChange={(region) => this.onRegionChange(region)}
                onRegionChangeComplete={(region) => this.onRegionChangeComplete(region)}
                style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}
              >
                {/* <Marker coordinate={this.state.region}></Marker> */}
              </MapView>
              <MaterialCommunityIcons name='map-marker' size={48} color={COLORS.red} style={styles.marker} />
            </View>
            <TouchableOpacity style={[STYLES.defaultButton, { marginTop: 20, alignSelf: 'center' }]} onPress={() => this.onSave()}>
              <Text style={STYLES.defaultButtonText}>{STRINGS.buttons.save}</Text>
              <FontAwesome name='save' size={20} color={COLORS.white} />
            </TouchableOpacity>
            <TouchableOpacity style={[STYLES.defaultButton, { marginTop: 10, marginBottom: 20, alignSelf: 'center' }]} onPress={() => this.onMyServices()}>
              <Text style={STYLES.defaultButtonText}>{STRINGS.headers.my_services}</Text>
              <FontAwesome name='wrench' size={20} color={COLORS.white} />
            </TouchableOpacity>
            <Toast ref='toast' position='center' />
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: 'column',
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
    paddingHorizontal: DEVICES.screenWidth * 0.1,
    paddingVertical: 10
  },
  contentBody: {
    paddingHorizontal: DEVICES.screenWidth * 0.1,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.separator
  },
  mapView: {
    height: 300,
    width: DEVICES.screenWidth
  },
  marker: {
    position: 'absolute',
    top: 150 - 48,
    left: DEVICES.screenWidth / 2 - 24,
    zIndex: 10
  }
});

const mapStateToProps = state => ({
  Credential: state.Credential,
  User: state.User,
  FcmToken: state.FcmToken,
  Profile: state.Profile
})

const mapDispatchToProps = (dispatch) => {
  return {
    Login: (idUser, key, role) => { dispatch(login(idUser, key, role)) },
    SaveProfile: (profile) => { dispatch(saveProfile(profile)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContractorProfileScreen)
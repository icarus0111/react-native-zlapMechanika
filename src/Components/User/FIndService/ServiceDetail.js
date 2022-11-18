import * as React from 'react';
import { Image, PermissionsAndroid, Platform, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import CheckBox from 'react-native-check-box';
import DatePicker from 'react-native-date-picker';
import Toast from 'react-native-easy-toast';
import Geolocation from 'react-native-geolocation-service';
import Modal from 'react-native-modal';
import RNPickerSelect from 'react-native-picker-select';
import RadioForm from 'react-native-simple-radio-button';
import { NavigationActions, StackActions } from 'react-navigation';
import { connect } from 'react-redux';
import COLORS from '../../../Config/Colors';
import DEVICES from '../../../Config/Devices';
import STRINGS from '../../../Config/Strings';
import STYLES from '../../../Config/Styles';
import { login } from '../../../Redux/Actions/Auth';

const radio_props = [
  { label: 'GPS', value: 'gps' },
  { label: 'Address', value: 'address' }
];

const data = [
  { label: 'Diesel', value: '1' },
  { label: 'petrol', value: '2' },
  { label: 'electric', value: '3' },
  { label: 'hybrid', value: '4' },
]

class FIndServiceDetailScreen extends React.Component {

  static navigationOptions = ({ navigation }) => ({
    title: STRINGS.headers.find_service,
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
    this.postalCodeInputRef = React.createRef();
    this.cityInputRef = React.createRef();
    this.vehicleMakeInputRef = React.createRef();
    this.vehicleModelInputRef = React.createRef();
    this.vehicleYearInputRef = React.createRef();
    this.plateInputRef = React.createRef();
    this.expectedDateInputRef = React.createRef();
    this.descriptionInputRef = React.createRef();
    this.state = {
      idService: '',
      name: '',
      serviceAtLocation: false,
      gps: true,
      locationLat: 0.0,
      locationLon: 0.0,
      locationAddress: '',
      locationPostalCode: '',
      locationCity: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      vehicleMotorType: '',
      idVehicleMotorType: '',
      vehiclePlate: '',
      description: '',
      expectedDate: '',
      date: new Date(),
      datePicker: false
    }
  }

  componentDidMount() {
    this.getProfile()
    this.getCategory()
    if (this.state.gps) {
      this.getGeolocation()
    }
  }

  getCategory() {
    let idService = this.props.navigation.getParam('idService', 'default');
    let name = this.props.navigation.getParam('name', 'default');
    this.setState({ idService: idService, name: name })
  }

  getProfile() {
    let profile = this.props.Profile.profile
    if (profile.length > 0) {
      this.setState({
        vehicleMake: JSON.parse(profile).vehicleMake,
        vehicleModel: JSON.parse(profile).vehicleModel,
        vehicleYear: JSON.parse(profile).vehicleYear,
        vehicleMotorType: JSON.parse(profile).vehicleMotorType,
        idVehicleMotorType: JSON.parse(profile).idVehicleMotorType
      })
    }
  }

  getGeolocation() {
    if (this.hasLocationPermission()) {
      Geolocation.getCurrentPosition(
        (position) => {
          this.setState({
            locationLat: position.coords.latitude,
            locationLon: position.coords.longitude
          });
        },
        (error) => { console.log(error.code, error.message) },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    }
  }

  async hasLocationPermission() {

    if (Platform.OS === 'ios' ||
      (Platform.OS === 'android' && Platform.Version < 23)) {
      return true;
    }

    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if (hasPermission) return true;

    const status = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    ]);

    if (status === PermissionsAndroid.RESULTS.GRANTED) return true;

    if (status === PermissionsAndroid.RESULTS.DENIED) {
      ToastAndroid.show('Location permission denied by user.', ToastAndroid.LONG);
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      ToastAndroid.show('Location permission revoked by user.', ToastAndroid.LONG);
    }

    return false;
  }

  onSelect(value) {
    this.setState({ addressType: value })
    if (value == 'address') {
      this.setState({ gps: false })
    } else {
      this.setState({ gps: true })
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

  handleCitySubmitPress = () => {
    if (this.vehicleMakeInputRef.current) {
      this.vehicleMakeInputRef.current.focus();
    }
  }

  handleVehicleMakeSubmitPress = () => {
    if (this.vehicleModelInputRef.current) {
      this.vehicleModelInputRef.current.focus();
    }
  }

  handleVehicleModelSubmitPress = () => {
    if (this.vehicleYearInputRef.current) {
      this.vehicleYearInputRef.current.focus();
    }
  }

  handleVehicleYearSubmitPress = () => {
    if (this.plateInputRef.current) {
      this.plateInputRef.current.focus();
    }
  }

  handlePlateSubmitPress = () => {
    if (this.expectedDateInputRef.current) {
      this.expectedDateInputRef.current.focus();
    }
  }

  handleExpectedDateSubmitPress = () => {
    if (this.descriptionInputRef.current) {
      this.descriptionInputRef.current.focus();
    }
  }

  onDatePicker() {
    this.setState({ datePicker: !this.state.datePicker })
    if (this.state.datePicker) {
      let formattedDate = this.state.date.getFullYear() + '-' + (this.state.date.getMonth() + 1) + '-' + this.state.date.getDate()
      this.setState({ expectedDate: formattedDate })
    }
  }

  goBack() {
    this.setState({ datePicker: !this.state.datePicker })
  }

  onFind() {

    let query = 'idService=' + this.state.idService + '&idUser=' + this.props.Credential.idUser + '&key=' + this.props.Credential.key +
      '&serviceAtLocation=' + this.state.serviceAtLocation + '&locationLat=' + this.state.locationLat + '&locationLon=' + parseFloat(this.state.locationLon) +
      '&locationAddress=' + this.state.locationAddress + '&locationPostalCode=' + this.state.locationPostalCode +
      '&locationCity=' + this.state.locationCity + '&vehicleMake=' + this.state.vehicleMake + '&vehicleModel=' + this.state.vehicleModel +
      '&vehicleYear=' + this.state.vehicleYear + '&idVehicleMotorType=' + this.state.idVehicleMotorType +
      '&description=' + this.state.description + '&expectedDate=' + this.state.expectedDate

    fetch(STRINGS.link.server + '/services/queryContractor?lang=pl-pl&' + query)
      .then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.hasOwnProperty('errno')) {
          this.props.navigation.navigate('SelectContractor', {
            serviceName: this.state.name,
            idService: this.state.idService,
            locationLat: this.state.locationLat,
            locationLon: this.state.locationLon,
            idQuery: responseJson.idQuery
          })
        } else {
          if (responseJson.errno == 9) {
            this.autoLogin()
          } else {
            this.refs.toast.show(responseJson.error, 2000)
          }
        }
      })
      .catch((error) => { console.error(error) })
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
            this.onFind()

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
          <Text style={styles.content_title}>{this.state.name}</Text>
          <View style={styles.content}>
            <View style={STYLES.formView}>
              <CheckBox
                checkBoxColor={COLORS.appColor}
                onClick={() => this.setState({ serviceAtLocation: !this.state.serviceAtLocation })}
                isChecked={this.state.serviceAtLocation}
                rightText='Service at my location'
                rightTextStyle={STYLES.label}
              />
              <RadioForm
                style={{ marginTop: 5, marginStart: 10 }}
                radio_props={radio_props}
                buttonColor={COLORS.appColor}
                selectedButtonColor={COLORS.appColor}
                buttonSize={12}
                buttonOuterSize={20}
                labelStyle={STYLES.label}
                initial={0}
                onPress={(value) => this.onSelect(value)}
              />
              {
                this.state.gps ?
                  <View></View>
                  :
                  <View>
                    <View style={STYLES.formView}>
                      <TextInput
                        style={STYLES.formTextInput}
                        placeholder='Address'
                        value={this.state.locationAddress}
                        onSubmitEditing={this.handleAddressSubmitPress}
                        onChangeText={(text) => this.setState({ locationAddress: text })}
                        keyboardType='default'
                        returnKeyType='next'
                      />
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      <TextInput
                        style={[STYLES.formTextInput, { flex: 1 }]}
                        placeholder='Postal code'
                        ref={this.postalCodeInputRef}
                        value={this.state.locationPostalCode}
                        onSubmitEditing={this.handlePostalCodeSubmitPress}
                        onChangeText={(text) => this.setState({ locationPostalCode: text })}
                        keyboardType='default'
                        returnKeyType='next'
                      />
                      <TextInput
                        style={[STYLES.formTextInput, { flex: 1, marginStart: 10 }]}
                        placeholder='City'
                        ref={this.cityInputRef}
                        value={this.state.locationCity}
                        onSubmitEditing={this.handleCitySubmitPress}
                        onChangeText={(text) => this.setState({ locationCity: text })}
                        keyboardType='default'
                        returnKeyType='next'
                      />
                    </View>
                  </View>
              }
            </View>
            <View style={STYLES.formView}>
              <TextInput
                style={STYLES.formTextInput}
                placeholder='Make'
                ref={this.vehicleMakeInputRef}
                value={this.state.vehicleMake}
                onSubmitEditing={this.handleVehicleMakeSubmitPress}
                onChangeText={(text) => this.setState({ vehicleMake: text })}
                keyboardType='default'
                returnKeyType='next'
              />
            </View>
            <View style={STYLES.formView}>
              <TextInput
                style={STYLES.formTextInput}
                placeholder='Model'
                ref={this.vehicleModelInputRef}
                value={this.state.vehicleModel}
                onSubmitEditing={this.handleVehicleModelSubmitPress}
                onChangeText={(text) => this.setState({ vehicleModel: text })}
                keyboardType='default'
                returnKeyType='next'
              />
            </View>
            <View style={STYLES.formView}>
              <TextInput
                style={STYLES.formTextInput}
                placeholder='Year of production'
                ref={this.vehicleYearInputRef}
                value={this.state.vehicleYear}
                onSubmitEditing={this.handleVehicleYearSubmitPress}
                onChangeText={(text) => this.setState({ vehicleYear: text })}
                keyboardType='default'
                returnKeyType='next'
              />
            </View>
            <View style={STYLES.formView}>
              <View style={[STYLES.formTextInput, { height: 35, alignItems: 'center', justifyContent: 'center' }]}>
                <RNPickerSelect
                  value={this.state.idVehicleMotorType}
                  onValueChange={(value) => this.setState({ idVehicleMotorType: value })}
                  items={data}
                />
              </View>
            </View>
            <View style={STYLES.formView}>
              <TextInput
                style={STYLES.formTextInput}
                placeholder='Plate'
                ref={this.plateInputRef}
                value={this.state.vehiclePlate}
                onSubmitEditing={this.handlePlateSubmitPress}
                onChangeText={(text) => this.setState({ vehiclePlate: text })}
                keyboardType='default'
                returnKeyType='next'
              />
            </View>
            <View style={STYLES.formView}>
              <TextInput
                style={STYLES.formTextInput}
                placeholder='Expected service date'
                ref={this.expectedDateInputRef}
                value={this.state.expectedDate}
                onSubmitEditing={this.handleExpectedDateSubmitPress}
                onChangeText={(text) => this.setState({ expectedDate: text })}
                keyboardType='default'
                returnKeyType='next'
              />
              <TouchableOpacity style={{ position: 'absolute', right: 0, top: -2 }}
                onPress={() => this.onDatePicker()}>
                <Image source={require('../../../assets/icons/calendar.png')} style={STYLES.image36} />
              </TouchableOpacity>
            </View>
            <View style={STYLES.formView}>
              <TextInput
                style={[STYLES.formTextInput, { height: 100, textAlignVertical: 'top' }]}
                multiline={true}
                maxLength={200}
                placeholder='Descripton'
                ref={this.descriptionInputRef}
                value={this.state.description}
                onChangeText={(text) => this.setState({ description: text })}
                keyboardType='default'
                returnKeyType='done'
              />
            </View>
          </View>
          <View style={styles.footer}>
            <TouchableOpacity style={STYLES.defaultButton} onPress={() => this.onFind()}>
              <Text style={STYLES.defaultButtonText}>{STRINGS.buttons.find}</Text>
              <Image source={require('../../../assets/icons/magnifier.png')} style={STYLES.image24} />
            </TouchableOpacity>
          </View>
          <Toast ref='toast' position='center' />
          <Modal isVisible={this.state.datePicker} animationOutTiming={2} deviceHeight={DEVICES.screenHeight} deviceWidth={DEVICES.screenWidth} style={{ margin: 0 }} backdropOpacity={0.0} onRequestClose={() => this.goBack()}>
            <View style={{ flex: 1, backgroundColor: COLORS.overlay, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <DatePicker
                style={{ backgroundColor: COLORS.white, borderRadius: 10 }}
                mode='date'
                date={this.state.date}
                onDateChange={date => this.setState({ date })}
              />
              <TouchableOpacity style={[STYLES.defaultButton, { marginTop: 20 }]} onPress={() => this.onDatePicker()}>
                <Text style={[STYLES.defaultButtonText, { marginEnd: 0 }]}>{STRINGS.buttons.select}</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      </ScrollView >
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: DEVICES.screenWidth * 0.075,
    flexDirection: 'column'
  },
  content_title: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.black,
    paddingVertical: 10,
    paddingHorizontal: DEVICES.screenWidth * 0.075,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator
  },
  footer: {
    marginVertical: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
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
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FIndServiceDetailScreen)
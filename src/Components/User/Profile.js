import * as React from 'react';
import { Image, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-easy-toast';
import RNPickerSelect from 'react-native-picker-select';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';
import COLORS from '../../Config/Colors';
import DEVICES from '../../Config/Devices';
import STRINGS from '../../Config/Strings';
import STYLES from '../../Config/Styles';
import { saveProfile } from '../../Redux/Actions/Profile';

const data = [
  { label: 'Diesel', value: '1' },
  { label: 'petrol', value: '2' },
  { label: 'electric', value: '3' },
  { label: 'hybrid', value: '4' }
]

class UserProfileScreen extends React.Component {

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
    this.vehicleMakeInputRef = React.createRef();
    this.vehicleModelInputRef = React.createRef();
    this.vehicleYearInputRef = React.createRef();
    this.plateNoInputRef = React.createRef();
    this.state = {
      name: '',
      surname: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      vehicleMotorType: '',
      idVehicleMotorType: '',
      vehiclePlate: ''
    }
  }

  componentDidMount() {
    this.getProfile()
  }

  handleNameSubmitPress = () => {
    if (this.surenameInputRef.current) {
      this.surenameInputRef.current.focus();
    }
  }

  handleSurenameSubmitPress = () => {
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
    if (this.plateNoInputRef.current) {
      this.plateNoInputRef.current.focus();
    }
  }

  getProfile() {
    let profile = this.props.Profile.profile
    this.setState({
      name: JSON.parse(profile).name,
      surname: JSON.parse(profile).surname,
      vehicleMake: JSON.parse(profile).vehicleMake,
      vehicleModel: JSON.parse(profile).vehicleModel,
      vehicleYear: JSON.parse(profile).vehicleYear,
      vehicleMotorType: JSON.parse(profile).vehicleMotorType,
      idVehicleMotorType: JSON.parse(profile).idVehicleMotorType,
      vehiclePlate: JSON.parse(profile).vehiclePlate
    })
  }

  save() {

    let query = 'idUser=' + this.props.Credential.idUser + '&key=' + this.props.Credential.key +
      '&vehicleMake=' + this.state.vehicleMake + '&vehicleModel=' + this.state.vehicleModel +
      '&vehicleYear=' + this.state.vehicleYear + '&idVehicleMotorType=' + this.state.idVehicleMotorType +
      '&vehiclePlate=' + this.state.vehiclePlate + '&name=' + this.state.name + '&surname=' + this.state.surname

    fetch(STRINGS.link.server + '/user/profileUpdate?lang=pl-pl&' + query)
      .then(response => response.json())
      .then((responseJson) => {
        if (!responseJson.hasOwnProperty('errno')) {

          this.refs.toast.show('Successfully updated', 2000)
          this.props.SaveProfile(JSON.stringify({
            name: this.state.name,
            surname: this.state.surname,
            vehicleMake: this.state.vehicleMake,
            vehicleModel: this.state.vehicleModel,
            vehicleYear: this.state.vehicleYear,
            vehicleMotorType: this.state.vehicleMotorType,
            idVehicleMotorType: this.state.idVehicleMotorType,
            vehiclePlate: this.state.vehiclePlate,
            type: 1
          }))
          this.props.navigation.navigate('UserOptionsStack')
        } else {
          if (responseJson.errno == 9) {
            this.autoLogin()
          } else {
            this.refs.toast.show(responseJson.error, 2000)
          }
        }
      })
      .catch(error => console.log('profileUpdate error ----->', error))
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
            this.save()

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
        <KeyboardAvoidingView style={STYLES.container} behavior='padding'>
          <View style={styles.content}>
            <Text style={styles.contentTitle}>{STRINGS.profile.user}</Text>
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
                  placeholder='Surename'
                  ref={this.surenameInputRef}
                  value={this.state.surname}
                  onSubmitEditing={this.handleSurenameSubmitPress}
                  onChangeText={(text) => this.setState({ surname: text })}
                  returnKeyType='next'
                />
              </View>
            </View>
            <View style={styles.contentBody}>
              <View style={STYLES.formView}>
                <TextInput
                  style={STYLES.formTextInput}
                  placeholder='Make'
                  value={this.state.vehicleMake}
                  ref={this.vehicleMakeInputRef}
                  onSubmitEditing={this.handleVehicleMakeSubmitPress}
                  onChangeText={(text) => this.setState({ vehicleMake: text })}
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
                  ref={this.plateNoInputRef}
                  value={this.state.vehiclePlate}
                  onChangeText={(text) => this.setState({ vehiclePlate: text })}
                  returnKeyType='done'
                />
              </View>
            </View>
            <TouchableOpacity style={[STYLES.defaultButton, { marginTop: 30, marginBottom: 10, alignSelf: 'center' }]} onPress={() => this.save()}>
              <Text style={STYLES.defaultButtonText}>{STRINGS.buttons.save}</Text>
              <FontAwesome name='save' size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        <Toast ref='toast' position='center' />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: 'column'
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.black,
    paddingHorizontal: DEVICES.screenWidth * 0.1,
    paddingVertical: 10
  },
  contentBody: {
    paddingHorizontal: DEVICES.screenWidth * 0.1,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.separator
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
    SaveProfile: (profile) => { dispatch(saveProfile(profile)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserProfileScreen)
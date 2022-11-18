import AsyncStorage from '@react-native-community/async-storage';
import * as React from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import Toast from 'react-native-easy-toast';
import Modal from 'react-native-modal';
import Entypo from 'react-native-vector-icons/Entypo';
import { NavigationActions, StackActions } from 'react-navigation';
import { connect } from 'react-redux';
import COLORS from '../../Config/Colors';
import DEVICES from '../../Config/Devices';
import STRINGS from '../../Config/Strings';
import STYLES from '../../Config/Styles';
import { login } from '../../Redux/Actions/Auth';

class ServicesWatingScreen extends React.Component {

  static navigationOptions = ({ navigation }) => ({
    title: STRINGS.headers.service_waiting,
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
      serviceDetail: {},
      service_name: '',
      serviceDateTime: '',
      priceFrom: '',
      priceTo: '',
      date: new Date(),
      datePicker: false
    }
  }

  componentDidMount() {
    let item = this.props.navigation.getParam('item', 'default')
    let service_name = this.props.navigation.getParam('service_name', 'default')
    this.setState({ serviceDetail: item, service_name: service_name })
  }

  onMap() {
    this.props.navigation.navigate('MapView', {
      lat: this.state.serviceDetail.locationLat,
      lon: this.state.serviceDetail.locationLon
    })
  }

  onDatePicker() {
    this.setState({ datePicker: !this.state.datePicker })
    if (this.state.datePicker) {
      let formattedDate = this.state.date.getFullYear() + '-' + (this.state.date.getMonth() + 1) + '-' + this.state.date.getDate()
      this.setState({ serviceDateTime: formattedDate })
    }
  }

  onPropose() {

    if (this.state.serviceDateTime == '') {
      this.refs.toast.show('Proposal service date should not be empty', 2000);
    } else if (this.state.priceFrom == '') {
      this.refs.toast.show('Price from should not be empty', 2000);
    } else if (this.state.priceTo == '') {
      this.refs.toast.show('Price to should not be empty', 2000);
    } else {

      let query = '&idUser=' + this.props.Credential.idUser + '&key=' + this.props.Credential.key + '&idQuery=' + this.state.serviceDetail.idQuery +
        '&serviceDateTime=' + this.state.serviceDateTime + '&priceFrom=' + this.state.priceFrom + '&priceTo=' + this.state.priceTo

      fetch(STRINGS.link.server + '/services/proposeService?lang=pl-pl' + query)
        .then(response => response.json())
        .then((responseJson) => {

          if (!responseJson.hasOwnProperty('errno')) {
            this.refs.toast.show(responseJson.idPropose, 2000);
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
            this.onPropose()

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

  onReject() {

  }

  render() {
    return (
      <View style={STYLES.container}>
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.content}>
            <Text style={[STYLES.label, { paddingVertical: 15 }]}>{this.state.service_name}</Text>
            <Text style={STYLES.grayLabel}>Vehicle</Text>
            <Text style={STYLES.label}>{this.state.serviceDetail.vehicleMake} {this.state.serviceDetail.vehicleModel} {this.state.serviceDetail.vehicleYear}</Text>
            <Text style={STYLES.label}>{this.state.serviceDetail.idVehicleMotorType}</Text>
            <Text style={STYLES.grayLabel}>User</Text>
            <Text style={STYLES.label}>Name surname</Text>
            <Text style={STYLES.grayLabel}>Location</Text>
            <Text style={STYLES.label}>Address, postal code, city(or GPS lat,lon)</Text>
            <TouchableOpacity style={[STYLES.defaultButton, { alignSelf: 'center', marginVertical: 20 }]} onPress={() => this.onMap()}>
              <Text style={STYLES.defaultButtonText}>{STRINGS.buttons.map}</Text>
              <Entypo name='location' size={20} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={STYLES.grayLabel}>Expected service date</Text>
            <Text style={STYLES.label}>{this.state.serviceDetail.expectedDate}</Text>
            <View style={[STYLES.formView, { marginTop: 10 }]}>
              <TextInput
                style={[styles.textInput, { width: DEVICES.screenWidth * 0.5 }]}
                placeholder='Proposal service date'
                value={this.state.serviceDateTime}
                onChangeText={(text) => this.setState({ serviceDateTime: text })} />
              <TouchableOpacity style={{ position: 'absolute', right: DEVICES.screenWidth * 0.35, top: -2 }}
                onPress={() => this.onDatePicker()}>
                <Image source={require('../../assets/icons/calendar.png')} style={STYLES.image36} />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TextInput
                style={styles.textInput}
                placeholder='Approx price from'
                keyboardType={'number-pad'}
                value={this.state.priceFrom}
                onChangeText={(text) => this.setState({ priceFrom: text })} />
              <TextInput
                style={styles.textInput}
                placeholder='price to'
                keyboardType={'number-pad'}
                value={this.state.priceTo}
                onChangeText={(text) => this.setState({ priceTo: text })} />
            </View>
            <TouchableOpacity style={[STYLES.defaultButton, { alignSelf: 'center', marginVertical: 20 }]} onPress={() => this.onPropose()}>
              <Text style={STYLES.defaultButtonText}>{STRINGS.buttons.propose}</Text>
              <Image source={require('../../assets/icons/check.png')} style={STYLES.image24} />
            </TouchableOpacity>
            <TouchableOpacity style={{ alignSelf: 'center', marginBottom: 20 }} onPress={() => this.onReject()}>
              <Text style={[STYLES.label, { color: COLORS.appColor }]}>{STRINGS.buttons.reject}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <Toast ref='toast' position='center' />
        <Modal isVisible={this.state.datePicker} deviceHeight={DEVICES.screenHeight} deviceWidth={DEVICES.screenWidth} style={{ margin: 0 }} backdropOpacity={0.0}>
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
    );
  }
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: DEVICES.screenWidth * 0.075,
    flexDirection: 'column'
  },
  textInput: {
    width: DEVICES.screenWidth * 0.4,
    borderWidth: 1,
    borderColor: COLORS.appColor,
    borderRadius: 3,
    paddingVertical: 1,
    paddingHorizontal: 5,
    fontSize: 16
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

export default connect(mapStateToProps, mapDispatchToProps)(ServicesWatingScreen)
import * as React from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-easy-toast';
import COLORS from '../../Config/Colors';
import DEVICES from '../../Config/Devices';
import STRINGS from '../../Config/Strings';
import STYLES from '../../Config/Styles';

export default class AccountVerificationScreen extends React.Component {

  static navigationOptions = ({ navigation }) => ({
    title: STRINGS.headers.account_verification,
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
      <Image source={require('../../assets/icons/menu.png')} style={STYLES.image36} />
    </View>
  })

  constructor() {
    super();
    this.state = {
      pin: ''
    }
  }

  onConfirm() {
    if (this.state.pin == '') {
      this.refs.toast.show('Please type pin from SMS', 2000);
    } else {
      let idUser = this.props.navigation.getParam('idUser', 'defalut');
      fetch(STRINGS.link.server + '/user/registerVerify?lang=pl-pl&idUser=' + idUser + '&pin=' + this.state.pin)
        .then(response => response.json())
        .then((responseJson) => {
          if (!responseJson.hasOwnProperty('errno')) {
            this.setState({ pin: '' }, () => this.props.navigation.navigate('Login'))
          } else {
            this.refs.toast.show(responseJson.error, 2000);
          }
        })
        .catch(error => console.log(error))
    }
  }

  render() {
    return (
      <View style={STYLES.container}>
        <View style={styles.content}>
          <View style={STYLES.formView}>
            <Text style={[STYLES.label, { textAlign: 'center', marginBottom: 10 }]}>Enter PIN from SMS</Text>
            <TextInput
              style={[STYLES.formTextInput, { textAlign: 'center' }]}
              value={this.state.pin}
              onChangeText={(text) => this.setState({ pin: text })}
              keyboardType='number-pad'
              returnKeyType='done'
            />
          </View>
          <TouchableOpacity style={[STYLES.authButton, { marginTop: 50 }]} onPress={() => this.onConfirm()}>
            <Text style={STYLES.authButtonText}>{STRINGS.buttons.verify}</Text>
          </TouchableOpacity>
        </View>
        <Toast ref='toast' position='center' />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    marginTop: 100,
    paddingHorizontal: DEVICES.screenWidth * 0.2,
    flexDirection: 'column'
  }
});
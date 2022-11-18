import * as React from 'react';
import { Image, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CheckBox from 'react-native-check-box';
import Toast from 'react-native-easy-toast';
import Modal from 'react-native-modal';
import HTML from 'react-native-render-html';
import RadioForm from 'react-native-simple-radio-button';
import COLORS from '../../Config/Colors';
import DEVICES from '../../Config/Devices';
import STRINGS from '../../Config/Strings';
import STYLES from '../../Config/Styles';

const radio_props = [
  { label: 'User', value: '1-user' },
  { label: 'Contractor', value: '2-contractor' }
];

export default class RegisterationPhoneScreen extends React.Component {

  static navigationOptions = ({ navigation }) => ({
    title: STRINGS.headers.registeration,
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
    this.passwordInputRef = React.createRef();
    this.c_passwordInputRef = React.createRef();
    this.state = {
      phonenumber: '',
      password: '',
      c_password: '',
      term: false,
      policy: false,
      role: '1-user',
      termVisible: false,
      policyVisible: false,
      termHtml: '',
      policyHtml: ''
    }
  }

  componentDidMount() {
    this.getTermsContent()
    this.getPolicyContent()
  }

  getTermsContent() {
    fetch('http://api.zlapmechanika.pl/info/termsConditions?lang=pl-pl')
      .then(response => response.json())
      .then((responseJson) => {
        this.setState({ termHtml: responseJson.text })
      })
      .catch(error => console.log(error))
  }

  getPolicyContent() {
    fetch('http://api.zlapmechanika.pl/info/privacyPolicy?lang=pl-pl')
      .then(response => response.json())
      .then((responseJson) => {
        this.setState({ policyHtml: responseJson.text })
      })
      .catch(error => console.log(error))
  }

  handlePhonenumberSubmitPress = () => {
    if (this.passwordInputRef.current) {
      this.passwordInputRef.current.focus();
    }
  }

  handlePasswordSubmitPress = () => {
    if (this.c_passwordInputRef.current) {
      this.c_passwordInputRef.current.focus();
    }
  }

  onTerms() {
    this.setState({ termVisible: !this.state.termVisible })
  }

  onPrivacy() {
    this.setState({ policyVisible: !this.state.policyVisible })
  }

  onRegister() {
    if (this.state.phonenumber == '') {
      this.refs.toast.show('Phone number should not be empty', 2000);
    } else if (this.state.password == '') {
      this.refs.toast.show('Password should not be empty', 2000);
    } else if (this.state.c_password == '') {
      this.refs.toast.show('Password again should not be empty', 2000);
    } else if (!this.state.term || !this.state.term) {
      this.refs.toast.show('Agree with terms and privacy policy', 2000);
    } else {
      fetch(STRINGS.link.server + '/user/register?lang=plpl&phone=' + this.state.phonenumber + '&password=' + this.state.password + '&passwordVerify=' + this.state.c_password + '&type=' + this.state.role)
        .then(response => response.json())
        .then((responseJson) => {
          if (!responseJson.hasOwnProperty('errno')) {
            this.setState({ phonenumber: '', password: '', c_password: '' },
              () => this.props.navigation.navigate('AccountVerification', {
                idUser: responseJson.idUser
              }))
          } else {
            this.refs.toast.show(responseJson.error, 2000);
          }
        })
        .catch(error => console.log(error))
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
          <KeyboardAvoidingView style={[STYLES.container, { paddingHorizontal: DEVICES.screenWidth * 0.075 }]} behavior='padding'>
            <View style={styles.radioView}>
              <RadioForm
                radio_props={radio_props}
                buttonColor={COLORS.appColor}
                selectedButtonColor={COLORS.appColor}
                buttonSize={12}
                buttonOuterSize={20}
                labelStyle={{ fontSize: 16, color: COLORS.black }}
                initial={0}
                onPress={(value) => { this.setState({ role: value }) }}
              />
            </View>
            <View style={styles.content}>
              <View style={STYLES.formView}>
                <TextInput
                  style={STYLES.formTextInput}
                  placeholder='Phone number'
                  value={this.state.phonenumber}
                  onSubmitEditing={this.handlePhonenumberSubmitPress}
                  onChangeText={(text) => this.setState({ phonenumber: text })}
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
                  onSubmitEditing={this.handlePasswordSubmitPress}
                  onChangeText={(text) => this.setState({ password: text })}
                  secureTextEntry={true}
                  returnKeyType='next'
                />
              </View>
              <View style={STYLES.formView}>
                <TextInput
                  style={STYLES.formTextInput}
                  placeholder='Password again'
                  ref={this.c_passwordInputRef}
                  value={this.state.c_password}
                  onChangeText={(text) => this.setState({ c_password: text })}
                  secureTextEntry={true}
                  returnKeyType='done'
                />
              </View>
              <View style={STYLES.formView}>
                <View style={{ flexDirection: 'column' }}>
                  <CheckBox
                    onClick={() => this.setState({ term: !this.state.term })}
                    isChecked={this.state.term}
                    checkBoxColor={COLORS.appColor}
                    rightText={STRINGS.checkBox.terms_conditions}
                    rightTextStyle={STYLES.label}
                  />
                  <TouchableOpacity onPress={() => this.onTerms()}>
                    <Text style={[STYLES.label, { color: COLORS.appColor, marginStart: 35 }]}>{STRINGS.modal.terms_conditions}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'column' }}>
                  <CheckBox
                    onClick={() => this.setState({ policy: !this.state.policy })}
                    isChecked={this.state.policy}
                    checkBoxColor={COLORS.appColor}
                    rightText={STRINGS.checkBox.privacy_policy}
                    rightTextStyle={STYLES.label}
                  />
                  <TouchableOpacity onPress={() => this.onPrivacy()}>
                    <Text style={[STYLES.label, { color: COLORS.appColor, marginStart: 35 }]}>{STRINGS.modal.privacy_policy}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity style={[STYLES.authButton, { marginTop: 50, marginBottom: 10 }]} onPress={() => this.onRegister()}>
                <Text style={STYLES.authButtonText}>{STRINGS.buttons.register}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
          <Toast ref='toast' position='center' />
        </ScrollView>
        <Modal isVisible={this.state.termVisible} animationOutTiming={100} deviceHeight={DEVICES.screenHeight} deviceWidth={DEVICES.screenWidth} style={{ margin: 0 }}>
          <View style={styles.modal}>
            <View style={styles.modalContent}>
              <View style={styles.modalContentBody}>
                <Text style={styles.modalTitle}>{STRINGS.modal.termsTitle}</Text>
                <HTML html={this.state.termHtml} baseFontStyle={{ fontSize: 16 }} />
              </View>
              <View style={styles.modalFooter}>
                <TouchableOpacity style={STYLES.defaultButton} onPress={() => this.onTerms()}>
                  <Text style={STYLES.defaultButtonText}>{STRINGS.buttons.close}</Text>
                  <Image source={require('../../assets/icons/check.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <Modal isVisible={this.state.policyVisible} animationOutTiming={100} deviceHeight={DEVICES.screenHeight} deviceWidth={DEVICES.screenWidth} style={{ margin: 0 }}>
          <View style={styles.modal}>
            <View style={styles.modalContent}>
              <View style={styles.modalContentBody}>
                <Text style={styles.modalTitle}>{STRINGS.modal.privacyTitle}</Text>
                <HTML html={this.state.policyHtml} baseFontStyle={{ fontSize: 16 }} />
              </View>
              <View style={styles.modalFooter}>
                <TouchableOpacity style={STYLES.defaultButton} onPress={() => this.onPrivacy()}>
                  <Text style={STYLES.defaultButtonText}>{STRINGS.buttons.close}</Text>
                  <Image source={require('../../assets/icons/check.png')} style={{ width: 24, height: 24, resizeMode: 'contain' }} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  radioView: {
    height: 90,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    paddingBottom: 10
  },
  content: {
    flex: 1,
    flexDirection: 'column'
  },
  modal: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalContent: {
    width: DEVICES.screenWidth * 0.9,
    height: DEVICES.screenHeight * 0.9,
    backgroundColor: COLORS.white,
    flexDirection: 'column'
  },
  modalContentBody: {
    flex: 1,
    margin: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.separator,
    borderRadius: 5
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 10
  },
  modalFooter: {
    height: 70,
    alignItems: 'center'
  }
});
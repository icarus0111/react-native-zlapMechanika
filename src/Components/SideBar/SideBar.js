import AsyncStorage from '@react-native-community/async-storage';
import * as React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from 'react-native-modal';
import HTML from 'react-native-render-html';
import { NavigationActions, StackActions } from 'react-navigation';
import { connect } from 'react-redux';
import COLORS from '../../Config/Colors';
import DEVICES from '../../Config/Devices';
import STRINGS from '../../Config/Strings';
import STYLES from '../../Config/Styles';
import { logout } from '../../Redux/Actions/Auth';

class SideBar extends React.Component {

  constructor() {
    super();
    this.state = {
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

  onEditProfile() {
    if (this.props.Credential.role == '1') {
      this.props.navigation.navigate('UserProfile')
    } else {
      this.props.navigation.navigate('ContractorProfile')
    }
  }

  onTerms() {
    this.setState({ termVisible: !this.state.termVisible })
  }

  onPrivacy() {
    this.setState({ policyVisible: !this.state.policyVisible })
  }

  async onLogout() {
    await AsyncStorage.removeItem('@zlap_user')
    this.props.Logout()
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({ routeName: 'Auth' })],
    });
    this.props.navigation.dispatch(resetAction)
  }

  render() {
    return (
      <View style={STYLES.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Maciej Kotnis</Text>
            <TouchableOpacity onPress={() => this.onEditProfile()}>
              <Text style={styles.logoutButton}>{STRINGS.drawer.edit_profile}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.content}>
          <TouchableOpacity style={styles.touchableOpacity} onPress={() => this.onTerms()}>
            <Text style={styles.logoutButton}>{STRINGS.modal.termsTitle}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.touchableOpacity} onPress={() => this.onPrivacy()}>
            <Text style={styles.logoutButton}>{STRINGS.modal.privacyTitle}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.touchableOpacity} onPress={() => this.onLogout()}>
            <Text style={styles.logoutButton}>{STRINGS.drawer.logout}</Text>
          </TouchableOpacity>
        </View>
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
                  <Image source={require('../../assets/icons/check.png')} style={STYLES.image24} />
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
                  <Image source={require('../../assets/icons/check.png')} style={STYLES.image24} />
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
  header: {
    height: 96,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.black
  },
  content: {
    borderTopWidth: 1,
    borderTopColor: COLORS.separator,
    flexDirection: 'column'
  },
  touchableOpacity: {
    height: 50,
    paddingHorizontal: 50,
    justifyContent: 'center',
  },
  logoutButton: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.black
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

const mapStateToProps = state => {
  return {
    Credential: state.Credential
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    Logout: () => { dispatch(logout()); },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SideBar);
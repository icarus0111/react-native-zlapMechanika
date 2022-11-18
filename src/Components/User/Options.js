import * as React from 'react';
import { Alert, BackHandler, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import COLORS from '../../Config/Colors';
import STRINGS from '../../Config/Strings';
import STYLES from '../../Config/Styles';

class UserOptionsScreen extends React.Component {

  static navigationOptions = ({ navigation }) => ({
    title: STRINGS.headers.menu,
    headerTitleStyle: { fontSize: 18, fontWeight: '400' },
    headerStyle: {
      backgroundColor: COLORS.appColor,
      shadowColor: COLORS.appColor,
      height: 48
    },
    headerTintColor: COLORS.white,
    headerLeft: <View style={{ paddingHorizontal: 8 }}>
    </View>,
    headerRight: <View style={{ paddingHorizontal: 4 }}>
      <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
        <Image source={require('../../assets/icons/menu.png')} style={STYLES.image36} />
      </TouchableOpacity>
    </View>
  })

  constructor() {
    super();
    this.state = {}
  }

  componentDidMount() {
    this.props.navigation.addListener('willFocus', () => BackHandler.addEventListener('hardwareBackPress', this.backPressed))
    this.props.navigation.addListener('willBlur', () => BackHandler.removeEventListener('hardwareBackPress', this.backPressed))
  }

  backPressed = () => {
    Alert.alert(
      'Exit App',
      'Do you want to exit?',
      [
        { text: 'No', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'Yes', onPress: () => BackHandler.exitApp() },
      ],
      { cancelable: false });
    return true
  }

  onMyServices() {
    if (this.props.Profile.profile == '') {
      this.props.navigation.navigate('UserProfile')
    } else {
      this.props.navigation.navigate('MyServices')
    }
  }

  onFindService() {
    if (this.props.Profile.profile == '') {
      this.props.navigation.navigate('UserProfile')
    } else {
      this.props.navigation.navigate('Categories')
    }
  }

  onEditPersonalData() {
    this.props.navigation.navigate('UserProfile')
  }

  render() {
    return (
      <View style={STYLES.container}>
        <View style={styles.content}>
          <TouchableOpacity style={STYLES.rowMenuButton} onPress={() => this.onMyServices()}>
            <Text style={STYLES.label}>{STRINGS.headers.my_services}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={STYLES.rowMenuButton} onPress={() => this.onFindService()}>
            <Text style={STYLES.label}>{STRINGS.headers.find_service}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={STYLES.rowMenuButton} onPress={() => this.onEditPersonalData()}>
            <Text style={STYLES.label}>{STRINGS.drawer.edit_profile}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: 'column'
  }
});

const mapStateToProps = state => ({
  Profile: state.Profile
})

export default connect(mapStateToProps)(UserOptionsScreen)
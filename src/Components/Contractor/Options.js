import * as React from 'react';
import { Alert, BackHandler, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import COLORS from '../../Config/Colors';
import STRINGS from '../../Config/Strings';
import STYLES from '../../Config/Styles';

export default class ContractorOptionsScreen extends React.Component {

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
    this.state = {
      contractor_options: ['Services wating', 'Services proposed', 'Services contracted', 'Services closed']
    }
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
    return true;
  }

  onServicesList(key) {
    this.props.navigation.navigate('ServicesList', { type: key })
  }

  onEditPersonalData() {
    this.props.navigation.navigate('ContractorProfile')
  }

  render() {
    return (
      <View style={STYLES.container}>
        <View style={styles.content}>
          {
            this.state.contractor_options.map((item, key) => (
              <TouchableOpacity
                style={STYLES.rowMenuButton}
                onPress={() => this.onServicesList(key)}
                key={key}>
                <Text style={STYLES.label}>{item}</Text>
              </TouchableOpacity>
            ))
          }
          <TouchableOpacity style={STYLES.rowMenuButton} onPress={() => this.onEditPersonalData()}>
            <Text style={STYLES.label}>Edit personal data</Text>
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
import * as React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import COLORS from '../../Config/Colors';
import STRINGS from '../../Config/Strings';
import STYLES from '../../Config/Styles';

export default class MapViewScreen extends React.Component {

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
      region: {
        latitude: 51.9194,
        longitude: 19.1451,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }
    }
  }

  componentDidMount() {
    if (this.props.navigation.state.params.lat != null && this.props.navigation.state.params.lon != null) {
      this.setState({
        region: {
          latitude: this.props.navigation.state.params.lat,
          longitude: this.props.navigation.state.params.lon,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }
      })
    }
  }

  render() {
    return (
      <View style={STYLES.container}>
        <MapView
          region={this.state.region}
          style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}
        >
          <Marker coordinate={this.state.region}></Marker>
        </MapView>
      </View>
    );
  }
}
import * as React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIndicator } from 'react-native-indicators';
import COLORS from '../../../Config/Colors';
import DEVICES from '../../../Config/Devices';
import STRINGS from '../../../Config/Strings';
import STYLES from '../../../Config/Styles';

export default class CategoriesScreen extends React.Component {

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
    this.state = {
      services: [],
      categories: [],
      loading: false
    }
  }

  componentDidMount() {
    this.getServicesList()
  }

  getServicesList() {

    this.setState({ loading: true })

    fetch(STRINGS.link.server + '/services/list?lang=pl-pl')
      .then(response => response.json())
      .then((responseJson) => {
        
        let temp = []
        for (let i = 0; i < responseJson.categories.length; i++) {
          if (responseJson.categories[i].idParent == '0') {
            temp.push(responseJson.categories[i])
          }
        }
        this.setState({ services: responseJson.categories, categories: temp, loading: false })
      })
      .catch(error => this.setState({ loading: false }, () => console.log(error)))
  }

  onSelect(idService, name) {
    let count = 0;
    for (let i = 0; i < this.state.services.length; i++) {
      if (this.state.services[i].idParent == idService) {
        count++;
      }
    }
    if (count > 0) {
      this.props.navigation.navigate('SubCategories', {
        idParent: idService
      })
    } else {
      this.props.navigation.navigate('FindServiceDetail', {
        idService: idService,
        name: name
      })
    }
  }

  render() {
    return (
      this.state.loading ?
        <MaterialIndicator color={COLORS.appColor} size={60} />
        :
        <ScrollView style={{ flex: 1 }}>
          <View style={STYLES.container}>
            <View style={styles.content}>
              {
                this.state.categories.map((item, key) => (
                  <TouchableOpacity onPress={() => this.onSelect(item.idService, item.name)}
                    style={STYLES.rowCategoryButton}
                    key={key}>
                    <Text style={[STYLES.label, { width: DEVICES.screenWidth * 0.75 }]}>{item.name}</Text>
                    <Image source={require('../../../assets/icons/right.png')} style={STYLES.image24} />
                  </TouchableOpacity>
                ))
              }
            </View>
          </View>
        </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.appColor
  }
});
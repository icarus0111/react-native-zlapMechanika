import * as React from 'react';
import { BackHandler, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIndicator } from 'react-native-indicators';
import COLORS from '../../../Config/Colors';
import DEVICES from '../../../Config/Devices';
import STRINGS from '../../../Config/Strings';
import STYLES from '../../../Config/Styles';

export default class SubCategoriesScreen extends React.Component {

  /*static navigationOptions = ({ navigation }) => ({
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
  })*/

  constructor() {
    super();
    this.state = {
      services: [],
      subCategories: [],
      stepIdServices: [],
      loading: false
    }
  }

  componentDidMount() {
    this.props.navigation.addListener('willFocus', () => BackHandler.addEventListener('hardwareBackPress', this.backPressed))
    this.props.navigation.addListener('willBlur', () => BackHandler.removeEventListener('hardwareBackPress', this.backPressed))
    let idParent = this.props.navigation.getParam('idParent', 'default');
    this.setState({ subCategories: [] }, () => this.getServicesList(idParent))
  }

  backPressed = () => {
    if (this.state.stepIdServices.length > 1) {
      let temp3 = this.state.stepIdServices
      temp3.splice(this.state.stepIdServices.length - 1, 1)
      this.setState({ stepIdServices: temp3 })
      this.returnServicesList(temp3[temp3.length - 1])
    } else {
      this.setState({ stepIdServices: [] })
      this.props.navigation.goBack()
    }
    return true;
  }

  getServicesList(idParent) {

    let temp2 = this.state.stepIdServices
    temp2.push(idParent)
    this.setState({ loading: true, stepIdServices: temp2 })

    fetch(STRINGS.link.server + '/services/list?lang=pl-pl')
      .then(response => response.json())
      .then((responseJson) => {
        
        let temp = []
        for (let i = 0; i < responseJson.categories.length; i++) {
          if (responseJson.categories[i].idParent == idParent) {
            temp.push(responseJson.categories[i])
          }
        }
        this.setState({ services: responseJson.categories, subCategories: temp, loading: false })
      })
      .catch(error => this.setState({ loading: false }, () => console.log(error)))
  }

  returnServicesList(idParent) {

    this.setState({ loading: true })

    fetch(STRINGS.link.server + '/services/list?lang=pl-pl')
      .then(response => response.json())
      .then((responseJson) => {

        let temp = []
        for (let i = 0; i < responseJson.categories.length; i++) {
          if (responseJson.categories[i].idParent == idParent) {
            temp.push(responseJson.categories[i])
          }
        }
        this.setState({ services: responseJson.categories, subCategories: temp, loading: false })
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
      this.getServicesList(idService)
    } else {
      this.props.navigation.navigate('FindServiceDetail', {
        idService: idService,
        name: name
      })
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={this.backPressed}>
              <Image source={require('../../../assets/icons/arrow-left.png')} style={STYLES.image24} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{STRINGS.headers.find_service}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => this.props.navigation.toggleDrawer()}>
              <Image source={require('../../../assets/icons/menu.png')} style={STYLES.image36} />
            </TouchableOpacity>
          </View>
        </View>
        {
          this.state.loading ?
            <MaterialIndicator color={COLORS.appColor} size={60} />
            :
            <ScrollView style={{ flex: 1 }}>
              <View style={STYLES.container}>
                <View style={styles.content}>
                  {
                    this.state.subCategories.map((item, key) => (
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
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    height: 48,
    backgroundColor: COLORS.appColor,
    elevation: 5,
    flexDirection: 'row'
  },
  headerLeft: {
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerRight: {
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: COLORS.white
  },
  content: {
    flex: 1,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.appColor
  }
})
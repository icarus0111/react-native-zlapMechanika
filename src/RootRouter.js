import AsyncStorage from '@react-native-community/async-storage';
import React, { Fragment } from 'react';
import firebase from 'react-native-firebase';
import { createAppContainer } from 'react-navigation';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { createStackNavigator } from 'react-navigation-stack';
import { connect } from 'react-redux';
import { updateFcmToken } from '../src/Redux/Actions/FcmToken';
import AccountVerificationScreen from './Components/Auth/AccountVerification';
import LoginScreen from './Components/Auth/Login';
import RegisterationPhoneScreen from './Components/Auth/RegisterationPhone';
import MapViewScreen from './Components/Contractor/MapView';
import ContractorMyServicesScreen from './Components/Contractor/MyServices';
import MySubServicesScreen from './Components/Contractor/MySubServices';
import ContractorOptionsScreen from './Components/Contractor/Options';
import ContractorProfileScreen from './Components/Contractor/Profile';
import ServicesContractedScreen from './Components/Contractor/ServicesContracted';
import ServicesListScreen from './Components/Contractor/ServicesList';
import ServicesWatingScreen from './Components/Contractor/ServicesWaiting';
import SideBar from './Components/SideBar/SideBar';
import SplashScreen from './Components/Splash/Splash';
import CategoriesScreen from './Components/User/FIndService/Categories';
import ConfirmServiceScreen from './Components/User/FIndService/ConfirmService';
import SelectContractorScreen from './Components/User/FIndService/SelectContractor';
import FIndServiceDetailScreen from './Components/User/FIndService/ServiceDetail';
import SubCategoriesScreen from './Components/User/FIndService/SubCategories';
import MyServicesScreen from './Components/User/MyServices/MyServices';
import MyServiceDetailScreen from './Components/User/MyServices/ServiceDetail';
import ServiceFeedbackScreen from './Components/User/MyServices/ServiceFeedback';
import UserOptionsScreen from './Components/User/Options';
import UserProfileScreen from './Components/User/Profile';

const AuthStack = createStackNavigator(
    {
        Login: { screen: LoginScreen, navigationOptions: { header: null } },
        RegisterationPhone: { screen: RegisterationPhoneScreen },
        AccountVerification: { screen: AccountVerificationScreen }
    },
    {
        headerLayoutPreset: 'center',
    }
)

const UserStack = createStackNavigator(
    {
        UserOptionsStack: { screen: UserOptionsScreen },
        UserProfile: { screen: UserProfileScreen },
        MyServices: { screen: MyServicesScreen },
        MyServiceDetail: { screen: MyServiceDetailScreen },
        ServiceFeedback: { screen: ServiceFeedbackScreen },
        Categories: { screen: CategoriesScreen },
        SubCategories: {
            screen: SubCategoriesScreen, navigationOptions: {
                header: null,
            },
        },
        FindServiceDetail: { screen: FIndServiceDetailScreen },
        SelectContractor: { screen: SelectContractorScreen },
        ConfirmService: { screen: ConfirmServiceScreen }
    },
    {
        initialRouteName: 'UserOptionsStack',
        headerLayoutPreset: 'center',
    }
)

const UserDrawer = createDrawerNavigator(
    {
        UserOptionsDrawer: { screen: UserStack }
    },
    {
        contentComponent: props => <SideBar {...props} />,
        drawerWidth: 300,
        useNativeAnimations: false
    }
)

const ContractorStack = createStackNavigator(
    {
        ContractorOptionsStack: { screen: ContractorOptionsScreen },
        ContractorProfile: { screen: ContractorProfileScreen },
        ContractorMyServices: { screen: ContractorMyServicesScreen },
        MySubServices: {
            screen: MySubServicesScreen, navigationOptions: {
                header: null,
            },
        },
        ServicesList: { screen: ServicesListScreen },
        ServicesWating: { screen: ServicesWatingScreen },
        MapView: { screen: MapViewScreen },
        ServicesContracted: { screen: ServicesContractedScreen }
    },
    {
        initialRouteName: 'ContractorOptionsStack',
        headerLayoutPreset: 'center',
    }
)

const ContractorDrawer = createDrawerNavigator(
    {
        ContractorOptionsDrawer: { screen: ContractorStack }
    },
    {
        contentComponent: props => <SideBar {...props} />,
        drawerWidth: 300,
    }
)

const RootStack = createStackNavigator(
    {
        Splash: { screen: SplashScreen, navigationOptions: { header: null } },
        Auth: { screen: AuthStack },
        UserOptions: { screen: UserDrawer },
        ContractorOptions: { screen: ContractorDrawer }
    },
    {
        initialRouteName: 'Splash',
        headerMode: 'none'
    }
)

const Router = createAppContainer(RootStack);

class App extends React.Component {

    async componentDidMount() {
        this.checkPermission();
        this.createNotificationListeners();
    }

    componentWillUnmount() {
        this.notificationListener();
        this.notificationOpenedListener();
    }

    async checkPermission() {
        const enabled = await firebase.messaging().hasPermission();
        if (enabled) {
            this.getToken();
        } else {
            this.requestPermission();
        }
    }

    async requestPermission() {
        try {
            await firebase.messaging().requestPermission();
            // User has authorised
            this.getToken();
        } catch (error) {
            // User has rejected permissions
            console.log('permission rejected');
        }
    }

    async getToken() {
        let fcmToken = await AsyncStorage.getItem('@zlap_fcmToken');
        console.log('point 1 ----->', fcmToken)
        if (!fcmToken) {
            fcmToken = await firebase.messaging().getToken();
            console.log('point 2 ----->', fcmToken)
            if (fcmToken) {
                // user has a device token
                await AsyncStorage.setItem('@zlap_fcmToken', fcmToken);
                this.props.updateFcmToken(fcmToken)
            }
        } else {
            this.props.updateFcmToken(fcmToken)
        }
    }

    async createNotificationListeners() {

        const channel = new firebase.notifications.Android.Channel('test-channel', 'Test Channel', firebase.notifications.Android.Importance.Max)
            .setDescription('My apps test channel');
        // Create the channel
        firebase.notifications().android.createChannel(channel);

        /*
        * Triggered when a particular notification has been received in foreground
        * */
        this.notificationListener = firebase.notifications().onNotification((notification) => {
            const { title, body } = notification;
            if (Platform.OS === 'android') {
                notification
                    .android.setChannelId('test-channel')
                    .android.setSmallIcon('ic_launcher')
                    .setTitle(title)
                    .setBody(body)
                    .setSound('default');
                firebase.notifications().displayNotification(notification);
            } else {
                const notify = new firebase.notifications.Notification()
                    .setNotificationId('notificationId')
                    .setTitle(title)
                    .setBody(body)
                    .setSound('default');
                firebase.notifications().displayNotification(notify)
            }

            console.log('Foreground message', notification);

            if (notification.data) {
                // this.goToTargetPage(notification.data);
            }
        });

        /*
        * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
        * */
        this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
            const { title, body } = notificationOpen.notification;

            console.log('background message when notification is clicked', notificationOpen);

            if (notificationOpen.notification.data) {
                // this.goToTargetPage(notificationOpen.notification.data);
            }
        });

        /*
        * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
        * */
        const notificationOpen = await firebase.notifications().getInitialNotification();
        if (notificationOpen) {
            const { title, body } = notificationOpen.notification;

            console.log('app closed message when notification is clicked', notificationOpen);

            if (notificationOpen.notification.data) {
                // this.goToTargetPage(notificationOpen.notification.data); push now
            }
        }
        /*
        * Triggered for data only payload in foreground
        * */
        this.messageListener = firebase.messaging().onMessage((message) => {
            //process data message
            console.log('message in foreground ----->', JSON.stringify(message));
        });
    }

    render() {
        return (
            <Fragment>
                <Router />
            </Fragment>
        );
    }
};


const mapStateToProps = state => {
    return {}
}

const mapDispatchToProps = (dispatch) => {
    return {
        updateFcmToken: (fcmToken) => { dispatch(updateFcmToken(fcmToken)) }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

import COLORS from './Colors';
import DEVICES from './Devices';

const styles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    flexDirection: 'column'
  },
  formView: {
    marginBottom: 10
  },
  formTextInput: {
    borderWidth: 1,
    borderColor: COLORS.appColor,
    borderRadius: 3,
    paddingVertical: 1,
    paddingHorizontal: 5,
    fontSize: 16
  },
  label: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.black
  },
  grayLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.grayText
  },
  authButton: {
    width: DEVICES.screenWidth * 0.5,
    height: 40,
    backgroundColor: COLORS.appColor,
    borderRadius: 20,
    elevation: 3,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white
  },
  defaultButton: {
    width: DEVICES.screenWidth * 0.5,
    height: 40,
    backgroundColor: COLORS.appColor,
    borderRadius: 20,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  defaultButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
    marginEnd: 10
  },
  rowMenuButton: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
    alignItems: 'center',
    justifyContent: 'center'
  },
  rowCategoryButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.appColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  rowDefaultButton: {
    height: 80,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.separator,
    paddingHorizontal: 20,
    justifyContent: 'center'
  },
  image24: {
    width: 24,
    height: 24,
    resizeMode: 'contain'
  },
  image36: {
    width: 36,
    height: 36,
    resizeMode: 'contain'
  }
}

export default styles
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

import SplashScreen         from '../screens/SplashScreen';
import LoginScreen          from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen  from '../screens/ResetPasswordScreen';
import PersonalInfoScreen   from '../screens/PersonalInfoScreen';
import EmailOTPScreen       from '../screens/EmailOTPScreen';
import SelectBankScreen     from '../screens/SelectBankScreen';
import ActivationMethodScreen from '../screens/ActivationMethodScreen';
import LinkCardScreen       from '../screens/LinkCardScreen';
import CardOTPScreen        from '../screens/CardOTPScreen';
import AadhaarScreen        from '../screens/AadhaarScreen';
import AadhaarOTPScreen     from '../screens/AadhaarOTPScreen';
import CreatePINScreen      from '../screens/CreatePINScreen';
import SuccessScreen        from '../screens/SuccessScreen';
import DashboardScreen      from '../screens/DashboardScreen';
import SendMoneyScreen      from '../screens/SendMoneyScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        <Stack.Screen name="Splash"            component={SplashScreen} />
        <Stack.Screen name="Login"             component={LoginScreen} />
        <Stack.Screen name="ForgotPassword"    component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword"     component={ResetPasswordScreen} />
        <Stack.Screen name="PersonalInfo"      component={PersonalInfoScreen} />
        <Stack.Screen name="EmailOTP"          component={EmailOTPScreen} />
        <Stack.Screen name="SelectBank"        component={SelectBankScreen} />
        <Stack.Screen name="ActivationMethod"  component={ActivationMethodScreen} />
        <Stack.Screen name="LinkCard"          component={LinkCardScreen} />
        <Stack.Screen name="CardOTP"           component={CardOTPScreen} />
        <Stack.Screen name="Aadhaar"           component={AadhaarScreen} />
        <Stack.Screen name="AadhaarOTP"        component={AadhaarOTPScreen} />
        <Stack.Screen name="CreatePIN"         component={CreatePINScreen} />
        <Stack.Screen name="Success"           component={SuccessScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Dashboard"         component={DashboardScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="SendMoney"         component={SendMoneyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
